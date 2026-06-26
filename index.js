/**
 * PROJECT: TAHA MD BOT (RENDER DEPLOYMENT EDITION)
 * AUTHOR: Taha Khan
 * TYPE: MODULAR COMMAND HANDLER WITH PAIRING CODE
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeInMemoryStore
} = require('@whiskeysockets/baileys');
const Pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');
const http = require('http');
const config = require('./config');

// Global Commands Object
global.commands = new Map();

// 1. Render Ke Liye Web Server (Deployment Fail Hone Se Bachane Ke Liye)
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('TAHA MD BOT IS RUNNING SUCCESSFULLY\n');
});
server.listen(port, () => {
    console.log(`[ Render Server ] Web port opened on connection: ${port}`);
});

// 2. Memory Store to Cache Chats
const store = makeInMemoryStore({ logger: Pino().child({ level: 'silent', stream: 'store' }) });

// 3. Auto Load Commands Function
function loadCommands() {
    const cmdFolder = path.join(__dirname, 'commands');
    if (!fs.existsSync(cmdFolder)) {
        fs.mkdirSync(cmdFolder);
    }

    const files = fs.readdirSync(cmdFolder).filter(file => file.endsWith('.js'));
    for (const file of files) {
        // Purani cache clear karne ke liye takay fresh loading ho
        delete require.cache[require.resolve(path.join(cmdFolder, file))];
        const command = require(path.join(cmdFolder, file));
        if (command.name) {
            global.commands.set(command.name, command);
        }
    }
    console.log(`[✓] Loaded ${global.commands.size} Commands Successfully.`);
}

// 4. Main Bot Core Function
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, config.stateName));
    const { version } = await fetchLatestBaileysVersion();

    loadCommands();

    const sock = makeWASocket({
        version,
        logger: Pino({ level: 'silent' }),
        printQRInTerminal: false, // Render par QR code kharab hojata hai, isliye pairing code use karenge
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"] // Standard browser signature for pairing code
    });

    store.bind(sock.ev);

    // [PAIRED CODE SYSTEM] Agar pehle se login nahi hai to code generate karega
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            let phoneNumber = config.ownerNumber.replace(/[^0-9]/g, '');
            if (!phoneNumber) {
                console.log("[!] ERROR: config.js me ownerNumber setup nahi hai!");
                return;
            }
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n=========================================`);
                console.log(`[🔑] YOUR TAHA MD PAIRING CODE: ${code}`);
                console.log(`=========================================\n`);
            } catch (pairingError) {
                console.error("[!] Pairing Code generate karne me error: ", pairingError);
            }
        }, 3000);
    }

    // Connection Events Handler
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? 
                lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
            
            console.log(`[!] Connection closed. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log(`\n[🚀] ${config.botName} IS ACTIVE, LOGGED IN AND CONNECTED TO WHATSAPP!`);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Incoming Messages Processing
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

            const from = msg.key.remoteJid;
            const type = Object.keys(msg.message)[0];
            
            const body = (type === 'conversation') ? msg.message.conversation : 
                         (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : 
                         (type === 'imageMessage') ? msg.message.imageMessage.caption : 
                         (type === 'videoMessage') ? msg.message.videoMessage.caption : '';

            if (!body.startsWith(config.prefix)) return;

            const args = body.slice(config.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            
            const cmd = global.commands.get(cmdName);
            if (cmd) {
                // Owner Restriction Logic
                if (cmd.isOwner) {
                    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    const ownerJid = config.ownerNumber + '@s.whatsapp.net';
                    const sender = msg.key.participant || msg.key.remoteJid;
                    if (sender !== ownerJid && sender !== botNumber) {
                        return sock.sendMessage(from, { text: "❌ Yeh command sirf Taha Khan (Owner) use kar sakta hai!" }, { quoted: msg });
                    }
                }
                
                // Execute the separate command file
                await cmd.execute(sock, msg, from, args);
            }

        } catch (err) {
            console.error("Message handling error: ", err);
        }
    });
}

// System Crash Protection
process.on('uncaughtException', (err) => console.error('System Exception Guard:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled Promise Guard:', err));

startBot();
