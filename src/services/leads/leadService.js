import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	orderBy,
	serverTimestamp,
	doc,
	getDoc,
	updateDoc,
	limit,
	startAfter,
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

/*
-fetching a single lead
-changing the lead status
-setting a follow-up date
*/
export async function getLeadById(leadId) {
	const leadRef = doc(db, "leads", leadId);
	const snapshot = await getDoc(leadRef);

	if (!snapshot.exists()) {
		return null;
	}

	return {
		id: snapshot.id,
		...snapshot.data(),
	};
}

export async function updateLeadStatus(leadId, status, meta = {}) {
	const leadRef = doc(db, "leads", leadId);

	await updateDoc(leadRef, {
		status,
		updatedAt: serverTimestamp(),
		lastActivityAt: serverTimestamp(),
	});

	await addLeadActivity({
		leadId,
		type: "status_change",
		description: `Status changed to ${status}`,
		createdBy: meta.createdBy,
		createdByName: meta.createdByName,
	});
}

export async function updateLeadFollowUpDate(
	leadId,
	nextFollowUpDate,
	meta = {},
) {
	const leadRef = doc(db, "leads", leadId);

	await updateDoc(leadRef, {
		nextFollowUpDate,
		updatedAt: serverTimestamp(),
		lastActivityAt: serverTimestamp(),
	});

	await addLeadActivity({
		leadId,
		type: "follow_up",
		description: `Next follow-up date set to ${nextFollowUpDate}`,
		createdBy: meta.createdBy,
		createdByName: meta.createdByName,
	});
}

// aasigne lead to agent
export async function assignLeadToAgent(leadId, agent, meta = {}) {
	const leadRef = doc(db, "leads", leadId);

	await updateDoc(leadRef, {
		assignedAgentId: agent.id,
		assignedAgentName: agent.name,
		updatedAt: serverTimestamp(),
		lastActivityAt: serverTimestamp(),
	});

	await addLeadActivity({
		leadId,
		type: "assignment",
		description: `Lead assigned to ${agent.name}`,
		createdBy: meta.createdBy,
		createdByName: meta.createdByName,
	});
}

export async function addLeadActivity(data) {
	const docRef = await addDoc(collection(db, "activities"), {
		leadId: data.leadId,
		type: data.type,
		description: data.description,
		createdBy: data.createdBy || null,
		createdByName: data.createdByName || null,
		createdAt: serverTimestamp(),
	});

	return docRef.id;
}

export async function getLeadActivities(leadId, lastVisible = null) {
	const queryConstraints = [
		where("leadId", "==", leadId),
		orderBy("createdAt", "desc"),
		limit(5),
	];

	if (lastVisible) {
		queryConstraints.push(startAfter(lastVisible));
	}

	const q = query(collection(db, "activities"), ...queryConstraints);

	const snapshot = await getDocs(q);

	return {
		activities: snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})),
		lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
		hasMore: snapshot.docs.length === 5,
	};
}
