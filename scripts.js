
let mediaRecorder;
let audioChunks = [];

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const chatContainer = document.getElementById('chatContainer');

function addUserBubble(text = "🎤 User voice message") {
  const bubble = document.createElement('div');
  bubble.className = 'bubble user';
  bubble.textContent = text;
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addBotBubble(audioBlob) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble bot';

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = URL.createObjectURL(audioBlob);

  bubble.textContent = "🤖 ভাষা AI:";
  bubble.appendChild(audio);
  chatContainer.appendChild(bubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

recordBtn.onclick = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');

      addUserBubble();
      status.textContent = "📤 Sending voice...";

      try {
        // const res = await fetch("https://n8n.10minuteschool.com/webhook-test/voice_message", {  // Test Webhook
        const res = await fetch("https://n8n.10minuteschool.com/webhook/voice_message", {  // Prod Webhook
          method: "POST",
          body: formData
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const responseBlob = await res.blob();
        addBotBubble(responseBlob);
        status.textContent = "✅ Response received";
      } catch (err) {
        console.error("Fetch error:", err);
        status.textContent = "❌ Failed to receive response";
      }
    };

    mediaRecorder.start();
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    status.textContent = "🎙️ Recording...";
  } catch (err) {
    console.error("Mic error:", err);
    status.textContent = "❌ Microphone access denied";
  }
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  recordBtn.disabled = false;
  stopBtn.disabled = true;
  status.textContent = "🛑 Uploading voice...";
};
