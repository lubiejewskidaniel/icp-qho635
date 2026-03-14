import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Fetches the user's role from Firestore using their UID.

export async function getUserRole(uid) {
	const userRef = doc(db, "users", uid);
	const snap = await getDoc(userRef);

	if (!snap.exists()) return null;

	return snap.data().role;
}
