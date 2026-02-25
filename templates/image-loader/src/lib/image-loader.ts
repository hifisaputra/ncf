export default function cloudflareLoader({
	src,
	width,
	quality,
}: {
	src: string;
	width: number;
	quality?: number;
}) {
	const params = [`width=${width}`];
	if (quality) {
		params.push(`quality=${quality}`);
	}
	params.push("format=auto");

	const cdnDomain = process.env.NEXT_PUBLIC_CDN_DOMAIN;

	try {
		const url = new URL(src);

		// Only apply Cloudflare Image Resizing to the configured CDN domain
		if (cdnDomain) {
			const cdnHostname = new URL(cdnDomain).hostname;
			if (url.hostname === cdnHostname) {
				return `${url.origin}/cdn-cgi/image/${params.join(",")}${url.pathname}`;
			}
		}

		return src;
	} catch {
		// If src is not a valid URL (e.g., relative path), return as is
		return src;
	}
}
