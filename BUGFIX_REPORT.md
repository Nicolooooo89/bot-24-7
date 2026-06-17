# 🐛 Bug Fix Report

## 🔴 Errore: "Failed to Fetch"

Il problema era causato da **CORS (Cross-Origin Resource Sharing) non configurato** nel server Express.

### Problemi Identificati e Fixati

#### 1. ❌ Mancava il modulo `cors`
**Problema**: Il file `package.json` non includeva la dipendenza `cors`
**Fix**: Aggiunto `"cors": "^2.8.5"` in `package.json`
```json
"dependencies": {
  "mineflayer": "^4.24.0",
  "express": "^4.18.2",
  "cors": "^2.8.5"  // ✅ AGGIUNTO
}
```

#### 2. ❌ CORS middleware non configurato
**Problema**: Il server Express non aveva il middleware CORS, quindi il browser bloccava tutte le richieste cross-origin
**Fix**: Aggiunto il middleware CORS in `index.js`:
```javascript
const cors = require('cors');

// Middleware CORS - IMPORTANTE per le richieste dal browser
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Gestione esplicita preflight requests
app.options('*', cors());
```

#### 3. ⚠️ Server non in ascolto su tutte le interfacce
**Problema**: Il server era in ascolto solo su `localhost`, non accessibile da altre macchine
**Fix**: Aggiunto `'0.0.0.0'` per ascoltare su tutte le interfacce:
```javascript
app.listen(API_PORT, '0.0.0.0', () => {
    // Ora accessibile da qualsiasi interfaccia
});
```

---

## 🚀 Come Usare

### 1. Installare le dipendenze
```bash
npm install
```

### 2. Avviare il bot
```bash
npm start
```

### 3. Testare l'API
```bash
# Test health check
curl http://localhost:3000/health

# Test status (con token)
curl -H "Authorization: Bearer tu0_t0k3n_s3gr3t0" \
  http://localhost:3000/api/status
```

### 4. Usare l'interfaccia web
- Apri `remote_control.html` nel browser
- URL API: `http://localhost:3000`
- Token API: il token configurato in `index.js` (default: `tu0_t0k3n_s3gr3t0`)

---

## ✅ Verifiche Completate

- ✅ Middleware CORS abilitato
- ✅ Supporto per preflight requests (OPTIONS)
- ✅ Server in ascolto su tutte le interfacce
- ✅ Dipendenze installate
- ✅ Header CORS correttamente configurati

---

## 📝 Comandi dell'API

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/status` | Stato del bot |
| POST | `/api/chat` | Invia messaggio chat |
| POST | `/api/command` | Esegui comando (jump/sprint/sneak) |
| POST | `/api/restart` | Riavvia il bot |
| GET | `/api/logs` | Visualizza log |
| GET | `/health` | Health check (no token) |

---

## 🔑 Sicurezza

Per maggiore sicurezza su Railway:
1. Modifica il token di default in una variabile d'ambiente
2. Limita l'origine CORS a domini specifici se necessario
3. Usa HTTPS (Railway lo fornisce automaticamente)

```javascript
// Se su Railway, usa variabili d'ambiente
const API_TOKEN = process.env.API_TOKEN || 'CHANGE_ME_IN_PRODUCTION';
```
