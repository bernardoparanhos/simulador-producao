/**
 * Tela 3 — Cenário. MODO DADOS.
 *
 * O primeiro dos quatro passos: os parâmetros gerais da linha. Daqui sai o
 * tempo disponível, e dele saem o takt e a capacidade de todas as atividades.
 *
 * Três grupos de campos, cada um com seu marcador geométrico: dados gerais,
 * turnos e refeições, inspeção. O indicador do topo mostra o efeito do que a
 * pessoa está digitando, ao vivo — é a tradução do "passos claros" do plano:
 * em nenhum momento se preenche um campo sem ver para onde ele vai.
 */

import { useNavigate } from 'react-router-dom'

import { CampoNumero, CampoSelecao, TituloSecao } from '@/components/Campo'
import { FormasDados } from '@/components/Formas'
import { HeaderSimulador } from '@/components/HeaderSimulador'
import { tempoDisponivelPorTurnoMin, useCenario } from '@/state'
import type { Periodicidade } from '@/types'

/** As opções do campo de periodicidade, com os rótulos que a tela mostra. */
const PERIODICIDADES: readonly { valor: Periodicidade; texto: string }[] = [
  { valor: 'Diario', texto: 'Diário' },
  { valor: 'Semanal', texto: 'Semanal' },
  { valor: 'Mensal', texto: 'Mensal' },
]

export function CenarioPage() {
  const navigate = useNavigate()
  const { formulario, alterarCampo, reiniciar } = useCenario()

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSimulador passoAtivo={1} />

      <main className="relative flex flex-1 flex-col overflow-hidden bg-light-bg">
        <FormasDados />

        <div className="relative mx-auto w-full max-w-[1100px] flex-1 px-6 py-9 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-dark">Dados do cenário</h1>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-orange">
                Informe os parâmetros gerais da linha. Usados para calcular tempo
                disponível, takt e capacidade.
              </p>
            </div>

            <IndicadorTempoDisponivel minutos={tempoDisponivelPorTurnoMin(formulario)} />
          </div>

          <div className="mt-9 grid grid-cols-1 items-start gap-7 md:grid-cols-2 lg:grid-cols-3">
            <section>
              <TituloSecao marcador="quadrado">Dados gerais</TituloSecao>

              <div className="space-y-4">
                <CampoNumero
                  rotulo="Demanda diária (un.)"
                  valor={formulario.demanda}
                  aoAlterar={(valor) => alterarCampo('demanda', valor)}
                  minimo={0}
                />
                <CampoNumero
                  rotulo="Tamanho do lote (un.)"
                  valor={formulario.tamanhoLote}
                  aoAlterar={(valor) => alterarCampo('tamanhoLote', valor)}
                  minimo={1}
                />

                <div className="grid grid-cols-2 gap-4">
                  <CampoSelecao
                    rotulo="Periodicidade"
                    valor={formulario.periodicidade}
                    aoAlterar={(valor) => alterarCampo('periodicidade', valor)}
                    opcoes={PERIODICIDADES}
                  />
                  <CampoNumero
                    rotulo="Dias no período"
                    valor={formulario.diasOuSemanasNoMes}
                    aoAlterar={(valor) => alterarCampo('diasOuSemanasNoMes', valor)}
                    minimo={1}
                  />
                </div>
              </div>
            </section>

            <section>
              <TituloSecao marcador="circulo">Turnos e refeições</TituloSecao>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <CampoNumero
                    rotulo="Tempo de turno (min)"
                    valor={formulario.tempoTurnoMin}
                    aoAlterar={(valor) => alterarCampo('tempoTurnoMin', valor)}
                    minimo={1}
                  />
                  <CampoNumero
                    rotulo="Nº de turnos / dia"
                    valor={formulario.turnosDiarios}
                    aoAlterar={(valor) => alterarCampo('turnosDiarios', valor)}
                    minimo={1}
                    maximo={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <CampoNumero
                    rotulo="Refeições / turno"
                    valor={formulario.numRefeicoesPorTurno}
                    aoAlterar={(valor) => alterarCampo('numRefeicoesPorTurno', valor)}
                    minimo={0}
                  />
                  <CampoNumero
                    rotulo="Tempo de refeição (min)"
                    valor={formulario.tempoRefeicaoMin}
                    aoAlterar={(valor) => alterarCampo('tempoRefeicaoMin', valor)}
                    minimo={0}
                  />
                </div>

                <CampoNumero
                  rotulo="Troca de turno (min)"
                  valor={formulario.trocaTurnoMin}
                  aoAlterar={(valor) => alterarCampo('trocaTurnoMin', valor)}
                  minimo={0}
                />
              </div>
            </section>

            <section className="border border-line bg-white p-5">
              <TituloSecao marcador="triangulo">Inspeção</TituloSecao>

              <div className="space-y-4">
                <CampoNumero
                  rotulo="% inspecionada"
                  valor={formulario.porcentagemInspecionada}
                  aoAlterar={(valor) => alterarCampo('porcentagemInspecionada', valor)}
                  minimo={0}
                  maximo={100}
                  sufixo="%"
                />
                <CampoNumero
                  rotulo="Tempo por peça (s)"
                  valor={formulario.tempoInspecaoPorPecaSeg}
                  aoAlterar={(valor) => alterarCampo('tempoInspecaoPorPecaSeg', valor)}
                  minimo={0}
                  passo={0.1}
                />
                <CampoNumero
                  rotulo="Mínimo de aprovação"
                  valor={formulario.minimoAprovacao}
                  aoAlterar={(valor) => alterarCampo('minimoAprovacao', valor)}
                  minimo={0}
                  maximo={100}
                  sufixo="%"
                />
              </div>
            </section>
          </div>
        </div>

        <RodapeAcoes
          aoCancelar={reiniciar}
          aoAvancar={() => navigate('/atividades')}
        />
      </main>
    </div>
  )
}

/**
 * O indicador de tempo disponível por turno.
 *
 * Mostra só o turno líquido, sem multiplicar pelos turnos do dia nem pelos
 * dias do período: é o número que responde na hora ao campo que a pessoa
 * acabou de mexer. O tempo disponível do período inteiro aparece nos
 * resultados.
 */
function IndicadorTempoDisponivel({ minutos }: { minutos: number }) {
  return (
    <div className="flex items-baseline gap-5 border border-line border-l-4 border-l-orange bg-white px-5 py-3">
      <span className="flex items-center gap-2 text-[11px] tracking-[0.1em] text-muted">
        <span className="h-2 w-2 bg-orange" aria-hidden="true" />
        Tempo disponível / turno
      </span>
      <output className="text-[22px] font-bold leading-none text-dark">
        {Math.round(minutos)} <span className="text-sm font-medium">min</span>
      </output>
    </div>
  )
}

/** A faixa de ações no pé da tela. */
function RodapeAcoes({
  aoCancelar,
  aoAvancar,
}: {
  aoCancelar: () => void
  aoAvancar: () => void
}) {
  return (
    <div className="relative border-t border-line bg-light-bg">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <p className="text-xs text-muted">Os dados ficam salvos ao avançar.</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={aoCancelar}
            className="border border-line px-5 py-3 text-sm text-dark transition-colors hover:border-dark"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aoAvancar}
            className="bg-yellow px-6 py-3 text-sm font-bold text-dark transition-colors hover:bg-yellow-deep"
          >
            Avançar para Atividades
          </button>
        </div>
      </div>
    </div>
  )
}
