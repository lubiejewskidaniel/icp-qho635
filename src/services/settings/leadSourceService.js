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

// Separate collection used to store lead sources.
// Sources are managed by managers through the Settings section.
const leadSourcesCollection = collection(db, "leadSources");

export async function getLeadSources() {
	const q = query(leadSourcesCollection, orderBy("name", "asc"));

	const snapshot = await getDocs(q);

	return snapshot.docs.map((document) => ({
		id: document.id,
		...document.data(),
	}));
}

export async function createLeadSource(data) {
	const docRef = await addDoc(leadSourcesCollection, {
		name: data.name,
		active: true,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});

	return docRef.id;
}

export async function updateLeadSource(sourceId, data) {
	const sourceRef = doc(db, "leadSources", sourceId);

	await updateDoc(sourceRef, {
		name: data.name,
		active: data.active,
		updatedAt: serverTimestamp(),
	});
}

export async function deleteLeadSource(sourceId) {
	// Permanent delete is acceptable because managers control source configuration.
	await deleteDoc(doc(db, "leadSources", sourceId));
}
