/**
 * Parada P3 — as três camadas falam do mesmo conjunto de atividades.
 *
 * A P1 provou que o motor acerta as contas; a P2, que a tradução da interface
 * entrega o cenário certo. A P3 fecha o terceiro vão: **o canvas e o motor
 * concordam sobre quais atividades existem?**
 *
 * É um vão real, porque as atividades e as posições dos nós vivem em contextos
 * separados, por motivos documentados em `src/state/sequencia.ts`. Nada no
 * tipo impede que uma posição aponte para uma atividade que foi apagada, nem
 * que uma atividade recém-criada fique sem nó. Se isso acontecesse, o gargalo
 * poderia ser uma atividade que não está desenhada em lugar nenhum.
 *
 * ## O que é testado, e o que não é
 *
 * As transformações da sequência são funções puras (`definirPosicoes`,
 * `adicionarConexao`, `moverNo`, `removerConexoesDoNo`) e o provedor só as
 * encadeia — então testá-las direto cobre a regra sem montar React.
 *
 * Fica de fora arrastar o nó com o mouse e desenhar a ligação na tela: isso é
 * comportamento do React Flow, pede navegador de verdade, e entra na Fase 5
 * quando o canvas existir.
 */

import type { Edge, Node } from '@xyflow/react'
import { describe, expect, it } from 'vitest'

import { simular } from '@/engine'
import { atividadesRobo, cenarioRobo } from '@/fixtures'
import {
  adicionarConexao,
  definirPosicoes,
  moverNo,
  posicoesDaSequencia,
  removerConexoesDoNo,
  SEQUENCIA_INICIAL,
} from '@/state'
import type { PosicaoDeNo } from '@/state'
import { idDaConexao } from '@/types'

/** Colunas da grade automática do canvas. */
const COLUNAS = 4

/** Espaçamento da grade, em pixels. */
const PASSO_X = 220
const PASSO_Y = 140

/**
 * O layout que o botão "Carregar atividades" vai gerar.
 *
 * Grade simples: quatro por linha. Na Fase 5 o canvas pode usar etapa e linha
 * da atividade para um arranjo mais fiel ao processo — o que a P3 verifica é
 * que **toda** atividade ganha um nó, não que o arranjo seja bonito.
 */
function gerarPosicoes(): PosicaoDeNo[] {
  return atividadesRobo.map((atividade, indice) => ({
    id: atividade.id,
    x: (indice % COLUNAS) * PASSO_X,
    y: Math.floor(indice / COLUNAS) * PASSO_Y,
  }))
}

describe('Parada P3 — o canvas e o motor veem as mesmas atividades', () => {
  const sequencia = definirPosicoes(SEQUENCIA_INICIAL, gerarPosicoes())
  const posicoes = posicoesDaSequencia(sequencia)
  const idsDasAtividades = atividadesRobo.map((atividade) => atividade.id)

  it('carregar as atividades cria um nó para cada uma das 15', () => {
    expect(posicoes).toHaveLength(15)
    expect(atividadesRobo).toHaveLength(15)
  })

  it('cada atividade aparece exatamente uma vez — sem duplicata, sem ausente', () => {
    const idsDosNos = posicoes.map((posicao) => posicao.id)

    expect(new Set(idsDosNos).size).toBe(idsDosNos.length)
    expect([...idsDosNos].sort()).toEqual([...idsDasAtividades].sort())
  })

  it('nenhum nó aponta para uma atividade que não existe', () => {
    const conhecidas = new Set(idsDasAtividades)

    for (const posicao of posicoes) {
      expect(conhecidas.has(posicao.id)).toBe(true)
    }
  })

  it('as posições da grade saem como esperado', () => {
    // Primeira linha: quatro nós lado a lado, mesma altura.
    expect(posicoes[0]).toEqual({ id: '111', x: 0, y: 0 })
    expect(posicoes[3]).toEqual({ id: '121', x: 660, y: 0 })
    // Quinto nó quebra para a linha de baixo.
    expect(posicoes[4]).toEqual({ id: '122', x: 0, y: 140 })
  })
})

describe('Parada P3 — o gargalo do motor está representado no canvas', () => {
  const sequencia = definirPosicoes(SEQUENCIA_INICIAL, gerarPosicoes())

  const { global } = simular({
    cenario: cenarioRobo,
    atividades: atividadesRobo,
    sequencia,
  })

  it('o gargalo continua sendo a 112, com os nós carregados', () => {
    expect(global.gargaloAtividadeId).toBe('112')
  })

  it('existe um nó no canvas para a atividade gargalo', () => {
    const noDoGargalo = sequencia.nos.find(
      (no) => no.atividadeId === global.gargaloAtividadeId,
    )

    expect(noDoGargalo).toBeDefined()
    expect(noDoGargalo?.posicao).toBeDefined()
  })

  it('carregar os nós não muda número nenhum do motor', () => {
    // Sem conexões, posicionar os nós é informação puramente visual: o motor
    // ignora `posicao`. Este teste trava isso — se um dia a posição passar a
    // influenciar o cálculo, foi sem querer.
    const semNos = simular({
      cenario: cenarioRobo,
      atividades: atividadesRobo,
      sequencia: SEQUENCIA_INICIAL,
    })

    expect(global).toEqual(semNos.global)
  })
})

describe('Parada P3 — ligações', () => {
  const comNos = definirPosicoes(SEQUENCIA_INICIAL, gerarPosicoes())

  const comDuas = adicionarConexao(
    adicionarConexao(comNos, {
      id: idDaConexao('111', '112'),
      origem: '111',
      destino: '112',
    }),
    { id: idDaConexao('112', '121'), origem: '112', destino: '121' },
  )

  it('a convenção de id das ligações é e-<origem>-<destino>', () => {
    expect(idDaConexao('111', '112')).toBe('e-111-112')
    expect(comDuas.conexoes.map((conexao) => conexao.id)).toEqual([
      'e-111-112',
      'e-112-121',
    ])
  })

  it('remover as ligações de um nó tira as de entrada e as de saída', () => {
    const semAs112 = removerConexoesDoNo(comDuas, '112')

    expect(semAs112.conexoes).toHaveLength(0)
    for (const conexao of semAs112.conexoes) {
      expect(conexao.origem).not.toBe('112')
      expect(conexao.destino).not.toBe('112')
    }
  })

  it('remover as ligações de um nó não apaga o nó', () => {
    const semAs112 = removerConexoesDoNo(comDuas, '112')

    expect(semAs112.nos).toHaveLength(15)
    expect(semAs112.nos.some((no) => no.atividadeId === '112')).toBe(true)
  })

  it('uma ligação repetida é ignorada', () => {
    const outraVez = adicionarConexao(comDuas, {
      id: idDaConexao('111', '112'),
      origem: '111',
      destino: '112',
    })

    expect(outraVez.conexoes).toHaveLength(2)
    expect(outraVez).toBe(comDuas)
  })

  it('uma ligação de uma atividade para ela mesma é recusada', () => {
    // Um laço travaria a ordem topológica do motor e não existe no domínio:
    // uma atividade não alimenta a si própria.
    const comLaco = adicionarConexao(comDuas, {
      id: idDaConexao('112', '112'),
      origem: '112',
      destino: '112',
    })

    expect(comLaco).toBe(comDuas)
  })

  it('as ligações dirigem o cálculo: o gargalo propaga a jusante', () => {
    // A prova de que o canvas alimenta o motor de verdade, e não só desenha.
    // Com 111 -> 112, a produção de 112 passa a ser limitada pela de 111.
    const semLigacoes = simular({
      cenario: cenarioRobo,
      atividades: atividadesRobo,
      sequencia: comNos,
    })
    const comLigacoes = simular({
      cenario: cenarioRobo,
      atividades: atividadesRobo,
      sequencia: comDuas,
    })

    const producaoDe = (resultado: typeof semLigacoes, id: string): number => {
      const linha = resultado.porAtividade.find((item) => item.atividadeId === id)
      if (linha === undefined) throw new Error(`atividade ${id} ausente`)
      return linha.producaoRealizadaDiaria
    }

    // 121 é a mais lenta das três e, sozinha, produz a própria capacidade.
    expect(producaoDe(semLigacoes, '121')).toBeCloseTo(600.09, 1)

    // Ligada depois de 112 (a gargalo), 121 cai para a produção de 112.
    expect(producaoDe(comLigacoes, '121')).toBeCloseTo(producaoDe(comLigacoes, '112'), 6)
    expect(producaoDe(comLigacoes, '121')).toBeLessThan(producaoDe(semLigacoes, '121'))
  })
})

describe('Parada P3 — arrastar um nó', () => {
  const comNos = definirPosicoes(SEQUENCIA_INICIAL, gerarPosicoes())

  it('move só o nó arrastado', () => {
    const movido = moverNo(comNos, '112', 999, 777)
    const posicoes = posicoesDaSequencia(movido)

    expect(posicoes.find((p) => p.id === '112')).toEqual({ id: '112', x: 999, y: 777 })
    expect(posicoes.find((p) => p.id === '111')).toEqual({ id: '111', x: 0, y: 0 })
  })

  it('um id desconhecido não cria nó nem dispara mudança', () => {
    const resultado = moverNo(comNos, 'nao-existe', 10, 10)

    // Mesma referência: um evento perdido não deve causar render.
    expect(resultado).toBe(comNos)
  })
})

describe('Parada P3 — o modelo cabe no React Flow', () => {
  /*
   * A decisão 0002 diz que o estado guarda o formato do domínio e que a
   * conversão para o React Flow é um adaptador na camada de canvas. Isto aqui
   * é a prova de que o adaptador cabe — escrito como tipo, não como teste de
   * execução, porque é na compilação que ele falharia.
   *
   * Serve também de verificação da dependência: `@xyflow/react` declara apenas
   * `react >= 17` nos peer deps, e este arquivo é o único lugar do projeto que
   * encosta nos tipos dela sob React 19 e TypeScript 6.
   */
  const sequencia = definirPosicoes(SEQUENCIA_INICIAL, gerarPosicoes())

  it('NoSequencia vira Node e ConexaoSequencia vira Edge, sem perda', () => {
    const nos: Node[] = sequencia.nos.map((no) => ({
      id: no.atividadeId,
      position: { x: no.posicao?.x ?? 0, y: no.posicao?.y ?? 0 },
      data: { atividadeId: no.atividadeId },
    }))

    const ligacoes: Edge[] = adicionarConexao(sequencia, {
      id: idDaConexao('111', '112'),
      origem: '111',
      destino: '112',
    }).conexoes.map((conexao) => ({
      id: conexao.id,
      source: conexao.origem,
      target: conexao.destino,
    }))

    expect(nos).toHaveLength(15)
    expect(nos[0]).toMatchObject({ id: '111', position: { x: 0, y: 0 } })
    expect(ligacoes).toEqual([{ id: 'e-111-112', source: '111', target: '112' }])
  })
})
