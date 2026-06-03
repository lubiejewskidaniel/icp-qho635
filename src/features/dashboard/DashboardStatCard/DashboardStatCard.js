import styles from "./DashboardStatCard.module.css";

export default function DashboardStatCard({ title, value, subtitle }) {
	return (
		<div className={styles.card}>
			<p className={styles.title}>{title}</p>
			<p className={styles.value}>{value}</p>
			{subtitle && <p className={styles.subtitle}>{subtitle}</p>}
		</div>
	);
}
