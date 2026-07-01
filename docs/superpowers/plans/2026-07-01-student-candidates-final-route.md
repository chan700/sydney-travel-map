# Student Candidates Final Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five student candidate tabs and a final route workflow so student-added places can be reviewed, selected, and merged into a final field itinerary.

**Architecture:** Keep the existing static app. Add student candidate state and final selection state in `app.js`, persist it to `localStorage`, and reuse the current Leaflet/list rendering flow with candidate/final display modes. Add small HTML containers and CSS states for student tabs, candidate cards, and selection controls.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Leaflet, browser `localStorage`.

---

### Task 1: Add Collaboration Tabs And Form Context

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Step 1: Add a third top-level menu and student/final subtabs**

In `index.html`, add a new main menu button next to the existing two buttons:

```html
<button class="menu-tab-btn" data-menu="collab">학생 후보 / 최종</button>
```

Add a new subtab container after `subtabs-theme`:

```html
<div id="subtabs-collab" class="tab-header hidden">
  <button class="tab-btn" data-route="student-chanyoung">찬영</button>
  <button class="tab-btn" data-route="student-junhee">준희</button>
  <button class="tab-btn" data-route="student-jin">진</button>
  <button class="tab-btn" data-route="student-sungwon">성원</button>
  <button class="tab-btn" data-route="student-hyunwoo">현우</button>
  <button class="tab-btn final-tab-btn" data-route="final">최종</button>
</div>
```

- [ ] **Step 2: Add student context controls to the add form**

In `index.html`, add this block inside `dynamic-add-form`, before the day selector:

```html
<div id="student-context-row" class="form-group-row hidden">
  <label for="candidate-owner">추가자</label>
  <select id="candidate-owner">
    <option value="chanyoung">찬영</option>
    <option value="junhee">준희</option>
    <option value="jin">진</option>
    <option value="sungwon">성원</option>
    <option value="hyunwoo">현우</option>
  </select>
</div>
```

- [ ] **Step 3: Style candidate/final UI states**

In `style.css`, add:

```css
.final-tab-btn {
  background-color: #111827;
  color: #fff;
}

.route-step-item.candidate-item .step-body-card {
  background: #fffbeb;
  border-color: #f59e0b;
}

.route-step-item.final-added-item .step-body-card {
  background: #ecfdf5;
  border-color: #10b981;
}

.candidate-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-size: 9px;
  font-weight: 800;
}

.candidate-select-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

.final-actions {
  display: flex;
  gap: 8px;
  margin: 10px 0 14px;
}
```

- [ ] **Step 4: Verify static markup**

Run: open `http://localhost:5000`.
Expected: the new `학생 후보 / 최종` top-level tab appears; no console-breaking syntax issue is introduced.

### Task 2: Add Candidate And Final State

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Define student metadata and persistence helpers**

Add near the app state declarations:

```js
const students = {
  chanyoung: { name: "찬영", routeKey: "student-chanyoung", color: "#f59e0b" },
  junhee: { name: "준희", routeKey: "student-junhee", color: "#3b82f6" },
  jin: { name: "진", routeKey: "student-jin", color: "#8b5cf6" },
  sungwon: { name: "성원", routeKey: "student-sungwon", color: "#10b981" },
  hyunwoo: { name: "현우", routeKey: "student-hyunwoo", color: "#ef4444" },
};

const collaborationStoreKey = "sydney-archi-walk-collaboration-v1";
let collaborationState = loadCollaborationState();

function createEmptyCollaborationState() {
  return { candidates: [], finalIds: [] };
}

function loadCollaborationState() {
  try {
    const saved = localStorage.getItem(collaborationStoreKey);
    if (!saved) return createEmptyCollaborationState();
    const parsed = JSON.parse(saved);
    return {
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
      finalIds: Array.isArray(parsed.finalIds) ? parsed.finalIds : [],
    };
  } catch (error) {
    console.warn("후보 장소 저장 데이터를 불러오지 못했습니다.", error);
    return createEmptyCollaborationState();
  }
}

function saveCollaborationState() {
  localStorage.setItem(collaborationStoreKey, JSON.stringify(collaborationState));
}
```

- [ ] **Step 2: Add route key helpers**

Add:

```js
function getStudentIdFromRoute(routeKey) {
  return Object.keys(students).find((id) => students[id].routeKey === routeKey) || null;
}

function isStudentRoute(routeKey) {
  return Boolean(getStudentIdFromRoute(routeKey));
}

function getBaseDaySpots(dayKey) {
  return routesData[dayKey] ? routesData[dayKey].spots : [];
}

function getCandidateSpotsForStudent(studentId, dayKey) {
  return collaborationState.candidates.filter((spot) => {
    return spot.owner === studentId && (!dayKey || spot.day === dayKey);
  });
}

function getFinalCandidateSpots() {
  const selected = new Set(collaborationState.finalIds);
  return collaborationState.candidates.filter((spot) => selected.has(String(spot.id)));
}
```

- [ ] **Step 3: Verify helper syntax**

Run: refresh `http://localhost:5000`.
Expected: app loads without JavaScript syntax errors.

### Task 3: Render Student And Final Views

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Extend `updateRouteView(routeKey)` for student routes**

At the top of `updateRouteView`, after local variable setup, branch student routes:

```js
const studentId = getStudentIdFromRoute(routeKey);
if (studentId) {
  const student = students[studentId];
  const selectedDay = document.getElementById("place-day").value || "day1";
  const baseSpots = getBaseDaySpots(selectedDay).map((spot) => ({
    ...spot,
    originDay: selectedDay.toUpperCase(),
    dayColor: routesData[selectedDay].color,
  }));
  const candidateSpots = getCandidateSpotsForStudent(studentId, selectedDay).map((spot) => ({
    ...spot,
    isCandidate: true,
    originDay: `${student.name} 후보`,
    dayColor: student.color,
  }));

  renderRouteContent({
    routeKey,
    targetSpots: [...baseSpots, ...candidateSpots],
    titleText: `${student.name} 후보 일정`,
    descText: `${student.name} 학생이 ${selectedDay.toUpperCase()}에 제안한 후보지를 기존 일정과 함께 봅니다.`,
    themeColor: student.color,
    showCandidateSelection: false,
  });
  return;
}
```

- [ ] **Step 2: Extend `updateRouteView(routeKey)` for final route**

Add a branch before normal route handling:

```js
if (routeKey === "final") {
  const baseSpots = ["day1", "day2", "day3", "day4", "day5"].flatMap((dayKey) => {
    return getBaseDaySpots(dayKey).map((spot) => ({
      ...spot,
      originDay: dayKey.toUpperCase(),
      dayColor: routesData[dayKey].color,
    }));
  });
  const finalSpots = getFinalCandidateSpots().map((spot) => ({
    ...spot,
    isFinalAdded: true,
    originDay: `${students[spot.owner].name} 확정`,
    dayColor: "#10b981",
  }));

  renderRouteContent({
    routeKey,
    targetSpots: [...baseSpots, ...finalSpots],
    titleText: "최종 답사지",
    descText: "기존 답사 일정에 회의에서 선택한 학생 후보지를 합친 최종 이동용 목록입니다.",
    themeColor: "#111827",
    showCandidateSelection: true,
  });
  return;
}
```

- [ ] **Step 3: Extract current route rendering into `renderRouteContent(options)`**

Move the current text/list/map rendering body of `updateRouteView` into a new function that accepts:

```js
function renderRouteContent({ routeKey, targetSpots, titleText, descText, themeColor, showCandidateSelection }) {
  activeRouteKey = routeKey;
  // existing DOM update, list render, marker render, and path render logic
}
```

Inside list rendering, add candidate/final classes:

```js
itemEl.className = `route-step-item${spot.isCandidate ? " candidate-item" : ""}${spot.isFinalAdded ? " final-added-item" : ""}`;
```

Add candidate badge text next to `originBadge`:

```js
const candidateBadge = spot.isCandidate || spot.isFinalAdded
  ? `<span class="candidate-meta">${spot.originDay}</span>`
  : "";
```

Include `${candidateBadge}` in the card markup after the time badge.

- [ ] **Step 4: Add final candidate selector block**

When `showCandidateSelection` is true, append unchecked candidate rows for all unfinalized candidates below the rendered route list. Each row uses:

```html
<label class="candidate-select-row">
  <input type="checkbox" class="candidate-final-checkbox" value="${candidate.id}">
  <span>${students[candidate.owner].name} 후보 · ${candidate.day.toUpperCase()} · ${candidate.name}</span>
</label>
```

Add a button:

```html
<div class="final-actions">
  <button id="btn-add-selected-final" class="btn-primary" type="button">
    <i class="fa-solid fa-check"></i> 선택 후보를 최종 답사지에 추가
  </button>
</div>
```

- [ ] **Step 5: Wire final selection button**

Attach a click handler after inserting the button:

```js
const finalButton = document.getElementById("btn-add-selected-final");
if (finalButton) {
  finalButton.addEventListener("click", () => {
    const selectedIds = Array.from(document.querySelectorAll(".candidate-final-checkbox:checked")).map((input) => input.value);
    if (selectedIds.length === 0) {
      alert("최종 답사지에 추가할 후보를 선택해주세요.");
      return;
    }
    collaborationState.finalIds = Array.from(new Set([...collaborationState.finalIds, ...selectedIds]));
    saveCollaborationState();
    updateRouteView("final");
  });
}
```

### Task 4: Save New Places As Student Candidates

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Update submit handler routing**

In the submit handler, derive owner and current route:

```js
const activeStudentId = getStudentIdFromRoute(activeRouteKey);
const owner = activeStudentId || document.getElementById("candidate-owner").value;
```

When the active route is a student route, save the new spot into `collaborationState.candidates` instead of `routesData[selectedDay].spots`:

```js
const newSpot = {
  id: String(Date.now()),
  owner,
  day: selectedDay,
  type: activePlaceType,
  time: `후보 ${getCandidateSpotsForStudent(owner, selectedDay).length + 1}`,
  name,
  lat,
  lng,
  desc: activePlaceType === "food" ? (address || "주소 미제공") : extraInfo,
  phone: activePlaceType === "food" ? extraInfo : "",
};

if (activeStudentId) {
  collaborationState.candidates.push(newSpot);
  saveCollaborationState();
  updateRouteView(activeRouteKey);
} else {
  routesData[selectedDay].spots.push({ ...newSpot, id: Date.now() });
  const dayTab = document.querySelector(`#subtabs-main .tab-btn[data-route="${selectedDay}"]`);
  if (dayTab) dayTab.click();
}
```

- [ ] **Step 2: Show the student context row only for collaboration mode**

In menu switching and route switching, toggle:

```js
document.getElementById("student-context-row").classList.toggle("hidden", !isStudentRoute(activeRouteKey));
```

When a student route is active, set:

```js
document.getElementById("candidate-owner").value = getStudentIdFromRoute(activeRouteKey);
```

### Task 5: Menu Switching And Verification

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Update top-level menu switching**

Include `subtabs-collab` in the menu handler. When `data-menu="collab"`, hide main/theme subtabs, show collaboration subtabs, activate the first collaboration tab if none is active, and call `updateRouteView()`.

- [ ] **Step 2: Manual verification**

Run:

```text
Open http://localhost:5000
Click 학생 후보 / 최종
Click 찬영
Add a test architecture candidate
Confirm candidate appears with highlighted card and marker
Click 최종
Select the candidate
Click 선택 후보를 최종 답사지에 추가
Confirm final route shows selected candidate
Refresh page
Confirm candidate/final state persists
```

Expected: all listed checks pass.
