Lê ai

# Subir o banco localmente

Para subir o banco é bem simples, basta dar um docker compose up -d

Para testar, eu usei:

docker compose exec db psql -U dev -d meu_banco

    - Ele executa um comando: entrar no modo PSQL no banco especificado no próprio cmoando  -U dev - conecta no usuário de dev -  e -d meu_banco ao banco em sino compose.yaml
    - No modo psql excutei: SELECT * FROM USUARIOS;
    - Pronto

A partir disso, subimos o que está no compose.yaml que consome os arquivos do init-db - Vou ver uma forma melhor, talvez implementar de vez o seed direto no arquivo, sla dps eu vejo isso prora

Ver como poderíamos generalizar, mas provavelmente vai ser: criar "categoria" dev e prod - onde prod nós subimos localmente perfeitinho com dado mockado e em prod não pode ficar modificando para não perder dado.

to vendo ainda, mas é meio chatinho e me rendi pro Claude

O volume é uma memória que adicionamos pro container, como ele é efêmero ele perderia se nós derrubássemos. Portanto, quando derrubar o docker, usa o docker compose down -v, para limpar os volumes, assim numa próxima execução ele vem zerado