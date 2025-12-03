// =========================
// FRONTEND.JS
// =========================

// Backend API base URL
const API_URL = "http://localhost:3000";

// Load stats on page load
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/stats`);
    if (res.ok) {
      const stats = await res.json();
      document.getElementById("totalCases").innerText = stats.totalCases;
      document.getElementById("casesToday").innerText = stats.casesToday;
      document.getElementById("pendingEvidence").innerText = stats.pendingEvidence;
      document.getElementById("activeCases").innerText = stats.activeCases;
      document.getElementById("heroTotalCases").innerText = stats.totalCases;
      document.getElementById("heroActiveCases").innerText = stats.activeCases;
      document.getElementById("heroResolvedCases").innerText = stats.totalCases - stats.activeCases;
    }
  } catch (err) {
    console.log("Error loading stats:", err);
  }
}

// --- ADD CASE ---
async function createCase() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const victimName = document.getElementById("victimName").value.trim();
  const accusedName = document.getElementById("accusedName").value.trim();
  const location = document.getElementById("location").value.trim();
  const incidentDetails = document.getElementById("incidentDetails").value.trim();
  const type = document.getElementById("caseType").value.trim();

  if (!title || !description || !victimName || !accusedName || !location || !incidentDetails || !type) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/createCase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, victimName, accusedName, location, incidentDetails }),
    });

    if (!res.ok) throw new Error("Server error while creating case");

    const data = await res.json();
    alert("✅ Case Created! Transaction Hash: " + data.txHash);

    // Clear form fields
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("victimName").value = "";
    document.getElementById("accusedName").value = "";
    document.getElementById("location").value = "";
    document.getElementById("incidentDetails").value = "";
    document.getElementById("caseType").value = "";

    // Reload stats after creating case
    loadStats();
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- VIEW CASE DETAIL ---
async function viewCaseDetail() {
  const id = document.getElementById("caseDetailId").value.trim();
  if (!id) {
    alert("⚠️ Enter Case ID");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/caseDetail/${id}`);
    if (!res.ok) throw new Error("Case not found");

    const data = await res.json();
    const caseDetail = data.caseDetail;

    // Fetch evidences
    const evidenceCount = caseDetail.evidenceCount;
    let evidences = [];
    for (let i = 0; i < evidenceCount; i++) {
      try {
        const evidenceRes = await fetch(`${API_URL}/evidence/${id}/${i}`);
        if (evidenceRes.ok) {
          const evidenceData = await evidenceRes.json();
          evidences.push(evidenceData.evidence);
        }
      } catch (err) {
        console.log("Error fetching evidence", i, err);
      }
    }

    // Format dates
    const createdDate = new Date(caseDetail.createdAt * 1000).toLocaleString();
    const updatedDate = new Date(caseDetail.lastUpdated * 1000).toLocaleString();
    const judgmentDate = caseDetail.judgmentDate ? new Date(caseDetail.judgmentDate * 1000).toLocaleString() : "N/A";

    // Build HTML display
    let html = `
      <div class="case-detail-container">
        <h3>Case #${caseDetail.id} Details</h3>
        <div class="case-info-grid">
          <div class="info-item">
            <strong>Title:</strong> ${caseDetail.title}
          </div>
          <div class="info-item">
            <strong>Description:</strong> ${caseDetail.description}
          </div>
          <div class="info-item">
            <strong>Victim:</strong> ${caseDetail.victimName}
          </div>
          <div class="info-item">
            <strong>Accused:</strong> ${caseDetail.accusedName}
          </div>
          <div class="info-item">
            <strong>Location:</strong> ${caseDetail.location}
          </div>
          <div class="info-item">
            <strong>Incident Details:</strong> ${caseDetail.incidentDetails}
          </div>
          <div class="info-item">
            <strong>Status:</strong> <span class="status-${caseDetail.status.toLowerCase()}">${caseDetail.status}</span>
          </div>
          <div class="info-item">
            <strong>Created By:</strong> ${caseDetail.createdBy}
          </div>
          <div class="info-item">
            <strong>Created At:</strong> ${createdDate}
          </div>
          <div class="info-item">
            <strong>Last Updated:</strong> ${updatedDate}
          </div>
        </div>
    `;

    if (caseDetail.judgment) {
      html += `
        <div class="judgment-section">
          <h4>Judgment</h4>
          <p><strong>Details:</strong> ${caseDetail.judgment}</p>
          <p><strong>Date:</strong> ${judgmentDate}</p>
        </div>
      `;
    }

    if (evidences.length > 0) {
      html += `<h4>Evidences (${evidences.length})</h4>`;
      evidences.forEach((evidence, index) => {
        const evidenceDate = new Date(evidence.timestamp * 1000).toLocaleString();
        html += `
          <div class="evidence-item">
            <h5>Evidence #${index + 1}</h5>
            <p><strong>Hash:</strong> ${evidence.hash}</p>
            <p><strong>Description:</strong> ${evidence.description}</p>
            <p><strong>Added By:</strong> ${evidence.addedBy}</p>
            <p><strong>Timestamp:</strong> ${evidenceDate}</p>
          </div>
        `;
      });
    } else {
      html += `<p>No evidences found for this case.</p>`;
    }

    html += `</div>`;

    document.getElementById("caseDetailResult").innerHTML = html;
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- ADD EVIDENCE ---
async function addEvidence() {
  const id = document.getElementById("evidenceCaseId").value.trim();
  const text = document.getElementById("evidenceText").value.trim();

  if (!id || !text) {
    alert("⚠️ Enter Case ID and Evidence");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/addEvidence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caseId: id, evidenceHash: text, description: text }),
    });

    if (!res.ok) throw new Error("Error adding evidence");

    const data = await res.json();
    document.getElementById("evidenceResult").innerText = "✅ Evidence Added! Tx Hash: " + data.txHash;

    // Clear input
    document.getElementById("evidenceText").value = "";
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- CHECK CASE STATUS ---
async function checkStatus() {
  const id = document.getElementById("statusCaseId").value.trim();
  if (!id) {
    alert("⚠️ Enter Case ID");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/caseStatus/${id}`);
    if (!res.ok) throw new Error("Case not found");

    const data = await res.json();
    document.getElementById(
      "statusResult"
    ).innerText = `📌 Status: ${data.status}`;
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- CHECK STALE CASE ---
async function checkStale() {
  const id = document.getElementById("staleCaseId").value.trim();
  if (!id) {
    alert("⚠️ Enter Case ID");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/checkStale/${id}`);
    if (!res.ok) throw new Error("Case not found");

    const data = await res.json();
    document.getElementById(
      "staleResult"
    ).innerText = `📌 Is Case Stale? ${data.isStale}`;
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- ADD JUDGMENT ---
async function addJudgment() {
  const id = document.getElementById("judgmentCaseId").value.trim();
  const judgment = document.getElementById("judgmentText").value.trim();
  const dateInput = document.getElementById("judgmentDate").value;

  if (!id || !judgment || !dateInput) {
    alert("⚠️ Enter Case ID, Judgment Details, and Date");
    return;
  }

  // Convert date to Unix timestamp and validate
  const dateObj = new Date(dateInput);
  if (isNaN(dateObj.getTime())) {
    alert("⚠️ Please enter a valid date");
    return;
  }
  const judgmentDate = Math.floor(dateObj.getTime() / 1000);

  try {
    const res = await fetch(`${API_URL}/addJudgment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id), judgment, judgmentDate }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error adding judgment");
    }

    const data = await res.json();
    document.getElementById("judgmentResult").innerText = "✅ Judgment Added! Tx Hash: " + data.txHash;

    // Clear inputs
    document.getElementById("judgmentText").value = "";
    document.getElementById("judgmentDate").value = "";
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- RESOLVE CASE ---
async function resolveCase() {
  const id = document.getElementById("resolveCaseId").value.trim();
  if (!id) {
    alert("⚠️ Enter Case ID");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/resolveCase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parseInt(id) }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Error resolving case");
    }

    const data = await res.json();
    document.getElementById("resolveResult").innerText = "✅ Case Resolved! Tx Hash: " + data.txHash;

    // Clear input
    document.getElementById("resolveCaseId").value = "";

    // Reload stats after resolving case
    loadStats();
  } catch (err) {
    alert("❌ Error: " + err.message);
  }
}

// --- LOAD RECENT ACTIVITIES ---
async function loadRecentActivities() {
  try {
    const res = await fetch(`${API_URL}/recentActivities`);
    if (res.ok) {
      const data = await res.json();
      const activities = data.activities;
      const activityList = document.getElementById("activityList");

      if (activities.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activities found.</p>';
        return;
      }

      let html = '';
      activities.forEach(activity => {
        const timeAgo = getTimeAgo(activity.timestamp);
        let description = '';

        switch (activity.type) {
          case 'case_created':
            description = `New case created: <strong>Case #${activity.caseId}</strong>`;
            break;
          case 'evidence_added':
            description = `Evidence added to Case #${activity.caseId}`;
            break;
          case 'case_resolved':
            description = `Case #${activity.caseId} status updated to Resolved`;
            break;
          case 'judgment_added':
            description = `Judgment added to Case #${activity.caseId}`;
            break;
          default:
            description = `Activity on Case #${activity.caseId}`;
        }

        html += `
          <div class="activity-item">
            <div class="activity-icon">
              <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
              <p>${description}</p>
              <span class="activity-time">${timeAgo}</span>
            </div>
          </div>
        `;
      });

      activityList.innerHTML = html;
    }
  } catch (err) {
    console.log("Error loading activities:", err);
    document.getElementById("activityList").innerHTML = '<p class="no-activity">Unable to load activities.</p>';
  }
}

// --- HELPER FUNCTION FOR TIME AGO ---
function getTimeAgo(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 2592000)} months ago`;
}
