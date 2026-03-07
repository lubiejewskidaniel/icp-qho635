import styles from "./ContactContent.module.css";

export default function ContactContent() {
	return (
		<div className={styles.page}>
			<section className={`container ${styles.container}`}>
				<header className={styles.header}>
					<h1>Contact Us</h1>
					<p className={styles.intro}>
						If you have any questions about our services, your personal data, or
						would like to request data removal, please contact us using the
						information below.
					</p>
				</header>

				<div className={styles.section}>
					<h2>General Enquiries</h2>
					<p>Email: support@PLMS.com</p>
				</div>

				<div className={styles.section}>
					<h2>Business Address</h2>
					<p>
						PLMS – Property Lead Management System <br />
						123 Real Estate Street <br />
						London, United Kingdom
					</p>
				</div>

				<div className={styles.section}>
					<h2>Data Protection Requests</h2>
					<p>
						To request access, correction, or deletion of your personal data,
						please email us at:
					</p>
					<a href="mailto:support@plms.com" className={styles.contact}>
						support@plms.com
					</a>
				</div>
			</section>
		</div>
	);
}
