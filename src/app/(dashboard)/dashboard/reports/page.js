import ReportsDashboard from "@/features/reports/ReportsDashboard/ReportsDashboard";
import RequireRole from "@/features/auth/RequireRole/RequireRole";

export const metadata = {
	title: "Reports",
};

export default function ReportsPage() {
	return (
		<RequireRole allowedRoles={["manager"]}>
			<ReportsDashboard />
		</RequireRole>
	);
}
