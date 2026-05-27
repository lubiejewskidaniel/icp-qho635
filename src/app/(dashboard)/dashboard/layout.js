import Dashboard from "@/components/layout/DashboardLayout/DashboardLayout";
import RequireVerifiedUser from "@/features/auth/RequireVerifiedUser/RequireVerifiedUser";

export default function DashboardRouteLayout({ children }) {
	return (
		<RequireVerifiedUser>
			<Dashboard>{children}</Dashboard>
		</RequireVerifiedUser>
	);
}