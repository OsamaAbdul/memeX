#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone)]
pub struct TokenMarketState<M: ManagedTypeApi> {
    pub creator: ManagedAddress<M>,
    pub token_identifier: TokenIdentifier<M>,
    pub total_supply: BigUint<M>,
    pub virtual_egld_reserve: BigUint<M>,
    pub virtual_token_reserve: BigUint<M>,
    pub real_egld_reserve: BigUint<M>,
    pub real_token_reserve: BigUint<M>,
}

#[multiversx_sc::contract]
pub trait Launchpad {
    #[init]
    fn init(&self) {}

    #[payable("*")]
    #[endpoint]
    fn launch_token(&self, virtual_egld_amount: BigUint) {
        let payment = self.call_value().single_esdt();
        let token_identifier = payment.token_identifier;
        let amount = payment.amount;
        let _timestamp = self.blockchain().get_block_timestamp();
        let caller = self.blockchain().get_caller();

        require!(
            self.market_state(&token_identifier).is_empty(),
            "Token already launched"
        );
        require!(amount > BigUint::zero(), "Must override supply");
        require!(virtual_egld_amount > BigUint::zero(), "Virtual EGLD must be > 0");

        // Initialize Market State
        // Curve: (vEGLD + rEGLD) * (vTokens + rTokens) = K
        // Initial: (vEGLD + 0) * (0 + Supply) = K
        // We treat the "amount" sent as the "Initial Supply" AND "Initial Real Token Reserve"
        // Wait, for CPAMM:
        // Reserve0 * Reserve1 = K
        // We want the price to start at something.
        // If we have just tokens, price is 0.
        // We add "Virtual EGLD" to one side to give it a price.
        // We also need "Virtual Tokens" if we want to cap the price or something, but usually just Virtual ETH is enough for valid price.
        // However, standard is (VirtualEGLD) * (RealTokens) = K? No.
        // Let's stick to Pump.fun style:
        // They utilize a bonding curve.
        // Let's go simple:
        // Virtual EGLD Reserve = X
        // Real Token Reserve = Supply
        // K = X * Supply.
        // Price = X / Supply.
        
        // Let's set initial internal state
        let state = TokenMarketState {
            creator: caller,
            token_identifier: token_identifier.clone(),
            total_supply: amount.clone(),
            virtual_egld_reserve: virtual_egld_amount, 
            virtual_token_reserve: BigUint::zero(), // Not using virtual tokens for now, just simplified
            real_egld_reserve: BigUint::zero(),
            real_token_reserve: amount,
        };

        self.market_state(&token_identifier).set(state);
        self.launched_tokens().push(&token_identifier);
    }

    #[payable("EGLD")]
    #[endpoint]
    fn buy(&self, token_identifier: TokenIdentifier) {
        let payment_amount = self.call_value().egld_value().clone_value();
        require!(payment_amount > BigUint::zero(), "Must pay EGLD");
        require!(!self.market_state(&token_identifier).is_empty(), "Token not found");

        let mut state = self.market_state(&token_identifier).get();
        
        // Calculate Amount Out
        // (vEGLD_old + rEGLD_old) * (rTokens_old) = K
        // (vEGLD_old + rEGLD_old + dEGLD) * (rTokens_new) = K
        // rTokens_out = rTokens_old - rTokens_new
        
        let egld_reserve_old = &state.virtual_egld_reserve + &state.real_egld_reserve;
        let token_reserve_old = &state.real_token_reserve;
        let k = &egld_reserve_old * token_reserve_old;
        
        let egld_reserve_new = &egld_reserve_old + &payment_amount;
        let token_reserve_new = &k / &egld_reserve_new;
        
        let tokens_out = token_reserve_old - &token_reserve_new;
        require!(tokens_out > BigUint::zero(), "Insufficient amount out");
        require!(tokens_out < *token_reserve_old, "Curve exhausted");

        // Update State
        state.real_egld_reserve += &payment_amount;
        state.real_token_reserve = token_reserve_new;
        self.market_state(&token_identifier).set(&state);

        // Send Tokens to user
        self.send().direct_esdt(&self.blockchain().get_caller(), &token_identifier, 0, &tokens_out);
    }

    #[payable("*")]
    #[endpoint]
    fn sell(&self) {
        let payment = self.call_value().single_esdt();
        let token_identifier = payment.token_identifier;
        let amount = payment.amount;
        require!(amount > BigUint::zero(), "Must send tokens");
        require!(!self.market_state(&token_identifier).is_empty(), "Token not found");
        
        let mut state = self.market_state(&token_identifier).get();

        // Calculate EGLD Out
        // (egld_old) * (tokens_old) = K
        // (egld_new) * (tokens_old + amount_in) = K
        // egld_out = egld_old - egld_new
        
        let egld_reserve_old = &state.virtual_egld_reserve + &state.real_egld_reserve;
        let token_reserve_old = &state.real_token_reserve;
        let k = &egld_reserve_old * token_reserve_old;
        
        let token_reserve_new = token_reserve_old + &amount;
        let egld_reserve_new = &k / &token_reserve_new;
        
        let egld_out = &egld_reserve_old - &egld_reserve_new;
        
        require!(egld_out > BigUint::zero(), "Insufficient EGLD liquidity");
        require!(egld_out <= state.real_egld_reserve, "Contract bankrupt");

        // Update State
        state.real_token_reserve = token_reserve_new;
        state.real_egld_reserve -= &egld_out;
        self.market_state(&token_identifier).set(&state);
        
        // Send EGLD to user
        self.send().direct_egld(&self.blockchain().get_caller(), &egld_out);
    }
    
    #[view(getAmountOut)]
    fn get_amount_out(&self, token_identifier: TokenIdentifier, amount_in: BigUint, is_buy: bool) -> BigUint {
         if self.market_state(&token_identifier).is_empty() {
             return BigUint::zero();
         }
         
         let state = self.market_state(&token_identifier).get();
         let egld_reserve = &state.virtual_egld_reserve + &state.real_egld_reserve;
         let token_reserve = &state.real_token_reserve;
         let k = &egld_reserve * token_reserve;
         
         if is_buy {
             // Buy: Input EGLD, Output Tokens
             let new_egld_reserve = &egld_reserve + &amount_in;
             let new_token_reserve = &k / &new_egld_reserve;
             token_reserve - &new_token_reserve
         } else {
             // Sell: Input Tokens, Output EGLD
             let new_token_reserve = token_reserve + &amount_in;
             let new_egld_reserve = &k / &new_token_reserve;
             &egld_reserve - &new_egld_reserve
         }
    }

    #[storage_mapper("marketState")]
    fn market_state(&self, token_identifier: &TokenIdentifier) -> SingleValueMapper<TokenMarketState<Self::Api>>;

    #[storage_mapper("launchedTokens")]
    fn launched_tokens(&self) -> VecMapper<TokenIdentifier>;
}
