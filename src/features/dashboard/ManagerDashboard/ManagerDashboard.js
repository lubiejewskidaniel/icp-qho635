"use client";

import { useEffect, useState } from "react";
import { LEAD_STATUS_OPTIONS } from "@/constants/leadStatuses";
import { getManagerDashboardStats } from "@/services/dashboard/dashboardService";
import DashboardStatCard from "@/features/dashboard/DashboardStatCard/DashboardStatCard";
import styles from "./ManagerDashboard.module.css";

export default function ManagerDashboard() {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadStats() {
			try {
				const data = await getManagerDashboardStats();
				setStats(data);
			} catch (error) {
				console.error("Could not load manager dashboard stats:", error);
			} finally {
				setLoading(false);
			}
		}

		loadStats();
	}, []);

	if (loading) return <p>Loading dashboard...</p>;
	if (!stats) return <p>Could not load dashboard.</p>;

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<h1>Manager Overview</h1>
				<p>Track your lead pipeline and sales performance.</p>
			</div>

			<div className={styles.statsGrid}>
				<DashboardStatCard
					title="Total Leads"
					value={stats.totalLeads}
					subtitle="All leads in the system"
				/>

				<DashboardStatCard
					title="New Leads"
					value={stats.newLeads}
					subtitle="Leads waiting for first contact"
				/>

				<DashboardStatCard
					title="Won Leads"
					value={stats.wonLeads}
					subtitle="Successfully converted leads"
				/>

				<DashboardStatCard
					title="Conversion Rate"
					value={`${stats.conversionRate}%`}
					subtitle="Won leads compared to all leads"
				/>
			</div>

			<div className={styles.pipelineCard}>
				<div className={styles.pipelineHeader}>
					<div>
						<h2>Lead Pipeline</h2>
						<p>Leads grouped by current status.</p>
					</div>
				</div>

				<div className={styles.pipelineList}>
					{LEAD_STATUS_OPTIONS.map((status) => (
						<div key={status} className={styles.pipelineItem}>
							<span>{status}</span>
							<strong>{stats.leadStatusCounts?.[status] || 0}</strong>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
