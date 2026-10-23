/**
 * Tempo disponível e tempos derivados da jornada.
 *
 * Primeiro passo do motor: antes de calcular qualquer atividade, é preciso
 * saber quanto tempo produtivo existe no período. Esse número alimenta o takt
 * time, a capacidade e a ocupação de todas as atividades.
 *
 * Fonte das fórmulas: aba DADOS INICIAIS da planilha
 * `SIMULADOR DE PRODUÇÃO ROBÔ.xlsm`, confirmada na Parada P1.
 */

import type { Cenario, Inspecao, Periodicidade } from '@/types'

/**
 * Quantos períodos de trabalho o campo `diasOuSemanasNoMes` representa.
 *
 * | Periodicidade | Multiplicador             |
 * | ------------- | ------------------------- |
 * | `'Diario'`    | `diasOuSemanasNoMes`      |
 * | `'Semanal'`   | `diasOuSemanasNoMes`      |
 * | `'Mensal'`    | `diasOuSemanasNoMes * 22` |
 *
 * TODO(D-12): `'Semanal'` usa o valor **direto**, sem multiplicar por 5 dias
 * úteis, ao contrário do que o briefing da Fase 2 dizia. O cenário do robô
 * prova: periodicidade `'Semanal'`, `diasOuSemanasNoMes` igual a 7, e a
 * planilha mostra 5600 min — que é `400 * 2 * 7`. Com o fator 5 daria 28000.
 *
 * Consequência a confirmar: como `'Diario'` e `'Semanal'` passaram a usar o
 * mesmo multiplicador, o campo `periodicidade` só distingue `'Mensal'` dos
 * outros dois. E o fator 22 de `'Mensal'` **não foi verificado contra a
 * planilha** — nenhum cenário mensal foi extraído. Ver `docs/fases/fase-2.md`.
 *
 * @param periodicidade Base de tempo do cenário.
 * @param diasOuSemanasNoMes Valor informado no cenário.
 * @returns Multiplicador de períodos de trabalho.
 */
export function calcularDiasNoPeriodo(
  periodicidade: Periodicidade,
  diasOuSemanasNoMes: number,
): number {
  switch (periodicidade) {
    case 'Diario':
      return diasOuSemanasNoMes
    case 'Semanal':
      return diasOuSemanasNoMes
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
 *    - trocaTurnoMin)
 *   * turnosDiarios
 *   * diasNoPeriodo
 * ```
 *
 * Em palavras: do turno bruto saem as refeições e a troca de turno; o que sobra
 * é o turno líquido, multiplicado pelos turnos do dia e pelo multiplicador do
 * período.
 *
 * Conferido contra a planilha do robô: `(480 - 30 * 2 - 20) * 2 * 7 = 5600`.
 *
 * Este é o único lugar do motor que calcula o tempo disponível — o campo não
 * existe no `Cenario` justamente porque é resultado, não entrada.
 *
 * TODO(D-10): `tempoDescansoMin` **não entra nesta fórmula**. O campo existe no
 * modelo de dados e no cenário do robô (20 min), mas a planilha não o desconta:
 * descontá-lo daria 5320, e a planilha mostra 5600. Ou a planilha esquece o
 * descanso, ou ele já está dentro de outro desconto. A decidir com o professor.
 *
 * TODO(D-5): a parada não planejada também não entra. Nenhuma fórmula foi
 * recebida para ela, e o cenário do robô não tem nenhuma registrada, então a
 * Parada P1 não ajudou a decidir. Aplicá-la exigiria um tempo disponível **por
 * atividade**, e a fórmula da capacidade usa o tempo disponível global.
 *
 * @param cenario Dados iniciais da simulação.
 * @returns Tempo produtivo no período, em minutos.
 */
export function calcularTempoDisponivel(cenario: Cenario): number {
  const turnoLiquidoMin =
    cenario.tempoTurnoMin -
    cenario.tempoRefeicaoMin * cenario.numRefeicoesPorTurno -
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
 * Inspecionar 20% das peças a 1 min cada custa, em média, 0,2 min por peça
 * produzida.
 *
 * **Esta função não é usada pelo motor.** Na Fase 2 ela somava ao tempo de
 * ciclo de cada atividade, como premissa documentada. A Parada P1 provou que a
 * planilha não faz isso: para a atividade `'111'`, o tempo de ciclo do relatório
 * é exatamente `6,2216 + 1/20 = 6,2716`, sem folga para parcela de inspeção
 * alguma. O termo foi removido de `calcularAtividade`.
 *
 * Mantida exportada porque o cálculo em si continua correto e a inspeção tem de
 * entrar em algum lugar — só não no tempo de ciclo.
 *
 * TODO(D-13): descobrir onde a planilha usa a inspeção. Ela tem três
 * parâmetros preenchidos no robô (20% das peças, 1 min por peça, 90% de
 * aprovação mínima) e nenhum deles afeta número nenhum do relatório.
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
 * Determinística, conforme a decisão 5 do briefing da Fase 2: a aprovação é
 * sempre igual a `minimoAprovacao`, sem sorteio.
 *
 * **Esta função não é usada pelo motor** — nenhuma fórmula recebida a consome, e
 * a P1 confirmou que a aprovação não aparece em nenhum número do relatório.
 *
 * TODO(D-13): decidir se a produção realizada deve ser multiplicada por esta
 * taxa e, nesse caso, se o estoque final conta peças produzidas ou aprovadas.
 *
 * TODO(Fase 7): tornar aleatória, como na planilha, que sorteia a aprovação a
 * cada rodada. Quando isso acontecer, a simulação deixa de ser determinística e
 * os testes da P1 precisam de semente fixa.
 *
 * @param inspecao Parâmetros de inspeção do cenário.
 * @returns Taxa de aprovação, fração de 0 a 1.
 */
export function calcularTaxaAprovacao(inspecao: Inspecao): number {
  return inspecao.minimoAprovacao / 100
}
