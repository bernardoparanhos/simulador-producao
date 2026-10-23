/**
 * Formatação de números para a tela, em português do Brasil.
 *
 * Vírgula decimal, nunca ponto. O motor trabalha com `number` puro; converter
 * para texto legível é trabalho exclusivo daqui — nenhum componente chama
 * `toFixed` por conta própria, para que "6,27 min" seja escrito do mesmo jeito
 * em todas as telas.
 */

/** Cria um formatador e o reaproveita: `Intl` é caro de instanciar em laço. */
function formatador(casas: number): Intl.NumberFormat {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })
}

const DUAS_CASAS = formatador(2)
const UMA_CASA = formatador(1)
const INTEIRO = formatador(0)

/**
 * Um tempo em minutos, com duas casas: `6,27`.
 *
 * Sem a unidade — quem chama decide se escreve "min" ao lado e em que tamanho.
 */
export function formatarMinutos(minutos: number): string {
  if (!Number.isFinite(minutos)) return '—'
  return DUAS_CASAS.format(minutos)
}

/**
 * Uma fração como porcentagem, com uma casa: `0,44797` vira `44,8%`.
 *
 * A ocupação pode passar de 100% — é o que denuncia o gargalo —, então não há
 * teto.
 */
export function formatarPorcentagem(fracao: number): string {
  if (!Number.isFinite(fracao)) return '—'
  return `${UMA_CASA.format(fracao * 100)}%`
}

/** Um valor inteiro com separador de milhar: `1.200`. */
export function formatarInteiro(valor: number): string {
  if (!Number.isFinite(valor)) return '—'
  return INTEIRO.format(Math.round(valor))
}

/**
 * O número de ordem de uma linha da lista: `1` vira `01`.
 *
 * Dois dígitos até 99; acima disso cresce naturalmente.
 */
export function formatarOrdem(indice: number): string {
  return String(indice + 1).padStart(2, '0')
}

/** Etapa e linha no formato da lista: `E1 · L2`. */
export function formatarEtapaLinha(etapa: number, linha: number): string {
  return `E${etapa} · L${linha}`
}

/**
 * O código de uma atividade, na convenção da planilha: etapa, linha e processo
 * concatenados.
 *
 * A atividade da etapa 1, linha 1, processo 2 é a `112` — é assim que o
 * professor as chama e é assim que os frames as mostram. O `id` interno é um
 * UUID, que serve para o sistema e não para a pessoa.
 *
 * Não é único por construção: duas atividades na mesma etapa, linha e processo
 * teriam o mesmo código. Isso é problema de validação (Fase 4 em diante), não
 * da formatação.
 */
export function codigoDaAtividade(atividade: {
  etapa: number
  linha: number
  processo: number
}): string {
  return `${atividade.etapa}${atividade.linha}${atividade.processo}`
}
