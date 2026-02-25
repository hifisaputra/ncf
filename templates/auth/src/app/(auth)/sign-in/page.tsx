"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import authClient from "~/server/auth/auth-client";

export default function SignInPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		setErrorMessage(null);

		const result = await authClient.signIn.email({
			email,
			password,
			callbackURL: "/",
		});

		if (result.error) {
			setErrorMessage(result.error.message ?? "Unable to sign in.");
			setIsSubmitting(false);
			return;
		}

		router.push("/");
		router.refresh();
	};

	return (
		<div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-10">
			<div className="w-full space-y-6 rounded-lg border border-border bg-card p-6">
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
					<p className="text-sm text-muted-foreground">
						Welcome back. Sign in to continue.
					</p>
				</div>

				<form className="space-y-4" onSubmit={handleSubmit}>
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="email">
							Email
						</label>
						<input
							autoComplete="email"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							id="email"
							onChange={(event) => setEmail(event.target.value)}
							required
							type="email"
							value={email}
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="password">
							Password
						</label>
						<input
							autoComplete="current-password"
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							id="password"
							onChange={(event) => setPassword(event.target.value)}
							required
							type="password"
							value={password}
						/>
					</div>

					{errorMessage ? (
						<p className="text-sm text-destructive">{errorMessage}</p>
					) : null}

					<button
						className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
						disabled={isSubmitting}
						type="submit"
					>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<p className="text-sm text-muted-foreground">
					No account yet?{" "}
					<Link className="font-medium text-foreground" href="/sign-up">
						Create one
					</Link>
				</p>
			</div>
		</div>
	);
}
