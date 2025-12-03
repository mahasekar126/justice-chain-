const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// ABI + Contract Address from .env
const contractABI = require("./artifacts/contracts/JusticeChain.sol/JusticeChain.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

// Sepolia testnet
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

// Use your private key
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Connect to contract
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// API: Create Case
app.post("/createCase", async (req, res) => {
  try {
    const { title, description, victimName, accusedName, location, incidentDetails } = req.body;
    const tx = await contract.createCase(title, description, victimName, accusedName, location, incidentDetails);
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Update Case
app.post("/updateCase", async (req, res) => {
  try {
    const { id, description } = req.body;
    const tx = await contract.updateCase(id, description);
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Add Evidence
app.post("/addEvidence", async (req, res) => {
  try {
    const { caseId, evidenceHash, description } = req.body;
    const tx = await contract.addEvidence(caseId, evidenceHash, description);
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Update Case Status
app.post("/updateCaseStatus", async (req, res) => {
  try {
    const { id, status } = req.body;
    const statusEnum = status === "Closed" ? 2 : status === "Pending" ? 1 : 0; // Open=0, Pending=1, Closed=2
    const tx = await contract.updateCaseStatus(id, statusEnum);
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Get Case Detail
app.get("/caseDetail/:id", async (req, res) => {
  try {
    const caseDetail = await contract.getCaseDetail(req.params.id);
    const statusString = caseDetail[10] === 0 ? "Open" : caseDetail[10] === 1 ? "Pending" : "Closed";
    res.send({
      caseDetail: {
        id: caseDetail[0].toNumber(),
        title: caseDetail[1],
        description: caseDetail[2],
        victimName: caseDetail[3],
        accusedName: caseDetail[4],
        location: caseDetail[5],
        incidentDetails: caseDetail[6],
        createdBy: caseDetail[7],
        createdAt: caseDetail[8].toNumber(),
        lastUpdated: caseDetail[9].toNumber(),
        status: statusString,
        evidenceCount: caseDetail[11].toNumber(),
        judgment: caseDetail[12],
        judgmentDate: caseDetail[13].toNumber()
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Get Case Status
app.get("/caseStatus/:id", async (req, res) => {
  try {
    const caseDetail = await contract.getCaseDetail(req.params.id);
    const statusString = caseDetail[10] === 0 ? "Open" : caseDetail[10] === 1 ? "Pending" : "Closed";
    res.send({ status: statusString });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Get Evidence
app.get("/evidence/:caseId/:index", async (req, res) => {
  try {
    const evidence = await contract.getEvidence(req.params.caseId, req.params.index);
    res.send({
      evidence: {
        hash: evidence[0],
        description: evidence[1],
        addedBy: evidence[2],
        timestamp: evidence[3].toNumber()
      }
    });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Add Judgment
app.post("/addJudgment", async (req, res) => {
  try {
    const { id, judgment, judgmentDate } = req.body;
    const tx = await contract.addJudgment(id, judgment, judgmentDate);
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Resolve Case
app.post("/resolveCase", async (req, res) => {
  try {
    const { id } = req.body;
    const tx = await contract.updateCaseStatus(id, 2); // 2 = Closed
    await tx.wait();
    res.send({ success: true, txHash: tx.hash });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Check Stale
app.get("/checkStale/:id", async (req, res) => {
  try {
    const result = await contract.checkStaleCase(req.params.id);
    res.send({ caseId: req.params.id, isStale: result });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Get Stats
app.get("/stats", async (req, res) => {
  try {
    let totalCases = 0;
    let casesToday = 0;
    let pendingEvidence = 0;
    let activeCases = 0;
    const today = Math.floor(Date.now() / 1000 / 86400) * 86400; // start of today in seconds

    for (let i = 1; ; i++) {
      try {
        const caseDetail = await contract.getCaseDetail(i);
        totalCases++;
        const createdAt = caseDetail[8].toNumber();
        if (createdAt >= today) casesToday++;
        const status = caseDetail[10];
        if (status === 0 || status === 1) activeCases++; // Open=0, Pending=1
        const evidenceCount = caseDetail[11].toNumber();
        if (evidenceCount > 0) pendingEvidence++; // Cases with evidence
      } catch (err) {
        break; // No more cases
      }
    }

    res.send({ totalCases, casesToday, pendingEvidence, activeCases });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// API: Get Recent Activities
app.get("/recentActivities", async (req, res) => {
  try {
    const activities = [];
    const now = Math.floor(Date.now() / 1000);

    // Get current case counter from contract
    const caseCounter = await contract.caseCounter();

    // Get last 10 cases and their activities
    for (let i = caseCounter; i > Math.max(1, caseCounter - 10); i--) {
      try {
        const caseDetail = await contract.getCaseDetail(i);
        const caseId = caseDetail[0].toNumber();
        const title = caseDetail[1];
        const createdAt = caseDetail[8].toNumber();
        const lastUpdated = caseDetail[9].toNumber();
        const status = caseDetail[10];
        const evidenceCount = caseDetail[11].toNumber();
        const judgment = caseDetail[12];

        // Case creation activity
        activities.push({
          type: 'case_created',
          caseId: caseId,
          title: title,
          timestamp: createdAt,
          icon: 'fas fa-plus-circle'
        });

        // Evidence added activities
        for (let j = 0; j < evidenceCount; j++) {
          try {
            const evidence = await contract.getEvidence(caseId, j);
            activities.push({
              type: 'evidence_added',
              caseId: caseId,
              timestamp: evidence[3].toNumber(),
              icon: 'fas fa-file-alt'
            });
          } catch (err) {
            console.log("Error fetching evidence", j, err);
          }
        }

        // Status change to resolved
        if (status === 2) { // Closed
          activities.push({
            type: 'case_resolved',
            caseId: caseId,
            timestamp: lastUpdated,
            icon: 'fas fa-check-circle'
          });
        }

        // Judgment added
        if (judgment.length > 0) {
          activities.push({
            type: 'judgment_added',
            caseId: caseId,
            timestamp: caseDetail[13].toNumber(),
            icon: 'fas fa-gavel'
          });
        }

      } catch (err) {
        break; // No more cases
      }
    }

    // Sort by timestamp descending and take top 10
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const recentActivities = activities.slice(0, 10);

    res.send({ activities: recentActivities });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 JusticeChain API running on http://localhost:3000");
  console.log("Contract Address:", contractAddress);
});
