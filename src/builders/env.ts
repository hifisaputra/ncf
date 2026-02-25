import type { Feature } from "../types.js";
import { hasFeature } from "../utils.js";

export function buildEnvJs(features: Feature[]): string {
	const serverVars: string[] = [
		"\t\tNODE_ENV: z",
		'\t\t\t.enum(["development", "test", "production"])',
		'\t\t\t.default("development"),',
		"\t\tSITE_URL: z.string().url(),",
	];

	const clientVars: string[] = [];

	const runtimeEnvServer: string[] = [
		"\t\tNODE_ENV: process.env.NODE_ENV,",
		"\t\tSITE_URL: process.env.SITE_URL,",
	];

	const runtimeEnvClient: string[] = [];

	if (hasFeature(features, "auth")) {
		serverVars.push(
			"\t\tBETTER_AUTH_SECRET: z.string().min(1),",
			"\t\tBETTER_AUTH_URL: z.string().url(),",
		);
		runtimeEnvServer.push(
			"\t\tBETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,",
			"\t\tBETTER_AUTH_URL: process.env.BETTER_AUTH_URL,",
		);
	}

	if (hasFeature(features, "r2")) {
		clientVars.push("\t\tNEXT_PUBLIC_R2_DOMAIN: z.string().url().optional(),");
		runtimeEnvClient.push(
			"\t\tNEXT_PUBLIC_R2_DOMAIN: process.env.NEXT_PUBLIC_R2_DOMAIN,",
		);
	}

	if (hasFeature(features, "imageLoader")) {
		clientVars.push(
			"\t\tNEXT_PUBLIC_CDN_DOMAIN: z.string().url().optional(),",
		);
		runtimeEnvClient.push(
			"\t\tNEXT_PUBLIC_CDN_DOMAIN: process.env.NEXT_PUBLIC_CDN_DOMAIN,",
		);
	}

	if (hasFeature(features, "posthog")) {
		clientVars.push(
			"\t\tNEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),",
			"\t\tNEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),",
		);
		runtimeEnvClient.push(
			"\t\tNEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,",
			"\t\tNEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,",
		);
	}

	const serverSection = serverVars.join("\n");
	const clientSection =
		clientVars.length > 0 ? clientVars.join("\n") : "\t\t// Add NEXT_PUBLIC_ client vars here";
	const runtimeSection = [
		...runtimeEnvServer,
		...runtimeEnvClient,
	].join("\n");

	return `import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
\tserver: {
${serverSection}
\t},
\tclient: {
${clientSection}
\t},
\truntimeEnv: {
${runtimeSection}
\t},
\tskipValidation: !!process.env.SKIP_ENV_VALIDATION,
\temptyStringAsUndefined: true,
});
`;
}

export function buildEnvExample(features: Feature[]): string {
	const lines: string[] = [
		"NODE_ENV=development",
		"SITE_URL=http://localhost:3000",
		"",
	];

	if (hasFeature(features, "auth")) {
		lines.push(
			"# Authentication (better-auth)",
			"BETTER_AUTH_SECRET=replace-with-a-secure-random-string",
			"BETTER_AUTH_URL=http://localhost:3000",
			"",
		);
	}

	if (hasFeature(features, "r2")) {
		lines.push(
			"# Cloudflare R2 Storage",
			"NEXT_PUBLIC_R2_DOMAIN=https://your-r2-domain.com",
			"",
		);
	}

	if (hasFeature(features, "imageLoader")) {
		lines.push(
			"# Cloudflare Image Loader",
			"NEXT_PUBLIC_CDN_DOMAIN=https://your-cdn-domain.com",
			"",
		);
	}

	if (hasFeature(features, "posthog")) {
		lines.push(
			"# PostHog Analytics",
			"NEXT_PUBLIC_POSTHOG_KEY=your-posthog-project-api-key",
			"NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com",
			"",
		);
	}

	return lines.join("\n");
}
