import type { Resume } from "../studio/types";

// Extracted once from resume_samples/cloud-engineer-before-optimization.pdf.
// Keep this static: pdf.js workers are unreliable inside Next's dev server.
const nurAinaResume: Resume = {
  name: "NUR AINA RAHMAN",
  title: "Cloud Engineer",
  loc: "Petaling Jaya, Selangor",
  email: "aina.rahman@example.com",
  version: "Sample · cloud-engineer-before-optimization.pdf",
  summary: "Cloud engineer supporting customers, systems, and teams across cloud infrastructure.",
  experience: [
    { role: "Cloud Engineer · Nimbus Learning", period: "06/2023 - Present", bullets: ["Delivered 15 cloud architecture solutions for seven enterprise clients.", "Built log-shipping scripts that reduced enterprise licence cost by 74%.", "Administered 51 AWS services across customer environments."] },
    { role: "Cloud Administrator · RakyatCloud", period: "02/2021 - 05/2023", bullets: ["Supported 190 servers and more than 5,000 clients.", "Migrated data and 15 applications to cloud, reducing cost by 40%."] },
    { role: "Software Engineer · Growthsi", period: "07/2019 - 01/2021", bullets: ["Built shopping-cart microservices with a cross-functional team.", "Built an integration layer for payroll providers and Microsoft ERP."] },
    { role: "Java Developer · ABC Digital", period: "01/2018 - 06/2019", bullets: [] },
    { role: "Junior Data Scientist · Insight Labs", period: "06/2016 - 12/2017", bullets: [] },
    { role: ".NET Developer Intern · ABC Digital", period: "01/2016 - 05/2016", bullets: [] }
  ],
  skills: ["AWS", "Python", "Docker", "Cloud infrastructure", "API", "SQL"]
};

export async function sampleResume() {
  return nurAinaResume;
}
