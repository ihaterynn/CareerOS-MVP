// DISPLAY-ONLY seed data ported from the reference design (CareerOS Candidate.dc.html
// state.apps). Semantic values normalized to the shared lowercase unions; presentation
// (labels, colors, avatar styling) is derived in components. Doubles as local-dev seed
// when Supabase lands (spec §8).

import type { Application, TrackerData } from "./types";

export const trackerMock: TrackerData = {
  analytics: { avgDaysInStage: 6.2, slowestStage: "screening" },
  applications: [
    {
      id: "cempaka",
      role: "Senior SWE, Platform",
      company: "Cempaka Digital",
      short: "Ce",
      location: "KLCC",
      mode: "hybrid",
      salary: "RM 12–15k",
      source: "careeros",
      status: "interview",
      match: 91,
      nextAction: "Prep system-design answers",
      due: "Due tomorrow",
      dueTone: "warn",
      contact: { name: "Farah Idris", role: "Eng Manager", initials: "FI" },
      timeline: [
        { title: "Interview scheduled", detail: "Jul 22 · panel round", status: "interview" },
        { title: "Screening call", detail: "Jul 15", status: "screening" },
        { title: "Applied via CareerOS", detail: "Jun 14 · résumé v3", status: "applied" }
      ]
    },
    {
      id: "ringgitpay",
      role: "Data Product Engineer",
      company: "RinggitPay",
      short: "Ri",
      location: "Bangsar South",
      mode: "hybrid",
      salary: "RM 10.5–13.5k",
      source: "linkedin",
      status: "screening",
      match: 87,
      nextAction: "Follow up — recruiter quiet",
      due: "Due in 2 days",
      dueTone: "warn",
      contact: { name: "Daniel Tan", role: "Recruiter", initials: "DT" },
      timeline: [
        { title: "Recruiter screen", detail: "Jul 18", status: "screening" },
        { title: "Applied via LinkedIn", detail: "Jul 2", status: "applied" }
      ]
    },
    {
      id: "grab",
      role: "Software Engineer",
      company: "Grab",
      short: "Gr",
      location: "KL Sentral",
      mode: "hybrid",
      salary: "RM 11–14k",
      source: "linkedin",
      status: "screening",
      match: 82,
      nextAction: "Complete take-home",
      due: "Due in 4 days",
      dueTone: "warn",
      contact: { name: "Mei Ling", role: "Recruiter", initials: "ML" },
      timeline: [
        { title: "Take-home sent", detail: "Jul 19", status: "screening" },
        { title: "Applied via LinkedIn", detail: "Jul 10", status: "applied" }
      ]
    },
    {
      id: "setel",
      role: "Platform Engineer",
      company: "Setel",
      short: "St",
      location: "KL",
      mode: "hybrid",
      salary: "RM 14–16k",
      source: "referral",
      status: "offer",
      match: 88,
      nextAction: "Compare with current comp",
      due: "Decide by Aug 2",
      dueTone: "good",
      contact: { name: "Aziz Karim", role: "Hiring Lead", initials: "AK" },
      timeline: [
        { title: "Offer received", detail: "Jul 21 · RM 14–16k", status: "offer" },
        { title: "Final round", detail: "Jul 12", status: "interview" },
        { title: "Referred by contact", detail: "Jun 28", status: "applied" }
      ]
    },
    {
      id: "merdekapay",
      role: "Backend, Payments",
      company: "MerdekaPay",
      short: "Me",
      location: "Mont Kiara",
      mode: "onsite",
      salary: "RM 11–14k",
      source: "careeros",
      status: "applied",
      match: 73,
      nextAction: "Await screening",
      due: "Applied Jul 20",
      dueTone: "neutral",
      contact: { name: "—", role: "No contact yet", initials: "?" },
      timeline: [{ title: "Applied via CareerOS", detail: "Jul 20 · résumé v3", status: "applied" }]
    },
    {
      id: "nusantara",
      role: "ML Engineer, Routing",
      company: "Nusantara Cloud",
      short: "Nu",
      location: "Cyberjaya",
      mode: "remote",
      salary: "RM 12.5–16k",
      source: "referral",
      status: "applied",
      match: 78,
      nextAction: "Add MLOps portfolio evidence",
      due: "Applied Jul 16",
      dueTone: "neutral",
      contact: { name: "Wei Sheng", role: "Referrer", initials: "WS" },
      timeline: [{ title: "Applied via referral", detail: "Jul 16", status: "applied" }]
    },
    {
      id: "ipay88",
      role: "Senior Backend",
      company: "iPay88",
      short: "iP",
      location: "Bukit Jalil",
      mode: "hybrid",
      salary: "RM 12–15k",
      source: "careeros",
      status: "saved",
      match: null,
      nextAction: "Draft tailored résumé",
      due: "Saved Jul 22",
      dueTone: "neutral",
      contact: { name: "—", role: "Not applied", initials: "?" },
      timeline: [{ title: "Saved from search", detail: "Jul 22", status: "saved" }]
    },
    {
      id: "storehub",
      role: "Backend Engineer",
      company: "StoreHub",
      short: "Sh",
      location: "PJ",
      mode: "hybrid",
      salary: "RM 10–13k",
      source: "linkedin",
      status: "saved",
      match: null,
      nextAction: "Review JD fit",
      due: "Saved Jul 21",
      dueTone: "neutral",
      contact: { name: "—", role: "Not applied", initials: "?" },
      timeline: [{ title: "Saved from LinkedIn", detail: "Jul 21", status: "saved" }]
    },
    {
      id: "bigpay",
      role: "Backend Engineer",
      company: "BigPay",
      short: "Bi",
      location: "KL",
      mode: "onsite",
      salary: "RM 11–13k",
      source: "linkedin",
      status: "rejected",
      match: 69,
      nextAction: "Closed",
      due: "Rejected Jul 10",
      dueTone: "bad",
      contact: { name: "HR Team", role: "Recruiting", initials: "HR" },
      timeline: [
        { title: "Rejected after screen", detail: "Jul 10", status: "rejected" },
        { title: "Applied via LinkedIn", detail: "Jun 30", status: "applied" }
      ]
    },
    {
      id: "carsome",
      role: "Full-stack Engineer",
      company: "Carsome",
      short: "Ca",
      location: "Mutiara Damansara",
      mode: "hybrid",
      salary: "RM 10–13k",
      source: "other",
      status: "ghosted",
      match: 71,
      nextAction: "No response — follow up or close",
      due: "Applied May 28",
      dueTone: "warn",
      contact: { name: "—", role: "No response", initials: "?" },
      timeline: [
        { title: "No response (ghosted)", detail: "Since Jun 12", status: "ghosted" },
        { title: "Applied externally", detail: "May 28", status: "applied" }
      ]
    }
  ]
};

export function trackerDataOrMock(applications: Application[]): TrackerData {
  return applications.length ? { applications, analytics: { avgDaysInStage: null, slowestStage: null } } : trackerMock;
}
