"use client";

import Link from "next/link";
import { logout } from "@/services/auth/authService";
import { useRouter } from "next/navigation";

export default function Sidebar() {
	const router = useRouter();

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
					<li>
						<Link href="/dashboard/reports">Reports</Link>
					</li>
				</ul>
			</nav>

			<button onClick={handleLogout}>Logout</button>
		</aside>
	);
}
