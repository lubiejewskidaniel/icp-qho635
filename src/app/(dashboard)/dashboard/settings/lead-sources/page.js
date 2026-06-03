import LeadSourcesManager from "@/features/settings/LeadSourcesManager/LeadSourcesManager";
import RequireRole from "@/features/auth/RequireRole/RequireRole";

export const metadata = {
	title: "Manage Lead Sources",
};

export default function LeadSourcesPage() {
	return (
		<RequireRole allowedRoles={["manager"]}>
			<LeadSourcesManager />
		</RequireRole>
	);
}
