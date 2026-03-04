import Image from "next/image";
import styles from "./HomePage.module.css";
import Link from "next/link";

export default function HomePage() {
	return (
		<section className={styles.hero}>
			<div className={styles.overlay} />

			<Image
				src="/realEstate.jpg"
				alt="Modern real estate buildings"
				fill
				priority
				className={styles.backgroundImage}
			/>

			<div className={styles.content}>
				<h1>Manage and convert property leads in one place</h1>

				<p>A simple CRM system designed for real estate teams.</p>

				<Link href="/enquiry" className={styles.button}>
					Submit Enquiry
				</Link>
			</div>

			{/* Decorative SVG wave used as a visual section divider */}
			<div className={styles.wave}>
				<svg viewBox="0 0 1440 150" preserveAspectRatio="none">
					<path
						d="M0,64L60,80C120,96,240,128,360,122.7C480,117,600,75,720,74.7C840,75,960,117,1080,122.7C1200,128,1320,96,1380,80L1440,64V150H0Z"
						fill="#ffffff"
					/>
				</svg>
			</div>
		</section>
	);
}
