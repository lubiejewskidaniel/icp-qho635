"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getUserData } from "@/services/users/userService";

// Context used to share authentication state across the application
const AuthContext = createContext();

// AuthProvider listens to Firebase authentication state
// and provides user,name, role and loading state to the whole app.

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [role, setRole] = useState(null);
	const [name, setName] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Listen for authentication state changes
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				setUser(null);
				setRole(null);
				setName(null);
				setLoading(false);
				return;
			}

			// Save authenticated user into state
			setUser(firebaseUser);

			try {
				// Fetch user role and name from Firestore
				const userData = await getUserData(firebaseUser.uid);

				setRole(userData?.role ?? null);
				setName(userData?.name ?? null);
			} catch (error) {
				console.error("AuthProvider: failed to fetch user role", error); // log for developer in case of error
				setRole(null); // prevent loading previous user role in case of Firebase error - safety reasons
			}

			setLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// below we share authentication state with the entire application
	return (
		<AuthContext.Provider value={{ user, role, name, loading }}>
			{children}
		</AuthContext.Provider>
	);
}

// Becouse custom hook below is just for this feature for accessing authentication context
// decided to not move to global hook folder

export function useAuth() {
	return useContext(AuthContext);
}
