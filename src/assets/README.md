# src/assets

Identidade institucional do projeto: logos, ícones SVG, fotos de capa e
qualquer imagem importada pelo código React.

> **Estado: vazio, aguardando os arquivos.** As duas subpastas existem com um
> `.gitkeep` só para marcar o lugar. Nada aqui é inventado pelo
> desenvolvimento — os arquivos de identidade são fornecidos pelo responsável
> do projeto.

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

## Pendente

As cores da identidade (tokens `grafite-*` e `acento-*` em `src/index.css`)
são **provisórias**, escolhidas na Fase 0 para dar um visual limpo ao
placeholder. Quando os logos chegarem, as cores oficiais da UTFPR e do curso
entram nesses tokens, na Fase 6 (camada institucional).
