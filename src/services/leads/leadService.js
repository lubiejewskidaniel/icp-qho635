import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";
import { LEAD_STATUSES } from "@/constants/leadStatuses";

export async function createLead(data) {
	const docRef = await addDoc(collection(db, "leads"), {
		fullName: data.fullName,
		email: data.email,
		phone: data.phone,
		country: data.country,
		city: data.city,

		propertyType: data.propertyType,
		location: data.location,
		budgetRange: data.budgetRange,
		purpose: data.purpose,
		preferredContactMethod: data.preferredContactMethod,

		source: data.source || "website",
		assignedAgentId: data.assignedAgentId || null,
		assignedAgentName: data.assignedAgentName || null,

		createdBy: data.createdBy || null,

		status: data.status || LEAD_STATUSES.NEW,

		lastContactDate: null,
		lastActivityAt: serverTimestamp(),
		nextFollowUpDate: null,

		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});

	return docRef.id;
}

export async function createInternalLead(data) {
	return createLead({
		...data,
		source: "manual",
		assignedAgentId: data.assignedAgentId || data.createdBy || null,
		assignedAgentName: data.assignedAgentName || null,
		status: data.status || LEAD_STATUSES.NEW,
	});
}

export async function getAssignedLeads(agentId) {
	const q = query(
		collection(db, "leads"),
		where("assignedAgentId", "==", agentId),
		orderBy("lastActivityAt", "desc"),
	);

	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
}

export async function getAllLeads() {
	const q = query(collection(db, "leads"), orderBy("lastActivityAt", "desc"));

	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
}