/**
 * Estado compartilhado entre as telas.
 *
 * Um provedor por bloco do caminho dos dados: cenário (passo 1), atividades
 * (passo 2) e sequência (passo 3). Os três ficam acima do roteador — trocar de
 * tela não pode custar o que a pessoa já montou.
 */

export { ATIVIDADE_NOVA, novoId } from './atividades'
export type { AtividadeFormulario } from './atividades'
export {
  cenarioDoFormulario,
  FORMULARIO_INICIAL,
  tempoDisponivelPorTurnoMin,
} from './cenario'
export type { FormularioCenario } from './cenario'
export { useAtividades } from './contextoAtividades'
export type { ContextoAtividades } from './contextoAtividades'
export { useCenario } from './contextoCenario'
export type { ContextoCenario } from './contextoCenario'
export { useSequencia } from './contextoSequencia'
export type { ContextoSequencia } from './contextoSequencia'
export { ProvedorAtividades } from './ProvedorAtividades'
export { ProvedorCenario } from './ProvedorCenario'
export { ProvedorSequencia } from './ProvedorSequencia'
export {
  adicionarConexao,
  definirPosicoes,
  moverNo,
  nosDasPosicoes,
  posicoesDaSequencia,
  removerConexoesDoNo,
  SEQUENCIA_INICIAL,
} from './sequencia'
export type { PosicaoDeNo } from './sequencia'
