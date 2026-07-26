export const WORK_PROFILE_QUESTIONS = [
  { id: "technical_craft", prompt: "I enjoy solving complex technical problems.", low: "Rarely true", high: "Very true" },
  { id: "collaboration", prompt: "I gain energy from collaborating with people across teams.", low: "Rarely true", high: "Very true" },
  { id: "structure", prompt: "I prefer clear process and predictable work.", low: "Prefer change", high: "Prefer structure" },
  { id: "ambiguity", prompt: "I enjoy exploring unclear problems before the answer is known.", low: "Prefer certainty", high: "Enjoy discovery" },
  { id: "ownership", prompt: "I want end-to-end ownership of outcomes.", low: "Prefer support", high: "Prefer ownership" },
  { id: "leadership", prompt: "I want to mentor, influence, or lead others.", low: "Not now", high: "Very much" },
  { id: "mentoring", prompt: "I enjoy helping others learn and become more effective.", low: "Rarely true", high: "Very true" },
  { id: "decision_scope", prompt: "I want more say in priorities and important decisions.", low: "Prefer direction", high: "Prefer influence" },
  { id: "customer_impact", prompt: "I feel motivated when I can see the impact on customers or users.", low: "Less important", high: "Very important" },
  { id: "growth_learning", prompt: "I want a role that stretches my skills and career scope.", low: "Prefer mastery", high: "Seek growth" },
  { id: "work_pace", prompt: "I thrive in a fast-moving environment with frequent change.", low: "Prefer steady pace", high: "Thrive in pace" },
  { id: "stability", prompt: "Job security and long-term stability matter strongly to me right now.", low: "Less important", high: "Very important" },
  { id: "current_energy", prompt: "My current day-to-day work feels energising.", low: "Draining", high: "Energising" },
  { id: "current_satisfaction", prompt: "I am satisfied with my current role direction.", low: "Not satisfied", high: "Very satisfied" }
] as const;

export type WorkProfileQuestionId = typeof WORK_PROFILE_QUESTIONS[number]["id"];
export type WorkProfileAnswers = Record<WorkProfileQuestionId, number>;

export function validateWorkProfileAnswers(value: unknown): WorkProfileAnswers {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("A complete work-preference check-in is required.");
  const input = value as Record<string, unknown>;
  const answers = {} as WorkProfileAnswers;
  for (const question of WORK_PROFILE_QUESTIONS) {
    const answer = input[question.id];
    if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 1 || answer > 10) throw new Error("A complete work-preference check-in is required.");
    answers[question.id] = answer;
  }
  return answers;
}
