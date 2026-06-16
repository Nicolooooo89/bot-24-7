const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: 'itasgg.falixsrv.me',
    port: 25565,
    username: 'AFKBot',
    version: '1.20.1'
});

bot.on('spawn', () => {
    console.log(`[BOT] Spawned in server as ${bot.username}. Staying connected AFK.`);
});
