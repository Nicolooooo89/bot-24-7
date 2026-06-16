const mineflayer = require('mineflayer');

// Configurazione fissa per il tuo server
const config = {
    host: 'fuocosmp.falix.gg',
    port: 25565,
    username: 'FuocoBot24h', // Scegli il nickname del bot
    version: '1.21.11',      // La tua versione specifica
    password: 'Miapassword123' // Cambiala con la password che vuoi usare nel server
};

function createBot() {
    console.log(`[BOT] Tentativo di connessione a ${config.host} su versione ${config.version}...`);
    
    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version
    });

    // 1. Gestione dell'accesso in gioco (Login / Register automatico)
    bot.on('spawn', () => {
        console.log(`[BOT] Entrato nel server come ${bot.username}. Inoltro comandi...`);
        
        // Aspetta 3 secondi dopo il caricamento del mondo per inviare i comandi di login
        setTimeout(() => {
            // Esegue sia il registro che il login per sicurezza
            bot.chat(`/register ${config.password} ${config.password}`);
            bot.chat(`/login ${config.password}`);
            console.log(`[BOT] Comandi di autenticazione inviati.`);
        }, 3000);
    });

    // 2. Sistema Anti-AFK (Invia un messaggio o si muove ogni 2 minuti per non farsi kickare)
    let afkInterval;
    bot.on('spawn', () => {
        if (afkInterval) clearInterval(afkInterval);
        
        afkInterval = setInterval(() => {
            // Variante A: Salta sul posto
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            
            // Variante B: Invia un puntino o un comando vuoto in chat (opzionale, scommenta se serve)
            // bot.chat('/afkcheck'); 
            
            console.log(`[BOT] Eseguita azione Anti-AFK.`);
        }, 120000); // Ogni 120 secondi
    });

    // 3. Riconnessione automatica 24/7 in caso di riavvio del server o crash
    bot.on('end', (reason) => {
        console.log(`[BOT] Disconnesso dal server. Motivo: ${reason}`);
        if (afkInterval) clearInterval(afkInterval);
        
        console.log(`[BOT] Tentativo di riconnessione tra 15 secondi...`);
        setTimeout(createBot, 15000);
    });

    // Gestione degli errori per evitare il crash dell'applicazione su Railway
    bot.on('error', (err) => {
        console.error('[BOT] Errore di rete o di protocollo:', err.message);
    });
}

createBot();
