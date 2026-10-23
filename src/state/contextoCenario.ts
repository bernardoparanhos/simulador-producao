/**
 * O contexto do cenário e o gancho que o lê.
 *
 * Separado do provedor (`ProvedorCenario.tsx`) porque arquivos que exportam um
 * componente não devem exportar mais nada: é o que mantém o recarregamento
 * rápido do Vite funcionando durante o desenvolvimento.
 */

import { createContext, useContext } from 'react'

import type { Cenario } from '@/types'

import type { FormularioCenario } from './cenario'

/** O que o contexto oferece às telas. */
export interface ContextoCenario {
  /** O formulário como está agora. */
  formulario: FormularioCenario
  /** Altera um campo. Mantém os demais. */
  alterarCampo: <C extends keyof FormularioCenario>(
    campo: C,
    valor: FormularioCenario[C],
  ) => void
  /** Volta tudo aos valores iniciais e limpa o armazenamento. */
  reiniciar: () => void
  /** O cenário derivado, pronto para o motor. */
  cenario: Cenario
}

export const ContextoCenarioReact = createContext<ContextoCenario | null>(null)

/**
 * Acessa o cenário compartilhado.
 *
 * Lança se usado fora do provedor — é erro de montagem da árvore, e falhar
 * alto na hora é melhor do que devolver um cenário vazio que só vira número
 * errado três telas adiante.
 */
export function useCenario(): ContextoCenario {
  const contexto = useContext(ContextoCenarioReact)
  if (contexto === null) {
    throw new Error('useCenario precisa estar dentro de <ProvedorCenario>')
  }
  return contexto
}
