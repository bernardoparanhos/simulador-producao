# Simulador de Produção

Ferramenta web de apoio ao ensino de **Planejamento e Controle da Produção**
(PCP) — Engenharia de Produção, UTFPR Medianeira.

O projeto recria, como sistema web claro e institucional, um simulador que hoje
existe como planilha Excel. A melhoria central em relação à planilha é um
**construtor visual de sequência de atividades**: o usuário monta a sequência
na tela e é essa sequência que dirige o cálculo.

> **Estado atual: Fase 4 — dois dos quatro passos prontos.** O motor de cálculo
> está em [`src/engine/`](src/engine/), com **58 testes passando** e as Paradas
> **P1 e P2 aprovadas** contra a planilha do robô. A interface tem a abertura, a
> apresentação, o passo 1 (Cenário) e o passo 2 (Atividades, com cadastro em
> drawer e prévia ao vivo). O construtor de sequência e os resultados vêm nas
> fases seguintes.

## Fonte de verdade

O escopo do projeto está em **[`docs/plano-de-construcao.md`](docs/plano-de-construcao.md)**
— o mapa das 9 fases, o caminho dos dados e as paradas de teste. Em caso de
divergência entre o código e o plano, o plano está certo até ser alterado
explicitamente.

Esse arquivo é um **espelho** do documento vivo mantido no claude.ai, então
nada de andamento deve ser escrito nele: toda re-sincronização sobrescreve. O
estado da construção — onde estamos, o que está aberto — fica em
**[`docs/estado.md`](docs/estado.md)**.

O modelo de dados que atravessa o sistema está em
**[`docs/modelo-de-dados.md`](docs/modelo-de-dados.md)** — campos, unidades,
decisões e o mapeamento contra as abas da planilha original.

As fórmulas do motor, o resultado da Parada P1 e as quinze divergências
encontradas entre as fórmulas e o modelo de dados estão em
**[`docs/fases/fase-2.md`](docs/fases/fase-2.md)**.

## Como rodar

Requisitos: **Node.js 20+** e npm (desenvolvido com Node 24 e npm 11).

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # servidor de desenvolvimento em http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento, com recarga automática |
| `npm run build` | Verifica os tipos (`tsc -b`) e gera o site em `dist/` |
| `npm test` | Roda os testes do motor de cálculo (Vitest) |
| `npm run preview` | Serve localmente o conteúdo de `dist/`, para conferir o build |
| `npm run lint` | Roda o oxlint sobre o código |

## Stack

| Camada | Ferramenta |
| --- | --- |
| Build / dev server | Vite 8 |
| Interface | React 19 + TypeScript 6 (`strict`) |
| Rotas | React Router 7 |
| Estilo | Tailwind CSS 4, fonte Outfit |
| Construtor de sequência | React Flow 12 (`@xyflow/react`) — *instalado, em uso a partir da Fase 4* |
| Gráficos | Recharts 3 — *instalado, em uso nas fases de resultado* |
| Testes | Vitest 5 |
| Hospedagem | Vercel |

O porquê de cada escolha está em
[`docs/decisoes/0001-escolha-da-stack.md`](docs/decisoes/0001-escolha-da-stack.md).

## Estrutura de pastas

```
simulador-producao/
├── docs/
│   ├── plano-de-construcao.md   # fonte de verdade: as 9 fases
│   ├── modelo-de-dados.md       # as entidades, os campos e as unidades
│   ├── decisoes/                # registro de decisões, numerado
│   └── fases/                   # log de execução, um por fase
├── public/                      # arquivos servidos com URL fixa (favicon)
└── src/
    ├── engine/                  # motor de cálculo: TS puro, sem React
    │   └── __tests__/           # testes do motor, incluindo a Parada P1
    ├── types/                   # modelo de dados: um arquivo por entidade
    ├── state/                   # estado compartilhado (cenário, atividades)
    ├── hooks/                   # ganchos de React (prévia ao vivo)
    ├── utils/                   # formatação e faixas de status
    ├── integration/__tests__/   # testes de ponta a ponta das paradas (P2)
    ├── styles/   tokens.css     # as cores da identidade — única fonte de cor
    ├── components/              # componentes de UI reutilizáveis
    ├── pages/                   # telas, uma por passo
    ├── fixtures/                # cenários de exemplo prontos
    ├── assets/                  # identidade institucional (logos/, capas/)
    ├── App.tsx                  # raiz da aplicação
    ├── main.tsx                 # ponto de entrada
    └── index.css                # Tailwind + tokens de identidade visual
```

Duas regras de estrutura que valem para todo o projeto:

1. **`src/engine/` não conhece React.** É TypeScript puro, sem React e sem
   DOM: recebe dados, devolve resultados. É o que mantém o cálculo testável
   isoladamente e auditável contra a planilha original.
2. **Imports usam o alias `@/`**, que aponta para `src/`. Prefira
   `import { x } from '@/engine'` a `../../../engine`.
3. **`src/types/` só tem formas de dados.** Sem lógica, sem fórmulas, sem
   `enum` (o projeto usa `erasableSyntaxOnly`): uniões de literais no lugar.
   Cada campo leva JSDoc com a unidade. Importe pelo barril — `@/types` —, não
   pelos arquivos internos.
4. **Grandeza relativa é fração em que 1 é 100%**, nunca porcentagem —
   ocupação, eficiência, ocupação média. Pode passar de 1 (sobrecarga).
   Converter para `%` é trabalho da tela. As exceções são os campos de
   *entrada* (`fatorRitmo`, `fatorTolerancia`, inspeção), que ficam como a
   pessoa digita.
5. **O motor não valida a entrada.** Ele calcula o que der; avisar o usuário é
   trabalho da interface. Ver
   [`docs/decisoes/0003-premissas-do-motor-de-calculo.md`](docs/decisoes/0003-premissas-do-motor-de-calculo.md).
6. **Nenhum componente declara cor própria.** Toda cor sai de
   [`src/styles/tokens.css`](src/styles/tokens.css); se não está lá, não existe
   na identidade. Botões e campos têm raio zero, e **nada tem sombra** — o
   relevo vem de borda e contraste. Ver
   [`docs/decisoes/0004-camada-de-tela.md`](docs/decisoes/0004-camada-de-tela.md).

## Como contribuir

### A regra de documentação

**Toda mudança relevante atualiza a documentação na mesma leva.** Não existe
"documento depois". Em concreto:

- Mudou algo de arquitetura, ferramenta ou abordagem? → novo arquivo em
  `docs/decisoes/`, numerado em sequência (`0002-...`, `0003-...`), no formato
  **contexto, decisão, alternativas, consequências**.
- Terminou uma fase? → `docs/fases/fase-N.md`, com **objetivo, o que foi
  feito, decisões tomadas, o que ficou pendente**.
- Mudou como se roda, como se instala ou a estrutura de pastas? → atualize
  este README.
- Mudou o escopo? → atualize `docs/plano-de-construcao.md` **e** registre a
  decisão.

### Fluxo de trabalho

1. Leia `docs/plano-de-construcao.md` e o log da fase anterior antes de
   começar.
2. O projeto tem um só responsável e cada push na `main` republica o site, então
   as fases são commitadas direto na `main`. Use um branch quando a mudança
   precisar ser revisada antes de entrar no ar — a Vercel gera uma URL de
   pré-visualização por branch.
3. Antes de commitar: `npm run lint`, `npm run build` e `npm test` precisam
   passar.
4. Commits em português, no imperativo e descrevendo o efeito
   (ex.: `adiciona modelo de dados das atividades`).
5. Uma fase não começa antes de a anterior ser aprovada.

## Deploy

O build é um site estático; a Vercel detecta Vite automaticamente e publica a
cada push. O passo a passo para conectar o repositório está em
[`docs/fases/fase-0.md`](docs/fases/fase-0.md).
