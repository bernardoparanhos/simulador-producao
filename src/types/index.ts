/**
 * Modelo de dados do simulador.
 *
 * Fonte única de verdade dos tipos compartilhados entre o motor de cálculo
 * (`src/engine`) e a interface (`src/components`, `src/pages`). Só formas de
 * dados: nenhuma lógica, nenhuma fórmula, nenhuma dependência de React.
 *
 * Organização, seguindo o caminho dos dados do plano de construção
 * (Cenário → Atividades → Sequência → Cálculo → Resultados):
 *
 * | Arquivo         | Bloco                                              |
 * | --------------- | -------------------------------------------------- |
 * | `cenario.ts`    | Cenário (dados iniciais)                           |
 * | `atividade.ts`  | Atividades                                         |
 * | `sequencia.ts`  | Sequência (o fluxo)                                |
 * | `simulacao.ts`  | a entrada completa do motor                        |
 * | `resultados.ts` | o que o motor devolve                              |
 *
 * Este arquivo é só a porta de entrada: prefira importar daqui
 * (`import type { Atividade } from '@/types'`) em vez de apontar para os
 * arquivos internos.
 *
 * O modelo está explicado, com o mapeamento contra a planilha, em
 * `docs/modelo-de-dados.md`.
 */

export type { Atividade, AtividadeId } from './atividade'
export type { Cenario, Inspecao, ParadaNaoPlanejada, Periodicidade } from './cenario'
export type { ConexaoId, ConexaoSequencia, NoSequencia, Posicao, Sequencia } from './sequencia'
export { idDaConexao } from './sequencia'
export type { EntradaSimulacao } from './simulacao'
export type {
  ResultadoGlobal,
  ResultadoPorAtividade,
  ResultadoSimulacao,
  StatusOcupacao,
} from './resultados'
