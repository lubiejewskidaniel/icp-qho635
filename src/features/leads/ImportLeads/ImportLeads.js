"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { importCsvLeads } from "@/services/leads/leadService";
import styles from "./ImportLeads.module.css";

function parseCsv(text) {
	const lines = text.trim().split("\n");
	const headers = lines[0].split(",").map((header) => header.trim());

	return lines.slice(1).map((line) => {
		const values = line.split(",").map((value) => value.trim());

		return headers.reduce((row, header, index) => {
			row[header] = values[index] || "";
			return row;
		}, {});
	});
}

export default function ImportLeads() {
	const { user, name } = useAuth();

	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState("");

	const handleImport = async () => {
		if (!file) return;

		setLoading(true);
		setError("");
		setResult(null);

		try {
			const text = await file.text();
			const rows = parseCsv(text);

			const importResult = await importCsvLeads(rows, {
				createdBy: user?.uid,
				createdByName: name,
			});

			setResult(importResult);
		} catch (err) {
			console.error(err);
			setError("Could not import leads.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<section className={styles.wrapper}>
			<div className={styles.card}>
				<h1>Import Leads from CSV</h1>

				<p>
					Upload a CSV file. Existing leads with the same email or phone will be
					skipped.
				</p>

				<input
					type="file"
					accept=".csv"
					onChange={(e) => setFile(e.target.files[0])}
				/>

				<button
					type="button"
					onClick={handleImport}
					disabled={!file || loading}
				>
					{loading ? "Importing..." : "Import CSV"}
				</button>

				{error && <p className={styles.error}>{error}</p>}

				{result && (
					<div className={styles.result}>
						<p>Imported: {result.imported}</p>
						<p>Skipped existing/invalid: {result.skipped}</p>
					</div>
				)}
			</div>
		</section>
	);
}
