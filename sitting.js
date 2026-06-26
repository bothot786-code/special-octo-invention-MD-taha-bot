require('dotenv').config();

module.exports = {
    botName: process.env.BOT_NAME || "TAHA MD BOT",
    ownerName: "Taha Khan",
    ownerNumber: process.env.OWNER_NUMBER || "923XXXXXXXXX", // Bina + ke country code ke sath
    prefix: process.env.PREFIX || ".",
    stateName: "session",
    
    // Aap yahan mazeed custom settings bhi add kar sakte hain
    wm: "⚡ Powered by Taha Khan",
    packname: "Taha Bot Sticker Pack",
    author: "Taha Khan"
};
