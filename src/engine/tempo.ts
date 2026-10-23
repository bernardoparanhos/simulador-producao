/**
 * Tempo disponível e tempos derivados da jornada.
 *
 * Primeiro passo do motor: antes de calcular qualquer atividade, é preciso
 * saber quanto tempo produtivo existe no período. Esse número alimenta o takt
 * time e a capacidade de todas as atividades.
 *
 * Fonte das fórmulas: aba DADOS INICIAIS da planilha do Simulador de Produção.
 */

import type { Cenario, Inspecao, Periodicidade } from '@/types'

/**
 * Quantos dias trabalhados o campo `diasOuSemanasNoMes` representa, conforme a
 * periodicidade do cenário.
 *
 * O campo `diasOuSemanasNoMes` muda de significado com a periodicidade — é
 * assim na planilha. Esta função resolve as duas leituras num só número de
 * dias:
 *
 * | Periodicidade | Dias no período              |
 * | ------------- | ---------------------------- |
 * | `'Diario'`    | `diasOuSemanasNoMes`         |
 * | `'Semanal'`   | `diasOuSemanasNoMes * 5`     |
 * | `'Mensal'`    | `diasOuSemanasNoMes * 22`    |
 *
 * Os fatores 5 (dias úteis na semana) e 22 (dias úteis no mês) são os valores
 * da planilha.
 *
 * @param periodicidade Base de tempo do cenário.
 * @param diasOuSemanasNoMes Valor informado no cenário.
 * @returns Dias trabalhados no período.
 */
export function calcularDiasNoPeriodo(
  periodicidade: Periodicidade,
  diasOuSemanasNoMes: number,
): number {
  switch (periodicidade) {
    case 'Diario':
      return diasOuSemanasNoMes
    case 'Semanal':
      return diasOuSemanasNoMes * 5
    case 'Mensal':
      return diasOuSemanasNoMes * 22
  }
}

/**
 * Tempo produtivo disponível no período, em minutos (min).
 *
 * Fórmula da planilha:
 *
 * ```text
 * tempoDisponivelMin =
 *   (tempoTurnoMin
 *    - tempoRefeicaoMin * numRefeicoesPorTurno
 *    - tempoDescansoMin
 *    - trocaTurnoMin)
 *   * turnosDiarios
 *   * diasNoPeriodo
 * ```
 *
 * Em palavras: do turno bruto saem as refeições, o descanso e a troca de turno;
 * o que sobra é o turno líquido, multiplicado pelos turnos do dia e pelos dias
 * do período.
 *
 * Este é o único lugar do motor que calcula o tempo disponível — o campo não
 * existe no `Cenario` justamente porque é resultado, não entrada.
 *
 * TODO(P1): a inspeção e a parada não planejada não entram nesta fórmula. Ver
 * `calcularTempoInspecaoPorPecaMin` e a seção de divergências em
 * `docs/fases/fase-2.md`.
 *
 * @param cenario Dados iniciais da simulação.
 * @returns Tempo produtivo no período, em minutos.
 */
export function calcularTempoDisponivel(cenario: Cenario): number {
  const turnoLiquidoMin =
    cenario.tempoTurnoMin -
    cenario.tempoRefeicaoMin * cenario.numRefeicoesPorTurno -
    cenario.tempoDescansoMin -
    cenario.trocaTurnoMin

  const diasNoPeriodo = calcularDiasNoPeriodo(
    cenario.periodicidade,
    cenario.diasOuSemanasNoMes,
  )

  return turnoLiquidoMin * cenario.turnosDiarios * diasNoPeriodo
}

/**
 * Tempo médio de inspeção por peça produzida, em minutos por unidade
 * (min/unid.).
 *
 * ```text
 * tempoInspecaoPorPecaMin = tempoPorPecaMin * (porcentagemInspecionada / 100)
 * ```
 *
 * Inspecionar 10% das peças a 2 min cada custa, em média, 0,2 min por peça
 * produzida. Com `porcentagemInspecionada` igual a zero o resultado é zero e a
 * inspeção não afeta nada.
 *
 * **Atenção — premissa, não fórmula da planilha.** O briefing da Fase 2 diz que
 * o tempo de inspeção "entra no cálculo" quando a porcentagem é maior que zero,
 * mas não diz em qual fórmula. O motor aplica este tempo como parcela do tempo
 * de ciclo de cada atividade (ver `calcularAtividade`), que é o único ponto
 * dimensionalmente compatível (min/unid.) entre as fórmulas recebidas.
 *
 * TODO(P1): confirmar contra a planilha onde a inspeção entra. Se ela acontece
 * num ponto único do fluxo, cobrá-la de todas as atividades superestima os
 * tempos de ciclo — é a primeira hipótese a testar se os números do robô não
 * baterem.
 *
 * @param inspecao Parâmetros de inspeção do cenário.
 * @returns Tempo de inspeção por peça produzida, em minutos.
 */
export function calcularTempoInspecaoPorPecaMin(inspecao: Inspecao): number {
  return inspecao.tempoPorPecaMin * (inspecao.porcentagemInspecionada / 100)
}

/**
 * Taxa de aprovação da inspeção, como fração de 0 a 1.
 *
 * Determinística nesta fase, conforme a decisão 5 do briefing: a aprovação é
 * sempre igual a `minimoAprovacao`, sem sorteio.
 *
 * TODO(Fase 7): tornar aleatória, como na planilha, que sorteia a aprovação a
 * cada rodada. Quando isso acontecer, a simulação deixa de ser determinística e
 * os testes de P1 precisam de semente fixa.
 *
 * TODO(P1): nenhuma das fórmulas recebidas consome esta taxa — ela é calculada
 * e não usada. Decidir se a produção realizada deve ser multiplicada por ela
 * (e, nesse caso, se o estoque é de peças aprovadas ou produzidas).
 *
 * @param inspecao Parâmetros de inspeção do cenário.
 * @returns Taxa de aprovação, fração de 0 a 1.
 */
export function calcularTaxaAprovacao(inspecao: Inspecao): number {
  return inspecao.minimoAprovacao / 100
}
