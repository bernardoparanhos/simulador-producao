/**
 * Campos do MODO DADOS.
 *
 * Um rótulo acima, o controle abaixo, arestas retas e nenhuma sombra. O foco
 * se anuncia trocando a borda para amarelo — não há anel nem brilho, porque na
 * identidade 1E o relevo vem de borda e cor, nunca de blur.
 *
 * Os dois componentes daqui existem para que nenhuma tela escreva `border`,
 * `padding` ou cor de campo por conta própria: mudou o estilo do campo, mudou
 * num lugar só.
 */

import { useId } from 'react'
import type { ReactNode } from 'react'

/** Classes do controle, iguais para `input` e `select`. */
const CONTROLE =
  'w-full border border-line bg-white px-3 py-2.5 text-sm text-dark ' +
  'outline-none transition-colors focus:border-yellow'

export interface CampoNumeroProps {
  /** Rótulo acima do campo, com a unidade entre parênteses. */
  rotulo: string
  /** Valor atual. */
  valor: number
  /** Chamado a cada alteração válida. */
  aoAlterar: (valor: number) => void
  /** Menor valor aceito. Padrão: `0`. */
  minimo?: number
  /** Maior valor aceito. Sem limite por padrão. */
  maximo?: number
  /** Incremento das setas do teclado. Padrão: `1` (inteiro). */
  passo?: number
  /** Texto curto abaixo do campo, para a unidade ou uma ressalva. */
  ajuda?: string
  /** Sufixo exibido dentro do campo, à direita (ex.: `%`). */
  sufixo?: string
}

/**
 * Campo numérico.
 *
 * Enquanto a pessoa apaga o conteúdo, o campo fica vazio e **não** dispara
 * alteração: converter `''` para `0` no meio da digitação faria o cursor
 * saltar e o indicador de tempo disponível piscar valores que ninguém digitou.
 * O valor só sobe quando dá para lê-lo como número.
 */
export function CampoNumero({
  rotulo,
  valor,
  aoAlterar,
  minimo = 0,
  maximo,
  passo = 1,
  ajuda,
  sufixo,
}: CampoNumeroProps) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-muted">
        {rotulo}
      </label>

      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(valor) ? valor : ''}
          min={minimo}
          max={maximo}
          step={passo}
          onChange={(evento) => {
            const lido = evento.target.valueAsNumber
            if (Number.isNaN(lido)) return
            if (lido < minimo) return aoAlterar(minimo)
            if (maximo !== undefined && lido > maximo) return aoAlterar(maximo)
            aoAlterar(lido)
          }}
          className={`${CONTROLE} ${sufixo === undefined ? '' : 'pr-9'}`}
        />

        {sufixo !== undefined && (
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
            aria-hidden="true"
          >
            {sufixo}
          </span>
        )}
      </div>

      {ajuda !== undefined && <p className="mt-1 text-[11px] text-muted">{ajuda}</p>}
    </div>
  )
}

export interface CampoSelecaoProps<V extends string> {
  /** Rótulo acima do campo. */
  rotulo: string
  /** Valor atual. */
  valor: V
  /** Chamado a cada escolha. */
  aoAlterar: (valor: V) => void
  /** As opções, na ordem em que aparecem. */
  opcoes: readonly { valor: V; texto: string }[]
}

/** Campo de escolha única, com a mesma moldura do {@link CampoNumero}. */
export function CampoSelecao<V extends string>({
  rotulo,
  valor,
  aoAlterar,
  opcoes,
}: CampoSelecaoProps<V>) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-muted">
        {rotulo}
      </label>

      <div className="relative">
        <select
          id={id}
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value as V)}
          className={`${CONTROLE} appearance-none pr-9`}
        >
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.texto}
            </option>
          ))}
        </select>

        {/* Seta própria: a nativa muda de desenho a cada navegador. */}
        <svg
          viewBox="0 0 10 6"
          className="pointer-events-none absolute right-3 top-1/2 h-1.5 w-2.5 -translate-y-1/2 fill-muted"
          aria-hidden="true"
        >
          <path d="M0 0h10L5 6z" />
        </svg>
      </div>
    </div>
  )
}

export interface TituloSecaoProps {
  /** O marcador geométrico à esquerda do texto. */
  marcador: 'quadrado' | 'circulo' | 'triangulo'
  /** O texto, que o componente põe em caixa alta. */
  children: ReactNode
}

/**
 * Cabeçalho de um grupo de campos.
 *
 * Cada grupo tem um marcador geométrico próprio — quadrado, círculo,
 * triângulo —, que é como a identidade 1E distingue seções sem recorrer a
 * mais cores ou a linhas divisórias.
 */
export function TituloSecao({ marcador, children }: TituloSecaoProps) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-dark">
      <Marcador tipo={marcador} />
      {children}
    </h2>
  )
}

/** O glifo geométrico do {@link TituloSecao}. */
function Marcador({ tipo }: { tipo: TituloSecaoProps['marcador'] }) {
  if (tipo === 'quadrado') {
    return <span className="h-2.5 w-2.5 bg-dark" aria-hidden="true" />
  }

  if (tipo === 'circulo') {
    return <span className="h-2.5 w-2.5 rounded-full bg-orange" aria-hidden="true" />
  }

  return (
    <svg viewBox="0 0 10 9" className="h-2.5 w-2.5 fill-orange" aria-hidden="true">
      <path d="M5 0l5 9H0z" />
    </svg>
  )
}
