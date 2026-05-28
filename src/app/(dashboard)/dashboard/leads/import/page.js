import ImportLeads from "@/features/leads/ImportLeads/ImportLeads";
import RequireRole from "@/features/auth/RequireRole/RequireRole";

export const metadata = {
	title: "Import Leads",
};

export default function ImportLeadsPage() {
	return (
		<RequireRole allowedRoles={["manager"]}>
			<ImportLeads />
		</RequireRole>
	);
}
