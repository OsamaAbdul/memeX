#![no_std]

/// An empty contract. To be used as a template when starting a new contract from scratch.
#[multiversx_sc::contract]
pub trait Escrow {
    #[init]
    fn init(&self) {}
}
