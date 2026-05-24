"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import {
	sendVerificationEmail,
	reloadCurrentUser,
	logout,
} from "@/services/auth/authService";
import styles from "./VerifyEmail.module.css";

export default function VerifyEmail() {
	const router = useRouter();
	const { user } = useAuth();

	const [message, setMessage] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleResend = async () => {
		setLoading(true);
		setMessage("");
		setError("");

		try {
			await sendVerificationEmail(user);
			setMessage(
				"Verification email has been sent again. Please Check your SPAM.",
			);
		} catch {
			setError("Could not send verification email. Try again later");
		} finally {
			setLoading(false);
		}
	};

	const handleCheck = async () => {
		setLoading(true);
		setMessage("");
		setError("");

		try {
			const refreshedUser = await reloadCurrentUser(user);

			if (refreshedUser.emailVerified) {
				router.push("/dashboard");
				return;
			}

			setError("Email is not verified yet.");
		} catch {
			setError("Could not check verification status.");
		} finally {
			setLoading(false);
		}
	};

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<h1>Verify your email</h1>

				<p>
					We sent a verification link to your email address. Please verify your
					email before accessing the dashboard. Check your SPAM in case email is
					missing.
				</p>

				{user?.email && <p>{user.email}</p>}

				{message && <p className={styles.message}>{message}</p>}
				{error && <p className={styles.error}>{error}</p>}

				<button onClick={handleCheck} disabled={loading}>
					{loading ? "Checking..." : "I verified my email"}
				</button>

				<button onClick={handleResend} disabled={loading}>
					Resend verification email
				</button>

				<button onClick={handleLogout}>Back to login</button>
			</div>
		</div>
	);
}
