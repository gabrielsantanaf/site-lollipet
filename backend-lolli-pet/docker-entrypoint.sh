#\!/bin/sh
sleep 10
npx sequelize-cli db:migrate || exit 1
exec npm start
