require('dotenv/config');

module.exports = {
  dialect: 'mariadb',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,

  // Configurações de pool e retry para evitar timeout
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,  // Timeout para adquirir conexão: 60s
    idle: 10000
  },

  // Timeout de conexão
  dialectOptions: {
    connectTimeout: 60000,  // 60 segundos
    timezone: 'America/Sao_Paulo'
  },

  // Retry automático
  retry: {
    max: 10
  },

  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
    'createdAt': 'created_at',
    'updatedAt': 'updated_at'
  },

  timezone: 'America/Sao_Paulo'
};
