import { getCloudflareContext } from "@opennextjs/cloudflare";
import { env } from "~/env";

function normalizeKey(key: string): string {
	return key.replace(/^\/+/, "");
}

async function resolveBucket(bucket?: R2Bucket): Promise<R2Bucket> {
	if (bucket) return bucket;
	const { env: cfEnv } = await getCloudflareContext({ async: true });
	return cfEnv.STORAGE;
}

export function buildR2PublicUrl(key: string): string {
	const normalized = normalizeKey(key);
	const base = (env.NEXT_PUBLIC_R2_DOMAIN ?? "").replace(/\/+$/, "");
	return `${base}/${normalized}`;
}

export async function uploadFile(
	key: string,
	data: ArrayBuffer,
	contentType: string,
	bucket?: R2Bucket,
): Promise<{ key: string; url: string }> {
	const storage = await resolveBucket(bucket);
	const normalized = normalizeKey(key);

	await storage.put(normalized, data, {
		httpMetadata: { contentType },
	});

	return {
		key: normalized,
		url: buildR2PublicUrl(normalized),
	};
}

export async function getFile(
	key: string,
	bucket?: R2Bucket,
): Promise<R2ObjectBody | null> {
	const storage = await resolveBucket(bucket);
	return storage.get(normalizeKey(key));
}

export async function deleteFile(
	key: string,
	bucket?: R2Bucket,
): Promise<void> {
	const storage = await resolveBucket(bucket);
	await storage.delete(normalizeKey(key));
}
