# 🤖 Controllo Remoto Bot via API HTTP

Il bot ha ora un'**API HTTP completa** che puoi usare per controllarlo da **Railway o da qualsiasi dispositivo**.

## 🚀 Setup su Railway

### 1️⃣ Configura le variabili di ambiente in Railway

Vai su Railway → Progetto → Variabili e aggiungi:

```
API_TOKEN=il_tuo_token_segreto_qui
PORT=3000
```

**Azioni importanti:**
- Scegli un token **lungo e sicuro** (es: `fUoCoBOT_2024_7h4K_sEcRet_123456`)
- Railway assegnerà una **URL pubblica** automaticamente

### 2️⃣ Aggiorna il bot su Railway

```bash
git add .
git commit -m "Aggiunto controllo remoto API"
git push origin main
```

Railway rebuilderà e redeployerà automaticamente.

---

## 📡 Endpoint dell'API

### ✅ Status del Bot
```bash
GET https://tuo-bot.railway.app/api/status
Authorization: Bearer API_TOKEN
```

**Risposta:**
```json
{
  "connected": true,
  "username": "FuocoBot24h",
  "health": 20,
  "hunger": 20,
  "isSpawned": true,
  "reconnectAttempts": 0,
  "dimension": "minecraft:overworld"
}
```

---

### 💬 Invia Messaggio Chat
```bash
POST https://tuo-bot.railway.app/api/chat
Authorization: Bearer API_TOKEN
Content-Type: application/json

{
  "message": "Ciao ragazzi!"
}
```

**Risposta:**
```json
{
  "success": true,
  "message": "Messaggio inviato"
}
```

---

### 🔄 Riavvia il Bot
```bash
POST https://tuo-bot.railway.app/api/restart
Authorization: Bearer API_TOKEN
```

---

### 🎮 Comandi Speciali
```bash
POST https://tuo-bot.railway.app/api/command
Authorization: Bearer API_TOKEN
Content-Type: application/json

{
  "command": "jump"
}
```

Comandi disponibili: `jump`, `sprint`, `sneak`

---

### 📋 Visualizza i Log
```bash
GET https://tuo-bot.railway.app/api/logs?lines=50
Authorization: Bearer API_TOKEN
```

---

### 💚 Health Check (no token richiesto)
```bash
GET https://tuo-bot.railway.app/health
```

---

## 🖥️ Usare da Windows/Mac

### Con PowerShell (Windows):
```powershell
$token = "il_tuo_token"
$url = "https://tuo-bot.railway.app/api/status"
$headers = @{"Authorization" = "Bearer $token"}

Invoke-WebRequest -Uri $url -Headers $headers -Method Get
```

### Con curl (Windows/Mac/Linux):
```bash
curl -H "Authorization: Bearer il_tuo_token" \
  https://tuo-bot.railway.app/api/status
```

### Inviare messaggio:
```bash
curl -X POST https://tuo-bot.railway.app/api/chat \
  -H "Authorization: Bearer il_tuo_token" \
  -H "Content-Type: application/json" \
  -d '{"message":"Ciao!"}'
```

---

## 📱 Dashboard Web (optional)

Apri il file **remote_control.html** nel browser per avere una GUI completa di controllo!

---

## 🔐 Sicurezza

⚠️ **IMPORTANTE:**
- Cambia `API_TOKEN` con qualcosa di **lungo e casuale**
- Non condividere il token pubblicamente
- Su Railway, le URL sono **pubbliche** ma protette dal token
- Se esponi il token, cambilo subito nelle variabili di Railway

---

## 🐛 Troubleshooting

**"401 Unauthorized"** → Token sbagliato o mancante
**"503 Service Unavailable"** → Bot non connesso al server Minecraft
**"Cannot POST"** → URL sbagliata o metodo HTTP sbagliato

Controlla i **Log** in Railway per debug dettagliato.
