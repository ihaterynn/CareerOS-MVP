export const jobbyStyles = `
  .jobby-page {
    --jobby-navy: #13233f;
    --jobby-blue: #496fd6;
    --jobby-mint: #20a477;
    --jobby-gold: #b58b35;
    position: relative;
    max-width: 1540px;
    margin: 0 auto;
  }

  .jobby-hero {
    position: relative;
    isolation: isolate;
    min-height: 214px;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(280px, 390px);
    align-items: center;
    gap: 32px;
    padding: clamp(28px, 4vw, 48px);
    color: #fff;
    border: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
    border-radius: 26px;
    background:
      linear-gradient(120deg, rgba(19, 35, 63, .98), rgba(35, 55, 91, .97) 60%, rgba(69, 71, 110, .94)),
      radial-gradient(circle at 80% 20%, rgba(188, 155, 80, .5), transparent 36%);
    box-shadow: 0 24px 70px rgba(19, 35, 63, .18);
    animation: jobby-rise .65s var(--ease) both;
  }

  .jobby-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    z-index: -1;
    opacity: .22;
    background-image:
      linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px);
    background-size: 34px 34px;
    mask-image: linear-gradient(90deg, #000, transparent 78%);
  }

  .jobby-orb {
    position: absolute;
    z-index: -1;
    border-radius: 999px;
    filter: blur(1px);
    opacity: .35;
    animation: jobby-float 8s ease-in-out infinite;
  }
  .jobby-orb.orb-one {
    width: 220px;
    height: 220px;
    right: 19%;
    top: -135px;
    background: radial-gradient(circle, #d7b96f, transparent 69%);
  }
  .jobby-orb.orb-two {
    width: 180px;
    height: 180px;
    right: -35px;
    bottom: -100px;
    background: radial-gradient(circle, #7a7be5, transparent 70%);
    animation-delay: -3s;
  }

  .jobby-hero-copy { position: relative; z-index: 2; max-width: 770px; }
  .jobby-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 999px;
    background: rgba(255,255,255,.08);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .11em;
    text-transform: uppercase;
    color: #e6d7aa;
    backdrop-filter: blur(8px);
  }
  .jobby-hero h1 {
    margin-top: 14px;
    font-family: var(--font-sans);
    font-size: clamp(34px, 4.2vw, 57px);
    font-weight: 780;
    line-height: .98;
    letter-spacing: -.055em;
  }
  .jobby-hero h1 span { color: #dbba67; }
  .jobby-hero-copy > p {
    max-width: 700px;
    margin: 15px 0 0;
    font-size: clamp(14px, 1.35vw, 17px);
    line-height: 1.65;
    color: rgba(255,255,255,.72);
  }
  .jobby-trust {
    display: flex;
    flex-wrap: wrap;
    gap: 9px 16px;
    margin-top: 20px;
    font-size: 11px;
    font-weight: 650;
    color: rgba(255,255,255,.72);
  }
  .jobby-trust span { display: inline-flex; align-items: center; gap: 6px; }
  .jobby-trust svg { color: #dfbd68; }

  .jobby-role-control {
    position: relative;
    z-index: 2;
    padding: 17px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 17px;
    background: rgba(255,255,255,.09);
    box-shadow: inset 0 1px rgba(255,255,255,.09), 0 14px 35px rgba(5,12,28,.16);
    backdrop-filter: blur(18px);
  }
  .jobby-role-control > label {
    display: block;
    margin-bottom: 8px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: #e4d3a1;
  }
  .jobby-select-wrap {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    min-height: 46px;
    padding: 0 13px;
    border: 1px solid rgba(255,255,255,.17);
    border-radius: 12px;
    background: rgba(9,18,36,.32);
  }
  .jobby-select-wrap select {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    appearance: none;
    background: transparent;
    color: #fff;
    font-size: 13px;
    font-weight: 750;
    cursor: pointer;
  }
  .jobby-select-wrap option { color: #15233e; background: #fff; }
  .jobby-role-control > p { margin: 9px 2px 0; font-size: 10.5px; color: rgba(255,255,255,.55); }

  .jobby-scope-strip {
    position: relative;
    z-index: 3;
    display: grid;
    grid-template-columns: minmax(190px, 1.3fr) repeat(3, minmax(108px, .7fr)) minmax(220px, 1fr);
    align-items: center;
    gap: 10px;
    margin: -12px 20px 0;
    padding: 11px 13px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: color-mix(in srgb, var(--surface) 94%, transparent);
    box-shadow: var(--shadow);
    backdrop-filter: blur(16px);
    animation: jobby-rise .55s .12s var(--ease) both;
  }
  .jobby-scope-title, .jobby-scope-title > span:last-child, .jobby-metric, .jobby-metric > span:last-child {
    display: flex;
    align-items: center;
  }
  .jobby-scope-title { gap: 10px; padding: 4px 8px; }
  .jobby-scope-title > span:last-child, .jobby-metric > span:last-child { align-items: flex-start; flex-direction: column; }
  .jobby-scope-title strong, .jobby-metric strong { font-size: 12px; color: var(--text); }
  .jobby-scope-title small, .jobby-metric small { margin-top: 2px; font-size: 9.5px; color: var(--text-3); }
  .jobby-live-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #20a477;
    box-shadow: 0 0 0 5px rgba(32,164,119,.12);
    animation: jobby-live 2s ease-in-out infinite;
  }
  .jobby-metric { gap: 8px; padding: 5px 8px; border-left: 1px solid var(--border); }
  .jobby-metric-icon {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    border-radius: 9px;
    color: var(--metric-tone);
    background: color-mix(in srgb, var(--metric-tone) 12%, var(--surface));
  }
  .jobby-metric strong { font-size: 15px; line-height: 1; }
  .jobby-scope-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 9px 10px;
    border: 1px solid color-mix(in srgb, var(--risk-good) 24%, var(--border));
    border-radius: 10px;
    background: color-mix(in srgb, var(--risk-good-bg) 72%, var(--surface));
    color: var(--risk-good);
    font-size: 10px;
    font-weight: 750;
  }

  .jobby-workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 350px;
    gap: 15px;
    margin-top: 15px;
    animation: jobby-rise .6s .2s var(--ease) both;
  }
  .jobby-chat-card, .jobby-context-card {
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 21px;
    background: color-mix(in srgb, var(--surface) 96%, transparent);
    box-shadow: var(--shadow);
  }
  .jobby-chat-card {
    min-height: 690px;
    display: grid;
    grid-template-rows: auto minmax(390px, 1fr) auto auto auto;
  }
  .jobby-chat-head, .jobby-context-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 15px 17px;
    border-bottom: 1px solid var(--border);
  }
  .jobby-chat-head > div, .jobby-context-head > span:first-child {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .jobby-chat-head > div > span:last-child, .jobby-context-head > span:first-child {
    align-items: flex-start;
    flex-direction: column;
  }
  .jobby-chat-head strong, .jobby-context-head strong { font-size: 12px; color: var(--text); }
  .jobby-chat-head small, .jobby-context-head small { margin-top: 2px; font-size: 9.5px; color: var(--text-3); }
  .jobby-bot-mark {
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
    border-radius: 11px;
    color: #fff;
    background: linear-gradient(135deg, #4f6fd3, #8065cb);
    box-shadow: 0 7px 18px rgba(79,111,211,.25);
  }
  .jobby-chat-head > button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 9px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--surface-2);
    color: var(--text-2);
    font-size: 10px;
    font-weight: 700;
    transition: .2s var(--ease);
  }
  .jobby-chat-head > button:hover { color: var(--text); border-color: var(--border-2); transform: translateY(-1px); }

  .jobby-messages {
    overflow-y: auto;
    scroll-behavior: smooth;
    padding: 20px clamp(14px, 2vw, 25px);
    background:
      radial-gradient(circle at 10% 0%, rgba(79,111,211,.045), transparent 26%),
      linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 32%, transparent), transparent 28%);
  }
  .jobby-message {
    display: grid;
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 9px;
    max-width: 850px;
    margin-bottom: 18px;
    animation: jobby-message-in .42s var(--ease) both;
  }
  .jobby-message.user {
    grid-template-columns: minmax(0, 1fr);
    max-width: min(76%, 700px);
    margin-left: auto;
  }
  .jobby-message-mark {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: 1px solid color-mix(in srgb, #5a70d8 25%, var(--border));
    border-radius: 9px;
    color: #6078dc;
    background: color-mix(in srgb, #6078dc 9%, var(--surface));
  }
  .jobby-bubble {
    position: relative;
    padding: 13px 15px;
    border: 1px solid var(--border);
    border-radius: 5px 16px 16px;
    background: var(--surface);
    box-shadow: 0 5px 18px rgba(18,31,58,.045);
  }
  .jobby-message.user .jobby-bubble {
    border-color: transparent;
    border-radius: 16px 16px 5px;
    color: #fff;
    background: linear-gradient(135deg, #273a62, #3e5587);
    box-shadow: 0 8px 22px rgba(31,48,85,.16);
  }
  .jobby-rich-text h4 {
    margin: 0 0 7px;
    font-family: var(--font-sans);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -.01em;
    color: inherit;
  }
  .jobby-rich-text p {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.68;
    color: var(--text-2);
    white-space: pre-wrap;
  }
  .jobby-message.user .jobby-rich-text p { color: rgba(255,255,255,.9); }
  .jobby-rich-text .jobby-bullet { padding-left: 4px; }
  .jobby-text-gap { display: block; height: 8px; }
  .jobby-copy {
    position: absolute;
    right: 7px;
    bottom: -24px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 5px;
    border: 0;
    background: transparent;
    color: var(--text-3);
    font-size: 9px;
    opacity: 0;
    transition: opacity .2s;
  }
  .jobby-message:hover .jobby-copy { opacity: 1; }

  .jobby-sources {
    margin-top: 12px;
    padding-top: 11px;
    border-top: 1px solid var(--border);
  }
  .jobby-source-label {
    display: block;
    margin-bottom: 7px;
    font-family: var(--font-mono);
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--text-3);
  }
  .jobby-source-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)); gap: 6px; }
  .jobby-source-grid button {
    display: grid;
    grid-template-columns: auto minmax(0,1fr) auto;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 10px;
    text-align: left;
    background: var(--surface-2);
    transition: .2s var(--ease);
  }
  .jobby-source-grid button:hover { border-color: var(--accent-line); background: var(--surface); transform: translateY(-1px); }
  .jobby-source-avatar {
    display: grid;
    place-items: center;
    width: 27px;
    height: 27px;
    border-radius: 8px;
    background: var(--text);
    color: var(--surface);
    font-size: 8px;
    font-weight: 800;
  }
  .jobby-source-grid button > span:nth-child(2) { display: flex; flex-direction: column; min-width: 0; }
  .jobby-source-grid strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 9.5px; color: var(--text); }
  .jobby-source-grid small { margin-top: 2px; font-size: 8px; color: var(--text-3); }
  .jobby-source-grid b { font-family: var(--font-mono); font-size: 9px; color: var(--accent); }

  .jobby-followups {
    grid-column: 2;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 7px;
  }
  .jobby-followups button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 8px;
    border: 1px solid color-mix(in srgb, #5c73d8 25%, var(--border));
    border-radius: 999px;
    color: color-mix(in srgb, #5c73d8 85%, var(--text));
    background: color-mix(in srgb, #5c73d8 6%, var(--surface));
    font-size: 9px;
    font-weight: 700;
    transition: .2s;
  }
  .jobby-followups button:hover { transform: translateY(-1px); background: color-mix(in srgb, #5c73d8 11%, var(--surface)); }

  .jobby-thinking { display: flex; align-items: center; gap: 4px; min-height: 46px; }
  .jobby-thinking > span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6578d4;
    animation: dot-bounce 1.2s infinite;
  }
  .jobby-thinking > span:nth-child(2) { animation-delay: .14s; }
  .jobby-thinking > span:nth-child(3) { animation-delay: .28s; }
  .jobby-thinking small { margin-left: 6px; color: var(--text-3); font-size: 9.5px; }

  .jobby-quick-row {
    display: flex;
    gap: 7px;
    overflow-x: auto;
    padding: 10px 15px 0;
    border-top: 1px solid var(--border);
    background: var(--surface);
  }
  .jobby-quick-row button {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: 9px;
    background: var(--surface-2);
    color: var(--text-2);
    font-size: 9.5px;
    font-weight: 700;
    transition: .2s var(--ease);
  }
  .jobby-quick-row button:hover:not(:disabled) {
    color: var(--text);
    border-color: var(--accent-line);
    background: var(--accent-soft);
    transform: translateY(-1px);
  }
  .jobby-quick-row button:disabled { opacity: .45; cursor: not-allowed; }

  .jobby-composer {
    display: grid;
    grid-template-columns: minmax(0,1fr) 42px;
    align-items: end;
    gap: 8px;
    margin: 10px 15px 6px;
    padding: 7px 7px 7px 13px;
    border: 1px solid var(--border-2);
    border-radius: 14px;
    background: var(--surface-2);
    box-shadow: inset 0 1px 2px rgba(20,34,61,.025);
    transition: .2s;
  }
  .jobby-composer:focus-within {
    border-color: color-mix(in srgb, #5f75d8 48%, var(--border));
    box-shadow: 0 0 0 4px rgba(95,117,216,.08);
    background: var(--surface);
  }
  .jobby-composer textarea {
    width: 100%;
    min-height: 38px;
    max-height: 120px;
    resize: none;
    padding: 9px 0 5px;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font-size: 11px;
    line-height: 1.5;
  }
  .jobby-composer textarea::placeholder { color: var(--text-3); }
  .jobby-composer > button {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 11px;
    color: #fff;
    background: linear-gradient(135deg, #4f6fd3, #7056c7);
    box-shadow: 0 7px 16px rgba(79,111,211,.23);
    transition: .2s var(--ease);
  }
  .jobby-composer > button:hover:not(:disabled) { transform: translateY(-2px) scale(1.02); }
  .jobby-composer > button:disabled { opacity: .38; box-shadow: none; cursor: not-allowed; }
  .jobby-composer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 15px 11px;
    font-size: 8.5px;
    color: var(--text-3);
  }
  .jobby-error {
    margin: 0 15px 12px;
    padding: 8px 10px;
    border: 1px solid color-mix(in srgb, var(--risk-bad) 25%, var(--border));
    border-radius: 9px;
    background: var(--risk-bad-bg);
    color: var(--risk-bad);
    font-size: 9.5px;
    font-weight: 650;
  }

  .jobby-context-card {
    align-self: start;
    max-height: 760px;
    display: flex;
    flex-direction: column;
  }
  .jobby-context-head > span:first-child { display: flex; }
  .jobby-count {
    display: grid;
    place-items: center;
    min-width: 29px;
    height: 29px;
    padding: 0 7px;
    border-radius: 9px;
    background: var(--accent-soft);
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 800;
  }
  .jobby-context-filter {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 11px 12px 5px;
    padding: 8px 10px;
    border-radius: 9px;
    color: var(--text-3);
    background: var(--surface-2);
    font-size: 9px;
  }
  .jobby-candidate-list {
    overflow-y: auto;
    display: grid;
    gap: 2px;
    padding: 6px 8px 10px;
  }
  .jobby-candidate {
    display: grid;
    grid-template-columns: auto minmax(0,1fr) auto;
    align-items: center;
    gap: 9px;
    width: 100%;
    padding: 10px 8px;
    border: 1px solid transparent;
    border-radius: 12px;
    text-align: left;
    background: transparent;
    transition: .2s var(--ease);
  }
  .jobby-candidate:hover {
    border-color: var(--border);
    background: var(--surface-2);
    transform: translateX(2px);
  }
  .jobby-avatar {
    display: grid;
    place-items: center;
    width: 35px;
    height: 35px;
    border-radius: 11px;
    color: #fff;
    background: linear-gradient(145deg, #26395f, #526b9d);
    font-size: 9px;
    font-weight: 800;
    box-shadow: 0 5px 12px rgba(25,41,73,.13);
  }
  .jobby-candidate-copy { min-width: 0; display: flex; flex-direction: column; }
  .jobby-candidate-name { display: flex; align-items: center; gap: 5px; min-width: 0; font-size: 9.5px; font-weight: 800; color: var(--text); }
  .jobby-candidate-role {
    overflow: hidden;
    margin-top: 2px;
    color: var(--text-2);
    font-size: 8.5px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jobby-candidate-evidence {
    overflow: hidden;
    margin-top: 3px;
    color: var(--text-3);
    font-size: 7.8px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .jobby-source {
    flex: 0 0 auto;
    padding: 2px 4px;
    border-radius: 5px;
    font-family: var(--font-mono);
    font-size: 6.5px;
    font-weight: 700;
    text-transform: uppercase;
  }
  .jobby-source.applied { color: #4269c5; background: rgba(73,111,214,.11); }
  .jobby-source.shortlisted { color: #16855f; background: rgba(32,164,119,.11); }
  .jobby-source.relevant { color: #9a7429; background: rgba(181,139,53,.12); }
  .jobby-score {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 800;
    color: var(--accent);
  }
  .jobby-score small { font-size: 6px; }
  .jobby-requirements {
    margin-top: auto;
    padding: 13px;
    border-top: 1px solid var(--border);
    background: var(--surface-2);
  }
  .jobby-requirements > div { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; }
  .jobby-requirements > div > span {
    padding: 4px 6px;
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--surface);
    color: var(--text-2);
    font-size: 7.5px;
    font-weight: 650;
  }
  .jobby-empty { display: grid; place-items: center; padding: 36px 15px; text-align: center; color: var(--text-3); }
  .jobby-empty strong { margin-top: 8px; font-size: 10px; color: var(--text-2); }
  .jobby-empty p { margin: 5px 0 0; font-size: 8.5px; }
  .jobby-spin { animation: spin .8s linear infinite; }

  @keyframes jobby-rise {
    from { opacity: 0; transform: translateY(15px) scale(.992); }
    to { opacity: 1; transform: none; }
  }
  @keyframes jobby-message-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes jobby-live {
    0%, 100% { box-shadow: 0 0 0 4px rgba(32,164,119,.1); }
    50% { box-shadow: 0 0 0 8px rgba(32,164,119,.02); }
  }
  @keyframes jobby-float {
    0%, 100% { transform: translate3d(0,0,0) scale(1); }
    50% { transform: translate3d(8px,12px,0) scale(1.06); }
  }

  @media (max-width: 1180px) {
    .jobby-workspace { grid-template-columns: minmax(0, 1fr) 310px; }
    .jobby-scope-strip { grid-template-columns: 1fr repeat(3, .65fr); }
    .jobby-scope-note { display: none; }
  }
  @media (max-width: 900px) {
    .jobby-hero { grid-template-columns: 1fr; }
    .jobby-role-control { max-width: 520px; }
    .jobby-workspace { grid-template-columns: 1fr; }
    .jobby-context-card { max-height: none; }
    .jobby-candidate-list { max-height: 420px; }
  }
  @media (max-width: 620px) {
    .jobby-hero { padding: 25px 20px; border-radius: 20px; }
    .jobby-scope-strip { grid-template-columns: repeat(3, 1fr); margin-inline: 8px; }
    .jobby-scope-title { grid-column: 1 / -1; }
    .jobby-metric { border-left: 0; padding-inline: 3px; }
    .jobby-metric-icon { display: none; }
    .jobby-chat-card { min-height: 640px; }
    .jobby-message.user { max-width: 88%; }
    .jobby-followups { grid-column: 1 / -1; }
    .jobby-composer-note { text-align: center; line-height: 1.45; }
  }
`;
