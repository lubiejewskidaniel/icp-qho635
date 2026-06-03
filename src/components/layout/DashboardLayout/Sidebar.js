"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { logout } from "@/services/auth/authService";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";

import styles from "./Sidebar.module.css";

export default function Sidebar() {
	const router = useRouter();
	const { role } = useAuth();

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	return (
		<aside className={styles.sidebar}>
			<h2 className={styles.logo}>PLMS</h2>

			<nav className={styles.nav}>
				<ul className={styles.menu}>
					<li>
						<Link href="/dashboard" className={styles.link}>
							My Dashboard
						</Link>
					</li>

					<li>
						<Link href="/dashboard/leads" className={styles.link}>
							Leads
						</Link>
					</li>

					{role === "manager" && (
						<li>
							<Link href="/dashboard/reports" className={styles.link}>
								Reports
							</Link>
						</li>
					)}

					{role === "manager" && (
						<>
							<li className={styles.sectionTitle}>Settings</li>

							<li>
								<Link href="/dashboard/agents" className={styles.link}>
									Manage Agents
								</Link>
							</li>

							<li>
								<Link
									href="/dashboard/settings/lead-statuses"
									className={styles.link}
								>
									Manage Lead Statuses
								</Link>
							</li>

							<li>
								<Link
									href="/dashboard/settings/lead-sources"
									className={styles.link}
								>
									Manage Lead Sources
								</Link>
							</li>
						</>
					)}
				</ul>
			</nav>

			<button onClick={handleLogout} className={styles.logoutButton}>
				Logout
			</button>
		</aside>
	);
}
