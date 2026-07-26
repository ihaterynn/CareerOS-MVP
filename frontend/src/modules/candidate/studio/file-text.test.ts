import assert from "node:assert/strict";
import test from "node:test";

import { pdfItemsToText } from "./file-text";

test("pdfItemsToText preserves PDF line breaks for resume parsing", () => {
  const text = pdfItemsToText([
    { str: "Avery Lee", hasEOL: true },
    { str: "Backend Engineer", hasEOL: true },
    { str: "SUMMARY", hasEOL: true },
    { str: "Builds APIs.", hasEOL: true }
  ]);

  assert.equal(text, "Avery Lee\nBackend Engineer\nSUMMARY\nBuilds APIs.");
});
