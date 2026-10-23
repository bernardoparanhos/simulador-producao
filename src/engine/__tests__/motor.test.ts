/**
 * Verificação do motor contra as fórmulas recebidas.
 *
 * O que estes testes provam: o código implementa exatamente as fórmulas do
 * briefing da Fase 2, e a sequência dirige a produção como decidido.
 *
 * O que estes testes **não** provam: que as fórmulas batem com a planilha. Essa
 * é a Parada P1, em `robo.test.ts`, e depende dos números do robô. Enquanto a
 * P1 não rodar, este arquivo é a única rede de segurança do motor — qualquer
 * refatoração que mude um número aparece aqui.
 *
 * Os valores esperados foram conferidos à mão a partir do cenário sintético de
 * `src/fixtures/exemplo.ts`, cujo cabeçalho mostra a tabela completa.
 */

import { describe, expect, it } from 'vitest'

import {
  calcularAtividade,
  calcularDiasNoPeriodo,
  calcularTaxaAprovacao,
  calcularTempoDisponivel,
  calcularTempoInspecaoPorPecaMin,
  classificarOcupacao,
  propagarGargalo,
  simular,
} from '@/engine'
import { atividadesExemplo, cenarioExemplo, exemplo, sequenciaExemplo } from '@/fixtures'
import type { Atividade, ResultadoPorAtividade } from '@/types'

/** Precisão usada nas comparações de ponto flutuante: nove casas decimais. */
const CASAS = 9

/** Localiza o resultado de uma atividade pelo id — nunca pelo índice. */
function resultadoDe(
  resultados: readonly ResultadoPorAtividade[],
  atividadeId: string,
): ResultadoPorAtividade {
  const resultado = resultados.find((r) => r.atividadeId === atividadeId)
  if (resultado === undefined) throw new Error(`atividade ${atividadeId} ausente nos resultados`)
  return resultado
}

describe('calcularTempoDisponivel', () => {
  it('desconta refeições, descanso e troca de turno do turno bruto', () => {
    // (480 - 60*1 - 20 - 10) * 1 turno * 1 dia = 390
    expect(calcularTempoDisponivel(cenarioExemplo)).toBe(390)
  })

  it('multiplica pelos turnos diários', () => {
    const doisTurnos = { ...cenarioExemplo, turnosDiarios: 2 }
    expect(calcularTempoDisponivel(doisTurnos)).toBe(780)
  })

  it('conta duas refeições quando o turno concede duas', () => {
    const duasRefeicoes = { ...cenarioExemplo, numRefeicoesPorTurno: 2 }
    // 480 - 60*2 - 20 - 10 = 330
    expect(calcularTempoDisponivel(duasRefeicoes)).toBe(330)
  })
})

describe('calcularDiasNoPeriodo', () => {
  it('lê o campo como dias quando a periodicidade é diária', () => {
    expect(calcularDiasNoPeriodo('Diario', 20)).toBe(20)
  })

  it('converte semanas em dias a 5 dias úteis por semana', () => {
    expect(calcularDiasNoPeriodo('Semanal', 4)).toBe(20)
  })

  it('converte meses em dias a 22 dias úteis por mês', () => {
    expect(calcularDiasNoPeriodo('Mensal', 1)).toBe(22)
  })

  it('a periodicidade multiplica o tempo disponível', () => {
    expect(calcularTempoDisponivel({ ...cenarioExemplo, periodicidade: 'Semanal' })).toBe(1950)
    expect(calcularTempoDisponivel({ ...cenarioExemplo, periodicidade: 'Mensal' })).toBe(8580)
  })
})

describe('calcularAtividade', () => {
  const primeira = atividadesExemplo[0] as Atividade

  it('aplica fator de ritmo e fator de tolerância ao tempo cronometrado', () => {
    const comFatores: Atividade = { ...primeira, fatorRitmo: 102, fatorTolerancia: 7 }
    const resultado = calcularAtividade(comFatores, cenarioExemplo, 390)

    // 1 * 1,02 * 1,07 = 1,0914
    expect(resultado.tempoPadraoMin).toBeCloseTo(1.0914, CASAS)
  })

  it('dilui o setup no tamanho do lote, dentro do tempo de ciclo', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, 390)

    expect(resultado.tempoPadraoMin).toBe(1)
    expect(resultado.tempoCicloMin).toBe(1.5) // 1 + 10/20
  })

  it('calcula takt, ciclos, capacidade, ocupação e tempo de lote', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, 390)

    expect(resultado.taktTimeMin).toBeCloseTo(2.4375, CASAS) // (390 / (20*480)) * 60
    expect(resultado.quantidadeCiclos).toBe(24) // 480 / 20
    expect(resultado.capacidadeDiaria).toBeCloseTo(260, CASAS) // 390 / 1,5
    expect(resultado.ocupacao).toBeCloseTo(1.5 / 2.4375, CASAS)
    expect(resultado.tempoProducaoLoteMin).toBeCloseTo(36, CASAS) // 1,5 * 24
  })

  it('não inclui producaoRealizada, estoque nem gargalo: eles dependem do fluxo', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, 390)

    expect(resultado).not.toHaveProperty('producaoRealizadaDiaria')
    expect(resultado).not.toHaveProperty('estoqueFinal')
    expect(resultado).not.toHaveProperty('ehGargalo')
  })

  it('ignora numOperadores — divergência registrada em TODO(P1)', () => {
    const doisOperadores: Atividade = { ...primeira, numOperadores: 2 }
    const um = calcularAtividade(primeira, cenarioExemplo, 390)
    const dois = calcularAtividade(doisOperadores, cenarioExemplo, 390)

    // Se o campo passar a dividir o tempo de ciclo, este teste falha de
    // propósito: é o alarme de que a decisão da P1 foi aplicada.
    expect(dois.tempoCicloMin).toBe(um.tempoCicloMin)
  })
})

describe('inspeção (premissa do motor, não fórmula da planilha)', () => {
  it('não custa nada quando a porcentagem inspecionada é zero', () => {
    expect(calcularTempoInspecaoPorPecaMin(cenarioExemplo.inspecao)).toBe(0)
  })

  it('cobra o tempo médio por peça produzida, proporcional à porcentagem', () => {
    // 2 min por peça, metade das peças = 1 min por peça produzida
    expect(
      calcularTempoInspecaoPorPecaMin({ ...cenarioExemplo.inspecao, porcentagemInspecionada: 50 }),
    ).toBe(1)
  })

  it('entra no tempo de ciclo da atividade', () => {
    const comInspecao = {
      ...cenarioExemplo,
      inspecao: { ...cenarioExemplo.inspecao, porcentagemInspecionada: 50 },
    }
    const resultado = calcularAtividade(atividadesExemplo[0] as Atividade, comInspecao, 390)

    expect(resultado.tempoCicloMin).toBe(2.5) // 1 + 10/20 + 1
  })

  it('a taxa de aprovação é determinística e igual ao mínimo', () => {
    expect(calcularTaxaAprovacao({ ...cenarioExemplo.inspecao, minimoAprovacao: 95 })).toBe(0.95)
  })
})

describe('classificarOcupacao', () => {
  it('classifica abaixo de 0,85 como ok', () => {
    expect(classificarOcupacao(0)).toBe('ok')
    expect(classificarOcupacao(0.8499)).toBe('ok')
  })

  it('classifica de 0,85 a menos de 1,00 como atenção', () => {
    expect(classificarOcupacao(0.85)).toBe('atencao')
    expect(classificarOcupacao(0.9999)).toBe('atencao')
  })

  it('classifica de 1,00 para cima como acima', () => {
    expect(classificarOcupacao(1)).toBe('acima')
    expect(classificarOcupacao(1.4)).toBe('acima')
  })
})

describe('propagarGargalo', () => {
  const isolados = atividadesExemplo.map((a) => calcularAtividade(a, cenarioExemplo, 390))

  it('atividades sem predecessoras produzem a própria capacidade', () => {
    const producao = propagarGargalo(isolados, sequenciaExemplo)

    expect(producao.get('ex-01')).toBeCloseTo(260, CASAS)
    expect(producao.get('ex-02')).toBeCloseTo(195, CASAS)
  })

  it('no afunilamento vale a MENOR das que chegam, não a soma', () => {
    const producao = propagarGargalo(isolados, sequenciaExemplo)

    // ex-03 tem capacidade 780 e recebe de ex-01 (260) e ex-02 (195).
    // Soma seria 455; a regra é o mínimo: 195.
    expect(producao.get('ex-03')).toBeCloseTo(195, CASAS)
  })

  it('propaga o gargalo por toda a cadeia a jusante, não só um passo', () => {
    const producao = propagarGargalo(isolados, sequenciaExemplo)

    // ex-04 tem capacidade 390 e vem depois de ex-03, que já caiu para 195.
    expect(producao.get('ex-04')).toBeCloseTo(195, CASAS)
  })

  it('atividade fora da sequência produz a própria capacidade', () => {
    const producao = propagarGargalo(isolados, { nos: [], conexoes: [] })

    expect(producao.get('ex-03')).toBeCloseTo(780, CASAS)
  })

  it('ignora conexões que apontam para atividades inexistentes', () => {
    const producao = propagarGargalo(isolados, {
      nos: sequenciaExemplo.nos,
      conexoes: [
        ...sequenciaExemplo.conexoes,
        { id: 'fantasma', origem: 'nao-existe', destino: 'ex-04' },
      ],
    })

    expect(producao.get('ex-04')).toBeCloseTo(195, CASAS)
    expect(producao.size).toBe(4)
  })

  it('conta uma conexão repetida uma única vez', () => {
    const producao = propagarGargalo(isolados, {
      nos: sequenciaExemplo.nos,
      conexoes: [
        ...sequenciaExemplo.conexoes,
        { id: 'ex-c3-bis', origem: 'ex-03', destino: 'ex-04' },
      ],
    })

    expect(producao.get('ex-04')).toBeCloseTo(195, CASAS)
  })

  it('não trava diante de um ciclo, e resolve todas as atividades', () => {
    const producao = propagarGargalo(isolados, {
      nos: sequenciaExemplo.nos,
      conexoes: [
        { id: 'c1', origem: 'ex-01', destino: 'ex-02' },
        { id: 'c2', origem: 'ex-02', destino: 'ex-01' },
        { id: 'c3', origem: 'ex-03', destino: 'ex-04' },
      ],
    })

    expect(producao.size).toBe(4)
    for (const atividade of atividadesExemplo) {
      expect(producao.get(atividade.id)).toBeTypeOf('number')
    }
  })
})

describe('simular — cenário de exemplo de ponta a ponta', () => {
  const { global, porAtividade } = simular(exemplo)

  it('devolve um resultado por atividade, na ordem da entrada', () => {
    expect(porAtividade).toHaveLength(4)
    expect(porAtividade.map((r) => r.atividadeId)).toEqual(['ex-01', 'ex-02', 'ex-03', 'ex-04'])
  })

  it('tempo disponível e takt time', () => {
    expect(global.tempoDisponivelMin).toBe(390)
    for (const resultado of porAtividade) {
      expect(resultado.taktTimeMin).toBeCloseTo(2.4375, CASAS)
    }
  })

  it('tempos de ciclo de cada atividade', () => {
    expect(resultadoDe(porAtividade, 'ex-01').tempoCicloMin).toBeCloseTo(1.5, CASAS)
    expect(resultadoDe(porAtividade, 'ex-02').tempoCicloMin).toBeCloseTo(2, CASAS)
    expect(resultadoDe(porAtividade, 'ex-03').tempoCicloMin).toBeCloseTo(0.5, CASAS)
    expect(resultadoDe(porAtividade, 'ex-04').tempoCicloMin).toBeCloseTo(1, CASAS)
  })

  it('capacidades e produções realizadas', () => {
    const esperado = [
      { id: 'ex-01', capacidade: 260, producao: 260 },
      { id: 'ex-02', capacidade: 195, producao: 195 },
      { id: 'ex-03', capacidade: 780, producao: 195 },
      { id: 'ex-04', capacidade: 390, producao: 195 },
    ]

    for (const { id, capacidade, producao } of esperado) {
      const resultado = resultadoDe(porAtividade, id)
      expect(resultado.capacidadeDiaria).toBeCloseTo(capacidade, CASAS)
      expect(resultado.producaoRealizadaDiaria).toBeCloseTo(producao, CASAS)
    }
  })

  it('ocupação e status de cada atividade', () => {
    expect(resultadoDe(porAtividade, 'ex-01').ocupacao).toBeCloseTo(0.615384615, CASAS)
    expect(resultadoDe(porAtividade, 'ex-02').ocupacao).toBeCloseTo(0.820512821, CASAS)
    expect(resultadoDe(porAtividade, 'ex-03').ocupacao).toBeCloseTo(0.205128205, CASAS)
    expect(resultadoDe(porAtividade, 'ex-04').ocupacao).toBeCloseTo(0.41025641, CASAS)

    for (const resultado of porAtividade) {
      expect(resultado.statusOcupacao).toBe('ok')
    }
  })

  it('estoque final é a produção menos a demanda, e fica negativo quando falta', () => {
    expect(resultadoDe(porAtividade, 'ex-01').estoqueFinal).toBeCloseTo(260 - 480, CASAS)
    expect(resultadoDe(porAtividade, 'ex-02').estoqueFinal).toBeCloseTo(195 - 480, CASAS)
    expect(resultadoDe(porAtividade, 'ex-04').estoqueFinal).toBeCloseTo(195 - 480, CASAS)
  })

  it('o gargalo é a atividade de menor capacidade, e só ela', () => {
    expect(global.gargaloAtividadeId).toBe('ex-02')
    expect(porAtividade.filter((r) => r.ehGargalo).map((r) => r.atividadeId)).toEqual(['ex-02'])
  })

  it('indicadores globais', () => {
    expect(global.maiorTempoProducaoMin).toBeCloseTo(48, CASAS) // ex-02: 2 * 24
    expect(global.leadTimeMin).toBeCloseTo(48, CASAS) // alias por ora
    expect(global.eficienciaTotal).toBeCloseTo(0.512820513, CASAS) // média das ocupações
    expect(global.ocupacaoMedia).toBe(global.eficienciaTotal) // alias por ora
    expect(global.wipPecas).toBeCloseTo(480, CASAS) // reduz-se à demanda
  })

  it('eficiência e ocupação média são frações de 0 a 1, não porcentagens', () => {
    expect(global.eficienciaTotal).toBeLessThanOrEqual(1)
    expect(global.ocupacaoMedia).toBeLessThanOrEqual(1)
  })

  it('é pura: a mesma entrada devolve sempre o mesmo resultado', () => {
    expect(simular(exemplo)).toEqual(simular(exemplo))
  })
})

describe('simular — casos de borda', () => {
  it('sem atividades, devolve zeros e nenhum gargalo', () => {
    const { global, porAtividade } = simular({
      cenario: cenarioExemplo,
      atividades: [],
      sequencia: { nos: [], conexoes: [] },
    })

    expect(porAtividade).toEqual([])
    expect(global.tempoDisponivelMin).toBe(390)
    expect(global.gargaloAtividadeId).toBeNull()
    expect(global.eficienciaTotal).toBe(0)
    expect(global.ocupacaoMedia).toBe(0)
    expect(global.leadTimeMin).toBe(0)
    expect(global.wipPecas).toBe(0)
    expect(global.maiorTempoProducaoMin).toBe(0)
  })

  it('uma atividade sozinha é o próprio gargalo', () => {
    const { global, porAtividade } = simular({
      cenario: cenarioExemplo,
      atividades: [atividadesExemplo[0] as Atividade],
      sequencia: { nos: [{ atividadeId: 'ex-01' }], conexoes: [] },
    })

    expect(global.gargaloAtividadeId).toBe('ex-01')
    expect(porAtividade[0]?.ehGargalo).toBe(true)
    expect(porAtividade[0]?.producaoRealizadaDiaria).toBeCloseTo(260, CASAS)
  })

  it('mudar o fluxo muda os números — é o ponto do projeto', () => {
    // Mesmas atividades, sequência em cadeia simples em vez de afunilamento.
    const emCadeia = simular({
      ...exemplo,
      sequencia: {
        nos: sequenciaExemplo.nos,
        conexoes: [{ id: 'c1', origem: 'ex-01', destino: 'ex-03' }],
      },
    })

    // Sem ex-02 alimentando ex-03, o limite de ex-03 passa a ser ex-01 (260).
    expect(resultadoDe(emCadeia.porAtividade, 'ex-03').producaoRealizadaDiaria).toBeCloseTo(
      260,
      CASAS,
    )
    // E ex-04, agora sem predecessora, volta à própria capacidade.
    expect(resultadoDe(emCadeia.porAtividade, 'ex-04').producaoRealizadaDiaria).toBeCloseTo(
      390,
      CASAS,
    )
  })
})
