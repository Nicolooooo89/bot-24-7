# 📦 Setup Completo su Railway

Segui questa guida passo-passo per deployare il bot su Railway con controllo remoto.

## ✅ Prerequisiti

- ✔️ GitHub account
- ✔️ Railway account (gratuito da https://railway.app)
- ✔️ Questo repo forkato o salvato

## 🚀 Step 1: Prepara il Codice Locale

```bash
# Clona o vai nella cartella del progetto
cd bot-24-7

# Installa dipendenze
npm install

# Copia il .env di esempio
cp .env.example .env

# Modifica .env con le tue credenziali
nano .env
```

**Nel file `.env` configura:**
```
API_TOKEN=genera_un_token_lungo_e_casuale_qui
PORT=3000
```

## 🌐 Step 2: Connetti a Railway

### Opzione A: Con Git (Consigliato)

1. Vai su https://railway.app
2. Fai login con GitHub
3. Clicca **"Start a New Project"**
4. Seleziona **"GitHub Repo"**
5. Autorizza e seleziona il repo
6. Railway farà il primo deploy automaticamente

### Opzione B: Manuale (CLI)

```bash
# Installa Railway CLI
npm i -g @railway/cli

# Login
railway login

# Crea progetto
railway init

# Deploy
railway up
```

## ⚙️ Step 3: Configura Variabili di Ambiente

1. Vai su **Railway Dashboard**
2. Clicca sul tuo progetto
3. Vai in **"Variables"**
4. Aggiungi queste variabili:

```
API_TOKEN=il_tuo_token_super_segreto_lungo
```

**⚠️ IMPORTANTISSIMO:** Il token deve essere:
- ✅ **Lungo** (almeno 32 caratteri)
- ✅ **Casuale** (es: `fUoCo_2024_7h4K_sEcRet_jX9mK2p4L`)
- ✅ **Unico** (diverso per ogni ambiente)

## 🎯 Step 4: Verifica il Deploy

1. Railway darà l'URL pubblica (es: `https://tuo-bot.railway.app`)
2. Aspetta che lo status sia **"Building"** → **"Running"**
3. Controlla i **Logs** per errori

## ✨ Step 5: Testa l'API da Remoto

### Opzione 1: Dashboard Web
1. Scarica il file `remote_control.html`
2. Apri nel browser
3. Inserisci:
   - URL: `https://tuo-bot.railway.app` (Railway ti dà questa URL)
   - Token: Il token che hai configurato

### Opzione 2: Terminale (curl)

```bash
# Test status
curl -H "Authorization: Bearer IL_TUO_TOKEN" \
  https://tuo-bot.railway.app/api/status

# Invia messaggio
curl -X POST https://tuo-bot.railway.app/api/chat \
  -H "Authorization: Bearer IL_TUO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao dal bot remoto!"}'

# Vedi i log
curl -H "Authorization: Bearer IL_TUO_TOKEN" \
  https://tuo-bot.railway.app/api/logs?lines=20
```

## 🔄 Step 6: Auto-Deploy su Commit

Railway monitora il tuo repo GitHub automaticamente:
- Ogni `git push` farà un nuovo deploy
- I log saranno visibili in Railway Dashboard

## 📊 Dashboard Railway

Nella dashboard puoi:
- 📈 Vedere **CPU/Memory** usage
- 📋 Vedere i **Log** in tempo reale
- 🔄 Riavviare il deployment
- 🗑️ Eliminare il deployment
- 🔐 Gestire i secrets

## 🆘 Troubleshooting

### Errore: "Build failed"
```
Controlla i log → probabile errore npm install
Soluzione: verifica package.json è corretto
```

### Errore: "Bot non connesso a Minecraft"
```
Probabile: credenziali server sbagliate in index.js
Soluzione: controlla host, port, username, password
```

### Errore: "401 Unauthorized"
```
Probabile: token API sbagliato
Soluzione: copia esatto il token da Railway Variables
```

### Il bot si disconnette spesso
```
Probabile: timeout della connessione
Soluzione: Railway ha memory limit (512MB free tier)
Aumenta il plan se necessario
```

## 💰 Railway Pricing

- **Free Tier:** 500 ore/mese (sufficiente per 1 bot H24)
- **Usage:** ~2-5 GB dati/mese
- **Upgrade:** 5$ quando finisci i crediti gratuiti

## 🔐 Sicurezza

⚠️ **IMPORTANTE:**

1. ❌ NON committ il vero token su Git
2. ❌ NON condividere il link Railway pubblico
3. ✅ USA un token lungo e casuale
4. ✅ Cambia il token frequentemente
5. ✅ Se esponi il token, cambilo subito in Railway

## 📱 Controllo da Mobile

1. Apri `remote_control.html` in un browser mobile
2. Usa dati mobili per connetterti a Railway
3. Full control da qualsiasi dispositivo!

## 🎉 Fatto!

Ora hai un bot Minecraft controllabile da remoto 24/7 su Railway!

**Prossimi step:**
- 📖 Leggi [API_REMOTE_CONTROL.md](API_REMOTE_CONTROL.md) per endpoint avanzati
- 🧪 Prova i test con `test-api.sh`
- 🎮 Aggiungi più comandi personalizzati
- 📊 Monitora su Railway Dashboard

Buon divertimento! 🚀
