import * as p from "@clack/prompts";
import pc from "picocolors";
import { FEATURE_LABELS, type Feature, type UserSelections } from "./types.js";

export async function runPrompts(
	cliProjectName?: string,
): Promise<UserSelections> {
	p.intro(pc.bgCyan(pc.black(" create-ncf ")));

	const projectName =
		cliProjectName ??
		((await p.text({
			message: "Where should we create your project?",
			placeholder: "./my-app",
			defaultValue: "./my-app",
			validate(value) {
				if (!value.trim()) return "Please enter a project name.";
			},
		})) as string);

	if (p.isCancel(projectName)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	const selectedFeatures = (await p.multiselect({
		message: "Which features would you like to include?",
		options: [
			{
				value: "trpc" as Feature,
				label: FEATURE_LABELS.trpc.label,
				hint: FEATURE_LABELS.trpc.hint,
			},
			{
				value: "drizzle" as Feature,
				label: FEATURE_LABELS.drizzle.label,
				hint: FEATURE_LABELS.drizzle.hint,
			},
			{
				value: "auth" as Feature,
				label: FEATURE_LABELS.auth.label,
				hint: FEATURE_LABELS.auth.hint,
			},
			{
				value: "r2" as Feature,
				label: FEATURE_LABELS.r2.label,
				hint: FEATURE_LABELS.r2.hint,
			},
			{
				value: "queues" as Feature,
				label: FEATURE_LABELS.queues.label,
				hint: FEATURE_LABELS.queues.hint,
			},
			{
				value: "imageLoader" as Feature,
				label: FEATURE_LABELS.imageLoader.label,
				hint: FEATURE_LABELS.imageLoader.hint,
			},
			{
				value: "posthog" as Feature,
				label: FEATURE_LABELS.posthog.label,
				hint: FEATURE_LABELS.posthog.hint,
			},
			{
				value: "shadcn" as Feature,
				label: FEATURE_LABELS.shadcn.label,
				hint: FEATURE_LABELS.shadcn.hint,
			},
		],
		initialValues: [
			"trpc" as Feature,
			"drizzle" as Feature,
			"auth" as Feature,
			"shadcn" as Feature,
		],
		required: false,
	})) as Feature[];

	if (p.isCancel(selectedFeatures)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	// Auto-enable drizzle if auth is selected
	const features = [...selectedFeatures];
	if (features.includes("auth") && !features.includes("drizzle")) {
		features.push("drizzle");
		p.log.info("better-auth requires Drizzle + D1. It has been automatically included.");
	}

	// Show summary
	const featureList =
		features.length > 0
			? features.map((f) => FEATURE_LABELS[f].label).join(", ")
			: "None (base only)";

	p.log.info(`Project: ${pc.cyan(projectName)}`);
	p.log.info(`Features: ${pc.cyan(featureList)}`);

	const confirmed = await p.confirm({
		message: "Continue with these settings?",
	});

	if (p.isCancel(confirmed) || !confirmed) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}

	return {
		projectName: projectName.replace(/^\.\//, ""),
		features,
	};
}
