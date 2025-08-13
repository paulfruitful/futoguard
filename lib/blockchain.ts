import { ethers } from "ethers"

const SOS_ALERT_REGISTRY_ABI = [
  "function logSOSAlert(string alertId, uint256 timestamp, bytes32 locationHash) external",
  "function getAlert(string alertId) external view returns (string, uint256, bytes32)",
  "function getAlertCount() external view returns (uint256)",
  "event AlertLogged(string indexed alertId, uint256 timestamp, bytes32 locationHash)"
]

const CONTRACT_ADDRESS = process.env.SOS_ALERT_REGISTRY_ADDRESS!
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY!
const RPC_URL = process.env.LISK_SEPOLIA_RPC_URL || "https://rpc.sepolia-api.lisk.com"

export class BlockchainService {
  private provider: ethers.JsonRpcProvider
  private wallet: ethers.Wallet
  private contract: ethers.Contract

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL)
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider)
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, SOS_ALERT_REGISTRY_ABI, this.wallet)
  }

  // Hash location data for blockchain storage
  private hashLocation(latitude: number, longitude: number): string {
    // Format with precision to ensure consistent hashing
    const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(locationString)
    
    // Create a more robust hash using djb2 algorithm
    let hash = 5381
    for (let i = 0; i < dataBuffer.length; i++) {
      hash = ((hash << 5) + hash) + dataBuffer[i] // hash * 33 + char
      hash = hash & 0xFFFFFFFF // Keep as 32-bit unsigned int
    }
    
    // Convert to hex string with proper padding for bytes32
    return `0x${(hash >>> 0).toString(16).padStart(64, '0')}`
  }

  // Log SOS alert metadata to blockchain on Lisk Sepolia testnet
  async logSOSAlert(alertId: string, timestamp: number, latitude: number, longitude: number): Promise<string> {
    try {
      console.log(`Logging SOS alert to Lisk Sepolia blockchain: ${alertId}`)
      
      // Create location hash - only the hash is stored on-chain for privacy
      const locationHash = this.hashLocation(latitude, longitude)

      // Call the smart contract with retry logic for testnet reliability
      let attempts = 0
      const maxAttempts = 3
      let tx
      
      while (attempts < maxAttempts) {
        try {
          tx = await this.contract.logSOSAlert(alertId, timestamp, locationHash)
          await tx.wait(1) // Wait for 1 confirmation
          console.log(`SOS alert logged successfully to blockchain, tx hash: ${tx.hash}`)
          break
        } catch (retryError) {
          attempts++
          if (attempts >= maxAttempts) throw retryError
          console.warn(`Blockchain logging attempt ${attempts} failed, retrying...`)
          await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds before retry
        }
      }
      
      return tx!.hash
    } catch (error) {
      console.error("Blockchain logging error:", error)
      throw new Error("Failed to log SOS alert to blockchain")
    }
  }

  // Get alert from blockchain
  async getSOSAlert(alertId: string) {
    try {
      const result = await this.contract.getAlert(alertId)
      return {
        alertId: result[0],
        timestamp: Number(result[1]),
        locationHash: result[2]
      }
    } catch (error) {
      console.error("Error fetching alert from blockchain:", error)
      throw new Error("Failed to fetch alert from blockchain")
    }
  }

  // Get total alert count
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
