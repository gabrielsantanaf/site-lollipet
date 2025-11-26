import multer from 'multer'
import fs from 'fs'
import { resolve } from 'path'
import multerProntuarioConfig from '../config/multerProntuarioConfig.js'
import Prontuario from '../models/Prontuario.js'
import ProntuarioArquivo from '../models/ProntuarioArquivo.js'

const upload = multer(multerProntuarioConfig).single('arquivo')

class ProntuarioArquivoController {
  uploadFile(req, res) {
    return upload(req, res, async (err) => {
      if (err) {
        console.log('Erro do multer (prontuario):', err)
        return res.status(400).json({ errors: [err.message || err.code] })
      }

      if (!req.file) return res.status(400).json({ errors: ['Nenhum arquivo foi enviado'] })

      const prontuarioId = req.params.id
      if (!prontuarioId) return res.status(400).json({ errors: ['prontuario id é obrigatório na url'] })

      try {
        const prontuario = await Prontuario.findByPk(prontuarioId)
        if (!prontuario) return res.status(404).json({ errors: ['Prontuário não encontrado'] })

        const { originalname, filename } = req.file

        const arquivo = await ProntuarioArquivo.create({ prontuario_id: prontuarioId, nome: originalname, filename })

        return res.json({ id: arquivo.id, nome: arquivo.nome, url: arquivo.url })
      } catch (error) {
        console.log('Erro ao salvar arquivo do prontuário:', error)
        // tentar remover arquivo salvo em disco em caso de erro
        try {
          const filePath = resolve(__dirname, '..', '..', 'uploads', 'files', req.file.filename)
          fs.unlinkSync(filePath)
        } catch (e) {
          console.log(e)
        }
        return res.status(500).json({ errors: [error.message] })
      }
    })
  }

  async list(req, res) {
    try {
      const { id } = req.params // id do prontuario
      const prontuario = await Prontuario.findByPk(id, {
        include: [{ association: 'arquivos', attributes: ['id', 'nome', 'filename', 'url'] }]
      })

      if (!prontuario) return res.status(404).json({ errors: ['Prontuário não encontrado'] })

      return res.json(prontuario.arquivos || [])
    } catch (err) {
      return res.status(500).json({ errors: [err.message] })
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params // id do arquivo
      const arquivo = await ProntuarioArquivo.findByPk(id)
      if (!arquivo) return res.status(404).json({ errors: ['Arquivo não encontrado'] })

      // remover do disco
      try {
        const filePath = resolve(__dirname, '..', '..', 'uploads', 'files', arquivo.filename)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      } catch (e) {
        console.log('Erro ao remover arquivo do disco:', e.message)
      }

      await arquivo.destroy()
      return res.json(null)
    } catch (err) {
      return res.status(400).json({ errors: [err.message] })
    }
  }

  async download(req, res) {
    try {
      const { id } = req.params // id do arquivo
      const arquivo = await ProntuarioArquivo.findByPk(id)
      if (!arquivo) return res.status(404).json({ errors: ['Arquivo não encontrado'] })

      const filePath = resolve(__dirname, '..', '..', 'uploads', 'files', arquivo.filename)
      if (!fs.existsSync(filePath)) return res.status(404).json({ errors: ['Arquivo não encontrado no disco'] })

      return res.download(filePath, arquivo.nome)
    } catch (err) {
      return res.status(500).json({ errors: [err.message] })
    }
  }
}

export default new ProntuarioArquivoController()
