/**
 * Entrada da simulação — os três blocos de dados que o motor recebe.
 *
 * Fecha o caminho dos dados do plano de construção: Cenário + Atividades +
 * Sequência entram; os Resultados saem. Juntar os três num tipo só dá ao motor
 * uma assinatura única e estável a partir da Fase 2:
 *
 * ```ts
 * function simular(entrada: EntradaSimulacao): ResultadoSimulacao
 * ```
 *
 * Esta Fase define apenas a forma dos dados. O motor entra na Fase 2.
 */

import type { Atividade } from './atividade'
import type { Cenario } from './cenario'
import type { Sequencia } from './sequencia'

/** Tudo que o motor de cálculo precisa para produzir um resultado. */
export interface EntradaSimulacao {
  /** Dados iniciais: demanda, jornada, inspeção e paradas. */
  cenario: Cenario

  /**
   * Catálogo de atividades do processo.
   *
   * Cada `id` é único na lista. Uma atividade pode existir aqui sem estar na
   * sequência — nesse caso está cadastrada, mas fora do fluxo.
   */
  atividades: Atividade[]

  /** O fluxo: quais atividades se conectam e em que sentido. */
  sequencia: Sequencia
}
