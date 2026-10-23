# Fase 0 — Fundação

- **Data:** 2026-10-23
- **Status:** concluída, aguardando aprovação para a Fase 1

## Objetivo

Levantar o esqueleto do projeto e o sistema de documentação. Nenhuma
funcionalidade de produto, nenhuma tela de simulador e nenhuma lógica de
cálculo nesta fase — apenas a base sobre a qual as outras 8 fases vão ser
construídas, mais a prova de que ela roda local e publica.

## O que foi feito

### Projeto

- Projeto criado com Vite (modelo `react-ts`), em `C:\Users\Bernardo\simulador-producao`.
- Dependências instaladas: React 19, TypeScript 6, Tailwind CSS 4 (via plugin
  `@tailwindcss/vite`), React Flow 12 (`@xyflow/react`) e Recharts 3.
- `vite.config.ts`: plugin do Tailwind registrado e alias `@/` → `src/`.
- `tsconfig.app.json`: `strict: true` e `paths` para o alias `@/`.
- Fonte **Outfit** carregada no `index.html` (Google Fonts, pesos 300–700) e
  aplicada como fonte padrão via token `--font-sans`.
- `index.html` com `lang="pt-BR"`, título e descrição do projeto.
- Favicon próprio (`public/favicon.svg`), substituindo o do modelo do Vite.
- Arquivos de exemplo do modelo do Vite removidos (`App.css`, `src/assets/react.svg`,
  `src/assets/hero.png`, `src/assets/vite.svg`, `public/vite.svg`, `public/icons.svg`).

### Identidade visual

Tokens definidos em `src/index.css`, no bloco `@theme` do Tailwind 4:

- `grafite-50 … grafite-900` — neutros institucionais (fundo, texto, bordas).
- `acento-500 / acento-600` — ações, destaques e série primária de gráfico.

São tokens **provisórios**, escolhidos para dar um visual limpo e
institucional à página de placeholder. A identidade definitiva (cores da
UTFPR, logo, capa) entra quando os arquivos de identidade forem adicionados a
`src/assets/`.

### Estrutura de pastas

```
simulador-producao/
├── docs/
│   ├── plano-de-construcao.md   # fonte de verdade (aguardando o conteúdo)
│   ├── decisoes/                # um arquivo por decisão, numerado
│   └── fases/                   # um log por fase
├── public/                      # arquivos de URL fixa (favicon)
└── src/
    ├── engine/      index.ts    # motor de cálculo — TS puro, sem React (vazio)
    ├── types/       index.ts    # modelo de dados (vazio)
    ├── components/  index.ts    # componentes de UI (vazio)
    ├── pages/       HomePage.tsx, index.ts
    ├── fixtures/    index.ts    # cenários de exemplo (vazio)
    ├── assets/      README.md   # identidade institucional (vazio)
    ├── App.tsx
    ├── main.tsx
    └── index.css                # Tailwind + tokens de identidade
```

Cada pasta que ainda está vazia recebeu um `index.ts` com um comentário
explicando sua responsabilidade e a regra que vale ali. Isso faz a pasta
existir no Git (que não versiona diretórios vazios) e deixa a intenção
registrada no próprio código.

### Página inicial

`src/pages/HomePage.tsx` — placeholder institucional: identificação da
instituição e do curso, título "Simulador de Produção", aviso de "em
construção" e a fase atual. Serve só para confirmar que fonte, Tailwind e
deploy funcionam; será substituída nas fases seguintes.

### Documentação

- `README.md` — visão geral, como rodar, estrutura de pastas, como contribuir.
- `docs/plano-de-construcao.md` — criado com o cabeçalho explicando que é a
  fonte de verdade. **Conteúdo ainda não colado.**
- `docs/decisoes/0001-escolha-da-stack.md` — stack registrada, com
  alternativas descartadas e consequências.
- `docs/fases/fase-0.md` — este arquivo.

### Git

- Repositório inicializado, `.gitignore` do modelo do Vite (ignora
  `node_modules/`, `dist/`, logs e arquivos de editor), commit inicial feito.

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run dev` serve a página | ✅ HTTP 200, título e fonte presentes no HTML servido |
| `npm run build` | ✅ `tsc -b` sem erros; bundle gerado (~220 kB JS / 7,4 kB CSS) |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Tailwind + Outfit visíveis | ✅ CSS compilado contém as utilidades e a família Outfit |
| Estrutura de pastas | ✅ criada, com placeholder em cada pasta |
| Git com commit inicial | ✅ |
| `docs/` completa | ✅ README, plano, decisão 0001, log da fase 0 |
| Pronto para Vercel | ✅ build estático detectável pela Vercel; conexão da conta é passo manual |

## Decisões tomadas

Registradas em [0001 — Escolha da stack](../decisoes/0001-escolha-da-stack.md).
Resumo do que foi decidido *dentro* da stack já aprovada:

1. **`@xyflow/react`** em vez do pacote antigo `reactflow` (nome atual do
   React Flow; o antigo está descontinuado).
2. **`strict: true`** no TypeScript.
3. **Alias `@/` → `src/`**, para evitar caminhos relativos profundos.
4. **Nenhuma biblioteca de rotas instalada.** O app tem uma tela só nesta
   fase; `App.tsx` renderiza `HomePage` direto. Quando o plano pedir mais de
   uma tela, a decisão de rotas entra como registro próprio.
5. **Nenhum gerenciador de estado global instalado**, pela mesma razão.
6. **`noUncheckedIndexedAccess` deixado desligado** — ver consequências na
   decisão 0001.

Nada disso foge do que foi pedido. Os itens 4 e 5 são omissões deliberadas:
não instalar o que ainda não tem uso definido.

## Pendências

| Pendência | De quem | Observação |
| --- | --- | --- |
| Colar o conteúdo do Plano de Construção em `docs/plano-de-construcao.md` | responsável do projeto | **Bloqueia a Fase 1** — é a referência de escopo de todas as fases |
| Conectar a conta na Vercel e publicar | responsável do projeto | Passo a passo no README |
| Enviar arquivos de identidade (logo UTFPR, capa) para `src/assets/` | responsável do projeto | Os tokens de cor atuais são provisórios até isso |
| Aprovar a Fase 0 | responsável do projeto | A Fase 1 não começa sem o OK |

## Não entra nesta fase (confirmando o escopo)

Motor de cálculo, modelo de dados, telas de produto, construtor visual de
sequência, gráficos, cenário do robô e testes automatizados — todos deixados
intencionalmente para as fases seguintes, conforme o plano.

## Deploy na Vercel — passo a passo (manual)

A parte do código está pronta: a Vercel reconhece um projeto Vite sozinha
(comando de build `npm run build`, pasta de saída `dist`), então **não é
preciso criar `vercel.json`**. O que falta é a conexão da conta, que só o
responsável do projeto pode fazer.

### 1. Enviar o repositório para o GitHub

O repositório já existe localmente, mas ainda não tem remoto. Crie um
repositório vazio no GitHub (sem README, sem `.gitignore` — o projeto já tem os
dois) e depois, na pasta do projeto:

```bash
git remote add origin https://github.com/<seu-usuario>/simulador-producao.git
git branch -M main
git push -u origin main
```

### 2. Importar na Vercel

1. Acesse [vercel.com](https://vercel.com) e entre com a conta do GitHub.
2. **Add New… → Project**.
3. Autorize a Vercel a ver seus repositórios, se for a primeira vez.
4. Localize `simulador-producao` e clique em **Import**.

### 3. Confirmar e publicar

Na tela de configuração, confira que a Vercel detectou:

| Campo | Valor esperado |
| --- | --- |
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Environment Variables | *nenhuma* (o projeto não usa) |

Clique em **Deploy** e aguarde cerca de um minuto. A URL publicada será algo
como `simulador-producao.vercel.app`, mostrando a página de placeholder.

### Depois disso

Cada `git push` na branch `main` republica o site automaticamente. Pushes em
outras branches geram uma URL de pré-visualização própria — útil para revisar
uma fase antes de ela virar a versão oficial.
