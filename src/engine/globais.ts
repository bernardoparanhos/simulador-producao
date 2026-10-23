/**
 * Indicadores da simulação como um todo.
 *
 * Quarto e último passo do motor: com todas as atividades calculadas e a
 * produção já propagada pela sequência, consolidam-se os números que descrevem
 * a linha inteira.
 *
 * Fonte das fórmulas: aba RESULTADO da planilha do Simulador de Produção.
 */

import type { AtividadeId, Cenario, ResultadoGlobal } from '@/types'

import type { ResultadoAtividadeIsolada } from './atividade'

/**
 * Encontra a atividade gargalo: a de **menor capacidade** entre todas.
 *
 * ```text
 * gargaloAtividadeId = atividade com menor capacidadePeriodo
 * ```
 *
 * Note que o gargalo é definido pela capacidade, e não pela produção realizada:
 * a produção realizada de quase toda a linha tende a ser igual à do gargalo,
 * justamente porque ele a limita, o que tornaria a comparação inútil.
 *
 * Empate é resolvido pela primeira atividade da lista. Lista vazia devolve
 * `null`: sem atividades não há gargalo a apontar.
 *
 * @param resultados Resultados isolados das atividades.
 * @returns O id da atividade gargalo, ou `null` se não houver atividades.
 */
export function encontrarGargalo(
  resultados: readonly ResultadoAtividadeIsolada[],
): AtividadeId | null {
  let gargalo: ResultadoAtividadeIsolada | null = null

  for (const resultado of resultados) {
    if (gargalo === null || resultado.capacidadePeriodo < gargalo.capacidadePeriodo) {
      gargalo = resultado
    }
  }

  return gargalo?.atividadeId ?? null
}

/**
 * Consolida os indicadores globais da simulação.
 *
 * Fórmulas da planilha:
 *
 * ```text
 * maiorTempoProducaoMin = max(tempoProducaoLoteMin)
 * eficienciaTotal       = média(ocupacao)
 * ocupacaoMedia         = eficienciaTotal
 * leadTimeMin           = maiorTempoProducaoMin
 * wipPecas              = soma(quantidadeCiclos * tamanhoLote) / numAtividades
 * ```
 *
 * `eficienciaTotal` e `ocupacaoMedia` são frações de 0 a 1, como a ocupação de
 * cada atividade; converter para porcentagem é trabalho da tela.
 *
 * Sem atividades, todos os indicadores derivados valem zero — em vez de `NaN`,
 * que é o que uma média de lista vazia produziria.
 *
 * TODO(Fase 5): `ocupacaoMedia` é hoje um apelido de `eficienciaTotal`. Na
 * planilha os dois conceitos são distintos (eficiência pondera pelo tempo
 * trabalhado); enquanto a fórmula da eficiência não for separada, os dois campos
 * carregam o mesmo valor.
 *
 * TODO(Fase 5): `leadTimeMin` é hoje o maior tempo de produção de lote. O lead
 * time de verdade é a soma dos tempos ao longo do caminho mais longo da
 * sequência, que o grafo já permite calcular.
 *
 * TODO(Fase 5): a fórmula de `wipPecas` se reduz à própria demanda, porque
 * `quantidadeCiclos * tamanhoLote` é igual a `demanda` para toda atividade e a
 * soma é dividida pelo número de atividades. É uma estimativa de marcador de
 * lugar, e o briefing já a marca como tal.
 *
 * @param resultados Resultados isolados das atividades.
 * @param cenario Dados iniciais (usado para o tamanho do lote).
 * @param tempoDisponivelMin Tempo produtivo do período, em minutos.
 * @returns Os indicadores da simulação como um todo.
 */
export function calcularGlobais(
  resultados: readonly ResultadoAtividadeIsolada[],
  cenario: Cenario,
  tempoDisponivelMin: number,
): ResultadoGlobal {
  if (resultados.length === 0) {
    return {
      tempoDisponivelMin,
      eficienciaTotal: 0,
      leadTimeMin: 0,
      wipPecas: 0,
      ocupacaoMedia: 0,
      gargaloAtividadeId: null,
      maiorTempoProducaoMin: 0,
    }
  }

  const maiorTempoProducaoMin = Math.max(...resultados.map((r) => r.tempoProducaoLoteMin))

  const somaOcupacao = resultados.reduce((soma, r) => soma + r.ocupacao, 0)
  const eficienciaTotal = somaOcupacao / resultados.length

  const somaPecasEmProcesso = resultados.reduce(
    (soma, r) => soma + r.quantidadeCiclos * cenario.tamanhoLote,
    0,
  )

  return {
    tempoDisponivelMin,
    eficienciaTotal,
    leadTimeMin: maiorTempoProducaoMin,
    wipPecas: somaPecasEmProcesso / resultados.length,
    ocupacaoMedia: eficienciaTotal,
    gargaloAtividadeId: encontrarGargalo(resultados),
    maiorTempoProducaoMin,
  }
}
