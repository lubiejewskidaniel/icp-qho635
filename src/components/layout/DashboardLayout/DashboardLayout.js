"use client";

import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout({ children, role }) {
	return (
		<div style={{ display: "flex", minHeight: "100vh" }}>
			<Sidebar role={role} />

			<div style={{ flex: 1 }}>
				<DashboardHeader role={role} />

				<main style={{ padding: "2rem" }}>{children}</main>
			</div>
		</div>
	);
}
