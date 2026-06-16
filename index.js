const fs = require('fs');
const path = require('path');
const mineflayer = require('mineflayer');

// Configurazione fissa per il tuo server
const config = {
    host: 'fuocosmp.falix.gg',
    port: 25565,
    username: 'FuocoBot24h',
    version: '1.21.11',
    password: 'Miapassword123',
    chatDelay: 800 // ms tra i messaggi di saluto
};

const greetedPlayersFile = path.join(__dirname, 'greetedPlayers.json');
const greetedPlayers = new Set();
let bot = null;
let afkInterval = null;
let reconnectTimeout = null;
let chatQueue = [];
let isSending = false;

function initializeGreetedPlayersFile() {
    try {
        if (!fs.existsSync(greetedPlayersFile)) {
            fs.writeFileSync(greetedPlayersFile, JSON.stringify([], null, 2), 'utf8');
            console.log('[BOT] File greetedPlayers.json creato.');
        }
    } catch (err) {
        console.error('[BOT] Errore creazione greetedPlayers.json:', err.message);
    }
}

function loadGreetedPlayers() {
    try {
        if (fs.existsSync(greetedPlayersFile)) {
            const data = fs.readFileSync(greetedPlayersFile, 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                parsed.forEach((username) => greetedPlayers.add(username));
                console.log(`[BOT] Caricati ${parsed.length} giocatori salutati.`);
            }
        }
    } catch (err) {
        console.error('[BOT] Errore caricamento greetedPlayers:', err.message);
    }
}

function saveGreetedPlayers() {
    try {
        fs.writeFileSync(greetedPlayersFile, JSON.stringify([...greetedPlayers].sort(), null, 2), 'utf8');
    } catch (err) {
        console.error('[BOT] Errore salvataggio greetedPlayers:', err.message);
    }
}

function getWelcomeMessages(username) {
    return [
        `Benvenuto su Fuoco SMP, ${username}! Le fiamme del nostro mondo si accendono con il tuo arrivo.`,
        `Sei pronto a forgiare il tuo destino, stringere alleanze e bruciare ogni ostacolo sul tuo cammino?`,
        `Primi passi fondamentali: leggi il regolamento in #regolamento per evitare il ban. Presentati alla community in #chat-generale. Richiedi l'accesso alla whitelist in #whitelist se non sei ancora dentro.`,
        `Che il fuoco guidi i tuoi passi!`
    ];
}

function sendChatMessage(message) {
    if (!bot || !bot.entity) return;
    chatQueue.push(message);
    processChatQueue();
}

function processChatQueue() {
    if (isSending || chatQueue.length === 0 || !bot || !bot.entity) return;

    isSending = true;
    const message = chatQueue.shift();
    bot.chat(message);

    setTimeout(() => {
        isSending = false;
        processChatQueue();
    }, config.chatDelay);
}

initializeGreetedPlayersFile();
loadGreetedPlayers();

let initialPlayers = new Set();
let ignoreInitialPlayers = true;

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
            sendChatMessage(`/register ${config.password} ${config.password}`);
            setTimeout(() => {
                sendChatMessage(`/login ${config.password}`);
            }, 500);
            console.log('[BOT] Comandi di autenticazione inviati.');
        }, 2000);

        // Carica i giocatori iniziali e ignora il saluto per 5 secondi
        initialPlayers = new Set(Object.keys(bot.players).filter(p => p !== bot.username));
        ignoreInitialPlayers = true;
        setTimeout(() => {
            ignoreInitialPlayers = false;
            console.log(`[BOT] Sistema di saluto attivato. Ci sono ${initialPlayers.size} giocatori nel server.`);
            initialPlayers.clear();
        }, 5000);

        console.log('[BOT] Bot online. Modalità AFK passiva abilitata.');
    });

    bot.on('playerJoined', (player) => {
        if (!player || !player.username || player.username === bot.username) return;

        const username = player.username;
        
        // Non salutare i giocatori iniziali nei primi 5 secondi
        if (ignoreInitialPlayers && initialPlayers.has(username)) {
            console.log(`[BOT] Ignorato saluto iniziale per ${username}`);
            return;
        }
        
        // Non salutare se già stato salutato
        if (greetedPlayers.has(username)) {
            console.log(`[BOT] Giocatore ${username} già salutato in passato.`);
            return;
        }

        console.log(`[BOT] Nuovo giocatore: ${username}. Invio saluto...`);
        const messages = getWelcomeMessages(username);
        messages.forEach((message) => sendChatMessage(message));

        greetedPlayers.add(username);
        saveGreetedPlayers();
    });

    bot.on('playerLeft', (player) => {
        if (!player || !player.username) return;
        console.log(`[BOT] Giocatore disconnesso: ${player.username}`);
    });

    bot.on('kicked', (reason, loggedIn) => {
        console.log(`[BOT] Kicked dal server. Motivo: ${reason}. Logged in: ${loggedIn}`);
    });

    bot.on('end', (reason) => {
        console.log(`[BOT] Disconnesso dal server. Motivo: ${reason}`);
        
        if (afkInterval) {
            clearInterval(afkInterval);
            afkInterval = null;
        }

        bot = null;
        chatQueue = [];
        isSending = false;

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

    bot.on('warning', (message) => {
        console.warn('[BOT] Avviso:', message);
    });
}

createBot();
