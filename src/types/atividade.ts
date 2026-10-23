/**
 * Atividade — uma operação do processo produtivo.
 *
 * Equivale a uma linha do formulário ATIVIDADES da planilha. É a matéria-prima
 * do cálculo: daqui saem tempo padrão, tempo de ciclo e capacidade.
 *
 * Esta Fase define apenas a forma dos dados. O cálculo entra na Fase 2.
 */

/**
 * Identificador estável de uma atividade.
 *
 * Opaco de propósito: nada no sistema deve depender do formato da string. É
 * gerado uma vez, na criação da atividade, e nunca muda — descrição, etapa e
 * linha podem ser editadas sem invalidar as conexões da sequência nem os
 * resultados que apontam para ela.
 */
export type AtividadeId = string

/** Uma operação do processo, com os tempos cronometrados e os fatores de correção. */
export interface Atividade {
  /** Identificador estável. Ver {@link AtividadeId}. */
  id: AtividadeId

  /** Nome da atividade, como aparece nas telas e nos relatórios. Ex.: "Soldar base". */
  descricao: string

  /**
   * Etapa do processo a que a atividade pertence (1, 2, 3...).
   *
   * A etapa é a posição da atividade ao longo do fluxo: tudo que está na etapa
   * 2 só começa depois da etapa 1. Define o eixo horizontal do construtor de
   * sequência.
   */
  etapa: number

  /**
   * Linha de produção dentro da etapa (1, 2, 3...).
   *
   * Atividades da mesma etapa em linhas diferentes acontecem em paralelo.
   * Define o eixo vertical do construtor de sequência. É por aqui que o fluxo
   * afunila: várias linhas de uma etapa podem alimentar uma só linha da
   * etapa seguinte.
   */
  linha: number

  /**
   * Processo a que a atividade pertence (1, 2, 3...).
   *
   * Agrupamento da planilha, acima da etapa: um produto pode ser montado por
   * mais de um processo. No v1 os cenários têm um único processo; o campo fica
   * no modelo para não perder a informação da planilha.
   */
  processo: number

  /**
   * Tempo cronometrado da operação, em minutos por unidade (min/unid.).
   *
   * É a medição crua, de cronômetro, antes dos fatores de ritmo e tolerância.
   */
  tempoCronometradoMin: number

  /**
   * Tempo de preparação (setup) da atividade, em minutos (min).
   *
   * Pago uma vez por lote, não por peça.
   */
  setupMin: number

  /**
   * Fator de ritmo do operador, em porcentagem (%).
   *
   * Compara o ritmo observado com o ritmo normal: 100 = ritmo normal, acima de
   * 100 = mais rápido que o normal, abaixo = mais devagar. Ex.: `102`.
   */
  fatorRitmo: number

  /**
   * Fator de tolerância, em porcentagem (%).
   *
   * Acréscimo sobre o tempo normal para cobrir necessidades pessoais, fadiga e
   * esperas inevitáveis. Ex.: `7` (7% de acréscimo).
   */
  fatorTolerancia: number

  /**
   * Número de operadores (postos de trabalho) alocados na atividade.
   *
   * Postos em paralelo executando a mesma operação: 2 operadores dividem o
   * tempo de ciclo da atividade pela metade. Inteiro, mínimo 1.
   */
  numOperadores: number
}
