import { getAllLeads, getAssignedLeads } from "@/services/leads/leadService";

export async function getManagerDashboardStats() {
	const leads = await getAllLeads();

	const totalLeads = leads.length;
	const newLeads = leads.filter((lead) => lead.status === "New").length;
	const wonLeads = leads.filter((lead) => lead.status === "Won").length;
	const lostLeads = leads.filter((lead) => lead.status === "Lost").length;

	const conversionRate =
		totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

	const leadStatusCounts = {};

	leads.forEach((lead) => {
		const status = lead.status || "Unknown";

		if (!leadStatusCounts[status]) {
			leadStatusCounts[status] = 0;
		}

		leadStatusCounts[status] += 1;
	});

	return {
		totalLeads,
		newLeads,
		wonLeads,
		lostLeads,
		conversionRate,
		leadStatusCounts,
	};
}

export async function getAgentDashboardStats(agentId) {
	const leads = await getAssignedLeads(agentId);

	const totalLeads = leads.length;
	const newLeads = leads.filter((lead) => lead.status === "New").length;
	const wonLeads = leads.filter((lead) => lead.status === "Won").length;

	const today = new Date().toISOString().split("T")[0];

	const followUpsToday = leads.filter(
		(lead) => lead.nextFollowUpDate === today,
	).length;

	return {
		totalLeads,
		newLeads,
		wonLeads,
		followUpsToday,
	};
}
