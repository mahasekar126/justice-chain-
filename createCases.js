const axios = require("axios");

const cases = [
  { title: "Property Dispute", description: "Land ownership case", victimName: "John Smith", accusedName: "Jane Smith", location: "New York", incidentDetails: "Dispute over property boundaries" },
  { title: "Fraud Case", description: "Online transaction scam", victimName: "Alice Johnson", accusedName: "Bob Wilson", location: "California", incidentDetails: "Fake investment scheme" },
  { title: "Theft Case", description: "Stolen vehicle report", victimName: "Mike Davis", accusedName: "Unknown", location: "Texas", incidentDetails: "Car stolen from parking lot" },
  { title: "Contract Dispute", description: "Business agreement conflict", victimName: "ABC Corp", accusedName: "XYZ Ltd", location: "Florida", incidentDetails: "Breach of contract terms" },
  { title: "Inheritance Case", description: "Family inheritance dispute", victimName: "Sarah Brown", accusedName: "Tom Brown", location: "Illinois", incidentDetails: "Will contestation" },
  { title: "Divorce Case", description: "Marital dispute", victimName: "Emma White", accusedName: "David White", location: "Georgia", incidentDetails: "Custody and asset division" },
  { title: "Cybercrime Case", description: "Hacking incident", victimName: "Tech Solutions Inc", accusedName: "Hacker Group", location: "Washington", incidentDetails: "Data breach and theft" },
  { title: "Bank Loan Case", description: "Loan recovery dispute", victimName: "First Bank", accusedName: "John Miller", location: "Ohio", incidentDetails: "Default on loan payments" },
  { title: "Traffic Violation", description: "Hit and run case", victimName: "Lisa Garcia", accusedName: "Unknown Driver", location: "Arizona", incidentDetails: "Pedestrian hit by vehicle" },
  { title: "Environmental Case", description: "Pollution lawsuit", victimName: "Green Earth Org", accusedName: "Industrial Corp", location: "Oregon", incidentDetails: "Illegal dumping of chemicals" }
];

async function createAllCases() {
  for (let c of cases) {
    try {
      const res = await axios.post("http://localhost:3000/createCase", c);
      console.log(`✅ Created: ${c.title} | TX: ${res.data.txHash}`);
    } catch (err) {
      console.log(`❌ Failed: ${c.title} | Error: ${err.message}`);
    }
  }
}

createAllCases();
