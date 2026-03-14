"use client";

import styles from "./AgentDashboard.module.css";

export default function AgentDashboard() {
	return (
		<section className={styles.dashboard}>
			<header className={styles.header}>
				<h1>Agent Dashboard</h1>
				<p>Overview of your leads and activities.</p>
			</header>

			<div className={styles.grid}>
				<div className={styles.card}>
					<h3>My Leads</h3>
					<p>View and manage your assigned property leads.</p>
				</div>

				<div className={styles.card}>
					<h3>Upcoming Viewings</h3>
					<p>Check scheduled property viewings.</p>
				</div>

				<div className={styles.card}>
					<h3>Activity</h3>
					<p>Track recent interactions with clients.</p>
				</div>
			</div>
		</section>
	);
}
