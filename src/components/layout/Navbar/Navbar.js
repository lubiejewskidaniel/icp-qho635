import Image from "next/image";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
	return (
		<header className={styles.navbar}>
			<div className={styles.container}>
				<Link href="/" className={styles.logo}>
					<Image
						src="/logo.svg"
						alt="PLMS Logo"
						width={120}
						height={40}
						priority
					/>
				</Link>

				<nav className={styles.nav}>
					<Link href="/">Home</Link>
					<Link href="/privacy-policy">Privacy & Cookies Policy</Link>
					<Link href="/contact">Contact</Link>
					<Link href="/login" className={styles.loginBtn}>
						Login
					</Link>
				</nav>
			</div>
		</header>
	);
}
