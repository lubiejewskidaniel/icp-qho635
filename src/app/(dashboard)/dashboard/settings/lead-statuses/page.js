import LeadStatusesManager from "@/features/settings/LeadStatusesManager/LeadStatusesManager";
import RequireRole from "@/features/auth/RequireRole/RequireRole";

export const metadata = {
	title: "Manage Lead Statuses",
};

export default function LeadStatusesPage() {
	return (
		<RequireRole allowedRoles={["manager"]}>
			<LeadStatusesManager />
		</RequireRole>
	);
}
