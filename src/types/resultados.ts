/**
 * Resultados — o que o motor devolve.
 *
 * Equivale ao que a planilha calcula nas abas RELATÓRIO, ESTOQUES (2),
 * ESTOQUE FINAL e RESULTADO. Nada aqui é preenchido pela pessoa: tudo é
 * derivado de cenário + atividades + sequência.
 *
 * Esta Fase define apenas a forma dos dados. As fórmulas entram na Fase 2.
 */

import type { AtividadeId } from './atividade'

/**
 * Classificação da ocupação de uma atividade, para leitura rápida na tela.
 *
 * - `'ok'` — ocupação dentro do esperado.
 * - `'atencao'` — ocupação alta, perto do limite.
 * - `'acima'` — ocupação acima do limite aceitável.
 *
 * As faixas de corte são aplicadas pelo motor, em
 * `src/engine/atividade.ts`: abaixo de 0,85 é `'ok'`, abaixo de 1,00 é
 * `'atencao'`, de 1,00 para cima é `'acima'`.
 *
 * TODO(Fase 5): confirmar as faixas contra a planilha. São provisórias.
 */
export type StatusOcupacao = 'ok' | 'atencao' | 'acima'

/** Resultados calculados para uma atividade. */
export interface ResultadoPorAtividade {
  /** Atividade a que este resultado se refere. */
  atividadeId: AtividadeId

  /**
   * Tempo padrão da operação, em minutos por unidade (min/unid.).
   *
   * O tempo cronometrado depois de aplicados o fator de ritmo e o fator de
   * tolerância da atividade.
   */
  tempoPadraoMin: number

  /**
   * Tempo de ciclo da atividade, em minutos por unidade (min/unid.).
   *
   * O tempo padrão distribuído entre os postos de trabalho da atividade: é o
   * intervalo com que ela entrega uma peça.
   */
  tempoCicloMin: number

  /** Capacidade de produção da atividade, em unidades por dia (unid./dia). */
  capacidadeDiaria: number

  /**
   * Takt time, em minutos por unidade (min/unid.).
   *
   * O ritmo que a demanda exige: tempo disponível dividido pela demanda. É a
   * régua contra a qual o tempo de ciclo é comparado.
   */
  taktTimeMin: number

  /**
   * Tempo para a atividade produzir um lote inteiro, em minutos (min).
   *
   * Inclui o setup da atividade, pago uma vez por lote.
   */
  tempoProducaoLoteMin: number

  /**
   * Ocupação da atividade, como **fração de 0 a 1**.
   *
   * `0,85` = 85% ocupada. Todo o modelo usa fração; converter para porcentagem
   * é responsabilidade da camada de tela, nunca do motor.
   */
  ocupacao: number

  /** Leitura da {@link ResultadoPorAtividade.ocupacao}. Ver {@link StatusOcupacao}. */
  statusOcupacao: StatusOcupacao

  /** Quantidade de ciclos que a atividade executa no período. */
  quantidadeCiclos: number

  /**
   * Produção efetivamente realizada pela atividade, em unidades por dia
   * (unid./dia).
   *
   * Diferente da capacidade: a capacidade é o que a atividade poderia fazer
   * isolada; a produção realizada é o que ela consegue fazer dentro do fluxo,
   * limitada pelo gargalo que a sequência define.
   */
  producaoRealizadaDiaria: number

  /**
   * Estoque acumulado na saída da atividade, em unidades (unid.).
   *
   * Sobra quando a atividade produz mais do que a atividade seguinte consegue
   * consumir. É o sintoma visível do gargalo.
   */
  estoqueFinal: number

  /**
   * `true` quando esta é a atividade gargalo — a que limita a produção de todo
   * o fluxo.
   *
   * Redundante com {@link ResultadoGlobal.gargaloAtividadeId} de propósito:
   * evita que cada linha da tabela de resultados precise consultar o resultado
   * global para saber se deve se destacar.
   */
  ehGargalo: boolean
}

/** Resultados calculados para a simulação como um todo. */
export interface ResultadoGlobal {
  /**
   * Tempo produtivo disponível no período, em minutos (min).
   *
   * **Calculado, não informado.** Sai da jornada do cenário: duração do turno
   * × turnos diários, menos refeições, descanso e troca de turno. É o insumo do
   * takt time e da capacidade.
   */
  tempoDisponivelMin: number

  /**
   * Eficiência total da linha, como **fração de 0 a 1**.
   *
   * Média das ocupações das atividades. `0,875` = 87,5%.
   */
  eficienciaTotal: number

  /**
   * Lead time: tempo total para uma unidade atravessar o fluxo inteiro, da
   * primeira à última atividade, em minutos (min).
   */
  leadTimeMin: number

  /**
   * Work in process: material em processamento dentro do fluxo, em peças
   * (unid.).
   */
  wipPecas: number

  /**
   * Ocupação média das atividades, como **fração de 0 a 1**.
   *
   * `0,724` = 72,4%.
   */
  ocupacaoMedia: number

  /**
   * Atividade gargalo — a que limita a produção de todo o fluxo —, ou `null`
   * quando não há como determinar (nenhuma atividade no fluxo).
   */
  gargaloAtividadeId: AtividadeId | null

  /**
   * Maior tempo de produção de lote entre todas as atividades, em minutos
   * (min).
   *
   * É o tempo da atividade gargalo e, por isso, o que dita o ritmo do fluxo.
   */
  maiorTempoProducaoMin: number
}

/** O retorno completo do motor de cálculo. */
export interface ResultadoSimulacao {
  /** Indicadores da simulação como um todo. */
  global: ResultadoGlobal

  /**
   * Um resultado por atividade.
   *
   * A ordem acompanha a de `EntradaSimulacao.atividades`; para localizar uma
   * atividade específica, use o `atividadeId`, não o índice.
   */
  porAtividade: ResultadoPorAtividade[]
}
