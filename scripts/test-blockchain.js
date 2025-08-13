// Test script for blockchain integration with Lisk Sepolia testnet
require('dotenv').config();
const { ethers } = require('ethers');

// Contract ABI (minimal for testing)
const SOS_ALERT_REGISTRY_ABI = [
  "function logSOSAlert(string alertId, uint256 timestamp, bytes32 locationHash) external",
  "function getAlert(string alertId) external view returns (string, uint256, bytes32)",
  "function getAlertCount() external view returns (uint256)",
  "event AlertLogged(string indexed alertId, uint256 timestamp, bytes32 locationHash)"
];

// Configuration
const CONTRACT_ADDRESS = process.env.SOS_ALERT_REGISTRY_ADDRESS;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const RPC_URL = process.env.LISK_SEPOLIA_RPC_URL || "https://rpc.sepolia-api.lisk.com";

async function main() {
  if (!CONTRACT_ADDRESS) {
    console.error('Error: SOS_ALERT_REGISTRY_ADDRESS not set in .env file');
    process.exit(1);
  }

  if (!PRIVATE_KEY) {
    console.error('Error: BLOCKCHAIN_PRIVATE_KEY not set in .env file');
    process.exit(1);
  }

  console.log('Testing blockchain integration with Lisk Sepolia testnet...');
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
  console.log(`RPC URL: ${RPC_URL}`);

  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SOS_ALERT_REGISTRY_ABI, wallet);

    // Get current alert count
    const initialCount = await contract.getAlertCount();
    console.log(`Current alert count: ${initialCount}`);

    // Create test alert data
    const testAlertId = `test-${Date.now()}`;
    const timestamp = Date.now();
    const latitude = 9.0765;
    const longitude = 7.3986;

    // Hash location data for blockchain storage
    const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(locationString);
    
    // Create a hash using djb2 algorithm
    let hash = 5381;
    for (let i = 0; i < dataBuffer.length; i++) {
      hash = ((hash << 5) + hash) + dataBuffer[i]; // hash * 33 + char
      hash = hash & 0xFFFFFFFF; // Keep as 32-bit unsigned int
    }
    
    // Convert to hex string with proper padding for bytes32
    const locationHash = `0x${(hash >>> 0).toString(16).padStart(64, '0')}`;

    console.log('Sending test alert to blockchain...');
    console.log(`Alert ID: ${testAlertId}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Location: ${latitude}, ${longitude}`);
    console.log(`Location Hash: ${locationHash}`);

    // Send transaction
    const tx = await contract.logSOSAlert(testAlertId, timestamp, locationHash);
    console.log(`Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    console.log('Waiting for transaction confirmation...');
    const receipt = await tx.wait(1);
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    // Verify alert was stored
    const newCount = await contract.getAlertCount();
    console.log(`New alert count: ${newCount}`);
    
    if (Number(newCount) > Number(initialCount)) {
      console.log('✅ Alert count increased - test successful!');
    } else {
      console.log('❌ Alert count did not increase - test failed!');
    }

    // Try to retrieve the alert
    try {
      const alertData = await contract.getAlert(testAlertId);
      console.log('Retrieved alert data:');
      console.log(`- Alert ID: ${alertData[0]}`);
      console.log(`- Timestamp: ${alertData[1]}`);
      console.log(`- Location Hash: ${alertData[2]}`);
      console.log('✅ Alert retrieval successful!');
    } catch (error) {
      console.error('❌ Failed to retrieve alert:', error.message);
    }

  } catch (error) {
    console.error('Error during blockchain test:', error);
    process.exit(1);
  }
}

// Run the test
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });