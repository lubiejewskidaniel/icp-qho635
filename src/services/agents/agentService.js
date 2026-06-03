export async function createAgent({ name, email, password }) {
	const response = await fetch("/api/agents", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, email, password }),
	});

	if (!response.ok) {
		throw new Error("Could not create agent.");
	}

	return response.json();
}

export async function updateAgent(agentId, { name, email }) {
	const response = await fetch(`/api/agents/${agentId}`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ name, email }),
	});

	if (!response.ok) {
		throw new Error("Could not update agent.");
	}

	return response.json();
}

export async function deleteAgent(agentId) {
	const response = await fetch(`/api/agents/${agentId}`, {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Could not delete agent.");
	}

	return response.json();
}
