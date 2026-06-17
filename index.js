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
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;
let isSpawned = false;

function getReconnectDelay() {
    // Exponential backoff: 5s, 10s, 20s, 40s, 60s
    const baseDelay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60000);
    return baseDelay;
}

function createBot() {
    if (bot && bot.isAlive) {
        console.log('[BOT] Bot già attivo, non creo un nuovo bot.');
        return;
    }

    // Ripuliamo il vecchio bot se ancora presente
    if (bot) {
        try {
            bot.quit();
        } catch (e) {
            // Ignorato
        }
        bot = null;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('[BOT] Massimo numero di tentativi di riconnessione raggiunto. Attesa 2 minuti...');
        reconnectAttempts = 0;
        reconnectTimeout = setTimeout(() => {
            createBot();
        }, 120000);
        return;
    }

    const delay = getReconnectDelay();
    console.log(`[BOT] Tentativo ${reconnectAttempts + 1}/${maxReconnectAttempts} - Connessione tra ${delay / 1000}s a ${config.host}:${config.port}...`);
    
    reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        isSpawned = false;

        try {
            bot = mineflayer.createBot({
                host: config.host,
                port: config.port,
                username: config.username,
                version: config.version
            });
        } catch (err) {
            console.error('[BOT] Errore creazione bot:', err.message);
            reconnectAttempts++;
            bot = null;
            createBot();
            return;
        }

        // Timeout per spawn - se non spawna in 30s, disconnette
        const spawnTimeout = setTimeout(() => {
            if (!isSpawned && bot && bot.isAlive) {
                console.error('[BOT] Timeout spawn - disconnessione per retry.');
                try {
                    bot.quit();
                } catch (e) {}
            }
        }, 30000);

        bot.once('spawn', () => {
            clearTimeout(spawnTimeout);
            isSpawned = true;
            reconnectAttempts = 0; // Reset su spawn riuscito
            console.log(`[BOT] ✓ Entrato nel server come ${bot.username}.`);

            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }

            // Registrazione e login (una sola volta)
            let authAttempted = false;
            if (!authAttempted) {
                authAttempted = true;
                setTimeout(() => {
                    if (bot && bot.entity) {
                        bot.chat(`/register ${config.password} ${config.password}`);
                        bot.chat(`/login ${config.password}`);
                        console.log('[BOT] Comandi di autenticazione inviati.');
                    }
                }, 1500);
            }

            // Anti-AFK - Salta ogni 60 secondi (più frequente)
            if (afkInterval) clearInterval(afkInterval);
            afkInterval = setInterval(() => {
                if (bot && bot.entity && bot.isAlive) {
                    try {
                        bot.setControlState('jump', true);
                        setTimeout(() => {
                            if (bot && bot.entity) {
                                bot.setControlState('jump', false);
                            }
                        }, 300);
                        console.log('[BOT] Anti-AFK ✓ (jump)');
                    } catch (e) {
                        console.error('[BOT] Errore anti-AFK:', e.message);
                    }
                }
            }, 60000);

            // Watchdog - verifica se il bot è ancora alive ogni 90 secondi
            const watchdogInterval = setInterval(() => {
                if (!bot || !bot.isAlive) {
                    clearInterval(watchdogInterval);
                } else {
                    console.log('[BOT] Watchdog ✓ - Bot online');
                }
            }, 90000);

            console.log('[BOT] Bot online in modalità AFK silenzioso - Anti-AFK attivo.');
        });

        bot.on('kicked', (reason, loggedIn) => {
            isSpawned = false;
            console.log(`[BOT] ✗ Kicked dal server. Motivo: ${reason}`);
            reconnectAttempts++;
        });

        bot.on('end', (reason) => {
            isSpawned = false;
            console.log(`[BOT] ✗ Disconnesso. Motivo: ${reason}`);
            
            if (afkInterval) {
                clearInterval(afkInterval);
                afkInterval = null;
            }

            if (bot) {
                bot = null;
            }

            if (!reconnectTimeout) {
                reconnectAttempts++;
                createBot();
            }
        });

        bot.on('error', (err) => {
            isSpawned = false;
            console.error('[BOT] ✗ Errore bot:', err.message);
            if (!reconnectTimeout) {
                reconnectAttempts++;
                createBot();
            }
        });

    }, delay);
}

// Graceful shutdown su Ctrl+C
process.on('SIGINT', () => {
    console.log('\n[BOT] Shutdown ricevuto...');
    if (afkInterval) clearInterval(afkInterval);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (bot && bot.isAlive) {
        bot.quit();
    }
    process.exit(0);
});

console.log('[BOT] Avvio bot 24/7...');
createBot();
