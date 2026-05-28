"use client";

import { useState } from "react";
import styles from "./EnquiryForm.module.css";
import Link from "next/link";
import { createLead } from "@/services/leads/leadService";

export default function EnquiryForm() {
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
		consent: false,
	});

	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		setLoading(true);
		setError("");
		setSuccess(false);

		try {
			await createLead({
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

				consentGiven: formData.consent,
			});

			setSuccess(true);

			setFormData({
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
				consent: false,
			});
		} catch (err) {
			console.error("Failed to submit enquiry", err);
			setError("Something went wrong. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<div className={styles.card}>
				<h1>Enquiry Form</h1>

				{success && (
					<p className={styles.success}>
						Thank you! Your enquiry has been submitted.
					</p>
				)}

				<form onSubmit={handleSubmit}>
					<fieldset disabled={loading}>
						<h2>Contact Details</h2>

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

						<h2>Property Interest</h2>

						<select
							name="propertyType"
							value={formData.propertyType}
							onChange={handleChange}
						>
							<option value="">Select property type</option>
							<option value="House">House</option>
							<option value="Apartment">Apartment</option>
							<option value="Land">Land</option>
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
							<option value="Up to 200K">Up to 200K</option>
							<option value="200K - 400K">200K - 400K</option>
							<option value="400K - 1M">400K - 1M</option>
							<option value="Over 1M">Over 1M</option>
						</select>

						<select
							name="purpose"
							value={formData.purpose}
							onChange={handleChange}
						>
							<option value="">Select purpose</option>
							<option value="Buy">Buy</option>
							<option value="Invest">Invest</option>
						</select>

						<div className={styles.formRow}>
							<label className={styles.rowLabel}>
								Preferred contact method
							</label>

							<div className={styles.radioGroup}>
								<label className={styles.radioOption}>
									<input
										type="radio"
										name="contactMethod"
										value="email"
										checked={formData.contactMethod === "email"}
										onChange={handleChange}
									/>
									Email
								</label>

								<label className={styles.radioOption}>
									<input
										type="radio"
										name="contactMethod"
										value="phone"
										checked={formData.contactMethod === "phone"}
										onChange={handleChange}
									/>
									Phone
								</label>
							</div>
						</div>

						{/* important! consent for leads to accept */}
						<div className={styles.formRow}>
							<label className={styles.checkboxLabel}>
								<input
									type="checkbox"
									name="consent"
									checked={formData.consent}
									onChange={handleChange}
									required
								/>

								<span>
									I agree to the{" "}
									<Link href="/privacy-policy" className={styles.privacyLink}>
										Privacy Policy
									</Link>
									.
								</span>
							</label>
						</div>

						{error && <p className={styles.error}>{error}</p>}

						<button
							type="submit"
							className={styles.submitButton}
							disabled={loading || !formData.consent}
						>
							{loading ? "Submitting..." : "Submit Enquiry"}
						</button>
					</fieldset>
				</form>
			</div>
		</div>
	);
}