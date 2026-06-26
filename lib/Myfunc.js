const axios = require('axios');

/**
 * URL se buffer data (image/video/audio) fetch karne ke liye
 */
const getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            },
            responseType: 'arraybuffer',
            ...options
        });
        return res.data;
    } catch (err) {
        console.error(`Error fetching buffer: ${err}`);
        return null;
    }
};

/**
 * Runtime format karne ke liye (Bot kitni der se chal raha hai)
 */
const runtime = (seconds) => {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (d == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

module.exports = {
    getBuffer,
    runtime
};
