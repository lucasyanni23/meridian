# Meridian: Vice Coast

Site do RP textual Meridian: Vice Coast (Miami, 2026), publicado pelo GitHub Pages.

## Como editar

- **Textos, facções, vagas, locais e regras:** abra `js/data.js`, clique no lápis (Edit), altere e clique em **Commit changes**. O site atualiza sozinho em cerca de 1 minuto.
- **Imagens:** envie o arquivo para a pasta `img/` (Add file → Upload files) e preencha o campo `img` correspondente em `js/data.js`, por exemplo `img: "img/torre-meridian.jpg"`.

## Login e reservas

Enquanto `firebase` estiver como `null` em `js/config.js`, o site roda em modo demonstração (dados salvos só no navegador de cada pessoa). Com a configuração do Firebase preenchida, login, reservas e fichas passam a valer para todo mundo. O e-mail do mestre fica só nas regras do Firestore, no console do Firebase.
