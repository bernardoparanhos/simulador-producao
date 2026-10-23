/**
 * Guarda a sequência para a árvore inteira.
 *
 * Fica acima das rotas, junto dos provedores de cenário e de atividades: o
 * fluxo montado no passo 3 alimenta os resultados no passo 4.
 *
 * O provedor não contém regra — só encadeia as funções puras de
 * `sequencia.ts`. É o que permite à Parada P3 testar a regra sem montar
 * componente nenhum.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { AtividadeId, ConexaoSequencia, Sequencia } from '@/types'

import { ContextoSequenciaReact } from './contextoSequencia'
import type { ContextoSequencia } from './contextoSequencia'
import {
  adicionarConexao,
  definirPosicoes,
  gravarSequencia,
  lerSequenciaArmazenada,
  moverNo,
  removerConexoesDoNo,
  SEQUENCIA_INICIAL,
} from './sequencia'
import type { PosicaoDeNo } from './sequencia'

export function ProvedorSequencia({ children }: { children: ReactNode }) {
  const [sequencia, setSequencia] = useState<Sequencia>(lerSequenciaArmazenada)

  useEffect(() => {
    gravarSequencia(sequencia)
  }, [sequencia])

  const setNodePositions = useCallback((posicoes: readonly PosicaoDeNo[]) => {
    setSequencia((atual) => definirPosicoes(atual, posicoes))
  }, [])

  const updateNodePosition = useCallback((id: AtividadeId, x: number, y: number) => {
    setSequencia((atual) => moverNo(atual, id, x, y))
  }, [])

  const addEdge = useCallback((conexao: ConexaoSequencia) => {
    setSequencia((atual) => adicionarConexao(atual, conexao))
  }, [])

  const removeEdgesForNode = useCallback((id: AtividadeId) => {
    setSequencia((atual) => removerConexoesDoNo(atual, id))
  }, [])

  const resetSequencia = useCallback(() => {
    setSequencia(SEQUENCIA_INICIAL)
  }, [])

  const valor = useMemo<ContextoSequencia>(
    () => ({
      sequencia,
      setNodePositions,
      updateNodePosition,
      addEdge,
      removeEdgesForNode,
      resetSequencia,
    }),
    [
      sequencia,
      setNodePositions,
      updateNodePosition,
      addEdge,
      removeEdgesForNode,
      resetSequencia,
    ],
  )

  return (
    <ContextoSequenciaReact.Provider value={valor}>{children}</ContextoSequenciaReact.Provider>
  )
}
