const { default: makeWASocket, DisconnectReason } = require('@whiskeysockets/baileys');
const { useSingleFileAuthState } = require('@whiskeysockets/baileys/auth');
const { Boom } = require('@hapi/boom');

const { state, saveState } = useSingleFileAuthState('./auth.json');

async function startSock() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log('🔌 Koneksi ditutup. Alasan:', reason);

      if (reason !== DisconnectReason.loggedOut) {
        startSock();
      } else {
        console.log('❌ Logout. Scan QR ulang.');
      }
    }

    if (connection === 'open') {
      console.log('✅ Koneksi berhasil ke WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const pesan = msg.message.conversation || msg.message.extendedTextMessage?.text;

    console.log(`📩 ${sender} => ${pesan}`);

    if (pesan.toLowerCase() === 'halo') {
      await sock.sendMessage(sender, { text: 'Hai juga! 👋 Bot WhatsApp aktif.' });
    }
  });
}

startSock();

// =====================
// Tambahan web server agar Railway aktif terus
// =====================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('🤖 Bot WhatsApp aktif di Railway!'));
app.listen(PORT, () => console.log(`🌐 Server aktif di port ${PORT}`));
