import Dashboard from "@/components/layout/DashboardLayout/DashboardLayout";
import RequireVerifiedUser from "@/features/auth/RequireVerifiedUser/RequireVerifiedUser";

export default function DashboardPage() {
	return (
		<RequireVerifiedUser>
			<Dashboard />
		</RequireVerifiedUser>
	);
}
