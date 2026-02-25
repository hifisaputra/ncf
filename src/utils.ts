import fs from "fs-extra";
import path from "node:path";
import type { Feature } from "./types.js";

export function detectPackageManager(): "bun" | "npm" | "pnpm" | "yarn" {
	const userAgent = process.env.npm_config_user_agent ?? "";
	if (userAgent.startsWith("bun")) return "bun";
	if (userAgent.startsWith("pnpm")) return "pnpm";
	if (userAgent.startsWith("yarn")) return "yarn";
	return "npm";
}

export function getRunCommand(pm: string): string {
	return pm === "npm" ? "npm run" : `${pm} run`;
}

export function getInstallCommand(pm: string): string {
	if (pm === "yarn") return "yarn";
	return `${pm} install`;
}

export async function copyDirectory(
	src: string,
	dest: string,
	filter?: (filePath: string) => boolean,
): Promise<void> {
	await fs.copy(src, dest, {
		overwrite: true,
		filter: (srcPath) => {
			// Always skip _dependencies.json files
			if (path.basename(srcPath) === "_dependencies.json") return false;
			if (filter) return filter(srcPath);
			return true;
		},
	});
}

export function hasFeature(features: Feature[], feature: Feature): boolean {
	return features.includes(feature);
}

export function getTemplatesDir(): string {
	// In the built CLI, templates are at ../templates relative to dist/index.js
	return path.resolve(new URL(".", import.meta.url).pathname, "..", "templates");
}
