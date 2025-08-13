const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get network information
  const network = hre.network.name;
  console.log(`Deploying to network: ${network}`);
  
  // Get gas price information
  const gasPrice = await hre.ethers.provider.getFeeData();
  console.log(`Current gas price: ${hre.ethers.formatUnits(gasPrice.gasPrice || 0, "gwei")} gwei`);

  console.log("Deploying SOSAlertRegistry contract...");
  const SOSAlertRegistry = await hre.ethers.getContractFactory("SOSAlertRegistry");
  const sosAlertRegistry = await SOSAlertRegistry.deploy();

  console.log("Waiting for deployment transaction confirmation...");
  await sosAlertRegistry.waitForDeployment();

  const contractAddress = await sosAlertRegistry.getAddress();
  const deploymentTransaction = sosAlertRegistry.deploymentTransaction();
  
  console.log(`\nDeployment successful!`);
  console.log(`Network: ${network}`);
  console.log(`Contract: SOSAlertRegistry`);
  console.log(`Address: ${contractAddress}`);
  console.log(`Transaction: ${deploymentTransaction.hash}`);

  // Save contract address to .env file if it exists
  try {
    const envPath = path.resolve(__dirname, '../../.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update or add the contract address with network information
      const envVarName = network.toUpperCase().includes('LISK') ? 
        'SOS_ALERT_REGISTRY_ADDRESS' : 
        `SOS_ALERT_REGISTRY_ADDRESS_${network.toUpperCase()}`;
      
      // Always update the main contract address for backward compatibility
      if (envContent.includes('SOS_ALERT_REGISTRY_ADDRESS=')) {
        envContent = envContent.replace(
          /SOS_ALERT_REGISTRY_ADDRESS=.*/,
          `SOS_ALERT_REGISTRY_ADDRESS=${contractAddress}`
        );
      } else {
        envContent += `\nSOS_ALERT_REGISTRY_ADDRESS=${contractAddress}`;
      }
      
      // Add network-specific address if it's not Lisk Sepolia
      if (!network.toUpperCase().includes('LISK') && 
          !envContent.includes(`${envVarName}=`)) {
        envContent += `\n${envVarName}=${contractAddress}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`\nContract address saved to .env file as ${envVarName}`);
    }
  } catch (error) {
    console.warn("Could not update .env file:", error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});