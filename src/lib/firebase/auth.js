import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./config";

export async function login(email, password) {
	const userCredential = await signInWithEmailAndPassword(
		auth,
		email,
		password,
	);

	return userCredential.user;
}
