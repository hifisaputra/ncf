import * as p from "@clack/prompts";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import path from "node:path";
import pc from "picocolors";
import { runPrompts } from "./prompts.js";
import { scaffold } from "./scaffolder.js";
import { FEATURE_LABELS } from "./types.js";
import { detectPackageManager, getInstallCommand, getRunCommand } from "./utils.js";

export async function cli() {
	const args = process.argv.slice(2);
	const cliProjectName = args[0] && !args[0].startsWith("-") ? args[0] : undefined;

	const selections = await runPrompts(cliProjectName);
	const targetDir = path.resolve(process.cwd(), selections.projectName);

	// Check if directory exists and is not empty
	if (await fs.pathExists(targetDir)) {
		const files = await fs.readdir(targetDir);
		if (files.length > 0) {
			p.log.error(`Directory ${pc.cyan(selections.projectName)} is not empty.`);
			process.exit(1);
		}
	}

	const spinner = p.spinner();

	// Scaffold project
	spinner.start("Creating project structure...");
	await scaffold(targetDir, selections);
	spinner.stop("Project structure created.");

	// Install dependencies
	const pm = detectPackageManager();
	spinner.start("Installing dependencies...");
	try {
		execSync(getInstallCommand(pm), {
			cwd: targetDir,
			stdio: "ignore",
		});
		spinner.stop("Dependencies installed.");
	} catch {
		spinner.stop("Failed to install dependencies. You can install them manually.");
	}

	// Git init
	spinner.start("Initializing git repository...");
	try {
		execSync("git init && git add -A && git commit -m 'Initial commit from create-ncf'", {
			cwd: targetDir,
			stdio: "ignore",
		});
		spinner.stop("Git repository initialized.");
	} catch {
		spinner.stop("Failed to initialize git. You can do this manually.");
	}

	// Print next steps
	const runCmd = getRunCommand(pm);

	p.note(
		[
			`cd ${selections.projectName}`,
			"cp .env.example .env.local",
			"# Edit .env.local with your values",
			`${runCmd} dev`,
		].join("\n"),
		"Next steps",
	);

	// Print Cloudflare setup instructions based on features
	const cfSteps: string[] = [];

	if (selections.features.includes("drizzle")) {
		cfSteps.push(
			`wrangler d1 create ${selections.projectName}`,
			"# Update wrangler.jsonc with your database_id",
			`${runCmd} db:generate`,
			`${runCmd} db:migrate`,
		);
	}

	if (selections.features.includes("r2")) {
		cfSteps.push(
			`wrangler r2 bucket create ${selections.projectName}`,
			"# Update wrangler.jsonc with your bucket name",
		);
	}

	if (selections.features.includes("queues")) {
		cfSteps.push(
			`wrangler queues create ${selections.projectName}`,
			`wrangler queues create ${selections.projectName}-dlq`,
		);
	}

	if (cfSteps.length > 0) {
		p.note(cfSteps.join("\n"), "Cloudflare setup");
	}

	if (selections.features.includes("imageLoader")) {
		p.log.warn(
			pc.yellow(
				"Remember to enable Cloudflare Image Transformations on your zone:\nCloudflare Dashboard → Speed → Image Transformations → Enable",
			),
		);
	}

	p.note(`${runCmd} deploy`, "Deploy");

	p.outro(pc.green("Happy building!"));
}
