import { ethers } from "ethers";

const SOS_ALERT_REGISTRY_ABI = [
  "function logSOSAlert(string alertId, uint256 timestamp, bytes32 locationHash) external",
  "function getAlert(string alertId) external view returns (string, uint256, bytes32)",
  "function getAlertCount() external view returns (uint256)",
  "event AlertLogged(string indexed alertId, uint256 timestamp, bytes32 locationHash)"
];

const CONTRACT_ADDRESS = process.env.SOS_ALERT_REGISTRY_ADDRESS!;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY!;
const RPC_URL = process.env.LISK_SEPOLIA_RPC_URL || "https://rpc.sepolia-api.lisk.com";

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    if (!PRIVATE_KEY) {
      throw new Error("Missing BLOCKCHAIN_PRIVATE_KEY");
    }
    if (!PRIVATE_KEY.startsWith("0x")) {
      throw new Error("BLOCKCHAIN_PRIVATE_KEY must start with 0x and be a raw private key");
    }
    if (!CONTRACT_ADDRESS) {
      throw new Error("Missing SOS_ALERT_REGISTRY_ADDRESS");
    }

    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, SOS_ALERT_REGISTRY_ABI, this.wallet);
  }

  private hashLocation(latitude: number, longitude: number): string {
    const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(locationString);

    let hash = 5381;
    for (let i = 0; i < dataBuffer.length; i++) {
      hash = ((hash << 5) + hash) + dataBuffer[i];
      hash = hash & 0xFFFFFFFF;
    }

    return `0x${(hash >>> 0).toString(16).padStart(64, "0")}`;
  }

  async logSOSAlert(alertId: string, timestamp: number, latitude: number, longitude: number): Promise<string> {
    const locationHash = this.hashLocation(latitude, longitude);
    let attempts = 0;
    const maxAttempts = 3;
    let tx;

    while (attempts < maxAttempts) {
      try {
        tx = await this.contract.logSOSAlert(alertId, timestamp, locationHash);
        await tx.wait(1);
        return tx.hash;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) throw err;
        await new Promise(res => setTimeout(res, 2000));
      }
    }

    throw new Error("Failed to log SOS alert to blockchain");
  }

  async getSOSAlert(alertId: string) {
    const result = await this.contract.getAlert(alertId);
    return {
      alertId: result[0],
      timestamp: Number(result[1]),
      locationHash: result[2]
    };
  }

  async getAlertCount(): Promise<number> {
    const count = await this.contract.getAlertCount();
    return Number(count);
  }
}

// ⚡️ Lazy export: only construct when actually used
export function getBlockchainService() {
  return new BlockchainService();
}
