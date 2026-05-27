"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./NewLeadForm.module.css";

import { useAuth } from "@/providers/AuthProvider/AuthProvider";

import { createInternalLead } from "@/services/leads/leadService";

import {
	PROPERTY_TYPES,
	BUDGET_RANGES,
	LEAD_PURPOSES,
	CONTACT_METHODS,
} from "@/constants/leadFormOptions";

export default function NewLeadForm() {
	const router = useRouter();
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		country: "",
		city: "",

		propertyType: "",
		location: "",
		budget: "",
		purpose: "",

		contactMethod: "email",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setLoading(true);
		setError("");

		try {
			await createInternalLead({
				fullName: formData.fullName,
				email: formData.email,
				phone: formData.phone,
				country: formData.country,
				city: formData.city,

				propertyType: formData.propertyType,
				location: formData.location,
				budgetRange: formData.budget,
				purpose: formData.purpose,
				preferredContactMethod: formData.contactMethod,

				createdBy: user.uid,
			});

			router.push("/dashboard/leads");
		} catch (err) {
			console.error(err);
			setError("Could not create lead.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<h1>Add Lead</h1>

				<p className={styles.description}>
					Create a new internal lead.
				</p>

				<form onSubmit={handleSubmit}>
					<fieldset disabled={loading}>
						<h2>Contact Details</h2>

						<div className={styles.grid}>
							<input
								name="fullName"
								placeholder="Full Name"
								value={formData.fullName}
								onChange={handleChange}
								required
							/>

							<input
								name="email"
								type="email"
								placeholder="Email"
								value={formData.email}
								onChange={handleChange}
								required
							/>

							<input
								name="phone"
								placeholder="Phone Number"
								value={formData.phone}
								onChange={handleChange}
								required
							/>

							<input
								name="country"
								placeholder="Country"
								value={formData.country}
								onChange={handleChange}
							/>

							<input
								name="city"
								placeholder="City"
								value={formData.city}
								onChange={handleChange}
							/>
						</div>

						<h2>Property Interest</h2>

						<div className={styles.grid}>
							<select
								name="propertyType"
								value={formData.propertyType}
								onChange={handleChange}
								required
							>
								<option value="">Select property type</option>

								{PROPERTY_TYPES.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>

							<input
								name="location"
								placeholder="Preferred location"
								value={formData.location}
								onChange={handleChange}
							/>

							<select
								name="budget"
								value={formData.budget}
								onChange={handleChange}
							>
								<option value="">Select budget range</option>

								{BUDGET_RANGES.map((range) => (
									<option key={range} value={range}>
										{range}
									</option>
								))}
							</select>

							<select
								name="purpose"
								value={formData.purpose}
								onChange={handleChange}
								required
							>
								<option value="">Select purpose</option>

								{LEAD_PURPOSES.map((purpose) => (
									<option key={purpose} value={purpose}>
										{purpose}
									</option>
								))}
							</select>
						</div>

						<div className={styles.formRow}>
							<label className={styles.rowLabel}>
								Preferred contact method
							</label>

							<div className={styles.radioGroup}>
								{CONTACT_METHODS.map((method) => (
									<label
										key={method.value}
										className={styles.radioOption}
									>
										<input
											type="radio"
											name="contactMethod"
											value={method.value}
											checked={
												formData.contactMethod === method.value
											}
											onChange={handleChange}
										/>

										{method.label}
									</label>
								))}
							</div>
						</div>

						{error && <p className={styles.error}>{error}</p>}

						<div className={styles.actions}>
							<button
								type="button"
								className={styles.cancelButton}
								onClick={() => router.push("/dashboard/leads")}
							>
								Cancel
							</button>

							<button
								type="submit"
								className={styles.submitButton}
								disabled={loading}
							>
								{loading ? "Creating..." : "Create Lead"}
							</button>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	);
}