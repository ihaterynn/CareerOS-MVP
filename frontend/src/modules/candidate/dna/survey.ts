export function nextSurveyStep(index: number, total: number): number | "complete" {
  return index + 1 >= total ? "complete" : index + 1;
}

export function surveyProgress(index: number, total: number): number {
  return Math.round(((index + 1) / total) * 100);
}
