"use client";

import { useState } from "react";
import { applicationReviews, talentMatches, type ApplicationReview } from "../employer-data";
import { CandidateDnaPanel, EmployerPageHeader, HeaderCard, TagList, statusTone } from "./employer-ui";

type ReviewState = Record<string, ApplicationReview>;

export function ApplicationReviewPanel() {
  const [reviews, setReviews] = useState<ReviewState>(
    Object.fromEntries(applicationReviews.map((review) => [review.id, review]))
  );
  const [selectedCandidateId, setSelectedCandidateId] = useState(talentMatches[0].id);
  const selectedCandidate = talentMatches.find((candidate) => candidate.id === selectedCandidateId) ?? talentMatches[0];

  function updateReview(id: string, patch: Partial<ApplicationReview>) {
    setReviews((current) => ({
      ...current,
      [id]: { ...current[id], ...patch }
    }));
  }

  return (
    <div>
      <EmployerPageHeader moduleId="review" />
      <div className="grid gap-4">
        <HeaderCard
          label="Application review"
          title="Shortlist or reject with a feedback trace"
          detail="Rejected applicants must receive a reason so they know which skills to build before reapplying."
        />
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="grid gap-4 xl:grid-cols-3">
            {Object.values(reviews).map((review) => {
              const candidate = talentMatches.find((match) => match.name === review.candidate);

              return (
                <article key={review.id} className="rounded-[18px] border border-line bg-paper p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="kicker">{review.role}</p>
                      <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{review.candidate}</h3>
                    </div>
                    <span className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper">{review.score}%</span>
                  </div>
                  <span className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone[review.status]}`}>
                    {review.status}
                  </span>
                  <TagList title="Feedback trace" items={review.feedbackTrace} tone="info" />
                  {candidate ? (
                    <button
                      type="button"
                      onClick={() => setSelectedCandidateId(candidate.id)}
                      className="mt-4 w-full rounded-[10px] border border-line bg-mist px-3 py-2 text-sm font-semibold text-ink transition hover:border-gold hover:bg-paper"
                    >
                      View profile and Career DNA
                    </button>
                  ) : null}
                  <textarea
                    value={review.reasonRequired}
                    onChange={(event) => updateReview(review.id, { reasonRequired: event.target.value })}
                    placeholder="Reject reason required before rejection"
                    className="mt-4 min-h-20 w-full rounded-[10px] border border-line bg-mist px-3 py-2 text-sm leading-6 text-ink outline-none transition focus:border-gold focus:bg-paper"
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateReview(review.id, { status: "Shortlisted" })}
                      className="flex-1 rounded-[10px] bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-gold hover:text-[#1c1402]"
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      disabled={!review.reasonRequired.trim()}
                      onClick={() => updateReview(review.id, { status: "Rejected" })}
                      className="flex-1 rounded-[10px] border border-line bg-paper px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Reject
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
          <CandidateDnaPanel candidate={selectedCandidate} ctaLabel="Attach feedback trace" />
        </div>
      </div>
    </div>
  );
}
