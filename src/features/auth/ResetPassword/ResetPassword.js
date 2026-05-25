"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/services/auth/authService";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		setLoading(true);
		setMessage("");
		setError("");

		try {
			await resetPassword(email);
			setMessage("Password reset email has been sent. Please check your inbox.");
			setEmail("");
		} catch (err) {
			setError("Could not send password reset email.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<h1>Reset password</h1>

				<p>
					Enter your email address and we will send you a link to reset your
					password.
				</p>

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

					{message && <p className={styles.message}>{message}</p>}
					{error && <p className={styles.error}>{error}</p>}

					<button
						type="submit"
						className={styles.submitButton}
						disabled={loading}
					>
						{loading ? "Sending..." : "Send reset link"}
					</button>
				</form>

				<div className={styles.links}>
					<Link href="/login">Back to login</Link>
				</div>
			</div>
		</div>
	);
}
