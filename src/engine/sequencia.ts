/**
 * Propagação do gargalo pela sequência.
 *
 * Terceiro passo do motor, e a razão de ser do projeto. Na planilha, o
 * fluxograma é um desenho que não alimenta o cálculo: cada atividade aparece
 * produzindo a própria capacidade, como se fosse independente das outras. Aqui
 * a sequência dirige o resultado — uma atividade não produz mais do que o que
 * chega até ela.
 *
 * ## A regra
 *
 * ```text
 * producaoRealizadaDiaria[a] = min(
 *   capacidadeDiaria[a],
 *   producaoRealizadaDiaria[p] para toda predecessora direta p de a
 * )
 * ```
 *
 * Atividades sem predecessoras produzem a própria capacidade: nada as limita
 * por cima.
 *
 * ## Por que ordem topológica
 *
 * Porque o limite usa a **produção realizada** das predecessoras, não a
 * capacidade delas. É isso que faz o gargalo se propagar por toda a cadeia a
 * jusante, e não apenas um passo adiante: se a etapa 1 produz 80 por causa de
 * um gargalo, a etapa 2 (capacidade 500) produz 80, e a etapa 3 (capacidade
 * 400) também produz 80. Para que esse encadeamento funcione, cada atividade
 * precisa ser calculada depois de todas as suas predecessoras — que é a
 * definição de ordem topológica.
 *
 * ## Afunilamento
 *
 * Quando várias atividades alimentam uma só, vale a **menor** entre as que
 * chegam, não a soma (decisão 3 do briefing da Fase 2): o fluxo é limitado pelo
 * ramo mais lento.
 *
 * TODO(Fase 4): essa escolha trata as conexões como caminhos alternativos do
 * mesmo material. Se um dia um destino montar peças vindas de ramos diferentes
 * (duas peças distintas que viram uma), a regra correta passa a ser outra, e a
 * conexão precisa dizer qual é a sua natureza.
 */

import type { AtividadeId, Sequencia } from '@/types'

import type { ResultadoAtividadeIsolada } from './atividade'

/** Chave de uma conexão, para descartar ligações repetidas. */
function chaveConexao(origem: AtividadeId, destino: AtividadeId): string {
  return `${origem}\u0000${destino}`
}

/**
 * Calcula a produção realizada de cada atividade, propagando o gargalo pelo
 * grafo da sequência.
 *
 * Percorre o grafo em ordem topológica (algoritmo de Kahn) e, para cada
 * atividade, limita a produção pela menor produção realizada entre as
 * predecessoras diretas.
 *
 * Tolerância a dados inconsistentes, porque tipos descrevem forma e não regra
 * (ver `docs/decisoes/0002-representacao-da-sequencia.md`):
 *
 * - conexões que apontam para atividades inexistentes são **ignoradas**;
 * - conexões repetidas (mesma origem e mesmo destino) contam uma vez só;
 * - atividades que não estão na sequência não têm predecessoras, logo produzem
 *   a própria capacidade;
 * - se houver **ciclo**, as atividades presas nele não têm ordem topológica. O
 *   motor não trava: resolve-as na ordem em que aparecem na lista de
 *   atividades, usando os limites que já conseguiu determinar. O resultado não
 *   tem significado de domínio — detectar e barrar ciclos é trabalho da
 *   validação, na camada de entrada.
 *
 * @param resultados Resultados isolados das atividades, já com `capacidadeDiaria`.
 * @param sequencia O fluxo: nós e conexões.
 * @returns Produção realizada por atividade, em unidades por período.
 */
export function propagarGargalo(
  resultados: readonly ResultadoAtividadeIsolada[],
  sequencia: Sequencia,
): Map<AtividadeId, number> {
  const capacidadePor = new Map<AtividadeId, number>(
    resultados.map((r) => [r.atividadeId, r.capacidadeDiaria]),
  )

  const predecessorasDe = new Map<AtividadeId, AtividadeId[]>()
  const sucessorasDe = new Map<AtividadeId, AtividadeId[]>()
  const grauEntrada = new Map<AtividadeId, number>(resultados.map((r) => [r.atividadeId, 0]))

  const vistas = new Set<string>()
  for (const { origem, destino } of sequencia.conexoes) {
    if (!capacidadePor.has(origem) || !capacidadePor.has(destino)) continue

    const chave = chaveConexao(origem, destino)
    if (vistas.has(chave)) continue
    vistas.add(chave)

    predecessorasDe.set(destino, [...(predecessorasDe.get(destino) ?? []), origem])
    sucessorasDe.set(origem, [...(sucessorasDe.get(origem) ?? []), destino])
    grauEntrada.set(destino, (grauEntrada.get(destino) ?? 0) + 1)
  }

  const producaoPor = new Map<AtividadeId, number>()

  /** Aplica a regra do mínimo a uma atividade cujas predecessoras já foram resolvidas. */
  const resolver = (id: AtividadeId): void => {
    let producao = capacidadePor.get(id) ?? 0
    for (const predecessora of predecessorasDe.get(id) ?? []) {
      const producaoPredecessora = producaoPor.get(predecessora)
      if (producaoPredecessora !== undefined && producaoPredecessora < producao) {
        producao = producaoPredecessora
      }
    }
    producaoPor.set(id, producao)
  }

  const fila: AtividadeId[] = []
  for (const { atividadeId } of resultados) {
    if ((grauEntrada.get(atividadeId) ?? 0) === 0) fila.push(atividadeId)
  }

  while (fila.length > 0) {
    const id = fila.shift() as AtividadeId
    resolver(id)

    for (const sucessora of sucessorasDe.get(id) ?? []) {
      const restante = (grauEntrada.get(sucessora) ?? 0) - 1
      grauEntrada.set(sucessora, restante)
      if (restante === 0) fila.push(sucessora)
    }
  }

  // Sobrou alguém: há ciclo. Resolve na ordem da lista, com o que já se sabe.
  for (const { atividadeId } of resultados) {
    if (!producaoPor.has(atividadeId)) resolver(atividadeId)
  }

  return producaoPor
}
