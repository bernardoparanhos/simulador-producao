/**
 * Parada P1 — o caso do robô contra a planilha.
 *
 * Esta é a parada de teste que o plano de construção define para o fim da
 * Fase 2: entra o cenário do robô, saem os números, e eles têm que bater com os
 * da planilha (tempo de ciclo, takt, ocupação, gargalo, estoque).
 *
 * # ESTADO: A P1 NÃO PODE RODAR AINDA
 *
 * Faltam os dois lados da comparação:
 *
 * 1. **A entrada.** `src/fixtures/robo.ts` não tem os dados do robô, porque
 *    eles não existem no repositório — o plano os aponta para a "especificação
 *    viva" e o "pacote de extração", que vivem fora daqui.
 * 2. **Os valores esperados.** Os resultados da planilha do robô (o gabarito)
 *    também não estão no projeto.
 *
 * Por isso cada verificação da P1 está registrada abaixo como `it.todo`: ela
 * aparece na saída do Vitest como pendente, com o nome do que falta, em vez de
 * falhar por um motivo que não é do motor nem passar sem ter testado nada.
 *
 * Enquanto isso, o motor é verificado contra as próprias fórmulas em
 * `motor.test.ts`, com um cenário sintético. Aquilo prova que o código
 * implementa as fórmulas recebidas. Só a P1 prova que as fórmulas são as da
 * planilha.
 *
 * ## Como fechar a P1
 *
 * 1. Preencher `src/fixtures/robo.ts` com os dados da planilha (o cabeçalho do
 *    arquivo lista campo por campo o que é preciso).
 * 2. Trocar cada `it.todo` abaixo por um `it` de verdade, com os valores da
 *    planilha como esperados.
 * 3. O teste de sanidade no fim deste arquivo avisa quando o passo 1 estiver
 *    feito e o passo 2 ainda não.
 */

import { describe, expect, it } from 'vitest'

import { simular } from '@/engine'
import { robo, roboEstaPendente } from '@/fixtures'

describe('Parada P1 — caso do robô contra a planilha', () => {
  it.todo('tempoPadraoMin de cada atividade bate com a planilha')
  it.todo('tempoCicloMin de cada atividade bate com a planilha')
  it.todo('taktTimeMin bate com a planilha')
  it.todo('ocupacao de cada atividade bate com a planilha')
  it.todo('gargaloAtividadeId é a atividade que a planilha aponta como gargalo')
  it.todo('estoqueFinal de cada atividade bate com a planilha')
})

describe('Parada P1 — estado do fixture', () => {
  it('o motor aceita o cenário do robô sem lançar erro, mesmo incompleto', () => {
    // Não verifica número nenhum: só garante que a forma do fixture é válida e
    // que `simular` é robusto a um cenário sem dados. Os valores saem NaN de
    // propósito — ver o cabeçalho de src/fixtures/robo.ts.
    expect(() => simular(robo)).not.toThrow()
  })

  it('AVISO: o cenário do robô ainda está pendente', () => {
    // Este teste falha de propósito no dia em que o fixture for preenchido.
    // A falha é o recado: os dados chegaram, agora troque os `it.todo` acima
    // pelos valores da planilha e apague este bloco.
    expect(
      roboEstaPendente(),
      'O fixture do robô foi preenchido. Converta os it.todo da P1 em testes reais.',
    ).toBe(true)
  })
})
