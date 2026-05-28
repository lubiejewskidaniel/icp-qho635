import {
	collection,
	doc,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Fetches full user data from Firestore using their UID.

export async function getUserData(uid) {
	const userRef = doc(db, "users", uid);
	const snap = await getDoc(userRef);

	if (!snap.exists()) return null;

	return snap.data();
}

// aasign lead to agent
export async function getAgents() {
	const q = query(collection(db, "users"), where("role", "==", "agent"));

	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));
}
