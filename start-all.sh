#!/bin/bash
# Script para iniciar o sistema completo (Backend + Frontend)

echo "======================================"
echo "Dino Traffic Control - Sistema Completo"
echo "======================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se os diretórios existem
if [ ! -d "backend" ] || [ ! -d "hackfools" ]; then
    echo "Erro: Execute este script a partir da raiz do projeto!"
    exit 1
fi

echo -e "${BLUE}[1/2]${NC} Iniciando Backend..."
echo "      Executando em: http://localhost:8000"
echo ""

# Iniciar backend em background
cd backend

# Verificar se venv existe
if [ ! -d "venv" ]; then
    echo -e "${BLUE}[SETUP]${NC} Criando virtual environment..."
    python3 -m venv venv
fi

# Ativar venv
source venv/bin/activate

# Instalar dependências se necessário
pip install -q -r requirements.txt 2>/dev/null

# Remover banco de dados anterior se quiser começar do zero (descomente)
# rm -f dinosaurs.db

# Iniciar uvicorn
echo -e "${GREEN}✓${NC} Backend iniciado"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 2

echo ""
echo -e "${BLUE}[2/2]${NC} Iniciando Frontend..."
echo "      Executando em: http://localhost:5173"
echo ""

# Iniciar frontend
cd ../hackfools
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✓${NC} Sistema iniciado!"
echo ""
echo "======================================"
echo "Serviços ativos:"
echo "  • Backend:  http://localhost:8000"
echo "  • Frontend: http://localhost:5173"
echo "  • Swagger:  http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para parar todos os serviços"
echo "======================================"
echo ""

# Esperar pelos processos
wait $BACKEND_PID $FRONTEND_PID
