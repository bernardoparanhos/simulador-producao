/**
 * A sequência montada no canvas, e a persistência dela.
 *
 * Só dados e funções puras — nada de React. O provedor está em
 * `ProvedorSequencia.tsx` e o acesso em `contextoSequencia.ts`.
 *
 * ## O que mora aqui e o que não mora
 *
 * As **atividades** (tempos, fatores, etapa, linha) vivem no contexto de
 * atividades. Aqui ficam só duas coisas: **onde** cada nó está no canvas e
 * **quais ligações** existem entre eles. Na hora de desenhar, o componente de
 * canvas junta os dois.
 *
 * A separação importa porque as duas coisas mudam por motivos diferentes e em
 * ritmos diferentes: arrastar um nó não altera nenhum tempo, e corrigir um
 * tempo cronometrado não move nada na tela.
 *
 * ## O formato é o do domínio, não o do React Flow
 *
 * O estado guarda `Sequencia` — `nos` e `conexoes`, com `origem` e `destino`.
 * O React Flow fala `nodes`/`edges` com `source`/`target`, e a tradução entre
 * os dois é um adaptador na camada de canvas, não aqui.
 *
 * É a decisão [0002](../../docs/decisoes/0002-representacao-da-sequencia.md):
 * guardar no formato da biblioteca de interface amarraria o motor e os
 * cenários salvos à API dela. O motor consome esta `Sequencia` direto, sem
 * conversão nenhuma — `simular({ cenario, atividades, sequencia })`.
 */

import type { AtividadeId, ConexaoSequencia, Sequencia } from '@/types'

/** Chave da sequência no `localStorage`. Versionada: mudou de forma, muda a chave. */
export const CHAVE_ARMAZENAMENTO = 'simulador-producao:sequencia:v1'

/** Canvas vazio: nenhum nó posicionado, nenhuma ligação. */
export const SEQUENCIA_INICIAL: Sequencia = { nos: [], conexoes: [] }

/**
 * Posição de um nó no canvas, achatada para o formato que o canvas manipula.
 *
 * O estado guarda `NoSequencia { atividadeId, posicao? }`; o canvas pensa em
 * `{ id, x, y }`. Este tipo é a forma de entrada e saída das ações de posição,
 * para que o componente não precise montar objetos aninhados a cada arrasto.
 */
export interface PosicaoDeNo {
  /** O `id` da atividade que este nó representa. */
  id: AtividadeId
  /** Deslocamento horizontal no canvas, em pixels (px). */
  x: number
  /** Deslocamento vertical no canvas, em pixels (px). */
  y: number
}

/** Converte os nós do estado para a forma achatada do canvas. */
export function posicoesDaSequencia(sequencia: Sequencia): PosicaoDeNo[] {
  return sequencia.nos.map((no) => ({
    id: no.atividadeId,
    x: no.posicao?.x ?? 0,
    y: no.posicao?.y ?? 0,
  }))
}

/** Converte a forma achatada do canvas de volta para os nós do estado. */
export function nosDasPosicoes(posicoes: readonly PosicaoDeNo[]): Sequencia['nos'] {
  return posicoes.map(({ id, x, y }) => ({ atividadeId: id, posicao: { x, y } }))
}

/**
 * Lê a sequência salva, ou devolve o canvas vazio.
 *
 * Tolerante pela mesma razão do cenário e das atividades: armazenamento
 * indisponível, JSON corrompido ou uma versão anterior não podem impedir a
 * tela de abrir. As duas listas são validadas em separado, para que um `edges`
 * corrompido não leve junto as posições que estavam boas.
 */
export function lerSequenciaArmazenada(): Sequencia {
  try {
    const bruto = window.localStorage.getItem(CHAVE_ARMAZENAMENTO)
    if (bruto === null) return SEQUENCIA_INICIAL

    const salvo = JSON.parse(bruto) as Partial<Sequencia>
    return {
      nos: Array.isArray(salvo.nos) ? salvo.nos : [],
      conexoes: Array.isArray(salvo.conexoes) ? salvo.conexoes : [],
    }
  } catch {
    return SEQUENCIA_INICIAL
  }
}

/** Grava a sequência. Falha em silêncio — não abrir seria pior do que esquecer. */
export function gravarSequencia(sequencia: Sequencia): void {
  try {
    window.localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(sequencia))
  } catch {
    // Intencionalmente ignorado. Ver o comentário acima.
  }
}

/*
 * As transformações abaixo são as regras da sequência, escritas como funções
 * puras: recebem a sequência atual, devolvem a próxima, não guardam nada. O
 * provedor só as encadeia.
 *
 * Separá-las do React é o que permite à Parada P3 testá-las sem montar
 * componente nenhum — e o que deixa a regra legível sem o ruído de `useState`.
 */

/** Substitui todas as posições. É o que o botão "Carregar atividades" faz. */
export function definirPosicoes(
  sequencia: Sequencia,
  posicoes: readonly PosicaoDeNo[],
): Sequencia {
  return { ...sequencia, nos: nosDasPosicoes(posicoes) }
}

/**
 * Move um nó. Ignora id desconhecido.
 *
 * Arrastar é o evento mais frequente do canvas, então a função devolve a
 * **mesma** sequência quando o id não existe, em vez de uma cópia nova: assim
 * um evento perdido não dispara render à toa.
 */
export function moverNo(sequencia: Sequencia, id: AtividadeId, x: number, y: number): Sequencia {
  if (!sequencia.nos.some((no) => no.atividadeId === id)) return sequencia

  return {
    ...sequencia,
    nos: sequencia.nos.map((no) =>
      no.atividadeId === id ? { ...no, posicao: { x, y } } : no,
    ),
  }
}

/**
 * Acrescenta uma ligação, ignorando repetição.
 *
 * Repetida é tanto o mesmo `id` quanto o mesmo par origem/destino — a
 * convenção `e-<origem>-<destino>` faz os dois coincidirem, mas a verificação
 * cobre os dois casos para o caso de uma conexão salva por outra convenção.
 *
 * Laço sobre si mesma (`origem === destino`) também é recusado: uma atividade
 * não alimenta a si própria, e um laço travaria a ordem topológica do motor.
 */
export function adicionarConexao(
  sequencia: Sequencia,
  conexao: ConexaoSequencia,
): Sequencia {
  if (conexao.origem === conexao.destino) return sequencia

  const jaExiste = sequencia.conexoes.some(
    (atual) =>
      atual.id === conexao.id ||
      (atual.origem === conexao.origem && atual.destino === conexao.destino),
  )
  if (jaExiste) return sequencia

  return { ...sequencia, conexoes: [...sequencia.conexoes, conexao] }
}

/**
 * Remove todas as ligações que tocam um nó, como origem ou como destino.
 *
 * O nó continua no canvas — só fica solto. É o que o botão "Remover conexões"
 * do painel faz: desligar sem apagar.
 */
export function removerConexoesDoNo(sequencia: Sequencia, id: AtividadeId): Sequencia {
  return {
    ...sequencia,
    conexoes: sequencia.conexoes.filter(
      (conexao) => conexao.origem !== id && conexao.destino !== id,
    ),
  }
}
