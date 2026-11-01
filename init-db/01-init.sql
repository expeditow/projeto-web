-- =========================================================
-- USUÁRIOS
-- =========================================================
CREATE TABLE usuarios (
    id        UUID PRIMARY KEY,
    nome      TEXT NOT NULL,
    email     TEXT NOT NULL UNIQUE,
    senha     TEXT NOT NULL,                 -- guardar HASH (bcrypt/argon2), nunca a senha pura
    foto_url  TEXT,
    bio       VARCHAR(255),
    criado_em TIMESTAMP NOT NULL DEFAULT now()
);

-- Segue (N:N auto-relacionamento)
CREATE TABLE seguidores (
    seguidor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    seguido_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    criado_em   TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (seguidor_id, seguido_id),
    CHECK (seguidor_id <> seguido_id)        -- Claude que recomendou: ninguém segue a si mesmo
);

-- =========================================================
-- VÍDEO  (Publica: 1 usuário -> N vídeos)
-- =========================================================
CREATE TABLE video (
    id                UUID PRIMARY KEY DEFAULT,
    usuario_id        UUID NOT NULL REFERENCES usuarios(id),
    youtube_id        VARCHAR(11) NOT NULL,  -- ID do YouTube tem 11 caracteres (ex: dQw4w9WgXcQ)
    titulo            VARCHAR(100) NOT NULL, -- YouTube permite até 100
    thumbnail_url     TEXT,                  -- ver depois
    duracao_segundos  INT,                   -- realmente necessário?
    categoria_youtube TEXT                   -- categoria youtube?
);
-- =========================================================
-- LISTAS  (Cria: 1 usuário -> N listas | Contém: N listas <-> N vídeos)
-- =========================================================
CREATE TABLE listas (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo     VARCHAR(100) NOT NULL,
    descricao  TEXT,
    criada_em  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE lista_video (
    lista_id UUID NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES video(id)  ON DELETE CASCADE,
    ordem    INT  NOT NULL CHECK (ordem > 0),
    PRIMARY KEY (lista_id, video_id),        -- mesmo vídeo não entra 2x na mesma lista
    -- DEFERRABLE permite reordenar (trocar posições) dentro de uma transação
    UNIQUE (lista_id, ordem) DEFERRABLE INITIALLY DEFERRED
);
-- =========================================================
-- INTERAGE (N:N usuário <-> vídeo)
-- Sempre que o usuário interagir com um vídeo, nós atualizamos o registro!
-- =========================================================
CREATE TABLE interacao (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    video_id   UUID NOT NULL REFERENCES video(id)    ON DELETE CASCADE,
    curtiu     BOOLEAN,
    momento    TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (usuario_id, video_id)
);

-- =========================================================
-- FAVORITA (N:N usuário <-> vídeo, com posição)
-- =========================================================
CREATE TABLE favorita (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    video_id   UUID NOT NULL REFERENCES video(id)    ON DELETE CASCADE,
    posicao    INT  NOT NULL CHECK (posicao > 0),
    PRIMARY KEY (usuario_id, video_id),
    UNIQUE (usuario_id, posicao) DEFERRABLE INITIALLY DEFERRED
);

-- =========================================================
-- TAGS (Possui: N vídeos <-> N tags)
-- =========================================================
CREATE TABLE tags (
    id   SERIAL PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE
);

CREATE TABLE video_tag (
    video_id UUID NOT NULL REFERENCES video(id) ON DELETE CASCADE,
    tag_id   INT  NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);
-- =========================================================
-- REGISTRO (usuário 1:N registros | vídeo 1:N registros)
-- Registro de que o usuário consumiu o vídeo.
-- Quando "texto" é preenchido, o registro passa a ser uma REVIEW.
-- =========================================================
CREATE TABLE registro (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id     UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    video_id       UUID NOT NULL REFERENCES video(id)    ON DELETE CASCADE,
    data_assistido TIMESTAMP,
    -- 0.5 a 5.0 em passos de 0.5. VALIDAR COM O EDUARDO
    nota           TEXT,
    texto          TEXT, -- NULL = só registro; preenchido = review
    criado_em      TIMESTAMP NOT NULL DEFAULT now()
);
-- =========================================================
-- COMENTÁRIOS (usuário 1:N comentários | review 1:N comentários)
-- Review = registro com texto. Comentar só faz sentido nesses registros
-- (garantir na aplicação que registro.texto IS NOT NULL).
-- =========================================================
CREATE TABLE comentarios (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    registro_id UUID NOT NULL REFERENCES registro(id) ON DELETE CASCADE,
    texto      TEXT NOT NULL,
    criado_em  TIMESTAMP NOT NULL DEFAULT now()
);
-- =========================================================
-- CURTE (N:N usuário <-> review/registro)
-- =========================================================
CREATE TABLE curtida_registro (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    registro_id UUID NOT NULL REFERENCES registro(id) ON DELETE CASCADE,
    criado_em  TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (usuario_id, registro_id)
);