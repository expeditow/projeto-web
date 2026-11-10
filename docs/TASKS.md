# Backlog do ytboxd

Fonte: `PROJETO-WEB.xlsx` (planilha do grupo, abas Backlog, Premissas e Dependências). **Este arquivo é a cópia dentro do repositório**, para o Claude Code e o grupo consultarem. Ao concluir uma task, atualize a coluna Status aqui **e** na planilha.

Tamanhos: P = 1,5 dia-pessoa · M = 4 · P/M = 2,75. Sprint = 2 semanas = 10 dias úteis por dev.

| ID | Sprint | Fase | Feature | Tam. | Depende de | Status | Observação |
|---|---|---|---|---|---|---|---|
| T01 | 0 | Fundação | Repositório, stack, CI e migrations base | P |  | Em andamento | Esteira de CI: build, lint e testes a cada push |
| T02 | 0 | Fundação | Padrão de API (erros, paginação, validação) | M |  | A fazer | Contrato compartilhado entre os dois |
| T03 | 0 | Fundação | Layout base do front | M |  | A fazer | Roteador e layout são arquivos compartilhados |
| T04 | 0 | Fundação | Cliente da YouTube API isolado, com cache | P |  | A fazer | Facilita mock e economiza cota |
| T05 | 1 | Fase 1 | Cadastro e login | P | Sprint 0 | Concluído | Entregar nos 2 primeiros dias; cria campo `papel` |
| T06 | 1 | Fase 1 | Painel admin: Listar Usuários (BO) | P | Cadastro e login | Concluído | Fora do roadmap original; exige papel admin e paginação |
| T07 | 1 | Fase 1 | Painel admin: Listar Vídeos (BO) | P | Enviar vídeo | Concluído | Fora do roadmap original; mostra quem publicou |
| T08 | 1 | Fase 1 | Detalhar vídeo (player embed + metadados) | M | Enviar vídeo | Concluído | Nota média, reviews e tags entram como placeholders |
| T09 | 1 | Fase 1 | Enviar vídeo (URL/ID + metadado via API) | M | Cliente YouTube API; Cadastro e login | Concluído | Usa usuário fixo até o login ficar pronto; seed de 5–10 vídeos no dia 1 |
| T10 | 1 | Fase 1 | Buscar vídeos (busca local por título) | M | Enviar vídeo | Concluído | Só banco local; busca de canal fica para o Sprint 2 |
| T11 | 2 | Fase 1 | Marcar como assistido | P | Detalhar vídeo | A fazer | Cria Registro com data_assistido |
| T12 | 2 | Fase 1 | Watchlist: adicionar/remover | P | Detalhar vídeo | A fazer | Decidir antes: `status` no Registro ou tabela própria |
| T13 | 2 | Fase 1 | Review: criar/editar/deletar | M | Marcar como assistido | A fazer | Vinculada ao Registro, com nota e texto |
| T14 | 2 | Fase 1 | Perfil: editar e visualizar | P | Cadastro e login | A fazer | Foto, bio e listagens básicas |
| T15 | 2 | Fase 1 | Seguir/deixar de seguir + listar seguidores/seguindo | P | Cadastro e login | A fazer | Destrava o filtro 'amigos' do Sprint 3 |
| T16 | 2 | Fase 1 | Busca de canal | M | Entidade Canal | A fazer | Exige a entidade Canal no schema |
| T17 | 3 | Fase 1 | Visualizar reviews + nota média + filtro amigos/todos | P | Review CRUD; Seguir | A fazer | Filtro depende do Seguir (Dev B, Sprint 2) |
| T18 | 3 | Fase 2 | Curtir review | P | Review CRUD | A fazer |  |
| T19 | 3 | Fase 1 | Feed de atividade de quem sigo | M | Seguir; Marcar assistido; Review | A fazer | Cronológico: assistidos, reviews e listas |
| T20 | 4 | Hardening | Testes de ponta a ponta + tratamento de cota da API | M | Fase 1 completa | A fazer | Fechamento do MVP |
| T21 | 4 | Fase 2 | Rewatch (contagem por usuário-vídeo) | P | Marcar como assistido | A fazer | Sem unicidade usuário+vídeo no Registro |
| T22 | 4 | Fase 2 | Retomar de onde parou | P | Detalhar vídeo | A fazer | Adicionar `posicao_segundos` |
| T23 | 4 | Hardening | Polimento do front + performance do feed | M | Feed de atividade | A fazer | Fechamento do MVP |
| T24 | 4 | Fase 2 | Categoria oficial do YouTube | P | Enviar vídeo | A fazer | Campo já vem no metadado |
| T25 | 4 | Fase 2 | Playlist: exibir e navegar | P | Detalhar vídeo | A fazer |  |
| T26 | 5 | Fase 2 | Progresso automático de 'assistido' (IFrame API) | M | Marcar como assistido | A fazer |  |
| T27 | 5 | Fase 2 | Tags livres + listar vídeos por tag | P/M | Detalhar vídeo | A fazer | Estimativa na faixa P a M |
| T28 | 6 | Fase 2 | Comentar em review | M | Review CRUD | A fazer | Entidade Comentário |
| T29 | 6 | Fase 2 | Listas customizadas (CRUD + visualizar/curtir/seguir) | M | Perfil; Seguir | A fazer |  |
| T30 | 7 | Fase 2 | Timestamps ancorados na review | M | Review CRUD | A fazer | Adicionar `timestamp_video` ou tabela de trechos |
| T31 | 7 | Fase 2 | Canal: favoritar + página do canal | M | Entidade Canal; Busca de canal | A fazer |  |
| T32 | 8 | Release | Testes finais, performance e release | M | Todas | A fazer | Fecha o projeto |
| T33 | 8 | Fase 2 | Ranking por tag/categoria | M | Tags livres; Categoria oficial; Reviews | A fazer | Nota média agregada |

## Dependências entre os dois devs

| Quando | Quem espera quem | Como destravar |
|---|---|---|
| Sprint 1 | Dev A (Detalhar, BO de vídeos) depende de Dev B (Enviar vídeo) | Dev B cria um script de seed com 5 a 10 vídeos no primeiro dia; Dev A trabalha em cima disso. |
| Sprint 1 | Dev B (Enviar) precisa do usuário logado para o campo Publica | Dev A entrega o login nos 2 primeiros dias; até lá, Dev B usa um usuário fixo. |
| Sprint 3 | Dev A (filtro 'amigos') depende de Dev B (Seguir, Sprint 2) | A ordem dos sprints já resolve. |
| Sprint 8 | Dev B (Ranking) depende de Tags, Categoria e Reviews | As três já estarão prontas. |

> A planilha chama os devs de Dev A e Dev B. Quem é quem **ainda não está registrado aqui** — confirmar com o grupo.

## O que o banco já cobre (conferência task × modelo)

O banco já foi criado (ver `database/migrations/`). Isto liga as tasks ao que existe, e aponta divergências com a planilha:

- **T05 Cadastro e login:** o starter do Adonis já traz cadastro/login/logout por sessão; `users.papel` (usuario|admin) já existe.
- **T12 Watchlist:** decisão tomada — **tabela própria** `watchlist` (não `status` no Registro).
- **T16 / T31 Canal:** a entidade existe (`canais`, com `videos.canal_id`). Falta só a lógica de busca e de favoritar canal (favoritar canal **não** tem tabela ainda).
- **T11 / T13 / T21:** `registros` (nota 1–5 opcional, sem unique user+vídeo → rewatch) e `reviews` (0..1 por registro) já existem.
- **T15 Seguir:** `seguidores` existe (amizade = follow mútuo, regra de negócio).
- **T18 / T28:** `curtidas_review` e `comentarios` (só em reviews) existem.
- **T22 Retomar de onde parou:** a planilha diz "adicionar `posicao_segundos`", mas o banco já tem `interacoes.momento_segundos` (user×vídeo). **Divergência:** usar esse campo, ou mover — decidir antes de implementar.
- **T24 Categoria oficial:** `videos.categoria_youtube` já existe.
- **T27 Tags / T33 Ranking:** `tags` e `video_tag` existem; falta definir quem cria/atribui a tag.
- **T29 Listas:** `listas` e `lista_video` (com `ordem`) existem; curtir/seguir lista **não** tem tabela ainda.
- **T25 Playlist:** **não modelada** (ficou de fora de propósito).
- **T30 Timestamps na review:** **não modelado** (a planilha prevê `timestamp_video` ou tabela de trechos).
- **Favoritos do perfil (máx. 5):** `favoritos` existe, mas não há task própria na planilha — acrescentar uma.
