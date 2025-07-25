const axios = require('axios');

console.log("🤖 Chatbot aktif...");

setInterval(() => {
  console.log("⏰ Bot masih hidup", new Date().toLocaleTimeString());

  // Contoh: Panggil API publik (GitHub)
  axios.get('https://api.github.com')
    .then(response => {
      console.log("📡 Data GitHub:", response.data.current_user_url);
    })
    .catch(error => {
      console.error("❌ Gagal ambil data:", error.message);
    });

}, 10000); // tiap 10 detik
