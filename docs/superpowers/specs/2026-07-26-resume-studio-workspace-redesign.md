# Resume Studio Workspace Redesign

**Goal:** make Resume Studio feel like a focused professional editing surface for a hackathon demo, not a dashboard plus document preview.

## Visual direction

Use a restrained editorial workspace. The résumé is the primary artifact and occupies the centre of the page. Job-description context sits in a narrow left rail; suggestions and exports sit in a narrow right rail. The only strong accent is brass (`#B4862A`) for the active role, primary action, and fit signal. Body surfaces stay warm white with ink-blue text and hairline neutral borders.

The memorable element is a slim vertical fit meter pinned alongside the résumé sheet. It names the active role, shows the current match percentage, and visually connects the recommendation queue to the document being changed.

## Layout

Desktop uses three columns:

```text
JD rail       Résumé canvas + fit meter                  Review rail
roles         name / contact / editable sections         current suggestions
paste/upload  no dashboard scorecards                    template / exports
analyze       save state                                 
```

- The command bar contains upload, save state, and one `Analyze roles` action.
- The left rail contains tabs, JD upload/paste, and analysis status.
- Remove the four-card scoreboard and standalone missing-keyword strip.
- The résumé canvas uses visible but quiet fields, not large boxed controls.
- The right rail shows only the active role's suggestions and exports.
- On narrow screens, rails stack above and below the canvas; actions remain reachable.

## Interaction and copy

- Active JD tab is visibly selected and can be removed.
- Fit meter says `Match 78%` and lists only the missing terms for the selected role.
- Suggestions retain accept/reject controls. They should feel attached to the document, not like cards in a generic admin panel.
- Save status remains explicit: `Draft`, `Saving`, or `Saved`.
- Export template names stay `ATS Clean` and `Modern`; selection affects the generated document.

## Boundaries

- Preserve all existing upload, parsing, OCR, local cache, Supabase save, AI, and export behavior.
- Do not add new dependencies or new data models.
- Keep existing design tokens and responsive basics where possible.

## Verification

- Existing lint, typecheck, unit tests, and production build pass.
- Inspect the Studio at desktop and narrow widths after the layout change.
