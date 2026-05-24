"use client";

import Link from "next/link";
import { logout } from "@/services/auth/authService";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";

export default function Sidebar() {
	const router = useRouter();
	const { role } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<aside
			style={{
				width: "240px",
				background: "#1e293b",
				color: "white",
				padding: "1rem",
			}}
		>
			<h2>Dashboard</h2>

			<nav>
				<ul style={{ listStyle: "none", padding: 0 }}>
					<li>
						<Link href="/dashboard">Dashboard</Link>
					</li>

					<li>
						<Link href="/dashboard/leads">Leads</Link>
					</li>

					{role === "manager" && (
						<li>
							<Link href="/dashboard/reports">Reports</Link>
						</li>
					)}

					{role === "manager" && (
						<li>
							<Link href="/dashboard/agents">Agents</Link>
						</li>
					)}
				</ul>
			</nav>

			<button onClick={handleLogout}>Logout</button>
		</aside>
	);
}
