import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Fetches full user data from Firestore using their UID.

export async function getUserData(uid) {
	const userRef = doc(db, "users", uid);
	const snap = await getDoc(userRef);

	if (!snap.exists()) return null;

	return snap.data();
}
