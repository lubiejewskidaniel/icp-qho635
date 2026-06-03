import {
	collection,
	addDoc,
	getDocs,
	doc,
	updateDoc,
	deleteDoc,
	query,
	orderBy,
	serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase/config";

// Separate collection used to store lead statuses.
// Statuses are managed by managers through the Settings section.
const leadStatusesCollection = collection(db, "leadStatuses");

export async function getLeadStatuses() {
	// Return statuses in the order defined by the manager.
	const q = query(leadStatusesCollection, orderBy("order", "asc"));

	const snapshot = await getDocs(q);

	return snapshot.docs.map((document) => ({
		id: document.id,
		...document.data(),
	}));
}

export async function createLeadStatus(data) {
	// New statuses are active by default.
	const docRef = await addDoc(leadStatusesCollection, {
		name: data.name,
		order: Number(data.order) || 0,
		active: true,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});

	return docRef.id;
}

export async function updateLeadStatusSetting(statusId, data) {
	const statusRef = doc(db, "leadStatuses", statusId);

	await updateDoc(statusRef, {
		name: data.name,
		order: Number(data.order) || 0,
		active: data.active,
		updatedAt: serverTimestamp(),
	});
}

export async function deleteLeadStatusSetting(statusId) {
	// Permanent delete is acceptable because managers control status configuration.
	await deleteDoc(doc(db, "leadStatuses", statusId));
}
