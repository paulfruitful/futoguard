import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { teachableMachineAudio, type AudioClassification, type EmotionAnalysis } from "@/src/AI/teachablemodel"

export interface ThreatAnalysis {
  urgencyScore: number
  category: string
  description: string
  recommendedActions: string[]
  audioAnalysis?: {
    emotion: string
    confidence: number
    volume: number
    classifications: AudioClassification[]
  }
}

export interface ReportAnalysis {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  urgencyScore: number
  dangerKeywords: string[]
  category: string
  requiresBlockchain: boolean
  sentiment: 'positive' | 'negative' | 'neutral'
}

export class AIService {
  async analyzeAudioTranscript(
    transcript: string,
    location: { latitude: number; longitude: number },
    audioBuffer?: Float32Array,
    volume?: number
  ): Promise<ThreatAnalysis> {
    try {
      let audioAnalysis: any = null;
      
      // Analyze audio with teachable machine if audio buffer is provided
      if (audioBuffer) {
        try {
          await teachableMachineAudio.loadModel();
          const classifications = await teachableMachineAudio.classifyAudio(audioBuffer);
          const emotionAnalysis = teachableMachineAudio.analyzeEmotionFromAudio(classifications);
          
          audioAnalysis = {
            emotion: emotionAnalysis.emotion,
            confidence: emotionAnalysis.confidence,
            volume: volume || 0,
            classifications: classifications.slice(0, 3) // Top 3 classifications
          };
        } catch (audioError) {
          console.error('Audio analysis error:', audioError);
        }
      }

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
        - Location context (campus setting)
        - Audio analysis results if provided`,
        prompt: `Analyze this emergency alert transcript:
        
        Transcript: "${transcript}"
        Location: ${location.latitude}, ${location.longitude}
        ${audioAnalysis ? `Audio Analysis: Emotion detected: ${audioAnalysis.emotion}, Confidence: ${audioAnalysis.confidence}, Volume: ${audioAnalysis.volume}` : ''}
        
        Provide threat analysis as JSON.`,
      })

      const analysis = JSON.parse(text)

      // Enhance urgency score with audio analysis
      let finalUrgencyScore = Math.max(0, Math.min(1, analysis.urgencyScore || 0.5));
      if (audioAnalysis) {
        const audioUrgency = this.calculateAudioUrgency(audioAnalysis);
        finalUrgencyScore = Math.max(finalUrgencyScore, audioUrgency);
      }

      // Validate and sanitize the response
      return {
        urgencyScore: finalUrgencyScore,
        category: analysis.category || "other",
        description: analysis.description || "Emergency alert received",
        recommendedActions: Array.isArray(analysis.recommendedActions)
          ? analysis.recommendedActions
          : ["Dispatch security personnel", "Contact emergency services"],
        audioAnalysis
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

  // Calculate urgency score based on audio analysis
  private calculateAudioUrgency(audioAnalysis: any): number {
    let urgencyScore = 0;
    
    // High urgency emotions
    const highUrgencyEmotions = ['fear', 'panic', 'distress', 'anger', 'crying'];
    if (highUrgencyEmotions.includes(audioAnalysis.emotion.toLowerCase())) {
      urgencyScore += 0.4;
    }
    
    // Confidence factor
    urgencyScore += audioAnalysis.confidence * 0.3;
    
    // Volume factor (very high or very low volume can indicate distress)
    if (audioAnalysis.volume > 0.8 || audioAnalysis.volume < 0.2) {
      urgencyScore += 0.2;
    }
    
    // Check for emergency-related classifications
    const emergencyKeywords = ['scream', 'help', 'emergency', 'danger', 'attack'];
    for (const classification of audioAnalysis.classifications) {
      if (emergencyKeywords.some(keyword => 
        classification.className.toLowerCase().includes(keyword)
      )) {
        urgencyScore += classification.probability * 0.3;
      }
    }
    
    return Math.min(1, urgencyScore);
  }

  // Analyze danger reports for severity and blockchain eligibility
  async analyzeReport(
    description: string,
    category: string,
    location?: { latitude: number; longitude: number }
  ): Promise<ReportAnalysis> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: `You are an AI analyst for a campus safety reporting system.
        Analyze danger reports and assess their severity, urgency, and blockchain eligibility.
        
        Respond with a JSON object containing:
        - severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
        - urgencyScore: number between 0-1
        - dangerKeywords: array of dangerous keywords found
        - category: refined category based on content
        - requiresBlockchain: boolean (true for serious crimes, threats, or legal evidence)
        - sentiment: 'positive' | 'negative' | 'neutral'
        
        Blockchain eligibility criteria:
        - Serious crimes (assault, robbery, sexual harassment)
        - Threats or intimidation
        - Reports that may require legal evidence
        - High severity incidents`,
        prompt: `Analyze this danger report:
        
        Description: "${description}"
        Category: ${category}
        ${location ? `Location: ${location.latitude}, ${location.longitude}` : ''}
        
        Provide analysis as JSON.`,
      });

      const analysis = JSON.parse(text);
      
      // Validate severity
      const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const severity = validSeverities.includes(analysis.severity) 
        ? analysis.severity 
        : 'MEDIUM';

      return {
        severity,
        urgencyScore: Math.max(0, Math.min(1, analysis.urgencyScore || 0.5)),
        dangerKeywords: Array.isArray(analysis.dangerKeywords) 
          ? analysis.dangerKeywords 
          : [],
        category: analysis.category || category,
        requiresBlockchain: Boolean(analysis.requiresBlockchain),
        sentiment: ['positive', 'negative', 'neutral'].includes(analysis.sentiment)
          ? analysis.sentiment
          : 'neutral'
      };
    } catch (error) {
      console.error('Report analysis error:', error);
      
      // Fallback analysis with keyword detection
      const dangerKeywords = this.detectDangerKeywords(description);
      const severity = dangerKeywords.length > 2 ? 'HIGH' : 
                      dangerKeywords.length > 0 ? 'MEDIUM' : 'LOW';
      
      return {
        severity,
        urgencyScore: dangerKeywords.length * 0.2,
        dangerKeywords,
        category,
        requiresBlockchain: dangerKeywords.length > 1,
        sentiment: 'negative'
      };
    }
  }

  // Detect danger keywords in text
  private detectDangerKeywords(text: string): string[] {
    const dangerKeywords = [
      'gun', 'knife', 'weapon', 'attack', 'assault', 'robbery', 'theft',
      'rape', 'sexual', 'harassment', 'threat', 'violence', 'bleeding',
      'injured', 'emergency', 'help', 'danger', 'suspicious', 'stalking',
      'kidnap', 'abduction', 'fire', 'explosion', 'bomb', 'terrorist'
    ];
    
    const lowerText = text.toLowerCase();
    return dangerKeywords.filter(keyword => lowerText.includes(keyword));
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
