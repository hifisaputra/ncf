import type { Feature } from "../types.js";
import { hasFeature } from "../utils.js";

export function buildNextConfig(features: Feature[]): string {
	const imports = [
		'import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";',
		'import type { NextConfig } from "next";',
	];

	const configParts: string[] = [];

	// Image loader
	if (hasFeature(features, "imageLoader")) {
		configParts.push(`\timages: {
\t\tloader: "custom",
\t\tloaderFile: "./src/lib/image-loader.ts",
\t},`);
	}

	// PostHog rewrites
	if (hasFeature(features, "posthog")) {
		configParts.push(`\tasync rewrites() {
\t\treturn [
\t\t\t{
\t\t\t\tsource: "/ingest/static/:path*",
\t\t\t\tdestination: "https://us-assets.i.posthog.com/static/:path*",
\t\t\t},
\t\t\t{
\t\t\t\tsource: "/ingest/:path*",
\t\t\t\tdestination: "https://us.i.posthog.com/:path*",
\t\t\t},
\t\t];
\t},
\tskipTrailingSlashRedirect: true,`);
	}

	const configBody =
		configParts.length > 0 ? `\n${configParts.join("\n")}\n` : "";

	return `${imports.join("\n")}

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {${configBody}};

export default nextConfig;
`;
}
