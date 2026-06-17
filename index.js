const mineflayer = require('mineflayer');
const express = require('express');
const app = express();

app.use(express.json());

// Configurazione fissa per il tuo server
const config = {
    host: process.env.MC_HOST || 'fuocosmp.falix.gg',
    port: parseInt(process.env.MC_PORT || '25565'),
    username: process.env.MC_USERNAME || 'FuocoBot24h',
    version: process.env.MC_VERSION || '1.21.11',
    password: process.env.MC_PASSWORD
};
if (!config.password) {
    throw new Error('MC_PASSWORD environment variable is required');
}

// Configurazione API
const API_TOKEN = process.env.API_TOKEN;
if (!API_TOKEN) {
    throw new Error('API_TOKEN environment variable is required');
}
const API_PORT = process.env.PORT || 8080;

let bot = null;
let afkInterval = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
let maxReconnectAttempts = 5;
let isSpawned = false;
let logs = [];
const maxLogs = 200;

// Middleware autenticazione
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token || token !== API_TOKEN) {
        return res.status(401).json({ error: 'Token non valido o mancante' });
    }
    next();
}

// Funzione per loggare
function addLog(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    logs.push(logEntry);
    if (logs.length > maxLogs) logs.shift();
}

function getReconnectDelay() {
    // Exponential backoff: 5s, 10s, 20s, 40s, 60s
    const baseDelay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60000);
    return baseDelay;
}

// ============ API ENDPOINTS ============

// Status del bot
app.get('/api/status', verifyToken, (req, res) => {
    res.json({
        connected: bot && bot.isAlive && isSpawned,
        username: bot?.username || 'N/A',
        health: bot?.health || 0,
        hunger: bot?.food || 0,
        isSpawned: isSpawned,
        reconnectAttempts: reconnectAttempts,
        dimension: bot?.dimension || 'N/A'
    });
});

// Invia messaggio chat al server
app.post('/api/chat', verifyToken, (req, res) => {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ error: 'Messaggio richiesto' });
    }
    
    if (!bot || !bot.isAlive) {
        return res.status(503).json({ error: 'Bot non connesso' });
    }
    
    try {
        bot.chat(message);
        addLog(`[API] Chat inviata: ${message}`);
        res.json({ success: true, message: 'Messaggio inviato' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Riavvia il bot
app.post('/api/restart', verifyToken, (req, res) => {
    addLog('[API] Restart richiesto');
    
    if (bot && bot.isAlive) {
        bot.quit();
    }
    
    if (afkInterval) clearInterval(afkInterval);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    
    reconnectAttempts = 0;
    isSpawned = false;
    bot = null;
    
    setTimeout(() => {
        createBot();
    }, 1000);
    
    res.json({ success: true, message: 'Restart avviato' });
});

// Comandi speciali
app.post('/api/command', verifyToken, (req, res) => {
    const { command } = req.body;
    const validCommands = ['jump', 'sprint', 'sneak'];
    
    if (!command || !validCommands.includes(command)) {
        return res.status(400).json({ error: `Comando non valido. Comandi: ${validCommands.join(', ')}` });
    }
    
    if (!bot || !bot.isAlive) {
        return res.status(503).json({ error: 'Bot non connesso' });
    }
    
    try {
        if (command === 'jump') {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 300);
        }
        addLog(`[API] Comando eseguito: ${command}`);
        res.json({ success: true, message: `Comando '${command}' eseguito` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Log del bot
app.get('/api/logs', verifyToken, (req, res) => {
    const lines = req.query.lines ? parseInt(req.query.lines) : 50;
    res.json({ logs: logs.slice(-lines) });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', botAlive: bot?.isAlive || false });
});

function createBot() {
    if (bot && bot.isAlive) {
        addLog('[BOT] Bot già attivo, non creo un nuovo bot.');
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
        addLog('[BOT] Massimo numero di tentativi di riconnessione raggiunto. Attesa 2 minuti...');
        reconnectAttempts = 0;
        reconnectTimeout = setTimeout(() => {
            createBot();
        }, 120000);
        return;
    }

    const delay = getReconnectDelay();
    addLog(`[BOT] Tentativo ${reconnectAttempts + 1}/${maxReconnectAttempts} - Connessione tra ${delay / 1000}s a ${config.host}:${config.port}...`);
    
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
            addLog('[BOT] Errore creazione bot: ' + err.message);
            reconnectAttempts++;
            bot = null;
            createBot();
            return;
        }

        // Timeout per spawn - se non spawna in 30s, disconnette
        const spawnTimeout = setTimeout(() => {
            if (!isSpawned && bot && bot.isAlive) {
                addLog('[BOT] Timeout spawn - disconnessione per retry.');
                try {
                    bot.quit();
                } catch (e) {}
            }
        }, 30000);

        bot.once('spawn', () => {
            clearTimeout(spawnTimeout);
            isSpawned = true;
            reconnectAttempts = 0; // Reset su spawn riuscito
            addLog(`[BOT] ✓ Entrato nel server come ${bot.username}.`);

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
                        addLog('[BOT] Comandi di autenticazione inviati.');
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
                        addLog('[BOT] Anti-AFK ✓ (jump)');
                    } catch (e) {
                        addLog('[BOT] Errore anti-AFK: ' + e.message);
                    }
                }
            }, 60000);

            // Watchdog - verifica se il bot è ancora alive ogni 90 secondi
            const watchdogInterval = setInterval(() => {
                if (!bot || !bot.isAlive) {
                    clearInterval(watchdogInterval);
                } else {
                    addLog('[BOT] Watchdog ✓ - Bot online');
                }
            }, 90000);

            addLog('[BOT] Bot online in modalità AFK silenzioso - Anti-AFK attivo.');
        });

        bot.on('kicked', (reason, loggedIn) => {
            isSpawned = false;
            addLog(`[BOT] ✗ Kicked dal server. Motivo: ${reason}`);
            reconnectAttempts++;
        });

        bot.on('end', (reason) => {
            isSpawned = false;
            addLog(`[BOT] ✗ Disconnesso. Motivo: ${reason}`);
            
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
            addLog('[BOT] ✗ Errore bot: ' + err.message);
            if (!reconnectTimeout) {
                reconnectAttempts++;
                createBot();
            }
        });

    }, delay);
}

// Graceful shutdown su Ctrl+C
process.on('SIGINT', () => {
    addLog('Shutdown ricevuto...');
    if (afkInterval) clearInterval(afkInterval);
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (bot && bot.isAlive) {
        bot.quit();
    }
    process.exit(0);
});

// Avvio server API
app.listen(API_PORT, () => {
    addLog(`🌐 API Server avviato su porta ${API_PORT}`);
    addLog(`📌 Usa token: Bearer ${API_TOKEN}`);
});

addLog('🤖 Avvio bot 24/7...');
createBot();
