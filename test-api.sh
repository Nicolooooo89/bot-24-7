#!/bin/bash

# Script per testare gli endpoint dell'API

# Configurazione
API_URL="${1:-http://localhost:3000}"
API_TOKEN="${2:-il_tuo_token}"

echo "========================================="
echo "🤖 Test Bot API"
echo "========================================="
echo "URL: $API_URL"
echo "Token: $API_TOKEN"
echo ""

# Colori
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -e "${YELLOW}TEST: $description${NC}"
    echo "  Metodo: $method"
    echo "  Endpoint: $endpoint"
    
    if [ "$method" == "POST" ]; then
        curl -s -X POST "$API_URL$endpoint" \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" | jq '.' 2>/dev/null || echo "Errore parsing JSON"
    else
        curl -s "$API_URL$endpoint" \
            -H "Authorization: Bearer $API_TOKEN" | jq '.' 2>/dev/null || echo "Errore parsing JSON"
    fi
    
    echo ""
}

# Test 1: Health check (no token)
echo -e "${YELLOW}TEST: Health Check (no token)${NC}"
curl -s "$API_URL/health" | jq '.' 2>/dev/null || echo "Errore"
echo ""

# Test 2: Status
test_endpoint "GET" "/api/status" "" "Ottieni Status"

# Test 3: Log
test_endpoint "GET" "/api/logs?lines=10" "" "Ottieni Log (10 linee)"

# Test 4: Invia messaggio
test_endpoint "POST" "/api/chat" '{"message":"Test messaggio!"}' "Invia Messaggio"

# Test 5: Comando
test_endpoint "POST" "/api/command" '{"command":"jump"}' "Esegui Comando (jump)"

echo -e "${GREEN}✅ Test completati!${NC}"
