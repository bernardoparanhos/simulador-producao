# Fase 1 — Coleta e identidade (parte do modelo de dados)

- **Data:** 2026-10-23
- **Status:** concluída, aguardando aprovação para a Fase 2

## Objetivo

A Fase 1 do plano tem duas metades: **definir o modelo de dados** (as entidades
do caminho dos dados) e **reunir os assets institucionais**. Esta entrega cobre
a primeira por completo e prepara o lugar da segunda — os arquivos de
identidade são fornecidos pelo responsável do projeto e nada foi inventado em
seu lugar.

Escopo fechado de propósito: só as formas dos dados. Nenhuma fórmula, nenhuma
validação, nenhuma tela. O motor de cálculo é a Fase 2.

## O que foi feito

### Modelo de dados — `src/types/`

Cinco arquivos, um por bloco do caminho dos dados, mais o barril:

| Arquivo | Tipos |
| --- | --- |
| `cenario.ts` | `Cenario`, `Inspecao`, `ParadaNaoPlanejada`, `Periodicidade` |
| `atividade.ts` | `Atividade`, `AtividadeId` |
| `sequencia.ts` | `Sequencia`, `NoSequencia`, `ConexaoSequencia`, `ConexaoId`, `Posicao` |
| `simulacao.ts` | `EntradaSimulacao` |
| `resultados.ts` | `ResultadoSimulacao`, `ResultadoGlobal`, `ResultadoPorAtividade`, `StatusOcupacao` |
| `index.ts` | reexporta tudo (`import type { ... } from '@/types'`) |

Todos os campos do inventário extraído da planilha estão no modelo, com JSDoc
em **cada** campo informando a unidade (min, %, unid., unid./dia, min/unid.).

A assinatura que isso entrega para a Fase 2:

```ts
function simular(entrada: EntradaSimulacao): ResultadoSimulacao
```

### Sequência — a parte que importa

Modelada como **grafo dirigido**: `nos` (atividades colocadas no fluxo) e
`conexoes` (`origem` alimenta `destino`). As três escolhas:

1. **A identidade do nó é o `atividadeId`.** Não há id de nó separado, logo cada
   atividade aparece no máximo uma vez no fluxo.
2. **`etapa`, `linha` e `processo` moram em `Atividade`**, não no nó. O nó não
   repete a posição lógica.
3. **`posicao` (x, y em px) é opcional e puramente visual.** Sem ela, a
   interface deriva a posição da grade: etapa no X, linha no Y.

O raciocínio completo, as alternativas descartadas e as consequências estão em
[0002 — Representação da sequência](../decisoes/0002-representacao-da-sequencia.md).
O mapeamento para o React Flow é um adaptador na camada de interface; o modelo
de domínio não conhece a biblioteca.

### Documentação

- `docs/modelo-de-dados.md` — a referência do modelo: princípios, organização
  dos arquivos, tabela de campos e unidades por entidade, decisões de cada bloco,
  mapeamento contra as abas da planilha e as perguntas abertas.
- `docs/decisoes/0002-representacao-da-sequencia.md` — a decisão da sequência.
- `docs/plano-de-construcao.md` — nota de estado da Fase 1 e ponteiros para os
  documentos novos.
- `README.md` — estado atual, estrutura de pastas e índice de documentação
  atualizados.
- `docs/fases/fase-1.md` — este arquivo.

### `src/assets/` preparada

- Subpastas `logos/` e `capas/`, cada uma com um `.gitkeep` para existir no Git.
- `README.md` reescrito: o que vai em cada pasta, formato preferido (SVG para
  logos, JPG/WebP ≥ 1920 px para capas), convenção de nome de arquivo
  (minúsculas, hífen, sem acento, sufixos `-horizontal`, `-vertical`,
  `-monocromatico`, `-branco`), como importar no código e quando usar `public/`
  em vez de `src/assets/`.
- **Nenhum logo foi criado ou baixado.** A pasta está vazia, esperando os
  arquivos.

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run build` (inclui `tsc -b`) | ✅ sem erros de tipo; bundle gerado |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Cobertura do inventário da planilha | ✅ todos os campos listados no escopo da fase estão no modelo |
| JSDoc com unidade em cada campo | ✅ |
| `src/assets/` pronta, sem assets inventados | ✅ |
| `docs/modelo-de-dados.md` com decisões e mapeamento | ✅ |

O build apenas verifica os tipos: como nada ainda os importa, eles são apagados
na compilação e não mudam o tamanho do bundle. O primeiro uso real é na Fase 2.

## Decisões tomadas

Registrada em
[0002 — Representação da sequência](../decisoes/0002-representacao-da-sequencia.md).
As demais, menores, ficam em `docs/modelo-de-dados.md`, junto do bloco a que
pertencem:

1. **Um arquivo por bloco** do caminho dos dados, com barril em `index.ts`, em
   vez de um arquivo único seccionado — cada bloco cresce numa fase diferente, e
   o diff de cada fase fica legível.
2. **`tempoDisponivelMin` é resultado, não entrada**, conforme o briefing.
3. **`paradaNaoPlanejada` é anulável** (`| null`), porque um cenário sem parada é
   situação normal e explícita.
4. **A parada referencia `atividadeId`**, nunca a descrição nem o índice.
5. **Identificadores como `string` opaca**, sem *branded type*: a segurança
   extra não paga o atrito de construir ids em formulários e fixtures.
6. **Interfaces mutáveis, sem `readonly`**, para serem usadas direto como estado
   de formulário nas fases de interface.
7. **`fatorRitmo` e `fatorTolerancia` em porcentagem** (`102`, `7`), como na
   planilha — o valor digitado é o valor guardado.
8. **Nenhum `enum`**: o projeto usa `erasableSyntaxOnly`, e uniões de literais
   (`'Diario' | 'Semanal' | 'Mensal'`) são o equivalente idiomático.

## Pendências

| Pendência | De quem | Observação |
| --- | --- | --- |
| Responder as 5 perguntas abertas de `docs/modelo-de-dados.md` | responsável do projeto | Não bloqueiam a Fase 2, mas convém decidir antes de o motor congelar as unidades |
| Enviar os arquivos de identidade para `src/assets/logos/` e `src/assets/capas/` | responsável do projeto | A pasta e o README estão prontos; as cores seguem provisórias até lá |
| Conectar a conta na Vercel e publicar | responsável do projeto | Herdada da Fase 0; passo a passo no README |
| Aprovar a Fase 1 | responsável do projeto | A Fase 2 não começa sem o OK |

## Não entra nesta fase (confirmando o escopo)

Motor de cálculo, fórmulas, faixas de `statusOcupacao`, validação do grafo,
telas, construtor visual, gráficos, cenário do robô em `src/fixtures/` e testes
automatizados — todos deixados intencionalmente para as fases seguintes,
conforme o plano. `src/engine/`, `src/components/` e `src/fixtures/` seguem
vazias.
