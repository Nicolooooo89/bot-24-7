const mineflayer = require('mineflayer');

// Configurazione fissa per il tuo server
const config = {
    host: 'fuocosmp.falix.gg',
    port: 25565,
    username: 'FuocoBot24h',
    version: '1.21.11',
    password: 'Miapassword123'
};

let bot = null;
let afkInterval = null;
let reconnectTimeout = null;

function createBot() {
    if (bot) {
        console.log('[BOT] Bot già attivo, non creo un nuovo bot.');
        return;
    }

    console.log(`[BOT] Tentativo di connessione a ${config.host}:${config.port} versione ${config.version}...`);
    
    try {
        bot = mineflayer.createBot({
            host: config.host,
            port: config.port,
            username: config.username,
            version: config.version
        });
    } catch (err) {
        console.error('[BOT] Errore creazione bot:', err.message);
        bot = null;
        return;
    }

    bot.once('spawn', () => {
        console.log(`[BOT] Entrato nel server come ${bot.username}.`);

        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
            reconnectTimeout = null;
        }

        // Registrazione e login
        setTimeout(() => {
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            console.log('[BOT] Comandi di autenticazione inviati.');
        }, 2000);

        // Anti-AFK - Salta ogni 2 minuti per evitare il kick
        if (afkInterval) clearInterval(afkInterval);
        afkInterval = setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => {
                    if (bot && bot.entity) bot.setControlState('jump', false);
                }, 500);
                console.log('[BOT] Anti-AFK - Salto eseguito.');
            }
        }, 120000);

        console.log('[BOT] Bot online in modalità AFK silenzioso.');
    });

    bot.on('kicked', (reason, loggedIn) => {
        console.log(`[BOT] Kicked dal server. Motivo: ${reason}`);
    });

    bot.on('end', (reason) => {
        console.log(`[BOT] Disconnesso dal server. Motivo: ${reason}`);
        
        if (afkInterval) {
            clearInterval(afkInterval);
            afkInterval = null;
        }

        bot = null;

        if (!reconnectTimeout) {
            console.log('[BOT] Riconnessione programmata tra 15 secondi...');
            reconnectTimeout = setTimeout(() => {
                reconnectTimeout = null;
                createBot();
            }, 15000);
        }
    });

    bot.on('error', (err) => {
        console.error('[BOT] Errore:', err.message);
    });
}

createBot();
