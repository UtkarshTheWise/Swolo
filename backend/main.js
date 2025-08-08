const API_KEY = "ZuqI28B2lIAbQ6RNsedRvJHSLa9qZqaFmMAtmB1EJoo";
const API_URL = "https://soundtracks.loudly.com/api/ai/prompt/songs";

document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");
  const player = document.getElementById("audioPlayer");
  const canvas = document.getElementById("spectrogramCanvas");
  const ctx = canvas.getContext("2d");
  const mixButton = document.getElementById("mixButton");
  const baseTrackInput = document.getElementById("baseTrack");
  const vocalTrackInput = document.getElementById("vocalTrack");
  const pitchInput = document.getElementById("pitch");
  const delayInput = document.getElementById("delay");
  const mixedAudio = document.getElementById("mixedAudio");

  let audioContext;
  let analyser;
  let dataArray;
  let bufferLength;
  let drawX = 0;
  let wavesurfer;

  // Load and decode audio file
  async function loadAudioFile(file) {
    const audioCtx = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    return await audioCtx.decodeAudioData(arrayBuffer);
  }

  // Handle Mix Button Click
  mixButton.addEventListener("click", async () => {
    if (!baseTrackInput.files[0] || !vocalTrackInput.files[0]) {
      alert("Please select both a base and vocal track.");
      return;
    }

    const pitchShift = parseFloat(pitchInput.value);
    const delayTime = parseFloat(delayInput.value) / 1000;

    const baseBuffer = await loadAudioFile(baseTrackInput.files[0]);
    const vocalBuffer = await loadAudioFile(vocalTrackInput.files[0]);

    const offlineCtx = new OfflineAudioContext(
      2,
      baseBuffer.length,
      baseBuffer.sampleRate
    );

    const baseSource = offlineCtx.createBufferSource();
    baseSource.buffer = baseBuffer;
    baseSource.connect(offlineCtx.destination);
    baseSource.start(0);

    const vocalSource = offlineCtx.createBufferSource();
    vocalSource.buffer = vocalBuffer;
    vocalSource.playbackRate.value = pitchShift;

    const delayNode = offlineCtx.createDelay();
    delayNode.delayTime.value = delayTime;

    vocalSource.connect(delayNode).connect(offlineCtx.destination);
    vocalSource.start(0);

    const mixedBuffer = await offlineCtx.startRendering();

    // Convert to WAV and assign to player
    const wavBlob = bufferToWave(mixedBuffer);
    const mixUrl = URL.createObjectURL(wavBlob);
    mixedAudio.src = mixUrl;
    mixedAudio.style.display = "block";
  });

  // Convert AudioBuffer to WAV Blob
  function bufferToWave(abuffer) {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let pos = 0;

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }

    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);

    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (let i = 0; i < numOfChan; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  function createWaveform(audioUrl) {
    if (wavesurfer) wavesurfer.destroy();

    wavesurfer = WaveSurfer.create({
      container: "#waveform",
      waveColor: "#6ca0dc",
      progressColor: "#357edd",
      height: 128,
      barWidth: 2,
      responsive: true,
      cursorColor: "#000",
    });

    wavesurfer.load(audioUrl);
  }

  async function generateSpectrogram(audioUrl) {
    if (audioContext) audioContext.close();

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    player.src = audioUrl;
    player.crossOrigin = "anonymous";

    await player.play();

    const track = audioContext.createMediaElementSource(player);
    track.connect(analyser);
    analyser.connect(audioContext.destination);

    drawX = 0;
    drawSpectrogram();
  }

  function drawSpectrogram() {
    requestAnimationFrame(drawSpectrogram);

    analyser.getByteFrequencyData(dataArray);

    const height = canvas.height;
    const width = canvas.width;

    if (drawX >= width) {
      const imageData = ctx.getImageData(1, 0, width - 1, height);
      ctx.putImageData(imageData, 0, 0);
      drawX = width - 1;
      ctx.clearRect(drawX, 0, 1, height);
    }

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i];
      const percent = value / 255;
      const y = height - (i / bufferLength) * height;
      const hue = 240 - percent * 240;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(drawX, y, 1, height / bufferLength + 1);
    }

    drawX++;
  }

  // Music Generation
  document
    .getElementById("musicForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const prompt = document.getElementById("prompt").value;
      const duration = document.getElementById("duration").value;

      status.textContent = "🎧 Generating music... please wait";
      player.style.display = "none";

      const formData = new FormData();
      formData.append("prompt", prompt);
      formData.append("duration", duration);

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "API-KEY": API_KEY,
            Accept: "application/json",
          },
          body: formData,
        });

        if (!response.ok) throw new Error("API Error: " + response.status);

        const data = await response.json();
        const audioUrl = data?.music_file_path;

        if (audioUrl) {
          player.src = audioUrl;
          player.style.display = "block";
          status.textContent = "✅ Music generated! Listen below.";
          await generateSpectrogram(audioUrl);
          createWaveform(audioUrl);
        } else {
          status.textContent = "⚠️ No music returned. Try again.";
        }
      } catch (err) {
        console.error(err);
        status.textContent = "❌ Error: " + err.message;
      }
    });

  // Usage Checker
  document
    .getElementById("checkUsageBtn")
    .addEventListener("click", async () => {
      const usageStatus = document.getElementById("usageStatus");
      usageStatus.textContent = "Checking usage...";

      try {
        const response = await fetch(
          "https://soundtracks.loudly.com/api/account/limits",
          {
            method: "GET",
            headers: {
              "API-KEY": API_KEY,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Unable to fetch usage data");

        const data = await response.json();
        const generatePromptUsage = data.find(
          (entry) => entry.request_type === "GENERATE_VEGA_SONG_WITH_PROMPT"
        );

        if (generatePromptUsage) {
          const used = generatePromptUsage.used;
          const left = generatePromptUsage.left;
          usageStatus.textContent = `✅ Used: ${used}, Remaining: ${left}, get the pro plan for unlimited usage.`;
        } else {
          usageStatus.textContent =
            "⚠️ No usage data found for prompt-based generation.";
        }
      } catch (err) {
        console.error(err);
        usageStatus.textContent = "❌ Failed to get usage info.";
      }
      document.getElementById("resetBtn").addEventListener("click", () => {
        location.reload();
      });
    });
});
