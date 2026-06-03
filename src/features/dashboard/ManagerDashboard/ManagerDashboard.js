"use client";

import { useEffect, useState } from "react";
import { getManagerDashboardStats } from "@/services/dashboard/dashboardService";
import { getLeadStatuses } from "@/services/settings/leadStatusService";
import DashboardStatCard from "@/features/dashboard/DashboardStatCard/DashboardStatCard";
import styles from "./ManagerDashboard.module.css";

export default function ManagerDashboard() {
	const [stats, setStats] = useState(null);
	const [leadStatuses, setLeadStatuses] = useState([]);
	const [loading, setLoading] = useState(true);

	// Controls the reporting period for dashboard statistics
	const [dateRange, setDateRange] = useState("all");

	useEffect(() => {
		async function loadDashboardData() {
			setLoading(true);

			try {
				const [dashboardStats, statuses] = await Promise.all([
					getManagerDashboardStats(dateRange),
					getLeadStatuses(),
				]);

				setStats(dashboardStats);
				setLeadStatuses(statuses.filter((status) => status.active !== false));
			} catch (error) {
				console.error("Could not load manager dashboard stats:", error);
			} finally {
				setLoading(false);
			}
		}

		loadDashboardData();
	}, [dateRange]);

	if (loading) return <p>Loading dashboard...</p>;
	if (!stats) return <p>Could not load dashboard.</p>;

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<div>
					<h1>Manager Overview</h1>
					<p>Track your lead pipeline and sales performance.</p>
				</div>

				<div className={styles.filters}>
					<label>Lead Activity Period</label>

					<select
						value={dateRange}
						onChange={(e) => setDateRange(e.target.value)}
					>
						<option value="all">All Time</option>
						<option value="3">Last 3 Days</option>
						<option value="7">Last 7 Days</option>
						<option value="30">Last 30 Days</option>
					</select>
				</div>
			</div>

			<div className={styles.statsGrid}>
				<DashboardStatCard
					title="Total Leads"
					value={stats.totalLeads}
					subtitle="Leads active during selected period"
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
					subtitle="Won leads compared to selected leads"
				/>

				{/* Leads that require contact today */}
				<DashboardStatCard
					title="Today's Follow-Ups"
					value={stats.todayFollowUps}
					subtitle="Leads scheduled for follow-up today"
				/>

				{/* Follow-ups that have already passed their due date */}
				<DashboardStatCard
					title="Overdue Follow-Ups"
					value={stats.overdueFollowUps}
					subtitle="Leads requiring immediate attention"
				/>
			</div>

			<div className={styles.dashboardGrid}>
				<div className={styles.pipelineCard}>
					<div className={styles.pipelineHeader}>
						<div>
							<h2>Lead Pipeline</h2>
							<p>Leads grouped by current status.</p>
						</div>
					</div>

					<div className={styles.pipelineList}>
						{leadStatuses.length === 0 ? (
							<p className={styles.emptyState}>
								No lead statuses configured yet.
							</p>
						) : (
							leadStatuses.map((status) => (
								<div key={status.id} className={styles.pipelineItem}>
									<span>{status.name}</span>
									<strong>{stats.leadStatusCounts?.[status.name] || 0}</strong>
								</div>
							))
						)}
					</div>
				</div>

				<div className={styles.activityCard}>
					<div className={styles.activityHeader}>
						<div>
							<h2>Recent Activity</h2>
							<p>Latest updates across your leads.</p>
						</div>
					</div>

					{stats.recentActivities?.length === 0 ? (
						<p className={styles.emptyState}>No recent activity yet.</p>
					) : (
						<div className={styles.activityList}>
							{stats.recentActivities?.map((activity) => (
								<div key={activity.id} className={styles.activityItem}>
									<div className={styles.activityTopRow}>
										<strong>{activity.type}</strong>

										{activity.createdByName && (
											<span>by {activity.createdByName}</span>
										)}
									</div>

									<p>{activity.description}</p>

									{activity.createdAt?.seconds && (
										<div className={styles.activityDate}>
											{new Date(
												activity.createdAt.seconds * 1000,
											).toLocaleString()}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				<div className={styles.agentPerformanceCard}>
					<div className={styles.agentPerformanceHeader}>
						<div>
							<h2>Agent Performance</h2>
							<p>Number of leads assigned to each agent.</p>
						</div>
					</div>

					{stats.agentPerformance?.length === 0 ? (
						<p className={styles.emptyState}>No agent performance data yet.</p>
					) : (
						<div className={styles.agentPerformanceList}>
							{stats.agentPerformance?.map((agent) => (
								<div
									key={agent.agentName}
									className={styles.agentPerformanceItem}
								>
									{/* Shows how many leads are assigned to this agent */}
									<span>{agent.agentName}</span>
									<strong>{agent.count} leads</strong>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
