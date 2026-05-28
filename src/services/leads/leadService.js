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
	writeBatch,
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

	return snapshot.docs.map((document) => ({
		id: document.id,
		...document.data(),
	}));
}

export async function getAllLeads() {
	const q = query(collection(db, "leads"), orderBy("lastActivityAt", "desc"));

	const snapshot = await getDocs(q);

	return snapshot.docs.map((document) => ({
		id: document.id,
		...document.data(),
	}));
}

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
		type: "Status Change",
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
		type: "Follow Up",
		description: `Next follow-up date set to ${nextFollowUpDate}`,
		createdBy: meta.createdBy,
		createdByName: meta.createdByName,
	});
}

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
		type: "Assignment",
		description: `Lead assigned to ${agent.name}`,
		createdBy: meta.createdBy,
		createdByName: meta.createdByName,
	});
}

export async function addLeadActivity(data) {
	const activityRef = await addDoc(collection(db, "activities"), {
		leadId: data.leadId,
		type: data.type,
		description: data.description,
		createdBy: data.createdBy || null,
		createdByName: data.createdByName || null,
		createdAt: serverTimestamp(),
	});

	const leadRef = doc(db, "leads", data.leadId);

	await updateDoc(leadRef, {
		lastActivityAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});

	return activityRef.id;
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
		activities: snapshot.docs.map((document) => ({
			id: document.id,
			...document.data(),
		})),
		lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
		hasMore: snapshot.docs.length === 5,
	};
}

export async function leadExists(email, phone) {
	const emailQuery = query(
		collection(db, "leads"),
		where("email", "==", email),
	);

	const phoneQuery = query(
		collection(db, "leads"),
		where("phone", "==", phone),
	);

	const emailSnapshot = await getDocs(emailQuery);
	const phoneSnapshot = await getDocs(phoneQuery);

	return !emailSnapshot.empty || !phoneSnapshot.empty;
}

export async function importCsvLeads(rows, meta = {}) {
	const batch = writeBatch(db);

	let imported = 0;
	let skipped = 0;

	for (const row of rows) {
		const email = row.email?.trim();
		const phone = row.phone?.trim();

		if (!email && !phone) {
			skipped++;
			continue;
		}

		const exists = await leadExists(email, phone);

		if (exists) {
			skipped++;
			continue;
		}

		const leadRef = doc(collection(db, "leads"));

		batch.set(leadRef, {
			fullName: row.fullName || "",
			email: email || "",
			phone: phone || "",
			country: row.country || "",
			city: row.city || "",

			propertyType: row.propertyType || "",
			location: row.location || "",
			budgetRange: row.budgetRange || "",
			purpose: row.purpose || "",
			preferredContactMethod: row.preferredContactMethod || "",

			source: "csv",

			assignedAgentId: row.assignedAgentId || meta.createdBy || null,
			assignedAgentName: row.assignedAgentName || meta.createdByName || null,

			createdBy: meta.createdBy || null,

			status: LEAD_STATUSES.NEW,

			lastContactDate: null,
			lastActivityAt: serverTimestamp(),
			nextFollowUpDate: null,

			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		});

		imported++;
	}

	await batch.commit();

	return {
		imported,
		skipped,
	};
}
