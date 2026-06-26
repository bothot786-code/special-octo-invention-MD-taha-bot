const config = require('../config');

module.exports = {
    name: 'menu',
    description: 'Bot ka main menu display karne ke liye',
    isOwner: false,
    async execute(sock, msg, from, args) {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const responseText = `🤖 *${config.botName}* 🤖\n\n` +
                             `👋 *Developer:* ${config.ownerName}\n` +
                             `⚡ *Prefix:* [ ${config.prefix} ]\n` +
                             `⏰ *Uptime:* ${hours}h ${minutes}m\n\n` +
                             `*👑 OWNER COMMANDS:*\n` +
                             `➔ ${config.prefix}restart - Restart bot server\n\n` +
                             `*⚙️ USER COMMANDS:*\n` +
                             `➔ ${config.prefix}ping - Speed check\n` +
                             `➔ ${config.prefix}alive - Status check\n\n` +
                             `💡 _Render Deployment Stable Build v1.0.0_`;

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });
    }
};
