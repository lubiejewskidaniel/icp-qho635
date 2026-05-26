"use client";

import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout({ children }) {
	return (
		<div style={{ display: "flex", minHeight: "100vh" }}>
			<Sidebar />

			<div style={{ flex: 1 }}>
				<DashboardHeader />

				<main style={{ padding: "2rem" }}>{children}</main>
			</div>
		</div>
	);
}
