import Sequelize from 'sequelize'
import databaseConfig from '../config/database.js'
import Veterinario from '../models/Veterinario.js'
import Foto from '../models/Foto.js'
import Cliente from '../models/Cliente.js'
import Pet from '../models/Pet.js'
import Agendamento from '../models/Agendamento.js'
import Prontuario from '../models/Prontuario.js'
import ProntuarioArquivo from '../models/ProntuarioArquivo.js'



const models = [Veterinario, Foto, Cliente, Pet, Prontuario, ProntuarioArquivo, Agendamento]

const connection = new Sequelize(databaseConfig)

// Testa a conexão com o banco de dados
console.log('\n🔄 Tentando conectar ao banco de dados...')
console.log(`📊 Database: ${databaseConfig.database}`)
console.log(`🌐 Host: ${databaseConfig.host}:${databaseConfig.port}`)
console.log(`👤 Usuário: ${databaseConfig.username}`)

connection.authenticate()
  .then(() => {
    console.log('✅ CONEXÃO COM O BANCO DE DADOS ESTABELECIDA COM SUCESSO!')
    console.log(`🎯 Dialect: ${databaseConfig.dialect}`)
    console.log(`⏰ Timezone: ${databaseConfig.timezone}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  })
  .catch((error) => {
    console.error('❌ ERRO AO CONECTAR COM O BANCO DE DADOS:')
    console.error(`📝 Mensagem: ${error.message}`)
    console.error(`🔍 Detalhes completos:`, error)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    process.exit(1)
  })

models.forEach((model) => { model.init(connection) })
models.forEach((model) => { model.associate && model.associate(connection.models) })
