# Ronda 💰

Ronda is an onchain rotating savings and credit association (ROSCA) built into a Farcaster mini app. It enables communities to create trustless savings groups where members contribute funds regularly, and each cycle one member receives the total pot - all managed through smart contracts on Celo blockchain.

## How is it made?

Ronda architecture is divided into three main components:

**Smart Contracts (Solidity)**: The core ROSCA logic is implemented as Solidity smart contracts deployed on Celo. The `RondaProtocolFactory` contract allows users to deploy new ROSCA groups, while each `RondaProtocol` contract manages an individual ROSCA group's lifecycle - contributions, payouts, participant verification, and fund management. Smart contracts integrate with Aave for yield generation and Self.xyz for identity verification.

**Backend (Next.js API Routes)**: The backend handles off-chain data management using Turso (SQLite) database with Drizzle ORM. It manages user profiles, group metadata, participant invitations, and Farcaster integration. Better Auth with SIWF (Sign-In With Farcaster) plugin provides seamless authentication within the Farcaster ecosystem. The backend also handles Farcaster notifications, OG image generation, and webhook processing.

**Frontend (Next.js + React)**: The user interface is built with Next.js 16, React 19, TypeScript, and Tailwind CSS. The app uses the Farcaster Mini App SDK for native integration within Farcaster clients. Wagmi and Viem handle blockchain interactions, while shadcn/ui and Radix UI provide the component library. The frontend communicates with smart contracts through auto-generated ABIs and provides an intuitive multi-step flow for creating and managing ROSCA groups.

When users open Ronda within a Farcaster client, they authenticate using Sign-In With Farcaster (SIWF), which provides seamless access without additional wallet connections. Users can create ROSCA groups by defining contribution amounts, frequency (weekly, biweekly, monthly, quarterly), number of cycles, and participant requirements. The app supports optional identity verification via Self.xyz for proof of personhood, age, nationality, and gender verification. Once a group is created, the smart contract is deployed on-chain, and participants can be invited to join. Each cycle, members contribute USDC, and one member receives the total pot based on a predetermined rotation schedule.

## Features

- **Onchain ROSCA Groups**: Deploy and manage ROSCA groups as smart contracts on Celo
- **Farcaster Integration**: Native mini app experience within Farcaster clients with SIWF authentication
- **Identity Verification**: Optional Self.xyz integration for proof of personhood, age, nationality, and gender verification
- **Flexible Contribution Schedules**: Support for weekly, biweekly, monthly, and quarterly contribution frequencies
- **Participant Management**: Invite participants, track acceptance status, and manage group membership
- **Contribution Tracking**: Monitor contributions, payouts, and group status in real-time
- **Profile Management**: View user statistics, group history, and activity
- **Farcaster Notifications**: Receive notifications for group updates, contribution reminders, and payout events
- **Cross-Chain Support**: LiFi integration for cross-chain swaps (USDC on Base and Celo)
- **OG Image Generation**: Dynamic Open Graph images for sharing groups and profiles
- **Responsive Design**: Optimized for mobile and desktop experiences

## Sponsor Bounties

- **Self.xyz**: Ronda integrates Self.xyz for optional identity verification, allowing group creators to require proof of personhood, age verification, nationality verification, and gender verification. This enables trustless ROSCA groups with verified participants, reducing the risk of fraud and ensuring compliance with group requirements without violating the privacy.

- **Celo**: Ronda smart contracts are deployed on Celo blockchain, leveraging its low transaction costs and fast finality for efficient ROSCA operations. The protocol uses USDC on Celo for contributions and payouts, and integrates with Aave for yield generation on deposited funds.

## Architecture

```
ronda/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   ├── auth/             # Better Auth endpoints
│   │   │   ├── groups/           # Group management APIs
│   │   │   ├── users/            # User management APIs
│   │   │   ├── notify/           # Notification endpoints
│   │   │   ├── og/               # OG image generation
│   │   │   └── webhook/          # Webhook handlers
│   │   ├── circles/              # Group detail pages
│   │   ├── page.tsx              # Home page
│   │   └── layout.tsx             # Root layout
│   ├── components/
│   │   ├── pages/                # Page components
│   │   │   ├── home/             # Home page components
│   │   │   ├── circles/          # Group page components
│   │   │   ├── profile/          # Profile page components
│   │   │   └── app/              # Main app container
│   │   ├── shared/               # Shared components
│   │   └── ui/                   # shadcn/ui components
│   ├── contexts/                 # React contexts
│   │   ├── auth-context.tsx      # Authentication state
│   │   ├── farcaster-context.tsx # Farcaster SDK state
│   │   └── app-context.tsx       # App-wide state
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-create-group.ts   # Group creation
│   │   ├── use-deploy-ronda-protocol.ts # Contract deployment
│   │   └── ...                   # Other hooks
│   ├── lib/
│   │   ├── database/             # Database schema & queries
│   │   │   ├── db.schema.ts      # Drizzle schema
│   │   │   └── queries/          # Database queries
│   │   ├── smart-contracts/      # Smart contract integration
│   │   │   ├── abis/             # Contract ABIs
│   │   │   ├── hooks/            # Contract hooks
│   │   │   └── config.ts         # Contract config
│   │   ├── auth.ts               # Better Auth setup
│   │   ├── auth-client.ts        # Client-side auth
│   │   ├── wagmi.ts              # Wagmi config
│   │   ├── neynar.ts             # Neynar SDK
│   │   ├── lifi/                 # LiFi integration
│   │   └── env.ts                # Environment validation
│   └── utils/                    # Utility functions
├── public/                       # Static assets
├── drizzle.config.ts             # Drizzle ORM config
├── next.config.mjs                # Next.js config
└── package.json                  # Dependencies
```

## Installation Steps

### Prerequisites

- Node.js (v20.18.0 or higher)
- pnpm (v10.0.0 or higher)
- Turso account and database
- Farcaster developer account
- Neynar API key
- Self.xyz account (for identity verification)
- Celo wallet with testnet/mainnet access

### Setup

1. **Clone the repository**:

```bash
git clone <repository-url>
cd ronda
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Set up environment variables**:

Create a `.env` file in the root directory with the following variables:

```env
# Server-side variables
BETTER_AUTH_SECRET=your-secret-key-here
NEYNAR_API_KEY=your-neynar-api-key
NOTIFICATION_SECRET=your-notification-secret
TURSO_DATABASE_URL=your-turso-database-url
TURSO_DATABASE_TOKEN=your-turso-database-token
PRIVATE_KEY=your-private-key-for-transactions

# Client-side variables
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_URL=http://localhost:3000
NEXT_PUBLIC_FARCASTER_HEADER=your-farcaster-header
NEXT_PUBLIC_FARCASTER_PAYLOAD=your-farcaster-payload
NEXT_PUBLIC_FARCASTER_SIGNATURE=your-farcaster-signature
NEXT_PUBLIC_BASE_BUILDER_ADDRESS=your-base-builder-address
NEXT_PUBLIC_APPLICATION_NAME=Ronda
NEXT_PUBLIC_APPLICATION_DESCRIPTION=Onchain ROSCA groups
NEXT_PUBLIC_RONDA_FACTORY_ADDRESS=your-ronda-factory-contract-address
```

4. **Set up the database**:

```bash
# Generate migrations
pnpm db:generate

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate
```

5. **Start the development server**:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Configuration

1. **Turso Database**:
   - Create an account at [turso.tech](https://turso.tech)
   - Create a new database
   - Copy the database URL and auth token to your `.env` file

2. **Farcaster Mini App**:
   - Register your app in the Farcaster developer portal
   - Configure the mini app manifest with your app details
   - Set up the header, payload, and signature for Farcaster verification
   - Configure the callback URL for authentication

3. **Neynar API**:
   - Get an API key from [neynar.com](https://neynar.com)
   - Add the key to your `.env` file

4. **Smart Contracts**:
   - Deploy the `RondaProtocolFactory` contract to Celo
   - Update `NEXT_PUBLIC_RONDA_FACTORY_ADDRESS` with the deployed address
   - Ensure the contract is verified on Celo explorer

5. **Self.xyz Integration** (optional):
   - Set up a Self.xyz application
   - Configure the verification scope seed
   - Update verification settings in the group creation flow

## Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production (includes linting and type checking)
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter
- `pnpm format` - Format code with Biome
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:pull` - Pull schema from database

## Technology Stack

- **Frontend Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4, shadcn/ui, Radix UI, Motion (Framer Motion)
- **Database**: Turso (SQLite), Drizzle ORM
- **Authentication**: Better Auth, Sign-In With Farcaster (SIWF)
- **Blockchain**: Celo, Wagmi, Viem
- **Smart Contracts**: Solidity, Aave integration
- **Identity Verification**: Self.xyz
- **Farcaster Integration**: Farcaster Mini App SDK, Neynar SDK
- **Cross-Chain**: LiFi SDK
- **Notifications**: Farcaster notifications API
- **Code Quality**: Biome, TypeScript, Husky, lint-staged
- **Package Manager**: pnpm

## Smart Contract Architecture

The Ronda protocol consists of two main contracts:

1. **RondaProtocolFactory**: Factory contract that deploys new ROSCA groups
   - Manages group creation with configurable parameters
   - Handles verification requirements
   - Tracks deployed groups

2. **RondaProtocol**: Individual ROSCA group contract
   - Manages participant contributions
   - Handles rotating payouts
   - Integrates with Aave for yield generation
   - Enforces verification requirements via Self.xyz
   - Tracks group lifecycle (deposit due, active, completed)

## Database Schema

- **user**: User accounts with Farcaster integration
- **session**: Authentication sessions
- **account**: Linked accounts (Farcaster)
- **farcaster**: Farcaster-specific user data
- **groups**: ROSCA group metadata
- **participants**: Group membership and contribution tracking

## API Routes

- `/api/auth/*` - Better Auth endpoints
- `/api/groups` - Group CRUD operations
- `/api/groups/[groupId]/participants` - Participant management
- `/api/users/[address]/groups` - User's groups
- `/api/users/search` - User search
- `/api/notify` - Notification sending
- `/api/webhook/farcaster` - Farcaster webhook handler
- `/api/og/profile/[userId]` - Dynamic OG image generation

## Development

### Code Style

The project uses Biome for formatting and linting. Code is automatically formatted on commit via Husky and lint-staged.

### Type Safety

TypeScript is strictly enforced. Run `pnpm typecheck` to verify types before committing.

### Database Migrations

When modifying the database schema:

1. Update `src/lib/database/db.schema.ts`
2. Run `pnpm db:generate` to create migration files
3. Review the generated migrations
4. Run `pnpm db:migrate` to apply migrations

## Deployment

1. **Build the application**:

```bash
pnpm build
```

2. **Set production environment variables** in your hosting platform

3. **Deploy to your hosting provider** (Vercel, Railway, etc.)

4. **Update Farcaster mini app configuration** with production URL

5. **Verify smart contracts** on Celo explorer

## Useful Links

- [Farcaster Documentation](https://docs.farcaster.xyz/)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Self.xyz Documentation](https://docs.self.xyz/)
- [Celo Documentation](https://docs.celo.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Wagmi Documentation](https://wagmi.sh/)

## Contact

[blackicon.eth](https://farcaster.xyz/blackicon.eth)
[limone.eth](https://farcaster.xyz/limone.eth)
[frankk.eth](https://farcaster.xyz/frankk)
[itsmide.eth](https://farcaster.xyz/itsmide.eth)

## Built At

ETHGlobal Buenos Aires (2025)

## License

MIT
