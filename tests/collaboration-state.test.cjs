const assert = require("assert");
const {
  createCollaborationState,
  addCandidate,
  getCandidatesForStudent,
  getFinalCandidates,
  addFinalCandidates,
  serializeState,
  hydrateState,
} = require("../collaboration-state.js");

function run() {
  let state = createCollaborationState();

  state = addCandidate(state, {
    id: "a1",
    owner: "chanyoung",
    day: "day2",
    type: "archi",
    name: "Test Architecture",
    lat: -33.86,
    lng: 151.2,
    desc: "후보 건축지",
    phone: "",
  });

  state = addCandidate(state, {
    id: "b1",
    owner: "junhee",
    day: "day2",
    type: "food",
    name: "Test Cafe",
    lat: -33.87,
    lng: 151.21,
    desc: "후보 카페",
    phone: "+61",
  });

  assert.strictEqual(getCandidatesForStudent(state, "chanyoung", "day2").length, 1);
  assert.strictEqual(getCandidatesForStudent(state, "chanyoung", "day1").length, 0);
  assert.strictEqual(getCandidatesForStudent(state, "junhee", "day2")[0].name, "Test Cafe");

  state = addFinalCandidates(state, ["a1", "a1", "b1"]);
  assert.deepStrictEqual(state.finalIds, ["a1", "b1"]);
  assert.deepStrictEqual(
    getFinalCandidates(state).map((candidate) => candidate.name),
    ["Test Architecture", "Test Cafe"]
  );

  const roundTripped = hydrateState(serializeState(state));
  assert.strictEqual(roundTripped.candidates.length, 2);
  assert.deepStrictEqual(roundTripped.finalIds, ["a1", "b1"]);
}

run();
console.log("collaboration-state tests passed");
