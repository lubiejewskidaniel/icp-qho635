"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider/AuthProvider";

export default function RequireVerifiedUser({ children }) {
	const router = useRouter();
	const { user, loading } = useAuth();

	useEffect(() => {
		if (loading) return;

		if (!user) {
			router.push("/login");
			return;
		}

		if (!user.emailVerified) {
			router.push("/login/verify-email");
		}
	}, [user, loading, router]);

	if (loading || !user || !user.emailVerified) {
		return null;
	}

	return children;
}
