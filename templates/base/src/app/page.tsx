export default function HomePage() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<div className="space-y-4 text-center">
				<h1 className="text-4xl font-bold tracking-tight">
					Next.js + Cloudflare
				</h1>
				<p className="text-muted-foreground">
					Scaffolded with{" "}
					<code className="rounded bg-muted px-1.5 py-0.5 text-sm">
						create-ncf
					</code>
				</p>
				<p className="text-muted-foreground text-sm">
					Edit{" "}
					<code className="rounded bg-muted px-1.5 py-0.5 text-sm">
						src/app/page.tsx
					</code>{" "}
					to get started.
				</p>
			</div>
		</main>
	);
}
