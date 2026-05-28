"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { getAgentDashboardStats } from "@/services/dashboard/dashboardService";
import DashboardStatCard from "@/features/dashboard/DashboardStatCard/DashboardStatCard";
import styles from "./AgentDashboard.module.css";

export default function AgentDashboard() {
	const { user } = useAuth();

	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!user?.uid) return;

		async function loadStats() {
			try {
				const data = await getAgentDashboardStats(user.uid);
				setStats(data);
			} catch (error) {
				console.error("Could not load agent dashboard stats:", error);
			} finally {
				setLoading(false);
			}
		}

		loadStats();
	}, [user]);

	if (loading) return <p>Loading dashboard...</p>;
	if (!stats) return <p>Could not load dashboard.</p>;

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<h1>Agent Overview</h1>
				<p>Track your assigned leads and follow-ups.</p>
			</div>

			<div className={styles.statsGrid}>
				<DashboardStatCard
					title="My Leads"
					value={stats.totalLeads}
					subtitle="Leads assigned to you"
				/>

				<DashboardStatCard
					title="My New Leads"
					value={stats.newLeads}
					subtitle="New leads to contact"
				/>

				<DashboardStatCard
					title="My Won Leads"
					value={stats.wonLeads}
					subtitle="Leads you converted"
				/>

				<DashboardStatCard
					title="Follow-ups Today"
					value={stats.followUpsToday}
					subtitle="Leads to follow up today"
				/>
			</div>
		</section>
	);
}
