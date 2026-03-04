import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<span className={styles.copy}>© 2024 PLMS</span>

				<div className={styles.links}>
					<Link href="privacy-policy">Privacy & Cookies Policy</Link>
					<Link href="/contact">Contact</Link>
				</div>
			</div>
		</footer>
	);
}
