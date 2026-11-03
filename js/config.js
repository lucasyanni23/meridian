/* =====================================================================
   CONFIGURAÇÃO DO SITE

   Enquanto "firebase" estiver como null, o site roda em MODO DEMONSTRAÇÃO:
   login, reservas e fichas funcionam, mas ficam salvos só no navegador
   de quem está usando. Para valer de verdade (todo mundo vendo as mesmas
   reservas), cole aqui a configuração do seu projeto Firebase.
   O passo a passo está no LEIA-ME.md.
   ===================================================================== */

window.MV_CONFIG = {
  // Cole aqui o objeto firebaseConfig do console do Firebase, por exemplo:
  // firebase: {
  //   apiKey: "AIza...",
  //   authDomain: "meridian-vice-coast.firebaseapp.com",
  //   projectId: "meridian-vice-coast",
  //   storageBucket: "meridian-vice-coast.firebasestorage.app",
  //   messagingSenderId: "1234567890",
  //   appId: "1:1234567890:web:abc123"
  // },
  firebase: null,

  // E-mail(s) do mestre. Quem entrar com um destes e-mails vê o painel do mestre.
  // Use o MESMO e-mail em firestore.rules (função isAdmin).
  admins: ["seu-email@gmail.com"]
};
