/**
 * Estado compartilhado entre as telas.
 *
 * O cenário preenchido no passo 1 vive aqui e alimenta os passos seguintes.
 */

export {
  cenarioDoFormulario,
  FORMULARIO_INICIAL,
  tempoDisponivelPorTurnoMin,
} from './cenario'
export type { FormularioCenario } from './cenario'
export { useCenario } from './contextoCenario'
export type { ContextoCenario } from './contextoCenario'
export { ProvedorCenario } from './ProvedorCenario'
