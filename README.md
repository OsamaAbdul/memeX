# 🚀 MemeX: AI-Powered Memecoin Launchpad

**MemeX** is a high-fidelity, production-ready memecoin launchpad built on the **MultiversX** blockchain. It leverages the power of **Google Gemini AI** to orchestrate the entire creation process—from naming and branding to security audits and blockchain deployment—with just a single prompt.

![MemeX Logo](https://image.pollinations.ai/prompt/cyberpunk%20ninja%20cat%20logo,%20neon%20pink%20and%20cyan,%20premium%20vector)

## 🌟 Key Features

### 🧠 4-Agent AI Orchestration
Powered by **Gemini 2.5 Flash**, our AI agents handle the complexity:
- **Token Architect**: Generates viral names, symbols, and optimized tokenomics.
- **Brand Genius**: Crafts taglines and orchestrates generative visual identities.
- **Risk Guard**: Conducts automated security audits and safety scoring.
- **Tx Composer**: Explains technical blockchain transactions in viral, human language.

### 🎨 Generative Art Pipeline
- **Generative Mascots**: Dynamic image generation via **Pollinations.ai**.
- **Permanent Storage**: Automatic capture and upload of AI art to **Supabase Storage** to ensure asset permanence.

### 💎 MultiversX Native
- **One-Input Launch**: Transform a tweet-sized idea into a full ESDT token.
- **Trading Terminal**: High-fidelity charts (Recharts) and buy/sell functionality.
- **Discovery Feed**: Real-time trending memes powered by a persistent Supabase backend.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion, Recharts.
- **Blockchain**: MultiversX SDK (`sdk-core`, `sdk-dapp`).
- **AI**: Google Gemini API, Pollinations.ai.
- **Backend**: Supabase (PostgreSQL, Storage, RLS).

---

## 🚀 Getting Started (Step-by-Step)

### Prerequisites
- **Node.js**: 18.0.0+
- **pnpm**: `npm install -g pnpm`
- **MultiversX Wallet**: (DeFi Wallet, xPortal, or Hub)
- **Gemini API Key**: [Get one here](https://aistudio.google.com/)
- **Supabase Account**: [Create a project](https://supabase.com/)

### Step 1: Environment Configuration
Create a `.env` file in the root directory (use `.env.example` as a template):

```bash
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GEMINI_MODEL=gemini-2.0-flash

# Supabase
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 2: Database Schema Setup
Go to your **Supabase SQL Editor** and run the following script to create the `tokens` table and storage policies:

```sql
-- 1. Create tokens table
create table public.tokens (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  name text not null,
  symbol text not null,
  description text,
  logo_url text,
  banner_url text,
  risk_score int8 default 0,
  total_supply text,
  category text,
  tone text,
  tagline text,
  creator_address text not null,
  transaction_hash text
);

-- 2. Create storage bucket
insert into storage.buckets (id, name, public) values ('token-images', 'token-images', true);

-- 3. Set RLS Policies (Allow Read/Insert)
alter table public.tokens enable row level security;
create policy "Public Read" on public.tokens for select using (true);
create policy "Public Insert" on public.tokens for insert with check (true);
create policy "Storage Read" on storage.objects for select using (bucket_id = 'token-images');
create policy "Storage Insert" on storage.objects for insert with check (bucket_id = 'token-images');
```

### Step 3: Install Dependencies
```bash
pnpm install
```

### Step 4: Run Locally
```bash
# Start in Devnet mode (Recommended)
pnpm start-devnet
```

Visit [http://localhost:3000](http://localhost:3000) to start your moon mission! 🚀

---

## 🏗️ Project Structure
- `src/pages/CreateToken`: The AI launch terminal logic.
- `src/lib/services/ai`: Gemini agent implementations.
- `src/lib/services/supabase`: DB and Storage orchestration.
- `src/pages/Dashboard/Overview`: The live discovery feed.
- `src/pages/TokenDetails`: Trading terminal and charts.

## 📄 License
MIT License - Developed during the Advanced Agentic Coding project.
