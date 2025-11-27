/**
 * API Service - Centraliza todas as chamadas HTTP para o backend
 *
 * Este arquivo gerencia:
 * - Configuração da URL base da API
 * - Autenticação com tokens JWT
 * - Headers padrão para todas as requisições
 * - Tratamento de erros centralizado
 */

// Obtém a URL base da API a partir das variáveis de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Interface para respostas de erro da API
 */
export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

/**
 * Interface para dados de login
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Interface para dados de cadastro/signup
 */
export interface SignupData {
  nome: string;
  email: string;
  password: string;
}

/**
 * Interface para resposta do endpoint /token (retorna apenas o token)
 */
interface TokenResponse {
  token: string;
}

/**
 * Interface para dados do usuário retornados pelo /veterinarios/me
 */
interface UserData {
  id: number;
  nome: string;
  email: string;
  crmv?: string;
  especialidade?: string;
}

/**
 * Interface para resposta completa de autenticação
 * (combina token + dados do usuário)
 */
export interface AuthResponse {
  token: string;
  user: UserData;
}

/**
 * Interface para dados do cliente
 */
export interface Cliente {
  id: number;
  nome: string;
  sobrenome?: string;
  email: string;
  telefone?: string;
}

/**
 * Interface para dados do pet
 */
export interface Pet {
  id: number;
  nome: string;
  especie?: string;
  raca?: string;
  cliente_id: number;
  cliente?: {
    id: number;
    nome: string;
    email: string;
  };
}

/**
 * Interface para dados do agendamento
 */
export interface Agendamento {
  id: number;
  servico: 'petshop' | 'clinico';
  data_hora: string;
  pet_id: number;
  veterinario_id?: number;
  observacoes?: string;
  status?: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  pet?: Pet;
  veterinario?: {
    id: number;
    nome: string;
    email: string;
  };
}

/**
 * Obtém o token JWT do localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Salva o token JWT no localStorage
 *
 * @param token - Token JWT recebido do backend
 */
export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove o token JWT do localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Salva os dados do usuário no localStorage
 *
 * @param user - Dados do usuário
 */
export const setUser = (user: UserData): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Obtém os dados do usuário do localStorage
 */
export const getUser = (): UserData | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * Remove os dados do usuário do localStorage
 */
export const removeUser = (): void => {
  localStorage.removeItem('user');
};

/**
 * Cria headers padrão para requisições HTTP
 * Inclui o token de autenticação se disponível
 *
 * @param includeAuth - Se true, inclui o token de autenticação no header
 */
const getHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Função genérica para fazer requisições HTTP
 *
 * @param endpoint - Endpoint da API (ex: '/token')
 * @param options - Opções do fetch
 * @param includeAuth - Se true, inclui o token de autenticação
 * @returns Promise com os dados da resposta
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  includeAuth = false
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`[API] ${options.method || 'GET'} ${url}`, {
    headers: getHeaders(includeAuth),
    body: options.body ? JSON.parse(options.body as string) : undefined,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(includeAuth),
        ...options.headers,
      },
    });

    // Tenta fazer parse do JSON da resposta
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log(`[API] Response ${response.status}:`, data);

    // Se a resposta não for OK (status 200-299), lança um erro
    if (!response.ok) {
      // Backend pode retornar erros como { errors: [...] } ou { err: [...] }
      let errorMessage = 'Erro ao comunicar com o servidor';
      if (data?.errors && Array.isArray(data.errors)) {
        errorMessage = data.errors.join(', ');
      } else if (data?.err && Array.isArray(data.err)) {
        errorMessage = data.err.join(', ');
      } else if (data?.message) {
        errorMessage = data.message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        details: data,
      };
      throw error;
    }

    return data as T;
  } catch (error) {
    // Se for um erro da API (já tratado acima), repassa
    if ((error as ApiError).status) {
      throw error;
    }

    // Caso contrário, é um erro de rede ou parsing
    console.error('[API] Erro na requisição:', error);
    throw {
      message: 'Erro ao conectar com o servidor. Verifique sua conexão.',
      status: 0,
      details: error,
    } as ApiError;
  }
};

// ============================================================
// ENDPOINTS DE AUTENTICAÇÃO
// ============================================================

/**
 * Busca os dados do veterinário logado no servidor
 *
 * Envia para: GET /veterinarios/me
 * Headers: Authorization: Bearer {token}
 * Retorna: { id, nome, email, crmv, especialidade }
 *
 * Esta função é chamada após o login para obter os dados completos do usuário
 */
export const getMe = async (): Promise<UserData> => {
  console.log('[AUTH] Buscando dados do usuário logado');

  const userData = await apiRequest<UserData>(
    '/veterinarios/me',
    {
      method: 'GET',
    },
    true // Inclui token de autenticação
  );

  // Atualiza o localStorage com os dados frescos do servidor
  setUser(userData);

  return userData;
};

/**
 * Interface para veterinário
 */
export interface Veterinario {
  id: number;
  nome: string;
  email: string;
}

/**
 * Lista todos os veterinários
 *
 * Envia para: GET /veterinarios/
 * Auth: não (público)
 */
export const listarVeterinarios = async (): Promise<Veterinario[]> => {
  console.log('[VETERINARIOS] Listando veterinários');

  return apiRequest<Veterinario[]>(
    '/veterinarios/',
    {
      method: 'GET',
    },
    false // Não requer autenticação
  );
};

/**
 * Faz login do usuário
 *
 * Fluxo:
 * 1. POST /token → recebe apenas o token JWT
 * 2. GET /veterinarios/me → busca dados completos do usuário
 * 3. Salva token e dados no localStorage
 * 4. Retorna { token, user }
 *
 * @param data - Dados de login (email e senha)
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  console.log('[AUTH] Fazendo login com email:', data.email);

  try {
    // PASSO 1: Faz login e recebe apenas o token
    const tokenResponse = await apiRequest<TokenResponse>(
      '/token/',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    console.log('[AUTH] ✅ Token recebido');

    // PASSO 2: Salva o token no localStorage
    setToken(tokenResponse.token);

    // PASSO 3: Busca dados completos do usuário usando o token
    console.log('[AUTH] Buscando dados do usuário...');
    const userData = await getMe();

    console.log('[AUTH] ✅ Login bem-sucedido! Dados do usuário:', userData);

    // PASSO 4: Retorna token + dados do usuário
    return {
      token: tokenResponse.token,
      user: userData
    };
  } catch (error) {
    // Se der erro em qualquer etapa, remove o token e repassa o erro
    console.error('[AUTH] ❌ Erro no login:', error);
    removeToken();
    throw error;
  }
};

/**
 * Registra um novo usuário (veterinário)
 *
 * Envia para: POST /veterinarios
 * Body: { nome, email, password, crmv, especialidade }
 * Retorna: { id, nome, email }
 *
 * Após criar o veterinário, você ainda precisa fazer login
 * para obter o token de autenticação
 *
 * @param data - Dados de cadastro
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  console.log('[AUTH] Registrando novo usuário:', data.email);

  // Cria o veterinário
  await apiRequest<UserData>(
    '/veterinarios/',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );

  console.log('[AUTH] Veterinário criado! Fazendo login...');

  // Após criar, faz login automaticamente
  const loginResponse = await login({
    email: data.email,
    password: data.password
  });

  console.log('[AUTH] Cadastro bem-sucedido! Token salvo.');
  return loginResponse;
};

/**
 * Faz logout do usuário
 * Remove token e dados do localStorage
 */
export const logout = (): void => {
  console.log('[AUTH] Fazendo logout...');
  removeToken();
  removeUser();
  console.log('[AUTH] Logout completo. Tokens removidos.');
};

/**
 * Verifica se o usuário está autenticado
 * (verifica apenas se existe token no localStorage)
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * Revalida a autenticação buscando dados do servidor
 * Útil para verificar se o token ainda é válido
 *
 * @returns true se o token é válido, false caso contrário
 */
export const revalidateAuth = async (): Promise<boolean> => {
  const token = getToken();

  if (!token) {
    return false;
  }

  try {
    await getMe(); // Se conseguir buscar, token é válido
    return true;
  } catch (error) {
    // Token inválido ou expirado
    console.error('[AUTH] Token inválido:', error);
    removeToken();
    removeUser();
    return false;
  }
};

// ============================================================
// ENDPOINTS DE CLIENTES
// ============================================================

/**
 * Interface para criar cliente
 */
export interface CriarClienteData {
  nome: string;
  sobrenome?: string;
  email: string;
  telefone?: string;
}

/**
 * Interface para criar pet
 */
export interface CriarPetData {
  nome: string;
  especie?: string;
  raca?: string;
  cliente_id: number;
}

/**
 * Cadastra um novo cliente
 *
 * Envia para: POST /clientes
 * Headers: Authorization: Bearer {token}
 * Body: { nome, sobrenome, email, telefone }
 *
 * @param data - Dados do cliente
 */
export const cadastrarCliente = async (data: CriarClienteData): Promise<Cliente> => {
  console.log('[CLIENTES] Cadastrando novo cliente');

  return apiRequest<Cliente>(
    '/clientes',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true // Inclui token de autenticação
  );
};

/**
 * Lista todos os clientes
 *
 * Envia para: GET /clientes
 * Headers: Authorization: Bearer {token}
 * Retorna: Array de clientes
 */
export const listarClientes = async (): Promise<Cliente[]> => {
  console.log('[CLIENTES] Listando clientes');

  return apiRequest<Cliente[]>(
    '/clientes',
    {
      method: 'GET',
    },
    true // Inclui token de autenticação
  );
};

/**
 * Busca um cliente por ID
 *
 * Envia para: GET /clientes/:id
 * Headers: Authorization: Bearer {token}
 */
export const buscarCliente = async (id: number): Promise<Cliente> => {
  console.log('[CLIENTES] Buscando cliente:', id);

  return apiRequest<Cliente>(
    `/clientes/${id}`,
    {
      method: 'GET',
    },
    true
  );
};

/**
 * Atualiza dados de um cliente existente
 *
 * Envia para: PUT /clientes/:id
 * Headers: Authorization: Bearer {token}
 * Body: { nome?, sobrenome?, email?, telefone? }
 *
 * @param id - ID do cliente
 * @param data - Dados a serem atualizados
 */
export const atualizarCliente = async (id: number, data: Partial<CriarClienteData>): Promise<Cliente> => {
  console.log('[CLIENTES] Atualizando cliente:', id, data);

  return apiRequest<Cliente>(
    `/clientes/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true
  );
};

/**
 * Deleta um cliente
 *
 * Envia para: DELETE /clientes/:id
 * Headers: Authorization: Bearer {token}
 *
 * @param id - ID do cliente a ser deletado
 */
export const deletarCliente = async (id: number): Promise<null> => {
  console.log('[CLIENTES] Deletando cliente:', id);

  return apiRequest<null>(
    `/clientes/${id}`,
    {
      method: 'DELETE',
    },
    true
  );
};

// ============================================================
// ENDPOINTS DE PETS
// ============================================================

/**
 * Lista todos os pets
 *
 * Envia para: GET /pets
 * Headers: Authorization: Bearer {token}
 * Retorna: Array de pets com associação cliente
 */
export const listarPets = async (): Promise<Pet[]> => {
  console.log('[PETS] Listando pets');

  return apiRequest<Pet[]>(
    '/pets',
    {
      method: 'GET',
    },
    true // Inclui token de autenticação
  );
};

/**
 * Cadastra um novo pet
 *
 * Envia para: POST /pets
 * Headers: Authorization: Bearer {token}
 * Body: { nome, especie, raca, cliente_id }
 *
 * @param data - Dados do pet
 */
export const cadastrarPet = async (data: CriarPetData): Promise<Pet> => {
  console.log('[PETS] Cadastrando novo pet');

  return apiRequest<Pet>(
    '/pets',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true // Inclui token de autenticação
  );
};

/**
 * Busca um pet por ID
 *
 * Envia para: GET /pets/:id
 * Headers: Authorization: Bearer {token}
 */
export const buscarPet = async (id: number): Promise<Pet> => {
  console.log('[PETS] Buscando pet:', id);

  return apiRequest<Pet>(
    `/pets/${id}`,
    {
      method: 'GET',
    },
    true
  );
};

// ============================================================
// ENDPOINTS DE AGENDAMENTOS
// ============================================================

/**
 * Interface para criar agendamento
 */
export interface CriarAgendamentoData {
  pet_id: number;
  data_hora: string;
  observacoes?: string;
  status?: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
}

/**
 * Cria um agendamento clínico
 *
 * Envia para: POST /agendamentos
 * Headers: Authorization: Bearer {token}
 * Body: { servico: 'clinico', pet_id, data_hora, observacoes }
 *
 * @param data - Dados do agendamento clínico
 */
export const agendarClinico = async (data: CriarAgendamentoData): Promise<Agendamento> => {
  console.log('[AGENDAMENTO] Criando agendamento clínico');

  return apiRequest<Agendamento>(
    '/agendamentos',
    {
      method: 'POST',
      body: JSON.stringify({ ...data, servico: 'clinico' }),
    },
    true // Inclui token de autenticação
  );
};

/**
 * Cria um agendamento de petshop
 *
 * Envia para: POST /agendamentos
 * Headers: Authorization: Bearer {token}
 * Body: { servico: 'petshop', pet_id, data_hora, observacoes }
 *
 * @param data - Dados do agendamento petshop
 */
export const agendarPetshop = async (data: CriarAgendamentoData): Promise<Agendamento> => {
  console.log('[AGENDAMENTO] Criando agendamento petshop');

  return apiRequest<Agendamento>(
    '/agendamentos',
    {
      method: 'POST',
      body: JSON.stringify({ ...data, servico: 'petshop' }),
    },
    true // Inclui token de autenticação
  );
};

/**
 * Lista todos os agendamentos
 *
 * Envia para: GET /agendamentos
 * Headers: Authorization: Bearer {token}
 * Retorna: Array de agendamentos com associações pet e veterinario
 */
export const listarAgendamentos = async (dataInicio?: string, dataFim?: string): Promise<Agendamento[]> => {
  console.log('[AGENDAMENTO] Listando agendamentos');

  // Construir query string se houver filtros de data
  let url = '/agendamentos';
  const params = new URLSearchParams();
  if (dataInicio) params.append('data_inicio', dataInicio);
  if (dataFim) params.append('data_fim', dataFim);
  if (params.toString()) url += `?${params.toString()}`;

  return apiRequest<Agendamento[]>(
    url,
    {
      method: 'GET',
    },
    true // Inclui token de autenticação
  );
};

/**
 * Busca um agendamento específico por ID
 *
 * Envia para: GET /agendamentos/:id
 * Headers: Authorization: Bearer {token}
 * Retorna: Dados do agendamento com associações
 *
 * @param id - ID do agendamento
 */
export const buscarAgendamento = async (id: number): Promise<Agendamento> => {
  console.log('[AGENDAMENTO] Buscando agendamento:', id);

  return apiRequest<Agendamento>(
    `/agendamentos/${id}`,
    {
      method: 'GET',
    },
    true // Inclui token de autenticação
  );
};

/**
 * Atualiza um agendamento
 *
 * Envia para: PUT /agendamentos/:id
 * Headers: Authorization: Bearer {token}
 * Body: { status, observacoes, ... }
 *
 * @param id - ID do agendamento
 * @param data - Dados para atualizar
 */
export const atualizarAgendamento = async (id: number, data: Partial<CriarAgendamentoData>): Promise<Agendamento> => {
  console.log('[AGENDAMENTO] Atualizando agendamento:', id);

  return apiRequest<Agendamento>(
    `/agendamentos/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true // Inclui token de autenticação
  );
};

/**
 * Deleta um agendamento
 *
 * Envia para: DELETE /agendamentos/:id
 * Headers: Authorization: Bearer {token}
 *
 * @param id - ID do agendamento
 */
export const deletarAgendamento = async (id: number): Promise<null> => {
  console.log('[AGENDAMENTO] Deletando agendamento:', id);

  return apiRequest<null>(
    `/agendamentos/${id}`,
    {
      method: 'DELETE',
    },
    true // Inclui token de autenticação
  );
};

// ============================================================
// ENDPOINTS DE PRONTUÁRIO
// ============================================================

/**
 * Interface para arquivo de prontuário
 */
export interface ProntuarioArquivo {
  id: number;
  nome: string;
  filename?: string;
  url: string;
}

/**
 * Interface para entrada de prontuário
 */
export interface Prontuario {
  id: number;
  pet_id: number;
  data: string;
  tipo: 'Consulta' | 'Exame' | 'Vacina' | 'Banho' | 'Tosa' | 'Outro';
  descricao: string;
  responsavel: string;
  arquivos: ProntuarioArquivo[];
}

/**
 * Interface para criar prontuário
 */
export interface CriarProntuarioData {
  pet_id: number;
  data: string;
  tipo: 'Consulta' | 'Exame' | 'Vacina' | 'Banho' | 'Tosa' | 'Outro';
  descricao: string;
  responsavel: string;
}

/**
 * Lista histórico de um pet
 *
 * Envia para: GET /prontuarios?pet_id=:id
 * Headers: Authorization: Bearer {token}
 */
export const listarProntuarios = async (petId: number): Promise<Prontuario[]> => {
  console.log('[PRONTUARIO] Listando prontuários do pet:', petId);

  return apiRequest<Prontuario[]>(
    `/prontuarios/${petId}`,
    {
      method: 'GET',
    },
    true
  );
};

/**
 * Cria uma entrada no prontuário
 *
 * Envia para: POST /prontuarios
 * Headers: Authorization: Bearer {token}
 */
export const criarProntuario = async (data: CriarProntuarioData): Promise<Prontuario> => {
  console.log('[PRONTUARIO] Criando entrada no prontuário');

  return apiRequest<Prontuario>(
    `/prontuarios/${data.pet_id}`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    true
  );
};

/**
 * Atualiza uma entrada do prontuário
 *
 * Envia para: PUT /prontuarios/:id
 * Headers: Authorization: Bearer {token}
 */
export const atualizarProntuario = async (id: number, data: Partial<CriarProntuarioData>): Promise<Prontuario> => {
  console.log('[PRONTUARIO] Atualizando prontuário:', id);

  return apiRequest<Prontuario>(
    `/prontuarios/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    true
  );
};

/**
 * Deleta uma entrada do prontuário
 *
 * Envia para: DELETE /prontuarios/:id
 * Headers: Authorization: Bearer {token}
 */
export const deletarProntuario = async (id: number): Promise<null> => {
  console.log('[PRONTUARIO] Deletando prontuário:', id);

  return apiRequest<null>(
    `/prontuarios/${id}`,
    {
      method: 'DELETE',
    },
    true
  );
};

/**
 * Upload de arquivo para um prontuário
 *
 * Envia para: POST /prontuarios/:id/arquivos
 * Headers: Authorization: Bearer {token}
 * Content-Type: multipart/form-data
 */
export const uploadArquivoProntuario = async (prontuarioId: number, arquivo: File): Promise<ProntuarioArquivo> => {
  console.log('[PRONTUARIO] Fazendo upload de arquivo para prontuário:', prontuarioId);

  const formData = new FormData();
  formData.append('arquivo', arquivo);

  const token = getToken();
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const response = await fetch(`${API_BASE_URL}/prontuarios/${prontuarioId}/arquivos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw {
      message: data?.errors?.join(', ') || data?.message || 'Erro ao fazer upload',
      status: response.status,
      details: data,
    };
  }

  return response.json();
};

/**
 * Deleta arquivo de prontuário
 *
 * Envia para: DELETE /prontuarios/arquivos/:id
 * Headers: Authorization: Bearer {token}
 */
export const deletarArquivoProntuario = async (arquivoId: number): Promise<null> => {
  console.log('[PRONTUARIO] Deletando arquivo:', arquivoId);

  return apiRequest<null>(
    `/prontuarios/arquivos/${arquivoId}`,
    {
      method: 'DELETE',
    },
    true
  );
};

// Mantém função antiga para compatibilidade
export const buscarProntuarios = listarProntuarios;

// ============================================================
// EXPORT DEFAULT
// ============================================================

export default {
  // Auth
  login,
  signup,
  logout,
  isAuthenticated,
  revalidateAuth,
  getMe,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,

  // Clientes
  cadastrarCliente,
  listarClientes,
  buscarCliente,
  atualizarCliente,
  deletarCliente,

  // Pets
  listarPets,
  cadastrarPet,
  buscarPet,

  // Agendamentos
  agendarClinico,
  agendarPetshop,
  listarAgendamentos,
  buscarAgendamento,
  atualizarAgendamento,
  deletarAgendamento,

  // Prontuários
  listarProntuarios,
  criarProntuario,
  atualizarProntuario,
  deletarProntuario,
  uploadArquivoProntuario,
  deletarArquivoProntuario,
  buscarProntuarios,
};