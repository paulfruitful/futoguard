import { ethers } from "ethers"

const GUARDIAN_CONTRACT_ABI = [
  "function logAlert(address sender, uint256 timestamp, int256 latitude, int256 longitude, uint256 urgencyScore) external",
  "function getAlert(uint256 alertId) external view returns (address, uint256, int256, int256, uint256)",
  "function getAlertCount() external view returns (uint256)",
  "event AlertLogged(uint256 indexed alertId, address indexed sender, uint256 timestamp)",
]

const CONTRACT_ADDRESS = process.env.GUARDIAN_CONTRACT_ADDRESS!
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY!
const RPC_URL = process.env.POLYGON_RPC_URL || "https://rpc-mumbai.maticvigil.com"

export class BlockchainService {
  private provider: ethers.JsonRpcProvider
  private wallet: ethers.Wallet
  private contract: ethers.Contract

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL)
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider)
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, GUARDIAN_CONTRACT_ABI, this.wallet)
  }

  async logAlert(
    senderAddress: string,
    timestamp: number,
    latitude: number,
    longitude: number,
    urgencyScore: number,
  ): Promise<string> {
    try {
      // Convert coordinates to integers (multiply by 1e6 for precision)
      const latInt = Math.round(latitude * 1e6)
      const lngInt = Math.round(longitude * 1e6)
      const urgencyInt = Math.round(urgencyScore * 100)

      const tx = await this.contract.logAlert(senderAddress, timestamp, latInt, lngInt, urgencyInt)

      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error("Blockchain logging error:", error)
      throw new Error("Failed to log alert to blockchain")
    }
  }

  async getAlert(alertId: number) {
    try {
      const result = await this.contract.getAlert(alertId)
      return {
        sender: result[0],
        timestamp: Number(result[1]),
        latitude: Number(result[2]) / 1e6,
        longitude: Number(result[3]) / 1e6,
        urgencyScore: Number(result[4]) / 100,
      }
    } catch (error) {
      console.error("Error fetching alert from blockchain:", error)
      throw new Error("Failed to fetch alert from blockchain")
    }
  }

  async getAlertCount(): Promise<number> {
    try {
      const count = await this.contract.getAlertCount()
      return Number(count)
    } catch (error) {
      console.error("Error fetching alert count:", error)
      return 0
    }
  }
}

export const blockchainService = new BlockchainService()
