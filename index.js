const { default: makeWASocket, useSingleFileAuthState } = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

// Autentikasi WA disimpan di auth.json
const { state, saveState } = useSingleFileAuthState('./auth.json');

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== 401;
      console.log('❌ Koneksi terputus. Reconnect:', shouldReconnect);
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot WhatsApp aktif dan terhubung!');
    }
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    console.log(`📩 Pesan masuk dari ${msg.key.remoteJid}:`, text);

    if (text === 'halo') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Hai juga 👋 ini bot WhatsApp dengan Baileys!' });
    }
  });
}

startBot();
