"use client";

import { useEffect, useMemo, useState } from "react";

import { getAllLeads } from "@/services/leads/leadService";
import { getAgents } from "@/services/users/userService";
import { getLeadSources } from "@/services/settings/leadSourceService";

import styles from "./ReportsDashboard.module.css";

function getDateFromLead(value) {
	if (!value) return null;

	if (value.seconds) {
		return new Date(value.seconds * 1000);
	}

	return new Date(value);
}

function getTodayString() {
	return new Date().toISOString().split("T")[0];
}

export default function ReportsDashboard() {
	const [leads, setLeads] = useState([]);
	const [agents, setAgents] = useState([]);
	const [sources, setSources] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadReports() {
			try {
				const [leadData, agentData, sourceData] = await Promise.all([
					getAllLeads(),
					getAgents(),
					getLeadSources(),
				]);

				setLeads(leadData);
				setAgents(agentData);
				setSources(sourceData.filter((source) => source.active !== false));
			} catch (error) {
				console.error("Could not load reports:", error);
			} finally {
				setLoading(false);
			}
		}

		loadReports();
	}, []);

	const leadsBySource = useMemo(() => {
		const configuredSources = sources.map((source) => ({
			label: source.name,
			count: leads.filter((lead) => lead.source === source.name).length,
		}));

		const unknownCount = leads.filter(
			(lead) =>
				!lead.source || !sources.some((source) => source.name === lead.source),
		).length;

		if (unknownCount > 0) {
			configuredSources.push({
				label: "Other / Legacy",
				count: unknownCount,
			});
		}

		return configuredSources.sort((a, b) => b.count - a.count);
	}, [leads, sources]);

	const agentWorkload = useMemo(() => {
		const agentRows = agents.map((agent) => ({
			label: agent.name || "Unnamed agent",
			count: leads.filter((lead) => lead.assignedAgentId === agent.id).length,
		}));

		const unassignedCount = leads.filter(
			(lead) => !lead.assignedAgentId,
		).length;

		if (unassignedCount > 0) {
			agentRows.push({
				label: "Unassigned",
				count: unassignedCount,
			});
		}

		return agentRows.sort((a, b) => b.count - a.count);
	}, [agents, leads]);

	const followUpHealth = useMemo(() => {
		const today = getTodayString();

		const dueToday = leads.filter(
			(lead) => lead.nextFollowUpDate === today,
		).length;

		const overdue = leads.filter(
			(lead) => lead.nextFollowUpDate && lead.nextFollowUpDate < today,
		).length;

		const future = leads.filter(
			(lead) => lead.nextFollowUpDate && lead.nextFollowUpDate > today,
		).length;

		const noFollowUp = leads.filter((lead) => !lead.nextFollowUpDate).length;

		return [
			{ label: "Due Today", count: dueToday },
			{ label: "Overdue", count: overdue },
			{ label: "Future Follow-Up", count: future },
			{ label: "No Follow-Up", count: noFollowUp },
		];
	}, [leads]);

	const leadAge = useMemo(() => {
		const now = new Date();

		const buckets = [
			{ label: "0-7 days", count: 0 },
			{ label: "8-30 days", count: 0 },
			{ label: "31-90 days", count: 0 },
			{ label: "90+ days", count: 0 },
		];

		leads.forEach((lead) => {
			const createdAt = getDateFromLead(lead.createdAt);

			if (!createdAt || Number.isNaN(createdAt.getTime())) return;

			const ageInDays = Math.floor(
				(now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (ageInDays <= 7) {
				buckets[0].count++;
			} else if (ageInDays <= 30) {
				buckets[1].count++;
			} else if (ageInDays <= 90) {
				buckets[2].count++;
			} else {
				buckets[3].count++;
			}
		});

		return buckets;
	}, [leads]);

	if (loading) {
		return <p>Loading reports...</p>;
	}

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<h1>Reports</h1>
				<p>
					Review lead sources, agent workload, follow-up health and lead age.
				</p>
			</div>

			<div className={styles.grid}>
				<ReportCard
					title="Leads by Source"
					description="Shows which channels are generating the most leads."
					data={leadsBySource}
				/>

				<ReportCard
					title="Agent Workload"
					description="Shows how leads are distributed across agents."
					data={agentWorkload}
				/>

				<ReportCard
					title="Follow-Up Health"
					description="Shows whether leads are being followed up on time."
					data={followUpHealth}
				/>

				<ReportCard
					title="Lead Age"
					description="Shows how long leads have been in the system."
					data={leadAge}
				/>
			</div>
		</section>
	);
}

function ReportCard({ title, description, data }) {
	const maxCount = Math.max(...data.map((item) => item.count), 1);

	return (
		<div className={styles.card}>
			<div className={styles.cardHeader}>
				<h2>{title}</h2>
				<p>{description}</p>
			</div>

			<div className={styles.chart}>
				{data.length === 0 ? (
					<p className={styles.empty}>No data available.</p>
				) : (
					data.map((item) => {
						const width = `${Math.max((item.count / maxCount) * 100, 4)}%`;

						return (
							<div key={item.label} className={styles.chartRow}>
								<div className={styles.chartLabel}>
									<span>{item.label}</span>
									<strong>{item.count}</strong>
								</div>

								<div className={styles.barTrack}>
									<div className={styles.bar} style={{ width }} />
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
