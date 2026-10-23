/**
 * O contexto da sequência e o gancho que o lê.
 *
 * Separado do provedor (`ProvedorSequencia.tsx`) porque arquivos que exportam
 * um componente não devem exportar mais nada: é o que mantém o recarregamento
 * rápido do Vite funcionando.
 */

import { createContext, useContext } from 'react'

import type { AtividadeId, ConexaoSequencia, Sequencia } from '@/types'

import type { PosicaoDeNo } from './sequencia'

/**
 * O que o contexto oferece às telas.
 *
 * Os nomes das ações seguem o vocabulário do canvas, não o do domínio: quem as
 * chama é o componente de fluxo, reagindo a arrasto e a ligação desenhada.
 */
export interface ContextoSequencia {
  /** O fluxo como está agora, no formato que o motor consome. */
  sequencia: Sequencia

  /** Substitui todas as posições. É o que o botão "Carregar atividades" faz. */
  setNodePositions: (posicoes: readonly PosicaoDeNo[]) => void

  /** Move um nó depois de arrastado. Ignora id desconhecido. */
  updateNodePosition: (id: AtividadeId, x: number, y: number) => void

  /** Acrescenta uma ligação. Ignora repetida e ignora laço sobre si mesma. */
  addEdge: (conexao: ConexaoSequencia) => void

  /** Remove todas as ligações que tocam um nó. O nó continua no canvas. */
  removeEdgesForNode: (id: AtividadeId) => void

  /** Limpa o canvas inteiro: sem nós posicionados, sem ligações. */
  resetSequencia: () => void
}

export const ContextoSequenciaReact = createContext<ContextoSequencia | null>(null)

/**
 * Acessa a sequência compartilhada.
 *
 * Lança se usado fora do provedor — é erro de montagem da árvore, e falhar
 * alto na hora é melhor do que devolver um fluxo vazio que só vira "gargalo
 * não propaga" na tela de resultados.
 */
export function useSequencia(): ContextoSequencia {
  const contexto = useContext(ContextoSequenciaReact)
  if (contexto === null) {
    throw new Error('useSequencia precisa estar dentro de <ProvedorSequencia>')
  }
  return contexto
}
