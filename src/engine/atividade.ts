/**
 * Cálculo de uma atividade isolada.
 *
 * Segundo passo do motor: com o tempo disponível em mãos, cada atividade é
 * calculada por conta própria, sem olhar para a sequência. O que depende do
 * fluxo (produção realizada, estoque, gargalo) vem depois, em
 * `src/engine/sequencia.ts` e `src/engine/globais.ts`.
 *
 * Fonte das fórmulas: abas DADOS (formulário ATIVIDADES) e RELATÓRIO da
 * planilha do Simulador de Produção.
 */

import type { Atividade, Cenario, ResultadoPorAtividade, StatusOcupacao } from '@/types'

import { calcularTempoInspecaoPorPecaMin } from './tempo'

/**
 * O que é possível calcular olhando uma atividade isolada.
 *
 * Os três campos que faltam para fechar um {@link ResultadoPorAtividade}
 * dependem do fluxo inteiro e não de uma atividade só:
 *
 * - `producaoRealizadaDiaria` — depende das predecessoras na sequência;
 * - `estoqueFinal` — depende da produção realizada;
 * - `ehGargalo` — depende da comparação com todas as outras atividades.
 */
export type ResultadoAtividadeIsolada = Omit<
  ResultadoPorAtividade,
  'producaoRealizadaDiaria' | 'estoqueFinal' | 'ehGargalo'
>

/** Limite de ocupação a partir do qual o status deixa de ser `'ok'`. */
const LIMITE_ATENCAO = 0.85

/** Limite de ocupação a partir do qual a atividade está `'acima'` do aceitável. */
const LIMITE_ACIMA = 1

/**
 * Classifica a ocupação de uma atividade para leitura rápida na tela.
 *
 * ```text
 * ocupacao <  0,85  -> 'ok'
 * ocupacao <  1,00  -> 'atencao'
 * ocupacao >= 1,00  -> 'acima'
 * ```
 *
 * TODO(Fase 5): as faixas são provisórias, definidas no briefing da Fase 2 e
 * ainda não confirmadas contra a planilha.
 *
 * @param ocupacao Ocupação da atividade, fração de 0 a 1.
 * @returns A faixa em que a ocupação cai.
 */
export function classificarOcupacao(ocupacao: number): StatusOcupacao {
  if (ocupacao < LIMITE_ATENCAO) return 'ok'
  if (ocupacao < LIMITE_ACIMA) return 'atencao'
  return 'acima'
}

/**
 * Calcula os indicadores de uma atividade isolada.
 *
 * Fórmulas da planilha, na ordem em que dependem uma da outra:
 *
 * ```text
 * tempoPadraoMin       = tempoCronometradoMin * (fatorRitmo/100) * (1 + fatorTolerancia/100)
 * tempoCicloMin        = tempoPadraoMin + setupMin / tamanhoLote   [+ inspeção, ver abaixo]
 * taktTimeMin          = (tempoDisponivelMin / (tamanhoLote * demanda)) * 60
 * quantidadeCiclos     = demanda / tamanhoLote
 * capacidadeDiaria     = tempoDisponivelMin / tempoCicloMin
 * ocupacao             = tempoCicloMin / taktTimeMin
 * tempoProducaoLoteMin = tempoCicloMin * quantidadeCiclos
 * ```
 *
 * O tempo padrão é o cronometrado corrigido: o fator de ritmo ajusta a medição
 * para um operador de ritmo normal e o fator de tolerância acrescenta o tempo
 * de necessidades pessoais, fadiga e esperas. O tempo de ciclo acrescenta o
 * setup diluído no lote. O takt é o ritmo que a demanda exige, e a ocupação é a
 * razão entre o ritmo da atividade e esse ritmo exigido.
 *
 * **Parcela de inspeção.** Ao tempo de ciclo soma-se
 * `calcularTempoInspecaoPorPecaMin(cenario.inspecao)`, que vale zero quando a
 * porcentagem inspecionada é zero. Isso é premissa do motor, não fórmula da
 * planilha — ver a documentação daquela função e `docs/fases/fase-2.md`.
 *
 * TODO(P1): `numOperadores` **não entra em nenhuma destas fórmulas**. O modelo
 * de dados o define como postos em paralelo, o que deveria dividir o tempo de
 * ciclo, mas a fórmula recebida não o usa. Mantido fiel ao briefing; é a
 * segunda hipótese a testar se os números do robô não baterem.
 *
 * TODO(P1): `cenario.paradaNaoPlanejada` também não entra. Nenhuma fórmula foi
 * recebida para ela, então o motor não inventa uma — ver `docs/fases/fase-2.md`.
 *
 * @param atividade A atividade a calcular.
 * @param cenario Dados iniciais (demanda, tamanho de lote, inspeção).
 * @param tempoDisponivelMin Tempo produtivo do período, em minutos.
 * @returns Os indicadores que não dependem da sequência.
 */
export function calcularAtividade(
  atividade: Atividade,
  cenario: Cenario,
  tempoDisponivelMin: number,
): ResultadoAtividadeIsolada {
  const tempoPadraoMin =
    atividade.tempoCronometradoMin *
    (atividade.fatorRitmo / 100) *
    (1 + atividade.fatorTolerancia / 100)

  const tempoCicloMin =
    tempoPadraoMin +
    atividade.setupMin / cenario.tamanhoLote +
    calcularTempoInspecaoPorPecaMin(cenario.inspecao)

  const taktTimeMin = (tempoDisponivelMin / (cenario.tamanhoLote * cenario.demanda)) * 60

  const quantidadeCiclos = cenario.demanda / cenario.tamanhoLote
  const capacidadeDiaria = tempoDisponivelMin / tempoCicloMin
  const ocupacao = tempoCicloMin / taktTimeMin

  return {
    atividadeId: atividade.id,
    tempoPadraoMin,
    tempoCicloMin,
    capacidadeDiaria,
    taktTimeMin,
    tempoProducaoLoteMin: tempoCicloMin * quantidadeCiclos,
    ocupacao,
    statusOcupacao: classificarOcupacao(ocupacao),
    quantidadeCiclos,
  }
}
