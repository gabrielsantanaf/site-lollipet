import {
  ClipboardList,
  Search,
  Edit,
  FileText,
  User,
  PawPrint,
  Calendar,
  Paperclip,
  PlusCircle,
  X,
  Send,
  Loader,
  Trash2,
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import {
  listarPets,
  listarProntuarios,
  criarProntuario,
  atualizarProntuario,
  deletarProntuario,
  uploadArquivoProntuario,
  deletarArquivoProntuario,
  listarVeterinarios,
} from '../../services/api';
import type { Pet, Prontuario, ApiError, ProntuarioArquivo, Veterinario } from '../../services/api';

// --- TIPOS ---

const TIPOS_ATENDIMENTO = ['Consulta', 'Exame', 'Vacina', 'Banho', 'Tosa', 'Outro'] as const;
type TipoAtendimento = typeof TIPOS_ATENDIMENTO[number];

// --- MODAL ADICIONAR/EDITAR HISTÓRICO ---

// ---  ADICIONAR HISTÓRICO ---

interface AdicionarHistoricoModalProps {
  pet: Pet;
  entrada?: Prontuario | null;
  onClose: () => void;
  onSave: () => void;
}

const HistoricoModal: React.FC<HistoricoModalProps> = ({
  pet,
  entrada,
  onClose,
  onSave,
}) => {
  const isEditing = !!entrada;
  const [data, setData] = useState(
    entrada ? new Date(entrada.data).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10)
  );
  const [tipo, setTipo] = useState<TipoAtendimento>(entrada?.tipo || 'Consulta');
  const [descricao, setDescricao] = useState(entrada?.descricao || '');
  const [responsavel, setResponsavel] = useState(entrada?.responsavel || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [isLoadingVets, setIsLoadingVets] = useState(true);

  // Carrega lista de veterinários ao montar modal
  useEffect(() => {
    const fetchVeterinarios = async () => {
      try {
        const data = await listarVeterinarios();
        setVeterinarios(data);
      } catch (err) {
        console.error('[HistoricoModal] Erro ao carregar veterinários:', err);
      } finally {
        setIsLoadingVets(false);
      }
    };

    fetchVeterinarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !responsavel) {
      setError('Preencha a descrição e o responsável.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (isEditing && entrada) {
        await atualizarProntuario(entrada.id, {
          data,
          tipo,
          descricao,
          responsavel,
        });
      } else {
        await criarProntuario({
          pet_id: pet.id,
          data,
          tipo,
          descricao,
          responsavel,
        });
      }
      onSave();
      onClose();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center backdrop-blur-sm'>
      <div className='bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border-t-4 border-pink-500'>
        <div className='flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4'>
          <h3 className='text-xl font-bold text-pink-700 dark:text-pink-400 flex items-center gap-2'>
            <FileText size={20} /> {isEditing ? 'Editar' : 'Novo'} Atendimento - {pet.nome}
          </h3>
          <button
            onClick={onClose}
            className='p-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition'
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className='p-3 mb-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 rounded'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='data' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Data
              </label>
              <input
                id='data'
                type='date'
                value={data}
                onChange={e => setData(e.target.value)}
                required
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg'
              />
            </div>
            <div>
              <label htmlFor='tipo' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                Tipo de Serviço
              </label>
              <select
                id='tipo'
                value={tipo}
                onChange={e => setTipo(e.target.value as TipoAtendimento)}
                required
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg'
              >
                {TIPOS_ATENDIMENTO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor='responsavel' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Veterinário / Responsável
            </label>
            {isLoadingVets ? (
              <p className='text-gray-500 dark:text-gray-400 text-sm'>Carregando veterinários...</p>
            ) : veterinarios.length === 0 ? (
              <input
                id='responsavel'
                type='text'
                value={responsavel}
                onChange={e => setResponsavel(e.target.value)}
                required
                placeholder='Nome do profissional'
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg'
              />
            ) : (
              <select
                id='responsavel'
                value={responsavel}
                onChange={e => setResponsavel(e.target.value)}
                required
                className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg'
              >
                <option value=''>Selecione um veterinário...</option>
                {veterinarios.map(vet => (
                  <option key={vet.id} value={vet.nome}>
                    {vet.nome}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label htmlFor='descricao' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
              Descrição Detalhada
            </label>
            <textarea
              id='descricao'
              rows={4}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              required
              placeholder='Diagnóstico, procedimentos, medicamentos...'
              className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg'
            />
          </div>

          <div className='flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700'>
            <button
              type='button'
              onClick={onClose}
              className='p-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition'
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='p-2 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-50'
              disabled={isSaving}
            >
              {isSaving ? <><Loader size={20} className='animate-spin' /> Salvando...</> : <><Send size={20} /> Salvar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENTE DETALHES DO PRONTUÁRIO ---

interface ProntuarioDetalhesProps {
  pet: Pet;
  onClose: () => void;
}

const ProntuarioDetalhes: React.FC<ProntuarioDetalhesProps> = ({ pet, onClose }) => {
  const [historico, setHistorico] = useState<Prontuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Prontuario | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistorico = async () => {
    try {
      const data = await listarProntuarios(pet.id);
      // Ordena por data decrescente
      const sorted = data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setHistorico(sorted);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar histórico.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorico();
  }, [pet.id]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) return;

    try {
      await deletarProntuario(id);
      setHistorico(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao excluir.');
    }
  };

  const handleEdit = (entry: Prontuario) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };

  const handleFileUpload = async (prontuarioId: number, file: File) => {
    try {
      setUploadingFor(prontuarioId);
      const novoArquivo = await uploadArquivoProntuario(prontuarioId, file);
      setHistorico(prev => prev.map(h =>
        h.id === prontuarioId
          ? { ...h, arquivos: [...h.arquivos, novoArquivo] }
          : h
      ));
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao fazer upload.');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDeleteFile = async (prontuarioId: number, arquivoId: number) => {
    if (!confirm('Excluir este arquivo?')) return;

    try {
      await deletarArquivoProntuario(arquivoId);
      setHistorico(prev => prev.map(h =>
        h.id === prontuarioId
          ? { ...h, arquivos: h.arquivos.filter(a => a.id !== arquivoId) }
          : h
      ));
    } catch (err) {
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao excluir arquivo.');
    }
  };

  return (
    <div className='mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-pink-500 dark:border-pink-600'>
      <div className='flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-3 mb-4'>
        <h2 className='text-2xl font-bold text-pink-700 dark:text-pink-400 flex items-center gap-2'>
          <FileText size={24} /> Prontuário de {pet.nome}
        </h2>
        <button
          onClick={onClose}
          className='p-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-semibold'
        >
          Fechar
        </button>
      </div>

      {/* Informações do Pet */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 pb-4 border-b border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'>
        <p><strong>ID:</strong> {pet.id}</p>
        <p><strong>Espécie:</strong> {pet.especie || '-'}</p>
        <p><strong>Raça:</strong> {pet.raca || '-'}</p>
        <p><strong>Cliente:</strong> {pet.cliente?.nome || '-'}</p>
      </div>

      {/* Histórico */}
      <h3 className='text-xl font-bold text-cyan-700 dark:text-cyan-400 mb-3 flex items-center gap-2'>
        <Calendar size={20} /> Histórico de Atendimentos
      </h3>

      {isLoading ? (
        <p className='text-center text-gray-500 dark:text-gray-400 py-8'>Carregando histórico...</p>
      ) : error ? (
        <p className='text-center text-red-500 py-8'>{error}</p>
      ) : (
        <div className='space-y-4'>
          {historico.map(entry => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg shadow-sm border-l-4 ${
                entry.tipo === 'Banho' || entry.tipo === 'Tosa'
                  ? 'border-pink-300 bg-pink-50 dark:border-pink-700 dark:bg-gray-700/50'
                  : 'border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-gray-700/50'
              }`}
            >
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs font-semibold uppercase text-gray-600 dark:text-gray-300'>
                  {new Date(entry.data).toLocaleDateString('pt-BR')}
                </span>
                <div className='flex items-center gap-2'>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    entry.tipo === 'Banho' || entry.tipo === 'Tosa'
                      ? 'bg-pink-200 text-pink-800'
                      : 'bg-cyan-200 text-cyan-800'
                  }`}>
                    {entry.tipo}
                  </span>
                  <button onClick={() => handleEdit(entry)} className='p-1 text-yellow-600 hover:text-yellow-700'>
                    <Edit size={14} />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className='p-1 text-red-500 hover:text-red-600'>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className='text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1'>
                {entry.descricao}
              </p>
              <p className='text-xs italic text-gray-500 dark:text-gray-400'>
                Responsável: {entry.responsavel}
              </p>

              {/* Arquivos */}
              {entry.arquivos.length > 0 && (
                <div className='mt-2 border-t border-gray-100 dark:border-gray-600 pt-2'>
                  <p className='text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1'>
                    <Paperclip size={14} /> Anexos:
                  </p>
                  <div className='flex flex-wrap gap-2 mt-1'>
                    {entry.arquivos.map(file => (
                      <div key={file.id} className='flex items-center gap-1'>
                        <a
                          href={file.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-full hover:bg-yellow-200'
                        >
                          {file.nome}
                        </a>
                        <button
                          onClick={() => handleDeleteFile(entry.id, file.id)}
                          className='text-red-500 hover:text-red-600'
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload de arquivo */}
              <div className='mt-2'>
                <input
                  type='file'
                  ref={fileInputRef}
                  className='hidden'
                  accept='image/*,.pdf'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(entry.id, file);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setUploadingFor(entry.id);
                    fileInputRef.current?.click();
                  }}
                  disabled={uploadingFor === entry.id}
                  className='text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 disabled:opacity-50'
                >
                  {uploadingFor === entry.id ? (
                    <><Loader size={12} className='animate-spin' /> Enviando...</>
                  ) : (
                    <><Paperclip size={12} /> Anexar arquivo</>
                  )}
                </button>
              </div>
            </div>
          ))}

          {historico.length === 0 && (
            <p className='text-center text-gray-500 dark:text-gray-400 italic p-4 border border-dashed rounded-lg dark:border-gray-600'>
              Nenhum histórico de atendimentos registrado.
            </p>
          )}
        </div>
      )}

      {/* Botão adicionar */}
      <div className='mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center'>
        <button
          onClick={() => {
            setEditingEntry(null);
            setModalOpen(true);
          }}
          className='p-3 bg-cyan-500 dark:bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-600 dark:hover:bg-cyan-700 transition flex items-center justify-center gap-2 mx-auto'
        >
          <PlusCircle size={20} /> Adicionar Novo Atendimento
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <HistoricoModal
          pet={pet}
          entrada={editingEntry}
          onClose={() => {
            setModalOpen(false);
            setEditingEntry(null);
          }}
          onSave={fetchHistorico}
        />
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function Prontuario() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const data = await listarPets();
        setPets(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Erro ao carregar pets.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, []);

  const filteredPets = pets.filter(
    pet =>
      pet.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.cliente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(pet.id).includes(searchTerm)
  );

  return (
    <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] flex justify-center items-start transition-colors duration-500'>
      <div className='container max-w-5xl w-full'>
        <h1 className='text-3xl font-extrabold text-center text-pink-600 dark:text-pink-400 mb-6 border-b-2 border-yellow-400 dark:border-yellow-600 pb-2 flex items-center justify-center gap-2'>
          <ClipboardList size={30} />
          Gerenciamento de Prontuários
        </h1>
        <p className='text-center text-gray-500 dark:text-gray-400 mb-8'>
          Busque um pet para visualizar ou editar seu histórico de atendimentos.
        </p>

        {/* Lista de Pets */}
        <section className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-cyan-500 ${selectedPet ? 'mb-4' : 'mb-8'}`}>
          <h2 className='text-2xl font-bold text-cyan-700 dark:text-cyan-400 mb-4 flex items-center gap-2 border-b border-cyan-100 dark:border-gray-700 pb-2'>
            <PawPrint size={24} /> Listagem de Pets
          </h2>

          {/* Busca */}
          <div className='mb-6 relative'>
            <input
              type='text'
              placeholder='Buscar por Nome do Pet, Nome do Cliente ou ID...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full p-3 pl-10 border-2 border-cyan-300 dark:border-cyan-700 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:border-cyan-500'
              disabled={!!selectedPet || isLoading}
            />
            <Search size={20} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-500 dark:text-cyan-400' />
          </div>

          {/* Tabela */}
          <div className='overflow-x-auto shadow-md rounded-lg border border-gray-100 dark:border-gray-700'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
              <thead className='bg-cyan-50 dark:bg-gray-700'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>Pet / Cliente</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase hidden sm:table-cell'>Espécie / Raça</th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase'>Ações</th>
                </tr>
              </thead>
              <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                {isLoading && (
                  <tr>
                    <td colSpan={3} className='px-6 py-8 text-center text-cyan-600 dark:text-cyan-400'>
                      <div className='flex items-center justify-center gap-3'>
                        <Loader className='animate-spin' size={20} />
                        Carregando pets...
                      </div>
                    </td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td colSpan={3} className='px-6 py-8 text-center text-red-600 dark:text-red-400'>
                      {error}
                    </td>
                  </tr>
                )}

                {!isLoading && !error && filteredPets.map(pet => (
                  <tr key={pet.id} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100'>
                      <div className='flex items-center gap-2'>
                        <PawPrint size={16} className='text-pink-500' />
                        <div>
                          <div className='font-bold'>
                            {pet.nome}{' '}
                            <span className='text-xs text-gray-500 dark:text-gray-400'>({pet.id})</span>
                          </div>
                          <div className='text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1'>
                            <User size={12} /> {pet.cliente?.nome || 'Sem cliente'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden sm:table-cell'>
                      {pet.especie || '-'} {pet.raca && `(${pet.raca})`}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center text-sm font-medium'>
                      <button
                        onClick={() => setSelectedPet(pet)}
                        className='p-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition flex items-center justify-center gap-1 text-xs sm:text-sm mx-auto disabled:bg-pink-700'
                        disabled={selectedPet?.id === pet.id}
                      >
                        <FileText size={16} /> Prontuário
                      </button>
                    </td>
                  </tr>
                ))}

                {!isLoading && !error && filteredPets.length === 0 && (
                  <tr>
                    <td colSpan={3} className='px-6 py-4 text-center text-gray-500 dark:text-gray-400 italic'>
                      {searchTerm ? 'Nenhum pet encontrado.' : 'Nenhum pet cadastrado.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Prontuário Detalhado */}
        {selectedPet && (
          <ProntuarioDetalhes
            pet={selectedPet}
            onClose={() => setSelectedPet(null)}
          />
        )}
      </div>
    </div>
  );
}
