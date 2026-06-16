# FuocoBot 24/7

Un bot Minecraft 24/7 per il server FuocoSMP che:
- Rimane connesso al server H24
- Saluta i nuovi giocatori che entrano
- Mantiene la memoria dei giocatori già salutati
- Previene l'AFK kick
- Si riconnette automaticamente se disconnesso

## Setup

### 1. Requisiti
- Node.js 14+
- npm

### 2. Installazione
```bash
npm install
```

### 3. Configurazione
Modifica le credenziali in `index.js`:
```javascript
const config = {
    host: 'fuocosmp.falix.gg',
    port: 25565,
    username: 'FuocoBot24h',
    version: '1.21.11',
    password: 'Miapassword123',
    chatDelay: 800 // millisecundi tra i messaggi
};
```

### 4. Esecuzione
```bash
npm start
```

## Funzionalità

### Saluto automatico
Quando un nuovo giocatore entra nel server, il bot invia 4 messaggi:
1. Benvenuto personale
2. Motivazione
3. Primi passi (regolamento, presentazione, whitelist)
4. Messaggio finale

### Memoria persistente
I giocatori già salutati vengono salvati in `greetedPlayers.json` e non vengono risalutati.

### Anti-AFK
Il bot salta ogni 2 minuti per evitare il kick per inattività.

### Riconnessione automatica
Se il bot viene disconnesso, si riconnette automaticamente dopo 15 secondi.

## File generati

- `greetedPlayers.json` - Lista ordinata dei giocatori salutati (gitignored)

## 24/7 Hosting

Per mantenere il bot online 24/7, scegli una di queste opzioni:

### Opzione 1: Macchina personale / Server locale
- Lasciare il PC o server acceso
- Eseguire `npm start`

### Opzione 2: VPS (consigliato)
- DigitalOcean, Hetzner, AWS, Linode, ecc.
- Usare `pm2` per mantenerlo in background:
  ```bash
  npm install -g pm2
  pm2 start index.js --name "fuoco-bot"
  pm2 save
  pm2 startup
  ```

### Opzione 3: Cloud gratuiti (limitato)
- Replit (free tier - limitato)
- Railway (free tier - limitato)
- Fly.io (free tier - limitato)

## Troubleshooting

### Bot non si connette
1. Verifica la password
2. Controlla host e port
3. Verifica il numero di versione con `/version` in-game

### Messaggi di saluto non inviati
1. Attendi la connessione (visibile nei log)
2. Il bot non saluta i giocatori già presenti al primo caricamento
3. I nuovi arrivi dovrebbero ricevere il saluto dopo 5 secondi dall'ingresso del bot

### Bot disconnesso frequentemente
1. Aumenta il `chatDelay` in `config`
2. Verifica la connessione Internet
3. Controlla i log del server Minecraft

## Log

I log sono visibili in console. Formato:
- `[BOT]` - Evento principale
- `[BOT] Errore:` - Errore
- `[BOT] Avviso:` - Avviso

## Licenza
MIT
