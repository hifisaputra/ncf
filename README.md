# create-ncf

Scaffold a **Next.js 15 + Cloudflare Workers** 

```bash
bun create ncf my-app
```

## Features

All features are toggleable during scaffolding:

| Feature | Description |
|---|---|
| **tRPC** | Type-safe API layer with React Query |
| **Drizzle ORM + D1** | Database with SQLite on Cloudflare |
| **better-auth** | Authentication with sign-in/sign-up pages |
| **Cloudflare R2** | Object storage helper |
| **Cloudflare Queues** | Background job processing with Worker consumer |
| **Cloudflare Image Loader** | Custom Next.js image loader for CF Image Transformations |
| **PostHog Analytics** | Product analytics |
| **shadcn/ui** | UI component library |

### Base stack (always included)

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Biome (linting & formatting)
- OpenNext.js for Cloudflare Workers deployment
- Type-safe environment variables via `@t3-oss/env-nextjs`

## Usage

```bash
# With bun
bun create ncf my-app

# With npm
npx create-ncf my-app

# Pass project name directly
bun create ncf my-app
```

The CLI will prompt you to select features, then scaffold the project, install dependencies, and initialize a git repository.

## After scaffolding

```bash
cd my-app
cp .env.example .env.local
# Edit .env.local with your values
bun run dev
```

### Cloudflare setup

Depending on which features you selected:

```bash
# D1 Database (if Drizzle selected)
wrangler d1 create my-app
# Update wrangler.jsonc with your database_id
bun run db:generate
bun run db:migrate

# R2 Bucket (if R2 selected)
wrangler r2 bucket create my-app

# Queues (if Queues selected)
wrangler queues create my-app
wrangler queues create my-app-dlq

# Image Loader — enable Image Transformations on your zone:
# Cloudflare Dashboard → Speed → Image Transformations → Enable
```

### Deploy

```bash
bun run deploy
```

## Project structure (scaffolded output)

```
my-app/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/ui/    # shadcn/ui components (if selected)
│   ├── lib/              # Utilities (cn, image-loader)
│   ├── server/
│   │   ├── api/          # tRPC routers (if selected)
│   │   ├── auth/         # better-auth setup (if selected)
│   │   ├── db/           # Drizzle ORM + schema (if selected)
│   │   ├── queues/       # Queue handler (if selected)
│   │   └── services/     # R2 storage helper (if selected)
│   ├── trpc/             # tRPC React client (if selected)
│   ├── styles/globals.css
│   ├── env.js            # Type-safe env validation
│   └── middleware.ts
├── worker.ts             # Cloudflare Worker entry point
├── wrangler.jsonc        # Cloudflare Workers config
├── next.config.ts
├── open-next.config.ts
├── drizzle.config.ts     # (if Drizzle selected)
├── biome.jsonc
├── tsconfig.json
└── package.json
```

## Scripts

| Script | Description |
|---|---|
| `bun run dev` | Start dev server with Turbopack |
| `bun run build` | Build for production |
| `bun run deploy` | Build & deploy to Cloudflare Workers |
| `bun run preview` | Build & preview locally |
| `bun run check` | Lint with Biome |
| `bun run check:write` | Auto-fix lint issues |
| `bun run cf-typegen` | Regenerate Cloudflare env types |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Apply migrations locally |
| `bun run db:migrate-remote` | Apply migrations to remote D1 |

## Development (CLI itself)

```bash
# Install dependencies
bun install

# Build the CLI
bun run build

# Test locally
node dist/index.js my-test-app

# Watch mode
bun run dev
```

## License

MIT
