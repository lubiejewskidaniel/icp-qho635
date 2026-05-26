"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { getAssignedLeads } from "@/services/leads/leadService";
import { LEAD_STATUS_OPTIONS } from "@/constants/leadStatuses";
import styles from "./AgentLeadsDashboard.module.css";

export default function AgentLeadsDashboard() {
	const { user } = useAuth();

	const [leads, setLeads] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("All");

	useEffect(() => {
		if (!user?.uid) return;

		async function loadLeads() {
			try {
				const data = await getAssignedLeads(user.uid);
				setLeads(data);
			} finally {
				setLoading(false);
			}
		}

		loadLeads();
	}, [user]);

	const filteredLeads = useMemo(() => {
		return leads.filter((lead) => {
			const searchValue = search.toLowerCase();

			const matchesSearch =
				lead.fullName?.toLowerCase().includes(searchValue) ||
				lead.email?.toLowerCase().includes(searchValue) ||
				lead.phone?.toLowerCase().includes(searchValue);

			const matchesStatus =
				statusFilter === "All" || lead.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [leads, search, statusFilter]);

	if (loading) {
		return <p>Loading leads...</p>;
	}

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<div>
					<h1>My Leads</h1>
					<p>Manage your assigned property leads.</p>
				</div>

				<Link href="/dashboard/leads/new" className={styles.addButton}>
					Add Lead
				</Link>
			</div>

			<div className={styles.filters}>
				<input
					type="text"
					placeholder="Search by name, email or phone"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
				>
					<option value="All">All statuses</option>
					{LEAD_STATUS_OPTIONS.map((status) => (
						<option key={status} value={status}>
							{status}
						</option>
					))}
				</select>
			</div>

			<div className={styles.grid}>
				{filteredLeads.map((lead) => (
					<Link
						key={lead.id}
						href={`/dashboard/leads/${lead.id}`}
						className={styles.card}
					>
						<div className={styles.cardHeader}>
							<h3>{lead.fullName}</h3>
							<span>{lead.status}</span>
						</div>

						<p>{lead.email}</p>
						<p>{lead.phone}</p>
						<p>
							{lead.propertyType} · {lead.location}
						</p>
						<p>Budget: {lead.budgetRange}</p>
					</Link>
				))}

				{filteredLeads.length === 0 && <p>No leads found.</p>}
			</div>
		</section>
	);
}