/*
 * Based on the official SMTP and React documentation examples,
 * this API route uses Nodemailer to handle email sending securely
 * through environment-based SMTP configuration.
 */
import nodemailer from "nodemailer";

export async function POST(request) {
	try {
		const { to, subject, message } = await request.json();

		if (!to || !subject || !message) {
			return Response.json({ error: "Missing email fields." }, { status: 400 });
		}

		const transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: Number(process.env.SMTP_PORT || 587),
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});

		await transporter.sendMail({
			from: process.env.SMTP_FROM,
			to,
			subject,
			text: message,
			html: message.replace(/\n/g, "<br />"),
		});

		return Response.json({ success: true });
	} catch (error) {
		console.error("Email send error:", error);

		return Response.json({ error: "Could not send email." }, { status: 500 });
	}
}
