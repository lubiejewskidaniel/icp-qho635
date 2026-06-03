"use client";

import { useEffect, useState } from "react";

import {
	getLeadStatuses,
	createLeadStatus,
	deleteLeadStatusSetting,
} from "@/services/settings/leadStatusService";

import styles from "./LeadStatusesManager.module.css";

export default function LeadStatusesManager() {
	const [statuses, setStatuses] = useState([]);
	const [name, setName] = useState("");
	const [order, setOrder] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	async function loadStatuses() {
		const data = await getLeadStatuses();
		setStatuses(data);
		setLoading(false);
	}

	useEffect(() => {
		loadStatuses();
	}, []);

	async function handleSubmit(e) {
		e.preventDefault();

		if (!name.trim()) return;

		setSaving(true);

		try {
			await createLeadStatus({
				name: name.trim(),
				order,
			});

			setName("");
			setOrder("");
			await loadStatuses();
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(statusId) {
		const confirmed = window.confirm(
			"Are you sure you want to delete this lead status? Existing leads with this status will keep their current value.",
		);

		if (!confirmed) return;

		await deleteLeadStatusSetting(statusId);
		await loadStatuses();
	}

	if (loading) return <p>Loading lead statuses...</p>;

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<h1>Manage Lead Statuses</h1>
				<p>Add or remove lead statuses used in the CRM pipeline.</p>
			</div>

			<div className={styles.card}>
				<h2>Add New Status</h2>

				<form onSubmit={handleSubmit}>
					<div className={styles.form}>
						<div className={styles.field}>
							<label>Status name</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. New, Contacted, Won"
							/>
						</div>

						<div className={styles.field}>
							<label>Display order</label>
							<input
								type="number"
								value={order}
								onChange={(e) => setOrder(e.target.value)}
								placeholder="e.g. 1"
							/>
						</div>

						<button
							type="submit"
							disabled={saving}
							className={styles.primaryButton}
						>
							Add Status
						</button>
					</div>
				</form>
			</div>

			<div className={styles.card}>
				<h2>Configured Statuses</h2>

				<div className={styles.list}>
					{statuses.length === 0 ? (
						<p className={styles.empty}>No statuses configured yet.</p>
					) : (
						statuses.map((status) => (
							<div key={status.id} className={styles.item}>
								<div className={styles.itemInfo}>
									<span className={styles.itemName}>{status.name}</span>
									<span className={styles.itemMeta}>
										Display order: {status.order}
									</span>
								</div>

								<div className={styles.actions}>
									<button
										type="button"
										className={styles.deleteButton}
										onClick={() => handleDelete(status.id)}
									>
										Delete
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</section>
	);
}
