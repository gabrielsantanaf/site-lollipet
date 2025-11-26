#!/bin/sh

echo "🔄 Aguardando banco de dados estar pronto..."
sleep 5

echo "📊 Executando migrations do Sequelize..."
npm run migrate

if [ $? -eq 0 ]; then
  echo "✅ Migrations executadas com sucesso!"
else
  echo "❌ Erro ao executar migrations!"
  exit 1
fi

echo "🚀 Iniciando servidor..."
npm start
