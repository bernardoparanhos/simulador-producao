/**
 * Cenário — os dados iniciais da simulação.
 *
 * Equivale à aba DADOS INICIAIS da planilha: demanda, jornada, inspeção e
 * paradas. Tudo aqui é **entrada**, preenchida pela pessoa.
 *
 * Atenção ao que NÃO está aqui: o **tempo disponível** não é campo de entrada.
 * Ele é calculado pelo motor a partir de turno, turnos diários, refeições,
 * descanso e troca de turno, e por isso mora em
 * `ResultadoGlobal.tempoDisponivelMin`.
 *
 * Esta Fase define apenas a forma dos dados. O cálculo entra na Fase 2.
 */

import type { AtividadeId } from './atividade'

/**
 * Base de tempo a que a demanda se refere.
 *
 * Diz se a {@link Cenario.demanda} informada é para um dia, uma semana ou um
 * mês, e junto com {@link Cenario.diasOuSemanasNoMes} permite ao motor
 * converter tudo para a mesma base antes de comparar com a capacidade.
 */
export type Periodicidade = 'Diario' | 'Semanal' | 'Mensal'

/** Parâmetros da inspeção de qualidade aplicada à produção. */
export interface Inspecao {
  /**
   * Fração da produção que passa por inspeção, em porcentagem (%).
   *
   * Ex.: `100` inspeciona tudo; `10` inspeciona uma peça a cada dez.
   */
  porcentagemInspecionada: number

  /** Tempo gasto para inspecionar uma peça, em minutos por peça (min/peça). */
  tempoPorPecaMin: number

  /**
   * Taxa mínima de aprovação esperada na inspeção, em porcentagem (%).
   *
   * Abaixo disso o lote é reprovado. Ex.: `95`.
   */
  minimoAprovacao: number
}

/**
 * Parada não planejada que atinge uma atividade específica.
 *
 * Representa quebra, falta de material ou qualquer interrupção não prevista na
 * jornada: tira tempo produtivo de uma atividade, não do turno inteiro.
 */
export interface ParadaNaoPlanejada {
  /**
   * Atividade atingida pela parada.
   *
   * Referência a `Atividade.id` — e não a descrição ou o índice da
   * atividade — para que renomear ou reordenar atividades não quebre o
   * cenário.
   */
  atividadeId: AtividadeId

  /** Duração da parada, em minutos (min). */
  tempoMin: number
}

/** Dados iniciais da simulação: demanda, jornada, inspeção e paradas. */
export interface Cenario {
  /**
   * Demanda a ser atendida, em unidades (unid.).
   *
   * Lida na base de tempo indicada por {@link Cenario.periodicidade}.
   */
  demanda: number

  /**
   * Tamanho do lote de produção, em unidades (unid.).
   *
   * Quantidade de peças produzidas entre dois setups. Define quantos ciclos
   * são necessários e como o `Atividade.setupMin` se dilui por peça.
   */
  tamanhoLote: number

  /** Duração de uma refeição, em minutos (min). */
  tempoRefeicaoMin: number

  /**
   * Tempo gasto na troca de turno, em minutos (min).
   *
   * Passagem de serviço entre as equipes; sai do tempo disponível.
   */
  trocaTurnoMin: number

  /** Duração bruta de um turno, em minutos (min). Ex.: `480` para 8 horas. */
  tempoTurnoMin: number

  /** Quantidade de refeições concedidas dentro de um turno. */
  numRefeicoesPorTurno: number

  /**
   * Tempo total de descanso dentro de um turno, em minutos (min).
   *
   * Pausas curtas, somadas — distintas da refeição.
   */
  tempoDescansoMin: number

  /** Quantidade de turnos trabalhados por dia (1, 2 ou 3). */
  turnosDiarios: number

  /**
   * Quantidade de dias ou semanas no mês, conforme a
   * {@link Cenario.periodicidade}.
   *
   * O significado muda com a periodicidade: dias úteis no mês para `'Diario'`,
   * semanas no mês para `'Semanal'`. Para `'Mensal'` não se aplica ao cálculo.
   */
  diasOuSemanasNoMes: number

  /** Base de tempo da demanda. Ver {@link Periodicidade}. */
  periodicidade: Periodicidade

  /** Parâmetros da inspeção de qualidade. */
  inspecao: Inspecao

  /**
   * Parada não planejada do cenário, ou `null` quando não há nenhuma.
   *
   * `null` em vez de campo opcional: um cenário sem parada é uma situação
   * normal e explícita, não um dado que faltou preencher. A planilha modela
   * uma parada por cenário; se surgir a necessidade de mais de uma, este campo
   * vira um array.
   */
  paradaNaoPlanejada: ParadaNaoPlanejada | null
}
