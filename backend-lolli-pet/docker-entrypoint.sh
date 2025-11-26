#!/bin/sh
set -e

echo "================================"
echo "🔄 Aguardando banco de dados..."
echo "================================"

# Aguarda o banco estar realmente pronto
echo "⏳ Tentando conectar ao banco de dados..."
max_attempts=30
attempt=0

until nc -z db 3306 || [ $attempt -eq $max_attempts ]; do
  attempt=$((attempt + 1))
  echo "⏳ Tentativa $attempt/$max_attempts - Aguardando banco..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Timeout: Banco de dados não ficou pronto!"
  exit 1
fi

echo "✅ Banco de dados está pronto!"
echo ""

echo "================================"
echo "📊 Executando migrations..."
echo "================================"

npx sequelize-cli db:migrate

if [ $? -eq 0 ]; then
  echo "✅ Migrations executadas com sucesso!"
else
  echo "❌ Erro ao executar migrations!"
  exit 1
fi

echo ""
echo "================================"
echo "🚀 Iniciando servidor..."
echo "================================"

npm start
