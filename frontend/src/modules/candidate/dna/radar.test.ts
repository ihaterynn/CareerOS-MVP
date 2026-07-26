import assert from "node:assert/strict";
import test from "node:test";

import { radarPolygon } from "./radar.ts";

test("places a maximum first score at the top of the pentagon", () => {
  assert.equal(radarPolygon([100, 0, 0, 0, 0]), "100,20 100,100 100,100 100,100 100,100");
});
