import ManageAgents from "@/features/agents/ManageAgents/ManageAgents";
import RequireRole from "@/features/auth/RequireRole/RequireRole";

export const metadata = {
	title: "Manage Agents",
};

export default function AgentsPage() {
	return (
		<RequireRole allowedRoles={["manager"]}>
			<ManageAgents />
		</RequireRole>
	);
}
