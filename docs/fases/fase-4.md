# Fase 4 — Tela de Atividades e Parada P2

- **Data:** 2026-10-23
- **Status:** concluída. **Parada P2 aprovada** — 58 testes passando.

## Objetivo

Entregar o segundo dos quatro passos do caminho dos dados: cadastrar as
operações da linha e ver, a cada mudança, o tempo de ciclo, a ocupação e qual
atividade trava a cadência.

É a primeira tela em que o sistema faz o que a planilha não fazia: o gargalo
muda de lugar enquanto se mexe num tempo, sem apertar nada.

Fecha com a **Parada P2** — confirmar que o que a interface guarda alimenta o
motor certo.

## O que foi feito

### Tokens novos — status de ocupação

| Token | Valor | Onde |
| --- | --- | --- |
| `status-ok` | `#4F9D6B` | barra verde, ocupação ≤ 75% |
| `status-atencao` | `#F7A400` | barra laranja, 76% a 99% |
| `status-acima` | `#D13B2E` | barra vermelha, ≥ 100%; borda e tag do gargalo |
| `status-text-atencao` | `#C67F00` | o laranja escurecido, para o número ao lado da barra |
| `preview-bg` | `#FFFDF2` | fundo do card de prévia no drawer |
| `scrim` | `rgba(28,28,28,.55)` | véu sobre a lista com o drawer aberto |

São as três únicas cores do projeto que carregam **significado** em vez de
identidade. Por isso verde e vermelho não aparecem em mais lugar nenhum — se
aparecessem, a cor deixaria de ser sinal.

O `status-text-atencao` existe porque o laranja vivo não tem contraste
suficiente em texto sobre fundo claro: a barra usa a cor viva, o número usa a
escurecida.

### Tela 4A — lista de atividades

`src/pages/AtividadesPage.tsx`. Card de gargalo no alto, tabela com ordem,
nome, código, etapa·linha, ciclo e barra de ocupação, botão de adicionar e o
rodapé com o resumo.

O motor roda a cada mudança de cenário ou de atividade, dentro de um `useMemo`,
e o resultado **não** é guardado em estado: assim a tela nunca mostra número
velho. É barato — são dezenas de atividades e `simular` é função pura.

A sequência vai vazia porque ela é o passo 3. Sem conexões, nenhuma atividade
tem predecessora e cada uma produz a própria capacidade — exatamente o
comportamento da planilha original.

### Tela 4B — drawer de cadastro e edição

`src/components/AtividadeDrawer.tsx`. Painel de 540 px que desliza pela
direita, com a lista escurecida atrás pelo véu. Fecha no ×, no Cancelar, no
clique no véu e no Esc.

O formulário é **local até o Salvar**: editar não altera a lista enquanto a
pessoa ainda está decidindo. O rascunho reinicia por `key` — a página remonta o
drawer a cada atividade —, e não por efeito de sincronização, que o `oxlint`
aponta com razão como render em cascata.

O card "PRÉVIA DO RESULTADO · AO VIVO" chama `calcularAtividade` do motor, a
mesma função que roda na P1. Nenhuma fórmula é repetida na tela: se a fórmula
mudar, a prévia muda junto.

### Estado e utilitários

| Arquivo | O que é |
| --- | --- |
| `src/state/atividades.ts` | o tipo, os valores de atividade nova, geração de id e persistência |
| `src/state/contextoAtividades.ts` | o contexto e o gancho `useAtividades` |
| `src/state/ProvedorAtividades.tsx` | só o componente provedor |
| `src/hooks/usePreviewAtividade.ts` | a prévia ao vivo, pelo motor |
| `src/utils/ocupacaoStatus.ts` | as faixas de cor da tela |
| `src/utils/formato.ts` | vírgula decimal, porcentagem, código da atividade |
| `src/components/BarraOcupacao.tsx` | a barra, usada na lista e na prévia |

**`AtividadeFormulario` é um apelido de `Atividade`.** Diferente do cenário, que
precisou de dois tipos por ter três diferenças reais entre tela e motor, a
atividade não tem nenhuma: todo campo do drawer é um campo do modelo, na mesma
unidade. Criar um tipo gêmeo só criaria uma cópia para sair de sincronia.

### Navegação pelos passos

Os passos do header agora navegam, menos "4 · Resultados", cuja tela não existe.
Um passo clicável que não leva a lugar nenhum é pior do que um que não convida
ao clique. Quando a Fase 6 trouxer os resultados, basta preencher a rota na
lista de passos.

## A Parada P2

```
Test Files  3 passed (3)
      Tests  58 passed (58)
```

`src/integration/__tests__/p2.test.ts`.

### O que a P2 testa, e por que ela não é a P1 de novo

A P1 provou que o motor acerta quando recebe o cenário do robô **montado à mão,
no formato que ele espera**. Entre a tela e o motor há uma tradução —
`cenarioDoFormulario` converte segundos em minutos, preenche o descanso com zero
e a parada com `null`. Se essa tradução errasse, a P1 continuaria passando e o
sistema devolveria números errados mesmo assim.

A P2 monta os estados que os contextos guardam, aplica a mesma tradução que as
telas aplicam e compara com o gabarito da planilha:

| Verificação | Resultado |
| --- | --- |
| `tempoDisponivelMin` = 5600 | ✅ |
| `gargaloAtividadeId` = `'112'` | ✅ |
| ocupação da `'112'` ≈ 1,15324 | ✅ |
| ocupação da `'221'` ≈ 0,98327 | ✅ |
| as 15 atividades chegam ao motor | ✅ |
| a tradução reproduz o cenário da P1 | ✅ *menos um campo — ver abaixo* |

Não aciona React nem navegador: o que está sob teste é a **tradução**, e ela é
função pura. Fica de fora digitar nos campos, navegar e a persistência — isso é
comportamento de componente, pede navegador de verdade e seria outra
ferramenta.

### O que a P2 encontrou

A comparação campo a campo falhou na primeira execução, e por um motivo real:

**A interface não consegue reproduzir o cenário da planilha por inteiro.** A
planilha do robô tem 20 min de tempo de descanso; a tela aprovada **não tem esse
campo**, porque a P1 provou que a planilha não o desconta do tempo disponível
(divergência D-10). O cenário que sai da interface traz zero ali.

Hoje é inofensivo, e o teste prova: os dois cenários dão exatamente o mesmo
tempo disponível. Mas é uma assimetria registrada, com um teste que **falha de
propósito** no dia em que D-10 for resolvida a favor de descontar o descanso —
e aí a tela precisa ganhar o campo de volta.

## Divergências

### D-18. Duas classificações de ocupação com cortes diferentes — **RESOLVIDA**

Ao entregar a fase havia **duas** implementações:

| Onde | `ok` → `atencao` | `atencao` → `acima` |
| --- | --- | --- |
| `getStatusOcupacao` (tela, DP-2) | 0,75 | 1,00 |
| `classificarOcupacao` (motor, Fase 2) | 0,85 | 1,00 |

As duas concordavam nas cinco atividades de referência, então nada parecia
errado — uma atividade a 80% de ocupação é que sairia verde num lugar e laranja
no outro.

Resolvida a favor de **0,75**, o valor do DP-2. O corte do motor foi alinhado e
`getStatusOcupacao` passou a **delegar** para `classificarOcupacao`: agora há uma
implementação só, e o que sobrou em `src/utils/ocupacaoStatus.ts` é o que é de
fato da tela, o mapa de cores.

Um teste percorre dez valores comparando as duas funções, de modo que elas não
têm como voltar a divergir em silêncio.

**Segue em aberto:** o corte de 0,75 vem do DP-2 e, como o de 0,85 antes dele,
nunca foi conferido contra a planilha. O de 1,00 é natural — ocupação acima de
100% é sobrecarga.

### D-19. Os números da prévia no frame 4B não fecham entre si

O frame mostra tempo cronometrado `15,00`, tempo padrão `15,15`, tempo de ciclo
`16,15` e ocupação `115,3%`.

Pela fórmula confirmada na P1, `15,00` de cronometrado dá `15,15` de padrão
(confere) e `15,20` de ciclo — não `16,15`. Os valores de ciclo e ocupação do
frame são os da atividade `112` **real**, cujo cronometrado é `15,936`, não
`15,00`.

Implementado pela fórmula do motor. Com a `112` de verdade, o drawer mostra
padrão `16,10`, ciclo `16,15` e ocupação `115,3%` — os dois últimos iguais ao
frame.

Não é problema de ninguém: é um arredondamento do mock de design. Registrado
para que a diferença entre o frame e a tela não vire dúvida mais tarde.

### Valores do DP-2 que não foram aplicados

O guia visual do DP-2 repete alguns valores que divergem dos tokens aprovados no
DP-1. A lista de **tokens novos** do briefing não os inclui, então os do DP-1
foram mantidos:

| No guia DP-2 | No projeto (DP-1) |
| --- | --- |
| fundo areia `#FAF8F4` | `light-bg` `#F5F4EF` |
| amarelo `#F6C212` | `yellow` `#F5C400` |
| laranja `#F7A400` | `orange` `#E87800` |
| borda de input 1.5px `#E2DDD3` | 1px `line` `#E0E0E0` |
| header 76px | ~56px |
| fonte Red Hat Display | **Outfit**, por instrução explícita do briefing |

São diferenças pequenas, mas mudá-las alteraria as telas já aprovadas do DP-1.
**A decidir:** o DP-2 substitui esses valores, ou o DP-1 continua valendo?

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run build` (inclui `tsc -b`) | ✅ sem erros de tipo |
| `npm test` | ✅ **59 passando** (49 anteriores + 9 da P2 + 1 que trava a D-18) |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Os 49 testes anteriores | ✅ nenhum foi alterado |
| Telas conferidas contra os frames DP-2 | ✅ capturadas em `localhost` |
| Valores da lista contra a tabela de referência | ✅ os cinco batem: 6,27/44,8% · 16,15/115,3% · 9,33/66,7% · 4,96/35,4% · 13,77/98,3% |
| **Parada P2** | ✅ **aprovada** |

## Pendências

| Pendência | De quem | Observação |
| --- | --- | --- |
| Conferir o corte de 0,75 contra a planilha | professor / planilha | O valor veio do DP-2; a faixa `ok`/`atencao` nunca foi verificada na fonte |
| Decidir os valores do DP-2 contra os do DP-1 | responsável do projeto | Lista acima |
| Validação de cenário e de atividade incoerentes | Fase 5 | Continua adiada; agora há mais o que validar (código de atividade repetido, tempo zero) |
| `logos/eng-producao.png` com 1,03 MB | responsável do projeto | Segue sendo o maior arquivo do build |

## Não entra nesta fase (confirmando o escopo)

Construtor visual de sequência (só o placeholder de rota `/sequencia`),
resultados, gráficos e validação. As fórmulas do motor não foram tocadas.
