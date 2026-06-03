"use client";

import Link from "next/link";
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

function formatLeadSubtitle(lead) {
	const status = lead.status || "No status";
	const location = lead.location || lead.city || "No location";

	return `${status} • ${location}`;
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
		const normalizeSource = (value) => {
			return String(value || "")
				.trim()
				.toLowerCase();
		};

		const configuredSources = sources.map((source) => {
			const sourceName = normalizeSource(source.name);

			const matchingLeads = leads.filter(
				(lead) => normalizeSource(lead.source) === sourceName,
			);

			return {
				label: source.name,
				count: matchingLeads.length,
				leads: matchingLeads,
			};
		});

		const knownSourceNames = sources.map((source) =>
			normalizeSource(source.name),
		);

		const unknownLeads = leads.filter((lead) => {
			const leadSource = normalizeSource(lead.source);

			return !leadSource || !knownSourceNames.includes(leadSource);
		});

		if (unknownLeads.length > 0) {
			configuredSources.push({
				label: "Other / Legacy",
				count: unknownLeads.length,
				leads: unknownLeads,
			});
		}

		return configuredSources.sort((a, b) => b.count - a.count);
	}, [leads, sources]);

	const agentWorkload = useMemo(() => {
		const agentRows = agents.map((agent) => {
			const matchingLeads = leads.filter(
				(lead) => lead.assignedAgentId === agent.id,
			);

			return {
				label: agent.name || "Unnamed agent",
				count: matchingLeads.length,
				leads: matchingLeads,
			};
		});

		const unassignedLeads = leads.filter((lead) => !lead.assignedAgentId);

		if (unassignedLeads.length > 0) {
			agentRows.push({
				label: "Unassigned",
				count: unassignedLeads.length,
				leads: unassignedLeads,
			});
		}

		return agentRows.sort((a, b) => b.count - a.count);
	}, [agents, leads]);

	const followUpHealth = useMemo(() => {
		const today = getTodayString();

		const dueTodayLeads = leads.filter(
			(lead) => lead.nextFollowUpDate === today,
		);

		const overdueLeads = leads.filter(
			(lead) => lead.nextFollowUpDate && lead.nextFollowUpDate < today,
		);

		const futureLeads = leads.filter(
			(lead) => lead.nextFollowUpDate && lead.nextFollowUpDate > today,
		);

		const noFollowUpLeads = leads.filter((lead) => !lead.nextFollowUpDate);

		return [
			{
				label: "Due Today",
				count: dueTodayLeads.length,
				leads: dueTodayLeads,
			},
			{
				label: "Overdue",
				count: overdueLeads.length,
				leads: overdueLeads,
			},
			{
				label: "Future Follow-Up",
				count: futureLeads.length,
				leads: futureLeads,
			},
			{
				label: "No Follow-Up",
				count: noFollowUpLeads.length,
				leads: noFollowUpLeads,
			},
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
					expandable
				/>

				<ReportCard
					title="Agent Workload"
					description="Shows how leads are distributed across agents."
					data={agentWorkload}
					expandable
				/>

				<ReportCard
					title="Follow-Up Health"
					description="Shows whether leads are being followed up on time."
					data={followUpHealth}
					expandable
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

function ReportCard({ title, description, data, expandable = false }) {
	const [expandedLabel, setExpandedLabel] = useState(null);
	const maxCount = Math.max(...data.map((item) => item.count), 1);

	function toggleExpanded(label) {
		if (!expandable) return;

		setExpandedLabel((currentLabel) => (currentLabel === label ? null : label));
	}

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
						const isExpanded = expandedLabel === item.label;

						return (
							<div key={item.label} className={styles.chartRow}>
								<button
									type="button"
									className={styles.chartButton}
									onClick={() => toggleExpanded(item.label)}
									disabled={!expandable || item.count === 0}
								>
									<div className={styles.chartLabel}>
										<span>
											{expandable && item.count > 0
												? `${isExpanded ? "▾" : "▸"} ${item.label}`
												: item.label}
										</span>
										<strong>{item.count}</strong>
									</div>

									<div className={styles.barTrack}>
										<div className={styles.bar} style={{ width }} />
									</div>
								</button>

								{expandable && isExpanded && item.leads?.length > 0 && (
									<div className={styles.leadList}>
										{item.leads.map((lead) => (
											<Link
												key={lead.id}
												href={`/dashboard/leads/${lead.id}`}
												className={styles.leadItem}
											>
												<strong>{lead.fullName || "Unnamed lead"}</strong>
												<span>{formatLeadSubtitle(lead)}</span>
											</Link>
										))}
									</div>
								)}
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
