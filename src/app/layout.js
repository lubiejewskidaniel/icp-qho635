import { AuthProvider } from "@/providers/AuthProvider/AuthProvider";
import "../styles/globals.css";
import MainLayout from "@/components/layout/MainLayout/MainLayout";

export const metadata = {
	title: {
		default: "PLMS - Property Lead Management System",
		template: "%s | PLMS",
	},

	description:
		"PLMS gives real estate teams the clarity, speed and control to close more property deals.",

	authors: [
		{ name: "Daniel Lubiejewski" },
		{ name: "Maria Vladimirova" },
		{ name: "Giordano Zanolla" },
		{ name: "Elena Michaela Vintilla" },
		{ name: "Kacper Zaleski" },
	],

	icons: {
		icon: "/icon.svg",
	},

	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className="app">
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
