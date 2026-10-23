/**
 * Sequência — o fluxo de atividades. O coração do sistema.
 *
 * Unifica o que na planilha está partido em duas abas desconectadas (LOGICA
 * PROCESSO e FLUXOGRAMA) e, principalmente, resolve a única melhoria que o
 * professor pediu: na planilha, dizer quais atividades se conectam e como
 * afunilam de uma etapa para a outra é manual e **não alimenta o cálculo**.
 * Aqui a sequência é um dado de primeira classe, e é ela que vai dirigir o
 * cálculo do gargalo a partir da Fase 2.
 *
 * ## Como está modelada
 *
 * Como um **grafo dirigido**: {@link NoSequencia} são as atividades colocadas
 * no fluxo e {@link ConexaoSequencia} são as ligações "esta alimenta aquela".
 * Duas escolhas que valem registro (detalhe e alternativas descartadas em
 * `docs/decisoes/0002-representacao-da-sequencia.md`):
 *
 * 1. **A identidade do nó é o `atividadeId`.** Não existe um id de nó
 *    separado. Um nó é uma atividade colocada no fluxo, então cada atividade
 *    aparece no máximo uma vez na sequência. Isso casa com a planilha (uma
 *    linha por atividade) e com os resultados (um
 *    `ResultadoPorAtividade` por atividade): se a mesma atividade
 *    pudesse aparecer duas vezes, sua ocupação seria ambígua.
 * 2. **Etapa e linha não se repetem aqui.** Elas moram em
 *    `Atividade.etapa` e `Atividade.linha`, que são a única fonte
 *    de verdade da posição lógica. O nó guarda apenas uma posição *visual*
 *    opcional, para quando a pessoa arrastar o nó na tela.
 *
 * ## Por que existe uma lista de nós, se os nós são atividades
 *
 * Porque estar cadastrada e estar no fluxo são coisas diferentes. A pessoa pode
 * cadastrar uma atividade e ainda não tê-la posicionado na sequência; a lista
 * de nós é o que diz, explicitamente, o que já entrou no fluxo. Ela também é o
 * lugar onde a posição arrastada na tela persiste.
 *
 * ## Como o React Flow consome isso (Fase 4)
 *
 * O mapeamento é direto, feito por um adaptador na camada de interface — este
 * módulo não conhece o React Flow nem nenhuma biblioteca de tela:
 *
 * ```text
 * NoSequencia        → Node  { id: atividadeId, position, data: { atividade } }
 * ConexaoSequencia   → Edge  { id, source: origem, target: destino }
 * ```
 *
 * `position` vem de {@link NoSequencia.posicao} quando existe; quando não
 * existe, o adaptador deriva da grade (etapa no eixo X, linha no eixo Y), de
 * modo que um fluxo recém-criado já aparece organizado sem ninguém arrastar
 * nada.
 *
 * Esta Fase define apenas a forma dos dados. O cálculo entra na Fase 2 e o
 * construtor visual na Fase 4.
 */

import type { AtividadeId } from './atividade'

/**
 * Posição de um nó no canvas do construtor, em pixels (px).
 *
 * Mesma convenção do React Flow: origem no canto superior esquerdo, `y`
 * crescendo para baixo.
 */
export interface Posicao {
  /** Deslocamento horizontal, em pixels (px). */
  x: number
  /** Deslocamento vertical, em pixels (px). */
  y: number
}

/** Uma atividade colocada no fluxo. */
export interface NoSequencia {
  /**
   * Atividade que este nó representa.
   *
   * É também a identidade do nó: não há dois nós com o mesmo `atividadeId`, e
   * é este valor que as conexões referenciam.
   */
  atividadeId: AtividadeId

  /**
   * Posição escolhida manualmente no canvas, em pixels (px).
   *
   * Ausente enquanto a pessoa não arrastar o nó; nesse caso a posição é
   * derivada da etapa e da linha da atividade. É informação puramente visual —
   * o motor de cálculo ignora este campo.
   */
  posicao?: Posicao
}

/**
 * Identificador estável de uma conexão.
 *
 * Existe por dois motivos: o React Flow exige um `id` em cada aresta, e a
 * interface precisa poder selecionar e apagar uma ligação específica. Não
 * carrega significado de domínio — quem define o fluxo são `origem` e
 * `destino`.
 */
export type ConexaoId = string

/**
 * Ligação dirigida entre duas atividades: "a origem alimenta o destino".
 *
 * O sentido importa. A produção caminha de `origem` para `destino`, e é por
 * esse caminho que o gargalo vai se propagar.
 */
export interface ConexaoSequencia {
  /** Identificador estável. Ver {@link ConexaoId}. */
  id: ConexaoId

  /** Atividade que entrega a produção (a montante). */
  origem: AtividadeId

  /** Atividade que recebe a produção (a jusante). */
  destino: AtividadeId
}

/** O fluxo completo: as atividades posicionadas e as ligações entre elas. */
export interface Sequencia {
  /**
   * Atividades que já entraram no fluxo.
   *
   * Cada `atividadeId` aparece no máximo uma vez, e sempre corresponde a uma
   * atividade existente em `EntradaSimulacao.atividades`. Garantir isso é
   * responsabilidade de quem edita a sequência; a Fase 2 inclui a validação.
   */
  nos: NoSequencia[]

  /**
   * Ligações entre as atividades do fluxo.
   *
   * Uma atividade pode ter várias conexões de entrada (é o afunilamento: duas
   * linhas de uma etapa alimentando uma linha da etapa seguinte) e várias de
   * saída (divisão do fluxo).
   *
   * Quando várias origens alimentam um mesmo destino, vale a **menor** entre as
   * que chegam, não a soma: o fluxo é limitado pelo ramo mais lento.
   *
   * TODO(Fase 4): essa regra trata toda conexão como caminho alternativo do
   * mesmo material. Se um dia um destino montar peças vindas de ramos
   * diferentes (duas peças distintas que viram uma), a conexão precisa dizer
   * qual é a sua natureza, e isso entra como um campo desta interface.
   */
  conexoes: ConexaoSequencia[]
}
