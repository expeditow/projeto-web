# projeto-web — ytboxd

Letterboxd para vídeos do YouTube. AdonisJS 7 + TypeScript + Lucid + Postgres (telas com Edge + Alpine + Vite).

## Subir o ambiente

Requisitos: **Node ≥ 24**, Docker e Git.

```bash
docker compose up -d          # sobe SÓ o Postgres vazio (db/user/senha: ytboxd)
cp .env.example .env
npm install
node ace generate:key         # preenche APP_KEY no .env
node ace migration:run        # cria todas as tabelas
npm run dev
```

## O banco é versionado por migrations (não por .sql)

O Docker só entrega um Postgres **vazio**. Quem cria as tabelas são as migrations em
`database/migrations/`, que funcionam como o Git do banco:

| Comando | O que faz |
|---|---|
| `node ace migration:status` | mostra o que já foi aplicado |
| `node ace migration:run` | aplica as pendentes |
| `node ace migration:rollback` | desfaz o último lote |
| `node ace migration:rollback --batch=0` | desfaz tudo |
| `node ace migration:fresh` | apaga tudo e roda de novo (só em dev!) |

**Regra do time:** nunca edite uma migration que já foi para o `main`. Mudou o modelo? Crie
uma migration nova (`node ace make:migration add_x_to_y`).

Depois de `migration:run`, o Lucid regenera `database/schema.ts` (classes com as colunas).
**Não edite esse arquivo** — as relações ficam em `app/models/*.ts`, que estendem essas classes.

## Modelo (resumo do ER)

| Tabela | Papel |
|---|---|
| `users` | usuário (`papel`: usuario \| admin) |
| `canais` | canal do YouTube |
| `videos` | vídeo (`youtube_id` único), pertence a um canal e a quem publicou |
| `tags` / `video_tag` | tags (N:N com vídeo) |
| `registros` | "assisti": user + vídeo + nota 1–5 opcional. **Sem unique(user, video)** → rewatch |
| `reviews` | texto opcional de um registro (1 registro → 0..1 review) |
| `comentarios` | comentários **em reviews** (não em vídeos) |
| `curtidas_review` | curtida simples em review |
| `seguidores` | user segue user (amizade = follow mútuo, regra de negócio) |
| `interacoes` | user × vídeo: `curtiu` + `momento_segundos` (retomar de onde parou) |
| `favoritos` | vitrine do perfil, máx. 5 (`posicao` 1–5 + unique) |
| `watchlist` | assistir depois |
| `listas` / `lista_video` | listas do usuário, com `ordem` |

Constraints no banco: nota entre 1 e 5, favoritos de 1 a 5 sem repetir posição/vídeo,
ninguém segue a si mesmo, no máximo 1 review por registro, `ON DELETE CASCADE` nos dependentes.

## Testes e CI

```bash
node ace test           # smoke test das relações dos models (roda em transação, não suja o banco)
npm run lint && npm run typecheck
```

Os testes usam o banco do `.env` e precisam das migrations aplicadas. O CI
(`.github/workflows/ci.yml`) sobe um Postgres, roda lint, typecheck, build, migrations e testes.

## Plurais em português

`start/inflector.ts` ensina o Adonis a pluralizar `canal→canais`, `interacao→interacoes`,
`seguidor→seguidores`. Sem isso ele gera nomes de classe como `CanaiSchema`.
Tabela nova com plural irregular? Adicione a regra lá **antes** de gerar o schema.
