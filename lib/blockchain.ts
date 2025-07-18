import { ethers } from "ethers"

const GUARDIAN_CONTRACT_ABI = [
  "function logAlert(address sender, uint256 timestamp, int256 latitude, int256 longitude, uint256 urgencyScore) external",
  "function getAlert(uint256 alertId) external view returns (address, uint256, int256, int256, uint256)",
  "function getAlertCount() external view returns (uint256)",
  "event AlertLogged(uint256 indexed alertId, address indexed sender, uint256 timestamp)",
  "function logReport(string userId, string reportHash, uint256 urgencyScore, uint256 timestamp) external",
  "function getReport(uint256 reportId) external view returns (string, string, uint256, uint256, bool)"
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

  // Log critical reports to blockchain
  async logReport(
    userId: string,
    reportHash: string,
    urgencyScore: number
  ): Promise<string> {
    try {
      const tx = await this.contract.logReport(
        userId,
        reportHash,
        Math.floor(urgencyScore * 100), // Convert to integer
        Math.floor(Date.now() / 1000) // Unix timestamp
      )
      
      await tx.wait()
      return tx.hash
    } catch (error) {
      console.error("Error logging report to blockchain:", error)
      throw error
    }
  }

  // Hash sensitive data for blockchain storage
  async hashData(data: any): Promise<string> {
    try {
      const dataString = JSON.stringify(data)
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(dataString)
      
      // Use Web Crypto API for hashing
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return `0x${hashHex}`
    } catch (error) {
      console.error("Error hashing data:", error)
      throw error
    }
  }

  // Get report from blockchain
  async getReport(reportId: string): Promise<any> {
    try {
      const result = await this.contract.getReport(reportId)
      return {
        userId: result[0],
        reportHash: result[1],
        urgencyScore: Number(result[2]) / 100, // Convert back to decimal
        timestamp: new Date(Number(result[3]) * 1000),
        verified: result[4]
      }
    } catch (error) {
      console.error("Error getting report from blockchain:", error)
      throw error
    }
  }
}

export const blockchainService = new BlockchainService()
