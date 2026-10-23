# Simulador de Produção

Ferramenta web de apoio ao ensino de **Planejamento e Controle da Produção**
(PCP) — Engenharia de Produção, UTFPR Medianeira.

O projeto recria, como sistema web claro e institucional, um simulador que hoje
existe como planilha Excel. A melhoria central em relação à planilha é um
**construtor visual de sequência de atividades**: o usuário monta a sequência
na tela e é essa sequência que dirige o cálculo.

> **Estado atual: Fase 0 (fundação) concluída.** A página inicial é um
> placeholder institucional. Nenhuma funcionalidade de simulação foi
> implementada ainda.

## Fonte de verdade

O escopo do projeto está em **[`docs/plano-de-construcao.md`](docs/plano-de-construcao.md)**
— o mapa das 9 fases, o caminho dos dados e as paradas de teste. Em caso de
divergência entre o código e o plano, o plano está certo até ser alterado
explicitamente.

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
| `npm run preview` | Serve localmente o conteúdo de `dist/`, para conferir o build |
| `npm run lint` | Roda o oxlint sobre o código |

## Stack

| Camada | Ferramenta |
| --- | --- |
| Build / dev server | Vite 8 |
| Interface | React 19 + TypeScript 6 (`strict`) |
| Estilo | Tailwind CSS 4, fonte Outfit |
| Construtor de sequência | React Flow 12 (`@xyflow/react`) — *instalado, em uso a partir da Fase 4* |
| Gráficos | Recharts 3 — *instalado, em uso nas fases de resultado* |
| Hospedagem | Vercel |

O porquê de cada escolha está em
[`docs/decisoes/0001-escolha-da-stack.md`](docs/decisoes/0001-escolha-da-stack.md).

## Estrutura de pastas

```
simulador-producao/
├── docs/
│   ├── plano-de-construcao.md   # fonte de verdade: as 9 fases
│   ├── decisoes/                # registro de decisões, numerado
│   └── fases/                   # log de execução, um por fase
├── public/                      # arquivos servidos com URL fixa (favicon)
└── src/
    ├── engine/                  # motor de cálculo: TS puro, sem React
    ├── types/                   # modelo de dados compartilhado
    ├── components/              # componentes de UI reutilizáveis
    ├── pages/                   # telas
    ├── fixtures/                # cenários de exemplo prontos
    ├── assets/                  # identidade institucional (logos, capas)
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
2. Trabalhe em um branch por fase (ex.: `fase-1-modelo-de-dados`).
3. Antes de commitar: `npm run lint` e `npm run build` precisam passar.
4. Commits em português, no imperativo e descrevendo o efeito
   (ex.: `adiciona modelo de dados das atividades`).
5. Uma fase não começa antes de a anterior ser aprovada.

## Deploy

O build é um site estático; a Vercel detecta Vite automaticamente e publica a
cada push. O passo a passo para conectar o repositório está em
[`docs/fases/fase-0.md`](docs/fases/fase-0.md).
