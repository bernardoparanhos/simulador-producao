/**
 * Formas geométricas da identidade 1E.
 *
 * Quadrado, círculo, quarto de círculo, arco e triângulo, ancorados nas
 * bordas da tela. É o que dá o caráter institucional sem recorrer a mais
 * cores: a identidade tem duas (amarelo e laranja) sobre grafite ou areia, e
 * toda a variedade vem da forma.
 *
 * Os dois conjuntos daqui são puramente decorativos — `aria-hidden`,
 * `pointer-events-none` e atrás do conteúdo. Nenhum deles reage a nada nem
 * ocupa espaço no fluxo.
 */

/**
 * Formas do MODO PRESENÇA — amarelo cheio sobre o fundo grafite.
 *
 * Ancoram os quatro cantos e deixam o centro livre para a marca e o título.
 * O contraste é alto de propósito: estas telas são vistas de longe, numa
 * projeção.
 */
export function FormasPresenca() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Canto superior esquerdo: quadrado e, abaixo, um quarto de círculo. */}
      <div className="absolute left-0 top-0 h-24 w-24 bg-yellow" />
      <div className="absolute left-0 top-24 h-24 w-24 rounded-br-full bg-yellow" />

      {/* Canto superior direito: disco grafite ao fundo, cunha e círculo amarelos. */}
      <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/5" />
      <div
        className="absolute right-0 top-0 h-28 w-28 bg-yellow"
        style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
      />
      <div className="absolute right-12 top-14 h-24 w-24 rounded-full bg-yellow" />

      {/* Canto inferior esquerdo: triângulo grafite e arco amarelo. */}
      <div
        className="absolute bottom-0 left-16 h-48 w-56 bg-white/5"
        style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
      />
      <div className="absolute bottom-0 left-36 h-36 w-28 rounded-t-full bg-yellow" />

      {/* Canto inferior direito: círculo vazado e duas barras verticais. */}
      <div className="absolute -bottom-10 right-28 h-44 w-44 rounded-full border-2 border-white/10" />
      <div className="absolute bottom-0 right-16 h-20 w-10 bg-yellow" />
      <div className="absolute bottom-0 right-0 h-28 w-12 bg-yellow" />
    </div>
  )
}

/**
 * Formas do MODO DADOS — as mesmas figuras, rebaixadas a textura.
 *
 * Opacidade entre 7% e 12% sobre o fundo areia: percebem-se de perto e somem
 * de longe, para não competir com os números. Ficam no rodapé da tela, onde há
 * menos conteúdo.
 */
export function FormasDados() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Triângulo, canto inferior esquerdo. */}
      <div
        className="absolute -bottom-20 -left-10 h-[320px] w-[360px] bg-yellow opacity-[0.08]"
        style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
      />

      {/* Quarto de círculo, aresta esquerda. */}
      <div className="absolute -left-28 top-32 h-64 w-64 rounded-full bg-yellow opacity-[0.07]" />

      {/* Círculo vazado, canto inferior direito. */}
      <div className="absolute -bottom-28 right-20 h-72 w-72 rounded-full border-[3px] border-yellow-deep opacity-[0.09]" />

      {/* Quadrado menor, aresta direita. */}
      <div className="absolute -right-10 bottom-16 h-36 w-36 bg-yellow-deep opacity-[0.07]" />
    </div>
  )
}
