/**
 * As atividades cadastradas, e a persistência delas.
 *
 * Só dados e funções puras — nada de React. O provedor está em
 * `ProvedorAtividades.tsx` e o acesso em `contextoAtividades.ts`.
 *
 * ## Por que aqui não há tradução, e no cenário há
 *
 * O cenário precisou de dois tipos (`FormularioCenario` e `Cenario`) porque a
 * tela e o motor discordam em três pontos: segundos contra minutos, e dois
 * campos que a tela não pede.
 *
 * A atividade não tem nenhuma dessas diferenças. Todo campo do drawer é um
 * campo de {@link Atividade}, na mesma unidade. Criar um segundo tipo idêntico
 * só criaria uma cópia para sair de sincronia — então
 * {@link AtividadeFormulario} é um apelido, e a conversão para o motor é a
 * própria lista.
 */

import type { Atividade } from '@/types'

/** Chave da lista no `localStorage`. Versionada: mudou de forma, muda a chave. */
export const CHAVE_ARMAZENAMENTO = 'simulador-producao:atividades:v1'

/**
 * Uma atividade como o drawer a edita.
 *
 * Idêntica a {@link Atividade} — ver o cabeçalho deste arquivo. O apelido
 * existe para dar nome ao papel ("o que o formulário edita") sem duplicar a
 * forma.
 */
export type AtividadeFormulario = Atividade

/**
 * Valores iniciais de uma atividade nova.
 *
 * Os defaults são os do frame DP-2: ritmo normal, 1% de tolerância, um minuto
 * de setup por lote e um operador.
 *
 * `processo` começa em 1 e não em zero: o campo é opcional na tela, mas o
 * modelo exige um número, e processo zero não existe no domínio. Ele não entra
 * em fórmula nenhuma de qualquer forma (decisão 4 da Fase 2).
 */
export const ATIVIDADE_NOVA: Omit<AtividadeFormulario, 'id'> = {
  descricao: '',
  etapa: 1,
  linha: 1,
  processo: 1,
  tempoCronometradoMin: 0,
  setupMin: 1,
  fatorRitmo: 100,
  fatorTolerancia: 1,
  numOperadores: 1,
}

/**
 * Gera um identificador estável para uma atividade nova.
 *
 * `crypto.randomUUID` é nativo e dispensa dependência. O recuo existe para
 * contextos sem origem segura (HTTP simples numa rede local), onde a API não
 * é exposta — raro, mas basta para a tela não quebrar.
 */
export function novoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `atv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Lê a lista salva, ou devolve uma lista vazia.
 *
 * Tolerante pela mesma razão do cenário: armazenamento indisponível, JSON
 * corrompido ou uma versão anterior não podem impedir a tela de abrir. O
 * `Array.isArray` protege contra um valor salvo que não seja lista.
 */
export function lerAtividadesArmazenadas(): AtividadeFormulario[] {
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO)
    if (bruto === null) return []

    const salvo: unknown = JSON.parse(bruto)
    return Array.isArray(salvo) ? (salvo as AtividadeFormulario[]) : []
  } catch {
    return []
  }
}

/** Grava a lista. Falha em silêncio — perder o rascunho é ruim, não abrir é pior. */
export function gravarAtividades(atividades: readonly AtividadeFormulario[]): void {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(atividades))
  } catch {
    // Intencionalmente ignorado. Ver o comentário acima.
  }
}
