/* =====================================================================
   BACKEND — login, reservas e fichas
   Usa o Firebase quando MV_CONFIG.firebase está preenchido.
   Sem Firebase, roda em modo demonstração (dados só neste navegador).
   Normalmente você não precisa editar este arquivo.
   ===================================================================== */

(function () {
  const CFG = window.MV_CONFIG || {};
  const ADMINS = (CFG.admins || []).map(e => String(e).trim().toLowerCase());
  const FB_VERSION = "10.12.2";

  const subs = { auth: new Set(), data: new Set() };
  let user = null;
  let data = emptyData();

  function emptyData() {
    return { vagas: {}, reservas: {}, config: {}, privado: null, perfis: {}, segredos: {} };
  }
  function emitAuth() { subs.auth.forEach(fn => { try { fn(user); } catch (e) { console.error(e); } }); }
  function emitData() { subs.data.forEach(fn => { try { fn(data); } catch (e) { console.error(e); } }); }
  function fail(msg) { const e = new Error(msg); e.friendly = true; throw e; }
  function cleanNick(n) { return String(n || "").trim().slice(0, 40); }
  function cleanText(t, max) { return String(t == null ? "" : t).slice(0, max || 6000); }
  function cleanFicha(f) {
    const out = {};
    Object.keys(f || {}).forEach(k => { out[k] = cleanText(f[k], 6000); });
    return out;
  }

  const api = {
    mode: CFG.firebase ? "firebase" : "demo",
    ready: null,
    get user() { return user; },
    get data() { return data; },
    onAuth(fn) { subs.auth.add(fn); fn(user); return () => subs.auth.delete(fn); },
    onData(fn) { subs.data.add(fn); fn(data); return () => subs.data.delete(fn); },
    isAdminEmail(email) { return ADMINS.includes(String(email || "").toLowerCase()); }
  };

  /* -------------------------------------------------------------------
     MODO DEMONSTRAÇÃO
     ------------------------------------------------------------------- */
  function demoImpl() {
    const KEY = "mv-demo-v1";
    const SKEY = "mv-demo-session";
    let mem = null;
    let session = null;
    const H = 3600 * 1000;

    function seed() {
      const now = Date.now();
      return {
        users: {
          "mestre@demo.vc": { uid: "u-mestre", pass: "demo123", nick: "Mestre", contato: "" },
          "jogador@demo.vc": { uid: "u-jogador", pass: "demo123", nick: "Jogador demo", contato: "" },
          "nina@exemplo.vc": { uid: "u-nina", pass: "x", nick: "Nina (exemplo)", contato: "@nina" },
          "theo@exemplo.vc": { uid: "u-theo", pass: "x", nick: "Theo (exemplo)", contato: "@theo" },
          "bruno@exemplo.vc": { uid: "u-bruno", pass: "x", nick: "Bruno (exemplo)", contato: "@bruno" },
          "ju@exemplo.vc": { uid: "u-ju", pass: "x", nick: "Ju (exemplo)", contato: "@ju" }
        },
        vagas: {
          "castillo-3": { uid: "u-nina" },
          "navarro-1": { uid: "u-theo" },
          "forca-1": { uid: "u-bruno" },
          "huesos-3": { uid: "u-ju" }
        },
        reservas: {
          "u-nina": {
            slotId: "castillo-3", status: "aprovada", jogador: "Nina (exemplo)", criadoEm: now - 80 * H, atualizadoEm: now - 50 * H,
            notaMestre: "",
            ficha: {
              nome: "Valentina Castillo", idade: "26", faceclaim: "Exemplo de faceclaim", imagem: "",
              ocupacao: "Herdeira, socialite e dor de cabeça oficial da família",
              aparencia: "Cabelos pretos sempre bagunçados de propósito, olhos cor de mel e um sorriso que aparece mais nas colunas sociais do que nos jantares de família.",
              personalidade: "Impulsiva, carismática e mais esperta do que deixa parecer. Usa o escândalo como escudo.",
              historia: "Valentina cresceu entre babás e seguranças em Star Island. Aos dezenove anos encontrou, no escritório do pai, uma pasta que não deveria existir. Desde então finge não se importar com os negócios, mas guarda cópias de tudo.",
              ganchos: "Rivalidade aberta com Julian. Frequentadora assídua da Neon Mirage."
            }
          },
          "u-theo": {
            slotId: "navarro-1", status: "ficha_enviada", jogador: "Theo (exemplo)", criadoEm: now - 30 * H, atualizadoEm: now - 4 * H,
            notaMestre: "",
            ficha: {
              nome: "Dante Navarro", idade: "38", faceclaim: "Exemplo de faceclaim", imagem: "",
              ocupacao: "CEO do Grupo Navarro",
              aparencia: "Ternos claros, relógio caro e barba sempre aparada.",
              personalidade: "Charmoso em público, implacável em particular.",
              historia: "Herdou um clube falido em Ocean Drive e o transformou no maior grupo de entretenimento da Flórida.",
              ganchos: "Quer o porto. Já tentou comprar Arthur Sterling."
            }
          },
          "u-bruno": {
            slotId: "forca-1", status: "reservada", jogador: "Bruno (exemplo)", criadoEm: now - 20 * H, notaMestre: "", ficha: {}
          },
          "u-ju": {
            slotId: "huesos-3", status: "recusada", jogador: "Ju (exemplo)", criadoEm: now - 60 * H, atualizadoEm: now - 26 * H,
            notaMestre: "Ótima ideia! Detalhe melhor a ligação da Esmeralda com o porto e revise a idade.",
            ficha: { nome: "Esmeralda Soto", idade: "17", faceclaim: "Exemplo", historia: "Rascunho da história." }
          }
        },
        perfis: {},
        segredos: { "u-nina": "Tem cópias dos extratos das contas offshore do pai num pen drive escondido." },
        config: {
          geral: { aviso: "Inscrições abertas! Reserve uma vaga e envie sua ficha em até 72 horas. A primeira cena começa quando metade do elenco estiver aprovado.", inscricoesAbertas: true },
          privado: { linkGrupo: "https://chat.whatsapp.com/exemplo-on", linkOff: "https://chat.whatsapp.com/exemplo-off" }
        }
      };
    }

    function load() {
      try {
        const raw = localStorage.getItem(KEY);
        mem = raw ? JSON.parse(raw) : seed();
      } catch (e) { mem = mem || seed(); }
      try { session = localStorage.getItem(SKEY) || null; } catch (e) { session = session || null; }
    }
    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* armazenamento indisponível: segue em memória */ }
      try { session ? localStorage.setItem(SKEY, session) : localStorage.removeItem(SKEY); } catch (e) {}
    }
    function userByUid(uid) {
      const email = Object.keys(mem.users).find(k => mem.users[k].uid === uid);
      return email ? { email, ...mem.users[email] } : null;
    }
    function isAdminU(u) { return !!u && (u.email === "mestre@demo.vc" || api.isAdminEmail(u.email)); }
    function rebuild() {
      const u = session ? userByUid(session) : null;
      user = u ? { uid: u.uid, email: u.email, nick: u.nick, contato: u.contato || "", isAdmin: isAdminU(u) } : null;
      const d = emptyData();
      d.vagas = JSON.parse(JSON.stringify(mem.vagas));
      d.reservas = JSON.parse(JSON.stringify(mem.reservas));
      d.config = { ...(mem.config.geral || {}) };
      if (user) {
        const mine = mem.reservas[user.uid];
        if (user.isAdmin || (mine && mine.status === "aprovada")) d.privado = { ...(mem.config.privado || {}) };
        if (user.isAdmin) {
          Object.keys(mem.users).forEach(email => {
            const x = mem.users[email];
            d.perfis[x.uid] = { nick: x.nick, contato: x.contato || "", email };
          });
          d.segredos = { ...mem.segredos };
        } else {
          d.perfis[user.uid] = { nick: user.nick, contato: user.contato };
          if (mem.segredos[user.uid]) d.segredos[user.uid] = mem.segredos[user.uid];
        }
      }
      data = d;
    }
    function commit() { save(); rebuild(); emitAuth(); emitData(); }
    const wait = (ms) => new Promise(r => setTimeout(r, ms || 180));
    function requireUser() { if (!user) fail("Entre na sua conta primeiro."); }
    function requireAdmin() { requireUser(); if (!user.isAdmin) fail("Só o mestre pode fazer isso."); }

    Object.assign(api, {
      async signUp(email, pass, nick, contato) {
        await wait();
        email = String(email || "").trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail("Digite um e-mail válido.");
        if (String(pass || "").length < 6) fail("A senha precisa ter pelo menos 6 caracteres.");
        if (!cleanNick(nick)) fail("Escolha um nome de jogador.");
        if (mem.users[email]) fail("Já existe uma conta com esse e-mail. Use Entrar.");
        const uid = "u-" + Math.random().toString(36).slice(2, 10);
        mem.users[email] = { uid, pass, nick: cleanNick(nick), contato: cleanText(contato, 80) };
        session = uid; commit();
      },
      async signIn(email, pass) {
        await wait();
        email = String(email || "").trim().toLowerCase();
        const u = mem.users[email];
        if (!u || u.pass !== pass) fail("E-mail ou senha incorretos.");
        session = u.uid; commit();
      },
      async demoLogin(kind) {
        await wait(60);
        const email = kind === "mestre" ? "mestre@demo.vc" : "jogador@demo.vc";
        session = mem.users[email].uid; commit();
      },
      async signOut() { session = null; commit(); },
      async resetPassword() { await wait(); fail("No modo demonstração não há e-mail de recuperação. As contas de teste usam a senha demo123."); },
      async updateProfile({ nick, contato }) {
        requireUser(); await wait();
        if (!cleanNick(nick)) fail("Escolha um nome de jogador.");
        const u = mem.users[user.email];
        u.nick = cleanNick(nick); u.contato = cleanText(contato, 80);
        if (mem.reservas[user.uid]) mem.reservas[user.uid].jogador = u.nick;
        commit();
      },
      async reserve(slotId) {
        requireUser(); await wait();
        if (mem.config.geral && mem.config.geral.inscricoesAbertas === false) fail("As inscrições estão fechadas no momento.");
        if (mem.reservas[user.uid]) fail("Você já tem uma vaga reservada. Cancele a atual para trocar.");
        if (mem.vagas[slotId]) fail("Essa vaga acabou de ser reservada por outra pessoa.");
        mem.vagas[slotId] = { uid: user.uid };
        mem.reservas[user.uid] = { slotId, status: "reservada", jogador: user.nick, criadoEm: Date.now(), ficha: {}, notaMestre: "" };
        commit();
      },
      async cancel() {
        requireUser(); await wait();
        const r = mem.reservas[user.uid];
        if (!r) return;
        if (mem.vagas[r.slotId] && mem.vagas[r.slotId].uid === user.uid) delete mem.vagas[r.slotId];
        delete mem.reservas[user.uid];
        commit();
      },
      async saveFicha(ficha, enviar, segredo) {
        requireUser(); await wait();
        const r = mem.reservas[user.uid];
        if (!r) fail("Você não tem uma vaga reservada.");
        if (r.status === "aprovada") fail("Sua ficha já foi aprovada. Fale com o mestre para alterar.");
        r.ficha = cleanFicha(ficha);
        if (enviar) r.status = "ficha_enviada";
        r.atualizadoEm = Date.now();
        mem.segredos[user.uid] = cleanText(segredo, 5000);
        commit();
      },
      admin: {
        async setStatus(uid, status, nota) {
          requireAdmin(); await wait();
          const r = mem.reservas[uid];
          if (!r) fail("Reserva não encontrada.");
          r.status = status; r.notaMestre = cleanText(nota, 2000); r.atualizadoEm = Date.now();
          commit();
        },
        async release(uid) {
          requireAdmin(); await wait();
          const r = mem.reservas[uid];
          if (!r) return;
          if (mem.vagas[r.slotId] && mem.vagas[r.slotId].uid === uid) delete mem.vagas[r.slotId];
          delete mem.reservas[uid];
          commit();
        },
        async saveConfig(cfg) {
          requireAdmin(); await wait();
          mem.config.geral = { aviso: cleanText(cfg.aviso, 2000), inscricoesAbertas: !!cfg.inscricoesAbertas };
          commit();
        },
        async savePrivate(p) {
          requireAdmin(); await wait();
          mem.config.privado = { linkGrupo: cleanText(p.linkGrupo, 500), linkOff: cleanText(p.linkOff, 500) };
          commit();
        }
      },
      async resetDemo() { mem = seed(); session = null; commit(); }
    });

    load(); rebuild();
    api.ready = Promise.resolve();
  }

  /* -------------------------------------------------------------------
     FIREBASE
     ------------------------------------------------------------------- */
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error("Falha ao carregar " + src));
      document.head.appendChild(s);
    });
  }

  function fbMessage(e) {
    const code = (e && e.code) || "";
    const map = {
      "auth/invalid-email": "Digite um e-mail válido.",
      "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Use Entrar.",
      "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
      "auth/invalid-credential": "E-mail ou senha incorretos.",
      "auth/wrong-password": "E-mail ou senha incorretos.",
      "auth/user-not-found": "Não encontramos uma conta com esse e-mail.",
      "auth/too-many-requests": "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
      "auth/network-request-failed": "Sem conexão. Verifique sua internet e tente de novo.",
      "permission-denied": "Ação não permitida. Atualize a página e tente de novo.",
      "unavailable": "Sem conexão com o servidor. Tente de novo em instantes."
    };
    return map[code] || (e && e.friendly ? e.message : "Algo deu errado. Tente de novo.");
  }

  function firebaseImpl() {
    let fb, auth, db, ts;
    let userSubs = [];
    let privSub = null;
    let lastMyStatus = null;
    const raw = { vagas: {}, reservas: {}, config: {}, privado: null, perfis: {}, segredos: {} };

    const toMs = v => (v && typeof v.toMillis === "function") ? v.toMillis() : (typeof v === "number" ? v : null);
    function publish() {
      data = {
        vagas: raw.vagas, reservas: raw.reservas, config: raw.config,
        privado: raw.privado, perfis: raw.perfis, segredos: raw.segredos
      };
      emitData();
    }
    function wrap(fn) {
      return async (...args) => {
        try { return await fn(...args); }
        catch (e) { console.error(e); fail(fbMessage(e)); }
      };
    }
    function requireUser() { if (!user) fail("Entre na sua conta primeiro."); }
    function requireAdmin() { requireUser(); if (!user.isAdmin) fail("Só o mestre pode fazer isso."); }

    function subscribePrivado() {
      if (privSub) { privSub(); privSub = null; }
      raw.privado = null;
      if (!user) return;
      privSub = db.doc("config/privado").onSnapshot(
        s => { raw.privado = s.exists ? s.data() : {}; publish(); },
        () => { raw.privado = null; publish(); }
      );
    }

    function subscribeUser(u) {
      userSubs.forEach(x => x()); userSubs = [];
      raw.perfis = {}; raw.segredos = {};
      if (!u) { if (privSub) { privSub(); privSub = null; } raw.privado = null; publish(); return; }
      if (user.isAdmin) {
        userSubs.push(db.collection("perfis").onSnapshot(q => {
          const p = {}; q.forEach(d => { p[d.id] = d.data(); }); raw.perfis = p;
          if (p[u.uid]) { user = { ...user, nick: p[u.uid].nick || user.nick, contato: p[u.uid].contato || "" }; emitAuth(); }
          publish();
        }, e => console.error(e)));
        userSubs.push(db.collection("segredos").onSnapshot(q => {
          const s = {}; q.forEach(d => { s[d.id] = (d.data() || {}).texto || ""; }); raw.segredos = s; publish();
        }, e => console.error(e)));
      } else {
        userSubs.push(db.doc("perfis/" + u.uid).onSnapshot(s => {
          const p = s.exists ? s.data() : {};
          raw.perfis = { [u.uid]: p };
          user = { ...user, nick: p.nick || user.nick, contato: p.contato || "" };
          emitAuth(); publish();
        }, e => console.error(e)));
        userSubs.push(db.doc("segredos/" + u.uid).onSnapshot(s => {
          raw.segredos = s.exists ? { [u.uid]: (s.data() || {}).texto || "" } : {}; publish();
        }, () => {}));
      }
      subscribePrivado();
    }

    api.ready = (async () => {
      await loadScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-app-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-auth-compat.js`);
      await loadScript(`https://www.gstatic.com/firebasejs/${FB_VERSION}/firebase-firestore-compat.js`);
      fb = window.firebase;
      fb.initializeApp(CFG.firebase);
      auth = fb.auth(); db = fb.firestore();
      auth.languageCode = "pt";
      ts = () => fb.firestore.FieldValue.serverTimestamp();

      db.collection("vagas").onSnapshot(q => {
        const v = {}; q.forEach(d => { v[d.id] = d.data(); }); raw.vagas = v; publish();
      }, e => console.error(e));
      db.collection("reservas").onSnapshot(q => {
        const r = {};
        q.forEach(d => {
          const x = d.data();
          r[d.id] = { ...x, criadoEm: toMs(x.criadoEm), atualizadoEm: toMs(x.atualizadoEm) };
        });
        raw.reservas = r;
        if (user) {
          const st = r[user.uid] ? r[user.uid].status : null;
          if (st !== lastMyStatus) { lastMyStatus = st; if (!user.isAdmin) subscribePrivado(); }
        }
        publish();
      }, e => console.error(e));
      db.doc("config/geral").onSnapshot(s => { raw.config = s.exists ? s.data() : {}; publish(); }, e => console.error(e));

      await new Promise(resolve => {
        let first = true;
        auth.onAuthStateChanged(u => {
          if (u) {
            const email = (u.email || "").toLowerCase();
            user = { uid: u.uid, email, nick: "", contato: "", isAdmin: api.isAdminEmail(email) };
            lastMyStatus = raw.reservas[u.uid] ? raw.reservas[u.uid].status : null;
          } else {
            user = null; lastMyStatus = null;
          }
          subscribeUser(user);
          emitAuth();
          if (first) { first = false; resolve(); }
        });
      });
    })().catch(e => { console.error(e); api.loadError = "Não foi possível conectar ao Firebase. Confira a configuração em js/config.js."; emitData(); });

    Object.assign(api, {
      signUp: wrap(async (email, pass, nick, contato) => {
        if (!cleanNick(nick)) fail("Escolha um nome de jogador.");
        const cred = await auth.createUserWithEmailAndPassword(String(email).trim(), pass);
        await db.doc("perfis/" + cred.user.uid).set({ nick: cleanNick(nick), contato: cleanText(contato, 80), criadoEm: ts() });
        user = { ...user, nick: cleanNick(nick), contato: cleanText(contato, 80) };
        emitAuth();
      }),
      signIn: wrap(async (email, pass) => { await auth.signInWithEmailAndPassword(String(email).trim(), pass); }),
      signOut: wrap(async () => { await auth.signOut(); }),
      resetPassword: wrap(async (email) => { await auth.sendPasswordResetEmail(String(email).trim()); }),
      updateProfile: wrap(async ({ nick, contato }) => {
        requireUser();
        if (!cleanNick(nick)) fail("Escolha um nome de jogador.");
        await db.doc("perfis/" + user.uid).set({ nick: cleanNick(nick), contato: cleanText(contato, 80), criadoEm: ts() });
      }),
      reserve: wrap(async (slotId) => {
        requireUser();
        if (raw.config && raw.config.inscricoesAbertas === false) fail("As inscrições estão fechadas no momento.");
        if (raw.reservas[user.uid]) fail("Você já tem uma vaga reservada. Cancele a atual para trocar.");
        if (raw.vagas[slotId]) fail("Essa vaga acabou de ser reservada por outra pessoa.");
        const b = db.batch();
        b.set(db.doc("vagas/" + slotId), { uid: user.uid, em: ts() });
        b.set(db.doc("reservas/" + user.uid), { slotId, status: "reservada", jogador: cleanNick(user.nick) || "Jogador", criadoEm: ts(), ficha: {} });
        try { await b.commit(); }
        catch (e) {
          if (e.code === "permission-denied") fail("Não deu para reservar. A vaga pode ter sido pega agora mesmo ou as inscrições foram fechadas.");
          throw e;
        }
      }),
      cancel: wrap(async () => {
        requireUser();
        const r = raw.reservas[user.uid];
        if (!r) return;
        const b = db.batch();
        if (raw.vagas[r.slotId] && raw.vagas[r.slotId].uid === user.uid) b.delete(db.doc("vagas/" + r.slotId));
        b.delete(db.doc("reservas/" + user.uid));
        await b.commit();
      }),
      saveFicha: wrap(async (ficha, enviar, segredo) => {
        requireUser();
        const r = raw.reservas[user.uid];
        if (!r) fail("Você não tem uma vaga reservada.");
        if (r.status === "aprovada") fail("Sua ficha já foi aprovada. Fale com o mestre para alterar.");
        const upd = { ficha: cleanFicha(ficha), atualizadoEm: ts() };
        if (enviar) upd.status = "ficha_enviada";
        await db.doc("reservas/" + user.uid).update(upd);
        await db.doc("segredos/" + user.uid).set({ texto: cleanText(segredo, 5000), atualizadoEm: ts() });
      }),
      admin: {
        setStatus: wrap(async (uid, status, nota) => {
          requireAdmin();
          await db.doc("reservas/" + uid).update({ status, notaMestre: cleanText(nota, 2000), atualizadoEm: ts() });
        }),
        release: wrap(async (uid) => {
          requireAdmin();
          const r = raw.reservas[uid];
          const b = db.batch();
          if (r && raw.vagas[r.slotId] && raw.vagas[r.slotId].uid === uid) b.delete(db.doc("vagas/" + r.slotId));
          b.delete(db.doc("reservas/" + uid));
          await b.commit();
        }),
        saveConfig: wrap(async (cfg) => {
          requireAdmin();
          await db.doc("config/geral").set({ aviso: cleanText(cfg.aviso, 2000), inscricoesAbertas: !!cfg.inscricoesAbertas });
        }),
        savePrivate: wrap(async (p) => {
          requireAdmin();
          await db.doc("config/privado").set({ linkGrupo: cleanText(p.linkGrupo, 500), linkOff: cleanText(p.linkOff, 500) });
        })
      }
    });
  }

  if (api.mode === "firebase") firebaseImpl(); else demoImpl();
  window.MVBackend = api;
})();
