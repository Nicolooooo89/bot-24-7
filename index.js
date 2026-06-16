const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: 'itasgg.falixsrv.me',
    port: 25565,
    username: 'AFKBot',
    version: '1.20.1'
});

const welcomedPlayers = new Set();

const WELCOME_MESSAGE =
    'Benvenuto su Fuoco SMP, {username}! ' +
    'Le fiamme del nostro mondo si accendono con il tuo arrivo. ' +
    'Sei pronto a forgiare il tuo destino, stringere alleanze e bruciare ogni ostacolo sul tuo cammino? ' +
    'Primi passi fondamentali: ' +
    'Leggi il regolamento in #regolamento per evitare il ban. ' +
    'Presentati alla community in #chat-generale. ' +
    'Richiedi l\'accesso alla whitelist in #whitelist se non sei ancora dentro. ' +
    'Che il fuoco guidi i tuoi passi!';

bot.on('spawn', () => {
    console.log(`[BOT] Spawned in server as ${bot.username}. Staying connected AFK.`);
});

bot.on('playerJoined', (player) => {
    // Ignore the bot itself
    if (player.username === bot.username) return;

    // Only welcome each player once per session
    if (welcomedPlayers.has(player.username)) return;

    welcomedPlayers.add(player.username);

    const message = WELCOME_MESSAGE.replace('{username}', player.username);
    console.log(`[BOT] Welcoming player: ${player.username}`);
    bot.chat(message);
});
