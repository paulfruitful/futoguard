export interface AudioRecordingResult {
  audioBlob: Blob;
  audioBuffer: Float32Array;
  duration: number;
  volume: number;
}

export class AudioHandler {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private isRecording = false;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  async initialize(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000 // Optimize for speech
        }
      });

      // Create audio context for analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Create analyser for real-time audio analysis
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      source.connect(this.analyser);

      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.setupMediaRecorderEvents();
      
      console.log('Audio handler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio handler:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  private setupMediaRecorderEvents(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      this.isRecording = false;
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      this.isRecording = false;
    };
  }

  async startRecording(): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Audio handler not initialized');
    }

    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    this.chunks = [];
    this.mediaRecorder.start(100); // Collect data every 100ms
    this.isRecording = true;
    
    console.log('Audio recording started');
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.chunks, { type: 'audio/webm;codecs=opus' });
          const audioBuffer = await this.blobToFloat32Array(audioBlob);
          const volume = this.getCurrentVolume();
          const duration = this.chunks.length * 0.1; // Approximate duration

          resolve({
            audioBlob,
            audioBuffer,
            duration,
            volume
          });
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
      this.isRecording = false;
    });
  }

  getCurrentVolume(): number {
    if (!this.analyser || !this.dataArray) return 0;

    this.analyser.getByteFrequencyData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    const average = sum / this.dataArray.length;
    return average / 255; // Normalize to 0-1
  }

  getFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.dataArray) return null;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    return new Uint8Array(this.dataArray);
  }

  private async blobToFloat32Array(blob: Blob): Promise<Float32Array> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      
      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Get the first channel (mono)
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert to Float32Array
      return new Float32Array(channelData);
    } catch (error) {
      console.error('Error converting blob to Float32Array:', error);
      throw error;
    }
  }

  async uploadAudioToFirebase(audioBlob: Blob, alertId: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, `alert_${alertId}_${Date.now()}.webm`);
      formData.append('alertId', alertId);

      const response = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload audio');
      }

      const result = await response.json();
      return result.audioUrl;
    } catch (error) {
      console.error('Audio upload error:', error);
      throw error;
    }
  }

  detectSilence(threshold: number = 0.01, duration: number = 2000): Promise<boolean> {
    return new Promise((resolve) => {
      let silenceStart = Date.now();
      let isSilent = false;

      const checkSilence = () => {
        const volume = this.getCurrentVolume();
        
        if (volume < threshold) {
          if (!isSilent) {
            isSilent = true;
            silenceStart = Date.now();
          } else if (Date.now() - silenceStart > duration) {
            resolve(true);
            return;
          }
        } else {
          isSilent = false;
        }

        if (this.isRecording) {
          requestAnimationFrame(checkSilence);
        } else {
          resolve(false);
        }
      };

      checkSilence();
    });
  }

  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.mediaRecorder = null;
    this.analyser = null;
    this.dataArray = null;
    this.chunks = [];
    this.isRecording = false;
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}

export const audioHandler = new AudioHandler();