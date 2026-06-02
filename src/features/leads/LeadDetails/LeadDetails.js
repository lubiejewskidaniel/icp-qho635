"use client";

import { useEffect, useState } from "react";
import { LEAD_STATUS_OPTIONS } from "@/constants/leadStatuses";
import { MANUAL_ACTIVITY_OPTIONS } from "@/constants/activityTypes";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";
import { getAgents } from "@/services/users/userService";
import { EMAIL_TEMPLATES } from "@/constants/emailTemplates";

import {
	getLeadById,
	updateLeadStatus,
	updateLeadFollowUpDate,
	assignLeadToAgent,
	addLeadActivity,
	getLeadActivities,
	updateLeadLastContactDate,
} from "@/services/leads/leadService";

import styles from "./LeadDetails.module.css";

export default function LeadDetails({ leadId }) {
	const { user, role, name } = useAuth();

	const [lead, setLead] = useState(null);
	const [agents, setAgents] = useState([]);
	const [activities, setActivities] = useState([]);
	const [lastVisibleActivity, setLastVisibleActivity] = useState(null);
	const [hasMoreActivities, setHasMoreActivities] = useState(false);

	const [note, setNote] = useState("");
	const [activityType, setActivityType] = useState("call");
	const [activityDescription, setActivityDescription] = useState("");

	const [emailSubject, setEmailSubject] = useState("");
	const [emailMessage, setEmailMessage] = useState("");
	const [emailSending, setEmailSending] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [emailSuccess, setEmailSuccess] = useState("");
	const [selectedEmailTemplate, setSelectedEmailTemplate] = useState("");

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		async function loadLead() {
			try {
				const data = await getLeadById(leadId);
				setLead(data);
			} catch (err) {
				console.error("Could not load lead:", err);
				setError("Could not load lead.");
			} finally {
				setLoading(false);
			}

			try {
				const activityData = await getLeadActivities(leadId);
				setActivities(activityData.activities);
				setLastVisibleActivity(activityData.lastVisible);
				setHasMoreActivities(activityData.hasMore);
			} catch (err) {
				console.error("Could not load activities:", err);
			}
		}

		loadLead();
	}, [leadId]);

	useEffect(() => {
		if (role !== "manager") return;

		async function loadAgents() {
			const data = await getAgents();
			setAgents(data);
		}

		loadAgents();
	}, [role]);

	const activityMeta = {
		createdBy: user?.uid || null,
		createdByName: name || null,
	};

	const refreshActivities = async () => {
		try {
			const activityData = await getLeadActivities(leadId);
			setActivities(activityData.activities);
			setLastVisibleActivity(activityData.lastVisible);
			setHasMoreActivities(activityData.hasMore);
		} catch (err) {
			console.error("Could not refresh activities:", err);
		}
	};

	const handleLoadMoreActivities = async () => {
		if (!lastVisibleActivity) return;

		try {
			const activityData = await getLeadActivities(leadId, lastVisibleActivity);

			setActivities((currentActivities) => [
				...currentActivities,
				...activityData.activities,
			]);

			setLastVisibleActivity(activityData.lastVisible);
			setHasMoreActivities(activityData.hasMore);
		} catch (err) {
			console.error("Could not load more activities:", err);
		}
	};

	const handleStatusChange = async (e) => {
		const newStatus = e.target.value;

		setSaving(true);

		try {
			await updateLeadStatus(leadId, newStatus, activityMeta);

			setLead((currentLead) => ({
				...currentLead,
				status: newStatus,
			}));

			await refreshActivities();
		} finally {
			setSaving(false);
		}
	};

	const handleFollowUpChange = async (e) => {
		const value = e.target.value;

		setSaving(true);

		try {
			await updateLeadFollowUpDate(leadId, value, activityMeta);

			setLead((currentLead) => ({
				...currentLead,
				nextFollowUpDate: value,
			}));

			await refreshActivities();
		} finally {
			setSaving(false);
		}
	};

	const handleAgentChange = async (e) => {
		const agentId = e.target.value;

		if (!agentId) return;

		const selectedAgent = agents.find((agent) => agent.id === agentId);

		if (!selectedAgent) return;

		setSaving(true);

		try {
			await assignLeadToAgent(leadId, selectedAgent, activityMeta);

			setLead((currentLead) => ({
				...currentLead,
				assignedAgentId: selectedAgent.id,
				assignedAgentName: selectedAgent.name,
			}));

			// Notify agent about new assignment
			if (selectedAgent.email) {
				try {
					await fetch("/api/send-lead-email", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							to: selectedAgent.email,
							subject: `New Lead Assigned: ${lead.fullName}`,
							message: `
								Hello ${selectedAgent.name},

								A new lead has been assigned to you.

								Lead Name: ${lead.fullName}
								Email: ${lead.email || "-"}
								Phone: ${lead.phone || "-"}
								Location: ${lead.location || "-"}

								Please review the lead and follow up as soon as possible.

								Kind regards,
								PLMS Team
						`.trim(),
						}),
					});
				} catch (emailError) {
					console.error("Could not send assignment notification:", emailError);
				}
			}

			await refreshActivities();
		} finally {
			setSaving(false);
		}
	};

	const handleAddNote = async () => {
		if (!note.trim()) return;

		setSaving(true);

		try {
			await addLeadActivity({
				leadId,
				type: "note",
				description: note.trim(),
				...activityMeta,
			});

			await refreshActivities();
			setNote("");
		} finally {
			setSaving(false);
		}
	};

	const handleAddActivity = async () => {
		if (!activityDescription.trim()) return;

		setSaving(true);

		try {
			await addLeadActivity({
				leadId,
				type: activityType,
				description: activityDescription.trim(),
				...activityMeta,
			});

			await refreshActivities();
			setActivityDescription("");
			setActivityType("call");
		} finally {
			setSaving(false);
		}
	};

	const handleEmailTemplateChange = (e) => {
		const templateId = e.target.value;

		setSelectedEmailTemplate(templateId);
		setEmailError("");
		setEmailSuccess("");

		if (!templateId) {
			setEmailSubject("");
			setEmailMessage("");
			return;
		}

		const selectedTemplate = EMAIL_TEMPLATES.find(
			(template) => template.id === templateId,
		);

		if (!selectedTemplate) return;

		setEmailSubject(selectedTemplate.subject);
		setEmailMessage(selectedTemplate.message);
	};

	const handleSendEmail = async () => {
		if (!lead.email) {
			setEmailError("This lead does not have an email address.");
			return;
		}

		if (!emailSubject.trim() || !emailMessage.trim()) {
			setEmailError("Email subject and message are required.");
			return;
		}

		setEmailSending(true);
		setEmailError("");
		setEmailSuccess("");

		try {
			const response = await fetch("/api/send-lead-email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					to: lead.email,
					subject: emailSubject.trim(),
					message: emailMessage.trim(),
				}),
			});

			if (!response.ok) {
				throw new Error("Email failed");
			}

			// Update last contact date after successful email delivery
			await updateLeadLastContactDate(leadId);

			await addLeadActivity({
				leadId,
				type: "email",
				description: `Email sent to ${lead.email}: ${emailSubject.trim()}`,
				...activityMeta,
			});

			await refreshActivities();

			setEmailSubject("");
			setEmailMessage("");
			setSelectedEmailTemplate("");
			setEmailSuccess("Email sent successfully.");
		} catch (err) {
			console.error("Could not send email:", err);
			setEmailError("Could not send email.");
		} finally {
			setEmailSending(false);
		}
	};

	if (loading) return <p>Loading lead...</p>;
	if (error) return <p>{error}</p>;
	if (!lead) return <p>Lead not found.</p>;

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<div>
					<h1>{lead.fullName}</h1>
					<p>{lead.email}</p>
				</div>

				<span className={styles.status}>{lead.status}</span>
			</div>

			<div className={styles.grid}>
				<div className={styles.card}>
					<h2>Contact Details</h2>
					<p>
						<strong>Email:</strong> {lead.email || "-"}
					</p>
					<p>
						<strong>Phone:</strong> {lead.phone || "-"}
					</p>

					<p>
						<strong>Last Contact:</strong>{" "}
						{lead.lastContactDate?.seconds
							? new Date(lead.lastContactDate.seconds * 1000).toLocaleString()
							: "-"}
					</p>
					<p>
						<strong>Country:</strong> {lead.country || "-"}
					</p>
					<p>
						<strong>City:</strong> {lead.city || "-"}
					</p>
				</div>

				<div className={styles.card}>
					<h2>Property Interest</h2>
					<p>
						<strong>Property type:</strong> {lead.propertyType || "-"}
					</p>
					<p>
						<strong>Location:</strong> {lead.location || "-"}
					</p>
					<p>
						<strong>Budget:</strong> {lead.budgetRange || "-"}
					</p>
					<p>
						<strong>Purpose:</strong> {lead.purpose || "-"}
					</p>
					<p>
						<strong>Preferred contact:</strong>{" "}
						{lead.preferredContactMethod || "-"}
					</p>
				</div>

				<div className={styles.card}>
					<h2>Lead Management</h2>

					<label>Status</label>
					<select
						value={lead.status || ""}
						onChange={handleStatusChange}
						disabled={saving}
					>
						{LEAD_STATUS_OPTIONS.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>

					<label>Next follow-up date</label>
					<input
						type="date"
						value={lead.nextFollowUpDate || ""}
						onChange={handleFollowUpChange}
						disabled={saving}
					/>

					<label>Assigned agent</label>
					{role === "manager" ? (
						<select
							value={lead.assignedAgentId || ""}
							onChange={handleAgentChange}
							disabled={saving}
						>
							<option value="">Unassigned</option>
							{agents.map((agent) => (
								<option key={agent.id} value={agent.id}>
									{agent.name}
								</option>
							))}
						</select>
					) : (
						<p>{lead.assignedAgentName || "Unassigned"}</p>
					)}

					<label>Internal note</label>
					<textarea
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Add internal note..."
						rows={4}
						disabled={saving}
					/>

					<button
						type="button"
						onClick={handleAddNote}
						disabled={saving}
						className={styles.noteButton}
					>
						Add Note
					</button>

					<h3 className={styles.sectionTitle}>Send Email</h3>

					<label>Email template</label>
					<select
						value={selectedEmailTemplate}
						onChange={handleEmailTemplateChange}
						disabled={emailSending}
					>
						<option value="">Custom email</option>
						{EMAIL_TEMPLATES.map((template) => (
							<option key={template.id} value={template.id}>
								{template.label}
							</option>
						))}
					</select>

					<label>Email subject</label>
					<input
						type="text"
						value={emailSubject}
						onChange={(e) => setEmailSubject(e.target.value)}
						placeholder="Email subject..."
						disabled={emailSending}
					/>

					<label>Email message</label>
					<textarea
						value={emailMessage}
						onChange={(e) => setEmailMessage(e.target.value)}
						placeholder="Write your email message..."
						rows={6}
						disabled={emailSending}
					/>

					<button
						type="button"
						onClick={handleSendEmail}
						disabled={emailSending || !lead.email}
						className={styles.noteButton}
					>
						{emailSending ? "Sending..." : "Send Email"}
					</button>

					{emailError && <p>{emailError}</p>}
					{emailSuccess && <p>{emailSuccess}</p>}

					<h3 className={styles.sectionTitle}>Communication Activity</h3>

					<label>Activity type</label>
					<select
						value={activityType}
						onChange={(e) => setActivityType(e.target.value)}
						disabled={saving}
					>
						{MANUAL_ACTIVITY_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>

					<label>Activity description</label>
					<textarea
						value={activityDescription}
						onChange={(e) => setActivityDescription(e.target.value)}
						placeholder="Describe the call, email or meeting..."
						rows={4}
						disabled={saving}
					/>

					<button
						type="button"
						onClick={handleAddActivity}
						disabled={saving}
						className={styles.noteButton}
					>
						Log Activity
					</button>

					{saving && <p>Saving...</p>}
				</div>
			</div>

			<div className={styles.historyCard}>
				<h2>Lead Log History</h2>

				{activities.length === 0 ? (
					<p>No activity yet.</p>
				) : (
					<div className={styles.historyList}>
						{activities.map((activity) => (
							<div key={activity.id} className={styles.historyItem}>
								<div className={styles.historyHeader}>
									<strong>{activity.type}</strong>
									{activity.createdByName && (
										<span> by {activity.createdByName}</span>
									)}
								</div>

								<p>{activity.description}</p>
							</div>
						))}
					</div>
				)}
			</div>

			{hasMoreActivities && (
				<button
					type="button"
					onClick={handleLoadMoreActivities}
					className={styles.loadMoreButton}
				>
					Load more
				</button>
			)}
		</section>
	);
}
