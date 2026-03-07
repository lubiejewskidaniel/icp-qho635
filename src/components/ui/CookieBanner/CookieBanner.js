"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const accepted = localStorage.getItem("cookiesAccepted");

		if (!accepted) {
			setVisible(true);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem("cookiesAccepted", "true");
		setVisible(false);
	};

	if (!visible) return null;

	return (
		<div
			className={styles.banner}
			role="dialog"
			aria-live="polite"
			aria-label="Cookie consent banner"
		>
			<p>
				This website uses necessary cookies for authentication and security
				purposes. Read our{" "}
				<Link href="/privacy-policy" className={styles.link}>
					Privacy Policy
				</Link>
				.
			</p>

			<button className={styles.button} onClick={handleAccept}>
				OK
			</button>
		</div>
	);
}
