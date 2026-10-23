<!-- Fonte de verdade do projeto. Mantido em sincronia com o plano vivo em claude.ai. Atualize este arquivo quando o plano mudar. -->

# Plano de Construção — Simulador de Produção (web)

Oct 23, 2026 · @Bernardo

Mapa do projeto, do início ao fim, com as paradas de teste. É daqui que saem os prompts para o Claude Code desenvolver.

## Estado da construção

Atualizado em 2026-10-23. Esta seção é o registro de andamento; o restante do
documento é o plano, e não muda por causa do progresso.

| Fase | Estado | Registro |
| --- | --- | --- |
| 0 — Fundação e decisões | concluída | [fase-0.md](fases/fase-0.md) |
| 1 — Coleta e identidade | concluída (modelo de dados + assets institucionais no projeto) | [fase-1.md](fases/fase-1.md) |
| 2 — Motor de cálculo | concluída | [fase-2.md](fases/fase-2.md) |
| **P1 — Parada de teste** | **aprovada**: 49/49 testes, as 15 atividades do robô batendo com a planilha | [fase-2.md](fases/fase-2.md) |
| 3 a 8 | não iniciadas | — |

**A Parada P1 corrigiu três coisas** na primeira entrega do motor: o tempo
disponível não desconta o descanso (D-10), a ocupação não usa o takt time
(D-11) e a inspeção não entra no tempo de ciclo (D-13). Duas divergências que
mexem nos números seguem abertas porque o cenário do robô não as exercita:
`numOperadores` fora das fórmulas (D-1, vai ao cenário do trem na Fase 7) e a
grandeza que propaga pela sequência (D-3, vai à **Parada P3**, porque o
fluxograma da planilha estava vazio).

Documentos de referência produzidos até aqui:

- [modelo-de-dados.md](modelo-de-dados.md) — as entidades, os campos, as
  unidades e o mapeamento contra as abas da planilha. É a referência de entrada
  e saída do motor de cálculo.
- [decisoes/0001-escolha-da-stack.md](decisoes/0001-escolha-da-stack.md)
- [decisoes/0002-representacao-da-sequencia.md](decisoes/0002-representacao-da-sequencia.md)
  — como a sequência de atividades foi representada (grafo dirigido) e por quê.
- [decisoes/0003-premissas-do-motor-de-calculo.md](decisoes/0003-premissas-do-motor-de-calculo.md)
  — o que o motor faz quando a fórmula recebida e o modelo de dados não
  conversam, e por que ele não valida a entrada.

As divergências entre as fórmulas da planilha e o modelo de dados — quinze
pontos, seis resolvidos pela P1 e nove abertos, com impacto estimado em cada
número — estão em [fase-2.md](fases/fase-2.md).
Perguntas abertas do modelo, no fim de [modelo-de-dados.md](modelo-de-dados.md).

## Objetivo e norte

Construir um sistema web que faz o que a planilha Simulador de Produção do prof. Edson faz, só que mais claro e objetivo, e que funciona tão bem quanto ela. Não é só uma cópia da planilha: é um simulador de processos de verdade, genérico e testável, que a pessoa consegue usar sem depender de dados reais.

O norte é a única melhoria que o professor pediu: **facilitar a sequência de atividades nas etapas de produção**. Hoje, na planilha, dizer quais atividades se conectam e como elas afunilam de uma etapa para a outra é manual, confuso e nem alimenta o cálculo. No sistema, isso vira um construtor visual de fluxo: a pessoa monta o encadeamento das atividades e esse fluxo passa a dirigir os resultados. É o que dá autonomia total e é o ponto que o professor vai valorizar.

O sistema também oferece o modo tradicional de preenchimento (telas de formulário), para quem preferir, mas a sequência é o coração.

Uma frase para guiar toda decisão: passos claros. Em qualquer tela, a pessoa precisa saber o que preencher, o que coletar, para onde aquilo vai e onde vira resultado.

## Como vamos trabalhar

Divisão de papéis:

- **Aqui (este chat):** a gente decide, discute as opções, toma as decisões de produto e design, e eu preparo os prompts e as especificações.
- **Claude Code na IDE:** desenvolve o grosso, cria a pasta, os arquivos, o código, e devolve o resultado para a gente avaliar.
- **Ciclo:** eu passo o prompt daqui, o Claude Code desenvolve lá, a gente olha o retorno, decide o ajuste e ele aplica. As decisões vão sendo tomadas no meio do caminho, com o feedback dele; isso é esperado.

É um projeto real desde o início: pasta própria, código versionado e, no fim, publicado na web com um link que o professor abre de qualquer lugar. Quando o Claude Code criar a pasta, Bernardo me libera o acesso para eu acompanhar o código também e conferir contra o blueprint e as fórmulas que já extraí.

**Documentação é regra, não opção.** Isso pode virar algo grande, então tudo fica documentado em cada fase, do mesmo jeito que estamos fazendo aqui: o código (o que cada parte faz), as decisões (o que foi escolhido e por quê) e o estado de cada fase. O projeto tem uma pasta docs/ com o próprio plano anexado, um registro de decisões e um log por fase. O Claude Code atualiza esses documentos à medida que desenvolve, sem deixar acumular.

## Decisões de projeto

Stack recomendada (a confirmar no início; é reversível cedo):

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Base | React + TypeScript + Vite | rápido de rodar, padrão de mercado, fácil de hospedar |
| Estilo | Tailwind CSS + fonte Outfit | visual clean e minimalista, do seu gosto |
| Construtor de fluxo | React Flow | biblioteca pronta para montar e conectar nós (a sequência) |
| Motor de cálculo | módulo TypeScript puro | as fórmulas já extraídas viram funções testáveis, separadas da tela |
| Gráficos | Recharts (ou SVG próprio) | indicadores visuais limpos |
| Deploy | Vercel | publica com um link, grátis, integra com o repositório |

Princípio-chave: o **motor de cálculo fica separado da interface**. Ele recebe os dados e devolve os números, sem saber nada de tela. Isso deixa testar contra a planilha trivial (entra o caso do robô, sai o resultado, compara) e deixa a interface livre para ser bonita e clara.

Estrutura de pastas inicial (o Claude Code cria): uma pasta para o motor (`engine`), uma para as telas (`components`/`pages`), uma para o modelo de dados (`types`), uma para os cenários de exemplo (`fixtures`, começando pelo robô) e uma para os assets institucionais.

Design: identidade da UTFPR e do curso de Engenharia de Produção, fonte Outfit, cores clean, muito espaço em branco, pouca densidade por tela. Objetivo e institucional, para o professor mostrar a outras pessoas sem vergonha.

## O caminho dos dados

O sistema tem um caminho claro, do que a pessoa preenche até onde vira resultado. São cinco blocos:

1. **Cenário (Dados iniciais):** demanda, tamanho do lote, turnos, refeições, descanso, troca de turno, inspeção, paradas. Daqui sai o tempo disponível (calculado) e as metas.
2. **Atividades:** cada atividade com seu tempo cronometrado, setup, fator de ritmo, fator de tolerância e número de operadores. É a matéria-prima dos cálculos.
3. **Sequência (o fluxo):** a pessoa conecta as atividades, define quais vêm antes e quais afunilam na mesma linha da próxima etapa. Este bloco é a melhoria do professor e define por onde a produção caminha.
4. **Cálculo (motor):** com cenário + atividades + sequência, o motor calcula tempo padrão, tempo de ciclo, takt, capacidade, ocupação, quantidade de ciclos, produção (limitada pelo gargalo que a sequência define) e estoque.
5. **Resultados:** indicadores e gráficos, com o gargalo em destaque e a eficiência total.

Como isso mapeia contra a planilha (o que vira tela e o que vira cálculo interno):

| Na planilha | No sistema |
| --- | --- |
| DADOS INICIAIS | tela de Cenário |
| DADOS (formulário ATIVIDADES) | tela de Atividades |
| LOGICA PROCESSO + FLUXOGRAMA | construtor de Sequência (unificados, e agora ligados ao cálculo) |
| RELATÓRIO + ESTOQUES (2) | motor de cálculo (interno, sem tela própria) |
| ESTOQUE FINAL, GRÁFICOS, ANÁLISE VISUAL, RESULTADO | telas de Resultados e Dashboard |
| ESTOQUES, RESULT, TABELAS DINÂMICAS, SOBRE | legado ou apoio; não migram como estão |

O detalhe das fórmulas de cada cálculo já está no outro documento (a especificação viva) e no pacote de extração. Este plano cuida do caminho e da ordem de construção.

## Plano por fases

Nove fases, do início ao fim. As paradas de teste (P1 a P4) ficam entre as fases: só segue quando o checkpoint passa. O roadmap abaixo mostra a sequência; em seguida, o detalhe de cada fase.

Roadmap resumido: Fase 0 -> Fase 1 -> Fase 2 -> [P1] -> Fase 3 -> [P2] -> Fase 4 (coracao) -> [P3] -> Fase 5 -> [P4] -> Fase 6 -> Fase 7 -> Fase 8.

**Fase 0 — Fundação e decisões.** Confirmar a stack, o Claude Code cria a pasta e o esqueleto do projeto (repositório, estrutura, Tailwind + Outfit, deploy vazio já no ar). Entregável: projeto roda local e publica uma página em branco na web.

**Fase 1 — Coleta e identidade.** Reunir os assets institucionais (logo e SVG da UTFPR e do curso, fotos de capa, símbolos) e definir o modelo de dados (as entidades do caminho dos dados). Entregável: kit visual no projeto e o modelo de dados escrito.

**Fase 2 — Motor de cálculo.** Portar as fórmulas extraídas para o módulo TypeScript, sem interface ainda. Entregável: motor que recebe um cenário e devolve os indicadores. **Parada P1:** rodar o caso do robô no motor e bater com os números da planilha (tempo de ciclo, takt, ocupação, gargalo, estoque).

**Fase 3 — Entradas.** Telas de Cenário e de Atividades, com os campos claros e a orientação do que preencher em cada passo. Entregável: a pessoa cadastra um cenário pela tela. **Parada P2:** inserir o robô pela interface e confirmar que alimenta o motor certo.

**Fase 4 — Construtor de sequência.** O coração: montar o fluxo conectando atividades entre etapas e linhas, e fazer esse fluxo dirigir o cálculo (o gargalo se propaga pela sequência). Mantém o modo tabular tradicional como alternativa. Entregável: fluxo montado na tela muda os resultados. **Parada P3:** montar o fluxo do robô e confirmar que bate, e que mudar o fluxo muda os números de forma coerente.

**Fase 5 — Resultados.** Dashboard de indicadores e gráficos, com o gargalo em destaque, status de ocupação (ok, atenção, acima do limite) e eficiência total. Entregável: resultado completo e legível. **Parada P4:** caso do robô de ponta a ponta contra a planilha.

**Fase 6 — Camada institucional e onboarding.** Aplicar a identidade da UTFPR, montar o tour guiado passo a passo nas telas e o guia básico. Entregável: sistema com cara institucional e primeira experiência guiada.

**Fase 7 — Validação final e deploy.** Rodar o robô e também o trem (o próximo produto) para provar que o sistema generaliza, e publicar a versão na web. Entregável: link pronto para o professor abrir e mostrar.

**Fase 8 — Vídeo explicativo.** Roteiro e narração (com as skills de vídeo e voz) navegando pelas telas, para servir de apresentação. Entregável: vídeo curto do sistema em uso.

## Paradas de teste

Os testes são paradas específicas do cronograma, não um teste só no fim. Em cada uma, a gente compara com a planilha antes de seguir.

| Parada | Depois da fase | O que testa | Contra o quê |
| --- | --- | --- | --- |
| P1 | Motor de cálculo | tempo de ciclo, takt, ocupação, gargalo, estoque | números da planilha do robô |
| P2 | Entradas | o que a tela grava alimenta o motor certo | mesmos números, agora via interface |
| P3 | Construtor de sequência | o fluxo dirige o cálculo; mudar o fluxo muda o resultado | planilha do robô + coerência lógica |
| P4 | Resultados | caso do robô de ponta a ponta | planilha do robô completa |
| Final | Validação e deploy | robô e trem, para provar que generaliza | planilhas dos dois produtos |

Como a planilha do robô é a referência, cada parada é objetiva: entra o mesmo cenário, os números têm que bater. Onde não bater, a gente investiga (pode ser falha da planilha antiga, já mapeada nas divergências D1 a D9, ou erro nosso).

## Camada institucional, tour e vídeo

Três coisas que fazem o sistema parecer profissional e serem fáceis de mostrar:

**Identidade institucional.** Logo e SVG da UTFPR e do curso de Engenharia de Produção, fotos de capa, cores clean, fonte Outfit. Uma tela inicial institucional, para quando o professor abrir e apresentar a outras pessoas.

**Tour guiado e guia básico.** Um passo a passo que roda na primeira vez, apontando cada tela e o que fazer (preencher o cenário, cadastrar atividades, montar a sequência, ler os resultados). Mais um guia básico sempre acessível, curto e objetivo.

**Vídeo explicativo.** No fim, um vídeo curto navegando pelas telas, com narração (usando suas skills de vídeo e voz). Serve de apresentação do sistema e de material para o professor divulgar. Entra como a última fase, quando as telas já estão prontas.

## O que preciso de você para começar

Para disparar a Fase 0:

1. **Confirmar a stack** (React + TypeScript + Vite + Tailwind + React Flow + Vercel), ou dizer se prefere outra coisa.
2. **Liberar o acesso à pasta** assim que o Claude Code criar o projeto, para eu acompanhar o código.
3. **Reunir os assets institucionais** quando puder: logo e SVG da UTFPR e do curso, fotos de capa. Não trava o início; entram na Fase 1.

Poucas dúvidas que ainda valem decidir no caminho (nenhuma trava o começo):

- **Salvar cenários:** no v1, o cenário vive na tela (sem login). Faz sentido, ou você já quer poder salvar e reabrir cenários? Isso puxaria um backend mais cedo.
- **Nome do sistema:** tem um nome em mente, ou começamos com um provisório?
- **Inspeção aleatòria:** a planilha sorteia a aprovação na inspeção. No sistema, deixamos determinístico ou mantemos como simulação de propósito?

Assim que confirmar a stack, eu escrevo o primeiro prompt para o Claude Code criar o esqueleto do projeto.
