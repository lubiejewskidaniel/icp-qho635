"use client";

import styles from "./ManagerDashboard.module.css";

export default function ManagerDashboard() {
	return (
		<section className={styles.dashboard}>
			<header className={styles.header}>
				<h1>Manager Dashboard</h1>
				<p>Overview of team performance and lead pipeline.</p>
			</header>

			<div className={styles.grid}>
				<div className={styles.card}>
					<h3>Total Leads</h3>
					<p>Monitor all leads across the agency.</p>
				</div>

				<div className={styles.card}>
					<h3>Agents Performance</h3>
					<p>Review activity and conversion rates.</p>
				</div>

				<div className={styles.card}>
					<h3>Pipeline Status</h3>
					<p>Track deals through each stage.</p>
				</div>

				<div className={styles.card}>
					<h3>Reports</h3>
					<p>Access analytics and business insights.</p>
				</div>
			</div>
		</section>
	);
}
