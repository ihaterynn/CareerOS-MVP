// Application Tracker domain types. Status/source/mode mirror the shared
// lowercase unions (spec §7.1); view labels/colors are derived in components.

export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "ghosted";

export type ApplicationSource = "careeros" | "linkedin" | "referral" | "other";

export type WorkMode = "hybrid" | "remote" | "onsite";

export type DueTone = "warn" | "good" | "bad" | "neutral";

export type StatusEvent = {
  title: string;
  detail: string;
  status: ApplicationStatus; // drives the timeline dot color
};

export type Contact = {
  name: string;
  role: string;
  initials: string;
};

export type Application = {
  id: string;
  role: string;
  company: string;
  short: string; // 2-letter avatar
  location: string;
  mode: WorkMode;
  salary: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  match: number | null;
  nextAction: string;
  due: string;
  dueTone: DueTone;
  contact: Contact;
  timeline: StatusEvent[];
};

// Board groups the two terminal statuses into a single "closed" column.
// Board-UI only — never persisted (spec §4).
export type BoardColumnId =
  | "saved"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "closed";

export type TrackerAnalytics = {
  avgDaysInStage: number;
  slowestStage: string;
};

export type TrackerData = {
  applications: Application[];
  analytics: TrackerAnalytics;
};

export function boardColumnOf(status: ApplicationStatus): BoardColumnId {
  return status === "rejected" || status === "ghosted" ? "closed" : status;
}
