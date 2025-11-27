import { useState, useEffect } from 'react';
import {
  CalendarDays,
  StethoscopeIcon,
  BathIcon,
  Clock,
  User,
  PawPrint,
  Trash2,
  Edit,
} from 'lucide-react';
import { listarAgendamentos, deletarAgendamento, atualizarAgendamento } from '../../services/api';
import { StatusModal } from '../StatusModal';
import type { Agendamento, ApiError } from '../../services/api';

// --- COMPONENTE INTERNO: AgendamentoCard ---

interface AgendamentoCardProps {
  agendamento: Agendamento;
  tipo: 'clinica' | 'petshop';
  onCancel: (id: number) => void;
  onEdit: (agendamento: Agendamento) => void;
}

const AgendamentoCard: React.FC<AgendamentoCardProps> = ({
  agendamento,
  tipo,
  onCancel,
  onEdit,
}) => {
  const isClinica = tipo === 'clinica';
  const borderClass = isClinica
    ? 'border-cyan-500 dark:border-cyan-600'
    : 'border-pink-500 dark:border-pink-600';
  const accentClass = isClinica
    ? 'text-cyan-600 dark:text-cyan-400'
    : 'text-pink-600 dark:text-pink-400';

  // Formata a hora do agendamento
  const dataHora = new Date(agendamento.data_hora);
  const hora = dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className={`agendamento-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 ${borderClass} transition hover:shadow-lg dark:shadow-gray-700/50`}
    >
      <div className='flex justify-between items-start'>
        <h3
          className={`text-xl font-bold text-gray-800 dark:text-gray-200 ${accentClass}`}
        >
          {isClinica ? 'Consulta Clínica' : 'Serviço Petshop'}
        </h3>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          #{agendamento.id}
        </span>
      </div>

      <p className='mt-2 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300'>
        <Clock size={16} className={accentClass} />
        <span className='font-bold'>Horário:</span> {hora}
      </p>

      <p className='text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300'>
        <User size={16} className='text-gray-500 dark:text-gray-400' />
        <span className='font-bold'>Cliente:</span> {agendamento.pet?.cliente?.nome || 'Não informado'}
      </p>

      <p className='text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300'>
        <PawPrint size={16} className='text-gray-500 dark:text-gray-400' />
        <span className='font-bold'>Pet:</span> {agendamento.pet?.nome || 'Não informado'}
      </p>

      {agendamento.veterinario && (
        <p className='text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300'>
          <StethoscopeIcon
            size={16}
            className='text-gray-500 dark:text-gray-400'
          />
          <span className='font-bold'>Veterinário:</span> {agendamento.veterinario.nome}
        </p>
      )}

      {agendamento.status && (
        <p className='text-sm mt-1'>
          <span className='font-bold'>Status:</span>{' '}
          <span className={`px-2 py-1 rounded text-xs ${
            agendamento.status === 'agendado' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            agendamento.status === 'confirmado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            agendamento.status === 'concluido' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {agendamento.status.charAt(0).toUpperCase() + agendamento.status.slice(1)}
          </span>
        </p>
      )}

      {agendamento.observacoes && (
        <p className='text-xs italic mt-2 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2'>
          Obs: {agendamento.observacoes}
        </p>
      )}

      <div className='flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700'>
        <button
          onClick={() => onEdit(agendamento)}
          className={`flex-1 p-2 bg-yellow-400 dark:bg-yellow-600 text-gray-800 dark:text-gray-50 font-bold rounded-md hover:bg-yellow-500 dark:hover:bg-yellow-700 transition flex items-center justify-center gap-1 text-sm`}
        >
          <Edit size={16} /> Editar
        </button>
        <button
          onClick={() => onCancel(agendamento.id)}
          className='flex-1 p-2 bg-red-500 dark:bg-red-600 text-white font-bold rounded-md hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center justify-center gap-1 text-sm'
        >
          <Trash2 size={16} /> Cancelar
        </button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: Agenda ---

export function Agenda() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Calcular início e fim da semana (domingo a sábado)
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 6 = sábado

  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - diaSemana);
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 7);
  fimSemana.setHours(0, 0, 0, 0);

  // Carrega agendamentos da semana do backend
  useEffect(() => {
    const fetchAgendamentos = async () => {
      try {
        const dataInicio = inicioSemana.toISOString();
        const dataFim = fimSemana.toISOString();
        const data = await listarAgendamentos(dataInicio, dataFim);
        setAgendamentos(data);
      } catch (err) {
        console.error('[Agenda] Erro ao carregar agendamentos:', err);
        const apiError = err as ApiError;
        setError(apiError.message || 'Erro ao carregar agendamentos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendamentos();
  }, []);

  // Agrupar agendamentos por dia da semana
  const agendamentosPorDia: Record<string, Agendamento[]> = {};
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Inicializar todos os dias com array vazio
  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    const diaKey = dia.toISOString().split('T')[0];
    agendamentosPorDia[diaKey] = [];
  }

  // Agrupar agendamentos por dia
  agendamentos.forEach(ag => {
    const dataAg = new Date(ag.data_hora);
    const diaKey = dataAg.toISOString().split('T')[0];
    if (agendamentosPorDia[diaKey]) {
      agendamentosPorDia[diaKey].push(ag);
    }
  });

  // Função para cancelar agendamento
  const handleCancel = async (id: number) => {
    const confirmacao = globalThis.confirm(
      `Tem certeza que deseja cancelar o agendamento #${id}?`,
    );
    if (confirmacao) {
      try {
        await deletarAgendamento(id);
        setAgendamentos((prev: Agendamento[]) => prev.filter((ag: Agendamento) => ag.id !== id));
        alert(`Agendamento #${id} cancelado com sucesso!`);
      } catch (err) {
        console.error('[Agenda] Erro ao cancelar agendamento:', err);
        const apiError = err as ApiError;
        alert(apiError.message || 'Erro ao cancelar agendamento.');
      }
    }
  };

  // Função para abrir modal de edição de status
  const handleEdit = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setStatusModalOpen(true);
  };

  // Função para confirmar mudança de status
  const handleConfirmStatusChange = async (newStatus: string) => {
    if (!selectedAgendamento) return;

    setIsUpdatingStatus(true);
    try {
      const atualizado = await atualizarAgendamento(selectedAgendamento.id, { status: newStatus as Agendamento['status'] });
      setAgendamentos((prev: Agendamento[]) => prev.map((ag: Agendamento) => ag.id === selectedAgendamento.id ? atualizado : ag));
      setStatusModalOpen(false);
      setSelectedAgendamento(null);
      alert(`Agendamento #${selectedAgendamento.id} atualizado para: ${newStatus}`);
    } catch (err) {
      console.error('[Agenda] Erro ao atualizar agendamento:', err);
      const apiError = err as ApiError;
      alert(apiError.message || 'Erro ao atualizar agendamento.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setStatusModalOpen(false);
    setSelectedAgendamento(null);
  };

  if (isLoading) {
    return (
      <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] flex justify-center items-center'>
        <p className='text-gray-500 dark:text-gray-400'>Carregando agendamentos...</p>
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
    <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] flex justify-center items-start transition-colors duration-500'>
      <div className='container max-w-7xl w-full'>
        <h1 className='text-3xl font-extrabold text-center text-pink-600 dark:text-pink-400 mb-6 border-b-2 border-yellow-400 dark:border-yellow-600 pb-2 flex items-center justify-center gap-2'>
          <CalendarDays size={30} />
          Agenda da Semana
        </h1>
        <p className='text-center text-gray-500 dark:text-gray-400 mb-8 font-semibold'>
          {inicioSemana.toLocaleDateString('pt-BR')} - {new Date(fimSemana.getTime() - 1).toLocaleDateString('pt-BR')}
        </p>

        <div className='space-y-8'>
          {/* Iterar por cada dia da semana */}
          {Object.keys(agendamentosPorDia).map((diaKey, index) => {
            const diaData = new Date(diaKey + 'T00:00:00');
            const agendamentosDia = agendamentosPorDia[diaKey];
            const agendaClinica = agendamentosDia.filter(ag => ag.servico === 'clinico');
            const agendaPetshop = agendamentosDia.filter(ag => ag.servico === 'petshop');

            const isToday = diaData.toDateString() === new Date().toDateString();

            return (
              <div key={diaKey} className={`${isToday ? 'ring-4 ring-yellow-400 dark:ring-yellow-600 rounded-xl' : ''}`}>
                <h2 className={`text-2xl font-bold mb-4 px-4 py-2 rounded-lg ${isToday ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                  {diasSemana[index]} - {diaData.toLocaleDateString('pt-BR')}
                  {isToday && <span className='ml-2 text-sm'>(Hoje)</span>}
                </h2>

                <div className='agenda-container flex flex-col lg:flex-row gap-8'>
                  {/* Seção Clínica */}
                  <section className='agenda-clinica flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-cyan-500 dark:border-cyan-600 transition-colors duration-500'>
                    <h3 className='text-xl font-bold text-center text-cyan-700 dark:text-cyan-400 mb-4 border-b border-cyan-200 dark:border-cyan-700 pb-3 flex items-center justify-center gap-2'>
                      <StethoscopeIcon size={20} /> Clínica ({agendaClinica.length})
                    </h3>
                    <div className='space-y-4'>
                      {agendaClinica.map(agendamento => (
                        <AgendamentoCard
                          key={agendamento.id}
                          agendamento={agendamento}
                          tipo='clinica'
                          onCancel={handleCancel}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                    {agendaClinica.length === 0 && (
                      <p className='text-center text-gray-500 dark:text-gray-400 italic mt-4 text-sm'>
                        Sem agendamentos clínicos
                      </p>
                    )}
                  </section>

                  {/* Seção Petshop */}
                  <section className='agenda-petshop flex-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 border-pink-500 dark:border-pink-600 transition-colors duration-500'>
                    <h3 className='text-xl font-bold text-center text-pink-700 dark:text-pink-400 mb-4 border-b border-pink-200 dark:border-pink-700 pb-3 flex items-center justify-center gap-2'>
                      <BathIcon size={20} /> Petshop ({agendaPetshop.length})
                    </h3>
                    <div className='space-y-4'>
                      {agendaPetshop.map(agendamento => (
                        <AgendamentoCard
                          key={agendamento.id}
                          agendamento={agendamento}
                          tipo='petshop'
                          onCancel={handleCancel}
                          onEdit={handleEdit}
                        />
                      ))}
                    </div>
                    {agendaPetshop.length === 0 && (
                      <p className='text-center text-gray-500 dark:text-gray-400 italic mt-4 text-sm'>
                        Sem agendamentos de petshop
                      </p>
                    )}
                  </section>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModalOpen}
          agendamentoId={selectedAgendamento?.id || 0}
          currentStatus={selectedAgendamento?.status || 'agendado'}
          onConfirm={handleConfirmStatusChange}
          onCancel={handleCloseModal}
          isLoading={isUpdatingStatus}
        />
      </div>
    </div>
  );
}
