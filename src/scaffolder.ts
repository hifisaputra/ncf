import fs from "fs-extra";
import path from "node:path";
import { buildEnvExample, buildEnvJs } from "./builders/env.js";
import { buildNextConfig } from "./builders/next-config.js";
import { buildPackageJson } from "./builders/package-json.js";
import { buildWrangler } from "./builders/wrangler.js";
import { buildWorkerTs } from "./builders/worker.js";
import type { UserSelections } from "./types.js";
import { copyDirectory, getTemplatesDir, hasFeature } from "./utils.js";

export async function scaffold(
	targetDir: string,
	selections: UserSelections,
): Promise<void> {
	const { projectName, features } = selections;
	const templatesDir = getTemplatesDir();

	// Ensure target directory exists
	await fs.ensureDir(targetDir);

	// 1. Copy base template
	await copyDirectory(path.join(templatesDir, "base"), targetDir);

	// 2. Overlay selected feature templates
	const featureDirs: string[] = [];

	if (hasFeature(features, "trpc")) {
		// Choose the right variant based on other features
		featureDirs.push("trpc");
	}

	if (hasFeature(features, "drizzle")) {
		featureDirs.push("drizzle");
	}

	if (hasFeature(features, "auth")) {
		featureDirs.push("auth");
	}

	if (hasFeature(features, "r2")) {
		featureDirs.push("r2");
	}

	if (hasFeature(features, "queues")) {
		featureDirs.push("queues");
	}

	if (hasFeature(features, "imageLoader")) {
		featureDirs.push("image-loader");
	}

	if (hasFeature(features, "posthog")) {
		featureDirs.push("posthog");
	}

	if (hasFeature(features, "shadcn")) {
		featureDirs.push("shadcn");
	}

	for (const dir of featureDirs) {
		const featurePath = path.join(templatesDir, dir);
		if (await fs.pathExists(featurePath)) {
			await copyDirectory(featurePath, targetDir);
		}
	}

	// 3. Handle tRPC variant files (with-auth vs without-auth)
	if (hasFeature(features, "trpc")) {
		const trpcDir = path.join(targetDir, "src", "server", "api");

		if (hasFeature(features, "auth") && hasFeature(features, "drizzle")) {
			// Use the with-auth variant
			const withAuthPath = path.join(trpcDir, "trpc.with-auth.ts");
			const trpcPath = path.join(trpcDir, "trpc.ts");
			if (await fs.pathExists(withAuthPath)) {
				await fs.remove(trpcPath);
				await fs.rename(withAuthPath, trpcPath);
			}
		} else {
			// Remove the with-auth variant
			const withAuthPath = path.join(trpcDir, "trpc.with-auth.ts");
			if (await fs.pathExists(withAuthPath)) {
				await fs.remove(withAuthPath);
			}
		}
	}

	// 4. Handle drizzle schema index based on auth
	if (hasFeature(features, "drizzle")) {
		const schemaIndexPath = path.join(
			targetDir,
			"src",
			"server",
			"db",
			"schema",
			"index.ts",
		);

		if (hasFeature(features, "auth")) {
			await fs.writeFile(
				schemaIndexPath,
				'export * from "./example";\nexport * from "./auth";\n',
			);
		}
		// Otherwise the default from drizzle template is fine (just example)
	}

	// 5. Generate dynamic files
	await fs.writeFile(
		path.join(targetDir, "package.json"),
		buildPackageJson(projectName, features),
	);

	await fs.writeFile(
		path.join(targetDir, "wrangler.jsonc"),
		buildWrangler(projectName, features),
	);

	await fs.writeFile(
		path.join(targetDir, "next.config.ts"),
		buildNextConfig(features),
	);

	await fs.writeFile(
		path.join(targetDir, "worker.ts"),
		buildWorkerTs(features),
	);

	await fs.writeFile(
		path.join(targetDir, "src", "env.js"),
		buildEnvJs(features),
	);

	await fs.writeFile(
		path.join(targetDir, ".env.example"),
		buildEnvExample(features),
	);
}
