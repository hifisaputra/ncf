import type { KVNamespace } from "@cloudflare/workers-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { withCloudflare } from "better-auth-cloudflare";
import { getDB } from "~/server/db";

async function authBuilder() {
	const dbInstance = await getDB();
	return betterAuth(
		withCloudflare(
			{
				autoDetectIpAddress: true,
				geolocationTracking: true,
				cf: getCloudflareContext().cf,
				d1: {
					db: dbInstance as ReturnType<typeof drizzleAdapter> extends infer T ? T extends { __brand: infer B } ? never : any : any,
					options: {
						usePlural: true,
					},
				},
				kv: process.env.KV as unknown as KVNamespace<string>,
			},
			{
				emailAndPassword: {
					enabled: true,
				},
				session: {
					cookieCache: {
						enabled: true,
						maxAge: 5 * 60,
					},
				},
				rateLimit: {
					enabled: true,
					window: 60,
					max: 100,
				},
				plugins: [openAPI()],
			},
		),
	);
}

let authInstance: Awaited<ReturnType<typeof authBuilder>> | null = null;

export async function initAuth() {
	if (!authInstance) {
		authInstance = await authBuilder();
	}
	return authInstance;
}

// Schema generation config (for better-auth CLI)
export const auth = betterAuth({
	...withCloudflare(
		{
			autoDetectIpAddress: true,
			geolocationTracking: true,
			cf: {},
		},
		{
			session: {
				cookieCache: {
					enabled: true,
					maxAge: 5 * 60,
				},
			},
			plugins: [openAPI()],
		},
	),
	database: drizzleAdapter(process.env.DATABASE as any, {
		provider: "sqlite",
		usePlural: true,
	}),
});
