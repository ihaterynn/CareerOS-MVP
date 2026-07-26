"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { downloadResumeDocx, downloadResumePdf } from "../export";
import { extractResumeText, extractScannedPdfText } from "../file-text";
import { parseResumeImport, resumeContentKey } from "../document";
import { freshAnalysisSuggestions, type RefinementTarget } from "../analysis";
import { formattingChecks, isGrammarRewrite, isOneClickSafe, isRecommendation, personalDetailChecks, resumeQuality, suggestionPhase, type OptimizationPhase } from "../optimization";
import { applyRefinement, refinementFrames, refinementTarget, type Refinement } from "../refinement";
import type { Jd, Resume, StudioData, Suggestion } from "../types";
import { Toast } from "../../tracker/components/toast";
import "./studio-workspace.css";

type StudioJd = Jd & { id: string; text: string };
type Analysis = { atsScore: number; qualityScore: number; missing: string[]; suggestions: Suggestion[]; refinementTargets: RefinementTarget[]; key?: string };
type StoredStudio = { resume: Resume; resumeId?: string; versionId?: string; jds: StudioJd[]; analysis: Record<string, Analysis>; lastSavedAt?: number };
type JdPreview = { kind: "pdf" | "docx"; source: string };
type ResumeVersion = { id: string; number: number; content: Resume; createdAt: string };
type OptimizationProgress = { percent: number; phase: OptimizationPhase };
type CachedRefinement = { state: "loading" | "ready" | "applying" | "applied" | "error"; sourceKey?: string; refinement?: Refinement; error?: string };

const storageKey = (applicationId?: string) => `careeros.resume-studio.v1.${applicationId || "standalone"}`;
const valueKey = (resume: Resume, jd: StudioJd) => JSON.stringify([resumeContentKey(resume), jd.text]);
const suggestionTarget = (suggestion: Suggestion) => suggestion.field === "summary" ? "summary" : suggestion.ei != null && suggestion.bi != null ? `exp:${suggestion.ei}:${suggestion.bi}` : suggestion.id;
const cachedRefinementKey = (target: "summary" | "experience", experienceIndex?: number, suffix = "") => `${target}:${experienceIndex ?? ""}:${suffix}`;

export function StudioPanel({ data, applicationId }: { data: StudioData; applicationId?: string }) {
  const seededJds = useMemo<StudioJd[]>(() => data.jds.map((item, index) => ({ ...item, id: `seed-${index}`, text: item.text || item.label })), [data.jds]);
  const seededAnalysis = useMemo<Record<string, Analysis>>(() => Object.fromEntries(seededJds.map((item, index) => [item.id, { atsScore: data.atsScore, qualityScore: data.atsScore, missing: item.missing, suggestions: index === 0 ? data.suggestions : [], refinementTargets: [] }])), [data, seededJds]);
  const [resume, setResume] = useState(data.resume);
  const [jds, setJds] = useState(seededJds);
  const [analysis, setAnalysis] = useState(seededAnalysis);
  const [resumeId, setResumeId] = useState<string>();
  const [versionId, setVersionId] = useState<string>();
  const [activeJd, setActiveJd] = useState(0);
  const [exportOpen, setExportOpen] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [versionMenuOpen, setVersionMenuOpen] = useState(false);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [activePhase, setActivePhase] = useState<OptimizationPhase>("ats");
  const [lastSavedAt, setLastSavedAt] = useState<number>();
  const [jdInput, setJdInput] = useState("");
  const [targetRoleOpen, setTargetRoleOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState<"upload" | "ocr" | "analysis" | "save" | "export" | null>(null);
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [jdPreviews, setJdPreviews] = useState<Record<string, JdPreview>>({});
  const [viewingJdId, setViewingJdId] = useState<string>();
  const [typingSuggestionId, setTypingSuggestionId] = useState<string>();
  const [typingTarget, setTypingTarget] = useState<string>();
  const [appliedTarget, setAppliedTarget] = useState<string>();
  const [optimizationProgress, setOptimizationProgress] = useState<OptimizationProgress>();
  const [refinements, setRefinements] = useState<Record<string, CachedRefinement>>({});
  const [applyingRefinement, setApplyingRefinement] = useState<string>();
  const [verifiedEvidence, setVerifiedEvidence] = useState("");
  const [draftImproved, setDraftImproved] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const jdFileInput = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const lastSavedContent = useRef(resumeContentKey(data.resume));
  const undoHistory = useRef<Resume[]>([]);
  const resumeSnapshot = useRef(resume);
  const typingTimer = useRef<number | undefined>(undefined);
  const aiAppliedResumeKey = useRef<string | undefined>(undefined);
  const [undoAvailable, setUndoAvailable] = useState(false);

  const currentJd = jds[activeJd];
  const currentAnalysis = currentJd ? analysis[currentJd.id] || { atsScore: 0, qualityScore: 0, missing: [], suggestions: [], refinementTargets: [] } : { atsScore: 0, qualityScore: 0, missing: [], suggestions: [], refinementTargets: [] };
  const visibleSuggestions = currentAnalysis.suggestions.filter((suggestion) => !isGrammarRewrite(suggestion));
  const pending = visibleSuggestions.filter((item) => item.status === "pending");
  const accepted = visibleSuggestions.filter((item) => item.status === "accepted");
  const resumeKey = useMemo(() => resumeContentKey(resume), [resume]);
  const personalChecks = personalDetailChecks(resume);
  const quality = resumeQuality(resume);
  const formatChecks = formattingChecks(resume);
  const qualityScore = (currentAnalysis as Analysis & { key?: string }).key ? currentAnalysis.qualityScore : quality.score;
  const analysisIsStale = Boolean(currentJd && (currentAnalysis as Analysis & { key?: string }).key && (currentAnalysis as Analysis & { key?: string }).key !== valueKey(resume, currentJd));
  const activeRecommendations = visibleSuggestions.filter((suggestion) => isRecommendation(suggestion) && suggestionPhase(suggestion) === activePhase && suggestion.status === "pending");
  const activeScoreSuggestions = visibleSuggestions.filter((suggestion) => !isRecommendation(suggestion) && suggestionPhase(suggestion) === activePhase && suggestion.status === "pending");
  const appliedSuggestions = visibleSuggestions.filter((suggestion) => isRecommendation(suggestion) && suggestionPhase(suggestion) === activePhase && suggestion.status === "accepted");
  const refinementTargets = (currentAnalysis.refinementTargets || []).filter((target) => target.target === "summary" || (target.experienceIndex != null && target.experienceIndex < resume.experience.length));
  const contentRefinementCount = refinementTargets.filter((target) => refinements[cachedRefinementKey(target.target, target.experienceIndex)]?.state !== "applied").length;
  const phases: Array<{ id: OptimizationPhase; label: string; count: number }> = [
    { id: "ats", label: "ATS formatting", count: formatChecks.length + visibleSuggestions.filter((suggestion) => suggestionPhase(suggestion) === "ats" && suggestion.status === "pending").length },
    { id: "content", label: "Content refinement", count: contentRefinementCount },
    { id: "recommendations", label: "Recommendations", count: personalChecks.length + visibleSuggestions.filter((suggestion) => suggestionPhase(suggestion) === "recommendations" && suggestion.status === "pending").length }
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey(applicationId));
        if (saved) {
          const state = JSON.parse(saved) as StoredStudio;
          setResume(state.resume); resumeSnapshot.current = state.resume; setResumeId(state.resumeId); setVersionId(state.versionId); setJds(state.jds); setAnalysis(state.analysis); setLastSavedAt(state.lastSavedAt); lastSavedContent.current = resumeContentKey(state.resume);
        }
      } catch { /* a malformed old draft should never block Studio */ }
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [applicationId]);

  useEffect(() => {
    if (!hydrated.current) return;
    localStorage.setItem(storageKey(applicationId), JSON.stringify({ resume, resumeId, versionId, jds, analysis, lastSavedAt } satisfies StoredStudio));
  }, [resume, resumeId, versionId, jds, analysis, lastSavedAt, applicationId]);

  useEffect(() => { resumeSnapshot.current = resume; }, [resume]);
  useEffect(() => () => { if (typingTimer.current) window.clearInterval(typingTimer.current); }, []);

  useEffect(() => { if (resumeId) void loadVersions(resumeId); }, [resumeId]);

  useEffect(() => {
    if (!hydrated.current || resumeKey === lastSavedContent.current) return;
    const timer = window.setTimeout(() => { void save("save", true); }, 10_000);
    return () => window.clearTimeout(timer);
  }, [resumeKey]);

  const updateResume = (patch: Partial<Resume>) => {
    const current = resumeSnapshot.current;
    undoHistory.current = [...undoHistory.current.slice(-39), current];
    setUndoAvailable(true);
    const next = { ...current, ...patch, version: patch.version || "Draft · unsaved" };
    resumeSnapshot.current = next;
    setResume(next);
  };
  const updateBullet = (experienceIndex: number, bulletIndex: number, text: string) => updateResume({ experience: resume.experience.map((experience, index) => index === experienceIndex ? { ...experience, bullets: experience.bullets.map((bullet, itemIndex) => itemIndex === bulletIndex ? text : bullet) } : experience) });
  function undo() {
    const previous = undoHistory.current.pop();
    if (!previous) return;
    resumeSnapshot.current = previous; setResume(previous); setUndoAvailable(undoHistory.current.length > 0); setToast("Last résumé edit undone.");
  }
  async function structureResume(text: string) {
    const parsed = parseResumeImport(text);
    if (parsed.confidence >= .7) return { resume: parsed.resume, usedAi: false };
    try {
      const response = await fetch("/api/candidate/studio/structure", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!response.ok) throw new Error("AI structuring is unavailable.");
      const result = await response.json() as { resume: Resume };
      return { resume: result.resume, usedAi: true };
    } catch { return { resume: parsed.resume, usedAi: false }; }
  }

  async function importResume(file: File) {
    setBusy("upload"); setScannedFile(null);
    try {
      const text = await extractResumeText(file);
      if (!text) { setScannedFile(file); setToast("No selectable text found — run OCR for this scanned PDF."); return; }
      const parsed = await structureResume(text);
      updateResume({ ...parsed.resume, version: `Draft · ${file.name}` });
      setToast(parsed.usedAi ? "Résumé structured with AI — review names, dates, and metrics." : "Résumé parsed — review and edit the fields.");
    } catch (error) { setToast(error instanceof Error ? error.message : "Could not read that file."); }
    finally { setBusy(null); }
  }

  async function runOcr() {
    if (!scannedFile) return;
    setBusy("ocr");
    try {
      const text = await extractScannedPdfText(scannedFile);
      if (!text) throw new Error("OCR could not read this PDF.");
      const parsed = await structureResume(text);
      updateResume({ ...parsed.resume, version: `Draft · ${scannedFile.name}` });
      setScannedFile(null); setToast(parsed.usedAi ? "OCR + AI structuring complete — verify names, dates, and metrics." : "OCR complete — please verify names, dates, and metrics.");
    } catch (error) { setToast(error instanceof Error ? error.message : "OCR failed."); }
    finally { setBusy(null); }
  }

  function addJd(text = jdInput, label?: string) {
    const clean = text.trim();
    if (!clean) return undefined;
    if (jds.length >= 5) { setToast("Resume Studio supports up to five JD tabs at once."); return undefined; }
    const id = crypto.randomUUID();
    setJds((current) => [...current, { id, label: label || clean.split("\n").find(Boolean)?.slice(0, 42) || "Job description", text: clean, missing: [] }]);
    setJdInput(""); setActiveJd(jds.length); setToast("JD added — analyze when you are ready.");
    return id;
  }

  function submitJd() {
    if (addJd()) setTargetRoleOpen(false);
  }

  async function addJdFile(file: File) {
    try {
      const id = addJd(await extractResumeText(file), file.name.replace(/\.(pdf|docx|txt)$/i, ""));
      if (!id) return;
      if (file.name.toLowerCase().endsWith(".pdf")) setJdPreviews((current) => ({ ...current, [id]: { kind: "pdf", source: URL.createObjectURL(file) } }));
      if (file.name.toLowerCase().endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const html = (await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })).value;
        setJdPreviews((current) => ({ ...current, [id]: { kind: "docx", source: html } }));
      }
    }
    catch (error) { setToast(error instanceof Error ? error.message : "Could not read that JD."); }
  }

  async function handleJdFile(file: File) {
    await addJdFile(file);
    setTargetRoleOpen(false);
  }

  function removeJd(index: number) {
    if (jds.length === 1) { setToast("Keep at least one JD tab open."); return; }
    const removed = jds[index];
    setJds((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setAnalysis((current) => { const next = { ...current }; delete next[removed.id]; return next; });
    setJdPreviews((current) => { const next = { ...current }; if (next[removed.id]?.kind === "pdf") URL.revokeObjectURL(next[removed.id].source); delete next[removed.id]; return next; });
    setActiveJd((current) => Math.max(0, Math.min(current > index ? current - 1 : current, jds.length - 2)));
  }

  async function analyzeActive(automatic = false, force = false, oneClick = false) {
    if (!currentJd) { setToast("Add or select a target role first."); return; }
    if (busy === "analysis") return;
    const stale = force || analysis[currentJd.id]?.key !== valueKey(resume, currentJd) ? [currentJd] : [];
    if (!stale.length) { if (!automatic) setToast(`Optimisation is already current for ${currentJd.label}.`); return; }
    setBusy("analysis");
    try {
      if (oneClick) { setOptimizationProgress({ percent: 35, phase: "ats" }); setActivePhase("ats"); }
      const response = await fetch("/api/candidate/studio/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume, jobDescriptions: stale }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Analysis could not run.");
      const result = await response.json() as { results: Array<{ jobDescriptionId: string; atsScore: number; qualityScore: number; missing: string[]; suggestions: Suggestion[]; refinementTargets: RefinementTarget[] }> };
      let optimizedResume = resume;
      const autoApplied = new Set<string>();
      const autoRewrites: Suggestion[] = [];
      const changedTargets = new Set<string>();
      if (oneClick) for (const item of result.results) for (const suggestion of item.suggestions) {
        if (!isRecommendation(suggestion)) continue;
        const target = suggestionTarget(suggestion);
        const source = suggestion.field === "summary" ? optimizedResume.summary : suggestion.ei != null && suggestion.bi != null ? optimizedResume.experience[suggestion.ei]?.bullets[suggestion.bi] : undefined;
        if (!source || !suggestion.replacement.trim() || !isOneClickSafe(suggestion, source) || changedTargets.has(target)) continue;
        optimizedResume = suggestion.field === "summary" ? { ...optimizedResume, summary: suggestion.replacement } : { ...optimizedResume, experience: optimizedResume.experience.map((experience, index) => index === suggestion.ei ? { ...experience, bullets: experience.bullets.map((bullet, bulletIndex) => bulletIndex === suggestion.bi ? suggestion.replacement : bullet) } : experience) };
        changedTargets.add(target); autoApplied.add(`${item.jobDescriptionId}:${suggestion.id}`); autoRewrites.push(suggestion);
      }
      if (autoApplied.size) { undoHistory.current = [...undoHistory.current.slice(-39), resume]; setUndoAvailable(true); if (oneClick) optimizedResume = await animateSafeRewrites(autoRewrites); else { resumeSnapshot.current = optimizedResume; setResume(optimizedResume); } aiAppliedResumeKey.current = resumeContentKey(optimizedResume); }
      if (oneClick) { setOptimizationProgress({ percent: 72, phase: "content" }); setActivePhase("content"); }
      setAnalysis((current) => ({ ...current, ...Object.fromEntries(result.results.map((item) => {
        const acceptedIds = new Set([...autoApplied].filter((key) => key.startsWith(`${item.jobDescriptionId}:`)).map((key) => key.slice(item.jobDescriptionId.length + 1)));
        const suggestions = freshAnalysisSuggestions(item.suggestions, acceptedIds).map((suggestion) => ({ ...suggestion, baseText: isRecommendation(suggestion) ? suggestion.field === "summary" ? optimizedResume.summary : suggestion.ei != null && suggestion.bi != null ? optimizedResume.experience[suggestion.ei]?.bullets[suggestion.bi] : undefined : undefined }));
        const safeGain = suggestions.filter((suggestion) => suggestion.status === "accepted").reduce((total, suggestion) => total + Math.max(1, Math.min(4, suggestion.delta)), 0);
        return [item.jobDescriptionId, { ...item, qualityScore: Math.min(100, item.qualityScore + safeGain), suggestions, key: valueKey(optimizedResume, jds.find((jd) => jd.id === item.jobDescriptionId) || stale[0]) }];
      })) }));
      setDraftImproved(autoApplied.size > 0);
      if (!oneClick) setActivePhase("content");
      setToast(oneClick ? (autoApplied.size ? `${autoApplied.size} safe edit${autoApplied.size === 1 ? "" : "s"} applied. Review the evidence gaps.` : "No safe edits found. Review the evidence gaps.") : automatic ? `AI rechecked your ${currentJd.label} draft.` : `Optimisation is ready for ${currentJd.label}. Start with the highlighted gaps.`);
      if (oneClick) window.setTimeout(() => { setOptimizationProgress({ percent: 100, phase: "recommendations" }); setActivePhase("recommendations"); window.setTimeout(() => setOptimizationProgress(undefined), 900); }, 240);
    } catch (error) { if (oneClick) setOptimizationProgress(undefined); setToast(error instanceof Error ? error.message : "Analysis failed."); }
    finally { setBusy(null); }
  }

  function oneClickOptimize() {
    if (busy === "analysis") return;
    setOptimizationProgress({ percent: 12, phase: "ats" }); setActivePhase("ats");
    window.setTimeout(() => { void analyzeActive(false, true, true); }, 180);
  }

  async function animateSafeRewrites(rewrites: Suggestion[]) {
    let next = resumeSnapshot.current;
    setTypingSuggestionId("bulk");
    for (const [index, suggestion] of rewrites.entries()) {
      const target = suggestionTarget(suggestion);
      if (index === 0) window.setTimeout(() => document.querySelector(`[data-studio-target="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      setTypingTarget(target);
      await new Promise<void>((done) => {
        const before = next;
        let cursor = 0;
        typingTimer.current = window.setInterval(() => {
          cursor = Math.min(suggestion.replacement.length, cursor + Math.max(5, Math.ceil(suggestion.replacement.length / 42)));
          next = suggestion.field === "summary" ? { ...before, summary: suggestion.replacement.slice(0, cursor) } : { ...before, experience: before.experience.map((experience, experienceIndex) => experienceIndex === suggestion.ei ? { ...experience, bullets: experience.bullets.map((bullet, bulletIndex) => bulletIndex === suggestion.bi ? suggestion.replacement.slice(0, cursor) : bullet) } : experience) };
          resumeSnapshot.current = next; setResume(next);
          if (cursor < suggestion.replacement.length) return;
          window.clearInterval(typingTimer.current); typingTimer.current = undefined; done();
        }, 14);
      });
    }
    setTypingTarget(undefined); setTypingSuggestionId(undefined);
    return next;
  }

  async function prepareRefinement(target: "summary" | "experience", experienceIndex?: number, evidence = "", key = cachedRefinementKey(target, experienceIndex)) {
    if (!currentJd || applyingRefinement || typingSuggestionId) return;
    const sourceKey = resumeContentKey(resumeSnapshot.current);
    setRefinements((current) => ({ ...current, [key]: { state: "loading", sourceKey } }));
    try {
      const response = await fetch("/api/candidate/studio/refine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume: resumeSnapshot.current, jobDescription: currentJd, target, experienceIndex, evidence }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "AI refinement is unavailable.");
      const result = await response.json() as { refinement: Refinement };
      setRefinements((current) => ({ ...current, [key]: { state: "ready", sourceKey, refinement: result.refinement } }));
    } catch (error) { setRefinements((current) => ({ ...current, [key]: { state: "error", sourceKey, error: error instanceof Error ? error.message : "AI refinement is unavailable." } })); }
  }

  function applyCachedRefinement(key: string) {
    const cached = refinements[key];
    if (!cached?.refinement || cached.state !== "ready" || !currentJd) return;
    if (cached.sourceKey !== resumeContentKey(resumeSnapshot.current)) { setRefinements((current) => ({ ...current, [key]: { state: "error", error: "Draft changed — generate a fresh rewrite." } })); return; }
    const before = resumeSnapshot.current;
    const target = refinementTarget(cached.refinement);
    undoHistory.current = [...undoHistory.current.slice(-39), before]; setUndoAvailable(true); setApplyingRefinement(key); setTypingTarget(target);
    window.setTimeout(() => document.querySelector(`[data-studio-target="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    const finish = (next: Resume) => {
      resumeSnapshot.current = next; setResume(next); aiAppliedResumeKey.current = resumeContentKey(next); setTypingTarget(undefined); setAppliedTarget(target); setApplyingRefinement(undefined); setDraftImproved(true); setRefinements((current) => ({ ...current, [key]: { ...cached, state: "applied" } })); window.setTimeout(() => setAppliedTarget((current) => current === target ? undefined : current), 2400);
    };
    if (cached.refinement.target === "summary") {
      let cursor = 0;
      typingTimer.current = window.setInterval(() => {
        const replacement = cached.refinement?.replacement || before.summary;
        cursor = Math.min(replacement.length, cursor + Math.max(5, Math.ceil(replacement.length / 40)));
        const next = applyRefinement(before, { ...cached.refinement!, replacement: replacement.slice(0, cursor) });
        resumeSnapshot.current = next; setResume(next);
        if (cursor >= replacement.length) { window.clearInterval(typingTimer.current); typingTimer.current = undefined; finish(next); }
      }, 14);
      return;
    }
    const frames = refinementFrames(before, cached.refinement);
    let frame = 0;
    typingTimer.current = window.setInterval(() => {
      const next = frames[frame++];
      if (!next) return;
      resumeSnapshot.current = next; setResume(next);
      if (frame < frames.length) return;
      window.clearInterval(typingTimer.current); typingTimer.current = undefined; finish(next);
    }, 165);
  }

  async function save(mode: "save" | "version" = "save", auto = false) {
    if (busy) return;
    setBusy("save");
    try {
      const response = await fetch("/api/candidate/studio/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resume, resumeId, versionId, mode, jobDescriptions: jds }) });
      if (!response.ok) throw new Error((await response.json().catch(() => null))?.error || "Supabase is not configured yet.");
      const saved = await response.json() as { resumeId?: string; versionId?: string; versionNumber?: number };
      if (saved.resumeId) setResumeId(saved.resumeId);
      if (saved.versionId) setVersionId(saved.versionId);
      setResume((current) => ({ ...current, version: saved.versionNumber ? `Saved · v${saved.versionNumber}` : "Saved · Supabase" }));
      lastSavedContent.current = resumeContentKey(resume); setLastSavedAt(Date.now());
      if (saved.resumeId || resumeId) void loadVersions(saved.resumeId || resumeId!);
      if (!auto) setToast(mode === "version" ? `Saved as version v${saved.versionNumber || "new"}.` : "Draft saved.");
    } catch (error) {
      lastSavedContent.current = resumeContentKey(resume); setLastSavedAt(Date.now());
      if (!auto) setToast(`${error instanceof Error ? error.message : "Save failed."} Your draft remains safely saved in this browser.`);
    }
    finally { setBusy(null); }
  }

  async function loadVersions(id: string) {
    try {
      const response = await fetch(`/api/candidate/studio/save?resumeId=${encodeURIComponent(id)}`);
      if (!response.ok) return;
      const result = await response.json() as { versions?: ResumeVersion[] };
      if (Array.isArray(result.versions)) setVersions(result.versions);
    } catch { /* local drafts remain usable when history is unavailable */ }
  }

  function selectVersion(version: ResumeVersion) {
    resumeSnapshot.current = { ...version.content, version: `Saved · v${version.number}` };
    setResume(resumeSnapshot.current); setVersionId(version.id); lastSavedContent.current = resumeContentKey(version.content); setLastSavedAt(Date.parse(version.createdAt)); setVersionMenuOpen(false); setToast(`Switched to version v${version.number}.`);
  }

  function accept(suggestion: Suggestion) {
    if (!isRecommendation(suggestion) || suggestion.status !== "pending" || typingSuggestionId || applyingRefinement || !currentJd) return;
    const before = resumeSnapshot.current;
    const target = suggestion.field === "summary" ? "summary" : suggestion.ei != null && suggestion.bi != null ? `exp:${suggestion.ei}:${suggestion.bi}` : undefined;
    const currentText = suggestion.field === "summary" ? before.summary : suggestion.ei != null && suggestion.bi != null ? before.experience[suggestion.ei]?.bullets[suggestion.bi] : undefined;
    if (!target || currentText == null || (suggestion.baseText != null && suggestion.baseText !== currentText)) { setToast("Draft changed — refreshing recommendations."); void analyzeActive(false, true); return; }
    undoHistory.current = [...undoHistory.current.slice(-39), before]; setUndoAvailable(true); setTypingSuggestionId(suggestion.id); setTypingTarget(target); window.setTimeout(() => document.querySelector(`[data-studio-target="${target}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    let cursor = 0;
    const write = (text: string) => {
      const next = suggestion.field === "summary" ? { ...before, summary: text } : { ...before, experience: before.experience.map((experience, index) => index === suggestion.ei ? { ...experience, bullets: experience.bullets.map((bullet, bulletIndex) => bulletIndex === suggestion.bi ? text : bullet) } : experience) };
      resumeSnapshot.current = next; setResume(next);
    };
    typingTimer.current = window.setInterval(() => {
      cursor = Math.min(suggestion.replacement.length, cursor + Math.max(5, Math.ceil(suggestion.replacement.length / 42)));
      write(suggestion.replacement.slice(0, cursor));
      if (cursor < suggestion.replacement.length) return;
      window.clearInterval(typingTimer.current); typingTimer.current = undefined; aiAppliedResumeKey.current = resumeContentKey(resumeSnapshot.current); setTypingSuggestionId(undefined); setTypingTarget(undefined); setAppliedTarget(target); window.setTimeout(() => setAppliedTarget((current) => current === target ? undefined : current), 2400);
      setAnalysis((current) => {
        const active = current[currentJd.id] || currentAnalysis;
        return { ...current, [currentJd.id]: { ...active, qualityScore: Math.min(100, active.qualityScore + Math.max(1, Math.min(6, Math.round(suggestion.delta || 2)))), missing: suggestion.removeKw ? active.missing.filter((keyword) => keyword !== suggestion.removeKw) : active.missing, suggestions: active.suggestions.map((item) => item.id === suggestion.id ? { ...item, status: "accepted" } : item) } };
      });
      setDraftImproved(true); setToast("Applied to your draft. Recheck when you are ready.");
    }, 14);
  }

  function reject(suggestion: Suggestion) { setAnalysis((current) => ({ ...current, [currentJd.id]: { ...currentAnalysis, suggestions: currentAnalysis.suggestions.map((item) => item.id === suggestion.id ? { ...item, status: "rejected" } : item) } })); }

  async function exportResume(format: "pdf" | "docx") {
    if (busy) return;
    setBusy("export");
    try {
      if (format === "pdf") await downloadResumePdf(resume);
      else await downloadResumeDocx(resume);
      setToast(`${format.toUpperCase()} export downloaded.`);
    } catch (error) { setToast(error instanceof Error ? error.message : "Export failed."); }
    finally { setBusy(null); }
  }

  const contentRefinementCards = refinementTargets.map((target) => ({ key: cachedRefinementKey(target.target, target.experienceIndex), label: target.title, detail: target.reason, jdRequirement: target.jdRequirement, target: target.target, experienceIndex: target.experienceIndex }));

  return <div className="studio-workspace anim-fade-up">
    <input ref={fileInput} type="file" accept=".pdf,.docx,.txt,application/pdf" hidden onChange={(event) => event.target.files?.[0] && importResume(event.target.files[0])} />
    <input ref={jdFileInput} type="file" accept=".pdf,.docx,.txt,application/pdf" hidden onChange={(event) => event.target.files?.[0] && void handleJdFile(event.target.files[0])} />
    <header className="studio-commandbar">
      <div className="studio-title"><span className="kicker">Resume studio</span><h1>Craft the proof.</h1><p>{currentJd?.label || "Choose a role to tailor your résumé"}</p></div>
      <div className="studio-actions"><div className={`studio-save-state ${busy === "save" || resumeKey === lastSavedContent.current ? "is-saved" : ""}`}><strong>{busy === "save" ? "Saving changes" : resumeKey !== lastSavedContent.current ? "Auto-save in 10s" : "All changes saved"}</strong><span>{lastSavedAt ? `Last saved ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(lastSavedAt)}` : "Saved in this browser"}</span></div><button onClick={() => fileInput.current?.click()} disabled={busy === "upload"} className="studio-button ghost">{busy === "upload" ? "Reading…" : "Upload résumé"}</button><div className="studio-save-menu"><button onClick={() => void save()} disabled={busy === "save"} className="studio-button primary">{busy === "save" ? "Saving…" : "Save"}</button><button onClick={() => setSaveMenuOpen((open) => !open)} className="studio-button primary" aria-label="Save options" aria-expanded={saveMenuOpen}>⌄</button>{saveMenuOpen ? <div><button onClick={() => { void save("version"); setSaveMenuOpen(false); }}>Save as version</button></div> : null}</div><div className="studio-export-menu"><button onClick={() => setExportOpen((open) => !open)} disabled={busy === "export"} className="studio-button ghost" aria-expanded={exportOpen}>{busy === "export" ? "Exporting…" : "Export ▾"}</button>{exportOpen ? <div><button onClick={() => { void exportResume("pdf"); setExportOpen(false); }}>Export PDF</button><button onClick={() => { void exportResume("docx"); setExportOpen(false); }}>Export DOCX</button></div> : null}</div>{scannedFile ? <button onClick={runOcr} disabled={busy === "ocr"} className="studio-button primary">{busy === "ocr" ? "OCR reading…" : "Run OCR"}</button> : null}</div>
    </header>

    <div className="studio-layout">
      <aside className="studio-rail studio-jd-rail">
        <div className="studio-rail-heading"><span className="kicker">Target roles</span><span>{jds.length}/5</span></div>
        <div className="studio-role-list">
          {jds.map((item, index) => <div key={item.id} className={`studio-role ${index === activeJd ? "is-active" : ""}`}><button onClick={() => setActiveJd(index)}><strong>{item.label}</strong><small>{(analysis[item.id] as Analysis & { key?: string })?.key ? "Analyzed" : "Needs analysis"}</small></button><button onClick={() => setViewingJdId(item.id)} aria-label={`Preview ${item.label}`} title="Preview job description" className="studio-view-role"><EyeIcon /></button><button onClick={() => removeJd(index)} aria-label={`Remove ${item.label}`} className="studio-remove-role">×</button></div>)}
        </div>
        <button onClick={() => setTargetRoleOpen(true)} disabled={jds.length >= 5} className="studio-add-target">+ Add target role</button>
        <button onClick={oneClickOptimize} disabled={busy === "analysis" || Boolean(optimizationProgress)} className={`studio-one-click-optimize ${optimizationProgress ? "is-running" : ""}`}><span className="studio-one-click-icon" aria-hidden="true">{optimizationProgress ? <i /> : "✦"}</span><span><strong>{optimizationProgress ? "Optimizing safely" : "AI Analysis"}</strong><small>{optimizationProgress ? `${optimizationProgress.percent}% · ${phases.find((phase) => phase.id === optimizationProgress.phase)?.label}` : "Grammar · structure · evidence"}</small></span><b>{optimizationProgress ? `${optimizationProgress.percent}%` : "→"}</b></button>
      </aside>

      <main className="studio-canvas-area">
        <div className="studio-document-meta"><div><span>{resume.version}</span><div className="studio-version-menu"><button onClick={() => setVersionMenuOpen((open) => !open)} aria-expanded={versionMenuOpen}>Version history ▾</button>{versionMenuOpen ? <div>{versions.length ? versions.map((version) => <button key={version.id} onClick={() => selectVersion(version)} className={version.id === versionId ? "is-active" : ""}><strong>Version v{version.number}</strong><span>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(version.createdAt))}</span></button>) : <p>Save as version to create your first snapshot.</p>}</div> : null}</div></div><div><button onClick={undo} disabled={!undoAvailable} title="Undo last résumé edit">Undo</button><span>Selectable · ATS-ready</span></div></div>
        <div className="studio-document-stage">
          <ResumeEditor resume={resume} onChange={updateResume} onBullet={updateBullet} typingTarget={typingTarget} appliedTarget={appliedTarget} />
        </div>
      </main>

      <aside className="studio-rail studio-review-rail">
        <div className="studio-rail-heading"><span className="kicker">Optimisation plan</span><span>{phases.reduce((total, phase) => total + phase.count, 0)} open</span></div>
        <div className="studio-role-context"><div><strong>{currentJd?.label}</strong><div className={`studio-score-ring ${qualityScore < 80 ? "is-caution" : ""}`} style={{ "--score": qualityScore } as React.CSSProperties} aria-label={`Résumé quality ${qualityScore}%`}><b>{qualityScore}</b><span>{!analysisIsStale && (currentAnalysis as Analysis & { key?: string }).key ? "AI" : "Draft"}</span></div></div><span>{analysisIsStale ? <button onClick={() => void analyzeActive(false, true)} disabled={busy === "analysis"} className="studio-recheck-score">{busy === "analysis" ? "Rechecking…" : draftImproved ? "Draft improved · recheck score" : "Draft changed · recheck score"}</button> : `${accepted.length} change${accepted.length === 1 ? "" : "s"} applied · résumé quality`}</span>{analysisIsStale && draftImproved ? <small className="studio-score-rerun-note">Changes applied. Rerun needed to fetch the latest score.</small> : null}</div>
        {optimizationProgress ? <div className="studio-optimization-progress"><div><span>Safe optimization</span><strong>{optimizationProgress.percent}%</strong></div><i><b style={{ width: `${optimizationProgress.percent}%` }} /></i></div> : null}
        <div className="studio-phase-tabs">{phases.map((phase) => <button key={phase.id} onClick={() => setActivePhase(phase.id)} className={`${activePhase === phase.id ? "is-active" : ""} ${phase.count ? "has-gaps" : "is-complete"} ${optimizationProgress?.phase === phase.id ? "is-loading" : ""}`}><span key={`${phase.id}-${phase.count}-${optimizationProgress?.phase === phase.id}`} aria-label={phase.count ? `${phase.count} items to review` : "Complete"}>{optimizationProgress?.phase === phase.id ? "…" : phase.count || "✓"}</span><strong>{phase.label}</strong></button>)}</div>
        <section key={activePhase} className="studio-phase-card anim-fade-up"><span className="kicker">{phases.find((phase) => phase.id === activePhase)?.label}</span>{activePhase === "ats" ? <PhaseChecklist checks={formatChecks} empty="Your structure is clean, selectable, and ATS-friendly." /> : null}{activePhase === "content" ? <><p className="studio-phase-intro">Only sections the AI identifies as high-impact appear here. Each rewrite also corrects grammar and clarity.</p>{contentRefinementCards.length ? <div className="studio-refinement-list">{contentRefinementCards.map((card) => <RefinementCard key={card.key} label={card.label} detail={card.detail} jdRequirement={card.jdRequirement} cached={refinements[card.key]} onGenerate={() => void prepareRefinement(card.target, card.experienceIndex)} onApply={() => applyCachedRefinement(card.key)} />)}</div> : <p className="studio-phase-ready">No grounded section rewrite is needed for this role.</p>}<div className="studio-evidence-capture"><label htmlFor="verified-evidence">Add verified evidence</label><p>Have a real detail the résumé missed? We will turn only your evidence into a polished bullet for the latest role.</p><textarea id="verified-evidence" rows={2} value={verifiedEvidence} onChange={(event) => setVerifiedEvidence(event.target.value)} placeholder="e.g. Owned P1/P2 incident escalation and wrote the post-incident runbook." /><button onClick={() => void prepareRefinement("experience", 0, verifiedEvidence, "evidence:0")} disabled={!verifiedEvidence.trim() || refinements["evidence:0"]?.state === "loading"} className="studio-button ghost">{refinements["evidence:0"]?.state === "loading" ? "Preparing…" : "Create grounded bullet"}</button>{refinements["evidence:0"] ? <RefinementCard label="Verified evidence" detail="" cached={refinements["evidence:0"]} onGenerate={() => void prepareRefinement("experience", 0, verifiedEvidence, "evidence:0")} onApply={() => applyCachedRefinement("evidence:0")} compact /> : null}</div><details className="studio-evidence-gaps"><summary>{currentAnalysis.missing.length + activeScoreSuggestions.length} opportunities need your evidence</summary><ul>{currentAnalysis.missing.map((keyword) => <li key={keyword}><b>JD requirement</b><span>{keyword}</span></li>)}{activeScoreSuggestions.map((suggestion) => <li key={suggestion.id}><b>{suggestion.jdRequirement || suggestion.tag}</b>{suggestion.evidence ? <span>Current evidence: {suggestion.evidence}</span> : null}<em>{suggestion.text}</em></li>)}</ul></details></> : null}{activePhase === "recommendations" ? <PhaseChecklist checks={personalChecks} empty="Your core recruiter details are complete." /> : null}{activePhase !== "content" ? <div className="studio-recommendation-section"><header><strong>AI recommendations</strong><span>{activeRecommendations.length} ready to apply</span></header><div className="studio-suggestions">{busy === "analysis" ? <p className="studio-empty">Refreshing recommendations…</p> : activeRecommendations.map((suggestion) => <SuggestionCard key={suggestion.id} suggestion={suggestion} applying={typingSuggestionId === suggestion.id} onAccept={() => accept(suggestion)} onReject={() => reject(suggestion)}/>)}{busy !== "analysis" && !activeRecommendations.length ? <p className="studio-empty">No direct rewrite to apply in this phase.</p> : null}</div></div> : null}{activePhase !== "content" && appliedSuggestions.length ? <div className="studio-applied-suggestions"><span>Applied</span>{appliedSuggestions.map((suggestion) => <SuggestionCard key={suggestion.id} suggestion={suggestion} applying={false} onAccept={() => undefined} onReject={() => undefined} />)}</div> : null}<button onClick={() => setActivePhase(phases[(phases.findIndex((phase) => phase.id === activePhase) + 1) % phases.length].id)} className="studio-next-phase">Next focus →</button></section>
      </aside>
    </div>
    {targetRoleOpen ? <div className="studio-viewer-backdrop studio-target-backdrop" role="presentation" onMouseDown={() => setTargetRoleOpen(false)}><section className="studio-target-dialog" role="dialog" aria-modal="true" aria-label="Add a target role" onMouseDown={(event) => event.stopPropagation()}><header><div><span className="kicker">Target role</span><h2>Add a job description</h2><p>Upload the source document first, or paste the role details below.</p></div><button onClick={() => setTargetRoleOpen(false)} aria-label="Close target role dialog">×</button></header><div className="studio-target-dialog-body"><button onClick={() => jdFileInput.current?.click()} className="studio-target-upload"><strong>Upload job description</strong><span>PDF, DOCX, or text file</span></button><div className="studio-target-divider"><span>or paste text</span></div><label htmlFor="jd-text">Job description</label><textarea id="jd-text" value={jdInput} onChange={(event) => setJdInput(event.target.value)} placeholder="Paste the full job description here…" rows={9} /><footer><button onClick={() => setTargetRoleOpen(false)} className="studio-button ghost">Cancel</button><button onClick={submitJd} className="studio-button primary">Add target</button></footer></div></section></div> : null}
    {viewingJdId && jds.find((jd) => jd.id === viewingJdId) ? <JdViewer jd={jds.find((jd) => jd.id === viewingJdId)!} preview={jdPreviews[viewingJdId]} onClose={() => setViewingJdId(undefined)} /> : null}
    <Toast message={toast} onDone={() => setToast(null)} />
  </div>;
}

type DetailGroup = { label: string; values: string[] };
const phonePattern = /\+?\d[\d\s()-]{7,}/;

function splitLocationAndPhone(value: string) {
  const phone = value.match(phonePattern)?.[0] || "";
  return { location: value.replace(phonePattern, "").replace(/[|·]/g, " ").replace(/\s{2,}/g, " ").trim(), phone };
}

function groupedSkills(skills: string[]): DetailGroup[] {
  const groups: DetailGroup[] = [];
  let current: DetailGroup = { label: "Skills", values: [] };
  for (const skill of skills) {
    const match = skill.match(/^([^:]{2,32}):\s*(.+)$/);
    if (match) { current = { label: match[1], values: [match[2]] }; groups.push(current); }
    else { if (!groups.length) groups.push(current); current.values.push(skill); }
  }
  return groups.filter((group) => group.values.length);
}

function flattenedSkills(groups: DetailGroup[]) {
  return groups.flatMap((group) => group.values.map((value, index) => group.label === "Skills" || index ? value : `${group.label}: ${value}`));
}

function groupedDetails(other: string): DetailGroup[] {
  const groups: DetailGroup[] = [];
  for (const line of other.split("\n").map((item) => item.trim()).filter(Boolean)) {
    const label = /university|college|school|bachelor|master|diploma|degree/i.test(line) ? "Education"
      : /certified|certification|certificate|associate|professional/i.test(line) ? "Certifications"
        : /leadership|president|chair|committee|volunteer|society|club|organisation/i.test(line) ? "Leadership & activities"
          : /project/i.test(line) ? "Projects" : "Additional details";
    const current = groups.find((group) => group.label === label);
    if (current) current.values.push(line); else groups.push({ label, values: [line] });
  }
  return groups;
}

function ResumeEditor({ resume, onChange, onBullet, typingTarget, appliedTarget }: { resume: Resume; onChange: (patch: Partial<Resume>) => void; onBullet: (experience: number, bullet: number, text: string) => void; typingTarget?: string; appliedTarget?: string }) {
  const [draggedExperience, setDraggedExperience] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const { location, phone } = splitLocationAndPhone(resume.loc);
  const skillGroups = groupedSkills(resume.skills);
  const detailGroups = resume.other ? groupedDetails(resume.other) : [];
  const updateSkillGroup = (groupIndex: number, value: string) => {
    const next = skillGroups.map((group, index) => index === groupIndex ? { ...group, values: value.split(",").map((item) => item.trim()).filter(Boolean) } : group).filter((group) => group.values.length);
    onChange({ skills: flattenedSkills(next) });
  };
  const updateDetailGroup = (groupIndex: number, value: string) => onChange({ other: detailGroups.map((group, index) => index === groupIndex ? value : group.values.join("\n")).filter(Boolean).join("\n") });
  const updateExperience = (experienceIndex: number, update: (experience: Resume["experience"][number]) => Resume["experience"][number]) => onChange({ experience: resume.experience.map((experience, index) => index === experienceIndex ? update(experience) : experience) });
  const moveExperience = (from: number, to: number) => {
    if (from === to || from + 1 === to) return;
    const next = [...resume.experience];
    const [moved] = next.splice(from, 1);
    next.splice(from < to ? to - 1 : to, 0, moved);
    onChange({ experience: next });
  };
  return <article className="studio-paper">
    <header className="studio-paper-header"><input value={resume.name} onChange={(event) => onChange({ name: event.target.value })} aria-label="Name" className="studio-name-input" /><div className="studio-paper-byline"><input value={resume.title} onChange={(event) => onChange({ title: event.target.value })} aria-label="Title" className="studio-title-input" /><div className="studio-contact"><input value={location} onChange={(event) => onChange({ loc: [event.target.value, phone].filter(Boolean).join(" · ") })} aria-label="Location" placeholder="Location" /><input value={phone} onChange={(event) => onChange({ loc: [location, event.target.value].filter(Boolean).join(" · ") })} aria-label="Phone" placeholder="Phone" /><input value={resume.email} onChange={(event) => onChange({ email: event.target.value })} aria-label="Email" placeholder="Email" /></div></div></header>
    <PaperSection label="Profile"><textarea data-studio-target="summary" rows={2} value={resume.summary} onChange={(event) => onChange({ summary: event.target.value })} className={`studio-profile-input ${typingTarget === "summary" ? "is-ai-typing" : ""} ${appliedTarget === "summary" ? "is-ai-applied" : ""}`} /></PaperSection>
    <PaperSection label="Experience"><div className="studio-experience-list">{resume.experience.map((experience, experienceIndex) => <div key={`${experience.role}-${experienceIndex}`}><ExperienceDropZone visible={draggedExperience != null && dropTarget === experienceIndex && draggedExperience !== experienceIndex} onDragOver={(event) => { event.preventDefault(); setDropTarget(experienceIndex); }} onDrop={(event) => { event.preventDefault(); if (draggedExperience != null) moveExperience(draggedExperience, experienceIndex); setDraggedExperience(null); setDropTarget(null); }} /><div data-studio-target={`experience:${experienceIndex}`} className={`studio-experience ${draggedExperience === experienceIndex ? "is-dragging" : ""} ${typingTarget === `experience:${experienceIndex}` ? "is-ai-typing" : ""} ${appliedTarget === `experience:${experienceIndex}` ? "is-ai-applied" : ""}`} onDragOver={(event) => { if (draggedExperience != null) { event.preventDefault(); setDropTarget(experienceIndex); } }}><div className="studio-experience-head"><button type="button" draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; setDraggedExperience(experienceIndex); setDropTarget(experienceIndex); }} onDragEnd={() => { setDraggedExperience(null); setDropTarget(null); }} className="studio-drag-experience" aria-label={`Move ${experience.role}`}>⠿</button><input value={experience.role} onChange={(event) => updateExperience(experienceIndex, (item) => ({ ...item, role: event.target.value }))} /><input value={experience.period} onChange={(event) => updateExperience(experienceIndex, (item) => ({ ...item, period: event.target.value }))} /><button onClick={() => onChange({ experience: resume.experience.filter((_, index) => index !== experienceIndex) })} aria-label={`Delete ${experience.role}`}>×</button></div>{experience.bullets.map((bullet, bulletIndex) => <div key={bulletIndex} className="studio-bullet"><span>•</span><textarea data-studio-target={`exp:${experienceIndex}:${bulletIndex}`} rows={1} value={bullet} onChange={(event) => onBullet(experienceIndex, bulletIndex, event.target.value)} className={`${typingTarget === `exp:${experienceIndex}:${bulletIndex}` ? "is-ai-typing" : ""} ${appliedTarget === `exp:${experienceIndex}:${bulletIndex}` ? "is-ai-applied" : ""}`} /><button onClick={() => updateExperience(experienceIndex, (item) => ({ ...item, bullets: item.bullets.filter((_, index) => index !== bulletIndex) }))} aria-label={`Delete bullet ${bulletIndex + 1}`}>×</button></div>)}<button onClick={() => updateExperience(experienceIndex, (item) => ({ ...item, bullets: [...item.bullets, "Add an outcome you can stand behind."] }))} className="studio-add-bullet">+ Add bullet</button></div></div>)}<ExperienceDropZone visible={draggedExperience != null && dropTarget === resume.experience.length} onDragOver={(event) => { event.preventDefault(); setDropTarget(resume.experience.length); }} onDrop={(event) => { event.preventDefault(); if (draggedExperience != null) moveExperience(draggedExperience, resume.experience.length); setDraggedExperience(null); setDropTarget(null); }} /><button onClick={() => onChange({ experience: [...resume.experience, { role: "New role · Company", period: "YYYY – Present", bullets: ["Add an outcome you can stand behind."] }] })} className="studio-add-experience">+ Add experience</button></div></PaperSection>
    <PaperSection label="Skills"><div className="studio-skill-groups">{skillGroups.map((group, index) => <label key={group.label} className="studio-skill-group"><span>{group.label}</span><textarea rows={1} value={group.values.join(", ")} onChange={(event) => updateSkillGroup(index, event.target.value)} /></label>)}</div></PaperSection>
    {detailGroups.length ? <PaperSection label="Additional details"><div className="studio-detail-groups">{detailGroups.map((group, index) => <label key={group.label} className="studio-detail-group"><span>{group.label}</span><textarea rows={1} value={group.values.join("\n")} onChange={(event) => updateDetailGroup(index, event.target.value)} /></label>)}</div></PaperSection> : null}
  </article>;
}

function PaperSection({ label, children }: { label: string; children: React.ReactNode }) { return <section className="studio-paper-section"><span className="kicker">{label}</span>{children}</section>; }
function EyeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6S2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></svg>; }
function ExperienceDropZone({ visible, onDragOver, onDrop }: { visible: boolean; onDragOver: (event: React.DragEvent<HTMLDivElement>) => void; onDrop: (event: React.DragEvent<HTMLDivElement>) => void }) { return <div className={`studio-experience-drop-zone ${visible ? "is-visible" : ""}`} onDragOver={onDragOver} onDrop={onDrop}><span>Move experience here</span></div>; }
function SuggestionCard({ suggestion, onAccept, onReject, applying }: { suggestion: Suggestion; onAccept: () => void; onReject: () => void; applying: boolean }) { const [expanded, setExpanded] = useState(false); const pending = suggestion.status === "pending"; const sentences = suggestion.text.match(/[^.!?]+(?:[.!?]+|$)/g)?.map((item) => item.trim()).filter(Boolean) || [suggestion.text]; const preview = sentences[0] || suggestion.text; const hasDetails = preview !== suggestion.text; return <article className={`studio-suggestion ${pending ? "is-pending" : ""} ${suggestion.status === "accepted" ? "is-accepted" : ""} ${applying ? "is-applying" : ""}`}><span className="kicker">{suggestion.tag}</span>{suggestion.jdRequirement ? <div className="studio-jd-context"><span>JD requirement</span><strong>{suggestion.jdRequirement}</strong>{suggestion.evidence ? <small>Evidence: {suggestion.evidence}</small> : null}</div> : null}<p>{expanded ? suggestion.text : preview}</p>{pending && hasDetails ? <button onClick={() => setExpanded((value) => !value)} className="studio-suggestion-details" aria-expanded={expanded}>{expanded ? "Hide details" : "Details"}</button> : null}{pending ? <div><button onClick={onAccept} disabled={applying} className="studio-button primary">{applying ? "Applying…" : "✓ Apply"}</button><button onClick={onReject} disabled={applying} className="studio-button ghost">Dismiss</button></div> : null}</article>; }

function RefinementCard({ label, detail, jdRequirement, cached, onGenerate, onApply, compact = false }: { label: string; detail: string; jdRequirement?: string; cached?: CachedRefinement; onGenerate: () => void; onApply: () => void; compact?: boolean }) {
  const preview = cached?.refinement?.target === "summary" ? cached.refinement.replacement : cached?.refinement?.bullets?.slice(0, 2).join(" · ");
  if (cached?.state === "loading") return <article className="studio-refinement-card is-loading"><span className="kicker">{label}</span><p><i /> Reading the evidence and shaping a grounded rewrite…</p></article>;
  if (cached?.state === "applied") return <article className="studio-refinement-card is-applied"><span className="kicker">{label}</span><p>✓ Applied to the draft</p></article>;
  return <article className={`studio-refinement-card ${cached?.state === "ready" ? "is-ready" : ""} ${compact ? "is-compact" : ""}`}><span className="kicker">{cached?.refinement?.title || label}</span>{jdRequirement ? <div className="studio-jd-context"><span>JD requirement</span><strong>{jdRequirement}</strong></div> : null}{detail ? <p>{detail}</p> : null}{cached?.state === "ready" ? <><small>{cached.refinement?.rationale}</small>{cached.refinement?.coverage?.length ? <div className="studio-coverage"><span>Strengthens</span>{cached.refinement.coverage.map((item) => <b key={item}>{item}</b>)}</div> : null}<blockquote>{preview}</blockquote><div><button onClick={onApply} className="studio-button primary">✦ Apply rewrite</button><button onClick={onGenerate} className="studio-button ghost">Regenerate</button></div></> : <><button onClick={onGenerate} className="studio-refine-button">✦ {cached?.state === "error" ? "Try again" : "Generate rewrite"}</button>{cached?.error ? <small className="studio-refinement-error">{cached.error}</small> : null}</>}</article>;
}
function PhaseChecklist({ checks, empty }: { checks: string[]; empty: string }) { return checks.length ? <ul className="studio-phase-checklist">{checks.map((check) => <li key={check}>{check}</li>)}</ul> : <p className="studio-phase-ready">✓ {empty}</p>; }
function JdViewer({ jd, preview, onClose }: { jd: StudioJd; preview?: JdPreview; onClose: () => void }) { return <div className="studio-viewer-backdrop" role="presentation" onMouseDown={onClose}><section className="studio-viewer" role="dialog" aria-modal="true" aria-label={`${jd.label} job description`} onMouseDown={(event) => event.stopPropagation()}><header><div><span className="kicker">Job description source</span><h2>{jd.label}</h2></div><button onClick={onClose} aria-label="Close viewer">×</button></header>{preview?.kind === "pdf" ? <iframe title={`${jd.label} PDF`} src={preview.source} /> : preview?.kind === "docx" ? <iframe title={`${jd.label} DOCX`} sandbox="" srcDoc={`<style>body{font:15px/1.6 Arial,sans-serif;color:#17243d;padding:28px;max-width:760px;margin:auto}h1,h2,h3{font-family:Georgia,serif}p{margin:0 0 12px}table{max-width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}</style>${preview.source}`} /> : <pre>{jd.text}</pre>}</section></div>; }
