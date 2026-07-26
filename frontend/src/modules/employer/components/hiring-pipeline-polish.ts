export const hiringPipelinePolish = `
  /*
   * Premium workspace layer
   * Keeps the compact information architecture while giving each hiring stage
   * a deliberate tonal identity.
   */
  .hp {
    --workspace-blue: #e8eef8;
    --workspace-warm: #f6f2ec;
    --workspace-purple: #f0ecf7;
    padding: 10px;
    border: 1px solid #dfe5ee;
    border-radius: 18px;
    background:
      radial-gradient(circle at 92% 2%, rgba(85, 105, 180, .09), transparent 24%),
      linear-gradient(180deg, #f3f6fa 0%, #eef2f7 100%);
  }

  .hp-command {
    border-color: #b9c7df;
    background:
      linear-gradient(105deg, rgba(255,255,255,.92), rgba(238,243,252,.9)),
      #eef3fb;
    box-shadow:
      0 1px 0 rgba(255,255,255,.9) inset,
      0 10px 28px rgba(44,57,87,.08);
  }
  .hp-command-context {
    position: relative;
  }
  .hp-command-context::before {
    content: "";
    position: absolute;
    inset: 20px auto 20px 0;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: linear-gradient(#2457d6, #6d4cc4);
  }
  .hp-role-line h1 {
    font-weight: 780;
    text-wrap: balance;
  }
  .hp-role-signals span {
    border: 1px solid rgba(179,192,216,.7);
    background: rgba(255,255,255,.66);
  }
  .hp-search-brief {
    background: linear-gradient(150deg, rgba(239,244,252,.76), rgba(248,249,253,.82));
  }
  .hp-risk {
    align-self: center;
  }

  .hp-pipeline {
    border-color: #cfd8e5;
    background: rgba(249,251,254,.92);
    box-shadow: 0 4px 12px rgba(48,61,90,.04);
  }
  .hp-pipeline button.is-active {
    box-shadow: 0 1px 0 rgba(255,255,255,.9) inset;
  }

  /* Discover: editorial ranking and evidence review */
  .hp-ranking {
    overflow: hidden;
    border-color: #ccd6e5;
    background: #f8fafc;
  }
  .hp-ranking .hp-section-head {
    background:
      linear-gradient(90deg, rgba(229,236,248,.88), rgba(248,250,253,.7));
  }
  .hp-ranking .hp-section-head h2 {
    font-size: 18px;
  }
  .hp-table-head {
    border-color: #d4dde9;
    color: #4e5d74;
    background: #e9eef5;
  }
  .hp-rank-list {
    background: #f5f8fb;
  }
  .hp-rank-list article {
    border-color: #dbe2eb;
    background: rgba(255,255,255,.72);
  }
  .hp-rank-list article:nth-child(even) {
    background: rgba(244,247,251,.92);
  }
  .hp-rank-list article:hover {
    background: #f1f5fc;
  }
  .hp-rank-list article.is-selected {
    background:
      linear-gradient(90deg, #e3edff 0%, #edf3fc 56%, #f5f8fc 100%);
    box-shadow:
      inset 4px 0 0 var(--blue),
      inset 0 0 0 1px rgba(88,124,198,.12);
  }
  .hp-rank {
    display: grid;
    width: 22px;
    height: 26px;
    place-items: center;
    border-radius: 6px;
    color: #52627a;
    background: #e8edf4;
  }
  .hp-rank-list article.is-selected .hp-rank {
    color: #fff;
    background: var(--blue);
  }
  .hp-evidence b {
    display: inline-block;
    min-width: 42px;
    border-radius: 5px;
    padding: 2px 5px;
    color: var(--green);
    background: #e3f5f0;
    text-align: center;
  }
  .hp-evidence .is-gap b {
    color: var(--amber);
    background: #fcebd5;
  }
  .hp-match-score {
    border-left: 1px solid #d8e0ea;
  }
  .hp-row-actions button {
    box-shadow: 0 1px 2px rgba(38,52,79,.04);
  }
  .hp-row-actions button:first-child:not(.is-on) {
    border-color: #aebfe1;
    color: #284f9f;
    background: #f6f9ff;
  }

  .hp-summary {
    border-color: #c4d0e2;
    background: #fbfcfe;
    box-shadow:
      0 14px 30px rgba(43,57,87,.08),
      0 1px 0 rgba(255,255,255,.9) inset;
  }
  .hp-summary-head {
    border-color: #cfd9e7;
    background:
      linear-gradient(130deg, #e8eef9, #f3f6fb 68%);
  }
  .hp-summary-body {
    background: linear-gradient(180deg, #fbfcfe, #f6f8fb);
  }
  .hp-reasons li {
    border-bottom: 1px solid #e4e9f0;
    padding-bottom: 8px;
  }
  .hp-reasons li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
  .hp-summary-actions {
    background: #eef3f9;
  }

  /* Shortlisted: selective profile review */
  .hp-workspace-layout {
    padding: 1px;
  }
  .hp-side-list {
    border-color: #c9d5e5;
    background:
      linear-gradient(180deg, #edf2fa 0%, #f7f9fc 72%);
  }
  .hp-side-list .hp-section-head {
    border-bottom: 1px solid #d7e0eb;
    margin-bottom: 8px;
  }
  .hp-side-list-items button {
    background: rgba(255,255,255,.4);
  }
  .hp-side-list-items button.is-selected {
    border-color: #9eb5e3;
    background: #fff;
    box-shadow: 0 7px 16px rgba(54,75,115,.08);
  }
  .hp-profile {
    border-color: #c7d2e3;
    background: #eef3f8;
    box-shadow: 0 12px 30px rgba(46,60,88,.07);
  }
  .hp-profile-head {
    position: relative;
    border-color: #cad5e5;
    background:
      radial-gradient(circle at 92% 0%, rgba(109,76,196,.1), transparent 30%),
      linear-gradient(120deg, #e6edf8, #f5f7fb);
  }
  .hp-profile-head::after {
    content: "";
    position: absolute;
    inset: auto 22px 0;
    height: 2px;
    background: linear-gradient(90deg, var(--blue), rgba(109,76,196,.45), transparent);
  }
  .hp-profile-grid {
    gap: 12px;
    background:
      linear-gradient(145deg, rgba(236,241,247,.88), rgba(247,249,252,.92));
  }
  .hp-profile-panel {
    border: 1px solid rgba(194,205,221,.85);
    border-top: 3px solid var(--panel-color);
    border-radius: 10px;
    background:
      linear-gradient(155deg, rgba(255,255,255,.86), var(--panel-bg));
    box-shadow: 0 7px 16px rgba(45,59,86,.045);
  }
  .hp-readiness {
    border: 1px solid #c3d0e3;
    border-left: 3px solid var(--blue);
    border-radius: 10px;
    background: linear-gradient(150deg, #edf3fc, #f8faff);
  }

  /* Interviewing: a focused preparation studio */
  .hp-interview-layout {
    padding: 1px;
  }
  .hp-interview-control {
    border-color: #c9c1dd;
    background:
      radial-gradient(circle at 8% 0%, rgba(109,76,196,.13), transparent 35%),
      linear-gradient(165deg, #ece8f4, #f7f5fa);
    box-shadow: 0 12px 28px rgba(64,48,99,.07);
  }
  .hp-interview-control h2 {
    color: #29213c;
  }
  .hp-category-tabs {
    border-top: 1px solid #d8d1e5;
    padding-top: 12px;
  }
  .hp-category-tabs button {
    background: rgba(255,255,255,.36);
  }
  .hp-category-tabs button.is-active {
    border-color: #b9a8dc;
    background: #fff;
    box-shadow: 0 5px 12px rgba(68,49,104,.07);
  }
  .hp-question-workspace {
    position: relative;
    overflow: hidden;
    border-color: #d0c8df;
    background:
      radial-gradient(circle at 95% 0%, rgba(109,76,196,.07), transparent 27%),
      linear-gradient(180deg, #f8f6fb, #f1eef6);
    box-shadow: 0 14px 32px rgba(59,47,86,.065);
  }
  .hp-question-workspace::before {
    content: "";
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, var(--purple), #9278ce, transparent 82%);
  }
  .hp-generation-state {
    position: relative;
    min-height: 425px;
    border: 1px dashed #d2c8e4;
    border-radius: 12px;
    background: rgba(255,255,255,.4);
  }
  .hp-question-list article {
    border-color: #d7d0e3;
    border-left: 3px solid #8d73c8;
    background: rgba(255,255,255,.86);
    box-shadow: 0 7px 17px rgba(62,48,91,.04);
  }

  /* Decision: executive evidence and handoff */
  .hp-decision-main {
    overflow: hidden;
    border-color: #becbdd;
    background:
      linear-gradient(180deg, #e9eff7 0%, #f4f7fa 100%);
    box-shadow: 0 14px 30px rgba(39,52,79,.075);
  }
  .hp-decision-main > .hp-section-head {
    border-bottom: 1px solid #cbd6e4;
    background: rgba(255,255,255,.52);
  }
  .hp-decision-person {
    border-color: #263c68;
    color: #fff;
    background:
      radial-gradient(circle at 90% 0%, rgba(103,126,193,.5), transparent 37%),
      linear-gradient(120deg, #20335d, #2b4678);
    box-shadow: 0 10px 22px rgba(31,49,86,.15);
  }
  .hp-decision-person h2 {
    color: #fff;
  }
  .hp-decision-person p,
  .hp-decision-person > strong span {
    color: rgba(255,255,255,.64);
  }
  .hp-decision-person > strong {
    color: #fff;
  }
  .hp-score-grid {
    gap: 10px;
  }
  .hp-decision-score {
    border: 1px solid #ccd6e3;
    border-top: 3px solid var(--score-color);
    border-radius: 9px;
    background: rgba(255,255,255,.7);
    box-shadow: 0 5px 12px rgba(43,56,82,.035);
  }
  .hp-decision-evidence .hp-profile-panel {
    background: rgba(255,255,255,.74);
  }
  .hp-checklist {
    border-color: #c3cedd;
    background:
      radial-gradient(circle at 100% 0%, rgba(36,87,214,.08), transparent 35%),
      linear-gradient(165deg, #edf2f8, #f8f9fb);
    box-shadow: 0 12px 28px rgba(40,54,81,.065);
  }
  .hp-checklist h2 {
    color: #23314b;
  }
  .hp-checklist label > span {
    border-color: #d1dae6;
    background: rgba(255,255,255,.66);
  }

  @media (max-width: 620px) {
    .hp {
      padding: 6px;
      border-radius: 14px;
    }
    .hp-command-context::before {
      inset-block: 16px;
    }
    .hp-generation-state {
      min-height: 360px;
    }
  }
`;
