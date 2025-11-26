#!/bin/sh

echo "Aguardando banco de dados inicializar..."
echo "Esperando 20 segundos para garantir que o banco esta pronto..."
sleep 20

echo "Tentando executar migrations..."

# Tenta rodar migrations ate 15 vezes
RETRY=0
MAX_RETRIES=15

until npx sequelize-cli db:migrate; do
  RETRY=$((RETRY+1))
  if [ $RETRY -eq $MAX_RETRIES ]; then
    echo "ERRO: Nao foi possivel conectar ao banco apos $MAX_RETRIES tentativas"
    exit 1
  fi
  echo "Tentativa $RETRY de $MAX_RETRIES falhou. Aguardando 8s..."
  sleep 8
done

echo ""
echo "===================================="
echo "Migrations executadas com sucesso!"
echo "===================================="
echo ""
echo "Iniciando servidor Node.js..."

exec npm start
