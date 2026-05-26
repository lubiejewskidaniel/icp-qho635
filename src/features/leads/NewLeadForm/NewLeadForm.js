"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/providers/AuthProvider/AuthProvider";

import { createInternalLead } from "@/services/leads/leadService";

import {
	PROPERTY_TYPES,
	LEAD_PURPOSES,
	CONTACT_METHODS,
} from "@/constants/leadFormOptions";

export default function NewLeadForm() {
	const router = useRouter();
	const { user } = useAuth();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [form, setForm] = useState({
		fullName: "",
		email: "",
		phone: "",
		country: "",
		city: "",

		propertyType: PROPERTY_TYPES[0],
		location: "",
		budgetRange: "",

		purpose: LEAD_PURPOSES[0],
		preferredContactMethod: CONTACT_METHODS[0],
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		setForm((prev) => ({
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
				...form,
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
		<section>
			<h1>Add Lead</h1>

			<p>Create a new manual lead.</p>

			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="fullName">Full name</label>

					<input
						id="fullName"
						name="fullName"
						value={form.fullName}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="email">Email</label>

					<input
						id="email"
						name="email"
						type="email"
						value={form.email}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="phone">Phone</label>

					<input
						id="phone"
						name="phone"
						value={form.phone}
						onChange={handleChange}
						required
					/>
				</div>

				<div>
					<label htmlFor="country">Country</label>

					<input
						id="country"
						name="country"
						value={form.country}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="city">City</label>

					<input
						id="city"
						name="city"
						value={form.city}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="propertyType">Property type</label>

					<select
						id="propertyType"
						name="propertyType"
						value={form.propertyType}
						onChange={handleChange}
					>
						{PROPERTY_TYPES.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="location">Location</label>

					<input
						id="location"
						name="location"
						value={form.location}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="budgetRange">Budget range</label>

					<input
						id="budgetRange"
						name="budgetRange"
						value={form.budgetRange}
						onChange={handleChange}
					/>
				</div>

				<div>
					<label htmlFor="purpose">Purpose</label>

					<select
						id="purpose"
						name="purpose"
						value={form.purpose}
						onChange={handleChange}
					>
						{LEAD_PURPOSES.map((purpose) => (
							<option key={purpose} value={purpose}>
								{purpose}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="preferredContactMethod">
						Preferred contact method
					</label>

					<select
						id="preferredContactMethod"
						name="preferredContactMethod"
						value={form.preferredContactMethod}
						onChange={handleChange}
					>
						{CONTACT_METHODS.map((method) => (
							<option key={method} value={method}>
								{method}
							</option>
						))}
					</select>
				</div>

				{error && <p>{error}</p>}

				<button type="submit" disabled={loading}>
					{loading ? "Creating..." : "Create Lead"}
				</button>
			</form>
		</section>
	);
}