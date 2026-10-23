# src/assets

Identidade institucional do projeto: logos, ícones SVG, fotos de capa e
qualquer imagem importada pelo código React.

> **Estado: em uso desde a Fase 3.** Os arquivos abaixo são os fornecidos pelo
> responsável do projeto. Nada aqui é inventado pelo desenvolvimento.

| Arquivo | Onde aparece |
| --- | --- |
| `logos/utfpr.svg` | cartão da marca, nas três telas |
| `logos/eng-producao.png` | cartão da marca, ao lado da UTFPR |
| `logos/utfpr-banner.png` | ainda sem uso |
| `capas/campus-vista-aerea.png` | metade direita da tela de entrada, acima |
| `capas/campus-predio.png` | metade direita da tela de entrada, abaixo |
| `manual-de-identidade.pdf` | referência; não entra no build |

Os nomes foram normalizados na Fase 3 para a convenção descrita abaixo — os
originais tinham espaços e parênteses, que deixam o caminho de import frágil.

## O que vai onde

| Pasta | Conteúdo | Formato preferido |
| --- | --- | --- |
| `logos/` | Logo da UTFPR, logo/símbolo do curso de Engenharia de Produção, marcas de apoio | **SVG** (vetor, escala sem perder nitidez); PNG com fundo transparente como alternativa |
| `capas/` | Fotos e imagens de fundo da tela institucional e do cabeçalho | JPG ou WebP, largura mínima 1920 px |

Nomes de arquivo em minúsculas, com hífen, sem acento e sem espaço:
`utfpr-horizontal.svg`, `eng-producao-simbolo.svg`, `capa-laboratorio.jpg`.

Se o mesmo logo vier em mais de uma versão, o sufixo diz qual é qual:
`-horizontal`, `-vertical`, `-monocromatico`, `-branco` (para usar sobre fundo
escuro).

## Como usar no código

Importe o arquivo; o Vite devolve a URL final já com hash de versão:

```tsx
import logoUtfpr from '@/assets/logos/utfpr-horizontal.svg'

<img src={logoUtfpr} alt="UTFPR" />
```

## `src/assets/` ou `public/`?

- **`src/assets/`** (aqui) — arquivos importados pelo código. Passam pelo build
  do Vite: recebem hash no nome, são otimizados e só entram no site se alguém
  realmente os importar. É o lugar certo para logos e capas.
- **`public/`** (na raiz do projeto) — arquivos que precisam de URL fixa e
  previsível, servidos como estão: `favicon.svg`, `robots.txt`, um PDF para
  download direto.

## Peso dos arquivos

As duas fotos do campus somam cerca de **5,7 MB**, e a tela de entrada carrega
as duas. Convertê-las para WebP a 1920 px de largura cortaria isso para alguns
centenas de kB sem diferença visível — vale fazer antes de o link ir para o
professor. Os originais ficam no repositório de qualquer forma.

## Cores

As cores da identidade estão em [`src/styles/tokens.css`](../styles/tokens.css),
extraídas dos frames aprovados na entrega DP-1. Os tokens provisórios da Fase 0
(`grafite-*`, `acento-*`) foram removidos.
