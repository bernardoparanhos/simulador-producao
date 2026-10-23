/**
 * Guarda o cenário para a árvore inteira.
 *
 * Fica acima das rotas, de propósito: o cenário precisa sobreviver à navegação
 * entre os quatro passos e ao recarregar a página. Trocar de tela não pode
 * custar o que a pessoa já preencheu.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import {
  apagarFormularioArmazenado,
  cenarioDoFormulario,
  FORMULARIO_INICIAL,
  gravarFormulario,
  lerFormularioArmazenado,
} from './cenario'
import type { FormularioCenario } from './cenario'
import { ContextoCenarioReact } from './contextoCenario'
import type { ContextoCenario } from './contextoCenario'

export function ProvedorCenario({ children }: { children: ReactNode }) {
  const [formulario, setFormulario] = useState<FormularioCenario>(lerFormularioArmazenado)

  useEffect(() => {
    gravarFormulario(formulario)
  }, [formulario])

  const alterarCampo = useCallback(
    <C extends keyof FormularioCenario>(campo: C, valor: FormularioCenario[C]) => {
      setFormulario((atual) => ({ ...atual, [campo]: valor }))
    },
    [],
  )

  const reiniciar = useCallback(() => {
    setFormulario(FORMULARIO_INICIAL)
    apagarFormularioArmazenado()
  }, [])

  const valor = useMemo<ContextoCenario>(
    () => ({
      formulario,
      alterarCampo,
      reiniciar,
      cenario: cenarioDoFormulario(formulario),
    }),
    [formulario, alterarCampo, reiniciar],
  )

  return (
    <ContextoCenarioReact.Provider value={valor}>{children}</ContextoCenarioReact.Provider>
  )
}
