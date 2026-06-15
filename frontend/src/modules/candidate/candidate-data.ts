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
  url: string;
};

export type CareerRouteCourse = {
  title: string;
  provider: "Coursera";
  partner: string;
  targetSkill: string;
  duration: string;
  url: string;
};

export type CareerPathRoute = {
  id: string;
  title: string;
  track: "Grow" | "Pivot" | "Specialize" | "Adjacent";
  readiness: number;
  horizon: string;
  salaryRange: string;
  currentExpectedPay: string;
  unlockedPayRange: string;
  payEvidence: string[];
  marketSignal: string;
  whyRealistic: string[];
  bridgeSkills: string[];
  requiredSignals: string[];
  projects: string[];
  nextMilestones: string[];
  sourceSignals: string[];
  courses: CareerRouteCourse[];
};

export type CandidateApplication = {
  id: string;
  jobId: string;
  status: "Draft" | "Review" | "Applied" | "Interview";
  submittedAt: string;
  resumeVersion: string;
  nextStep: string;
};

export const registrationSteps = [
  { label: "Create university-verified account", complete: true },
  { label: "Register candidate profile", complete: true },
  { label: "Build ATS resume", complete: true },
  { label: "Connect portfolio evidence", complete: true },
  { label: "Enable quick apply approvals", complete: false }
];

export const candidateModules: Array<NavigationItem<CandidateModuleId>> = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Candidate command center for registration, readiness, applications, and next actions."
  },
  {
    id: "dna",
    label: "Candidate DNA",
    description: "Unified identity layer for skills, history, preferences, and learning signals."
  },
  {
    id: "jobs",
    label: "Job Search",
    description: "Location-aware job search with explainable Career DNA match scoring."
  },
  {
    id: "career-path",
    label: "Career Path",
    description: "AI-parsed market routes from scraped role trends, not employer job listings."
  },
  {
    id: "jobby",
    label: "Jobby.ai",
    description: "Career advisor chatbot for role, pay, learning, resume, and application advice."
  },
  {
    id: "applications",
    label: "Applications",
    description: "Saved jobs, quick applies, missing skills, and Coursera upskilling."
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
    reason: "Bridges architecture tradeoffs, design patterns, and maintainability for senior platform roles.",
    url: "https://www.coursera.org/specializations/software-design-architecture"
  },
  {
    id: "distributed-systems",
    title: "Cloud Computing Specialization",
    provider: "Coursera",
    partner: "University of Illinois",
    targetSkill: "Distributed systems",
    duration: "6 weeks",
    jobIds: ["senior-platform"],
    reason: "Adds distributed storage, consistency, and fault-tolerance concepts missing from the platform match.",
    url: "https://www.coursera.org/specializations/cloud-computing"
  },
  {
    id: "experiment-design",
    title: "Experimentation for Improvement",
    provider: "Coursera",
    partner: "McMaster University",
    targetSkill: "Experiment design",
    duration: "3 weeks",
    jobIds: ["data-product"],
    reason: "Directly supports data product roles that need controlled testing and business metric reasoning.",
    url: "https://www.coursera.org/learn/experimentation"
  },
  {
    id: "mlops",
    title: "Machine Learning Engineering for Production",
    provider: "Coursera",
    partner: "DeepLearning.AI",
    targetSkill: "MLOps",
    duration: "5 weeks",
    jobIds: ["ml-routing"],
    reason: "Converts current learning signals into production ML deployment evidence.",
    url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops"
  },
  {
    id: "kafka",
    title: "Data Streaming with Apache Kafka",
    provider: "Coursera",
    partner: "LearnQuest",
    targetSkill: "Kafka",
    duration: "2 weeks",
    jobIds: ["payments-platform"],
    reason: "Targets the biggest payments infrastructure gap.",
    url: "https://www.coursera.org/learn/apache-kafka"
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
    currentExpectedPay: "RM 11k-13k",
    unlockedPayRange: "RM 14k-16k",
    payEvidence: [
      "Market survey threshold: senior platform roles cluster above RM 12k when candidates show service ownership.",
      "Regression-style signal: architecture review and distributed systems evidence add the strongest pay lift.",
      "Career DNA estimate: current backend ownership supports the lower senior band before the bridge skills are proven."
    ],
    marketSignal: "High demand across KL fintech and platform teams",
    whyRealistic: [
      "Current dispatch and matching-service work already proves backend ownership.",
      "PostgreSQL, TypeScript, AWS, and Go exposure overlap with senior platform requirements.",
      "Only senior architecture depth and distributed systems evidence are missing."
    ],
    bridgeSkills: ["Distributed systems", "Architecture review", "Technical mentoring"],
    requiredSignals: ["Service ownership", "Distributed reliability", "Architecture tradeoffs", "Mentoring proof"],
    projects: [
      "Write a scaling memo for the dispatch matching service.",
      "Build a small distributed queue simulation with failure-retry behavior.",
      "Publish an architecture review case study from an internal service."
    ],
    nextMilestones: ["Lead one service design review", "Document scaling tradeoffs", "Mentor one junior engineer"],
    sourceSignals: [
      "AI-parsed senior platform postings repeatedly mention distributed systems, cloud reliability, and service ownership.",
      "Market trend scan shows platform teams asking for architecture review and mentoring evidence.",
      "Compensation patterns cluster around senior backend ownership rather than a single employer's listing."
    ],
    courses: [
      {
        title: "Cloud Computing Specialization",
        provider: "Coursera",
        partner: "University of Illinois",
        targetSkill: "Distributed systems",
        duration: "6 weeks",
        url: "https://www.coursera.org/specializations/cloud-computing"
      },
      {
        title: "Software Design and Architecture",
        provider: "Coursera",
        partner: "University of Alberta",
        targetSkill: "Architecture review",
        duration: "4 weeks",
        url: "https://www.coursera.org/specializations/software-design-architecture"
      }
    ]
  },
  {
    id: "data-product-engineer",
    title: "Data Product Engineer",
    track: "Pivot",
    readiness: 76,
    horizon: "4-8 months",
    salaryRange: "RM 10.5k-13.5k",
    currentExpectedPay: "RM 10.5k-12k",
    unlockedPayRange: "RM 12.5k-14.5k",
    payEvidence: [
      "Market survey threshold: analytics product roles pay higher when candidates show experimentation ownership.",
      "Regression-style signal: SQL/Python depth is common, but shipped metric impact separates stronger pay bands.",
      "Career DNA estimate: operations dashboards and routing work make this a realistic adjacent pivot."
    ],
    marketSignal: "Growing demand in payments, logistics, and operations analytics",
    whyRealistic: [
      "Routing optimization and dashboard work are already data-product adjacent.",
      "Python and SQL strength makes the pivot lower-risk than a pure ML jump.",
      "The missing layer is experiment design and data pipeline ownership."
    ],
    bridgeSkills: ["Experiment design", "Data pipeline orchestration", "Product metrics"],
    requiredSignals: ["Experiment design", "Metric ownership", "Pipeline reliability", "Stakeholder communication"],
    projects: [
      "Run a mock A/B test on rider dispatch conversion metrics.",
      "Build a portfolio data pipeline that refreshes an operations dashboard.",
      "Write a product metrics teardown for a logistics workflow."
    ],
    nextMilestones: ["Ship one analytics feature", "Run an A/B test writeup", "Build a pipeline portfolio case"],
    sourceSignals: [
      "Scraped product-engineering roles increasingly combine Python, SQL, experimentation, and stakeholder metrics.",
      "AI parsing groups logistics, payments, and operations analytics into a low-friction pivot cluster.",
      "Market pay bands are strongest when candidates show shipped analytics features and experiment writeups."
    ],
    courses: [
      {
        title: "Experimentation for Improvement",
        provider: "Coursera",
        partner: "McMaster University",
        targetSkill: "Experiment design",
        duration: "3 weeks",
        url: "https://www.coursera.org/learn/experimentation"
      },
      {
        title: "Data Engineering Foundations",
        provider: "Coursera",
        partner: "IBM",
        targetSkill: "Data pipeline orchestration",
        duration: "5 weeks",
        url: "https://www.coursera.org/professional-certificates/data-engineering-foundations"
      }
    ]
  },
  {
    id: "ml-routing",
    title: "Machine Learning Engineer, Routing",
    track: "Specialize",
    readiness: 62,
    horizon: "9-14 months",
    salaryRange: "RM 12.5k-16k",
    currentExpectedPay: "RM 11.5k-13k",
    unlockedPayRange: "RM 15k-18k",
    payEvidence: [
      "Market survey threshold: production ML roles move above RM 15k when deployment and monitoring are proven.",
      "Regression-style signal: route optimization domain proof is valuable, but MLOps evidence drives pay confidence.",
      "Career DNA estimate: current Python and optimization signals are strong but not yet production-ML complete."
    ],
    marketSignal: "Niche but valuable for logistics, routing, and optimization teams",
    whyRealistic: [
      "The domain fit is unusually strong because of route optimization experience.",
      "Python is strong enough to start, but production ML evidence is not mature yet.",
      "This route needs a deliberate MLOps and statistics bridge before applying widely."
    ],
    bridgeSkills: ["Statistics", "MLOps", "Production model monitoring"],
    requiredSignals: ["MLOps", "Statistics", "Model API deployment", "Monitoring and drift handling"],
    projects: [
      "Deploy a route ETA prediction API with model versioning.",
      "Create monitoring dashboards for prediction drift and latency.",
      "Publish an OR-Tools plus ML routing comparison notebook."
    ],
    nextMilestones: ["Publish OR-Tools project", "Deploy one model API", "Complete MLOps portfolio sprint"],
    sourceSignals: [
      "Market trend parsing separates routing ML from generic ML because logistics roles value optimization domain proof.",
      "High-paying ML roles repeatedly require deployment, monitoring, and statistics evidence.",
      "AI model flags this as realistic only after production ML proof is added to the portfolio."
    ],
    courses: [
      {
        title: "Machine Learning Engineering for Production",
        provider: "Coursera",
        partner: "DeepLearning.AI",
        targetSkill: "MLOps",
        duration: "5 weeks",
        url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops"
      },
      {
        title: "Statistics with Python",
        provider: "Coursera",
        partner: "University of Michigan",
        targetSkill: "Statistics",
        duration: "4 weeks",
        url: "https://www.coursera.org/specializations/statistics-with-python"
      }
    ]
  },
  {
    id: "engineering-manager",
    title: "Engineering Manager",
    track: "Grow",
    readiness: 48,
    horizon: "12-18 months",
    salaryRange: "RM 16k-22k",
    currentExpectedPay: "RM 13k-16k",
    unlockedPayRange: "RM 18k-24k",
    payEvidence: [
      "Market survey threshold: manager pay bands require proof of delivery ownership and people leadership.",
      "Regression-style signal: hiring calibration and structured coaching raise pay confidence more than stack breadth.",
      "Career DNA estimate: stakeholder context is present, but leadership signals need deliberate portfolio evidence."
    ],
    marketSignal: "Available, but requires people leadership proof",
    whyRealistic: [
      "Stakeholder and operational context are useful manager signals.",
      "There is not enough people leadership evidence yet.",
      "This path becomes realistic after mentoring, delivery ownership, and hiring exposure."
    ],
    bridgeSkills: ["People management", "Roadmap planning", "Hiring calibration"],
    requiredSignals: ["People leadership", "Delivery roadmap ownership", "Hiring calibration", "Coaching rituals"],
    projects: [
      "Create a 90-day engineering roadmap for a platform team.",
      "Document a structured mentoring plan and feedback loop.",
      "Build an interview rubric for backend platform hiring."
    ],
    nextMilestones: ["Own a delivery roadmap", "Run structured 1:1s", "Join two interview panels"],
    sourceSignals: [
      "AI parsing of engineering manager posts finds people leadership proof as the main gating factor.",
      "Market routes reward delivery ownership, hiring calibration, and structured coaching more than hands-on stack depth.",
      "Current Career DNA has stakeholder context, but not enough people-management evidence yet."
    ],
    courses: [
      {
        title: "Leading People and Teams",
        provider: "Coursera",
        partner: "University of Michigan",
        targetSkill: "People management",
        duration: "4 weeks",
        url: "https://www.coursera.org/specializations/leading-teams"
      },
      {
        title: "Agile Leadership",
        provider: "Coursera",
        partner: "University of Colorado System",
        targetSkill: "Roadmap planning",
        duration: "3 weeks",
        url: "https://www.coursera.org/learn/agile-leadership"
      }
    ]
  },
  {
    id: "technology-consultant",
    title: "Technology Consultant",
    track: "Adjacent",
    readiness: 58,
    horizon: "6-12 months",
    salaryRange: "RM 9k-14k",
    currentExpectedPay: "RM 9.5k-12k",
    unlockedPayRange: "RM 13k-16k",
    payEvidence: [
      "Market survey threshold: consulting roles reward technical breadth plus client-facing communication.",
      "Regression-style signal: stakeholder storytelling and business-case writing unlock higher bands.",
      "Career DNA estimate: operations context and dashboard work are useful consulting signals despite a CS background."
    ],
    marketSignal: "Rising demand for technically fluent consultants in digital transformation and operations modernization",
    whyRealistic: [
      "Career DNA shows technical depth plus operational business context, which is useful in consulting.",
      "Dashboard and reconciliation projects translate into process improvement stories.",
      "The main gap is client-facing case framing rather than engineering ability."
    ],
    bridgeSkills: ["Business case writing", "Client discovery", "Slide storytelling"],
    requiredSignals: ["Structured problem solving", "Stakeholder interviews", "Business case modeling", "Executive communication"],
    projects: [
      "Turn the dispatch latency project into a before/after consulting case study.",
      "Create a five-slide digital transformation recommendation for a logistics client.",
      "Interview three operations users and synthesize pain points into a roadmap."
    ],
    nextMilestones: ["Write one consulting case", "Practice a client discovery script", "Build an executive summary deck"],
    sourceSignals: [
      "AI parsing finds technology consulting routes increasingly open to CS graduates with operational product evidence.",
      "Scraped consulting roles mention analytics, process redesign, stakeholder discovery, and implementation planning.",
      "Career DNA soft signals reveal communication and business-context potential that deterministic CS-to-SWE matching misses."
    ],
    courses: [
      {
        title: "Business Strategy",
        provider: "Coursera",
        partner: "University of Virginia",
        targetSkill: "Business case writing",
        duration: "4 weeks",
        url: "https://www.coursera.org/learn/uva-darden-business-strategy"
      },
      {
        title: "Successful Presentation",
        provider: "Coursera",
        partner: "University of Colorado Boulder",
        targetSkill: "Slide storytelling",
        duration: "3 weeks",
        url: "https://www.coursera.org/learn/presentation-skills"
      }
    ]
  }
];

export const candidateApplications: CandidateApplication[] = [
  {
    id: "app-senior-platform",
    jobId: "senior-platform",
    status: "Applied",
    submittedAt: "2026-06-14",
    resumeVersion: "Platform senior resume v3",
    nextStep: "Employer shortlist review"
  },
  {
    id: "app-data-product",
    jobId: "data-product",
    status: "Review",
    submittedAt: "Pending approval",
    resumeVersion: "AI tailored data product resume",
    nextStep: "Candidate review and approve"
  },
  {
    id: "app-ml-routing",
    jobId: "ml-routing",
    status: "Draft",
    submittedAt: "Not submitted",
    resumeVersion: "Routing ML bridge resume",
    nextStep: "Add MLOps portfolio evidence"
  }
];
