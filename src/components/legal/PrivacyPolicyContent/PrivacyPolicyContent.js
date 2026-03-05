import styles from "./PrivacyPolicyContent.module.css";

export default function PrivacyPolicyContent() {
	return (
		<div className={styles.page}>
			<section className={`container ${styles.container}`}>
				<header className={styles.header}>
					<h1>Privacy Policy</h1>
					<p className={styles.effectiveDate}>Effective Date: 01.04.2026</p>
					<p className={styles.intro}>
						PLMS – Property Lead Management System is committed to handling
						personal data in a transparent and responsible manner in accordance
						with the General Data Protection Regulation (GDPR).
					</p>
				</header>

				<div className={styles.section}>
					<h2>1. Our Role</h2>
					<p>
						PLMS (Property Lead Management System) is a dedicated internal
						system operated exclusively by this Agency to manage property
						enquiries and client communication.
					</p>
					<p>
						This Agency acts as the Data Controller and is responsible for how
						personal data is collected, used, and stored.
					</p>
					<p>PLMS is not a public marketplace or third-party platform.</p>
				</div>

				<div className={styles.section}>
					<h2>2. What Data We Collect</h2>

					<h3>Account Data (Agents and Managers)</h3>
					<ul>
						<li>Name</li>
						<li>Email address</li>
						<li>Login credentials</li>
						<li>Basic account activity</li>
					</ul>

					<h3>Lead and Client Data</h3>
					<ul>
						<li>Full name</li>
						<li>Email address</li>
						<li>Phone number</li>
						<li>Country and city</li>
						<li>Property Type (House / Apartment / Land)</li>
						<li>Budget range (up to 200K / 200K–400K / 400K–1M / over 1M)</li>
						<li>Purpose of enquiry (Buy / Invest)</li>
						<li>Preferred contact method (Phone / E-mail)</li>
						<li>
							Lead status information (New / Contacted / Qualified / Viewing
							Scheduled / Negotiation / Won / Lost)
						</li>
					</ul>
				</div>

				<div className={styles.section}>
					<h2>3. Purpose of Processing</h2>
					<ul>
						<li>Responding to property enquiries</li>
						<li>Managing and organizing sales leads</li>
						<li>Tracking communication with clients</li>
						<li>Supporting internal workflows</li>
						<li>Ensuring authentication and platform security</li>
					</ul>
				</div>

				<div className={styles.section}>
					<h2>4. Legal Basis</h2>
					<p>
						Personal data is processed based on your consent when submitting the
						enquiry form and on our legitimate interest in responding to
						property-related requests.
					</p>
				</div>

				<div className={styles.section}>
					<h2>5. Data Storage and Retention</h2>
					<p>
						Personal data is securely stored using trusted cloud infrastructure
						providers and appropriate technical safeguards.
					</p>
					<p>
						We retain personal data only as long as necessary to respond to
						enquiries, manage records, and comply with legal obligations.
					</p>
				</div>

				<div className={styles.section}>
					<h2>6. Data Sharing</h2>
					<p>
						We do not sell or trade personal data. Data may be processed by
						trusted service providers solely for secure hosting, system
						functionality, and technical support.
					</p>
					<p>
						Personal data may also be disclosed if required by applicable law.
					</p>
				</div>

				<div className={styles.section}>
					<h2>7. Security</h2>
					<ul>
						<li>Access control mechanisms</li>
						<li>Secure authentication</li>
						<li>Role-based permissions</li>
						<li>Protection against unauthorized access</li>
					</ul>
				</div>

				<div className={styles.section}>
					<h2>8. Your Rights</h2>
					<p>
						Under GDPR, you have the right to access, correct, restrict, or
						request deletion of your personal data.
					</p>
					<p>
						If you would like your data to be removed from our system, please
						contact us at:
					</p>
					<p className={styles.contact}>support@PLMS.com</p>
					<p>
						We will respond to your request within 30 days in accordance with
						GDPR requirements, unless we are legally required to retain certain
						information.
					</p>
				</div>

				<div className={styles.section}>
					<h2>9. Cookies</h2>
					<p>
						PLMS uses only strictly necessary cookies required for website
						functionality, authentication, and security.
					</p>
					<p>
						We do not use tracking, advertising, analytics, or marketing
						cookies.
					</p>
					<p>
						You can control cookies through your browser settings. Disabling
						necessary cookies may affect certain website functions.
					</p>
				</div>

				<div className={styles.section}>
					<h2>Contact</h2>
					<p>
						If you have any questions regarding this Privacy Policy or your
						personal data, please contact:
					</p>
					<p className={styles.contact}>
						PLMS Support <br />
						support@PLMS.com
					</p>
				</div>
			</section>
		</div>
	);
}
