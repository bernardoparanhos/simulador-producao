/**
 * Guarda a lista de atividades para a árvore inteira.
 *
 * Fica acima das rotas, junto do provedor do cenário: as atividades
 * cadastradas no passo 2 alimentam a sequência no passo 3 e os resultados no
 * passo 4.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { gravarAtividades, lerAtividadesArmazenadas } from './atividades'
import type { AtividadeFormulario } from './atividades'
import { ContextoAtividadesReact } from './contextoAtividades'
import type { ContextoAtividades } from './contextoAtividades'

export function ProvedorAtividades({ children }: { children: ReactNode }) {
  const [atividades, setAtividades] = useState<AtividadeFormulario[]>(lerAtividadesArmazenadas)

  useEffect(() => {
    gravarAtividades(atividades)
  }, [atividades])

  const adicionar = useCallback((atividade: AtividadeFormulario) => {
    setAtividades((atual) => [...atual, atividade])
  }, [])

  const atualizar = useCallback((atividade: AtividadeFormulario) => {
    setAtividades((atual) =>
      atual.map((item) => (item.id === atividade.id ? atividade : item)),
    )
  }, [])

  const remover = useCallback((id: string) => {
    setAtividades((atual) => atual.filter((item) => item.id !== id))
  }, [])

  const substituirTodas = useCallback((novas: AtividadeFormulario[]) => {
    setAtividades(novas)
  }, [])

  const valor = useMemo<ContextoAtividades>(
    () => ({ atividades, adicionar, atualizar, remover, substituirTodas }),
    [atividades, adicionar, atualizar, remover, substituirTodas],
  )

  return (
    <ContextoAtividadesReact.Provider value={valor}>{children}</ContextoAtividadesReact.Provider>
  )
}
