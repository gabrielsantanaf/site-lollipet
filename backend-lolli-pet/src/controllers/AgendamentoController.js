import Agendamento from '../models/Agendamento.js'
import Pet from '../models/Pet.js'
import Veterinario from '../models/Veterinario.js'

class AgendamentoController {
  async store(req, res) {
    try {
      const { pet_id } = req.body
      // pegar o id do veterinário do token (middleware loginRequired)
      // suportar tanto req.veterinarioId (camelCase) quanto req.veterinario_id (snake_case)
      const veterinario_id = req.veterinarioId || req.veterinario_id

      // Validar se pet existe
      if (!pet_id) {
        return res.status(400).json({ errors: ['pet_id é obrigatório'] })
      }

      const pet = await Pet.findByPk(pet_id)
      if (!pet) {
        return res.status(400).json({ errors: ['Pet não encontrado'] })
      }

      // Exigir veterinário para todos os serviços (petshop e clinico)
      if (!veterinario_id) {
        return res.status(400).json({ errors: ['Veterinário é obrigatório'] })
      }

      const veterinario = await Veterinario.findByPk(veterinario_id)

      if (!veterinario) {
        return res.status(400).json({ errors: ['Veterinário não encontrado'] })
      }

      // injetar veterinario_id vindo do token no payload enviado ao model
      const agendamento = await Agendamento.create({ ...req.body, veterinario_id })

      return res.json({
        id: agendamento.id,
        servico: agendamento.servico,
        data_hora: agendamento.data_hora,
        pet_id: agendamento.pet_id,
        veterinario_id: agendamento.veterinario_id,
        observacoes: agendamento.observacoes,
        status: agendamento.status
      })
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors.map(e => e.message) })
      }
      return res.status(400).json({ errors: [err.message] })
    }
  }

  async index(req, res) {
    try {
      const { data_inicio, data_fim } = req.query

      // Configurar filtro de data se fornecido
      const whereClause = {}
      if (data_inicio && data_fim) {
        whereClause.data_hora = {
          [Agendamento.sequelize.Sequelize.Op.between]: [data_inicio, data_fim]
        }
      } else if (data_inicio) {
        whereClause.data_hora = {
          [Agendamento.sequelize.Sequelize.Op.gte]: data_inicio
        }
      } else if (data_fim) {
        whereClause.data_hora = {
          [Agendamento.sequelize.Sequelize.Op.lte]: data_fim
        }
      }

      const agendamentos = await Agendamento.findAll({
        where: whereClause,
        attributes: ['id', 'servico', 'data_hora', 'observacoes', 'status'],
        include: [
          {
            association: 'pet',
            attributes: ['id', 'nome', 'especie', 'raca']
          },
          {
            association: 'veterinario',
            attributes: ['id', 'nome', 'email'],
            required: false // LEFT JOIN (mesmo sem veterinário)
          }
        ],
        order: [['data_hora', 'ASC']]
      })

      return res.json(agendamentos)
    } catch (err) {
      return res.status(500).json({ errors: [err.message] })
    }
  }

  async show(req, res) {
    try {
      const agendamento = await Agendamento.findByPk(req.params.id, {
        attributes: ['id', 'servico', 'data_hora', 'observacoes', 'status'],
        include: [
          {
            association: 'pet',
            attributes: ['id', 'nome', 'especie', 'raca'],
            include: [
              {
                association: 'cliente', // se Pet tem relação com Cliente
                attributes: ['id', 'nome', 'telefone']
              }
            ]
          },
          {
            association: 'veterinario',
            attributes: ['id', 'nome', 'email'],
            required: false
          }
        ]
      })

      if (!agendamento) {
        return res.status(404).json({ errors: ['Agendamento não encontrado'] })
      }

      return res.json(agendamento)
    } catch (err) {
      return res.status(500).json({ errors: [err.message] })
    }
  }

  async update(req, res) {
    try {
      const agendamento = await Agendamento.findByPk(req.params.id)

      if (!agendamento) {
        return res.status(400).json({ errors: ['Agendamento não existe'] })
      }

      // Garantir que o agendamento tenha veterinário após a atualização
      // Se o cliente forneceu um novo veterinario_id, valide sua existência;
      // caso contrário, certifique-se de que já existe um veterinario_id no agendamento
      if (req.body.veterinario_id) {
        const vet = await Veterinario.findByPk(req.body.veterinario_id)
        if (!vet) {
          return res.status(400).json({ errors: ['Veterinário não encontrado'] })
        }
      } else if (!agendamento.veterinario_id) {
        return res.status(400).json({ errors: ['Veterinário é obrigatório'] })
      }

      const agendamentoAtualizado = await agendamento.update(req.body)

      return res.json({
        id: agendamentoAtualizado.id,
        servico: agendamentoAtualizado.servico,
        data_hora: agendamentoAtualizado.data_hora,
        pet_id: agendamentoAtualizado.pet_id,
        veterinario_id: agendamentoAtualizado.veterinario_id,
        observacoes: agendamentoAtualizado.observacoes,
        status: agendamentoAtualizado.status
      })
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ errors: err.errors.map(e => e.message) })
      }
      return res.status(400).json({ errors: [err.message] })
    }
  }

  async delete(req, res) {
    try {
      const agendamento = await Agendamento.findByPk(req.params.id)

      if (!agendamento) {
        return res.status(400).json({ errors: ['Agendamento não existe'] })
      }

      await agendamento.destroy()
      return res.json(null)
    } catch (err) {
      return res.status(400).json({ errors: [err.message] })
    }
  }
}

export default new AgendamentoController()
