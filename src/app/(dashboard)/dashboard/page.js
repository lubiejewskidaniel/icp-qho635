import { useAuth } from "@/providers/AuthProvider/AuthProvider";

import ManagerDashboard from "@/features/dashboard/ManagerDashboard";
import AgentDashboard from "@/features/dashboard/AgentDashboard";

export default function DashboardPage() {
	const { role } = useAuth();

	if (role === "manager") {
		return <ManagerDashboard />;
	}

	return <AgentDashboard />;
}
