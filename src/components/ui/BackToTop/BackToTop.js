"use client";
import { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

export default function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const main = document.querySelector("main");

		const handleScroll = () => {
			if (main.scrollTop > 200) {
				setVisible(true);
			} else {
				setVisible(false);
			}
		};

		main.addEventListener("scroll", handleScroll);
		return () => main.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToTop = () => {
		const main = document.querySelector("main");
		main.scrollTo({ top: 0, behavior: "smooth" });
	};

	if (!visible) return null;

	return (
		<button className={styles.button} onClick={scrollToTop}>
			↑
		</button>
	);
}
