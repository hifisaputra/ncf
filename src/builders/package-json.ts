import type { Feature } from "../types.js";
import { hasFeature } from "../utils.js";

interface PackageJson {
	name: string;
	version: string;
	private: boolean;
	type: string;
	scripts: Record<string, string>;
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
}

export function buildPackageJson(
	projectName: string,
	features: Feature[],
): string {
	const pkg: PackageJson = {
		name: projectName,
		version: "0.1.0",
		private: true,
		type: "module",
		scripts: {
			check: "biome check .",
			"check:write": "biome check --write .",
			dev: "next dev --turbopack",
			build: "next build",
			start: "next start",
			deploy: "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
			preview: "opennextjs-cloudflare build && opennextjs-cloudflare preview",
			"cf-typegen":
				"wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts",
		},
		dependencies: {
			"@opennextjs/cloudflare": "^1.3.0",
			"@t3-oss/env-nextjs": "^0.13.8",
			next: "15.4.6",
			react: "19.1.0",
			"react-dom": "19.1.0",
			zod: "^4.1.9",
			clsx: "^2.1.1",
			"tailwind-merge": "^3.5.0",
		},
		devDependencies: {
			"@biomejs/biome": "^2.3.11",
			"@cloudflare/workers-types": "^4.20260116.0",
			"@tailwindcss/postcss": "^4",
			"@types/node": "^24.5.2",
			"@types/react": "^19",
			"@types/react-dom": "^19",
			tailwindcss: "^4",
			typescript: "^5",
			wrangler: "^4.47.0",
		},
	};

	if (hasFeature(features, "trpc")) {
		Object.assign(pkg.dependencies, {
			"@trpc/client": "^11.1.2",
			"@trpc/react-query": "^11.1.2",
			"@trpc/server": "^11.1.2",
			"@tanstack/react-query": "^5.89.0",
			superjson: "^2.2.2",
		});
	}

	if (hasFeature(features, "drizzle")) {
		Object.assign(pkg.dependencies, {
			"drizzle-orm": "^0.44.5",
		});
		Object.assign(pkg.devDependencies, {
			"drizzle-kit": "^0.31.4",
		});
		Object.assign(pkg.scripts, {
			"db:generate": "drizzle-kit generate",
			"db:migrate": `wrangler d1 migrations apply ${projectName}`,
			"db:migrate-remote": `wrangler d1 migrations apply ${projectName} --remote`,
		});
	}

	if (hasFeature(features, "auth")) {
		Object.assign(pkg.dependencies, {
			"better-auth": "^1.4.13",
			"better-auth-cloudflare": "^0.2.9",
		});
	}

	if (hasFeature(features, "posthog")) {
		Object.assign(pkg.dependencies, {
			"posthog-js": "^1.352.0",
			"posthog-node": "^5.24.17",
		});
	}

	if (hasFeature(features, "shadcn")) {
		Object.assign(pkg.dependencies, {
			"class-variance-authority": "^0.7.1",
			"lucide-react": "^0.575.0",
			"radix-ui": "^1.4.3",
			sonner: "^2.0.7",
		});
		Object.assign(pkg.devDependencies, {
			"tw-animate-css": "^1.3.8",
		});
	}

	return JSON.stringify(pkg, null, "\t");
}
