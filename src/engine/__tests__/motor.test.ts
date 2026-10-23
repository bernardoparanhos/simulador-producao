/**
 * Verificação do motor contra as fórmulas.
 *
 * Complementar a `robo.test.ts`, que compara com a planilha. Aqui o cenário é
 * sintético (`src/fixtures/exemplo.ts`) e serve para exercitar o que o caso real
 * do robô não exercita: a **propagação do gargalo pela sequência**, porque o
 * fluxograma da planilha estava vazio. Também cobre as bordas (lista vazia,
 * ciclo no grafo, conexão órfã) e os limites exatos das faixas de ocupação.
 *
 * Os valores esperados foram conferidos à mão; a tabela completa está no
 * cabeçalho de `src/fixtures/exemplo.ts`.
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

/** Tempo disponível do cenário de exemplo: `(480 - 60 - 10) * 1 * 1`. */
const DISPONIVEL = 410

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
  it('desconta refeições e troca de turno, mas NÃO o descanso (D-10)', () => {
    // (480 - 60*1 - 10) * 1 turno * 1 dia = 410
    expect(calcularTempoDisponivel(cenarioExemplo)).toBe(DISPONIVEL)

    // O campo existe no cenário e não afeta o resultado. A planilha do robô
    // confirma: descontar o descanso daria 5320, e ela mostra 5600.
    const semDescanso = { ...cenarioExemplo, tempoDescansoMin: 0 }
    const comMuitoDescanso = { ...cenarioExemplo, tempoDescansoMin: 120 }
    expect(calcularTempoDisponivel(semDescanso)).toBe(DISPONIVEL)
    expect(calcularTempoDisponivel(comMuitoDescanso)).toBe(DISPONIVEL)
  })

  it('multiplica pelos turnos diários', () => {
    const doisTurnos = { ...cenarioExemplo, turnosDiarios: 2 }
    expect(calcularTempoDisponivel(doisTurnos)).toBe(820)
  })

  it('conta duas refeições quando o turno concede duas', () => {
    const duasRefeicoes = { ...cenarioExemplo, numRefeicoesPorTurno: 2 }
    // 480 - 60*2 - 10 = 350
    expect(calcularTempoDisponivel(duasRefeicoes)).toBe(350)
  })
})

describe('calcularDiasNoPeriodo', () => {
  it('lê o campo como dias quando a periodicidade é diária', () => {
    expect(calcularDiasNoPeriodo('Diario', 20)).toBe(20)
  })

  it('usa o valor direto para semanal, sem fator de dias úteis (D-12)', () => {
    // O briefing da Fase 2 dizia x5. O robô provou que não: periodicidade
    // 'Semanal' com valor 7 dá 5600 min, que é 400 * 2 * 7.
    expect(calcularDiasNoPeriodo('Semanal', 4)).toBe(4)
  })

  it('multiplica por 22 dias úteis quando a periodicidade é mensal', () => {
    // TODO(D-12): o fator 22 não foi verificado contra a planilha — nenhum
    // cenário mensal foi extraído.
    expect(calcularDiasNoPeriodo('Mensal', 1)).toBe(22)
  })

  it('diário e semanal dão o mesmo tempo disponível; mensal multiplica por 22', () => {
    const tresPeriodos = { ...cenarioExemplo, diasOuSemanasNoMes: 3 }

    const diario = calcularTempoDisponivel({ ...tresPeriodos, periodicidade: 'Diario' })
    const semanal = calcularTempoDisponivel({ ...tresPeriodos, periodicidade: 'Semanal' })
    const mensal = calcularTempoDisponivel({ ...tresPeriodos, periodicidade: 'Mensal' })

    expect(diario).toBe(DISPONIVEL * 3)
    expect(semanal).toBe(diario) // consequência de D-12
    expect(mensal).toBe(DISPONIVEL * 3 * 22)
  })
})

describe('calcularAtividade', () => {
  const primeira = atividadesExemplo[0] as Atividade

  it('aplica fator de ritmo e fator de tolerância ao tempo cronometrado', () => {
    const comFatores: Atividade = { ...primeira, fatorRitmo: 102, fatorTolerancia: 7 }
    const resultado = calcularAtividade(comFatores, cenarioExemplo, DISPONIVEL)

    // 1 * 1,02 * 1,07 = 1,0914
    expect(resultado.tempoPadraoMin).toBeCloseTo(1.0914, CASAS)
  })

  it('dilui o setup no tamanho do lote, dentro do tempo de ciclo', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, DISPONIVEL)

    expect(resultado.tempoPadraoMin).toBe(1)
    expect(resultado.tempoCicloMin).toBe(1.5) // 1 + 10/20
  })

  it('calcula takt, ciclos, capacidade, ocupação e tempo de lote', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, DISPONIVEL)

    expect(resultado.taktTimeMin).toBeCloseTo(5.125, CASAS) // (410 / (20*240)) * 60
    expect(resultado.quantidadeCiclos).toBe(12) // 240 / 20
    expect(resultado.capacidadePeriodo).toBeCloseTo(410 / 1.5, CASAS) // 273,33
    expect(resultado.ocupacao).toBeCloseTo(360 / 410, CASAS) // (1,5 * 240) / 410
    expect(resultado.tempoProducaoLoteMin).toBeCloseTo(18, CASAS) // 1,5 * 12
  })

  it('a ocupação NÃO usa o takt time (D-11)', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, DISPONIVEL)

    // A fórmula é tempoCiclo * demanda / tempoDisponivel, que por identidade é
    // demanda / capacidade. Até a P1 o motor dividia pelo takt, o que dava
    // valores 3 vezes menores no cenário do robô.
    expect(resultado.ocupacao).toBeCloseTo(
      cenarioExemplo.demanda / resultado.capacidadePeriodo,
      CASAS,
    )
    expect(resultado.ocupacao).not.toBeCloseTo(
      resultado.tempoCicloMin / resultado.taktTimeMin,
      CASAS,
    )
  })

  it('não inclui producaoRealizada, estoque nem gargalo: eles dependem do fluxo', () => {
    const resultado = calcularAtividade(primeira, cenarioExemplo, DISPONIVEL)

    expect(resultado).not.toHaveProperty('producaoRealizadaDiaria')
    expect(resultado).not.toHaveProperty('estoqueFinal')
    expect(resultado).not.toHaveProperty('ehGargalo')
  })

  it('ignora numOperadores — divergência D-1, ainda aberta', () => {
    const doisOperadores: Atividade = { ...primeira, numOperadores: 2 }
    const um = calcularAtividade(primeira, cenarioExemplo, DISPONIVEL)
    const dois = calcularAtividade(doisOperadores, cenarioExemplo, DISPONIVEL)

    // Se o campo passar a dividir o tempo de ciclo, este teste falha de
    // propósito: é o alarme de que a decisão foi aplicada. A P1 não resolveu a
    // dúvida porque todas as atividades do robô têm um operador só.
    expect(dois.tempoCicloMin).toBe(um.tempoCicloMin)
  })
})

describe('inspeção', () => {
  it('o tempo por peça é proporcional à porcentagem inspecionada', () => {
    // 2 min por peça, metade das peças = 1 min por peça produzida
    expect(
      calcularTempoInspecaoPorPecaMin({ ...cenarioExemplo.inspecao, porcentagemInspecionada: 50 }),
    ).toBe(1)
  })

  it('não custa nada quando a porcentagem inspecionada é zero', () => {
    expect(calcularTempoInspecaoPorPecaMin(cenarioExemplo.inspecao)).toBe(0)
  })

  it('NÃO entra no tempo de ciclo da atividade (D-13)', () => {
    const comInspecao = {
      ...cenarioExemplo,
      inspecao: { ...cenarioExemplo.inspecao, porcentagemInspecionada: 50 },
    }
    const semInspecao = calcularAtividade(atividadesExemplo[0] as Atividade, cenarioExemplo, DISPONIVEL)
    const resultado = calcularAtividade(atividadesExemplo[0] as Atividade, comInspecao, DISPONIVEL)

    // Na Fase 2 o motor somava a parcela aqui, como premissa. A P1 provou que a
    // planilha não faz isso: o tempo de ciclo de '111' é exatamente
    // 6,2216 + 1/20 = 6,2716, sem folga para parcela alguma.
    expect(resultado.tempoCicloMin).toBe(semInspecao.tempoCicloMin)
    expect(resultado.tempoCicloMin).toBe(1.5)
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
  const isolados = atividadesExemplo.map((a) => calcularAtividade(a, cenarioExemplo, DISPONIVEL))

  it('atividades sem predecessoras produzem a própria capacidade', () => {
    const producao = propagarGargalo(isolados, sequenciaExemplo)

    expect(producao.get('ex-01')).toBeCloseTo(410 / 1.5, CASAS)
    expect(producao.get('ex-02')).toBeCloseTo(205, CASAS)
  })

  it('no afunilamento vale a MENOR das que chegam, não a soma', () => {
    const producao = propagarGargalo(isolados, sequenciaExemplo)

    // ex-03 tem capacidade 820 e recebe de ex-01 (273,33) e ex-02 (205).
    // Soma seria 478,33; a regra é o mínimo: 205.
    expect(producao.get('ex-03')).toBeCloseTo(205, CASAS)
  })

  it('propaga o gargalo por toda a cadeia a jusante, não só um passo', () => {
    const producao = propagarGargalo(isolados, sequenciaExemplo)

    // ex-04 tem capacidade 410 e vem depois de ex-03, que já caiu para 205.
    expect(producao.get('ex-04')).toBeCloseTo(205, CASAS)
  })

  it('atividade fora da sequência produz a própria capacidade', () => {
    const producao = propagarGargalo(isolados, { nos: [], conexoes: [] })

    expect(producao.get('ex-03')).toBeCloseTo(820, CASAS)
  })

  it('ignora conexões que apontam para atividades inexistentes', () => {
    const producao = propagarGargalo(isolados, {
      nos: sequenciaExemplo.nos,
      conexoes: [
        ...sequenciaExemplo.conexoes,
        { id: 'fantasma', origem: 'nao-existe', destino: 'ex-04' },
      ],
    })

    expect(producao.get('ex-04')).toBeCloseTo(205, CASAS)
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

    expect(producao.get('ex-04')).toBeCloseTo(205, CASAS)
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
    expect(global.tempoDisponivelMin).toBe(DISPONIVEL)
    for (const resultado of porAtividade) {
      expect(resultado.taktTimeMin).toBeCloseTo(5.125, CASAS)
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
      { id: 'ex-01', capacidade: 410 / 1.5, producao: 410 / 1.5 },
      { id: 'ex-02', capacidade: 205, producao: 205 },
      { id: 'ex-03', capacidade: 820, producao: 205 },
      { id: 'ex-04', capacidade: 410, producao: 205 },
    ]

    for (const { id, capacidade, producao } of esperado) {
      const resultado = resultadoDe(porAtividade, id)
      expect(resultado.capacidadePeriodo).toBeCloseTo(capacidade, CASAS)
      expect(resultado.producaoRealizadaDiaria).toBeCloseTo(producao, CASAS)
    }
  })

  it('ocupação e status cobrem as três faixas', () => {
    const esperado = [
      { id: 'ex-01', ocupacao: 360 / 410, status: 'atencao' },
      { id: 'ex-02', ocupacao: 480 / 410, status: 'acima' },
      { id: 'ex-03', ocupacao: 120 / 410, status: 'ok' },
      { id: 'ex-04', ocupacao: 240 / 410, status: 'ok' },
    ]

    for (const { id, ocupacao, status } of esperado) {
      const resultado = resultadoDe(porAtividade, id)
      expect(resultado.ocupacao).toBeCloseTo(ocupacao, CASAS)
      expect(resultado.statusOcupacao).toBe(status)
    }
  })

  it('estoque final é a produção menos a demanda, e tem os dois sinais', () => {
    // ex-01 produz mais do que a demanda (sobra); as outras três, limitadas pelo
    // gargalo, produzem menos (falta).
    expect(resultadoDe(porAtividade, 'ex-01').estoqueFinal).toBeCloseTo(410 / 1.5 - 240, CASAS)
    expect(resultadoDe(porAtividade, 'ex-01').estoqueFinal).toBeGreaterThan(0)
    expect(resultadoDe(porAtividade, 'ex-02').estoqueFinal).toBeCloseTo(-35, CASAS)
    expect(resultadoDe(porAtividade, 'ex-04').estoqueFinal).toBeCloseTo(-35, CASAS)
  })

  it('o gargalo é a atividade de menor capacidade, e só ela', () => {
    expect(global.gargaloAtividadeId).toBe('ex-02')
    expect(porAtividade.filter((r) => r.ehGargalo).map((r) => r.atividadeId)).toEqual(['ex-02'])
  })

  it('indicadores globais', () => {
    expect(global.maiorTempoProducaoMin).toBeCloseTo(24, CASAS) // ex-02: 2 * 12
    expect(global.leadTimeMin).toBeCloseTo(24, CASAS) // alias por ora
    expect(global.eficienciaTotal).toBeCloseTo(1200 / 410 / 4, CASAS) // média das ocupações
    expect(global.ocupacaoMedia).toBe(global.eficienciaTotal) // alias por ora
    expect(global.wipPecas).toBeCloseTo(240, CASAS) // reduz-se à demanda
  })

  it('a ocupação é fração, não porcentagem — e pode passar de 1', () => {
    // 1 significa 100%. Uma atividade sobrecarregada passa de 1: ex-02 está em
    // 1,17, e no robô a atividade gargalo está em 1,15. Converter para % é
    // trabalho da tela.
    expect(resultadoDe(porAtividade, 'ex-02').ocupacao).toBeGreaterThan(1)

    const media =
      porAtividade.reduce((soma, r) => soma + r.ocupacao, 0) / porAtividade.length
    expect(global.eficienciaTotal).toBeCloseTo(media, CASAS)
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
    expect(global.tempoDisponivelMin).toBe(DISPONIVEL)
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
    expect(porAtividade[0]?.producaoRealizadaDiaria).toBeCloseTo(410 / 1.5, CASAS)
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

    // Sem ex-02 alimentando ex-03, o limite de ex-03 passa a ser ex-01 (273,33).
    expect(resultadoDe(emCadeia.porAtividade, 'ex-03').producaoRealizadaDiaria).toBeCloseTo(
      410 / 1.5,
      CASAS,
    )
    // E ex-04, agora sem predecessora, volta à própria capacidade.
    expect(resultadoDe(emCadeia.porAtividade, 'ex-04').producaoRealizadaDiaria).toBeCloseTo(
      410,
      CASAS,
    )
  })
})
