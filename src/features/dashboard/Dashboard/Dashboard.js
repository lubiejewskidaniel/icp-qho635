"use client";

// thi is ashboard component renders different dashboard views
// depending on the authenticated user's role (agent or manager).
// It also handles loading and error states while authentication data is being resolved.

import { useAuth } from "@/features/auth/AuthProvider/AuthProvider";

import AgentDashboard from "../AgentDashboard/AgentDashboard";
import ManagerDashboard from "../ManagerDashboard/ManagerDashboard";

export default function Dashboard() {
	const { role, loading } = useAuth();

	if (loading) {
		return <p>Preparing your dashboard...</p>;
	}

	if (!role) {
		return (
			<p>We couldn't load your account information. Please refresh the page.</p>
		);
	}

	if (role === "manager") {
		return <ManagerDashboard />;
	}

	return <AgentDashboard />;
}
