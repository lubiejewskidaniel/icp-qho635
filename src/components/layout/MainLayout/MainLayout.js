import styles from "./MainLayout.module.css";
import Navbar from "@/components/layout/Navbar/Navbar";
import Footer from "@/components/layout/Footer/Footer";
import BackToTop from "@/components/ui/BackToTop/BackToTop";
import CookieBanner from "@/components/ui/CookieBanner/CookieBanner";

export default function MainLayout({ children }) {
	return (
		<div className={styles.wrapper}>
			<Navbar />
			<main className={styles.main}>{children}</main>
			<Footer />
			<BackToTop />
			<CookieBanner />
		</div>
	);
}
