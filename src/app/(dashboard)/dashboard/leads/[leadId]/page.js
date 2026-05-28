import LeadDetails from "@/features/leads/LeadDetails/LeadDetails";

export const metadata = {
	title: "Lead Details",
};

export default async function LeadDetailsPage({ params }) {
	const { leadId } = await params;

	return <LeadDetails leadId={leadId} />;
}
