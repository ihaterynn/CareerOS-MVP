import type { CandidateModuleId, NavigationItem } from "@careeros/shared";

export type SkillSignal = {
  name: string;
  level: number;
  category: "Core" | "Adjacent" | "Emerging";
  evidence: string;
};

export type CandidateJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapPosition: {
    x: number;
    y: number;
  };
  salary: string;
  mode: "Hybrid" | "Remote-first" | "On-site";
  commuteMinutes: number;
  requirements: string[];
  missingSkills: string[];
  match: {
    overall: number;
    skills: number;
    geo: number;
    salary: number;
    preference: number;
  };
  explanation: string[];
};

export type CourseRecommendation = {
  id: string;
  title: string;
  provider: "Coursera";
  partner: string;
  targetSkill: string;
  duration: string;
  jobIds: string[];
  reason: string;
};

export type CareerPathRoute = {
  id: string;
  title: string;
  track: "Grow" | "Pivot" | "Specialize";
  readiness: number;
  horizon: string;
  salaryRange: string;
  marketSignal: string;
  whyRealistic: string[];
  bridgeSkills: string[];
  nextMilestones: string[];
};

export const candidateModules: Array<NavigationItem<CandidateModuleId>> = [
  {
    id: "dna",
    label: "Candidate DNA",
    description: "Unified identity layer for skills, history, preferences, and learning signals."
  },
  {
    id: "career-path",
    label: "Career Path",
    description: "Realistic next moves based on your history and market routes."
  },
  {
    id: "upskilling",
    label: "Upskilling",
    description: "Course recommendations mapped to job requirements and missing skills."
  },
  {
    id: "jobs",
    label: "Job Search",
    description: "Location-aware job search with explainable Career DNA match scoring."
  }
];

export const candidateProfile = {
  name: "Aishah Rahman",
  currentRole: "Software Engineer",
  location: "Petaling Jaya, Selangor",
  coordinates: { lat: 3.1073, lng: 101.6067 },
  commutePreferenceMinutes: 35,
  workPreferences: ["Hybrid", "Remote-first", "Product engineering teams"],
  salaryExpectation: "RM 11,000 - 15,000 / month",
  relocationFlexibility: "Open within Klang Valley",
  careerInterests: ["Backend platform", "Data products", "Routing optimization", "Fintech"],
  education: [
    {
      school: "Universiti Malaya",
      credential: "B.CompSc (Hons), Software Engineering",
      year: "2021"
    }
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "Hantar",
      period: "2023 - Present",
      impact: "Reduced order assignment latency from 900ms to 210ms for Klang Valley dispatch."
    },
    {
      role: "Junior Software Engineer",
      company: "Jasa Tech",
      period: "2021 - 2023",
      impact: "Built merchant dashboards and automated reconciliation jobs for SME users."
    }
  ],
  certifications: [
    "AWS Cloud Practitioner",
    "Meta Front-End Developer Certificate",
    "Google Data Analytics Foundation"
  ],
  portfolio: [
    "Route optimizer proof of concept using Python and OR-Tools",
    "React operations dashboard for rider dispatch monitoring",
    "PostgreSQL query tuning notes from high-volume order matching"
  ],
  learningSignals: [
    "Completed 18 hours of data science content in the last 30 days",
    "Saved 4 machine learning job descriptions",
    "Practiced 6 system design interview prompts this month"
  ]
};

export const skillSignals: SkillSignal[] = [
  {
    name: "Python",
    level: 88,
    category: "Core",
    evidence: "Production dispatch tooling, optimization scripts, analytics notebooks"
  },
  {
    name: "TypeScript",
    level: 82,
    category: "Core",
    evidence: "React dashboards, API clients, form-heavy internal tools"
  },
  {
    name: "PostgreSQL",
    level: 78,
    category: "Core",
    evidence: "Query tuning, reconciliation jobs, operational reporting"
  },
  {
    name: "Go",
    level: 63,
    category: "Adjacent",
    evidence: "Matching service rewrite and platform service maintenance"
  },
  {
    name: "Machine Learning",
    level: 42,
    category: "Emerging",
    evidence: "Learning signal only: course activity and saved job requirements"
  },
  {
    name: "System Design",
    level: 56,
    category: "Emerging",
    evidence: "Interview practice, service ownership, no formal architecture review history yet"
  }
];

export const jobListings: CandidateJob[] = [
  {
    id: "senior-platform",
    title: "Senior Software Engineer, Platform",
    company: "Cempaka Digital",
    location: "KLCC, Kuala Lumpur",
    coordinates: { lat: 3.1579, lng: 101.7116 },
    mapPosition: { x: 61, y: 38 },
    salary: "RM 12,000 - 15,000",
    mode: "Hybrid",
    commuteMinutes: 29,
    requirements: ["Go", "PostgreSQL", "AWS", "Distributed systems", "System Design"],
    missingSkills: ["Distributed systems", "Advanced system design"],
    match: { overall: 91, skills: 84, geo: 93, salary: 96, preference: 88 },
    explanation: [
      "High platform fit: Go exposure, PostgreSQL depth, and AWS certification cover most core requirements.",
      "Career direction fit: senior platform work aligns with backend systems and fintech interests.",
      "Only two bridge gaps remain: distributed systems design and senior-level architecture tradeoffs."
    ]
  },
  {
    id: "data-product",
    title: "Data Product Engineer",
    company: "RinggitPay",
    location: "Bangsar South, Kuala Lumpur",
    coordinates: { lat: 3.1119, lng: 101.6659 },
    mapPosition: { x: 48, y: 54 },
    salary: "RM 10,500 - 13,500",
    mode: "Hybrid",
    commuteMinutes: 18,
    requirements: ["Python", "SQL", "Experiment design", "Data pipelines", "Stakeholder communication"],
    missingSkills: ["Experiment design", "Data pipeline orchestration"],
    match: { overall: 87, skills: 79, geo: 98, salary: 84, preference: 90 },
    explanation: [
      "Strong analytics fit: Python, SQL, and operations dashboard experience map directly to data product work.",
      "Domain signal is credible: routing optimization and KPI dashboards show product-minded engineering evidence.",
      "Main readiness gap is experimentation and pipeline orchestration, both covered by the recommended courses."
    ]
  },
  {
    id: "ml-routing",
    title: "Machine Learning Engineer, Routing",
    company: "Nusantara Cloud",
    location: "Cyberjaya, Selangor",
    coordinates: { lat: 2.9213, lng: 101.6559 },
    mapPosition: { x: 45, y: 81 },
    salary: "RM 12,500 - 16,000",
    mode: "Remote-first",
    commuteMinutes: 41,
    requirements: ["Python", "Machine Learning", "Optimization", "MLOps", "Statistics"],
    missingSkills: ["MLOps", "Statistics", "Production ML"],
    match: { overall: 78, skills: 67, geo: 76, salary: 97, preference: 92 },
    explanation: [
      "Exceptional domain fit: prior route optimization work is directly relevant to routing ML problems.",
      "Preference fit is strong because remote-first work reduces commute sensitivity for Cyberjaya.",
      "Score is capped by missing production ML, MLOps, and statistics evidence."
    ]
  },
  {
    id: "payments-platform",
    title: "Backend Engineer, Payments",
    company: "MerdekaPay",
    location: "Mont Kiara, Kuala Lumpur",
    coordinates: { lat: 3.1698, lng: 101.6527 },
    mapPosition: { x: 45, y: 28 },
    salary: "RM 11,000 - 14,000",
    mode: "On-site",
    commuteMinutes: 37,
    requirements: ["Node.js", "TypeScript", "PostgreSQL", "Payments", "Kafka"],
    missingSkills: ["Kafka", "Payment domain depth"],
    match: { overall: 73, skills: 75, geo: 62, salary: 88, preference: 64 },
    explanation: [
      "Solid engineering base: TypeScript and PostgreSQL match the payments platform stack.",
      "Preference risk is high because the role is on-site and less aligned with your hybrid preference.",
      "Kafka and payments-domain experience are the main blockers before this becomes a strong match."
    ]
  }
];

export const courseRecommendations: CourseRecommendation[] = [
  {
    id: "system-design",
    title: "Software Design and Architecture",
    provider: "Coursera",
    partner: "University of Alberta",
    targetSkill: "Advanced system design",
    duration: "4 weeks",
    jobIds: ["senior-platform"],
    reason: "Bridges architecture tradeoffs, design patterns, and maintainability for senior platform roles."
  },
  {
    id: "distributed-systems",
    title: "Cloud Computing Specialization",
    provider: "Coursera",
    partner: "University of Illinois",
    targetSkill: "Distributed systems",
    duration: "6 weeks",
    jobIds: ["senior-platform"],
    reason: "Adds distributed storage, consistency, and fault-tolerance concepts missing from the platform match."
  },
  {
    id: "experiment-design",
    title: "Experimentation for Improvement",
    provider: "Coursera",
    partner: "McMaster University",
    targetSkill: "Experiment design",
    duration: "3 weeks",
    jobIds: ["data-product"],
    reason: "Directly supports data product roles that need controlled testing and business metric reasoning."
  },
  {
    id: "mlops",
    title: "Machine Learning Engineering for Production",
    provider: "Coursera",
    partner: "DeepLearning.AI",
    targetSkill: "MLOps",
    duration: "5 weeks",
    jobIds: ["ml-routing"],
    reason: "Converts current learning signals into production ML deployment evidence."
  },
  {
    id: "kafka",
    title: "Data Streaming with Apache Kafka",
    provider: "Coursera",
    partner: "LearnQuest",
    targetSkill: "Kafka",
    duration: "2 weeks",
    jobIds: ["payments-platform"],
    reason: "Targets the biggest payments infrastructure gap."
  }
];

export const careerPathRoutes: CareerPathRoute[] = [
  {
    id: "senior-platform",
    title: "Senior Software Engineer, Platform",
    track: "Grow",
    readiness: 84,
    horizon: "6-9 months",
    salaryRange: "RM 12k-15k",
    marketSignal: "High demand across KL fintech and platform teams",
    whyRealistic: [
      "Current dispatch and matching-service work already proves backend ownership.",
      "PostgreSQL, TypeScript, AWS, and Go exposure overlap with senior platform requirements.",
      "Only senior architecture depth and distributed systems evidence are missing."
    ],
    bridgeSkills: ["Distributed systems", "Architecture review", "Technical mentoring"],
    nextMilestones: ["Lead one service design review", "Document scaling tradeoffs", "Mentor one junior engineer"]
  },
  {
    id: "data-product-engineer",
    title: "Data Product Engineer",
    track: "Pivot",
    readiness: 76,
    horizon: "4-8 months",
    salaryRange: "RM 10.5k-13.5k",
    marketSignal: "Growing demand in payments, logistics, and operations analytics",
    whyRealistic: [
      "Routing optimization and dashboard work are already data-product adjacent.",
      "Python and SQL strength makes the pivot lower-risk than a pure ML jump.",
      "The missing layer is experiment design and data pipeline ownership."
    ],
    bridgeSkills: ["Experiment design", "Data pipeline orchestration", "Product metrics"],
    nextMilestones: ["Ship one analytics feature", "Run an A/B test writeup", "Build a pipeline portfolio case"]
  },
  {
    id: "ml-routing",
    title: "Machine Learning Engineer, Routing",
    track: "Specialize",
    readiness: 62,
    horizon: "9-14 months",
    salaryRange: "RM 12.5k-16k",
    marketSignal: "Niche but valuable for logistics, routing, and optimization teams",
    whyRealistic: [
      "The domain fit is unusually strong because of route optimization experience.",
      "Python is strong enough to start, but production ML evidence is not mature yet.",
      "This route needs a deliberate MLOps and statistics bridge before applying widely."
    ],
    bridgeSkills: ["Statistics", "MLOps", "Production model monitoring"],
    nextMilestones: ["Publish OR-Tools project", "Deploy one model API", "Complete MLOps portfolio sprint"]
  },
  {
    id: "engineering-manager",
    title: "Engineering Manager",
    track: "Grow",
    readiness: 48,
    horizon: "12-18 months",
    salaryRange: "RM 16k-22k",
    marketSignal: "Available, but requires people leadership proof",
    whyRealistic: [
      "Stakeholder and operational context are useful manager signals.",
      "There is not enough people leadership evidence yet.",
      "This path becomes realistic after mentoring, delivery ownership, and hiring exposure."
    ],
    bridgeSkills: ["People management", "Roadmap planning", "Hiring calibration"],
    nextMilestones: ["Own a delivery roadmap", "Run structured 1:1s", "Join two interview panels"]
  }
];
