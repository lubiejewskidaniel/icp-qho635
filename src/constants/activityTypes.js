export const ACTIVITY_TYPES = {
	NOTE: "note",
	CALL: "call",
	EMAIL: "email",
	MEETING: "meeting",
	STATUS_CHANGE: "status_change",
	FOLLOW_UP: "follow_up",
	ASSIGNMENT: "assignment",
};

export const MANUAL_ACTIVITY_OPTIONS = [
	{
		value: ACTIVITY_TYPES.CALL,
		label: "Call",
	},
	{
		value: ACTIVITY_TYPES.EMAIL,
		label: "Email",
	},
	{
		value: ACTIVITY_TYPES.MEETING,
		label: "Meeting",
	},
];
