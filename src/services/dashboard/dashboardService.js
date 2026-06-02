import {
	getAllLeads,
	getAssignedLeads,
	getRecentActivities,
} from "@/services/leads/leadService";

export async function getManagerDashboardStats() {
	const leads = await getAllLeads();
	const recentActivities = await getRecentActivities(5);

	const totalLeads = leads.length;
	const newLeads = leads.filter((lead) => lead.status === "New").length;
	const wonLeads = leads.filter((lead) => lead.status === "Won").length;
	const lostLeads = leads.filter((lead) => lead.status === "Lost").length;

	const conversionRate =
		totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

	const today = new Date().toISOString().split("T")[0];

	// Leads that should be followed up today
	const todayFollowUps = leads.filter(
		(lead) => lead.nextFollowUpDate === today,
	).length;

	// Leads with follow-up dates older than today
	const overdueFollowUps = leads.filter(
		(lead) => lead.nextFollowUpDate && lead.nextFollowUpDate < today,
	).length;

	// Count leads by status for pipeline overview
	const leadStatusCounts = {};

	leads.forEach((lead) => {
		const status = lead.status || "Unknown";

		if (!leadStatusCounts[status]) {
			leadStatusCounts[status] = 0;
		}

		leadStatusCounts[status] += 1;
	});

	// Count how many leads each agent currently has
	const leadsPerAgent = {};

	leads.forEach((lead) => {
		const agentName = lead.assignedAgentName || "Unassigned";

		if (!leadsPerAgent[agentName]) {
			leadsPerAgent[agentName] = 0;
		}

		leadsPerAgent[agentName] += 1;
	});

	// Convert object into array for easier rendering in UI
	const agentPerformance = Object.entries(leadsPerAgent)
		.map(([agentName, count]) => ({
			agentName,
			count,
		}))
		.sort((a, b) => b.count - a.count);

	return {
		totalLeads,
		newLeads,
		wonLeads,
		lostLeads,
		conversionRate,
		todayFollowUps,
		overdueFollowUps,
		leadStatusCounts,
		recentActivities,
		agentPerformance,
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
