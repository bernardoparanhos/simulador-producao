/**
 * Motor de cálculo do simulador.
 *
 * Regra desta pasta: TypeScript puro, sem React, sem acesso ao DOM e sem
 * dependência de nenhuma biblioteca de UI. Recebe dados de entrada, devolve
 * resultados. Isso mantém o cálculo testável de forma isolada e permite que a
 * mesma lógica seja reaproveitada por qualquer tela.
 *
 * ## Os quatro passos
 *
 * ```text
 * 1. tempo.ts      tempo disponível no período        (jornada -> minutos)
 * 2. atividade.ts  cada atividade isolada             (tempos, takt, ocupação)
 * 3. sequencia.ts  propagação do gargalo pelo grafo   (produção realizada)
 * 4. globais.ts    consolidação da linha              (gargalo, eficiência)
 * ```
 *
 * A ordem não é arbitrária: cada passo consome o anterior. O tempo disponível é
 * insumo de toda atividade; as capacidades das atividades são insumo da
 * propagação; e os indicadores globais só fecham quando todas as atividades
 * estão calculadas.
 *
 * ## O que o motor não faz
 *
 * Não valida a entrada. Demanda zero, lote zero, grafo com ciclo ou conexão
 * apontando para atividade inexistente são aceitos: o motor calcula o que der e
 * segue. Validar é trabalho da camada de entrada (Fases 3 e 4), que tem como
 * avisar a pessoa na tela. A única concessão são os limites defensivos descritos
 * em `propagarGargalo` e `calcularGlobais`, que existem para o motor não travar.
 *
 * Divergências entre as fórmulas recebidas e o modelo de dados estão
 * registradas em `docs/fases/fase-2.md` e marcadas com `TODO(P1)` no código.
 */

import type { EntradaSimulacao, ResultadoPorAtividade, ResultadoSimulacao } from '@/types'

import { calcularAtividade } from './atividade'
import { calcularGlobais } from './globais'
import { propagarGargalo } from './sequencia'
import { calcularTempoDisponivel } from './tempo'

export { calcularAtividade, classificarOcupacao } from './atividade'
export type { ResultadoAtividadeIsolada } from './atividade'
export { calcularGlobais, encontrarGargalo } from './globais'
export { propagarGargalo } from './sequencia'
export {
  calcularDiasNoPeriodo,
  calcularTaxaAprovacao,
  calcularTempoDisponivel,
  calcularTempoInspecaoPorPecaMin,
} from './tempo'

/**
 * Roda a simulação completa: recebe cenário, atividades e sequência, devolve os
 * indicadores.
 *
 * É a única função que a interface precisa conhecer. Pura e determinística: a
 * mesma entrada devolve sempre a mesma saída, sem estado, sem efeito colateral
 * e sem sorteio (ver `calcularTaxaAprovacao` para o sorteio que a planilha faz
 * e este motor ainda não faz).
 *
 * ```ts
 * const resultado = simular({ cenario, atividades, sequencia })
 * resultado.global.gargaloAtividadeId
 * resultado.porAtividade[0]?.ocupacao
 * ```
 *
 * A ordem de `porAtividade` acompanha a de `entrada.atividades`. Para localizar
 * uma atividade específica, use o `atividadeId` — nunca o índice.
 *
 * @param entrada Cenário, atividades e sequência.
 * @returns Indicadores globais e um resultado por atividade.
 */
export function simular(entrada: EntradaSimulacao): ResultadoSimulacao {
  const { cenario, atividades, sequencia } = entrada

  const tempoDisponivelMin = calcularTempoDisponivel(cenario)

  const isolados = atividades.map((atividade) =>
    calcularAtividade(atividade, cenario, tempoDisponivelMin),
  )

  const producaoPor = propagarGargalo(isolados, sequencia)
  const global = calcularGlobais(isolados, cenario, tempoDisponivelMin)

  const porAtividade: ResultadoPorAtividade[] = isolados.map((isolado) => {
    const producaoRealizadaDiaria = producaoPor.get(isolado.atividadeId) ?? isolado.capacidadeDiaria

    return {
      ...isolado,
      producaoRealizadaDiaria,
      estoqueFinal: producaoRealizadaDiaria - cenario.demanda,
      ehGargalo: isolado.atividadeId === global.gargaloAtividadeId,
    }
  })

  return { global, porAtividade }
}
