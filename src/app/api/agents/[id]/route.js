import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function PATCH(request, { params }) {
	try {
		const { id: agentId } = await params;
		const { name, email } = await request.json();

		if (!agentId) {
			return Response.json({ error: "Agent ID is required." }, { status: 400 });
		}

		if (!name || !email) {
			return Response.json(
				{ error: "Name and email are required." },
				{ status: 400 },
			);
		}

		await adminAuth.updateUser(agentId, {
			email,
			displayName: name,
		});

		await adminDb.collection("users").doc(agentId).update({
			name,
			email,
			updatedAt: new Date(),
		});

		const leadsSnapshot = await adminDb
			.collection("leads")
			.where("assignedAgentId", "==", agentId)
			.get();

		const batch = adminDb.batch();

		leadsSnapshot.docs.forEach((leadDoc) => {
			batch.update(leadDoc.ref, {
				assignedAgentName: name,
				updatedAt: new Date(),
			});
		});

		await batch.commit();

		return Response.json({ success: true });
	} catch (error) {
		console.error("Update agent error:", error);

		return Response.json(
			{ error: error.message || "Could not update agent." },
			{ status: 500 },
		);
	}
}

export async function DELETE(request, { params }) {
	try {
		const { id: agentId } = await params;

		if (!agentId) {
			return Response.json({ error: "Agent ID is required." }, { status: 400 });
		}

		await adminAuth.deleteUser(agentId);

		await adminDb.collection("users").doc(agentId).delete();

		const leadsSnapshot = await adminDb
			.collection("leads")
			.where("assignedAgentId", "==", agentId)
			.get();

		const batch = adminDb.batch();

		leadsSnapshot.docs.forEach((leadDoc) => {
			batch.update(leadDoc.ref, {
				assignedAgentId: null,
				assignedAgentName: null,
				updatedAt: new Date(),
				lastActivityAt: new Date(),
			});
		});

		await batch.commit();

		return Response.json({ success: true });
	} catch (error) {
		console.error("Delete agent error:", error);

		return Response.json(
			{ error: error.message || "Could not delete agent." },
			{ status: 500 },
		);
	}
}
