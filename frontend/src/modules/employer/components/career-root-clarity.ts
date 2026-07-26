export const careerRootClarity = `
  /* Hierarchy and density refinement from the final Career Root review. */
  .cr-command {
    grid-template-columns: minmax(0, 1.5fr) minmax(300px, .5fr);
    background: linear-gradient(105deg, #f8fafe 0%, #edf2f9 100%);
  }
  .cr-command-insight {
    border-color: #c2cddd;
    color: #1d2c47;
    background:
      radial-gradient(circle at 100% 0%, rgba(95,119,177,.12), transparent 45%),
      linear-gradient(140deg, #e8eef7, #f2f5fa);
  }
  .cr-insight-copy > span {
    color: #6546a9;
    font-size: 11px;
  }
  .cr-insight-copy > strong {
    color: #1b2a45;
    font-size: 17px;
    line-height: 1.25;
  }
  .cr-insight-copy p {
    color: #536278;
    font-size: 11px;
  }
  .cr-recommend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    border: 0;
    border-radius: 8px;
    margin-top: 12px;
    padding: 8px 11px;
    color: #fff;
    background: #2457d6;
    font-size: 10px;
    font-weight: 750;
    box-shadow: 0 6px 14px rgba(36,87,214,.16);
  }
  .cr-recommend:hover {
    background: #1b49bb;
    transform: translateY(-1px);
  }

  .cr-main {
    grid-template-columns: minmax(0, 1.72fr) minmax(292px, .48fr);
    gap: 16px;
  }
  .cr-explorer {
    min-height: 650px;
  }
  .cr-section-head {
    padding: 20px 20px 18px;
  }
  .cr-section-head h2 {
    font-family: var(--font-serif);
    font-size: 22px;
    font-weight: 650;
  }
  .cr-role-root {
    width: min(500px, calc(100% - 34px));
    margin-top: 28px;
    margin-bottom: 40px;
    padding: 16px 18px;
  }
  .cr-role-root::after {
    bottom: -41px;
    height: 40px;
    width: 2px;
  }
  .cr-role-root h3 {
    font-family: var(--font-sans);
    font-size: 17px;
  }

  .cr-branch-grid {
    gap: 16px;
    padding: 0 20px 28px;
  }
  .cr-branch-grid::before {
    inset: -20px 9% auto;
    height: 2px;
  }
  .cr-branch-grid > button {
    grid-template-columns: 25px 36px minmax(0,1fr) 49px;
    align-items: start;
    min-height: 128px;
    border-color: transparent;
    border-radius: 12px;
    padding: 14px 12px;
    box-shadow: 0 7px 17px rgba(40,55,83,.055);
  }
  .cr-branch-grid > button::before {
    top: -22px;
    width: 2px;
    height: 21px;
    box-shadow: 0 -3px 0 2px #edf2f7, 0 -3px 0 4px #899fc2;
  }
  .cr-branch-grid > button:nth-child(2):not(.is-active) {
    transform: translateY(5px);
  }
  .cr-branch-grid > button:nth-child(3):not(.is-active) {
    transform: translateY(10px);
  }
  .cr-branch-grid > button:hover,
  .cr-branch-grid > button.is-active {
    transform: translateY(-2px);
  }
  .cr-branch-grid > button.is-active {
    border-color: var(--branch-accent);
  }
  .cr-branch-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
  }
  .cr-branch-copy {
    display: grid;
    align-content: start;
    gap: 4px;
  }
  .cr-branch-copy em {
    width: max-content;
    border-radius: 5px;
    padding: 3px 5px;
    color: #657187;
    background: #e6ebf2;
    font-size: 8px;
    font-style: normal;
    font-weight: 750;
  }
  .cr-branch-copy em[data-state="exploring"] {
    color: #fff;
    background: #2457d6;
  }
  .cr-branch-copy em[data-state="primary"] {
    color: #273a59;
    background: #dbe3ef;
  }
  .cr-branch-copy strong {
    margin-top: 2px;
    font-size: 12px;
  }
  .cr-branch-copy small {
    overflow: visible;
    color: #5f6d81;
    font-size: 9px;
    line-height: 1.35;
    text-overflow: clip;
    white-space: normal;
  }
  .cr-branch-copy .cr-branch-count {
    color: var(--branch-accent);
    font-weight: 750;
  }
  .cr-branch-fit {
    align-self: center;
  }

  .cr-branch-story {
    display: block;
    padding: 20px 22px 17px;
  }
  .cr-branch-story > div:first-child > span {
    font-size: 10px;
  }
  .cr-branch-story h3 {
    font-family: var(--font-serif);
    font-size: 21px;
    font-weight: 650;
  }
  .cr-branch-story p {
    max-width: 780px;
    font-size: 11px;
  }
  .cr-threshold-inline {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 10px;
    color: #754718;
    font-size: 10px;
    line-height: 1.45;
  }
  .cr-threshold-inline > i {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    margin-top: 4px;
    border-radius: 50%;
    background: #d58b34;
  }
  .cr-threshold-inline strong {
    flex: 0 0 auto;
    color: #9a5816;
  }
  .cr-threshold-inline span {
    color: #674b2e;
  }

  .cr-candidate-list {
    padding: 10px;
  }
  .cr-candidate-list > article {
    min-height: 106px;
    border-color: transparent;
    padding: 15px 14px;
  }
  .cr-candidate-list > article.is-selected {
    border-color: #9cb2dc;
  }
  .cr-proof {
    gap: 9px;
  }
  .cr-proof > span {
    display: grid;
    gap: 3px;
    overflow: visible;
    white-space: normal;
  }
  .cr-proof b {
    min-width: 0;
    margin: 0;
    padding: 0;
    color: #087d68;
    background: transparent;
    text-align: left;
    font-size: 9px;
  }
  .cr-proof span:last-child b {
    color: #a65b13;
    background: transparent;
  }
  .cr-proof small {
    overflow: hidden;
    color: #526075;
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cr-inspector {
    box-shadow: 0 10px 24px rgba(39,53,80,.065);
  }
  .cr-inspector-head {
    padding: 17px 15px;
  }
  .cr-inspector-tabs {
    gap: 6px;
    padding: 7px;
  }
  .cr-inspector-tabs button {
    min-height: 38px;
    font-size: 10px;
  }
  .cr-inspector-body {
    max-height: calc(100vh - 340px);
    padding: 17px;
  }
  .cr-signal-grid {
    gap: 8px;
  }
  .cr-signal-grid > div {
    padding: 10px;
  }
  .cr-evidence-block h3,
  .cr-skills h3,
  .cr-bridge-section h3,
  .cr-course-list > h3 {
    font-size: 11px;
  }
  .cr-evidence-block li,
  .cr-bridge-section li {
    font-size: 10px;
  }
  .cr-disclosure {
    border-top: 1px solid #d9e1ea;
    margin-top: 13px;
    padding-top: 2px;
  }
  .cr-disclosure summary {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    gap: 7px;
    min-height: 42px;
    color: #3c4c65;
    cursor: pointer;
    list-style: none;
    font-size: 10px;
    font-weight: 750;
  }
  .cr-disclosure summary::-webkit-details-marker {
    display: none;
  }
  .cr-disclosure summary > span {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .cr-disclosure summary > span svg {
    color: #6577a1;
  }
  .cr-disclosure summary > b {
    display: grid;
    min-width: 21px;
    height: 21px;
    padding: 0 5px;
    place-items: center;
    border-radius: 6px;
    color: #5d6c82;
    background: #e8edf4;
    font-size: 8px;
  }
  .cr-disclosure summary > svg {
    color: #758196;
    transition: transform .18s ease;
  }
  .cr-disclosure[open] summary > svg {
    transform: rotate(180deg);
  }
  .cr-disclosure-body {
    border-left: 2px solid #d79543;
    margin: 1px 0 10px 3px;
    padding: 8px 10px;
    background: #fff7eb;
  }
  .cr-disclosure-body p {
    margin: 0;
    color: #674b2d;
    font-size: 10px;
    line-height: 1.45;
  }
  .cr-disclosure-body small {
    display: block;
    margin-top: 5px;
    color: #9a5b1d;
    font-size: 9px;
  }
  .cr-disclosure .cr-skills {
    margin-top: 0;
    padding-bottom: 8px;
  }
  .cr-supporting-list {
    display: grid;
    gap: 6px;
    margin: 0 0 9px;
    padding: 0 0 0 17px;
    color: #536177;
    font-size: 10px;
    line-height: 1.4;
  }
  .cr-inspector-actions {
    padding: 13px 15px 16px;
  }
  .cr-primary,
  .cr-secondary {
    min-height: 39px;
    font-size: 10px;
  }
  .cr-role-line select,
  .cr-sort select {
    min-height: 38px;
    font-size: 10px;
  }
  .cr-lens-toggle button {
    min-height: 38px;
    padding-inline: 14px;
    font-size: 10px;
  }
  .cr-row-actions button {
    min-height: 32px;
    font-size: 9px;
  }

  @media (max-width: 1260px) {
    .cr-command {
      grid-template-columns: 1fr;
    }
    .cr-main {
      grid-template-columns: 1fr;
    }
    .cr-inspector-body {
      max-height: none;
    }
  }
  @media (max-width: 860px) {
    .cr-branch-grid > button:nth-child(2):not(.is-active),
    .cr-branch-grid > button:nth-child(3):not(.is-active) {
      transform: none;
    }
    .cr-branch-grid > button {
      min-height: 112px;
    }
  }
  @media (max-width: 620px) {
    .cr-threshold-inline {
      display: grid;
      grid-template-columns: 8px 1fr;
    }
    .cr-threshold-inline span {
      grid-column: 2;
    }
    .cr-proof small {
      white-space: normal;
    }
  }
`;
