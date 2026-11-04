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

  // O e-mail do mestre fica SÓ nas regras do Firestore (firestore.rules, função isAdmin),
  // para não aparecer no código público do site. Esta lista vale só para o modo demonstração.
  admins: []
};
