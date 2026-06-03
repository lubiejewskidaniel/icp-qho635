"use client";

import { useEffect, useState } from "react";

import {
	getLeadSources,
	createLeadSource,
	updateLeadSource,
	deleteLeadSource,
} from "@/services/settings/leadSourceService";

import styles from "./LeadSourcesManager.module.css";

export default function LeadSourcesManager() {
	const [sources, setSources] = useState([]);
	const [name, setName] = useState("");
	const [editingId, setEditingId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	async function loadSources() {
		const data = await getLeadSources();
		setSources(data);
		setLoading(false);
	}

	useEffect(() => {
		loadSources();
	}, []);

	async function handleSubmit(e) {
		e.preventDefault();

		if (!name.trim()) return;

		setSaving(true);

		try {
			if (editingId) {
				await updateLeadSource(editingId, {
					name: name.trim(),
					active: true,
				});
			} else {
				await createLeadSource({
					name: name.trim(),
				});
			}

			setName("");
			setEditingId(null);

			await loadSources();
		} finally {
			setSaving(false);
		}
	}

	function handleEdit(source) {
		setEditingId(source.id);
		setName(source.name);
	}

	async function handleDelete(sourceId) {
		const confirmed = window.confirm(
			"Are you sure you want to delete this lead source?",
		);

		if (!confirmed) return;

		await deleteLeadSource(sourceId);
		await loadSources();
	}

	if (loading) {
		return <p>Loading lead sources...</p>;
	}

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<h1>Manage Lead Sources</h1>
				<p>Add, edit or delete lead sources used across the CRM.</p>
			</div>

			<div className={styles.card}>
				<h2>{editingId ? "Edit Source" : "Add New Source"}</h2>

				<form onSubmit={handleSubmit}>
					<div className={styles.form}>
						<div className={styles.field}>
							<label>Source name</label>

							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Website, Facebook, Referral"
							/>
						</div>

						<button
							type="submit"
							disabled={saving}
							className={styles.primaryButton}
						>
							{editingId ? "Update Source" : "Add Source"}
						</button>
					</div>

					{editingId && (
						<button
							type="button"
							className={styles.cancelButton}
							onClick={() => {
								setEditingId(null);
								setName("");
							}}
						>
							Cancel Edit
						</button>
					)}
				</form>
			</div>

			<div className={styles.card}>
				<h2>Configured Sources</h2>

				<div className={styles.list}>
					{sources.length === 0 ? (
						<p className={styles.empty}>No lead sources configured yet.</p>
					) : (
						sources.map((source) => (
							<div key={source.id} className={styles.item}>
								<div className={styles.itemInfo}>
									<span className={styles.itemName}>{source.name}</span>

									<span className={styles.itemMeta}>Lead Source</span>
								</div>

								<div className={styles.actions}>
									<button
										type="button"
										className={styles.editButton}
										onClick={() => handleEdit(source)}
									>
										Edit
									</button>

									<button
										type="button"
										className={styles.deleteButton}
										onClick={() => handleDelete(source.id)}
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
