import Cliente from '../models/Cliente.js'
import Pet from '../models/Pet.js'
import Agendamento from '../models/Agendamento.js'
import Prontuario from '../models/Prontuario.js'
import ProntuarioArquivo from '../models/ProntuarioArquivo.js'

class ClienteController {
    async store(req, res) {
        try {
            const { id, nome, email, telefone } = await Cliente.create(req.body)

            return res.json({ id, nome, email, telefone })
        } catch (err) {
            if (err.errors) {
                return res.status(400).json({ errors: err.errors.map(e => e.message) })
            }
            return res.status(400).json({ errors: [err.message] })
        }
    }

    async index(req, res) {
        try {
            const clientes = await Cliente.findAll({
                attributes: ['id', 'nome', 'email', 'telefone'],
                include: [{
                    association: 'pets',
                    attributes: ['id', 'nome', 'especie', 'raca']
                }],
                order: [['nome', 'ASC']]
            })

            return res.json(clientes)
        } catch (err) {
            return res.status(500).json({ errors: [err.message] })
        }
    }

    async show(req, res) {
        try {
            const cliente = await Cliente.findByPk(req.params.id)

            if (!cliente) {
                return res.status(404).json({ errors: ['Cliente não encontrado'] })
            }

            const { id, nome, email, telefone } = cliente
            return res.json({ id, nome, email, telefone })
        } catch (err) {
            return res.status(500).json({ errors: [err.message] })
        }
    }

    async update(req, res) {
        try {
            const cliente = await Cliente.findByPk(req.params.id)

            if (!cliente) {
                return res.status(400).json({ errors: ['Cliente não existe.'] })
            }

            const { id, nome, email, telefone } = await cliente.update(req.body)

            return res.json({ id, nome, email, telefone })
        } catch (err) {
            if (err.errors) {
                return res.status(400).json({ errors: err.errors.map(e => e.message) })
            }
            return res.status(400).json({ errors: [err.message] })
        }
    }

    async delete(req, res) {
        try {
            const cliente = await Cliente.findByPk(req.params.id)

            if (!cliente) {
                return res.status(400).json({ errors: ['Cliente não existe.'] })
            }

            // Buscar todos os pets do cliente
            const pets = await Pet.findAll({ where: { cliente_id: cliente.id } })
            const petIds = pets.map(pet => pet.id)

            console.log(`[ClienteController] Deletando cliente ${cliente.id} e ${petIds.length} pets`)

            if (petIds.length > 0) {
                // Buscar todos os prontuários dos pets
                const prontuarios = await Prontuario.findAll({ where: { pet_id: petIds } })
                const prontuarioIds = prontuarios.map(p => p.id)

                console.log(`[ClienteController] Deletando ${prontuarioIds.length} prontuários`)

                // Deletar arquivos de prontuários
                if (prontuarioIds.length > 0) {
                    await ProntuarioArquivo.destroy({ where: { prontuario_id: prontuarioIds } })
                }

                // Deletar prontuários
                await Prontuario.destroy({ where: { pet_id: petIds } })

                // Deletar agendamentos
                const agendamentosCount = await Agendamento.destroy({ where: { pet_id: petIds } })
                console.log(`[ClienteController] Deletados ${agendamentosCount} agendamentos`)

                // Deletar pets
                await Pet.destroy({ where: { cliente_id: cliente.id } })
            }

            // Deletar cliente
            await cliente.destroy()

            console.log(`[ClienteController] Cliente ${cliente.id} deletado com sucesso`)
            return res.json(null)
        } catch (err) {
            console.error('[ClienteController] Erro ao deletar:', err)
            return res.status(400).json({ errors: [err.message] })
        }
    }
}

export default new ClienteController()
