#!/bin/sh

echo "================================"
echo "Aguardando banco de dados..."
echo "================================"

sleep 10

echo "Banco de dados pronto!"
echo ""

echo "================================"
echo "Executando migrations..."
echo "================================"

npx sequelize-cli db:migrate

if [ $? -eq 0 ]; then
  echo ""
  echo "Migrations executadas com sucesso!"
  echo ""
else
  echo ""
  echo "Erro ao executar migrations!"
  echo ""
  exit 1
fi

echo "================================"
echo "Iniciando servidor..."
echo "================================"
echo ""

exec npm start
