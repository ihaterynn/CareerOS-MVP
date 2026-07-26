import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const roles = [
  ["Senior Product Designer", ["Figma", "Research", "Design systems"]],
  ["Backend Engineer", ["TypeScript", "Node.js", "PostgreSQL"]],
  ["Data Analyst", ["SQL", "Python", "Tableau"]]
];

const uuid = (value) => {
  const hex = createHash("sha256").update(value).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

export function buildSeedRows(employerId) {
  return Array.from({ length: 1000 }, (_, index) => {
    const [role, skills] = roles[index % roles.length];
    const gold = index < 24;
    const validLowFit = index >= 24 && index < 100;
    const status = gold || validLowFit ? null : ["parse failed", "duplicate fingerprint", "missing contact"][index % 3];

    return {
      id: uuid(`careeros-cv-seed:${index}`),
      employer_id: employerId,
      name: `Seeded Candidate ${String(index + 1).padStart(4, "0")}`,
      source: `seeded-cv-${String(index + 1).padStart(4, "0")}.pdf`,
      role,
      location: ["Kuala Lumpur", "Penang", "Singapore"][index % 3],
      years: gold ? 6 : status ? 0 : 2,
      skills: gold ? skills : status ? [] : ["Excel"],
      confidence: status ? 32 : 96,
      status
    };
  });
}

async function seed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const employerId = process.env.CAREEROS_EMPLOYER_ID;
  if (!url || !key || !employerId) throw new Error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and CAREEROS_EMPLOYER_ID are required");

  const response = await fetch(`${url}/rest/v1/cv_ingestion_records?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(buildSeedRows(employerId))
  });

  if (!response.ok) throw new Error(`Supabase seed failed: ${response.status} ${await response.text()}`);
  console.log("Seeded 1,000 CV records: 100 Silver, 24 Gold.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await seed();
