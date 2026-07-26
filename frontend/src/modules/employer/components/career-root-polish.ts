export const careerRootPolish = `
  /*
   * Strategic talent-intelligence refinement.
   * Loaded after the functional Career Root styles to preserve behavior while
   * strengthening the sourcing map, branch identities, and evidence hierarchy.
   */
  .cr {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border-color: #d4dce8;
    background:
      radial-gradient(circle at 8% -5%, rgba(71,105,172,.12), transparent 25%),
      radial-gradient(circle at 98% 18%, rgba(99,76,159,.08), transparent 24%),
      linear-gradient(180deg, #edf2f7 0%, #e8edf4 100%);
    box-shadow: inset 0 1px 0 rgba(255,255,255,.86);
  }
  .cr::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: 0;
    opacity: .28;
    pointer-events: none;
    background-image:
      linear-gradient(rgba(78,98,134,.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(78,98,134,.07) 1px, transparent 1px);
    background-size: 46px 46px;
    mask-image: linear-gradient(135deg, black, transparent 52%);
  }

  .cr-command {
    border-color: #afbdd3;
    background: linear-gradient(112deg, #f9fbfe 0%, #edf2fa 66%, #e7edf8 100%);
    box-shadow:
      0 1px 0 rgba(255,255,255,.9) inset,
      0 13px 32px rgba(39,53,83,.085);
  }
  .cr-command-copy::before {
    width: 4px;
    background: linear-gradient(180deg, #2457d6, #5373b8 55%, #6d4cc4);
  }
  .cr-label {
    color: #33445f;
    letter-spacing: .01em;
  }
  .cr-role-line h1 {
    color: #14223d;
    font-weight: 800;
  }
  .cr-goal {
    max-width: 720px;
    color: #485970;
  }
  .cr-signals span {
    border-color: #b9c7dc;
    color: #354862;
    background: rgba(255,255,255,.78);
    box-shadow: 0 1px 0 rgba(255,255,255,.9) inset;
  }
  .cr-command-insight {
    border-color: #243961;
    color: #fff;
    background:
      radial-gradient(circle at 90% 0%, rgba(101,126,194,.58), transparent 42%),
      linear-gradient(135deg, #20335b 0%, #2b4577 100%);
  }
  .cr-insight-copy > span {
    color: #d2c6f4;
  }
  .cr-insight-copy > strong {
    color: #fff;
    letter-spacing: -.018em;
  }
  .cr-insight-copy p {
    color: rgba(255,255,255,.68);
  }
  .cr-metrics > div {
    border-color: rgba(255,255,255,.17);
  }
  .cr-metrics strong {
    color: #fff;
  }
  .cr-metrics span {
    color: rgba(255,255,255,.59);
  }

  .cr-lens {
    border-color: #c6d0dd;
    background: rgba(247,250,253,.82);
    box-shadow:
      0 1px 0 rgba(255,255,255,.86) inset,
      0 5px 14px rgba(43,57,84,.04);
    backdrop-filter: blur(10px);
  }
  .cr-lens-toggle button:not(.is-active):hover {
    color: #243653;
    background: #e9eef5;
  }
  .cr-lens-toggle button.is-active {
    background: linear-gradient(135deg, #20345e, #315181);
  }

  /* The sourcing map is the visual centerpiece. */
  .cr-explorer {
    position: relative;
    border-color: #bdc9d9;
    background:
      radial-gradient(circle at 50% 13%, rgba(70,101,164,.09), transparent 27%),
      linear-gradient(180deg, #edf2f8 0%, #f4f7fa 100%);
    box-shadow:
      0 14px 31px rgba(38,52,79,.075),
      0 1px 0 rgba(255,255,255,.8) inset;
  }
  .cr-explorer::before {
    content: "";
    position: absolute;
    z-index: 2;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, #2457d6, #7188bb 52%, rgba(109,76,196,.55), transparent);
  }
  .cr-section-head {
    border-color: #c6d1df;
    padding-block: 17px;
    background:
      linear-gradient(90deg, rgba(221,230,243,.94), rgba(242,246,250,.82));
  }
  .cr-section-head > div > span {
    color: #50627b;
  }
  .cr-section-head h2 {
    color: #182742;
    font-size: 19px;
    font-weight: 780;
  }

  .cr-role-root {
    margin-top: 20px;
    border-color: #1d3158;
    background:
      radial-gradient(circle at 88% 0%, rgba(119,144,207,.52), transparent 40%),
      linear-gradient(125deg, #172a50, #2b497c);
    box-shadow:
      0 16px 30px rgba(25,43,77,.2),
      0 1px 0 rgba(255,255,255,.12) inset;
  }
  .cr-root-icon {
    border: 1px solid rgba(255,255,255,.13);
    color: #d8e2ff;
    background: rgba(255,255,255,.1);
  }
  .cr-role-root h3 {
    font-size: 16px;
    letter-spacing: -.018em;
  }
  .cr-role-root::after,
  .cr-branch-grid::before,
  .cr-branch-grid > button::before {
    background: #899fc2;
  }

  .cr-branch-grid {
    gap: 11px;
    padding-inline: 16px;
  }
  .cr-branch-grid > button {
    overflow: hidden;
    border-color: #c4cfdd;
    padding: 12px 10px;
    background: linear-gradient(145deg, rgba(255,255,255,.84), rgba(236,241,247,.82));
    box-shadow:
      0 6px 15px rgba(42,57,84,.045),
      0 1px 0 rgba(255,255,255,.9) inset;
  }
  .cr-branch-grid > button::after {
    content: "";
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--branch-accent);
    opacity: .58;
  }
  .cr-branch-grid > button:nth-child(1) {
    --branch-accent: #2457d6;
    --branch-soft: #e8effc;
  }
  .cr-branch-grid > button:nth-child(2) {
    --branch-accent: #138472;
    --branch-soft: #e5f3ef;
  }
  .cr-branch-grid > button:nth-child(3) {
    --branch-accent: #7956b4;
    --branch-soft: #eee9f7;
  }
  .cr-branch-grid > button:hover {
    border-color: var(--branch-accent);
    background: linear-gradient(145deg, #fff, var(--branch-soft));
  }
  .cr-branch-grid > button.is-active {
    border-color: var(--branch-accent);
    background:
      linear-gradient(140deg, #fff 0%, var(--branch-soft) 100%);
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--branch-accent) 12%, transparent),
      0 10px 20px rgba(42,58,88,.085);
  }
  .cr-branch-grid > button.is-active::after {
    opacity: 1;
  }
  .cr-branch-icon {
    color: var(--branch-accent);
    background: var(--branch-soft);
  }
  .cr-branch-copy strong {
    color: #263753;
    font-size: 11px;
  }
  .cr-branch-fit strong {
    color: var(--branch-accent);
  }

  .cr-branch-focus {
    border-color: #c5d0dd;
    background: #edf2f7;
  }
  .cr-branch-story {
    padding: 16px 18px;
    background:
      radial-gradient(circle at 94% 10%, rgba(74,101,163,.08), transparent 28%),
      linear-gradient(115deg, #e5ecf6, #f4f7fa);
  }
  .cr-branch-story h3 {
    color: #1b2b47;
    font-size: 18px;
  }
  .cr-threshold {
    border: 1px solid #ead1ad;
    border-left: 3px solid #d99039;
    border-radius: 8px;
    background: linear-gradient(135deg, #fff8ed, #faeddc);
  }

  /* Candidate discovery reads as editorial evidence, not a generic table. */
  .cr-candidate-list {
    padding: 6px;
    background: #e9eef4;
  }
  .cr-candidate-list > article {
    margin-bottom: 5px;
    border: 1px solid #d0d9e5;
    border-radius: 9px;
    background: rgba(250,252,254,.88);
    box-shadow: 0 3px 9px rgba(43,56,81,.03);
  }
  .cr-candidate-list > article:last-child {
    margin-bottom: 0;
    border-bottom: 1px solid #d0d9e5;
  }
  .cr-candidate-list > article.is-selected {
    border-color: #9cb2dc;
    background:
      linear-gradient(90deg, #e0eafb 0%, #edf3fb 58%, #f8fafc 100%);
    box-shadow:
      inset 4px 0 0 #2457d6,
      0 8px 17px rgba(43,65,106,.075);
  }
  .cr-rank {
    display: grid;
    width: 21px;
    height: 25px;
    place-items: center;
    border-radius: 6px;
    color: #53637a;
    background: #e1e7ef;
  }
  .cr-candidate-list > article.is-selected .cr-rank {
    color: #fff;
    background: #2457d6;
  }
  .cr-person > strong {
    color: #21324f;
    font-size: 12px;
  }
  .cr-person > span {
    border: 1px solid #d0d8e4;
    background: #edf1f6;
  }
  .cr-proof b {
    min-width: 45px;
  }
  .cr-fit strong {
    color: #1b2d4c;
  }
  .cr-row-actions button {
    box-shadow: 0 1px 2px rgba(40,54,80,.035);
  }

  /* Evidence inspector gets a richer analytical hierarchy. */
  .cr-inspector {
    border-color: #b8c5d7;
    background: #f7f9fc;
    box-shadow:
      0 15px 32px rgba(39,53,80,.09),
      0 1px 0 rgba(255,255,255,.86) inset;
  }
  .cr-inspector-head {
    border-color: #c1cede;
    background:
      radial-gradient(circle at 98% 0%, rgba(92,115,175,.17), transparent 34%),
      linear-gradient(130deg, #dde7f5, #f0f4fa);
  }
  .cr-inspector-head h2 {
    color: #172743;
    font-weight: 780;
  }
  .cr-score {
    border-color: #bcc9da;
  }
  .cr-score strong {
    color: #1e4eb9;
  }
  .cr-inspector-tabs {
    border-color: #cbd5e2;
    background: #e8edf4;
  }
  .cr-inspector-tabs button.is-active {
    background: linear-gradient(135deg, #20365f, #315181);
  }
  .cr-inspector-body {
    background:
      linear-gradient(180deg, rgba(251,252,254,.96), rgba(244,247,250,.96));
  }
  .cr-ai-label {
    width: max-content;
    border-radius: 6px;
    padding: 4px 6px;
    color: #6542ac;
    background: #eee8f7;
  }
  .cr-summary {
    color: #46566e;
    font-size: 11px;
  }
  .cr-signal-grid > div {
    border: 1px solid #d2dbe6;
    border-top: 3px solid var(--signal);
    border-radius: 8px;
    background: linear-gradient(150deg, rgba(255,255,255,.72), var(--signal-bg));
  }
  .cr-evidence-block {
    border-top: 1px solid #dce3ec;
    padding-top: 14px;
  }
  .cr-evidence-block li {
    border-bottom: 1px solid #e1e6ed;
    padding-bottom: 7px;
  }
  .cr-evidence-block li:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }
  .cr-relaxation {
    border: 1px solid #ead3b4;
    border-left: 3px solid #dc9239;
    border-radius: 8px;
    background: linear-gradient(135deg, #fff8ed, #f9ecdc);
  }
  .cr-skill {
    margin-top: 5px;
    border: 1px solid #d9e0e9;
    border-radius: 8px;
    padding: 8px;
    background: rgba(255,255,255,.64);
  }
  .cr-skill:last-child {
    border-bottom: 1px solid #d9e0e9;
  }
  .cr-inspector-actions {
    border-color: #cbd5e2;
    background: linear-gradient(180deg, #e9eff6, #eef3f8);
  }

  /* Bridge planning has a distinct, restrained intelligence tone. */
  .cr-route-head {
    border: 1px solid #d2c8e3;
    border-left: 3px solid #7654b4;
    border-radius: 9px;
    padding: 10px;
    background:
      radial-gradient(circle at 95% 0%, rgba(109,76,196,.12), transparent 33%),
      linear-gradient(145deg, #f2eef8, #faf9fc);
  }
  .cr-pay {
    border-color: #c3cfe0;
    border-radius: 8px;
    background: linear-gradient(135deg, #edf3fb, #f7f9fc);
  }
  .cr-bridge-section {
    border-top: 1px solid #dce2eb;
    padding-top: 12px;
  }
  .cr-course-list article {
    border-color: #cec6dd;
    background: linear-gradient(145deg, #fff, #f5f2f9);
    box-shadow: 0 5px 12px rgba(60,47,88,.035);
  }

  .cr-compare-tray {
    border-color: #bdc9d8;
    background: linear-gradient(135deg, #e4ebf4, #f1f4f8);
    box-shadow: 0 10px 24px rgba(38,52,78,.065);
  }
  .cr-compare-grid {
    background: #e9eef4;
  }
  .cr-compare-grid > article {
    border-color: #c3cfde;
    border-top-color: #2457d6;
    background: linear-gradient(150deg, #fff, #f2f5f9);
    box-shadow: 0 7px 16px rgba(43,57,84,.045);
  }

  @media (max-width: 620px) {
    .cr::before {
      background-size: 34px 34px;
    }
    .cr-command-insight {
      border-color: #243961;
    }
    .cr-candidate-list {
      padding: 4px;
    }
  }
`;
