export default function AgentList({
	agents,
	saving,
	editingAgentId,
	editName,
	editEmail,
	onEditNameChange,
	onEditEmailChange,
	onStartEditing,
	onCancelEditing,
	onUpdateAgent,
	onDeleteAgent,
	styles,
}) {
	return (
		<div className={styles.card}>
			<h2>Agents</h2>

			{agents.length === 0 ? (
				<p>No agents yet.</p>
			) : (
				<div className={styles.agentList}>
					{agents.map((agent) => (
						<div key={agent.id} className={styles.agentItem}>
							{editingAgentId === agent.id ? (
								<>
									<input
										type="text"
										value={editName}
										onChange={(e) => onEditNameChange(e.target.value)}
										disabled={saving}
									/>

									<input
										type="email"
										value={editEmail}
										onChange={(e) => onEditEmailChange(e.target.value)}
										disabled={saving}
									/>

									<div className={styles.actions}>
										<button
											type="button"
											onClick={() => onUpdateAgent(agent.id)}
											disabled={saving}
										>
											Save
										</button>

										<button
											type="button"
											onClick={onCancelEditing}
											disabled={saving}
											className={styles.secondaryButton}
										>
											Cancel
										</button>
									</div>
								</>
							) : (
								<>
									<div>
										<strong>{agent.name || "Unnamed agent"}</strong>
										<p>{agent.email}</p>
									</div>

									<div className={styles.actions}>
										<button
											type="button"
											onClick={() => onStartEditing(agent)}
											disabled={saving}
										>
											Edit
										</button>

										<button
											type="button"
											onClick={() => onDeleteAgent(agent.id)}
											disabled={saving}
											className={styles.dangerButton}
										>
											Delete
										</button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
