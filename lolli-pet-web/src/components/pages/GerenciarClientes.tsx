import { useState, useEffect } from 'react';
import { Users, Edit, Trash2, User, Mail, Phone, X, Save, ChevronDown, ChevronUp, Plus, PawPrint } from 'lucide-react';
import { listarClientes, atualizarCliente, deletarCliente, cadastrarPet, atualizarPet, deletarPet } from '../../services/api';
import type { Cliente, ApiError, Pet, CriarPetData } from '../../services/api';

export function GerenciarClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editandoClienteId, setEditandoClienteId] = useState<number | null>(null);
  const [clienteExpandido, setClienteExpandido] = useState<number | null>(null);
  const [formDataCliente, setFormDataCliente] = useState({ nome: '', email: '', telefone: '' });

  // Pet management state
  const [editandoPetId, setEditandoPetId] = useState<number | null>(null);
  const [adicionandoPetParaCliente, setAdicionandoPetParaCliente] = useState<number | null>(null);
  const [formDataPet, setFormDataPet] = useState({ nome: '', especie: '', raca: '' });

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

  // ========================================
  // CLIENTE MANAGEMENT
  // ========================================

  const handleEditCliente = (cliente: Cliente) => {
    setEditandoClienteId(cliente.id);
    setFormDataCliente({
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone || '',
    });
  };

  const handleCancelEditCliente = () => {
    setEditandoClienteId(null);
    setFormDataCliente({ nome: '', email: '', telefone: '' });
  };

  const handleSaveEditCliente = async (id: number) => {
    try {
      const atualizado = await atualizarCliente(id, formDataCliente);
      setClientes(prev => prev.map(c => c.id === id ? { ...atualizado, pets: c.pets } : c));
      setEditandoClienteId(null);
      setFormDataCliente({ nome: '', email: '', telefone: '' });
      alert('Cliente atualizado com sucesso!');
    } catch (err) {
      console.error('[GerenciarClientes] Erro ao atualizar cliente:', err);
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao atualizar cliente.');
    }
  };

  const handleDeleteCliente = async (id: number, nome: string) => {
    const confirmacao = globalThis.confirm(
      `Tem certeza que deseja deletar o cliente "${nome}"?\n\nEsta ação também deletará todos os pets, agendamentos e prontuários associados.\n\nEsta ação não pode ser desfeita.`
    );

    if (confirmacao) {
      try {
        await deletarCliente(id);
        setClientes(prev => prev.filter(c => c.id !== id));
        alert(`Cliente "${nome}" e todos os dados associados foram deletados com sucesso!`);
      } catch (err) {
        console.error('[GerenciarClientes] Erro ao deletar cliente:', err);
        const apiError = err as ApiError;
        alert(apiError.message || 'Erro ao deletar cliente.');
      }
    }
  };

  const toggleClienteExpandido = (clienteId: number) => {
    setClienteExpandido(prev => prev === clienteId ? null : clienteId);
  };

  // ========================================
  // PET MANAGEMENT
  // ========================================

  const handleAdicionarPet = (clienteId: number) => {
    setAdicionandoPetParaCliente(clienteId);
    setFormDataPet({ nome: '', especie: '', raca: '' });
  };

  const handleCancelAdicionarPet = () => {
    setAdicionandoPetParaCliente(null);
    setFormDataPet({ nome: '', especie: '', raca: '' });
  };

  const handleSaveNovoPet = async (clienteId: number) => {
    if (!formDataPet.nome.trim()) {
      alert('O nome do pet é obrigatório!');
      return;
    }

    try {
      const petData: CriarPetData = {
        ...formDataPet,
        cliente_id: clienteId
      };
      const novoPet = await cadastrarPet(petData);

      setClientes(prev => prev.map(c =>
        c.id === clienteId
          ? { ...c, pets: [...(c.pets || []), novoPet] }
          : c
      ));

      setAdicionandoPetParaCliente(null);
      setFormDataPet({ nome: '', especie: '', raca: '' });
      alert('Pet adicionado com sucesso!');
    } catch (err) {
      console.error('[GerenciarClientes] Erro ao adicionar pet:', err);
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao adicionar pet.');
    }
  };

  const handleEditPet = (pet: Pet) => {
    setEditandoPetId(pet.id);
    setFormDataPet({
      nome: pet.nome,
      especie: pet.especie || '',
      raca: pet.raca || '',
    });
  };

  const handleCancelEditPet = () => {
    setEditandoPetId(null);
    setFormDataPet({ nome: '', especie: '', raca: '' });
  };

  const handleSaveEditPet = async (petId: number, clienteId: number) => {
    try {
      const petAtualizado = await atualizarPet(petId, formDataPet);

      setClientes(prev => prev.map(c =>
        c.id === clienteId
          ? { ...c, pets: c.pets?.map(p => p.id === petId ? petAtualizado : p) }
          : c
      ));

      setEditandoPetId(null);
      setFormDataPet({ nome: '', especie: '', raca: '' });
      alert('Pet atualizado com sucesso!');
    } catch (err) {
      console.error('[GerenciarClientes] Erro ao atualizar pet:', err);
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao atualizar pet.');
    }
  };

  const handleDeletePet = async (petId: number, petNome: string, clienteId: number) => {
    const confirmacao = globalThis.confirm(
      `Tem certeza que deseja deletar o pet "${petNome}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (confirmacao) {
      try {
        await deletarPet(petId);

        setClientes(prev => prev.map(c =>
          c.id === clienteId
            ? { ...c, pets: c.pets?.filter(p => p.id !== petId) }
            : c
        ));

        alert(`Pet "${petNome}" deletado com sucesso!`);
      } catch (err) {
        console.error('[GerenciarClientes] Erro ao deletar pet:', err);
        const apiError = err as ApiError;
        alert(apiError.message || 'Erro ao deletar pet.');
      }
    }
  };

  // ========================================
  // RENDER
  // ========================================

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
          Gerenciar Clientes e Pets
        </h1>
        <p className='text-center text-gray-500 dark:text-gray-400 mb-8 font-semibold'>
          Visualize, edite ou remova clientes e seus pets
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
                {editandoClienteId === cliente.id ? (
                  // Modo de edição do cliente
                  <div className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                          <User size={16} className='inline mr-1' /> Nome
                        </label>
                        <input
                          type='text'
                          value={formDataCliente.nome}
                          onChange={e => setFormDataCliente({ ...formDataCliente, nome: e.target.value })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-pink-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                          <Mail size={16} className='inline mr-1' /> Email
                        </label>
                        <input
                          type='email'
                          value={formDataCliente.email}
                          onChange={e => setFormDataCliente({ ...formDataCliente, email: e.target.value })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-pink-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                          <Phone size={16} className='inline mr-1' /> Telefone
                        </label>
                        <input
                          type='tel'
                          value={formDataCliente.telefone}
                          onChange={e => setFormDataCliente({ ...formDataCliente, telefone: e.target.value })}
                          className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-pink-500'
                        />
                      </div>
                    </div>
                    <div className='flex gap-2 justify-end'>
                      <button
                        onClick={() => handleSaveEditCliente(cliente.id)}
                        className='px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition flex items-center gap-2'
                      >
                        <Save size={16} /> Salvar
                      </button>
                      <button
                        onClick={handleCancelEditCliente}
                        className='px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-700 transition flex items-center gap-2'
                      >
                        <X size={16} /> Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo de visualização do cliente
                  <>
                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-3'>
                          <h3 className='text-xl font-bold text-gray-800 dark:text-gray-200'>
                            {cliente.nome}
                          </h3>
                          {cliente.pets && cliente.pets.length > 0 && (
                            <span className='px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full flex items-center gap-1'>
                              <PawPrint size={12} />
                              {cliente.pets.length} {cliente.pets.length === 1 ? 'pet' : 'pets'}
                            </span>
                          )}
                        </div>
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
                          onClick={() => toggleClienteExpandido(cliente.id)}
                          className='px-4 py-2 bg-purple-500 dark:bg-purple-600 text-white font-bold rounded-md hover:bg-purple-600 dark:hover:bg-purple-700 transition flex items-center gap-2'
                          title='Ver pets'
                        >
                          <PawPrint size={16} />
                          {clienteExpandido === cliente.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <button
                          onClick={() => handleEditCliente(cliente)}
                          className='px-4 py-2 bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-gray-50 font-bold rounded-md hover:bg-yellow-500 dark:hover:bg-yellow-700 transition flex items-center gap-2'
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCliente(cliente.id, cliente.nome)}
                          className='px-4 py-2 bg-red-500 dark:bg-red-600 text-white font-bold rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center gap-2'
                        >
                          <Trash2 size={16} /> Deletar
                        </button>
                      </div>
                    </div>

                    {/* Seção de Pets (expandível) */}
                    {clienteExpandido === cliente.id && (
                      <div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
                        <div className='flex justify-between items-center mb-4'>
                          <h4 className='text-lg font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                            <PawPrint size={18} className='text-purple-500' />
                            Pets de {cliente.nome}
                          </h4>
                          <button
                            onClick={() => handleAdicionarPet(cliente.id)}
                            className='px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-sm font-bold rounded-md hover:bg-green-600 dark:hover:bg-green-700 transition flex items-center gap-2'
                          >
                            <Plus size={14} /> Adicionar Pet
                          </button>
                        </div>

                        {/* Formulário de adicionar novo pet */}
                        {adicionandoPetParaCliente === cliente.id && (
                          <div className='mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg'>
                            <h5 className='font-semibold text-green-800 dark:text-green-300 mb-3'>Novo Pet</h5>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                              <div>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                                  Nome *
                                </label>
                                <input
                                  type='text'
                                  value={formDataPet.nome}
                                  onChange={e => setFormDataPet({ ...formDataPet, nome: e.target.value })}
                                  className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-green-500'
                                  placeholder='Ex: Rex'
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                                  Espécie
                                </label>
                                <input
                                  type='text'
                                  value={formDataPet.especie}
                                  onChange={e => setFormDataPet({ ...formDataPet, especie: e.target.value })}
                                  className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-green-500'
                                  placeholder='Ex: Cachorro'
                                />
                              </div>
                              <div>
                                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                                  Raça
                                </label>
                                <input
                                  type='text'
                                  value={formDataPet.raca}
                                  onChange={e => setFormDataPet({ ...formDataPet, raca: e.target.value })}
                                  className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-green-500'
                                  placeholder='Ex: Labrador'
                                />
                              </div>
                            </div>
                            <div className='flex gap-2 mt-3'>
                              <button
                                onClick={() => handleSaveNovoPet(cliente.id)}
                                className='px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition flex items-center gap-1'
                              >
                                <Save size={14} /> Salvar
                              </button>
                              <button
                                onClick={handleCancelAdicionarPet}
                                className='px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition flex items-center gap-1'
                              >
                                <X size={14} /> Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Lista de pets */}
                        {!cliente.pets || cliente.pets.length === 0 ? (
                          <p className='text-sm text-gray-500 dark:text-gray-400 italic'>
                            Nenhum pet cadastrado para este cliente.
                          </p>
                        ) : (
                          <div className='space-y-3'>
                            {cliente.pets.map(pet => (
                              <div
                                key={pet.id}
                                className='p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg'
                              >
                                {editandoPetId === pet.id ? (
                                  // Modo de edição do pet
                                  <div>
                                    <h5 className='font-semibold text-yellow-700 dark:text-yellow-400 mb-3 text-sm'>Editando Pet</h5>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                                      <div>
                                        <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                                          Nome
                                        </label>
                                        <input
                                          type='text'
                                          value={formDataPet.nome}
                                          onChange={e => setFormDataPet({ ...formDataPet, nome: e.target.value })}
                                          className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-yellow-500'
                                        />
                                      </div>
                                      <div>
                                        <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                                          Espécie
                                        </label>
                                        <input
                                          type='text'
                                          value={formDataPet.especie}
                                          onChange={e => setFormDataPet({ ...formDataPet, especie: e.target.value })}
                                          className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-yellow-500'
                                        />
                                      </div>
                                      <div>
                                        <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1'>
                                          Raça
                                        </label>
                                        <input
                                          type='text'
                                          value={formDataPet.raca}
                                          onChange={e => setFormDataPet({ ...formDataPet, raca: e.target.value })}
                                          className='w-full p-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-yellow-500'
                                        />
                                      </div>
                                    </div>
                                    <div className='flex gap-2 mt-3'>
                                      <button
                                        onClick={() => handleSaveEditPet(pet.id, cliente.id)}
                                        className='px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition flex items-center gap-1'
                                      >
                                        <Save size={14} /> Salvar
                                      </button>
                                      <button
                                        onClick={handleCancelEditPet}
                                        className='px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition flex items-center gap-1'
                                      >
                                        <X size={14} /> Cancelar
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Modo de visualização do pet
                                  <div className='flex justify-between items-center'>
                                    <div className='flex-1'>
                                      <h5 className='font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2'>
                                        <PawPrint size={14} className='text-purple-500' />
                                        {pet.nome}
                                      </h5>
                                      <div className='text-xs text-gray-600 dark:text-gray-400 mt-1 space-y-0.5'>
                                        {pet.especie && <p>Espécie: {pet.especie}</p>}
                                        {pet.raca && <p>Raça: {pet.raca}</p>}
                                        <p className='text-gray-400'>ID: {pet.id}</p>
                                      </div>
                                    </div>
                                    <div className='flex gap-2'>
                                      <button
                                        onClick={() => handleEditPet(pet)}
                                        className='px-3 py-1 bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-gray-50 text-sm font-bold rounded hover:bg-yellow-500 dark:hover:bg-yellow-700 transition flex items-center gap-1'
                                      >
                                        <Edit size={14} /> Editar
                                      </button>
                                      <button
                                        onClick={() => handleDeletePet(pet.id, pet.nome, cliente.id)}
                                        className='px-3 py-1 bg-red-500 dark:bg-red-600 text-white text-sm font-bold rounded hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center gap-1'
                                      >
                                        <Trash2 size={14} /> Deletar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
