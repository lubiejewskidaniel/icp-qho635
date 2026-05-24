"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";

export default function RequireRole({ allowedRoles, children }) {
	const router = useRouter();
	const { user, role, loading } = useAuth();

	useEffect(() => {
		if (loading) return;

		if (!user) {
			router.push("/login");
			return;
		}

		if (!user.emailVerified) {
			router.push("/login/verify-email");
			return;
		}

		if (!allowedRoles.includes(role)) {
			router.push("/dashboard");
		}
	}, [user, role, loading, allowedRoles, router]);

	if (loading || !user || !user.emailVerified) {
		return null;
	}

	if (!allowedRoles.includes(role)) {
		return null;
	}

	return children;
}
