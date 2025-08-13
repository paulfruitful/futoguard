export async function recordAudio(durationSec = 30): Promise<Float32Array> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext({ sampleRate: 16000 }); // Match YAMNet
      const source = audioContext.createMediaStreamSource(stream);

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      const chunks: Float32Array[] = [];

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunks.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setTimeout(() => {
        processor.disconnect();
        source.disconnect();
        stream.getTracks().forEach(track => track.stop());

        // Flatten all chunks into one Float32Array
        const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Float32Array(totalLength);
        let offset = 0;
        for (const arr of chunks) {
          result.set(arr, offset);
          offset += arr.length;
        }

        resolve(result);
      }, durationSec * 1000);

    } catch (err) {
      console.log(err)
      reject(err);
    }
  });
}
