"use client";

import { useEffect, useState } from "react";
import styles from "./LoginForm.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, sendVerificationEmail } from "@/services/auth/authService";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const router = useRouter();
	const { user } = useAuth();

	useEffect(() => {
		if (!user) return;

		if (user.emailVerified) {
			router.push("/dashboard");
		} else {
			router.push("/login/verify-email");
		}
	}, [user, router]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			const loggedInUser = await login(email, password);

			if (!loggedInUser.emailVerified) {
				await sendVerificationEmail(loggedInUser);
				router.push("/login/verify-email");
				return;
			}

			router.push("/dashboard");
		} catch (err) {
			setError("Invalid email or password.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<h1>Sign in</h1>

				<form onSubmit={handleSubmit}>
					<div className={styles.field}>
						<label htmlFor="email">Email</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					<div className={styles.field}>
						<label htmlFor="password">Password</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					{error && <p className={styles.error}>{error}</p>}

					<button
						type="submit"
						className={styles.submitButton}
						disabled={loading}
					>
						{loading ? "Signing in..." : "Sign in"}
					</button>
				</form>

				<div className={styles.links}>
					<Link href="/login/reset">Forgot password?</Link>
				</div>
			</div>
		</div>
	);
}
