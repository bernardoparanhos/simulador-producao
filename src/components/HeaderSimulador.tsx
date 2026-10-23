/**
 * Header do MODO DADOS — a barra escura fixa no topo das telas de trabalho.
 *
 * Carrega a marca, o nome do sistema e os quatro passos do caminho dos dados.
 * Os passos não são só decoração: são o mapa que o plano de construção chama
 * de "passos claros" — em qualquer tela a pessoa vê onde está e o que vem
 * depois.
 *
 * Os passos cujas telas já existem navegam; os que ainda não existem ficam
 * inertes, com a mesma aparência. Um passo clicável que não leva a lugar
 * nenhum é pior do que um passo que não convida ao clique.
 */

import { NavLink } from 'react-router-dom'

import { MarcaInstitucional } from './MarcaInstitucional'

/**
 * Os quatro passos, na ordem do caminho dos dados.
 *
 * `rota` é `null` enquanto a tela não existe. Quando a Fase 6 trouxer os
 * resultados, basta preencher a rota aqui.
 */
const PASSOS = [
  { numero: 1, nome: 'Cenário', rota: '/cenario' },
  { numero: 2, nome: 'Atividades', rota: '/atividades' },
  { numero: 3, nome: 'Sequência', rota: '/sequencia' },
  { numero: 4, nome: 'Resultados', rota: null },
] as const

export interface HeaderSimuladorProps {
  /** Número do passo em que a pessoa está (1 a 4). */
  passoAtivo: (typeof PASSOS)[number]['numero']
}

/** Aparência de um passo, igual para o que navega e o que não navega. */
function classesDoPasso(ativo: boolean): string {
  return ativo
    ? 'block bg-yellow px-4 py-2 text-xs font-bold text-dark'
    : 'block px-4 py-2 text-xs text-muted transition-colors'
}

/** A barra superior das telas MODO DADOS. */
export function HeaderSimulador({ passoAtivo }: HeaderSimuladorProps) {
  return (
    <header className="flex items-stretch bg-dark">
      {/* As duas faixas da identidade na aresta esquerda. */}
      <div className="w-1 shrink-0 bg-yellow" aria-hidden="true" />
      <div className="w-[3px] shrink-0 bg-orange" aria-hidden="true" />

      <div className="flex flex-1 flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-4">
          <MarcaInstitucional tamanho="pequeno" />
          <span className="text-sm font-medium text-white">Simulador de Produção</span>
        </div>

        <nav aria-label="Passos da simulação">
          <ol className="flex items-center gap-1">
            {PASSOS.map((passo) => {
              const ativo = passo.numero === passoAtivo
              const rotulo = `${passo.numero} · ${passo.nome}`

              return (
                <li key={passo.numero}>
                  {passo.rota === null ? (
                    <span
                      className={classesDoPasso(ativo)}
                      aria-disabled="true"
                      title="Disponível a partir da Fase 6"
                    >
                      {rotulo}
                    </span>
                  ) : (
                    <NavLink
                      to={passo.rota}
                      aria-current={ativo ? 'step' : undefined}
                      className={`${classesDoPasso(ativo)} ${ativo ? '' : 'hover:text-white'}`}
                    >
                      {rotulo}
                    </NavLink>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </div>
    </header>
  )
}
