import MainLayout from "@/components/layout/MainLayout/MainLayout";

export default function PublicLayout({ children }) {
	return (
		<MainLayout>
			<main>{children}</main>
		</MainLayout>
	);
}
