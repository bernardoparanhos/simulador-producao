/**
 * Parada P1 — o caso do robô contra a planilha.
 *
 * A parada de teste que o plano de construção define para o fim da Fase 2:
 * entra o cenário do robô, saem os números, e eles têm que bater com os da
 * planilha `SIMULADOR DE PRODUÇÃO ROBÔ.xlsm`.
 *
 * - **Entrada:** `src/fixtures/robo.ts`, das abas DADOS INICIAIS e DADOS
 *   (formulário ATIVIDADES).
 * - **Gabarito:** a tabela {@link GABARITO} abaixo, da aba RELATÓRIO.
 *
 * ## O que esta parada provou
 *
 * Duas fórmulas da Fase 2 estavam erradas e foram corrigidas:
 *
 * 1. O tempo disponível **não desconta o descanso** (divergência D-10).
 * 2. A ocupação **não usa o takt time**: é `tempoCicloMin * demanda /
 *    tempoDisponivelMin` (divergência D-11).
 *
 * E uma premissa da Fase 2 estava errada: a inspeção **não entra no tempo de
 * ciclo** (divergência D-13). O tempo de ciclo da atividade `'111'` no relatório
 * é exatamente `6,2216 + 1/20 = 6,2716`, sem folga para parcela alguma.
 *
 * ## O que esta parada NÃO prova
 *
 * O fluxograma da planilha estava vazio, então o robô não tem sequência. Logo a
 * P1 não exercita a propagação do gargalo pelo grafo — que é a melhoria central
 * do projeto. Isso é testado com o cenário sintético em `motor.test.ts`, e vai
 * ao caso real na Parada P3.
 *
 * Também não resolve a divergência D-1 (`numOperadores` fora das fórmulas):
 * todas as 15 atividades do robô têm um operador só, então o cenário daria o
 * mesmo resultado nas duas leituras.
 */

import { describe, expect, it } from 'vitest'

import { simular } from '@/engine'
import { atividadesRobo, cenarioRobo, robo } from '@/fixtures'
import type { ResultadoPorAtividade } from '@/types'

/** Tempo produtivo do período, da planilha: `(480 - 30 * 2 - 20) * 2 * 7`. */
const TEMPO_DISPONIVEL_ESPERADO = 5600

/** Takt time da planilha, igual para todas as atividades: `(5600 / (20 * 400)) * 60`. */
const TAKT_ESPERADO = 42

/** Atividade que a planilha aponta como gargalo — a de menor capacidade. */
const GARGALO_ESPERADO = '112'

/** Tolerância para valores fracionários (tempos, ocupação). */
const TOL_FRACAO = 0.001

/** Tolerância para capacidades, que o gabarito traz com duas casas decimais. */
const TOL_CAPACIDADE = 0.01

/**
 * Gabarito da aba RELATÓRIO da planilha do robô.
 *
 * A coluna `producao` não aparece separada no gabarito porque, sem fluxograma,
 * a produção realizada é igual à capacidade — o que é verificado num teste
 * próprio.
 */
const GABARITO = [
  { id: '111', tempoPadrao: 6.2216, tempoCiclo: 6.2716, capacidade: 892.91, ocupacao: 0.44797 },
  { id: '112', tempoPadrao: 16.09536, tempoCiclo: 16.14536, capacidade: 346.85, ocupacao: 1.15324 },
  { id: '211', tempoPadrao: 8.9082, tempoCiclo: 8.9582, capacidade: 625.13, ocupacao: 0.63987 },
  { id: '121', tempoPadrao: 9.2819, tempoCiclo: 9.3319, capacidade: 600.09, ocupacao: 0.66656 },
  { id: '122', tempoPadrao: 4.8278, tempoCiclo: 4.8778, capacidade: 1148.06, ocupacao: 0.34842 },
  { id: '123', tempoPadrao: 4.24604, tempoCiclo: 4.29604, capacidade: 1303.53, ocupacao: 0.30686 },
  { id: '124', tempoPadrao: 11.5645, tempoCiclo: 11.6145, capacidade: 482.16, ocupacao: 0.82961 },
  { id: '131', tempoPadrao: 4.9086, tempoCiclo: 4.9586, capacidade: 1129.35, ocupacao: 0.35418 },
  { id: '132', tempoPadrao: 9.15868, tempoCiclo: 9.20868, capacidade: 608.12, ocupacao: 0.65776 },
  { id: '133', tempoPadrao: 7.74468, tempoCiclo: 7.79468, capacidade: 718.44, ocupacao: 0.55676 },
  { id: '134', tempoPadrao: 9.82124, tempoCiclo: 9.87124, capacidade: 567.3, ocupacao: 0.70509 },
  { id: '135', tempoPadrao: 12.54218, tempoCiclo: 12.59218, capacidade: 444.72, ocupacao: 0.89944 },
  { id: '221', tempoPadrao: 13.7158, tempoCiclo: 13.7658, capacidade: 406.81, ocupacao: 0.98327 },
  { id: '311', tempoPadrao: 9.03344, tempoCiclo: 9.08344, capacidade: 616.51, ocupacao: 0.64882 },
  { id: '312', tempoPadrao: 8.05374, tempoCiclo: 8.10374, capacidade: 691.04, ocupacao: 0.57884 },
] as const

const { global, porAtividade } = simular(robo)

/**
 * Compara um valor calculado com o da planilha, dentro de uma tolerância.
 *
 * Preferida a `toBeCloseTo` porque o gabarito vem arredondado da planilha: a
 * tolerância precisa ser a do dado, não uma potência de dez. A mensagem nomeia
 * a atividade e o campo, para a falha dizer de onde veio.
 */
function esperarProximo(
  real: number,
  esperado: number,
  tolerancia: number,
  rotulo: string,
): void {
  expect(
    Math.abs(real - esperado),
    `${rotulo}: planilha ${esperado}, motor ${real} (tolerância ${tolerancia})`,
  ).toBeLessThanOrEqual(tolerancia)
}

/** Localiza o resultado de uma atividade pelo id — nunca pelo índice. */
function resultadoDe(atividadeId: string): ResultadoPorAtividade {
  const resultado = porAtividade.find((r) => r.atividadeId === atividadeId)
  if (resultado === undefined) throw new Error(`atividade ${atividadeId} ausente nos resultados`)
  return resultado
}

describe('Parada P1 — caso do robô contra a planilha', () => {
  it('o cenário tem as 15 atividades da planilha', () => {
    expect(atividadesRobo).toHaveLength(15)
    expect(porAtividade).toHaveLength(15)
    expect(GABARITO).toHaveLength(15)
  })

  it('tempoDisponivelMin bate com a planilha: 5600 min', () => {
    expect(global.tempoDisponivelMin).toBe(TEMPO_DISPONIVEL_ESPERADO)
  })

  it('taktTimeMin bate com a planilha: 42 min, igual para todas as atividades', () => {
    for (const resultado of porAtividade) {
      esperarProximo(resultado.taktTimeMin, TAKT_ESPERADO, TOL_FRACAO, `takt de ${resultado.atividadeId}`)
    }
  })

  it('tempoPadraoMin e tempoCicloMin batem com a planilha, nas 15 atividades', () => {
    for (const esperado of GABARITO) {
      const real = resultadoDe(esperado.id)
      esperarProximo(real.tempoPadraoMin, esperado.tempoPadrao, TOL_FRACAO, `tempoPadrao de ${esperado.id}`)
      esperarProximo(real.tempoCicloMin, esperado.tempoCiclo, TOL_FRACAO, `tempoCiclo de ${esperado.id}`)
    }
  })

  it('capacidadePeriodo bate com a planilha, nas 15 atividades', () => {
    for (const esperado of GABARITO) {
      const real = resultadoDe(esperado.id)
      esperarProximo(real.capacidadePeriodo, esperado.capacidade, TOL_CAPACIDADE, `capacidade de ${esperado.id}`)
    }
  })

  it('ocupacao bate com a planilha, nas 15 atividades', () => {
    for (const esperado of GABARITO) {
      const real = resultadoDe(esperado.id)
      esperarProximo(real.ocupacao, esperado.ocupacao, TOL_FRACAO, `ocupacao de ${esperado.id}`)
    }
  })

  it('gargaloAtividadeId é a atividade 112, a de menor capacidade', () => {
    expect(global.gargaloAtividadeId).toBe(GARGALO_ESPERADO)
    expect(porAtividade.filter((r) => r.ehGargalo).map((r) => r.atividadeId)).toEqual([
      GARGALO_ESPERADO,
    ])
  })

  it('producaoRealizadaDiaria é igual à capacidade: sem fluxograma, nada limita', () => {
    // A planilha não tem sequência, então nenhuma atividade tem predecessora e
    // a propagação do gargalo não tem por onde agir. É o comportamento esperado,
    // e é a razão de ser do projeto: na planilha o fluxo não alimenta o cálculo.
    for (const resultado of porAtividade) {
      expect(resultado.producaoRealizadaDiaria).toBe(resultado.capacidadePeriodo)
    }
  })

  it('estoqueFinal é a produção menos a demanda, nas 15 atividades', () => {
    // O gabarito não traz coluna de estoque; os esperados saem da capacidade da
    // planilha menos a demanda do cenário, que é a definição do campo.
    for (const esperado of GABARITO) {
      const real = resultadoDe(esperado.id)
      esperarProximo(
        real.estoqueFinal,
        esperado.capacidade - cenarioRobo.demanda,
        TOL_CAPACIDADE,
        `estoqueFinal de ${esperado.id}`,
      )
    }

    // A atividade gargalo é a única que não atende a demanda.
    expect(resultadoDe(GARGALO_ESPERADO).estoqueFinal).toBeLessThan(0)
  })
})
