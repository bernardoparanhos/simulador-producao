/**
 * Estado compartilhado entre as telas.
 *
 * O cenário (passo 1) e as atividades (passo 2) vivem aqui e alimentam os
 * passos seguintes. Os dois provedores ficam acima do roteador: trocar de tela
 * não pode custar o que a pessoa já preencheu.
 */

export {
  ATIVIDADE_NOVA,
  novoId,
} from './atividades'
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
export { ProvedorAtividades } from './ProvedorAtividades'
export { ProvedorCenario } from './ProvedorCenario'
