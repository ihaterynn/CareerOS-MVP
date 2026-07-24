import { getTrackerData } from "@/modules/candidate/tracker/queries";
import { TrackerPanel } from "@/modules/candidate/tracker/components/tracker-panel";

// Server Component: fetch on the server, pass typed data to the client panel.
export default async function TrackerPage() {
  const data = await getTrackerData();
  if (data.applications.length === 0) {
    return (
      <div className="anim-fade-up" style={{ padding: "60px 0", textAlign: "center", color: "var(--text-2)" }}>
        <div className="kicker" style={{ color: "var(--accent)" }}>Application Tracker</div>
        <h1 className="ser" style={{ fontSize: 24, margin: "10px 0 6px" }}>No applications yet</h1>
        <p style={{ fontSize: 13 }}>Add your first application or apply through CareerOS to start tracking.</p>
      </div>
    );
  }
  return <TrackerPanel data={data} />;
}
