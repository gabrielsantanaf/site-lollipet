import Sequelize, { Model } from 'sequelize'

export default class Cliente extends Model{
  static init(sequelize){
    super.init({
      nome: {
        type: Sequelize.STRING,
        defaultValue: '',
        validate: {
          len: { args: [1, 255], msg: 'Nome do cliente precisa ter entre 1 e 255 caracteres' }
        }
      },
      email: {
        type: Sequelize.STRING,
        defaultValue: '',
        unique: { msg: 'Email já existe' },
        validate: { isEmail: { msg: 'Email inválido' } }
      },
      telefone: {
        type: Sequelize.STRING,
        defaultValue: ''
      }
    },{
      sequelize,
      tableName: 'clientes'
    })

    return this
  }

  static associate(models){
    this.hasMany(models.Pet, { foreignKey: 'cliente_id', as: 'pets' })
  }
}
