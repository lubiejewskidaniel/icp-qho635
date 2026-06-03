/*
Follow-up reminders are implemented using a scheduled Vercel Cron Job.

The cron job runs once per day and calls this endpoint.
The endpoint checks Firestore for leads that require a follow-up today,
groups them by assigned agent, and sends one reminder email per agent.
*/

import nodemailer from "nodemailer";
import { adminDb } from "@/lib/firebase/admin";

// Returns today's date in YYYY-MM-DD format.
// This matches the format used in nextFollowUpDate.
function getTodayDateString() {
	return new Date().toISOString().split("T")[0];
}

// Builds the reminder email content for one agent.
function buildReminderMessage(agentName, leads) {
	const leadList = leads
		.map((lead) => {
			return `- ${lead.fullName || "Unnamed lead"} | Email: ${
				lead.email || "-"
			} | Phone: ${lead.phone || "-"} | Status: ${lead.status || "-"}`;
		})
		.join("\n");

	return `
Hello ${agentName || "Agent"},

You have ${leads.length} follow-up${
		leads.length === 1 ? "" : "s"
	} scheduled for today.

${leadList}

Please review these leads in PLMS and follow up as soon as possible.

Kind regards,
PLMS Team
`.trim();
}

export async function GET(request) {
	// Simple protection so the endpoint can only be triggered
	// by the configured cron job or an authorized request.
	const authHeader = request.headers.get("authorization");

	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const today = getTodayDateString();

		// Find all leads that have a follow-up scheduled for today.
		const leadsSnapshot = await adminDb
			.collection("leads")
			.where("nextFollowUpDate", "==", today)
			.get();

		if (leadsSnapshot.empty) {
			return Response.json({
				success: true,
				message: "No follow-ups scheduled for today.",
				sent: 0,
			});
		}

		const leads = leadsSnapshot.docs.map((document) => ({
			id: document.id,
			...document.data(),
		}));

		// Group leads by assigned agent.
		// This allows sending only one email per agent.
		const leadsByAgent = {};

		leads.forEach((lead) => {
			if (!lead.assignedAgentId) return;

			if (!leadsByAgent[lead.assignedAgentId]) {
				leadsByAgent[lead.assignedAgentId] = [];
			}

			leadsByAgent[lead.assignedAgentId].push(lead);
		});

		// SMTP transporter configuration.
		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		let sent = 0;

		// Send one reminder email to each agent.
		for (const [agentId, agentLeads] of Object.entries(leadsByAgent)) {
			const agentDoc = await adminDb.collection("users").doc(agentId).get();

			if (!agentDoc.exists) continue;

			const agent = agentDoc.data();

			// Skip users without an email address.
			if (!agent.email) continue;

			const subject = `You Have ${agentLeads.length} Follow-Up${
				agentLeads.length === 1 ? "" : "s"
			} Scheduled Today`;

			const message = buildReminderMessage(agent.name, agentLeads);

			await transporter.sendMail({
				from: process.env.SMTP_FROM,
				to: agent.email,
				subject,
				text: message,
				html: message.replace(/\n/g, "<br />"),
			});

			sent++;
		}

		return Response.json({
			success: true,
			sent,
			followUps: leads.length,
		});
	} catch (error) {
		console.error("Follow-up reminder error:", error);

		return Response.json(
			{
				error: "Could not send follow-up reminders.",
			},
			{
				status: 500,
			},
		);
	}
}
