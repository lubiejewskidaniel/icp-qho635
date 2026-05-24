import {
	signInWithEmailAndPassword,
	signOut,
	sendEmailVerification,
	reload,
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export async function login(email, password) {
	const userCredential = await signInWithEmailAndPassword(
		auth,
		email,
		password,
	);

	return userCredential.user;
}

export async function logout() {
	await signOut(auth);
}

export async function sendVerificationEmail(user) {
	if (!user) {
		throw new Error("No authenticated user.");
	}

	if (user.emailVerified) {
		return;
	}

	await sendEmailVerification(user);
}

export async function reloadCurrentUser(user) {
	if (!user) {
		throw new Error("No authenticated user.");
	}

	await reload(user);

	return user;
}
