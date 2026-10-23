/**
 * Cálculo de uma atividade isolada.
 *
 * Segundo passo do motor: com o tempo disponível em mãos, cada atividade é
 * calculada por conta própria, sem olhar para a sequência. O que depende do
 * fluxo (produção realizada, estoque, gargalo) vem depois, em
 * `src/engine/sequencia.ts` e `src/engine/globais.ts`.
 *
 * Fonte das fórmulas: abas DADOS (formulário ATIVIDADES) e RELATÓRIO da
 * planilha `SIMULADOR DE PRODUÇÃO ROBÔ.xlsm`, confirmadas na Parada P1.
 */

import type { Atividade, Cenario, ResultadoPorAtividade, StatusOcupacao } from '@/types'

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
 * As três faixas aparecem no cenário do robô: a atividade `'124'` fica em
 * `'ok'` (0,83), a `'221'` em `'atencao'` (0,98) e a `'112'`, o gargalo, em
 * `'acima'` (1,15).
 *
 * TODO(Fase 5): os cortes 0,85 e 1,00 vêm do briefing da Fase 2 e ainda não
 * foram confirmados contra a planilha. O de 1,00 é natural (ocupação acima de
 * 100% é sobrecarga); o de 0,85 é convenção.
 *
 * @param ocupacao Ocupação da atividade, fração em que 1 é 100%.
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
 * tempoCicloMin        = tempoPadraoMin + setupMin / tamanhoLote
 * taktTimeMin          = (tempoDisponivelMin / (tamanhoLote * demanda)) * 60
 * quantidadeCiclos     = demanda / tamanhoLote
 * capacidadeDiaria     = tempoDisponivelMin / tempoCicloMin
 * ocupacao             = (tempoCicloMin * demanda) / tempoDisponivelMin
 * tempoProducaoLoteMin = tempoCicloMin * quantidadeCiclos
 * ```
 *
 * O tempo padrão é o cronometrado corrigido: o fator de ritmo ajusta a medição
 * para um operador de ritmo normal e o fator de tolerância acrescenta o tempo
 * de necessidades pessoais, fadiga e esperas. O tempo de ciclo acrescenta o
 * setup diluído no lote.
 *
 * Conferido contra a planilha do robô, atividade `'111'`:
 * `6,16 * 1,01 = 6,2216` de tempo padrão, `+ 1/20 = 6,2716` de tempo de ciclo,
 * `5600 / 6,2716 = 892,91` de capacidade e `(6,2716 * 400) / 5600 = 0,44797` de
 * ocupação.
 *
 * TODO(D-11): a **ocupação não usa o takt time**. A fórmula é a razão entre o
 * tempo que a demanda exige da atividade (`tempoCicloMin * demanda`) e o tempo
 * que ela tem (`tempoDisponivelMin`) — o que, por identidade, é o mesmo que
 * `demanda / capacidadeDiaria`. O `taktTimeMin` continua sendo calculado porque
 * aparece no relatório da planilha, mas não é o denominador da ocupação. Até a
 * P1 o motor usava `tempoCicloMin / taktTimeMin`, que dava valores 3 vezes
 * menores no cenário do robô.
 *
 * TODO(D-13): a inspeção **não entra no tempo de ciclo**. Até a P1 o motor
 * somava uma parcela de inspeção aqui, como premissa documentada; o relatório
 * da planilha provou que não há essa parcela (ver
 * `calcularTempoInspecaoPorPecaMin`). Os três parâmetros de inspeção do robô não
 * afetam número nenhum — falta descobrir onde a planilha os usa.
 *
 * TODO(D-1): `numOperadores` **não entra em nenhuma destas fórmulas**. O modelo
 * de dados o define como postos em paralelo, o que deveria dividir o tempo de
 * ciclo, mas a fórmula da planilha não o usa. No robô todas as atividades têm
 * um operador, então a P1 não resolve a dúvida: ela só aparece num cenário com
 * postos em paralelo.
 *
 * @param atividade A atividade a calcular.
 * @param cenario Dados iniciais (demanda e tamanho de lote).
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

  const tempoCicloMin = tempoPadraoMin + atividade.setupMin / cenario.tamanhoLote

  const taktTimeMin = (tempoDisponivelMin / (cenario.tamanhoLote * cenario.demanda)) * 60

  const quantidadeCiclos = cenario.demanda / cenario.tamanhoLote
  const capacidadeDiaria = tempoDisponivelMin / tempoCicloMin
  const ocupacao = (tempoCicloMin * cenario.demanda) / tempoDisponivelMin

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
