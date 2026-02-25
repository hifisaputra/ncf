import type { Feature } from "../types.js";
import { hasFeature } from "../utils.js";

export function buildWrangler(
	projectName: string,
	features: Feature[],
): string {
	const lines: string[] = [
		"{",
		'\t"$schema": "node_modules/wrangler/config-schema.json",',
		`\t"name": "${projectName}",`,
		'\t"main": "worker.ts",',
		'\t"compatibility_date": "2025-03-01",',
		'\t"compatibility_flags": ["nodejs_compat"],',
		'\t"assets": {',
		'\t\t"binding": "ASSETS",',
		'\t\t"directory": ".open-next/assets"',
		"\t},",
		'\t"observability": {',
		'\t\t"enabled": true',
		"\t}",
	];

	if (hasFeature(features, "drizzle")) {
		lines.push(
			",",
			'\t"d1_databases": [',
			"\t\t{",
			'\t\t\t"binding": "DB",',
			`\t\t\t"database_name": "${projectName}",`,
			'\t\t\t"database_id": "YOUR_DATABASE_ID",',
			'\t\t\t"migrations_dir": "migrations"',
			"\t\t}",
			"\t]",
		);
	}

	if (hasFeature(features, "auth")) {
		lines.push(
			",",
			'\t"kv_namespaces": [',
			"\t\t{",
			'\t\t\t"binding": "KV",',
			'\t\t\t"id": "YOUR_KV_NAMESPACE_ID"',
			"\t\t}",
			"\t]",
		);
	}

	if (hasFeature(features, "r2")) {
		lines.push(
			",",
			'\t"r2_buckets": [',
			"\t\t{",
			'\t\t\t"binding": "STORAGE",',
			`\t\t\t"bucket_name": "${projectName}"`,
			"\t\t}",
			"\t]",
		);
	}

	if (hasFeature(features, "queues")) {
		lines.push(
			",",
			'\t"queues": {',
			'\t\t"consumers": [',
			"\t\t\t{",
			`\t\t\t\t"queue": "${projectName}",`,
			'\t\t\t\t"max_retries": 3,',
			`\t\t\t\t"dead_letter_queue": "${projectName}-dlq"`,
			"\t\t\t},",
			"\t\t\t{",
			`\t\t\t\t"queue": "${projectName}-dlq"`,
			"\t\t\t}",
			"\t\t],",
			'\t\t"producers": [',
			"\t\t\t{",
			'\t\t\t\t"binding": "QUEUE",',
			`\t\t\t\t"queue": "${projectName}"`,
			"\t\t\t}",
			"\t\t]",
			"\t}",
		);
	}

	// Vars section
	const vars: Record<string, string> = {
		SITE_URL: "http://localhost:3000",
	};

	if (hasFeature(features, "auth")) {
		vars.BETTER_AUTH_URL = "http://localhost:3000";
	}

	if (hasFeature(features, "r2")) {
		vars.NEXT_PUBLIC_R2_DOMAIN = "https://your-r2-domain.com";
	}

	if (hasFeature(features, "imageLoader")) {
		vars.NEXT_PUBLIC_CDN_DOMAIN = "https://your-cdn-domain.com";
	}

	if (hasFeature(features, "posthog")) {
		vars.NEXT_PUBLIC_POSTHOG_KEY = "your-posthog-key";
		vars.NEXT_PUBLIC_POSTHOG_HOST = "https://us.i.posthog.com";
	}

	if (Object.keys(vars).length > 0) {
		const varEntries = Object.entries(vars)
			.map(([k, v]) => `\t\t"${k}": "${v}"`)
			.join(",\n");
		lines.push(",", '\t"vars": {', varEntries, "\t}");
	}

	lines.push("}");

	return lines.join("\n");
}
