/**
 * Prévia ao vivo de uma atividade sendo editada.
 *
 * Alimenta o card "PRÉVIA DO RESULTADO · AO VIVO" do drawer: enquanto a pessoa
 * digita o tempo cronometrado, ela vê o tempo padrão, o tempo de ciclo e a
 * ocupação que aquela atividade teria. É o "passos claros" do plano levado ao
 * campo individual — ninguém digita um número sem ver o que ele causa.
 *
 * **Não duplica fórmula.** Chama `calcularAtividade` do motor, a mesma função
 * que roda na Parada P1. Se a fórmula mudar, a prévia muda junto, sem ninguém
 * precisar lembrar de atualizar a tela.
 */

import { useMemo } from 'react'

import { calcularAtividade, calcularTempoDisponivel } from '@/engine'
import { useCenario } from '@/state'
import type { AtividadeFormulario } from '@/state'
import type { StatusOcupacao } from '@/types'
import { getStatusOcupacao } from '@/utils/ocupacaoStatus'

/** O que a prévia mostra. */
export interface PreviewAtividade {
  /** Tempo cronometrado com ritmo e tolerância aplicados, em minutos (min). */
  tempoPadraoMin: number
  /** Tempo padrão mais o setup diluído no lote, em minutos (min). */
  tempoCicloMin: number
  /** Ocupação da atividade, fração em que 1 é 100%. Pode passar de 1. */
  ocupacao: number
  /** A faixa de cor da ocupação, pelos cortes da tela. */
  status: StatusOcupacao
}

/**
 * Calcula a prévia de uma atividade em edição.
 *
 * Devolve `null` quando o resultado não teria sentido:
 *
 * - **cenário sem demanda ou sem lote** — a ocupação dividiria por zero, e a
 *   tela mostra "preencha o Cenário primeiro" em vez de `Infinity`;
 * - **turno líquido zerado** — refeições e troca de turno comeram o turno
 *   inteiro, então não há tempo disponível para ocupar;
 * - **tempo cronometrado ainda não informado** — a atividade acabou de ser
 *   criada e não há o que prever.
 *
 * O `null` é um estado legítimo da tela, não um erro: significa "ainda não dá
 * para dizer".
 *
 * @param atividade A atividade como está no drawer agora.
 * @returns A prévia, ou `null` enquanto não houver o que calcular.
 */
export function usePreviewAtividade(atividade: AtividadeFormulario): PreviewAtividade | null {
  const { cenario } = useCenario()

  return useMemo(() => {
    if (cenario.demanda <= 0 || cenario.tamanhoLote <= 0) return null
    if (atividade.tempoCronometradoMin <= 0) return null

    const tempoDisponivelMin = calcularTempoDisponivel(cenario)
    if (tempoDisponivelMin <= 0) return null

    const resultado = calcularAtividade(atividade, cenario, tempoDisponivelMin)

    return {
      tempoPadraoMin: resultado.tempoPadraoMin,
      tempoCicloMin: resultado.tempoCicloMin,
      ocupacao: resultado.ocupacao,
      status: getStatusOcupacao(resultado.ocupacao),
    }
  }, [atividade, cenario])
}
