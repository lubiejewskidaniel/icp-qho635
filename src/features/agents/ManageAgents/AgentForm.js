export default function AgentForm({
	name,
	email,
	password,
	saving,
	onNameChange,
	onEmailChange,
	onPasswordChange,
	onSubmit,
	styles,
}) {
	return (
		<form className={styles.card} onSubmit={onSubmit}>
			<h2>Add Agent</h2>

			<label>Name</label>
			<input
				type="text"
				value={name}
				onChange={(e) => onNameChange(e.target.value)}
				placeholder="Agent name"
				disabled={saving}
			/>

			<label>Email</label>
			<input
				type="email"
				value={email}
				onChange={(e) => onEmailChange(e.target.value)}
				placeholder="agent@example.com"
				disabled={saving}
			/>

			<label>Temporary password</label>
			<input
				type="password"
				value={password}
				onChange={(e) => onPasswordChange(e.target.value)}
				placeholder="Minimum 6 characters"
				disabled={saving}
			/>

			<button type="submit" disabled={saving}>
				{saving ? "Saving..." : "Create Agent"}
			</button>
		</form>
	);
}
