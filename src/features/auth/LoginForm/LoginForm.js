"use client";

import { useState } from "react";
import styles from "./LoginForm.module.css";
import Link from "next/link";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			console.log("Login attempt:", email, password);

			// login simulation for now
			await new Promise((res) => setTimeout(res, 1000));

			// and here will be redirect later on
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
						<label>Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>

					<div className={styles.field}>
						<label>Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
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
