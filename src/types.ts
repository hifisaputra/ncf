export const FEATURES = [
	"trpc",
	"drizzle",
	"auth",
	"r2",
	"queues",
	"imageLoader",
	"posthog",
	"shadcn",
] as const;

export type Feature = (typeof FEATURES)[number];

export interface UserSelections {
	projectName: string;
	features: Feature[];
}

export const FEATURE_LABELS: Record<Feature, { label: string; hint: string }> =
	{
		trpc: {
			label: "tRPC",
			hint: "Type-safe API with React Query",
		},
		drizzle: {
			label: "Drizzle ORM + D1",
			hint: "Database with SQLite on Cloudflare",
		},
		auth: {
			label: "better-auth",
			hint: "Authentication with sign-in/sign-up pages",
		},
		r2: {
			label: "Cloudflare R2",
			hint: "Object storage helper",
		},
		queues: {
			label: "Cloudflare Queues",
			hint: "Background job processing with Worker consumer",
		},
		imageLoader: {
			label: "Cloudflare Image Loader",
			hint: "Custom Next.js image loader for CF Image Transformations",
		},
		posthog: {
			label: "PostHog Analytics",
			hint: "Product analytics",
		},
		shadcn: {
			label: "shadcn/ui",
			hint: "UI component library",
		},
	};
