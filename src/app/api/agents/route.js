import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request) {
	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return Response.json(
				{ error: "Name, email and password are required." },
				{ status: 400 },
			);
		}

		const userRecord = await adminAuth.createUser({
			email,
			password,
			displayName: name,
			emailVerified: true,
		});

		await adminDb.collection("users").doc(userRecord.uid).set({
			name,
			email,
			role: "agent",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return Response.json({
			success: true,
			agent: {
				id: userRecord.uid,
				name,
				email,
				role: "agent",
			},
		});
	} catch (error) {
		console.error("Create agent error:", error);

		return Response.json(
			{ error: error.message || "Could not create agent." },
			{ status: 500 },
		);
	}
}
