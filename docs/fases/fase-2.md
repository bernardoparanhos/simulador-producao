# Fase 2 — Motor de cálculo

- **Data:** 2026-10-23
- **Status:** concluída. **Parada P1 aprovada** — 49/49 testes passando, as 15
  atividades do robô batendo com a planilha.

## Objetivo

Portar as fórmulas extraídas da planilha para um módulo TypeScript puro, sem
interface. O motor recebe `EntradaSimulacao` e devolve `ResultadoSimulacao`.

Fechar a fase incluía a **Parada P1**: rodar o caso do robô e bater com os
números da planilha. A parada passou, depois de corrigir duas fórmulas e
descartar uma premissa — ver [A Parada P1](#a-parada-p1).

## O que foi feito

### Tipos atualizados

Em `src/types/resultados.ts`:

| Antes | Depois |
| --- | --- |
| `leadTime` | `leadTimeMin` |
| `wip` | `wipPecas` |
| `eficienciaTotal` em % | fração, 1 = 100% |
| `ocupacaoMedia` em % | fração, 1 = 100% |

Agora **todo** o modelo usa fração para grandezas relativas. Converter para
porcentagem é trabalho exclusivo da camada de tela.

A documentação de `ocupacao`, `eficienciaTotal` e `ocupacaoMedia` deixou de
dizer "fração de 0 a 1": a ocupação **passa de 1** quando a atividade está
sobrecarregada (ver D-15). A de `taktTimeMin` passou a registrar que ele é
reportado mas não é o denominador da ocupação.

### O motor — `src/engine/`

Quatro passos, cada um num arquivo, na ordem em que dependem um do outro:

| Arquivo | Função | O que calcula |
| --- | --- | --- |
| `tempo.ts` | `calcularTempoDisponivel` | Tempo produtivo do período, a partir da jornada |
| | `calcularDiasNoPeriodo` | Multiplicador do período, conforme a periodicidade |
| | `calcularTempoInspecaoPorPecaMin` | Tempo de inspeção por peça — **não usado** (D-13) |
| | `calcularTaxaAprovacao` | Aprovação determinística — **não usada** (D-4) |
| `atividade.ts` | `calcularAtividade` | Tempo padrão, ciclo, takt, ciclos, capacidade, ocupação, tempo de lote |
| | `classificarOcupacao` | Faixas `ok` / `atencao` / `acima` |
| `sequencia.ts` | `propagarGargalo` | Produção realizada, percorrendo o grafo em ordem topológica |
| `globais.ts` | `calcularGlobais` | Eficiência, lead time, WIP, ocupação média, gargalo |
| | `encontrarGargalo` | Atividade de menor capacidade |
| `index.ts` | `simular` | A única função que a interface precisa conhecer |

Um tipo intermediário, `ResultadoAtividadeIsolada`, separa o que dá para
calcular olhando uma atividade sozinha do que só fecha com o fluxo inteiro
(`producaoRealizadaDiaria`, `estoqueFinal`, `ehGargalo`). É um `Omit` do
resultado público, então os dois nunca saem de sincronia.

`simular()` é pura e determinística: mesma entrada, mesma saída, sem estado, sem
efeito colateral e sem sorteio. Zero dependências — nem React, nem DOM, nem
biblioteca alguma.

### Fórmulas implementadas

As que a Parada P1 confirmou contra a planilha:

```text
tempoDisponivelMin   = (tempoTurnoMin - tempoRefeicaoMin * numRefeicoesPorTurno
                        - trocaTurnoMin) * turnosDiarios * diasNoPeriodo
tempoPadraoMin       = tempoCronometradoMin * (fatorRitmo/100) * (1 + fatorTolerancia/100)
tempoCicloMin        = tempoPadraoMin + setupMin / tamanhoLote
taktTimeMin          = (tempoDisponivelMin / (tamanhoLote * demanda)) * 60
quantidadeCiclos     = demanda / tamanhoLote
capacidadePeriodo     = tempoDisponivelMin / tempoCicloMin
ocupacao             = (tempoCicloMin * demanda) / tempoDisponivelMin
tempoProducaoLoteMin = tempoCicloMin * quantidadeCiclos
estoqueFinal         = producaoRealizadaDiaria - demanda
```

Propagação pela sequência, que o robô não exercita (não tem fluxograma):

```text
producaoRealizadaDiaria[a] = min(
  capacidadePeriodo[a],
  producaoRealizadaDiaria[p] para toda predecessora direta p de a
)
```

### Fixtures — `src/fixtures/`

- **`robo.ts`** — o caso real, da planilha `SIMULADOR DE PRODUÇÃO ROBÔ.xlsm`.
  15 atividades em três etapas e três linhas, demanda de 400 em lotes de 20,
  dois turnos. **Sem sequência:** o fluxograma da planilha estava vazio.
- **`exemplo.ts`** — cenário sintético e fictício, criado para exercitar o que o
  robô não exercita: afunilamento (duas atividades da etapa 1 alimentam uma da
  etapa 2), gargalo no meio do caminho, as três faixas de ocupação e estoque dos
  dois sinais. A demanda foi ajustada de 480 para 240 depois da P1, porque com a
  fórmula de ocupação corrigida o valor antigo punha quase tudo em `'acima'` e o
  cenário deixava de cobrir as faixas.

## A Parada P1

```
Test Files  2 passed (2)
      Tests  49 passed (49)
```

As 15 atividades do robô batem com a aba RELATÓRIO da planilha em **tempo
padrão, tempo de ciclo, capacidade e ocupação**, mais o tempo disponível
(5600 min), o takt (42 min) e o gargalo (atividade `'112'`).

### O que a P1 corrigiu

Três coisas estavam erradas na primeira entrega da Fase 2:

| # | O que estava errado | Prova |
| --- | --- | --- |
| D-10 | O tempo disponível descontava o descanso | Com descanso: 5320. Planilha: **5600** |
| D-11 | A ocupação era `tempoCicloMin / taktTimeMin` | Dava 0,1493 para `'111'`. Planilha: **0,44797** |
| D-13 | A inspeção era somada ao tempo de ciclo | `6,2216 + 1/20 = 6,2716` exato, sem folga |

As duas primeiras vieram apontadas na extração. A terceira apareceu ao conferir
o gabarito: o tempo de ciclo de `'111'` fecha exatamente no tempo padrão mais o
setup diluído, sem espaço para a parcela de inspeção que a Fase 2 somava como
premissa documentada.

### O que a P1 não resolve

- **A propagação do gargalo (D-3).** O robô não tem fluxograma, então nenhuma
  atividade tem predecessora e a produção realizada é igual à capacidade em
  todas. A propagação é testada com o cenário sintético e vai ao caso real na
  **Parada P3**.
- **`numOperadores` (D-1).** Todas as 15 atividades do robô têm um operador só,
  então o cenário daria o mesmo resultado nas duas leituras.
- **A periodicidade mensal (D-12).** Nenhum cenário mensal foi extraído; o fator
  22 segue sem verificação.

### Testes

- **`robo.test.ts` — 9 testes.** O gabarito da planilha, campo por campo: tempo
  disponível, takt, tempo padrão e ciclo (15 atividades), capacidade (15),
  ocupação (15), gargalo, produção realizada igual à capacidade e estoque final.
  Tolerância de 0,001 nos fracionários e 0,01 nas capacidades, que o gabarito
  traz com duas casas.
- **`motor.test.ts` — 40 testes.** O que a planilha não cobre: as três
  periodicidades, o afunilamento pelo mínimo, a propagação por toda a cadeia,
  tolerância a ciclo e a conexões órfãs, os limites exatos das faixas (0,85 e
  1,00), bordas (lista vazia, atividade sozinha) e a pureza da função. Inclui um
  teste provando que **mudar o fluxo muda os números** — o ponto do projeto — e
  três testes que travam as divergências (D-1, D-11, D-13), de modo que mudar
  qualquer uma exige mudar um teste de propósito.

## Decisões tomadas

Registradas em
[0003 — Premissas do motor de cálculo](../decisoes/0003-premissas-do-motor-de-calculo.md).
Em resumo, três regras em ordem de precedência:

1. **Onde há fórmula, implementa a fórmula**, mesmo quando o domínio sugere
   outra.
2. **Onde não há fórmula, não inventa uma** — o campo fica inerte, com `TODO`.
3. **Uma decisão de produto em texto vale como instrução**: cumpre, escolhendo o
   ponto de aplicação mais isolado possível, e documenta como premissa.

A P1 validou a regra 1 e reprovou a única aplicação da regra 3: a premissa da
inspeção estava errada (D-13). O ponto de aplicação ter ficado isolado numa
função própria é o que permitiu remover o termo mudando uma linha.

Mais duas decisões de fronteira, na mesma 0003:

- **O motor não valida a entrada.** Validar exige decidir o que dizer ao
  usuário, e isso é da interface (Fases 3 e 4).
- **A propagação usa a produção realizada das predecessoras**, não a capacidade
  delas — é o que faz o gargalo atravessar a linha inteira (D-3, a confirmar na
  P3).

## Divergências

Quinze pontos entre as fórmulas da planilha e o modelo de dados. Seis foram
resolvidos pela P1; nove seguem abertos.

### Resolvidas pela Parada P1

#### D-10. `tempoDescansoMin` não entra no tempo disponível — **RESOLVIDA**

A fórmula da Fase 2 descontava o descanso. A planilha não desconta:
`(480 - 30 * 2 - 20) * 2 * 7 = 5600`, que é o valor do relatório. Com o
desconto daria 5320.

O campo continua no modelo e no cenário do robô (20 min), porque é dado real da
planilha — só não entra nesta conta. **A decidir com o professor:** a planilha
esquece o descanso, ou ele já está embutido em outro desconto? Há um teste
travando o comportamento atual.

#### D-11. A ocupação não usa o takt time — **RESOLVIDA**

A fórmula correta é

```text
ocupacao = (tempoCicloMin * demanda) / tempoDisponivelMin
```

que por identidade é o mesmo que `demanda / capacidadePeriodo`. Em palavras: a
razão entre o tempo que a demanda exige da atividade e o tempo que ela tem.

A fórmula anterior (`tempoCicloMin / taktTimeMin`) dava valores 3 vezes menores
no cenário do robô — 0,1493 contra os 0,44797 do relatório para a atividade
`'111'`.

#### D-12. Para `'Semanal'`, o multiplicador é direto — **RESOLVIDA**

O briefing da Fase 2 dizia que `'Semanal'` multiplicava `diasOuSemanasNoMes` por
5 dias úteis. O robô prova que não: periodicidade `'Semanal'` com valor 7 dá
5600 min, que é `400 * 2 * 7`. Com o fator 5 daria 28000.

**Duas consequências a confirmar:**

1. `'Diario'` e `'Semanal'` passaram a usar o mesmo multiplicador, então o campo
   `periodicidade` só distingue `'Mensal'` dos outros dois. Ou o campo é
   decorativo, ou falta uma diferença que a planilha não mostra.
2. O fator 22 de `'Mensal'` **segue sem verificação** — nenhum cenário mensal
   foi extraído.

#### D-13. A inspeção não entra no tempo de ciclo — **RESOLVIDA**

A Fase 2 somava `tempoPorPecaMin * (porcentagemInspecionada / 100)` ao tempo de
ciclo de cada atividade, como premissa documentada, porque a decisão 5 do
briefing mandava a inspeção entrar no cálculo mas nenhuma fórmula dizia onde.

A P1 provou que a planilha não faz isso: o tempo de ciclo de `'111'` no
relatório é exatamente `6,2216 + 1/20 = 6,2716`. O termo foi removido.

**O que fica aberto:** o robô tem os três parâmetros de inspeção preenchidos
(20% das peças, 1 min por peça, 90% de aprovação mínima) e **nenhum deles afeta
número algum do relatório**. A inspeção tem de entrar em algum lugar — falta
descobrir onde. As funções `calcularTempoInspecaoPorPecaMin` e
`calcularTaxaAprovacao` seguem exportadas e não usadas.

#### D-6. O `* 60` do takt é real — **RESOLVIDA**

O takt da planilha é mesmo `(tempoDisponivelMin / (tamanhoLote * demanda)) * 60`,
e dá 42 no cenário do robô. A leitura: é um takt **por lote**, não por peça — daí
o `tamanhoLote` no denominador e o fator de conversão.

A estranheza que a Fase 2 apontou (a ocupação de todas as atividades depender
disso) desapareceu junto com D-11: a ocupação não usa o takt. Ele é reportado
porque aparece no relatório.

#### D-15. A ocupação não é limitada a 1 — **RESOLVIDA (documentação)**

A documentação dos tipos dizia "fração de 0 a 1". A atividade gargalo do robô
está em **1,15324**: a demanda exige 15% mais tempo do que ela tem. O mesmo vale
para `eficienciaTotal` e `ocupacaoMedia`, que são médias de ocupações.

Corrigido para "fração em que 1 é 100%". Nenhum número mudou — era afirmação
errada na documentação, e um teste que assertava o limite foi reescrito.

### Abertas

#### D-1. `numOperadores` não entra em nenhuma fórmula — **mexe nos números**

O modelo define o campo como postos de trabalho em paralelo, e dois operadores
na mesma operação deveriam cortar o tempo de ciclo pela metade. A fórmula da
planilha não o usa.

A P1 **não resolve**: todas as 15 atividades do robô têm um operador só. A dúvida
só aparece num cenário com postos em paralelo — provavelmente o do trem, na
Fase 7. Há um teste travando a escolha atual.

Forma provável: `(tempoPadraoMin + setupMin / tamanhoLote) / numOperadores`.

#### D-3. A propagação usa a produção realizada das predecessoras — **mexe nos números**

O briefing diz "menor capacidade entre ela e todas as suas predecessoras
diretas"; o motor usa a **produção realizada** das predecessoras, porque é a
única leitura que exige ordem topológica (que o briefing pediu) e a única em que
o gargalo propaga por toda a cadeia.

A P1 **não resolve**, porque o robô não tem fluxograma. Vai à **Parada P3**.
Diferença material em cadeias de três ou mais etapas: capacidades 80, 500 e 400
em série dão 80 na terceira etapa com a leitura do motor, e 400 com a literal.

#### D-4. `minimoAprovacao` é calculada e não usada

Nenhuma fórmula recebida consome a taxa de aprovação, e a P1 confirmou que ela
não aparece em número nenhum do relatório. A decidir: a produção realizada deve
ser multiplicada pela taxa? E o estoque conta peças produzidas ou aprovadas?

Faz par com D-13 — os dois são sobre a inspeção não afetar nada.

#### D-5. `paradaNaoPlanejada` não é usada

Nenhuma fórmula foi recebida para ela, e não há campo de resultado para
guardá-la. A leitura natural (descontar os minutos do tempo disponível da
atividade atingida) exigiria um tempo disponível **por atividade**, e a fórmula
da capacidade usa o tempo disponível global.

O robô não tem parada registrada, então a P1 não ajuda.

#### D-14. Unidade dos campos de inspeção

A planilha guarda `porcentagemInspecionada` como 0,20 e `minimoAprovacao` como
0,90 — células de porcentagem do Excel, que armazenam fração. O modelo documenta
os dois campos em `%` de 0 a 100, como `fatorRitmo` (100) e `fatorTolerancia`
(1), que vêm em porcentagem na mesma planilha.

O fixture converte para 20 e 90, preservando o significado e honrando o contrato
do tipo. **A decidir:** manter a conversão, ou mudar o modelo para fração nestes
dois campos? Não afeta número nenhum hoje, porque a inspeção não entra em
cálculo (D-13) — mas afeta assim que entrar, e afeta as telas da Fase 3.

#### D-7. Os campos `...Diaria` não são diários — **PARCIALMENTE RESOLVIDA**

`tempoDisponivelMin` já embute o multiplicador do período. Logo as grandezas
derivadas são **do período**, não do dia: no robô, a capacidade 892,91 da
atividade `'111'` é para a semana inteira, não para um dia.

`capacidadeDiaria` foi renomeado para **`capacidadePeriodo`** na Fase 3. A
fórmula não mudou e os 49 testes seguem passando — era só nome.

**Falta `producaoRealizadaDiaria`**, que ficou com o sufixo antigo ao lado do
campo já renomeado. É a mesma grandeza e o mesmo argumento; renomear para
`producaoRealizadaPeriodo` fecha a divergência.

#### D-8. `wipPecas` é constante por construção

`soma(quantidadeCiclos * tamanhoLote) / numAtividades`, com
`quantidadeCiclos = demanda / tamanhoLote`, se reduz a `demanda` — para qualquer
cenário, qualquer atividade, qualquer fluxo. Não é uma estimativa imprecisa, é
uma constante disfarçada. Um WIP de verdade sai do grafo.

#### D-9. `ocupacaoMedia` e `leadTimeMin` são apelidos

`ocupacaoMedia = eficienciaTotal` e `leadTimeMin = maiorTempoProducaoMin`,
conforme o briefing. Na planilha os conceitos são distintos — eficiência pondera
pelo tempo trabalhado, e o lead time é a soma dos tempos ao longo do caminho
mais longo da sequência. O grafo já permite calcular o lead time de verdade;
ficou para a Fase 5.

### Não é divergência: `processo`

Ignorado no motor, conforme a decisão 4 do briefing. O campo está preenchido no
fixture do robô (é o terceiro dígito do `id` de cada atividade) e não dirige
cálculo nenhum.

## O que ficou em aberto

### Agenda

`grep -rn "TODO(" src/` lista tudo. Por ordem de quem decide:

| Quem decide | O que |
| --- | --- |
| Professor / planilha | D-10 (o descanso é esquecimento?), D-12 (periodicidade mensal e o papel do campo), D-13 e D-4 (onde a inspeção entra), D-5 (parada não planejada) |
| Produto (Bernardo) | D-14 (unidade dos campos de inspeção), D-7 (renomear `...Diaria`) |
| Parada P3 | D-3 (grandeza que propaga) |
| Fase 7, cenário do trem | D-1 (`numOperadores`) |
| Fase 5 | D-8 (WIP de verdade), D-9 (lead time e eficiência separados), faixas de `statusOcupacao` |

### TODOs de fases posteriores

| TODO | Fase | O que é |
| --- | --- | --- |
| Faixas de `statusOcupacao` | 5 | 0,85 e 1,00 vêm do briefing; o corte de 1,00 é natural, o de 0,85 é convenção |
| `leadTimeMin` de verdade | 5 | Caminho mais longo no grafo, em vez de apelido |
| `ocupacaoMedia` separada da eficiência | 5 | Hoje o mesmo valor |
| `wipPecas` de verdade | 5 | A fórmula atual é constante (D-8) |
| Inspeção aleatória | 7 | A planilha sorteia; o motor é determinístico. Quando mudar, os testes da P1 precisam de semente fixa |
| Fluxo real do robô | P3 | O fluxograma da planilha estava vazio; montar no construtor e conferir |
| Natureza da conexão no afunilamento | 4 | Hoje toda conexão é caminho alternativo do mesmo material; montagem de peças distintas pediria outra regra |
| Validação da entrada | 3 e 4 | Ciclo no grafo, demanda zero, conexão órfã |

## Verificações feitas

| Entregável | Resultado |
| --- | --- |
| `npm run build` (inclui `tsc -b`) | ✅ sem erros de tipo |
| `npm test` | ✅ **49 passando, 0 pendentes** |
| `npm run lint` | ✅ oxlint sem apontamentos |
| Motor sem React, sem DOM, sem dependências | ✅ só importa `@/types` |
| `simular()` puro e determinístico | ✅ coberto por teste |
| **Parada P1** | ✅ **aprovada** — 15 atividades batendo em tempo padrão, ciclo, capacidade e ocupação |

## Não entra nesta fase (confirmando o escopo)

Telas, formulários, construtor visual de sequência, gráficos, identidade
institucional e validação de entrada. `src/components/` e `src/pages/` seguem
como estavam na Fase 0.
