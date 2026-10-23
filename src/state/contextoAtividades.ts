/**
 * O contexto das atividades e o gancho que o lê.
 *
 * Separado do provedor (`ProvedorAtividades.tsx`) porque arquivos que exportam
 * um componente não devem exportar mais nada: é o que mantém o recarregamento
 * rápido do Vite funcionando.
 */

import { createContext, useContext } from 'react'

import type { AtividadeFormulario } from './atividades'

/** O que o contexto oferece às telas. */
export interface ContextoAtividades {
  /** As atividades cadastradas, na ordem em que aparecem na lista. */
  atividades: AtividadeFormulario[]
  /** Acrescenta uma atividade ao fim da lista. */
  adicionar: (atividade: AtividadeFormulario) => void
  /** Substitui a atividade de mesmo `id`. Mantém a posição na lista. */
  atualizar: (atividade: AtividadeFormulario) => void
  /** Remove a atividade pelo `id`. */
  remover: (id: string) => void
  /** Troca a lista inteira. Usado para carregar um cenário pronto. */
  substituirTodas: (atividades: AtividadeFormulario[]) => void
}

export const ContextoAtividadesReact = createContext<ContextoAtividades | null>(null)

/**
 * Acessa a lista de atividades compartilhada.
 *
 * Lança se usado fora do provedor — é erro de montagem da árvore, e falhar
 * alto na hora é melhor do que devolver uma lista vazia que só vira "nenhum
 * gargalo" duas telas adiante.
 */
export function useAtividades(): ContextoAtividades {
  const contexto = useContext(ContextoAtividadesReact)
  if (contexto === null) {
    throw new Error('useAtividades precisa estar dentro de <ProvedorAtividades>')
  }
  return contexto
}
