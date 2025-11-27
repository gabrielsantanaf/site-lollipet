import Cliente from '../models/Cliente.js'

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
            const clientes = await Cliente.findAll({ attributes: ['id', 'nome', 'email', 'telefone'] })

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

            await cliente.destroy()

            return res.json(null)
        } catch (err) {
            return res.status(400).json({ errors: [err.message] })
        }
    }
}

export default new ClienteController()
