"use client";

import { useEffect, useState } from "react";
import { getAgents } from "@/services/users/userService";
import {
	createAgent,
	updateAgent,
	deleteAgent,
} from "@/services/agents/agentService";

import AgentForm from "./AgentForm";
import AgentList from "./AgentList";
import styles from "./ManageAgents.module.css";

export default function ManageAgents() {
	const [agents, setAgents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [editingAgentId, setEditingAgentId] = useState(null);
	const [editName, setEditName] = useState("");
	const [editEmail, setEditEmail] = useState("");

	const loadAgents = async () => {
		try {
			const data = await getAgents();
			setAgents(data);
		} catch (err) {
			console.error("Could not load agents:", err);
			setError("Could not load agents.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAgents();
	}, []);

	const resetMessages = () => {
		setError("");
		setSuccess("");
	};

	const handleCreateAgent = async (e) => {
		e.preventDefault();
		resetMessages();

		if (!name.trim() || !email.trim() || !password.trim()) {
			setError("Name, email and password are required.");
			return;
		}

		setSaving(true);

		try {
			await createAgent({
				name: name.trim(),
				email: email.trim(),
				password: password.trim(),
			});

			setName("");
			setEmail("");
			setPassword("");
			setSuccess("Agent created successfully.");
			await loadAgents();
		} catch (err) {
			console.error("Could not create agent:", err);
			setError("Could not create agent.");
		} finally {
			setSaving(false);
		}
	};

	const startEditing = (agent) => {
		resetMessages();
		setEditingAgentId(agent.id);
		setEditName(agent.name || "");
		setEditEmail(agent.email || "");
	};

	const cancelEditing = () => {
		setEditingAgentId(null);
		setEditName("");
		setEditEmail("");
	};

	const handleUpdateAgent = async (agentId) => {
		resetMessages();

		if (!editName.trim() || !editEmail.trim()) {
			setError("Name and email are required.");
			return;
		}

		setSaving(true);

		try {
			await updateAgent(agentId, {
				name: editName.trim(),
				email: editEmail.trim(),
			});

			setSuccess("Agent updated successfully.");
			cancelEditing();
			await loadAgents();
		} catch (err) {
			console.error("Could not update agent:", err);
			setError("Could not update agent.");
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteAgent = async (agentId) => {
		resetMessages();

		const confirmed = window.confirm(
			"Are you sure you want to delete this agent? Their assigned leads will become unassigned.",
		);

		if (!confirmed) return;

		setSaving(true);

		try {
			await deleteAgent(agentId);
			setSuccess(
				"Agent deleted successfully. Assigned leads were set to unassigned.",
			);
			await loadAgents();
		} catch (err) {
			console.error("Could not delete agent:", err);
			setError("Could not delete agent.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <p>Loading agents...</p>;

	return (
		<section className={styles.wrapper}>
			<div className={styles.header}>
				<h1>Manage Agents</h1>
				<p>Create, edit and remove sales agents.</p>
			</div>

			{error && <p className={styles.error}>{error}</p>}
			{success && <p className={styles.success}>{success}</p>}

			<div className={styles.grid}>
				<AgentForm
					name={name}
					email={email}
					password={password}
					saving={saving}
					onNameChange={setName}
					onEmailChange={setEmail}
					onPasswordChange={setPassword}
					onSubmit={handleCreateAgent}
					styles={styles}
				/>

				<AgentList
					agents={agents}
					saving={saving}
					editingAgentId={editingAgentId}
					editName={editName}
					editEmail={editEmail}
					onEditNameChange={setEditName}
					onEditEmailChange={setEditEmail}
					onStartEditing={startEditing}
					onCancelEditing={cancelEditing}
					onUpdateAgent={handleUpdateAgent}
					onDeleteAgent={handleDeleteAgent}
					styles={styles}
				/>
			</div>
		</section>
	);
}
