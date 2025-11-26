#!/bin/sh

echo "Aguardando banco de dados ficar pronto..."

# Tenta rodar migrations ate 10 vezes
RETRY=0
MAX_RETRIES=10

until npx sequelize-cli db:migrate; do
  RETRY=$((RETRY+1))
  if [ $RETRY -eq $MAX_RETRIES ]; then
    echo "ERRO: Nao foi possivel conectar ao banco apos $MAX_RETRIES tentativas"
    exit 1
  fi
  echo "Banco nao esta pronto. Tentativa $RETRY de $MAX_RETRIES. Aguardando 5s..."
  sleep 5
done

echo "Migrations executadas com sucesso!"
echo "Iniciando servidor..."

exec npm start
