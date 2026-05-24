"use client";

import { useAuth } from "@/providers/AuthProvider/AuthProvider";

export default function DashboardHeader() {
	const { name, role } = useAuth();

	return (
		<header style={{ padding: "1.5rem", borderBottom: "1px solid #ddd" }}>
			<h2>Welcome {name}</h2>

			<p>Welcome in {role === "manager" ? "Manager" : "Agent"} Dashboard</p>
		</header>
	);
}
