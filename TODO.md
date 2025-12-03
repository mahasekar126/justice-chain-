# TODO: Deploy JusticeChain to Sepolia Testnet for Permanent Case Storage

## Step 1: Set up .env for testnet ✅
- Add PRIVATE_KEY (from a wallet with Sepolia ETH)
- Add SEPOLIA_RPC_URL (from Infura/Alchemy)
- CONTRACT_ADDRESS will be updated after deployment

## Step 2: Update hardhat.config.js ✅
- Add sepolia network config with RPC URL and accounts from .env

## Step 3: Deploy contract to Sepolia ✅
- Run `npx hardhat run scripts/deploy.js --network sepolia`
- Update .env with new CONTRACT_ADDRESS

## Step 4: Update server.js ✅
- Change provider to Sepolia RPC URL
- Change wallet to use PRIVATE_KEY from .env

## Step 5: Test deployment ✅
- Start server with `node server.js`
- Create cases and verify they persist after restart
