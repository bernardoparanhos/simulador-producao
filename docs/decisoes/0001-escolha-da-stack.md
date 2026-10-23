# 0001 — Escolha da stack

- **Data:** 2026-10-23
- **Status:** aceita
- **Fase:** 0

## Contexto

O Simulador de Produção substitui uma planilha Excel usada no ensino de
Planejamento e Controle da Produção (Engenharia de Produção, UTFPR Medianeira).
A melhoria central em relação à planilha é um **construtor visual de sequência
de atividades** que dirige o cálculo.

Isso impõe três exigências à stack:

1. **Interface gráfica interativa** — nós, conexões e arrastar/soltar no
   construtor de sequência (Fase 4).
2. **Cálculo confiável e testável** — o resultado precisa ser auditável contra
   a planilha original, já que é material didático.
3. **Publicação simples** — alunos e professores acessam por link, sem
   instalar nada; o projeto não tem equipe de infraestrutura.

O projeto também é longo (9 fases), então a estrutura precisa aguentar
crescimento sem reescrita.

## Decisão

A stack abaixo foi aprovada pelo responsável do projeto antes da Fase 0:

| Camada | Escolha | Papel |
| --- | --- | --- |
| Build / dev server | **Vite 8** | Servidor de desenvolvimento rápido, build de produção estático |
| Biblioteca de UI | **React 19** | Componentização da interface |
| Linguagem | **TypeScript 6** (modo `strict`) | Tipagem do modelo de dados e do motor de cálculo |
| Estilo | **Tailwind CSS 4** (plugin `@tailwindcss/vite`) | Estilização utilitária, com tokens de identidade em `src/index.css` |
| Tipografia | **Outfit** (Google Fonts) | Fonte institucional do projeto |
| Construtor visual | **React Flow 12** (`@xyflow/react`) | Editor de nós e conexões da sequência de atividades — instalado, **sem uso até a Fase 4** |
| Gráficos | **Recharts 3** | Gráficos dos resultados — instalado, **sem uso até as fases de resultado** |
| Hospedagem | **Vercel** | Deploy do site estático a partir do Git |
| Versionamento | **Git** | Histórico e base do deploy automático |

Decisões de detalhe tomadas na Fase 0 dentro dessa stack:

- **Pacote do React Flow:** `@xyflow/react` (versão 12), que é o nome atual do
  pacote. O pacote antigo `reactflow` está descontinuado e não recebe mais
  versões novas.
- **`strict: true` no TypeScript** — o motor de cálculo é o coração do projeto
  e precisa do verificador do lado dele.
- **Alias de import `@/`** apontando para `src/` — evita caminhos como
  `../../../engine` quando a estrutura crescer.
- **Separação rígida entre cálculo e interface:** `src/engine/` é TypeScript
  puro, sem React e sem DOM. Ver consequências abaixo.
- **Sem biblioteca de rotas e sem gerenciador de estado global** nesta fase.
  Nada foi instalado que ainda não tenha uso definido no plano.

## Alternativas consideradas

- **Next.js em vez de Vite** — descartado. O simulador roda inteiro no
  navegador e não tem backend, banco nem necessidade de renderização no
  servidor ou SEO. Next.js traria conceitos (rotas de servidor, cache,
  componentes de servidor) sem retorno aqui.
- **Manter a planilha e só melhorar o Excel** — descartado na própria premissa
  do projeto: o construtor visual de sequência não é construível em planilha.
- **CSS Modules ou styled-components em vez de Tailwind** — descartado. Com
  Tailwind, a identidade visual fica concentrada nos tokens de
  `src/index.css`, e o acerto visual acontece junto da marcação, o que é mais
  rápido num projeto conduzido por uma pessoa.
- **D3 em vez de React Flow para o construtor** — descartado. D3 dá mais
  controle, mas obrigaria a escrever arrastar, zoom, roteamento de arestas e
  seleção na mão. React Flow já entrega isso e é especificamente um editor de
  grafos.
- **Chart.js em vez de Recharts** — descartado por integração: Recharts é
  escrito em componentes React, o que combina com o resto da base.
- **GitHub Pages em vez de Vercel** — descartado. Vercel detecta Vite sozinha,
  faz deploy a cada push e dá pré-visualização por branch, sem configuração.
- **JavaScript sem TypeScript** — descartado. O modelo de dados do simulador
  (atividades, recursos, sequência) é a parte que mais vai mudar ao longo das
  9 fases, e é exatamente aí que a tipagem evita quebra silenciosa.

## Consequências

**A favor**

- O resultado do build é um site estático: deploy barato, rápido e sem
  servidor para manter.
- `src/engine/` sem React significa que o cálculo pode ser testado chamando
  funções diretamente, sem renderizar tela — e comparado com a planilha
  original de forma direta.
- React Flow e Recharts já instalados: quando as Fases 4 e seguintes
  chegarem, não há decisão de ferramenta pendente.

**Contra / a vigiar**

- **Dependências instaladas sem uso imediato** (React Flow, Recharts) pesam no
  `package.json` desde já. Aceito de propósito, para fechar a decisão de
  ferramenta agora; elas não entram no bundle enquanto não forem importadas.
- **Tudo roda no navegador.** Não há persistência entre sessões até que alguma
  fase decida como salvar cenários (arquivo local, `localStorage` ou backend).
  Isso é uma decisão futura, não resolvida aqui.
- **A fonte Outfit vem do Google Fonts por CDN.** Sem internet, a página cai
  para a fonte do sistema. Se isso virar problema (laboratório sem rede, por
  exemplo), a saída é hospedar a fonte junto do projeto.
- **A separação motor/interface exige disciplina.** É fácil, sob pressa,
  colocar regra de cálculo dentro de um componente. Essa fronteira precisa ser
  defendida nas revisões de cada fase.
- **`strict: true`** vai reclamar mais durante a escrita do código. É o
  objetivo.
- `noUncheckedIndexedAccess` foi **deixado de fora**: dá segurança real em
  código com muito acesso a vetor, mas gera bastante atrito. Pode ser ligado
  depois, quando o formato do motor de cálculo estiver estável.
