/**
 * Parada P2 — o robô entrando pela interface.
 *
 * A P1 provou que o motor acerta quando recebe o cenário do robô montado à
 * mão, no formato que ele espera. A P2 pergunta outra coisa: **o que a
 * interface guarda alimenta o motor certo?**
 *
 * Entre a tela e o motor há uma tradução — `cenarioDoFormulario` converte
 * segundos em minutos, preenche o descanso com zero e a parada com `null`. Se
 * essa tradução errasse, a P1 continuaria passando e o sistema devolveria
 * números errados mesmo assim. É esse vão que este teste fecha.
 *
 * ## O que é simulado, e o que não é
 *
 * O teste monta os estados que os contextos guardam (`FormularioCenario` e
 * `AtividadeFormulario[]`), aplica a mesma tradução que as telas aplicam e
 * compara com o gabarito da planilha. Não aciona React nem navegador: o que
 * está sob teste é a **tradução**, e ela é função pura.
 *
 * O que fica de fora, e por quê: digitar nos campos, navegar entre as telas e
 * a persistência em `localStorage`. Isso é comportamento de componente, pede
 * navegador de verdade e seria outra ferramenta — enquanto a tradução, que é
 * onde um erro passaria despercebido, está coberta aqui.
 */

import { describe, expect, it } from 'vitest'

import { calcularTempoDisponivel, simular } from '@/engine'
import { atividadesRobo, cenarioRobo } from '@/fixtures'
import { cenarioDoFormulario } from '@/state'
import type { AtividadeFormulario, FormularioCenario } from '@/state'

/**
 * O cenário do robô **como a tela de Cenário o guardaria**.
 *
 * Reproduz o que a pessoa digitaria nos campos do passo 1, na unidade de cada
 * campo. A diferença visível para `cenarioRobo` é o tempo de inspeção, aqui em
 * segundos — a planilha traz 1 min, e o campo da tela pede segundos (D-16).
 *
 * `tempoDescansoMin` e `paradaNaoPlanejada` não aparecem porque a tela não os
 * pede (D-10 e D-5): a tradução é quem os preenche.
 */
const FORMULARIO_ROBO: FormularioCenario = {
  demanda: 400,
  tamanhoLote: 20,
  periodicidade: 'Semanal',
  diasOuSemanasNoMes: 7,
  tempoTurnoMin: 480,
  turnosDiarios: 2,
  numRefeicoesPorTurno: 2,
  tempoRefeicaoMin: 30,
  trocaTurnoMin: 20,
  porcentagemInspecionada: 20,
  tempoInspecaoPorPecaSeg: 60,
  minimoAprovacao: 90,
}

/**
 * As 15 atividades do robô **como a lista de Atividades as guardaria**.
 *
 * `AtividadeFormulario` é um apelido de `Atividade`: o drawer edita exatamente
 * os campos do modelo, sem conversão. Reaproveitar o fixture aqui não é
 * trapaça — é a demonstração de que não há tradução a errar neste lado.
 */
const ATIVIDADES_FORMULARIO: AtividadeFormulario[] = atividadesRobo.map((atividade) => ({
  ...atividade,
}))

/** Tolerância das ocupações, a mesma da P1. */
const TOL = 0.001

describe('Parada P2 — o robô inserido pela interface', () => {
  const cenario = cenarioDoFormulario(FORMULARIO_ROBO)
  const { global, porAtividade } = simular({
    cenario,
    atividades: ATIVIDADES_FORMULARIO,
    sequencia: { nos: [], conexoes: [] },
  })

  const ocupacaoDe = (atividadeId: string): number => {
    const resultado = porAtividade.find((item) => item.atividadeId === atividadeId)
    if (resultado === undefined) throw new Error(`atividade ${atividadeId} ausente`)
    return resultado.ocupacao
  }

  it('a tradução da tela reproduz o cenário da P1, menos o descanso', () => {
    // O teste decisivo da P2: o que a interface guarda, depois de traduzido, é
    // indistinguível do cenário que a P1 montou à mão — com uma exceção, o
    // campo de descanso, que a tela não pede. Ver o teste seguinte.
    expect(cenario).toEqual({ ...cenarioRobo, tempoDescansoMin: 0 })
  })

  it('o descanso é o único campo que a tela não reproduz — e não muda número (D-10)', () => {
    // A planilha do robô tem 20 min de descanso; a tela aprovada não tem o
    // campo, porque a P1 provou que a planilha não o desconta do tempo
    // disponível. A consequência é que o cenário vindo da interface difere do
    // da planilha neste único ponto.
    expect(cenarioRobo.tempoDescansoMin).toBe(20)
    expect(cenario.tempoDescansoMin).toBe(0)

    // E a prova de que a diferença é inofensiva hoje: os dois cenários dão
    // exatamente o mesmo tempo disponível. Este teste falha de propósito no dia
    // em que D-10 for resolvida a favor de descontar o descanso — e aí a tela
    // precisa ganhar o campo de volta.
    expect(calcularTempoDisponivel(cenario)).toBe(calcularTempoDisponivel(cenarioRobo))
  })

  it('a conversão de segundos para minutos acontece na tradução (D-16)', () => {
    // A tela guarda 60 s; o motor recebe 1 min.
    expect(FORMULARIO_ROBO.tempoInspecaoPorPecaSeg).toBe(60)
    expect(cenario.inspecao.tempoPorPecaMin).toBe(1)
  })

  it('a tela não pede descanso nem parada, e a tradução os preenche (D-10, D-5)', () => {
    expect(cenario.tempoDescansoMin).toBe(0)
    expect(cenario.paradaNaoPlanejada).toBeNull()
  })

  it('tempoDisponivelMin = 5600, o valor da planilha', () => {
    expect(global.tempoDisponivelMin).toBe(5600)
  })

  it('gargaloAtividadeId = 112, a mesma atividade da P1', () => {
    expect(global.gargaloAtividadeId).toBe('112')
  })

  it('ocupação da 112 bate com a planilha: 1,15324', () => {
    expect(Math.abs(ocupacaoDe('112') - 1.15324)).toBeLessThanOrEqual(TOL)
  })

  it('ocupação da 221 bate com a planilha: 0,98327', () => {
    expect(Math.abs(ocupacaoDe('221') - 0.98327)).toBeLessThanOrEqual(TOL)
  })

  it('as 15 atividades chegam ao motor', () => {
    expect(ATIVIDADES_FORMULARIO).toHaveLength(15)
    expect(porAtividade).toHaveLength(15)
  })
})
