import { useState } from 'react';
import {
  UserPlus,
  User,
  Phone,
  Mail,
  PawPrint,
  Dog,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cadastrarCliente, cadastrarPet } from '../../services/api';
import type { ApiError } from '../../services/api';

// --- ESQUEMA ZOD DOS PETS ---
const petSchema = z.object({
  nome: z.string().min(1, 'O nome do Pet é obrigatório.'),
  especie: z.string().min(1, 'A espécie (Cão, Gato, etc.) é obrigatória.'),
  raca: z.string().max(50, 'Máximo de 50 caracteres').nullable().optional(),
});

// --- ESQUEMA ZOD DO CLIENTE ---
const cadastrarClienteSchema = z.object({
  nome: z.string().min(1, 'O nome do cliente é obrigatório.'),
  email: z.string().email('E-mail inválido.').min(1, 'O e-mail é obrigatório.'),
  telefone: z
    .string()
    .optional(),

  // Array de Pets - Deve ter pelo menos 1 item
  pets: z
    .array(petSchema)
    .min(
      1,
      'Pelo menos um Pet deve ser cadastrado. Use o botão "Adicionar Pet".',
    ),
});

type PetFormData = z.infer<typeof petSchema>;
type CadastrarClienteFormData = z.infer<typeof cadastrarClienteSchema>;

// FIX: O componente principal foi renomeado para 'App' e mantido como exportação padrão para garantir a correta renderização.
export default function App() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CadastrarClienteFormData>({
    resolver: zodResolver(cadastrarClienteSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      // Inicializa com um Pet obrigatório
      pets: [{ nome: '', especie: '', raca: '' }],
    },
  });

  // Hook para gerenciar campos dinâmicos (Pets)
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'pets',
  });

  // Estados para envio ao backend
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Envia os dados para o backend como JSON
  // Fluxo: 1. Criar cliente -> 2. Criar cada pet com cliente_id
  const onSubmit = async (data: CadastrarClienteFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    console.log('[CadastrarCliente] Enviando dados do cliente:', data);

    try {
      // PASSO 1: Criar o cliente
      const clienteData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone || undefined,
      };

      const clienteCriado = await cadastrarCliente(clienteData);
      console.log('[CadastrarCliente] Cliente criado:', clienteCriado);

      // PASSO 2: Criar cada pet associado ao cliente
      for (const pet of data.pets) {
        const petData = {
          nome: pet.nome,
          especie: pet.especie,
          raca: pet.raca || undefined,
          cliente_id: clienteCriado.id,
        };

        const petCriado = await cadastrarPet(petData);
        console.log('[CadastrarCliente] Pet criado:', petCriado);
      }

      // Sucesso
      setSuccessMessage(`Cliente e ${data.pets.length} pet(s) cadastrados com sucesso!`);
      console.log('[CadastrarCliente] Cadastro completo!');

      // Reset no formulário para estado inicial
      reset({
        nome: '',
        email: '',
        telefone: '',
        pets: [{ nome: '', especie: '', raca: '' }],
      });
    } catch (err) {
      console.error('[CadastrarCliente] Erro ao cadastrar:', err);
      const apiError = err as ApiError;
      setServerError(apiError.message || 'Erro ao cadastrar cliente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Fundo da página com suporte a Dark Mode (dark:bg-gray-900)
    <div className='p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-150px)] flex justify-center items-start transition-colors duration-500'>
      <div className='container max-w-3xl w-full'>
        {/* Título principal adaptado */}
        <h1 className='text-3xl font-extrabold text-center text-pink-600 dark:text-pink-400 mb-6 border-b-2 border-yellow-400 dark:border-yellow-600 pb-2 flex items-center justify-center gap-2'>
          <UserPlus size={30} />
          Cadastro de Cliente e Pets
        </h1>
        {/* Parágrafo de descrição adaptado */}
        <p className='text-center text-gray-500 dark:text-gray-400 mb-8'>
          Cadastre as informações do cliente e de todos os seus animais de
          estimação.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          // Fundo do formulário adaptado (dark:bg-gray-800)
          className='space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-500'
        >
          {/* Mensagens de sucesso / erro do servidor */}
          {serverError && (
            <div className='p-3 mb-2 bg-red-50 dark:bg-red-900 text-red-700 rounded'>
              {serverError}
            </div>
          )}
          {successMessage && (
            <div className='p-3 mb-2 bg-green-50 dark:bg-green-900 text-green-700 rounded'>
              {successMessage}
            </div>
          )}
          {/* Dados do Cliente */}
          <fieldset className='border-2 border-cyan-500 p-4 rounded-md'>
            {/* Legenda adaptada */}
            <legend className='font-bold text-lg text-cyan-700 dark:text-cyan-400 px-2'>
              Dados do Cliente
            </legend>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='form-group'>
                {/* Label adaptado */}
                <label
                  htmlFor='nome'
                  className=' font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1'
                >
                  <User
                    size={16}
                    className='text-cyan-500 dark:text-cyan-400'
                  />{' '}
                  Nome:
                </label>
                {/* Input adaptado (cores e foco) */}
                <input
                  type='text'
                  id='nome'
                  {...register('nome')}
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-cyan-500 dark:focus:border-cyan-400'
                />
                {errors.nome && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.nome.message}
                  </p>
                )}
              </div>

              <div className='form-group'>
                {/* Label adaptado */}
                <label
                  htmlFor='email'
                  className=' font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1'
                >
                  <Mail
                    size={16}
                    className='text-cyan-500 dark:text-cyan-400'
                  />
                  E-mail:
                </label>
                {/* Input adaptado (cores e foco) */}
                <input
                  type='email'
                  id='email'
                  {...register('email')}
                  placeholder='Ex: email@gmail.com'
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-cyan-500 dark:focus:border-cyan-400'
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className='form-group'>
                {/* Label adaptado */}
                <label
                  htmlFor='telefone'
                  className=' font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1'
                >
                  <Phone
                    size={16}
                    className='text-cyan-500 dark:text-cyan-400'
                  />
                  Telefone:
                </label>
                {/* Input adaptado (cores e foco) */}
                <input
                  type='tel'
                  id='telefone'
                  {...register('telefone')}
                  placeholder='(00) 00000-0000'
                  className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded focus:border-cyan-500 dark:focus:border-cyan-400'
                />
                {errors.telefone && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.telefone.message}
                  </p>
                )}
              </div>
            </div>
          </fieldset>

          {/* Dados dos Pets */}
          <fieldset className='border-2 border-cyan-500 p-4 rounded-md space-y-4'>
            {/* Legenda adaptada */}
            <legend className='font-bold text-lg text-cyan-700 dark:text-cyan-400 px-2 flex items-center gap-2'>
              <Dog size={20} className='text-cyan-500 dark:text-cyan-400' />{' '}
              Dados dos Pets
            </legend>

            {fields.map((field, index) => (
              <div
                key={field.id}
                // Fundo do Pet Block adaptado
                className='pet-block border border-gray-300 dark:border-gray-600 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 space-y-3'
              >
                <div className='flex justify-between items-center border-b border-pink-300 dark:border-pink-700 pb-2 mb-3'>
                  {/* Título do Pet Block adaptado */}
                  <h4 className='text-xl font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2'>
                    <PawPrint size={18} /> Pet {index + 1}
                  </h4>

                  {/* O botão remover só aparece se houver mais de um pet */}
                  {index > 0 && (
                    <button
                      type='button'
                      onClick={() => remove(index)}
                      // Botão Remover adaptado
                      className='p-2 bg-red-400 dark:bg-red-600 text-white rounded-full hover:bg-red-500 dark:hover:bg-red-700 transition flex items-center gap-1 text-sm'
                    >
                      <Trash2 size={16} /> Remover
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='form-group'>
                    {/* Label adaptado */}
                    <label
                      htmlFor={`pets.${index}.nome`}
                      className='block font-semibold text-gray-700 dark:text-gray-300'
                    >
                      Nome do Pet:
                    </label>
                    {/* Input adaptado (cores e foco) */}
                    <input
                      type='text'
                      id={`pets.${index}.nome`}
                      {...register(`pets.${index}.nome`)}
                      className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:border-pink-500 dark:focus:border-pink-400'
                    />
                    {errors.pets?.[index]?.nome && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.pets[index].nome.message}
                      </p>
                    )}
                  </div>

                  <div className='form-group'>
                    {/* Label adaptado */}
                    <label
                      htmlFor={`pets.${index}.especie`}
                      className='block font-semibold text-gray-700 dark:text-gray-300'
                    >
                      Espécie:
                    </label>
                    {/* Input adaptado (cores e foco) */}
                    <input
                      type='text'
                      id={`pets.${index}.especie`}
                      {...register(`pets.${index}.especie`)}
                      placeholder='Ex: Cachorro, Gato'
                      className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:border-pink-500 dark:focus:border-pink-400'
                    />
                    {errors.pets?.[index]?.especie && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.pets[index].especie.message}
                      </p>
                    )}
                  </div>

                  <div className='form-group'>
                    {/* Label adaptado */}
                    <label
                      htmlFor={`pets.${index}.raca`}
                      className='block font-semibold text-gray-700 dark:text-gray-300'
                    >
                      Raça (Opcional):
                    </label>
                    {/* Input adaptado (cores e foco) */}
                    <input
                      type='text'
                      id={`pets.${index}.raca`}
                      {...register(`pets.${index}.raca`)}
                      className='w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded focus:border-pink-500 dark:focus:border-pink-400'
                    />
                    {errors.pets?.[index]?.raca && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.pets[index].raca.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Exibe erro se não houver pets */}
            {errors.pets?.root && (
              <p className='text-red-500 text-sm mt-1 font-semibold'>
                {errors.pets.root.message}
              </p>
            )}

            <button
              type='button'
              onClick={() =>
                append({ nome: '', especie: '', raca: '' } as PetFormData)
              }
              // Botão Adicionar Pet adaptado
              className='mt-4 p-2 bg-cyan-500 dark:bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-600 dark:hover:bg-cyan-700 transition flex items-center justify-center gap-2'
            >
              <PlusCircle size={20} /> Adicionar outro Pet
            </button>
          </fieldset>

          <button
            type='submit'
            disabled={isSubmitting}
            // Botão de Submissão adaptado
            className='w-full p-3 bg-pink-500 dark:bg-pink-600 text-white font-bold rounded-md hover:bg-pink-600 dark:hover:bg-pink-700 transition text-lg disabled:opacity-60'
          >
            {isSubmitting ? 'Enviando...' : 'Cadastrar Cliente e Pets'}
          </button>
        </form>
      </div>
    </div>
  );
}
