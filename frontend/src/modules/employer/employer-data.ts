import type { EmployerModuleId, NavigationItem } from "@careeros/shared";

export type TalentMatch = {
  id: string;
  name: string;
  avatar: string;
  currentTrack: string;
  sourceField: string;
  location: string;
  summary: string;
  score: number;
  educationFit: number;
  skillFit: number;
  experienceFit: number;
  interestSignal: number;
  skills: string[];
  education: string;
  experience: string[];
  certifications: string[];
  portfolio: string[];
  careerInterests: string[];
  learningSignals: string[];
  dnaSignals: string[];
  mobilityIntent: string;
  highlights: string[];
  missingSignals: string[];
};

export type RetentionSignal = {
  employee: string;
  role: string;
  team: string;
  score: number;
  optOut: boolean;
  factors: Array<{
    label: string;
    weight: string;
    contribution: number;
    detail: string;
  }>;
};

export type OnboardingPrediction = {
  hire: string;
  role: string;
  successProbability: number;
  timeToImpact: string;
  turnoverRisk: number;
  nextMilestone: string;
  drivers: string[];
};

export type OnboardingTaskType = "Automated" | "Manual" | "Document";
export type OnboardingTaskStatus = "Done" | "In progress" | "Scheduled";

export type OnboardingTask = {
  title: string;
  owner: string;
  due: string;
  type: OnboardingTaskType;
  status: OnboardingTaskStatus;
};

export type OnboardingPhase = {
  name: string;
  window: string;
  goal: string;
  tasks: OnboardingTask[];
};

export type OnboardingWorkflow = {
  hire: string;
  role: string;
  startDate: string;
  manager: string;
  buddy: string;
  automatedCount: number;
  totalCount: number;
  phases: OnboardingPhase[];
};

/**
 * Builds an automated onboarding workflow from a hire's prediction. Standard
 * phases are auto-scaffolded; role-specific milestones are injected from the
 * predictor so each new hire gets a tailored, mostly-automated plan.
 */
export function buildOnboardingWorkflow(prediction: OnboardingPrediction): OnboardingWorkflow {
  const buddyByRole: Record<string, string> = {
    "Platform Engineer": "Aisyah (Senior Platform)",
    "Data Product Engineer": "Wei Sheng (Data Products)",
    "Technical Consultant": "Aina (Advisory)"
  };
  const managerByRole: Record<string, string> = {
    "Platform Engineer": "Farah Idris",
    "Data Product Engineer": "Ravi Kumar",
    "Technical Consultant": "Lydia Tan"
  };
  const manager = managerByRole[prediction.role];
  const buddy = buddyByRole[prediction.role];

  const phases: OnboardingPhase[] = [
    {
      name: "Pre-boarding",
      window: "Day -5 → Day 0",
      goal: "Everything ready before day one, without manual chasing.",
      tasks: [
        ...(manager ? [] : [{ title: "Assign hiring manager", owner: "HR Ops", due: "Day -5", type: "Manual" as const, status: "Scheduled" as const }]),
        ...(buddy ? [] : [{ title: "Assign onboarding buddy", owner: "HR Ops", due: "Day -5", type: "Manual" as const, status: "Scheduled" as const }]),
        { title: "Signed offer + tax and bank forms collected", owner: "HR Ops", due: "Day -5", type: "Document", status: "Done" },
        { title: "Laptop + accounts provisioned (SSO, email, repos)", owner: "IT automation", due: "Day -3", type: "Automated", status: "Done" },
        { title: "Role-based access + tooling licenses granted", owner: "IT automation", due: "Day -2", type: "Automated", status: "Done" },
        { title: `Welcome pack + first-week agenda sent to ${prediction.hire.split(" ")[0]}`, owner: "Onboarding bot", due: "Day -1", type: "Automated", status: "Done" },
        ...(buddy ? [{ title: `Onboarding buddy assigned: ${buddy}`, owner: "Onboarding bot", due: "Day -1", type: "Automated" as const, status: "Done" as const }] : [])
      ]
    },
    {
      name: "Week one",
      window: "Day 1 → Day 5",
      goal: "Orientation, environment, and first low-risk contribution.",
      tasks: [
        { title: "Company + team orientation session", owner: "HR Ops", due: "Day 1", type: "Manual", status: "In progress" },
        { title: "Dev/work environment verified via setup checklist", owner: "Onboarding bot", due: "Day 2", type: "Automated", status: "In progress" },
        { title: "Intro meetings auto-scheduled with 5 key collaborators", owner: "Onboarding bot", due: "Day 2", type: "Automated", status: "Scheduled" },
        { title: "Shadow a live workflow with buddy", owner: buddyByRole[prediction.role] ?? "Onboarding buddy", due: "Day 4", type: "Manual", status: "Scheduled" }
      ]
    },
    {
      name: "First 30 days",
      window: "Day 6 → Day 30",
      goal: `Reach the first real milestone: ${prediction.nextMilestone.toLowerCase()}.`,
      tasks: [
        { title: `Milestone kickoff: ${prediction.nextMilestone}`, owner: manager ?? "Assignment needed", due: "Day 7", type: "Manual", status: "Scheduled" },
        { title: "Stakeholder map + goals doc auto-generated for review", owner: "Onboarding bot", due: "Day 8", type: "Automated", status: "Scheduled" },
        { title: "Weekly 1:1 cadence auto-created with manager", owner: "Onboarding bot", due: "Day 6", type: "Automated", status: "Scheduled" },
        { title: `Targeted upskilling assigned for known ramp gap`, owner: "Onboarding bot", due: "Day 10", type: "Automated", status: "Scheduled" }
      ]
    },
    {
      name: "Ramp to impact",
      window: `Day 31 → ${prediction.timeToImpact}`,
      goal: `First tangible impact around ${prediction.timeToImpact}; de-risk early turnover.`,
      tasks: [
        { title: "Deliver first owned piece of work", owner: manager ?? "Assignment needed", due: prediction.timeToImpact, type: "Manual", status: "Scheduled" },
        { title: "30/60 pulse check + sentiment survey", owner: "Onboarding bot", due: "Day 30 / 60", type: "Automated", status: "Scheduled" },
        { title: "Ownership handoff + probation review scheduled", owner: "HR Ops", due: "Day 75", type: "Manual", status: "Scheduled" }
      ]
    }
  ];

  const allTasks = phases.flatMap((phase) => phase.tasks);

  return {
    hire: prediction.hire,
    role: prediction.role,
    startDate: "Mon, 3 Aug 2026",
    manager: manager ?? "Assignment needed",
    buddy: buddy ?? "Assignment needed",
    automatedCount: allTasks.filter((task) => task.type === "Automated").length,
    totalCount: allTasks.length,
    phases
  };
}

export type SkillHeatmapPoint = {
  skill: string;
  location: string;
  x: number;
  y: number;
  demand: number;
  supply: number;
  salaryPressure: "Low" | "Medium" | "High";
};

export type AttritionCluster = {
  label: string;
  share: string;
  risk: number;
  rootCause: string;
  evidence: string[];
};

export type CareerRootBranch = {
  field: string;
  fitReason: string;
  thresholdRelaxed: string;
  applicants: TalentMatch[];
};

export type ApplicationReview = {
  id: string;
  candidate: string;
  role: string;
  score: number;
  status: "New" | "Shortlisted" | "Rejected";
  reasonRequired: string;
  feedbackTrace: string[];
};

export type RoleTalentBoard = {
  id: string;
  title: string;
  team: string;
  location: string;
  priority: "Urgent" | "Active" | "Pipeline";
  openings: number;
  hiringGoal: string;
  roleSignals: string[];
  applicants: TalentMatch[];
};

export type InterviewQuestion = {
  prompt: string;
  probes: string;
  lookFor: string;
};

export type InterviewKit = {
  headline: string;
  categories: Array<{
    id: "role" | "personality" | "culture";
    label: string;
    basis: string;
    questions: InterviewQuestion[];
  }>;
};

/**
 * Dynamic interview kit generator. In the prototype this is deterministic, but
 * every question is derived from the candidate's own resume + Career DNA
 * (skills, gaps, portfolio, DNA signals, interests) and the target role, so the
 * output reads as if it were AI-generated per candidate.
 */
export function generateInterviewKit(candidate: TalentMatch, roleTitle: string): InterviewKit {
  const topSkill = candidate.skills[0] ?? "your core stack";
  const secondSkill = candidate.skills[1] ?? candidate.skills[0] ?? "an adjacent tool";
  const gap = candidate.missingSignals[0] ?? "an area outside your current evidence";
  const secondGap = candidate.missingSignals[1] ?? gap;
  const project = candidate.portfolio[0] ?? "a recent project";
  const interest = candidate.careerInterests[0] ?? "this direction";
  const dnaTrait = candidate.dnaSignals[0] ?? "how you work";

  return {
    headline: `Generated from ${candidate.name.split(" ")[0]}'s resume, Career DNA, and the ${roleTitle} requirements.`,
    categories: [
      {
        id: "role",
        label: "Role & technical",
        basis: `Anchored to ${topSkill}, ${secondSkill}, and the gaps flagged on this profile.`,
        questions: [
          {
            prompt: `Walk me through "${project}". Which decisions would you make differently at ${roleTitle} scale?`,
            probes: "Depth behind portfolio evidence, not just the headline result.",
            lookFor: "Specific tradeoffs, metrics, and awareness of limits."
          },
          {
            prompt: `Your profile is strong on ${topSkill} but lighter on ${gap}. How would you close that gap in your first 90 days here?`,
            probes: `Self-awareness about the ${gap} gap and a credible ramp plan.`,
            lookFor: "A concrete learning path rather than a vague promise."
          },
          {
            prompt: `Design a small system that uses ${secondSkill} to handle a sudden 10x load. Where does it break first?`,
            probes: "Applied depth and failure-mode thinking.",
            lookFor: `Reasoning that connects ${secondSkill} to bottlenecks and mitigation.`
          }
        ]
      },
      {
        id: "personality",
        label: "Personality",
        basis: `Built around the DNA signal "${dnaTrait}" and the ${secondGap} gap.`,
        questions: [
          {
            prompt: "Tell me about a time you were wrong about a technical decision. How did you find out, and what changed after?",
            probes: "Ego strength, feedback response, and growth mindset.",
            lookFor: "Ownership without defensiveness; a changed behavior."
          },
          {
            prompt: `Your DNA reads as "${dnaTrait}". When has that strength worked against you?`,
            probes: "Honest self-modeling and ability to flex.",
            lookFor: "A real example plus a compensating habit."
          },
          {
            prompt: "Describe how you work when a problem has no obvious owner and everyone is busy.",
            probes: "Initiative, resilience, and bias to action under ambiguity.",
            lookFor: "Proactive framing rather than waiting for direction."
          }
        ]
      },
      {
        id: "culture",
        label: "Culture fit",
        basis: `Cross-checked against stated interest in ${interest} and this candidate's mobility intent.`,
        questions: [
          {
            prompt: `You've shown strong interest in ${interest}. How does this role fit the next three years you want?`,
            probes: "Alignment between candidate intent and role reality.",
            lookFor: "Motivation that this role genuinely serves, reducing flight risk."
          },
          {
            prompt: "What does a healthy disagreement with a manager look like to you?",
            probes: "Norms around feedback, hierarchy, and psychological safety.",
            lookFor: "Direct but respectful; values evidence over seniority."
          },
          {
            prompt: "When you join a new team, what's the first thing you do to earn trust?",
            probes: "Collaboration style and onboarding instincts.",
            lookFor: "Listening and small early wins over grand gestures."
          }
        ]
      }
    ]
  };
}

export const employerModules: Array<NavigationItem<EmployerModuleId>> = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Hiring health, retention risk, onboarding predictions, and review workload."
  },
  {
    id: "career-root",
    label: "Career Root",
    description: "Inverse career tree showing where strong candidates can come from."
  },
  {
    id: "talent",
    label: "Hiring Pipeline",
    description: "Role matching, candidate shortlisting, interview preparation, and structured hiring decisions."
  },
  {
    id: "ingestion",
    label: "CV Ingestion",
    description: "Run a submitted CV batch through validation, matching, and trusted-candidate aggregation."
  },
  {
    id: "retention",
    label: "Retention",
    description: "Explainable retention risk signals with candidate opt-out awareness."
  },
  {
    id: "onboarding",
    label: "Onboarding",
    description: "Automated onboarding workflows with success prediction, milestones, and ramp-risk."
  },
  {
    id: "heatmap",
    label: "Skill Heatmap",
    description: "Demand, supply, salary pressure, and talent availability by location."
  },
  {
    id: "attrition",
    label: "Attrition",
    description: "Root-cause clusters from exit, promotion, salary, and engagement patterns."
  },
  {
    id: "review",
    label: "Review",
    description: "Shortlist or reject applicants with mandatory feedback reasons."
  }
];

export const employerMetrics = [
  { label: "Open roles", value: "18", detail: "6 urgent requisitions" },
  { label: "High matches", value: "42", detail: "Composite score above 85" },
  { label: "Retention alerts", value: "9", detail: "3 high-risk teams" },
  { label: "Onboarding risk", value: "14%", detail: "New hire ramp risk" }
];

export const talentMatches: TalentMatch[] = [
  {
    id: "tm-aishah",
    name: "Nur Aina Rahman",
    avatar: "AR",
    currentTrack: "Software Engineer",
    sourceField: "Computer Science",
    location: "Petaling Jaya",
    summary: "Backend engineer with platform ownership, logistics optimization work, and strong evidence for senior product-infrastructure roles.",
    score: 91,
    educationFit: 88,
    skillFit: 92,
    experienceFit: 89,
    interestSignal: 94,
    skills: ["TypeScript", "Python", "AWS", "PostgreSQL", "Event-driven APIs", "Route optimization"],
    education: "B.CompSc, Universiti Malaya",
    experience: ["3.5 years backend platform ownership", "Led reliability fixes for high-volume routing workflows"],
    certifications: ["AWS Cloud Practitioner", "Coursera: Distributed Systems"],
    portfolio: ["Fleet route optimizer", "Observability dashboard", "API cost reduction case study"],
    careerInterests: ["Platform engineering", "Technical consulting", "Data product infrastructure"],
    learningSignals: ["Completed 18 hours of cloud courses this month", "Saved 4 senior platform roles"],
    dnaSignals: ["High systems thinking", "Strong implementation evidence", "Moderate architecture review exposure"],
    mobilityIntent: "High intent: recurring activity on senior backend and technical consulting paths",
    highlights: ["Backend platform ownership", "Route optimization portfolio", "AWS certification"],
    missingSignals: ["Distributed systems depth", "Architecture review evidence"]
  },
  {
    id: "tm-daniel",
    name: "Daniel Lim",
    avatar: "DL",
    currentTrack: "Operations Analyst",
    sourceField: "Economics",
    location: "Bangsar South",
    summary: "Operations analyst with quantitative economics training, SQL-heavy work, and strong adjacent signals for consulting and data product roles.",
    score: 86,
    educationFit: 79,
    skillFit: 84,
    experienceFit: 88,
    interestSignal: 93,
    skills: ["SQL", "Python notebooks", "Process redesign", "Forecasting", "Stakeholder mapping", "Tableau"],
    education: "B.Economics, University of Nottingham Malaysia",
    experience: ["2.8 years operations analytics", "Reduced SLA breach patterns through workflow redesign"],
    certifications: ["Google Data Analytics", "Coursera: Business Analytics"],
    portfolio: ["Fulfilment bottleneck analysis", "Ops dashboard", "Consulting case teardown"],
    careerInterests: ["Technology consulting", "Product analytics", "Revenue operations"],
    learningSignals: ["Saved 6 consulting vacancies", "Practicing product case interviews weekly"],
    dnaSignals: ["High commercial reasoning", "Strong analytical translation", "Emerging technical implementation"],
    mobilityIntent: "Very high intent: consulting and analyst-to-product routes repeatedly explored",
    highlights: ["SQL-heavy operations work", "Process redesign case", "Strong consulting interest"],
    missingSignals: ["Production engineering exposure", "Cloud certification"]
  },
  {
    id: "tm-sara",
    name: "Sara Chong",
    avatar: "SC",
    currentTrack: "Product Associate",
    sourceField: "Business",
    location: "KLCC",
    summary: "Product associate with research, analytics, and portfolio evidence that maps well into data product and customer-facing technology tracks.",
    score: 83,
    educationFit: 76,
    skillFit: 81,
    experienceFit: 85,
    interestSignal: 90,
    skills: ["Product metrics", "User research", "SQL basics", "Experiment design", "Figma", "Dashboard storytelling"],
    education: "B.Business Analytics, Monash University Malaysia",
    experience: ["2.2 years product operations", "Owned onboarding funnel analysis for consumer app"],
    certifications: ["Product Analytics Micro-Credential", "Coursera: SQL for Data Science"],
    portfolio: ["Activation funnel teardown", "Data dashboard prototype", "User research synthesis"],
    careerInterests: ["Data product engineering", "Solutions consulting", "Growth product"],
    learningSignals: ["Completed SQL course path", "Saved 3 data product roles and 2 technical consultant roles"],
    dnaSignals: ["High user empathy", "Strong business-context translation", "Developing backend confidence"],
    mobilityIntent: "Medium-high intent: focused on product-adjacent technical paths",
    highlights: ["Product metrics", "User research", "Data dashboard portfolio"],
    missingSignals: ["Backend APIs", "System design basics"]
  }
];

export const roleTalentBoards: RoleTalentBoard[] = [
  {
    id: "role-platform",
    title: "Senior Platform Engineer",
    team: "Core Infrastructure",
    location: "Klang Valley",
    priority: "Urgent",
    openings: 2,
    hiringGoal: "Stabilize platform reliability while scaling internal tooling and backend architecture ownership.",
    roleSignals: ["Backend APIs", "Cloud ownership", "Observability", "System design"],
    applicants: [
      talentMatches[0],
      {
        ...talentMatches[1],
        id: "tm-daniel-platform",
        summary: "Operations analyst with strong systems-adjacent process redesign evidence and unusual upside for platform consulting bridges.",
        score: 78,
        educationFit: 73,
        skillFit: 76,
        experienceFit: 81,
        interestSignal: 90,
        highlights: ["Strong analytics translation", "High systems curiosity", "Consulting-style stakeholder handling"],
        missingSignals: ["Production backend delivery", "Infrastructure operations exposure"],
        mobilityIntent: "High intent: repeatedly exploring platform-adjacent consulting and technical operations roles"
      },
      {
        ...talentMatches[2],
        id: "tm-sara-platform",
        summary: "Product associate with strong learning velocity and customer context, but still earlier on direct infrastructure readiness.",
        score: 71,
        educationFit: 72,
        skillFit: 69,
        experienceFit: 74,
        interestSignal: 84,
        highlights: ["Cross-functional product context", "Learning momentum", "Good internal tooling empathy"],
        missingSignals: ["Backend APIs", "Infrastructure fundamentals"],
        mobilityIntent: "Medium intent: platform is exploratory rather than first-choice today"
      }
    ]
  },
  {
    id: "role-consulting",
    title: "Technology Consultant",
    team: "Solutions Advisory",
    location: "Kuala Lumpur",
    priority: "Active",
    openings: 3,
    hiringGoal: "Grow client-facing technical discovery capacity across pre-sales, transformation scoping, and solution design.",
    roleSignals: ["Client discovery", "Presentation skill", "Business analysis", "Technical translation"],
    applicants: [
      {
        ...talentMatches[1],
        id: "tm-daniel-consulting",
        score: 91,
        educationFit: 86,
        skillFit: 88,
        experienceFit: 90,
        interestSignal: 96,
        highlights: ["Consulting interest", "Operations redesign cases", "Strong SQL-backed storytelling"],
        missingSignals: ["Formal cloud credential", "Client workshop artifacts"],
        mobilityIntent: "Very high intent: this is the clearest target role in his current exploration"
      },
      {
        ...talentMatches[2],
        id: "tm-sara-consulting",
        score: 87,
        educationFit: 82,
        skillFit: 84,
        experienceFit: 86,
        interestSignal: 92,
        highlights: ["Product storytelling", "Research synthesis", "Customer-facing communication"],
        missingSignals: ["Technical solution framing depth", "Delivery case evidence"],
        mobilityIntent: "High intent: saved multiple solutions and consultant pathways"
      },
      {
        ...talentMatches[0],
        id: "tm-aishah-consulting",
        summary: "Backend engineer with the technical credibility to advise clients, especially on infrastructure-heavy solution design.",
        score: 84,
        educationFit: 80,
        skillFit: 90,
        experienceFit: 83,
        interestSignal: 85,
        highlights: ["Technical credibility", "Architecture-adjacent exposure", "Strong delivery ownership"],
        missingSignals: ["Client workshop portfolio", "Commercial framing examples"],
        mobilityIntent: "Moderate-high intent: consulting is attractive when paired with technical depth"
      }
    ]
  },
  {
    id: "role-data-product",
    title: "Data Product Engineer",
    team: "Growth Analytics",
    location: "Hybrid",
    priority: "Pipeline",
    openings: 1,
    hiringGoal: "Blend analytics, experimentation, and product thinking into a data product squad shipping internal intelligence tools.",
    roleSignals: ["SQL pipelines", "Experimentation", "Data storytelling", "Product metrics"],
    applicants: [
      {
        ...talentMatches[2],
        id: "tm-sara-data-product",
        score: 89,
        educationFit: 84,
        skillFit: 86,
        experienceFit: 88,
        interestSignal: 94,
        highlights: ["Product metrics depth", "Research-to-insight workflow", "Strong upskilling momentum"],
        missingSignals: ["Production data pipelines", "Backend service integration"],
        mobilityIntent: "Very high intent: data product is the most aligned next step"
      },
      {
        ...talentMatches[1],
        id: "tm-daniel-data-product",
        score: 85,
        educationFit: 81,
        skillFit: 86,
        experienceFit: 87,
        interestSignal: 89,
        highlights: ["SQL-heavy operations analytics", "Forecasting", "Business process perspective"],
        missingSignals: ["Product discovery evidence", "Pipeline orchestration"],
        mobilityIntent: "High intent: strong overlap with analytics and product tracks"
      },
      {
        ...talentMatches[0],
        id: "tm-aishah-data-product",
        summary: "Platform-oriented engineer with strong data systems potential, especially for infrastructure-heavy data product work.",
        score: 82,
        educationFit: 85,
        skillFit: 84,
        experienceFit: 82,
        interestSignal: 80,
        highlights: ["Backend data infrastructure", "Reliability mindset", "Technical depth"],
        missingSignals: ["Experiment design", "Product analytics framing"],
        mobilityIntent: "Moderate intent: more infrastructure-led than product-led today"
      }
    ]
  }
];

export const careerRootBranches: CareerRootBranch[] = [
  {
    field: "Computer Science",
    fitReason: "Strong technical depth for platform, data product, and technical consulting roles.",
    thresholdRelaxed: "Accepts adjacent consulting interest even without business degree.",
    applicants: talentMatches
  },
  {
    field: "Economics and Operations",
    fitReason: "Quantitative and process-improvement signals can map into product analytics and consulting.",
    thresholdRelaxed: "SQL portfolio can substitute for formal CS degree on analyst-to-product roles.",
    applicants: [talentMatches[1], talentMatches[2], talentMatches[0]]
  },
  {
    field: "Business and Product",
    fitReason: "Commercial judgment plus learning signals can support customer-facing technology roles.",
    thresholdRelaxed: "Portfolio projects can offset lower technical coursework for associate roles.",
    applicants: [talentMatches[2], talentMatches[1], talentMatches[0]]
  }
];

export const retentionSignals: RetentionSignal[] = [
  {
    employee: "Nadia Hassan",
    role: "Senior Backend Engineer",
    team: "Payments Platform",
    score: 82,
    optOut: false,
    factors: [
      { label: "Stagnation", weight: "25%", contribution: 21, detail: "26 months since last promotion" },
      { label: "Compensation gap", weight: "25%", contribution: 22, detail: "Salary -18% vs market" },
      { label: "Engagement trend", weight: "20%", contribution: 16, detail: "Activity down 31% in 60 days" },
      { label: "Mobility attempts", weight: "15%", contribution: 13, detail: "Viewed 4 internal roles" },
      { label: "Skill growth", weight: "15%", contribution: 10, detail: "Learning rate slowed this quarter" }
    ]
  },
  {
    employee: "Arvind Menon",
    role: "Data Engineer",
    team: "Growth Analytics",
    score: 63,
    optOut: false,
    factors: [
      { label: "Stagnation", weight: "25%", contribution: 12, detail: "14 months since last promotion" },
      { label: "Compensation gap", weight: "25%", contribution: 18, detail: "Salary -12% vs market" },
      { label: "Engagement trend", weight: "20%", contribution: 11, detail: "Stable but low project activity" },
      { label: "Mobility attempts", weight: "15%", contribution: 14, detail: "Applied to 2 internal transfers" },
      { label: "Skill growth", weight: "15%", contribution: 8, detail: "Healthy certification activity" }
    ]
  },
  {
    employee: "Opted-out employee",
    role: "Product Manager",
    team: "Consumer App",
    score: 0,
    optOut: true,
    factors: []
  }
];

export const onboardingPredictions: OnboardingPrediction[] = [
  {
    hire: "Priya Nair",
    role: "Platform Engineer",
    successProbability: 87,
    timeToImpact: "34 days",
    turnoverRisk: 9,
    nextMilestone: "Own first production deploy",
    drivers: ["Prior cloud support experience", "Strong onboarding mentor match", "Low role ambiguity"]
  },
  {
    hire: "Marcus Lee",
    role: "Data Product Engineer",
    successProbability: 72,
    timeToImpact: "49 days",
    turnoverRisk: 21,
    nextMilestone: "Ship analytics dashboard v1",
    drivers: ["Good SQL base", "Needs stakeholder mapping", "Past turnover risk in similar role cluster"]
  },
  {
    hire: "Hui Wen Tan",
    role: "Technical Consultant",
    successProbability: 79,
    timeToImpact: "42 days",
    turnoverRisk: 14,
    nextMilestone: "Complete client discovery simulation",
    drivers: ["Strong presentation portfolio", "Needs product architecture primer", "High learning velocity"]
  }
];

export const skillHeatmap: SkillHeatmapPoint[] = [
  { skill: "Distributed Systems", location: "KLCC", x: 62, y: 34, demand: 92, supply: 38, salaryPressure: "High" },
  { skill: "Data Pipelines", location: "Bangsar South", x: 48, y: 54, demand: 84, supply: 52, salaryPressure: "Medium" },
  { skill: "MLOps", location: "Cyberjaya", x: 44, y: 79, demand: 78, supply: 29, salaryPressure: "High" },
  { skill: "Technical Consulting", location: "Mont Kiara", x: 38, y: 28, demand: 68, supply: 57, salaryPressure: "Medium" }
];

export const attritionClusters: AttritionCluster[] = [
  {
    label: "Below-market senior engineers",
    share: "34%",
    risk: 82,
    rootCause: "Compensation gap plus promotion stagnation",
    evidence: ["Salary 14-22% below market", "Promotion wait above 24 months", "High external profile updates"]
  },
  {
    label: "Low-mobility analysts",
    share: "27%",
    risk: 66,
    rootCause: "Internal transfer attempts without manager follow-up",
    evidence: ["Multiple internal applications", "Low manager interaction frequency", "Flat skill growth"]
  },
  {
    label: "Ambiguous new hires",
    share: "18%",
    risk: 58,
    rootCause: "Slow time to first milestone",
    evidence: ["No milestone by day 45", "Mentor mismatch", "Role scope changed after hiring"]
  }
];

export const applicationReviews: ApplicationReview[] = [
  {
    id: "review-aishah",
    candidate: "Nur Aina Rahman",
    role: "Senior Software Engineer, Platform",
    score: 91,
    status: "New",
    reasonRequired: "",
    feedbackTrace: ["Strong backend ownership", "Needs architecture review evidence"]
  },
  {
    id: "review-daniel",
    candidate: "Daniel Lim",
    role: "Technology Consultant",
    score: 86,
    status: "New",
    reasonRequired: "",
    feedbackTrace: ["Strong operations analytics", "Needs client presentation proof"]
  },
  {
    id: "review-sara",
    candidate: "Sara Chong",
    role: "Data Product Engineer",
    score: 83,
    status: "New",
    reasonRequired: "",
    feedbackTrace: ["Strong product metrics", "Needs SQL pipeline project"]
  }
];
