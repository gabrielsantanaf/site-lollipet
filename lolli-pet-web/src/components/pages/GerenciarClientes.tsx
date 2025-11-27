import { useState, useEffect } from 'react';
import { Users, Edit, Trash2, User, Mail, Phone, X, Save } from 'lucide-react';
import { listarClientes, atualizarCliente, deletarCliente } from '../../services/api';
import type { Cliente, ApiError } from '../../services/api';

export function GerenciarClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ nome: '', email: '', telefone: '' });

  // Carregar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await listarClientes();
        setClientes(data);
      } catch (err) {
        console.error('[GerenciarClientes] Erro ao carregar clientes:', err);
        const apiError = err as ApiError;
        setError(apiError.message || 'Erro ao carregar clientes.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientes();
  }, []);

  // Iniciar edição
  const handleEdit = (cliente: Cliente) => {
    setEditandoId(cliente.id);
    setFormData({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || '',
    });
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditandoId(null);
    setFormData({ nome: '', email: '', telefone: '' });
  };

  // Salvar edição
  const handleSaveEdit = async (id: number) => {
    try {
      const atualizado = await atualizarCliente(id, formData);
      setClientes(prev => prev.map(c => c.id === id ? atualizado : c));
      setEditandoId(null);
      setFormData({ nome: '', email: '', telefone: '' });
      alert('Cliente atualizado com sucesso!');
    } catch (err) {
      console.error('[GerenciarClientes] Erro ao atualizar:', err);
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao atualizar cliente.');
    }
  };

  // Deletar cliente
  const handleDelete = async (id: number, nome: string) => {
    const confirmacao = globalThis.confirm(
      `Tem certeza que deseja deletar o cliente "${nome}"? Esta ação não pode ser desfeita.`
    );

    if (confirmacao) {
      try {
        await deletarCliente(id);
        setClientes(prev => prev.filter(c => c.id !== id));
        alert(`Cliente "${nome}" deletado com sucesso!`);
      } catch (err) {
        console.error('[GerenciarClientes] Erro ao deletar:', err);
        const apiError = err as ApiError;
        alert(apiError.message || 'Erro ao deletar cliente.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] flex justify-center items-center'>
        <p className='text-gray-500 dark:text-gray-400'>Carregando clientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] flex justify-center items-center'>
        <p className='text-red-500'>{error}</p>
      </div>
    );
  }

  return (
    <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] transition-colors duration-500'>
      <div className='container max-w-6xl mx-auto'>
        <h1 className='text-3xl font-extrabold text-center text-pink-600 dark:text-pink-400 mb-6 border-b-2 border-yellow-400 dark:border-yellow-600 pb-2 flex items-center justify-center gap-2'>
          <Users size={30} />
          Gerenciar Clientes
        </h1>
        <p className='text-center text-gray-500 dark:text-gray-400 mb-8 font-semibold'>
          Visualize, edite ou remova clientes cadastrados
        </p>

        {clientes.length === 0 ? (
          <div className='bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center'>
            <p className='text-gray-500 dark:text-gray-400'>Nenhum cliente cadastrado.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {clientes.map(cliente => (
              <div
                key={cliente.id}
                className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-500'
              >
                {editandoId === cliente.id ? (
                  // Modo de edição
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                          <User size={16} className='inline mr-1' /> Nome
                        </label>
                        <input
                          type='text'
                          value={formData.nome}
                          onChange={e => setFormData({ ...formData, nome: e.target.value })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-pink-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                          <Mail size={16} className='inline mr-1' /> Email
                        </label>
                        <input
                          type='email'
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-pink-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                          <Phone size={16} className='inline mr-1' /> Telefone
                        </label>
                        <input
                          type='tel'
                          value={formData.telefone}
                          onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-pink-500'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2 justify-end'>
                      <button
                        onClick={() => handleSaveEdit(cliente.id)}
                        className='px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition flex items-center gap-2'
                      >
                        <Save size={16} /> Salvar
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className='px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition flex items-center gap-2'
                      >
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização
                  <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex-1 space-y-2'>
                      <h3 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
                        {cliente.nome}
                      </h3>
                      <div className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                        <p className='flex items-center gap-2'>
                          <Mail size={14} className='text-pink-500' />
                          {cliente.email}
                        </p>
                        {cliente.telefone && (
                          <p className='flex items-center gap-2'>
                            <Phone size={14} className='text-pink-500' />
                            {cliente.telefone}
                          </p>
                        )}
                        <p className='text-xs text-gray-400'>ID: {cliente.id}</p>
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(cliente)}
                        className='px-4 py-2 bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-gray-50 font-bold rounded-md hover:bg-yellow-500 dark:hover:bg-yellow-700 transition flex items-center gap-2'
                      >
                        <Edit size={16} /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cliente.id, cliente.nome)}
                        className='px-4 py-2 bg-red-500 dark:bg-red-600 text-white font-bold rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center gap-2'
                      >
                        <Trash2 size={16} /> Deletar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
