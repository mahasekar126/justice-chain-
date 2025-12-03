const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get the contract factory
  const JusticeChain = await hre.ethers.getContractFactory("JusticeChain");

  // Deploy the contract
  const justiceChain = await JusticeChain.deploy();

  // Wait for deployment to finish
  await justiceChain.deployTransaction.wait();

  console.log("✅ JusticeChain deployed at:", justiceChain.address);

  // Save contract address to .env file
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  const newEnvContent = envContent.replace(/CONTRACT_ADDRESS=.*/g, "") + `\nCONTRACT_ADDRESS=${justiceChain.address}\n`;
  fs.writeFileSync(envPath, newEnvContent.trim());

  console.log("📝 Contract address saved to .env file");
}

// Run the main function and catch errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
