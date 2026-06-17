# FuocoBot 24/7

Un bot Minecraft 24/7 per il server FuocoSMP con **CONTROLLO REMOTO via API HTTP** che:
- ✅ Rimane connesso al server H24
- ✅ Saluta i nuovi giocatori che entrano
- ✅ Mantiene la memoria dei giocatori già salutati
- ✅ Previene l'AFK kick
- ✅ Si riconnette automaticamente se disconnesso
- 🆕 **CONTROLLABILE DA REMOTO via Railway con API HTTP**
- 🆕 **Dashboard Web per il controllo remoto**

## 🎮 Controllo Remoto

Puoi controllare il bot **da qualsiasi dispositivo** tramite API HTTP mentre è hostato su Railway!

### Cosa puoi fare:
- 📊 Visualizzare lo status del bot (connessione, salute, fame, etc.)
- 💬 Inviare messaggi al server Minecraft
- 🎮 Eseguire comandi (jump, sprint, sneak)
- 🔄 Riavviare il bot da remoto
- 📋 Visualizzare i log in tempo reale

👉 **Vedi [API_REMOTE_CONTROL.md](API_REMOTE_CONTROL.md) per la documentazione completa**

### Dashboard Web
Apri il file `remote_control.html` nel browser per una GUI completa di controllo!

## Setup

### 1. Requisiti
- Node.js 14+
- npm
- Un account Railway (gratis!)

### 2. Installazione Locale
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
    password: 'Miapassword123'
};
```

### 4. Variabili d'Ambiente
Crea un file `.env` (opzionale per testing locale):
```
API_TOKEN=il_tuo_token_segreto
PORT=3000
```

### 5. Avvia il bot localmente
```bash
npm start
```

## 🚀 Deploy su Railway

### Passo 1: Connetti il repo a Railway
1. Vai su https://railway.app
2. Clicca su "Start a New Project"
3. Seleziona "GitHub Repo"
4. Autorizza e seleziona questo repo

### Passo 2: Configura Variabili di Ambiente
Su Railway → Progetto → Variables, aggiungi:
```
API_TOKEN=il_tuo_token_lungo_e_sicuro
PORT=3000
```

### Passo 3: Deploy
Railway builderà e deployerà automaticamente. Otterrai un'URL pubblica come:
```
https://tuo-bot.railway.app
```

## 📡 API Endpoints

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/status` | Status del bot |
| POST | `/api/chat` | Invia messaggio |
| POST | `/api/command` | Esegui comando (jump/sprint/sneak) |
| POST | `/api/restart` | Riavvia il bot |
| GET | `/api/logs` | Visualizza log |
| GET | `/health` | Health check (no token) |

📖 Vedi [API_REMOTE_CONTROL.md](API_REMOTE_CONTROL.md) per esempi completi.

## 🛠️ Testing Locale

```bash
# Avvia il bot
npm start

# In un altro terminale, testa l'API:
curl -H "Authorization: Bearer il_tuo_token" \
  http://localhost:3000/api/status

# Invia messaggio:
curl -X POST http://localhost:3000/api/chat \
  -H "Authorization: Bearer il_tuo_token" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao!"}'
```

## 🐛 Troubleshooting

**"Bot non connesso"** → Controlla le credenziali del server e la connessione internet

**"401 Unauthorized"** → Token API sbagliato o mancante

**"Cannot connect to Railway"** → Controlla i log in Railway dashboard

## 📝 Note

- Il bot mantiene i log degli ultimi 200 messaggi
- Autenticazione: token Bearer nel header `Authorization`
- Rate limiting: nessuno implementato (aggiungi se necessario)
- HTTPS su Railway è automatico

## 📚 File Importanti

- `index.js` - Core del bot con API HTTP
- `remote_control.html` - Dashboard Web per il controllo
- `API_REMOTE_CONTROL.md` - Documentazione completa API
- `package.json` - Dipendenze (Express + Mineflayer)

---

**Made with ❤️ per FuocoSMP**
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
