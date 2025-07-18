import * as tf from '@tensorflow/tfjs';

export interface AudioClassification {
  className: string;
  probability: number;
}

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  urgencyLevel: number; // 0-1 scale
}

export class TeachableMachineAudio {
  private model: tf.LayersModel | null = null;
  private metadata: any = null;
  private isLoaded = false;

  async loadModel(): Promise<void> {
    try {
      // Load the model from public/models directory
      const modelUrl = '/models/model.json';
      const metadataUrl = '/models/metadata.json';
      
      // Load model and metadata
      this.model = await tf.loadLayersModel(modelUrl);
      const metadataResponse = await fetch(metadataUrl);
      this.metadata = await metadataResponse.json();
      
      this.isLoaded = true;
      console.log('Teachable Machine model loaded successfully');
    } catch (error) {
      console.error('Failed to load Teachable Machine model:', error);
      throw error;
    }
  }

  async classifyAudio(audioBuffer: Float32Array): Promise<AudioClassification[]> {
    if (!this.isLoaded || !this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    try {
      // Preprocess audio data
      const preprocessed = this.preprocessAudio(audioBuffer);
      
      // Make prediction
      const prediction = this.model.predict(preprocessed) as tf.Tensor;
      const scores = await prediction.data();
      
      // Convert to classification results
      const classifications: AudioClassification[] = [];
      for (let i = 0; i < scores.length; i++) {
        classifications.push({
          className: this.metadata.labels[i],
          probability: scores[i]
        });
      }
      
      // Sort by probability
      classifications.sort((a, b) => b.probability - a.probability);
      
      // Clean up tensors
      prediction.dispose();
      preprocessed.dispose();
      
      return classifications;
    } catch (error) {
      console.error('Audio classification error:', error);
      throw error;
    }
  }

  analyzeEmotionFromAudio(classifications: AudioClassification[]): EmotionAnalysis {
    // Map audio classifications to emotions and urgency levels
    const emotionMap: { [key: string]: { emotion: string; urgency: number } } = {
      'scream': { emotion: 'panic', urgency: 0.9 },
      'crying': { emotion: 'distress', urgency: 0.7 },
      'shouting': { emotion: 'anger', urgency: 0.8 },
      'normal_speech': { emotion: 'calm', urgency: 0.2 },
      'whisper': { emotion: 'fear', urgency: 0.6 },
      'silence': { emotion: 'unknown', urgency: 0.1 },
      'background_noise': { emotion: 'unknown', urgency: 0.3 },
      'emergency_sounds': { emotion: 'emergency', urgency: 1.0 }
    };

    let maxConfidence = 0;
    let detectedEmotion = 'unknown';
    let urgencyLevel = 0.5;

    for (const classification of classifications) {
      const mapped = emotionMap[classification.className.toLowerCase()];
      if (mapped && classification.probability > maxConfidence) {
        maxConfidence = classification.probability;
        detectedEmotion = mapped.emotion;
        urgencyLevel = mapped.urgency * classification.probability;
      }
    }

    return {
      emotion: detectedEmotion,
      confidence: maxConfidence,
      urgencyLevel: Math.min(1, urgencyLevel)
    };
  }

  private preprocessAudio(audioBuffer: Float32Array): tf.Tensor {
    // Convert audio buffer to the format expected by the model
    // This depends on how your Teachable Machine model was trained
    
    // Typical preprocessing for audio:
    // 1. Normalize audio
    const normalized = audioBuffer.map(sample => sample / 32768.0);
    
    // 2. Create spectrogram or use raw audio based on model requirements
    // For this example, we'll assume the model expects a specific input shape
    const inputShape = this.metadata.inputShape || [1, 16000]; // Adjust based on your model
    
    // 3. Reshape to match model input
    const tensor = tf.tensor(normalized).reshape(inputShape);
    
    return tensor;
  }

  async analyzeAudioVolume(audioBuffer: Float32Array): Promise<number> {
    // Calculate RMS (Root Mean Square) for volume analysis
    let sum = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      sum += audioBuffer[i] * audioBuffer[i];
    }
    const rms = Math.sqrt(sum / audioBuffer.length);
    
    // Normalize to 0-1 scale
    return Math.min(1, rms / 32768.0);
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isLoaded = false;
  }
}

export const teachableMachineAudio = new TeachableMachineAudio();