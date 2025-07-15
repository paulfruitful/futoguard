import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface ThreatAnalysis {
  urgencyScore: number
  category: string
  description: string
  recommendedActions: string[]
}

export class AIService {
  async analyzeAudioTranscript(
    transcript: string,
    location: { latitude: number; longitude: number },
  ): Promise<ThreatAnalysis> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are an AI security analyst for a campus emergency response system. 
        Analyze audio transcripts from emergency alerts and provide threat assessment.
        
        Respond with a JSON object containing:
        - urgencyScore: number between 0-1 (0=false alarm, 1=critical emergency)
        - category: string (medical, security, fire, natural_disaster, false_alarm, other)
        - description: brief description of the situation
        - recommendedActions: array of recommended response actions
        
        Consider factors like:
        - Emotional distress in speech
        - Keywords indicating danger
        - Background sounds
        - Coherence of speech
        - Location context (campus setting)`,
        prompt: `Analyze this emergency alert transcript:
        
        Transcript: "${transcript}"
        Location: ${location.latitude}, ${location.longitude}
        
        Provide threat analysis as JSON.`,
      })

      const analysis = JSON.parse(text)

      // Validate and sanitize the response
      return {
        urgencyScore: Math.max(0, Math.min(1, analysis.urgencyScore || 0.5)),
        category: analysis.category || "other",
        description: analysis.description || "Emergency alert received",
        recommendedActions: Array.isArray(analysis.recommendedActions)
          ? analysis.recommendedActions
          : ["Dispatch security personnel", "Contact emergency services"],
      }
    } catch (error) {
      console.error("AI analysis error:", error)
      // Fallback analysis
      return {
        urgencyScore: 0.7,
        category: "other",
        description: "Unable to analyze audio - treating as potential emergency",
        recommendedActions: ["Dispatch security personnel", "Verify situation"],
      }
    }
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // In a real implementation, you would use OpenAI Whisper API
      // For now, we'll simulate transcription
      return "Help me, there's an emergency situation here. I need assistance immediately."
    } catch (error) {
      console.error("Audio transcription error:", error)
      return "Audio transcription failed"
    }
  }

  async analyzeLocationRisk(latitude: number, longitude: number, historicalAlerts: any[]): Promise<number> {
    // Analyze historical data to determine location risk score
    const nearbyAlerts = historicalAlerts.filter((alert) => {
      const distance = this.calculateDistance(latitude, longitude, alert.latitude, alert.longitude)
      return distance < 0.1 // Within 100m
    })

    const recentAlerts = nearbyAlerts.filter((alert) => {
      const alertDate = new Date(alert.createdAt)
      const daysSince = (Date.now() - alertDate.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince < 30 // Within last 30 days
    })

    // Calculate risk score based on frequency and recency
    const baseRisk = 0.1
    const alertFrequencyRisk = Math.min(0.4, recentAlerts.length * 0.1)
    const severityRisk = recentAlerts.reduce((sum, alert) => sum + alert.urgencyScore, 0) / recentAlerts.length || 0

    return Math.min(1, baseRisk + alertFrequencyRisk + severityRisk * 0.3)
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}

export const aiService = new AIService()
