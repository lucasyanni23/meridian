/* =====================================================================
   APP — páginas, navegação e telas do painel.
   O conteúdo (textos, facções, vagas, locais, regras) fica em data.js.
   ===================================================================== */

(function () {
  "use strict";

  const D = window.MV_DATA;
  const B = window.MVBackend;
  const view = document.getElementById("view");
  const $ = (s, r) => (r || document).querySelector(s);

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const H = 3600 * 1000;
  const PRAZO = (D.rp.prazoFichaHoras || 72) * H;

  const FAC = {};
  const SLOTS = [];
  const SLOT = {};
  D.faccoes.forEach((f, i) => {
    f.idx = i;
    FAC[f.id] = f;
    f.vagas.forEach(v => { const s = Object.assign({}, v, { faccao: f.id, cor: f.cor }); SLOTS.push(s); SLOT[v.id] = s; });
  });
  const IND = D.independentes || null;
  const PROF = {};
  if (IND) {
    FAC[IND.id] = IND;
    IND.profissoes.forEach(p => {
      PROF[p.id] = p; p.slots = [];
      for (let i = 1; i <= p.vagas; i++) {
        const s = { id: "ind-" + p.id + "-" + i, papel: p.nome, nome: p.nome, desc: p.desc, faccao: IND.id, cor: IND.cor, indep: true, prof: p.id, nivel: p.nivel, img: "" };
        SLOTS.push(s); SLOT[s.id] = s; p.slots.push(s);
      }
    });
  }
  const FAC_SLOTS = SLOTS.filter(s => !s.indep);
  const IND_SLOTS = SLOTS.filter(s => s.indep);
  const nivelNome = (n) => (IND && IND.niveis[n] ? IND.niveis[n].nome : n);
  const NEUTRAL = "#9886C2";
  const facColor = (id) => (FAC[id] ? FAC[id].cor : NEUTRAL);

  const NAV = [
    ["inicio", "Início"], ["cidade", "A Cidade"], ["faccoes", "Facções"], ["locais", "Locais"],
    ["elenco", "Elenco"], ["regras", "Regras"], ["painel", "Painel"]
  ];

  const PUB = {
    livre: ["Disponível", "st-livre"],
    reservada: ["Reservada", "st-reservada"],
    analise: ["Em análise", "st-analise"],
    ocupada: ["Ocupada", "st-ocupada"]
  };
  const RST = {
    reservada: ["Aguardando ficha", "st-reservada"],
    recusada: ["Ajustes pedidos", "st-ajustes"],
    ficha_enviada: ["Em análise", "st-analise"],
    aprovada: ["Aprovada", "st-livre"]
  };

  const FICHA_CAMPOS = [
    ["nome", "Nome do personagem"], ["idade", "Idade"], ["ocupacao", "Ocupação"], ["faceclaim", "Faceclaim"],
    ["aparencia", "Aparência"], ["personalidade", "Personalidade"], ["historia", "História"], ["ganchos", "Relações e ganchos"]
  ];

  const ui = {
    page: null, filtroFac: "todas", filtroSt: "todas", confirmSlot: null, pendingSlot: null,
    pnTab: "entrar", editProfile: false, confirmCancel: false,
    adminFiltro: "ficha_enviada", expanded: {}, ajusteFor: null, confirmRelease: null,
    openSlot: null, confirmProf: null, shellFor: undefined, sig: {}, cfgDirty: false, pendingAdmin: false, submitter: null
  };

  const SILHOUETTE = '<svg viewBox="0 0 120 120" aria-hidden="true"><path fill="currentColor" d="M60 12c13.3 0 23 10.6 23 25.5S73.3 66 60 66 37 52.4 37 37.5 46.7 12 60 12zM12 120c2.4-27 21.7-46 48-46s45.6 19 48 46z"/></svg>';

  /* ---------------- helpers ---------------- */
  function initials(s) { const t = String(s || "?").trim(); return esc(t.charAt(0).toUpperCase() || "?"); }
  function validUrl(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(String(u || "").trim()); }
  function fmtDate(ms) {
    try { return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(ms)); }
    catch (e) { return new Date(ms).toLocaleString(); }
  }
  function dur(ms) {
    const m = Math.round(Math.abs(ms) / 60000);
    if (m < 60) return m + " min";
    const h = Math.round(m / 60);
    if (h < 48) return h + " h";
    return Math.round(h / 24) + " dias";
  }
  function ago(ms) { return ms ? "há " + dur(Date.now() - ms) : "agora"; }
  function deadlineInfo(r) {
    if (!r || !r.criadoEm || (r.status !== "reservada" && r.status !== "recusada")) return null;
    const due = r.criadoEm + PRAZO;
    const left = due - Date.now();
    if (left < 0) return { late: true, txt: "Prazo da ficha vencido há " + dur(left) };
    return { late: false, txt: "Prazo da ficha: " + fmtDate(due) + " (faltam " + dur(left) + ")" };
  }
  function toast(msg, bad) {
    const t = $("#toast");
    t.textContent = msg; t.className = "toast" + (bad ? " bad" : ""); t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, bad ? 5200 : 3200);
  }
  async function run(fn, okMsg) {
    try { await fn(); if (okMsg) toast(okMsg); return true; }
    catch (e) { console.error(e); toast((e && e.message) || "Algo deu errado. Tente de novo.", true); return false; }
  }

  function data() { return B.data || {}; }
  function me() { return B.user; }
  function myRes() { const u = me(); return u ? (data().reservas || {})[u.uid] || null : null; }
  function inscricoesAbertas() { const c = data().config || {}; return c.inscricoesAbertas !== false; }

  function slotState(id) {
    const d = data();
    const v = (d.vagas || {})[id];
    if (!v) return { st: "livre" };
    const r = (d.reservas || {})[v.uid];
    if (!r || r.slotId !== id) return { st: "reservada", uid: v.uid, r: null };
    const map = { reservada: "reservada", recusada: "reservada", ficha_enviada: "analise", aprovada: "ocupada" };
    return { st: map[r.status] || "reservada", uid: v.uid, r };
  }
  function counts(list) {
    const c = { livre: 0, reservada: 0, analise: 0, ocupada: 0, total: list.length };
    list.forEach(s => { c[slotState(s.id).st]++; });
    return c;
  }
  function displayName(slot, r) {
    if (r && r.status === "aprovada" && r.ficha && r.ficha.nome) return r.ficha.nome;
    return slot.nome;
  }
  function roleFor(slot, r) {
    if (!slot.indep) return slot.papel;
    return displayName(slot, r) !== slot.nome ? slot.nome + " · Independente" : "Independente · " + nivelNome(slot.nivel);
  }
  function titleLine(slot, r) {
    const n = displayName(slot, r);
    if (slot.indep) return n !== slot.nome ? n + " · " + slot.nome : slot.nome + " · Independente";
    return n + " · " + slot.papel;
  }
  function freeSlotOf(pid) {
    const p = PROF[pid];
    return p ? p.slots.find(x => slotState(x.id).st === "livre") || null : null;
  }
  function imgFor(slot, r) {
    if (r && r.status === "aprovada" && r.ficha && validUrl(r.ficha.imagem)) return r.ficha.imagem.trim();
    return slot.img || "";
  }

  /* ---------------- shared pieces ---------------- */
  function meter(c, compact) {
    const seg = (k, cls) => c[k] ? `<i class="m-${cls}" style="flex:${c[k]}"></i>` : "";
    const parts = [];
    if (c.livre) parts.push(c.livre + (c.livre === 1 ? " livre" : " livres"));
    if (c.reservada) parts.push(c.reservada + (c.reservada === 1 ? " reservada" : " reservadas"));
    if (c.analise) parts.push(c.analise + " em análise");
    if (c.ocupada) parts.push(c.ocupada + (c.ocupada === 1 ? " ocupada" : " ocupadas"));
    const txt = parts.join(" · ");
    return `<div class="meter"><div class="meter-bar" role="img" aria-label="${esc(txt)}">${seg("livre", "livre")}${seg("reservada", "reservada")}${seg("analise", "analise")}${seg("ocupada", "ocupada")}</div>${compact ? "" : `<span class="meter-txt">${esc(txt)}</span>`}</div>`;
  }

  function slotImg(slot, st, r) {
    const src = imgFor(slot, r);
    const [lbl, cls] = PUB[st];
    return `<div class="slot-img"${src ? zoomAttrs(src, displayName(slot, r)) : ""}><div class="slot-ph">${SILHOUETTE}</div>${src ? `<img src="${esc(src)}" alt="" loading="lazy" data-fallback="1"><span class="zoom-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>` : ""}<span class="pill ${cls}">${lbl}</span></div>`;
  }

  function slotCard(slot) {
    const s = slotState(slot.id);
    const r = s.r;
    const u = me();
    const mine = u && s.uid === u.uid;
    const [lbl, cls] = PUB[s.st];
    const jog = esc((r && r.jogador) || "outro jogador");
    let meta = "";
    if (s.st === "livre") meta = "Vaga aberta";
    else if (mine) meta = "Esta é a sua vaga";
    else if (s.st === "reservada") meta = "Reservada por " + jog;
    else if (s.st === "analise") meta = "Ficha de " + jog + " em análise";
    else meta = "Jogador: " + jog;

    let actions = "";
    if (ui.confirmSlot === slot.id && s.st === "livre") {
      actions = `<div class="confirm-box"><span>Reservar <b>${esc(slot.nome)}</b>? Você terá ${D.rp.prazoFichaHoras} horas para enviar a ficha.</span>
        <div class="btn-row"><button class="btn btn-primary btn-sm" data-act="reserve-confirm" data-slot="${slot.id}" type="button">Confirmar reserva</button>
        <button class="btn btn-quiet btn-sm" data-act="reserve-back" type="button">Voltar</button></div></div>`;
    } else if (mine) {
      actions = `<a class="btn btn-ghost btn-sm" href="#painel">Abrir meu painel</a>`;
    } else if (s.st === "livre") {
      actions = inscricoesAbertas()
        ? `<button class="btn btn-primary btn-sm" data-act="reserve" data-slot="${slot.id}" type="button">Reservar vaga</button><button class="btn btn-quiet btn-sm" data-act="open" data-slot="${slot.id}" type="button">Detalhes</button>`
        : `<button class="btn btn-ghost btn-sm" type="button" disabled>Inscrições fechadas</button><button class="btn btn-quiet btn-sm" data-act="open" data-slot="${slot.id}" type="button">Detalhes</button>`;
    } else {
      actions = `<button class="btn btn-ghost btn-sm" data-act="open" data-slot="${slot.id}" type="button">${s.st === "ocupada" ? "Ver personagem" : "Detalhes"}</button>`;
    }

    return `<article class="slot" style="--fac:${slot.cor}">
      ${slotImg(slot, s.st, r)}
      <div class="slot-body">
        <p class="slot-role">${esc(roleFor(slot, r))}</p>
        <h4 class="slot-name">${esc(displayName(slot, r))}</h4>
        <p class="slot-desc">${esc(slot.desc)}</p>
        <p class="slot-meta"><span class="pill ${cls}">${lbl}</span><span>${meta}</span></p>
        <div class="slot-actions">${actions}</div>
      </div>
    </article>`;
  }

  function facCard(f) {
    const c = counts(SLOTS.filter(s => s.faccao === f.id));
    return `<a class="fac-card" href="#${f.id}" style="--fac:${f.cor}">
      <p class="eyebrow">${esc(f.tags)}</p>
      <h3>${esc(f.nome)}</h3>
      <p>${esc(f.resumo)}</p>
      ${meter(c)}
    </a>`;
  }

  function profCard(p) {
    const states = p.slots.map(x => ({ s: x, st: slotState(x.id) }));
    const free = states.filter(x => x.st.st === "livre").length;
    const u = me();
    const mineHere = u && states.some(x => x.st.uid === u.uid);
    const seats = states.map(x => `<i class="seat ${PUB[x.st.st][1]}"></i>`).join("");
    const who = states.filter(x => x.st.st !== "livre").map(x => {
      const r = x.st.r;
      const [lbl, cls] = PUB[x.st.st];
      const nm = x.st.st === "ocupada" ? displayName(x.s, r) : (x.st.st === "analise" ? "Ficha em análise" : "Vaga reservada");
      return `<li><button type="button" class="prof-who-btn" data-act="open" data-slot="${x.s.id}"><span>${esc(nm)}${r ? ` <span class="muted">· ${esc(r.jogador)}</span>` : ""}</span><span class="pill ${cls}">${lbl}</span></button></li>`;
    }).join("");
    let act;
    if (ui.confirmProf === p.id && free) {
      act = `<div class="confirm-box"><span>Reservar uma vaga de <b>${esc(p.nome)}</b>? Você cria o personagem na ficha e tem ${D.rp.prazoFichaHoras} horas para enviar.</span>
        <div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-act="prof-confirm" data-val="${p.id}">Confirmar reserva</button><button class="btn btn-quiet btn-sm" type="button" data-act="prof-back">Voltar</button></div></div>`;
    } else if (mineHere) act = `<a class="btn btn-ghost btn-sm" href="#painel">Abrir meu painel</a>`;
    else if (!free) act = `<button class="btn btn-ghost btn-sm" type="button" disabled>${p.vagas === 1 ? "Vaga ocupada" : "Vagas esgotadas"}</button>`;
    else if (!inscricoesAbertas()) act = `<button class="btn btn-ghost btn-sm" type="button" disabled>Inscrições fechadas</button>`;
    else act = `<button class="btn btn-primary btn-sm" type="button" data-act="prof-reserve" data-val="${p.id}">Reservar vaga</button>`;
    const txt = p.vagas === 1 ? (free ? "1 vaga · livre" : "1 vaga · ocupada") : `${free} de ${p.vagas} livres`;
    return `<article class="prof" style="--fac:${IND.cor}">
      <div class="prof-top"><h4 class="slot-name">${esc(p.nome)}</h4><span class="tag niv-${p.nivel}">${esc(nivelNome(p.nivel))}</span></div>
      <p class="slot-desc">${esc(p.desc)}</p>
      <div class="prof-seats"><span class="seats" role="img" aria-label="${esc(txt)}">${seats}</span><span class="meter-txt">${esc(txt)}</span></div>
      ${who ? `<ul class="prof-who">${who}</ul>` : ""}
      <div class="slot-actions">${act}</div>
    </article>`;
  }

  function profGroups() {
    return Object.keys(IND.niveis).map(n => {
      const ps = IND.profissoes.filter(p => p.nivel === n);
      if (!ps.length) return "";
      return `<div class="sub-head"><h3>${esc(IND.niveis[n].nome)}</h3><span class="eyebrow">${esc(IND.niveis[n].regra)} por profissão</span></div>
        <div class="profs">${ps.map(profCard).join("")}</div>`;
    }).join("");
  }

  function indCard() {
    if (!IND) return "";
    const c = counts(IND_SLOTS);
    return `<a class="fac-card fac-wide" href="#${IND.id}" style="--fac:${IND.cor}">
      <p class="eyebrow">${esc(IND.tags)}</p>
      <h3>${esc(IND.nome)}</h3>
      <p>${esc(IND.resumo)} São ${IND.profissoes.length} profissões e ${c.total} vagas.</p>
      ${meter(c)}
    </a>`;
  }

  function indSection() {
    if (!IND) return "";
    const c = counts(IND_SLOTS);
    return `<section class="fac-sec" id="${IND.id}" style="--fac:${IND.cor}"><div class="wrap sec">
      <div class="fac-head">
        <p class="eyebrow">${esc(IND.eyebrow)} · ${esc(IND.tags)}</p>
        <h2>${esc(IND.nome)}</h2>
        <p class="poder"><b>Sem facção:</b> ${esc(IND.poder)}</p>
      </div>
      <div class="fac-story" style="margin-top:0">
        <div class="fac-story-aside">
          <p class="eyebrow">Personagens independentes</p>
          <h3>${esc(IND.historiaTitulo)}</h3>
          <dl class="traits">${IND.perfil.map(p => `<div class="trait"><dt>${esc(p.rotulo)}</dt><dd>${esc(p.texto)}</dd></div>`).join("")}</dl>
        </div>
        <div class="prose">${IND.historia.map(p => `<p>${esc(p)}</p>`).join("")}
          <div class="panel" style="margin-top:22px;display:grid;gap:10px"><span class="eyebrow">${c.total} vagas independentes</span>${meter(c)}</div>
        </div>
      </div>
      ${profGroups()}
    </div></section>`;
  }

  function zoomAttrs(src, cap) {
    return ` data-act="zoom" data-src="${esc(src)}" data-cap="${esc(cap || "")}" role="button" tabindex="0" aria-label="Ampliar foto${cap ? ": " + esc(cap) : ""}"`;
  }

  function tile(item, n, extraCls) {
    const has = !!item.img;
    const cap = item.titulo || item.nome || "";
    return `<figure class="tile ${has ? "has-img" : "ph-" + n} ${extraCls || ""}" style="margin:0"${has ? zoomAttrs(item.img, cap) : ""}>
      ${has ? `<span class="zoom-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>` : ""}
      ${has ? `<img src="${esc(item.img)}" alt="${esc(item.titulo || item.nome || "")}" loading="lazy">` : ""}
      ${item.rotulo ? `<figcaption><span class="eyebrow">${esc(item.rotulo)}</span><b>${esc(item.titulo)}</b></figcaption>` : ""}
    </figure>`;
  }

  function pageHero(eyebrow, title, lead) {
    return `<section class="page-hero"><div class="wrap">
      <p class="eyebrow">${esc(eyebrow)}</p>
      <h1 class="display">${esc(title)}</h1>
      ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
    </div></section>`;
  }

  function fichaView(f, withEmpty) {
    const rows = FICHA_CAMPOS.filter(([k]) => withEmpty || (f && String(f[k] || "").trim()))
      .map(([k, l]) => `<div><dt>${l}</dt><dd>${esc((f && f[k]) || "—")}</dd></div>`).join("");
    return rows ? `<dl class="ficha-view" style="margin:0">${rows}</dl>` : `<p class="muted" style="margin:0">Ficha ainda não enviada.</p>`;
  }

  /* ---------------- views ---------------- */
  function viewInicio() {
    const c = counts(SLOTS);
    const cfg = data().config || {};
    return `
    <section class="hero"><div class="wrap">
      <div class="hero-meta"><span>Miami · ${esc(D.rp.cenario.replace(/^.*?,\s*/, ""))}</span><span>25.7617° N · 80.1918° W</span></div>
      <h1 class="hero-title"><span class="display">${esc(D.rp.nome)}</span><span class="neon">${esc(D.rp.sub)}</span></h1>
      <p class="hero-tag">${esc(D.rp.tagline)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="#elenco">Reservar personagem</a>
        <a class="btn btn-ghost" href="#cidade">Ler a sinopse</a>
      </div>
    </div></section>

    <section class="wrap">
      <div class="facts">
        <div class="kv"><dt>Cenário</dt><dd>${esc(D.rp.cenario)}</dd></div>
        <div class="kv"><dt>Estilo</dt><dd>${esc(D.rp.estilo)}</dd></div>
        <div class="kv"><dt>Plataforma</dt><dd>${esc(D.rp.plataforma)}</dd></div>
        <div class="kv"><dt>Inspirações</dt><dd>${esc(D.rp.tags.join(", "))}</dd></div>
        <div class="kv"><dt>Classificação</dt><dd>Personagens 18+</dd></div>
        <div class="kv"><dt>Vagas livres</dt><dd style="font-variant-numeric:tabular-nums">${c.livre} de ${c.total}</dd></div>
      </div>
      ${cfg.aviso ? `<div class="notice" style="margin-top:16px"><p class="eyebrow" style="color:var(--pink)">Aviso do mestre</p><p>${esc(cfg.aviso)}</p></div>` : ""}
    </section>

    <section class="sec"><div class="wrap story">
      <div class="story-aside">
        <p class="eyebrow">A história</p>
        <h2>Um trono vazio na cidade mais quente da América.</h2>
      </div>
      <div class="prose">
        <p class="dropcap">${esc(D.rp.resumo)}</p>
        <p>${esc(D.sinopse.paragrafos[5])}</p>
        <p><a class="btn btn-ghost btn-sm" href="#cidade" style="margin-top:6px">Ler a sinopse completa</a></p>
      </div>
    </div></section>

    <section class="sec" style="padding-top:0"><div class="wrap">
      <div class="sec-head"><p class="eyebrow">As quatro forças</p><h2 class="sec-title">Escolha seu lado</h2></div>
      <div class="grid g4">${D.faccoes.map(facCard).join("")}${indCard()}</div>
    </div></section>

    <section class="sec" style="padding-top:0"><div class="wrap">
      <div class="sec-head"><p class="eyebrow">Território</p><h2 class="sec-title">Quem manda em cada bairro</h2></div>
      <div class="grid g2">${D.bairros.map((b, i) => locCard(b, i)).join("")}</div>
      <p style="margin:18px 0 0"><a class="btn btn-ghost btn-sm" href="#locais">Ver mapa e pontos de interesse</a></p>
    </div></section>

    <section class="sec" style="padding-top:0"><div class="wrap">
      <div class="cta-band"><div>
        <p class="eyebrow" style="color:var(--sun)">${c.livre} vagas abertas</p>
        <h2>${c.total} vagas. Nenhuma inocente.</h2>
        <p class="lead" style="font-size:17px">Reserve uma vaga, envie sua ficha e aguarde a aprovação do mestre. O link do grupo aparece no seu painel.</p>
        <div class="btn-row"><a class="btn btn-primary" href="#elenco">Ver o elenco</a><a class="btn btn-ghost" href="#regras">Ler as regras</a></div>
      </div></div>
    </div></section>`;
  }

  function viewCidade() {
    const ps = D.sinopse.paragrafos;
    const body = ps.slice(0, -1).map((p, i) => `<p${i === 0 ? ' class="dropcap"' : ""}>${esc(p)}</p>`).join("");
    const tl = D.sinopse.linhaDoTempo.map((t, i, a) => `<li${i === a.length - 1 ? ' class="now"' : ""}><span class="yr">${esc(t.ano)}</span><div><h3>${esc(t.titulo)}</h3><p>${esc(t.texto)}</p></div></li>`).join("");
    return `${pageHero("Sinopse · " + D.rp.cenario, "A Vice Coast", D.rp.tagline)}
    <section class="sec"><div class="wrap story">
      <div class="story-aside">
        <p class="eyebrow">Bem-vindos</p>
        <h2>${esc(D.sinopse.titulo)}</h2>
        <div class="facts" style="margin-top:8px">
          <div class="kv"><dt>Estilo</dt><dd>${esc(D.rp.estilo)}</dd></div>
          <div class="kv"><dt>Tags</dt><dd>${esc(D.rp.tags.join(" · "))}</dd></div>
        </div>
      </div>
      <div class="prose">${body}<p class="pull">${esc(ps[ps.length - 1])}</p></div>
    </div></section>

    <section class="sec" style="padding-top:0"><div class="wrap">
      <div class="sec-head"><p class="eyebrow">Linha do tempo</p><h2 class="sec-title">De terra Tequesta a cidade néon</h2></div>
      <ol class="timeline">${tl}</ol>
    </div></section>

    <section class="sec" style="padding-top:0"><div class="wrap">
      <div class="sec-head"><p class="eyebrow">Quem disputa a cidade</p><h2 class="sec-title">Quatro forças, vinte peças</h2></div>
      <div class="grid g4">${D.faccoes.map(facCard).join("")}</div>
    </div></section>`;
  }

  function viewFaccoes() {
    const nav = D.faccoes.concat(IND ? [IND] : []).map(f => `<a class="tag" href="#${f.id}" style="--fac:${f.cor}"><span class="dot"></span>${esc(f.curto)}</a>`).join("");
    const secs = D.faccoes.map(f => {
      const n0 = (f.idx * 3) % 6;
      const gal = f.galeria.map((g, i) => tile(g, ((n0 + i) % 6) + 1)).join("");
      const list = SLOTS.filter(s => s.faccao === f.id);
      const c = counts(list);
      return `<section class="fac-sec" id="${f.id}" style="--fac:${f.cor}"><div class="wrap sec">
        <div class="fac-head">
          <p class="eyebrow">${esc(f.eyebrow)} · ${esc(f.tags)}</p>
          <h2>${esc(f.nome)}</h2>
          <p class="poder"><b>Poder principal:</b> ${esc(f.poder)}</p>
        </div>
        <div class="gallery">${gal}</div>
        <div class="fac-story">
          <div class="fac-story-aside">
            <p class="eyebrow">História</p>
            <h3>${esc(f.historiaTitulo)}</h3>
            <dl class="traits">${f.perfil.map(p => `<div class="trait"><dt>${esc(p.rotulo)}</dt><dd>${esc(p.texto)}</dd></div>`).join("")}</dl>
          </div>
          <div class="prose">${f.historia.map(p => `<p>${esc(p)}</p>`).join("")}</div>
        </div>
        ${f.tracos && f.tracos.length ? `<div class="sub-head"><h3>Traços da família</h3><span class="eyebrow">Para escolher o faceclaim</span></div>
          <dl class="grid g3" style="margin:0">${f.tracos.map(t => `<div class="trait"><dt>${esc(t.rotulo)}</dt><dd>${esc(t.texto)}</dd></div>`).join("")}</dl>` : ""}
        <div class="sub-head"><h3>Vagas · ${esc(f.curto)}</h3><span class="meter-txt">${c.livre} de ${c.total} disponíveis</span></div>
        <div class="slots">${list.map(slotCard).join("")}</div>
      </div></section>`;
    }).join("");
    return `${pageHero(D.faccoes.length + " facções · " + SLOTS.length + " vagas", "Facções", "Quatro forças disputam a Vice Coast, cada uma com cinco vagas. Quem não quer bandeira pode chegar como independente.")}
      <div class="wrap" style="padding-block:18px"><nav class="fac-nav" aria-label="Facções">${nav}</nav></div>
      ${secs}${indSection()}`;
  }

  function locCard(l, i) {
    const cor = facColor(l.faccao);
    const ctrl = FAC[l.faccao] ? "Controle: " + FAC[l.faccao].curto : "Território neutro";
    const sub = l.coord ? l.coord : l.bairro;
    return `<article class="loc" id="loc-${l.id}" style="--fac:${cor}">
      ${tile({ img: l.img, nome: l.nome }, (i % 6) + 1)}
      <div class="loc-body">
        <h3>${esc(l.nome)}</h3>
        <span class="loc-coord">${esc(sub)}</span>
        <p>${esc(l.texto)}</p>
        <div class="loc-tags">
          <span class="tag" style="color:${cor}"><span class="dot"></span>${esc(ctrl)}</span>
          ${l.disputa ? `<span class="tag" style="color:var(--sun)">Em disputa</span>` : ""}
          ${l.novo ? `<span class="tag" style="color:var(--ink-3)">Novo local</span>` : ""}
        </div>
      </div>
    </article>`;
  }

  function mapSVG() {
    const label = (x, y, t, anchor) => `<text x="${x}" y="${y}" text-anchor="${anchor || "start"}" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1" fill="#F8F0FF" stroke="#120A24" stroke-width="3" paint-order="stroke">${esc(t)}</text>`;
    const LBL = {
      "south-beach": [296, 330, "SOUTH BEACH", "middle"],
      "brickell": [136, 276, "BRICKELL", "end"],
      "little-havana": [78, 238, "LITTLE HAVANA", "middle"],
      "porto": [206, 276, "PORT OF MIAMI", "middle"]
    };
    const pins = D.bairros.map(b => Object.assign({ big: true }, b)).concat(D.locais.map(l => Object.assign({ big: false }, l)));
    const pinSvg = pins.map(p => {
      const cor = facColor(p.faccao);
      const x = p.mapa.x, y = p.mapa.y;
      const lb = LBL[p.id];
      return `<g class="pin" data-loc="${p.id}" tabindex="0" role="button" aria-label="${esc(p.nome)}">
        ${p.big ? `<circle class="ring" cx="${x}" cy="${y}" r="6" fill="none" stroke="${cor}" stroke-width="1.5"/>` : ""}
        <circle cx="${x}" cy="${y}" r="12" fill="transparent"/>
        <circle class="core" cx="${x}" cy="${y}" r="${p.big ? 6 : 4}" fill="${cor}" filter="url(#mv-glow)"/>
        ${lb ? label(lb[0], lb[1], lb[2], lb[3]) : ""}
      </g>`;
    }).join("");
    return `<svg viewBox="0 0 360 440" role="img" aria-labelledby="mv-map-t">
      <title id="mv-map-t">Mapa estilizado de Miami com os territórios das facções</title>
      <defs>
        <linearGradient id="mv-sea" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A1340"/><stop offset="1" stop-color="#241A54"/></linearGradient>
        <pattern id="mv-marsh" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M1 8 L4.5 3 L8 8" fill="none" stroke="#4F8C78" stroke-width=".9" opacity=".55"/></pattern>
        <filter id="mv-glow" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="360" height="440" fill="url(#mv-sea)"/>
      <g stroke="#2C2160" stroke-width="1">
        <path d="M60 0V440M120 0V440M180 0V440M240 0V440M300 0V440M0 55H360M0 110H360M0 165H360M0 220H360M0 275H360M0 330H360M0 385H360"/>
      </g>
      <path d="M0 0H182L185 60L180 120L178 190L172 214L164 240L160 268L152 300L138 330L125 360L110 395L98 440H0Z" fill="#2A1D52" stroke="#FF5FA2" stroke-opacity=".75" stroke-width="1.4"/>
      <path d="M0 70H70L80 120L68 200L0 214Z" fill="url(#mv-marsh)"/>
      <path d="M171 222C146 214 124 228 98 219S42 204 0 211" fill="none" stroke="#1E1648" stroke-width="3.2"/>
      <path d="M283 0H312L318 80L316 160L314 230L310 290L300 312L286 308L283 250L281 170L279 90Z" fill="#2A1D52" stroke="#5CD2F2" stroke-opacity=".75" stroke-width="1.4"/>
      <line x1="178" y1="188" x2="281" y2="199" stroke="#4A3A80" stroke-width="1.6" stroke-dasharray="2 3"/>
      <line x1="176" y1="214" x2="283" y2="252" stroke="#4A3A80" stroke-width="2.6"/>
      <path d="M186 238L238 246Q245 252 238 259L188 253Q181 246 186 238Z" fill="#33246A" stroke="#F2C36B" stroke-opacity=".7"/>
      <ellipse cx="248" cy="226" rx="10" ry="5" fill="#33246A" stroke="#F2C36B" stroke-opacity=".7"/>
      <line x1="154" y1="302" x2="238" y2="334" stroke="#4A3A80" stroke-width="2"/>
      <path d="M238 326C252 318 272 330 276 352C280 378 263 400 251 396C241 380 237 350 238 326Z" fill="#2A1D52" stroke="#5CD2F2" stroke-opacity=".5"/>
      ${label(36, 92, "EVERGLADES", "middle")}
      ${label(130, 150, "MIAMI", "middle")}
      <text x="226" y="150" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="2" fill="#7C6BB0">BISCAYNE BAY</text>
      <text x="0" y="0" transform="translate(300 118) rotate(90)" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="2" fill="#B8A8E0">MIAMI BEACH</text>
      <text x="0" y="0" transform="translate(340 190) rotate(90)" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="3" fill="#7C6BB0">ATLANTIC OCEAN</text>
      <text x="257" y="414" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7" letter-spacing="1" fill="#7C6BB0">KEY BISCAYNE</text>
      <g transform="translate(330 404)"><path d="M0 -14L5 2L0 -2L-5 2Z" fill="#F8F0FF"/><text x="0" y="14" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="#F8F0FF">N</text></g>
      ${pinSvg}
    </svg>`;
  }

  function viewLocais() {
    const legend = D.faccoes.map(f => `<span class="tag" style="color:${f.cor}"><span class="dot"></span>${esc(f.curto)}</span>`).join("");
    return `${pageHero("Mapa · Miami-Dade", "Locais", "Bairros, territórios e os pontos onde as cenas acontecem. Toque num ponto do mapa para ver o local.")}
    <section class="sec" style="padding-top:28px"><div class="wrap map-wrap">
      <div class="map-box">${mapSVG()}<div class="map-legend">${legend}<span class="meter-txt" style="width:100%">Ponto grande: bairro · ponto pequeno: local · mapa estilizado, fora de escala</span></div></div>
      <div>
        <div class="sub-head" style="margin-top:0"><h3>Bairros</h3><span class="eyebrow">${D.bairros.length} territórios</span></div>
        <div class="loc-list">${D.bairros.map((b, i) => locCard(b, i)).join("")}</div>
      </div>
    </div></section>
    <section class="sec" style="padding-top:0"><div class="wrap">
      <div class="sub-head" style="margin-top:0"><h3>Pontos de interesse</h3><span class="eyebrow">Cenários para RP</span></div>
      <div class="grid g2">${D.locais.map((l, i) => locCard(l, i + 2)).join("")}</div>
    </div></section>`;
  }

  function viewElenco() {
    const all = counts(SLOTS);
    const facs = D.faccoes.concat(IND ? [IND] : []);
    const facChips = [["todas", "Todas", null]].concat(facs.map(f => [f.id, f.curto, f.cor]))
      .map(([id, n, cor]) => `<button class="chip" type="button" data-act="filter-fac" data-val="${id}" aria-pressed="${ui.filtroFac === id}">${cor ? `<span class="dot" style="color:${cor}"></span>` : ""}${esc(n)}</button>`).join("");
    const stList = [["todas", "Todas", all.total], ["livre", "Disponíveis", all.livre], ["reservada", "Reservadas", all.reservada], ["analise", "Em análise", all.analise], ["ocupada", "Ocupadas", all.ocupada]];
    const stChips = stList.map(([id, n, k]) => `<button class="chip" type="button" data-act="filter-st" data-val="${id}" aria-pressed="${ui.filtroSt === id}">${esc(n)} <span class="n">${k}</span></button>`).join("");
    const stOk = (x) => ui.filtroSt === "todas" || slotState(x.id).st === ui.filtroSt;
    const showInd = IND && (ui.filtroFac === "todas" || ui.filtroFac === IND.id);
    const facList = FAC_SLOTS.filter(x => (ui.filtroFac === "todas" || x.faccao === ui.filtroFac) && stOk(x));
    let profs = [], indList = [];
    if (showInd) {
      if (ui.filtroSt === "todas") profs = IND.profissoes;
      else if (ui.filtroSt === "livre") profs = IND.profissoes.filter(p => freeSlotOf(p.id));
      else indList = IND_SLOTS.filter(stOk);
    }
    const legend = [["livre", "Disponíveis", "var(--mint)"], ["reservada", "Reservadas", "var(--amber)"], ["analise", "Em análise", "var(--lilac)"], ["ocupada", "Ocupadas", "var(--ink-3)"]]
      .map(([k, n, c]) => `<span><i style="background:${c}"></i>${all[k]} ${n.toLowerCase()}</span>`).join("");
    const empty = !facList.length && !profs.length && !indList.length;
    const indBlock = (profs.length || indList.length) ? `
      <div class="sub-head"${facList.length ? "" : ' style="margin-top:0"'}><h3>${esc(IND.nome)}</h3><span class="eyebrow">Independentes · personagem criado por você</span></div>
      ${profs.length ? `<div class="profs">${profs.map(profCard).join("")}</div>` : ""}
      ${indList.length ? `<div class="slots">${indList.map(slotCard).join("")}</div>` : ""}` : "";
    return `${pageHero("Elenco · " + SLOTS.length + " vagas", "Vagas e personagens", "Todas as vagas em um só lugar. Filtre por facção ou por situação e reserve a sua.")}
    <section class="sec" style="padding-top:28px"><div class="wrap">
      <div class="panel summary">${meter(all, true)}<div class="summary-legend">${legend}</div></div>
      ${!inscricoesAbertas() ? `<div class="notice" style="margin-bottom:18px"><p><b>Inscrições fechadas.</b> O mestre pausou as reservas por enquanto.</p></div>` : ""}
      <div class="filters">
        <div class="chips" role="group" aria-label="Filtrar por facção">${facChips}</div>
        <div class="chips" role="group" aria-label="Filtrar por situação">${stChips}</div>
      </div>
      ${facList.length ? `<div class="slots">${facList.map(slotCard).join("")}</div>` : ""}
      ${indBlock}
      ${empty ? `<div class="empty"><b>Nenhuma vaga com esses filtros.</b><button class="btn btn-ghost btn-sm" type="button" data-act="filter-reset">Limpar filtros</button></div>` : ""}
    </div></section>`;
  }

  function viewRegras() {
    const R = D.regras;
    const passos = [
      ["Crie sua conta", "No Painel, cadastre-se com e-mail, senha e seu nome de jogador."],
      ["Reserve uma vaga", "Escolha um personagem de facção ou uma profissão independente no Elenco. Cada pessoa pode ter uma vaga."],
      ["Envie a ficha", "Você tem " + D.rp.prazoFichaHoras + " horas para preencher e enviar a ficha pelo Painel."],
      ["Aprovação", "O mestre aprova ou pede ajustes. Aprovada, o link do grupo aparece no seu Painel."]
    ];
    return `${pageHero("Como funciona", "Regras", "Dinâmica dos grupos, convivência e o caminho até a sua vaga.")}
    <section class="sec" style="padding-top:28px"><div class="wrap">
      ${R.aviso ? `<p class="meter-txt" style="margin:0 0 16px">${esc(R.aviso)}</p>` : ""}
      <div class="sub-head" style="margin-top:0"><h3>Dinâmica</h3><span class="eyebrow">${esc(D.rp.plataforma)} · ${esc(D.rp.estilo)}</span></div>
      <dl class="grid g3" style="margin:0">${R.dinamica.map(d => `<div class="trait" style="--fac:var(--pink)"><dt>${esc(d.rotulo)}</dt><dd>${esc(d.texto)}</dd></div>`).join("")}</dl>

      <div class="sub-head"><h3>Do cadastro à primeira cena</h3></div>
      <ol class="rules">${passos.map(p => `<li><div><h3>${esc(p[0])}</h3><p>${esc(p[1])}</p></div></li>`).join("")}</ol>

      <div class="sub-head"><h3>Convivência</h3></div>
      <ol class="rules">${R.lista.map(r => `<li><div><h3>${esc(r.titulo)}</h3><p>${esc(r.texto)}</p></div></li>`).join("")}</ol>

      <div class="cta-band" style="margin-top:40px"><div>
        <h2>Pronto para entrar na Vice Coast?</h2>
        <div class="btn-row"><a class="btn btn-primary" href="#elenco">Escolher personagem</a><a class="btn btn-ghost" href="#painel">Criar conta</a></div>
      </div></div>
    </div></section>`;
  }

  /* ---------------- painel ---------------- */
  function painelShell(u) {
    return `${pageHero("Painel", u ? "Seu painel" : "Entrar", u ? "Sua vaga, sua ficha e os links do grupo." : "Entre ou crie sua conta para reservar um personagem.")}
    <section class="sec" style="padding-top:28px"><div class="wrap dash" id="pn"></div></section>`;
  }

  function authHTML() {
    const t = ui.pnTab;
    const seg = [["entrar", "Entrar"], ["criar", "Criar conta"], ["senha", "Esqueci a senha"]]
      .map(([k, n]) => `<button type="button" data-act="pn-tab" data-val="${k}" aria-pressed="${t === k}">${n}</button>`).join("");
    let form = "";
    if (t === "entrar") form = `<form id="f-login" class="form" novalidate>
        <div class="field"><label for="li-email">E-mail</label><input class="input" id="li-email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="li-pass">Senha</label><input class="input" id="li-pass" type="password" autocomplete="current-password" required></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Entrar</button></div>
      </form>`;
    else if (t === "criar") form = `<form id="f-signup" class="form" novalidate>
        <div class="field"><label for="su-nick">Nome de jogador <span class="hint">como você aparece no elenco</span></label><input class="input" id="su-nick" maxlength="40" autocomplete="nickname" required></div>
        <div class="field"><label for="su-contato">Contato <span class="hint">WhatsApp ou @, visível só para o mestre</span></label><input class="input" id="su-contato" maxlength="80"></div>
        <div class="field"><label for="su-email">E-mail</label><input class="input" id="su-email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="su-pass">Senha <span class="hint">mínimo de 6 caracteres</span></label><input class="input" id="su-pass" type="password" autocomplete="new-password" minlength="6" required></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Criar conta</button></div>
      </form>`;
    else form = `<form id="f-reset" class="form" novalidate>
        <p class="muted" style="margin:0">Enviamos um link para você criar uma nova senha.</p>
        <div class="field"><label for="rp-email">E-mail da conta</label><input class="input" id="rp-email" type="email" autocomplete="email" required></div>
        <div class="btn-row"><button class="btn btn-primary" type="submit">Enviar link</button></div>
      </form>`;
    const pend = ui.pendingSlot && SLOT[ui.pendingSlot] ? `<div class="notice"><p class="eyebrow" style="color:var(--pink)">Vaga escolhida</p><p>Depois de entrar, você confirma a reserva de <b>${esc(SLOT[ui.pendingSlot].nome)}</b>.</p></div>` : "";
    const demo = B.mode === "demo" ? `<div class="panel" style="display:grid;gap:12px">
        <p class="eyebrow" style="color:var(--sun)">Teste rápido</p>
        <p style="margin:0;color:var(--ink-2)">Veja o site como jogador ou como mestre com as contas de teste.</p>
        <div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="demo-login" data-val="jogador">Entrar como jogador</button><button class="btn btn-ghost btn-sm" type="button" data-act="demo-login" data-val="mestre">Entrar como mestre</button></div>
        <p class="meter-txt" style="margin:0">jogador@demo.vc ou mestre@demo.vc · senha demo123</p>
      </div>` : "";
    const err = B.loadError ? `<div class="notice"><p>${esc(B.loadError)}</p></div>` : "";
    return `<div class="grid" style="gap:18px;max-width:560px">${err}${pend}
      <div class="panel"><div class="seg" role="group" aria-label="Acesso">${seg}</div><div style="margin-top:18px">${form}</div><p class="err" id="auth-msg" hidden style="margin-top:12px"></p></div>
      ${demo}</div>`;
  }

  function accountHTML(u) {
    const head = `<div class="dash-hello"><span class="avatar">${initials(u.nick || u.email)}</span>
      <div style="min-width:0;flex:1"><h2>Olá, ${esc(u.nick || "jogador")}</h2><span class="meter-txt">${esc(u.email)}${u.isAdmin ? " · mestre" : ""}</span></div>
      <div class="btn-row"><button class="btn btn-ghost btn-sm" type="button" data-act="edit-profile">${ui.editProfile ? "Fechar" : "Editar perfil"}</button><button class="btn btn-quiet btn-sm" type="button" data-act="logout">Sair</button></div></div>`;
    const form = ui.editProfile ? `<form id="f-perfil" class="form panel" novalidate style="margin-top:14px">
      <div class="row2">
        <div class="field"><label for="pf-nick">Nome de jogador</label><input class="input" id="pf-nick" maxlength="40" value="${esc(u.nick)}" required></div>
        <div class="field"><label for="pf-contato">Contato <span class="hint">visível só para o mestre</span></label><input class="input" id="pf-contato" maxlength="80" value="${esc(u.contato)}"></div>
      </div>
      <div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar perfil</button></div></form>` : "";
    const verify = B.mode === "firebase" && !u.emailVerified
      ? `<div class="callout" style="margin-top:14px"><b>Confirme seu e-mail</b>Enviamos um link de confirmação para ${esc(u.email)}. Se for o mestre, o painel do mestre aparece depois da confirmação.
          <div class="btn-row" style="margin-top:10px"><button class="btn btn-ghost btn-sm" type="button" data-act="verify-check">Já confirmei</button><button class="btn btn-quiet btn-sm" type="button" data-act="verify-send">Reenviar e-mail</button></div></div>`
      : "";
    return head + verify + form;
  }

  function fichaForm(slot, r) {
    const f = r.ficha || {};
    const d = (k, def) => esc(f[k] != null && f[k] !== "" ? f[k] : (def || ""));
    const defNome = slot.indep || /\sou\s/.test(slot.nome) ? "" : slot.nome;
    const sec = esc((data().segredos || {})[me().uid] || "");
    return `<form id="f-ficha" class="form panel" novalidate>
      <div class="sub-head" style="margin:0 0 4px"><h3>Ficha do personagem</h3><span class="eyebrow">Campos com * são obrigatórios para enviar</span></div>
      <div class="row2">
        <div class="field"><label for="fc-nome">Nome do personagem *</label><input class="input" id="fc-nome" maxlength="80" value="${d("nome", defNome)}" placeholder="${esc(slot.indep ? "Nome do seu personagem" : slot.nome)}"></div>
        <div class="field"><label for="fc-idade">Idade * <span class="hint">18 ou mais</span></label><input class="input" id="fc-idade" type="number" min="18" max="99" inputmode="numeric" value="${d("idade")}"></div>
      </div>
      <div class="row2">
        <div class="field"><label for="fc-ocupacao">Ocupação</label><input class="input" id="fc-ocupacao" maxlength="120" value="${d("ocupacao", slot.papel)}"></div>
        <div class="field"><label for="fc-faceclaim">Faceclaim *</label><input class="input" id="fc-faceclaim" maxlength="80" value="${d("faceclaim")}" placeholder="Nome do ator ou atriz"></div>
      </div>
      <div class="field"><label for="fc-imagem">Link da imagem <span class="hint">opcional, endereço que começa com https://</span></label><input class="input" id="fc-imagem" type="url" maxlength="500" value="${d("imagem")}" placeholder="https://"></div>
      <div class="field"><label for="fc-aparencia">Aparência</label><textarea class="textarea" id="fc-aparencia" maxlength="3000">${d("aparencia")}</textarea></div>
      <div class="field"><label for="fc-personalidade">Personalidade</label><textarea class="textarea" id="fc-personalidade" maxlength="3000">${d("personalidade")}</textarea></div>
      <div class="field"><label for="fc-historia">História *</label><textarea class="textarea" id="fc-historia" maxlength="6000" style="min-height:200px">${d("historia")}</textarea></div>
      <div class="field"><label for="fc-ganchos">Relações e ganchos <span class="hint">aliados, rivais, dívidas, segredos de outras pessoas</span></label><textarea class="textarea" id="fc-ganchos" maxlength="3000">${d("ganchos")}</textarea></div>
      <div class="field"><label for="fc-segredo">Segredo <span class="hint">só o mestre vê</span></label><textarea class="textarea" id="fc-segredo" maxlength="5000">${sec}</textarea></div>
      <p class="err" id="ficha-msg" hidden></p>
      <div class="btn-row">
        <button class="btn btn-primary" type="submit" value="enviar">${r.status === "ficha_enviada" ? "Reenviar ao mestre" : "Enviar para aprovação"}</button>
        <button class="btn btn-ghost" type="submit" value="rascunho">Salvar rascunho</button>
      </div>
    </form>`;
  }

  function meHTML(u) {
    const r = myRes();
    if (!r || !SLOT[r.slotId]) {
      let ps = ui.pendingSlot && SLOT[ui.pendingSlot];
      if (ps && ps.indep && slotState(ps.id).st !== "livre") {
        const alt = freeSlotOf(ps.prof);
        if (alt) { ui.pendingSlot = alt.id; ps = alt; }
      }
      if (ps) {
        const st = slotState(ps.id).st;
        if (st === "livre") {
          return `<div class="panel mine" style="--fac:${ps.cor}">
            <p class="eyebrow">Confirmar reserva</p>
            <div class="mine-head">${slotImg(ps, "livre", null)}<div style="display:grid;gap:4px;min-width:0"><span class="slot-role">${esc(FAC[ps.faccao].curto)} · ${esc(ps.papel)}</span><h3 class="slot-name" style="font-size:22px">${esc(ps.nome)}</h3></div></div>
            <p style="margin:0;color:var(--ink-2)">Depois de confirmar, você tem ${D.rp.prazoFichaHoras} horas para enviar a ficha.</p>
            <div class="btn-row"><button class="btn btn-primary" type="button" data-act="pending-confirm"${inscricoesAbertas() ? "" : " disabled"}>Confirmar reserva</button><button class="btn btn-quiet" type="button" data-act="pending-clear">Escolher outra</button></div>
          </div>`;
        }
      }
      return `<div class="empty"><b style="font-size:18px">Você ainda não tem uma vaga.</b>
        <span>${ps ? "A vaga que você escolheu acabou de ser reservada por outra pessoa. " : ""}Escolha um personagem no Elenco. Depois de reservar, você tem ${D.rp.prazoFichaHoras} horas para enviar a ficha.</span>
        ${inscricoesAbertas() ? "" : `<span class="err">As inscrições estão fechadas no momento.</span>`}
        <a class="btn btn-primary btn-sm" href="#elenco">Ver vagas disponíveis</a></div>`;
    }
    const s = SLOT[r.slotId];
    const f = FAC[s.faccao];
    const [lbl, cls] = RST[r.status] || RST.reservada;
    const dl = deadlineInfo(r);
    const priv = data().privado;
    let body = "";
    if (r.status === "aprovada") {
      const links = priv && (priv.linkGrupo || priv.linkOff)
        ? [["Grupo principal (ON)", priv.linkGrupo], ["Grupo OFF", priv.linkOff]].filter(x => x[1]).map(([n, l]) => `<div class="field"><label>${n}</label><div class="copy-row"><code>${esc(l)}</code>${validUrl(l) ? `<a class="btn btn-primary btn-sm" href="${esc(l)}" target="_blank" rel="noopener">Abrir</a>` : ""}<button class="btn btn-ghost btn-sm" type="button" data-act="copy" data-val="${esc(l)}">Copiar</button></div></div>`).join("")
        : `<p class="muted" style="margin:0">O mestre ainda não cadastrou os links do grupo. Eles aparecem aqui assim que forem adicionados.</p>`;
      body = `<div class="callout ok-c"><b>Ficha aprovada</b>Bem-vindo à Vice Coast. Entre nos grupos para começar.</div>
        <div class="panel links-box">${links}</div>
        <div class="panel"><div class="sub-head" style="margin:0 0 14px"><h3>Sua ficha</h3><span class="eyebrow">Para alterar, fale com o mestre</span></div>${fichaView(r.ficha)}</div>`;
    } else {
      body = (r.notaMestre ? `<div class="callout"><b>Recado do mestre</b>${esc(r.notaMestre)}</div>` : "")
        + (r.status === "ficha_enviada" ? `<div class="callout" style="border-left-color:var(--lilac)"><b style="color:var(--lilac)">Ficha enviada</b>O mestre vai avaliar em breve. Você ainda pode editar e reenviar.</div>` : "")
        + fichaForm(s, r);
    }
    const cancel = ui.confirmCancel
      ? `<div class="confirm-box"><span>Cancelar a reserva de <b>${esc(displayName(s, r))}</b>? A vaga volta a ficar disponível para outras pessoas.</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="cancel-yes">Sim, cancelar reserva</button><button class="btn btn-quiet btn-sm" type="button" data-act="cancel-no">Manter</button></div></div>`
      : `<div><button class="btn btn-quiet btn-sm" type="button" data-act="cancel-res" style="color:var(--danger)">Cancelar reserva</button></div>`;
    return `<div class="mine" style="--fac:${s.cor}">
      <div class="panel"><div class="mine-head">${slotImg(s, slotState(s.id).st, r)}
        <div style="display:grid;gap:6px;min-width:0">
          <span class="slot-role">${esc(f.curto)} · ${esc(s.papel)}</span>
          <h3 class="slot-name" style="font-size:22px">${esc(displayName(s, r))}</h3>
          <div class="btn-row" style="gap:8px"><span class="pill ${cls}">${lbl}</span>${dl ? `<span class="deadline${dl.late ? " late" : ""}">${esc(dl.txt)}</span>` : ""}</div>
        </div></div></div>
      ${body}
      ${cancel}
    </div>`;
  }

  function adminHTML() {
    const d = data();
    const res = d.reservas || {};
    const perfis = d.perfis || {};
    const all = counts(SLOTS);
    const uids = Object.keys(res).filter(uid => SLOT[res[uid].slotId]);
    const byStatus = (st) => uids.filter(uid => res[uid].status === st);
    const tabs = [["ficha_enviada", "Em análise"], ["reservada", "Aguardando ficha"], ["recusada", "Ajustes pedidos"], ["aprovada", "Aprovadas"], ["todas", "Todas"]];
    const seg = tabs.map(([k, n]) => `<button type="button" data-act="q-filter" data-val="${k}" aria-pressed="${ui.adminFiltro === k}">${n} <span class="mono" style="opacity:.7">${k === "todas" ? uids.length : byStatus(k).length}</span></button>`).join("");
    const list = (ui.adminFiltro === "todas" ? uids : byStatus(ui.adminFiltro)).sort((a, b) => (res[a].criadoEm || 0) - (res[b].criadoEm || 0));

    const items = list.map(uid => {
      const r = res[uid];
      const s = SLOT[r.slotId];
      const p = perfis[uid] || {};
      const [lbl, cls] = RST[r.status] || RST.reservada;
      const dl = deadlineInfo(r);
      const open = !!ui.expanded[uid];
      const contato = p.contato ? " · " + p.contato : "";
      let detail = "";
      if (open) {
        const sec = (d.segredos || {})[uid];
        let acts = "";
        if (ui.ajusteFor === uid) {
          acts = `<div class="field"><label for="aj-${uid}">Recado para o jogador</label><textarea class="textarea" id="aj-${uid}" maxlength="2000" style="min-height:90px">${esc(r.notaMestre || "")}</textarea></div>
            <div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-act="ajuste-send" data-uid="${uid}">Enviar recado e pedir ajustes</button><button class="btn btn-quiet btn-sm" type="button" data-act="ajuste-back">Voltar</button></div>`;
        } else if (ui.confirmRelease === uid) {
          acts = `<div class="confirm-box"><span>Liberar a vaga de <b>${esc(r.jogador)}</b>? A reserva e a ficha serão apagadas e a vaga volta a ficar disponível.</span><div class="btn-row"><button class="btn btn-danger btn-sm" type="button" data-act="release-yes" data-uid="${uid}">Sim, liberar vaga</button><button class="btn btn-quiet btn-sm" type="button" data-act="release-no">Voltar</button></div></div>`;
        } else {
          acts = `<div class="btn-row">
            ${r.status !== "aprovada" ? `<button class="btn btn-ok btn-sm" type="button" data-act="approve" data-uid="${uid}">Aprovar ficha</button><button class="btn btn-ghost btn-sm" type="button" data-act="ajuste" data-uid="${uid}">Pedir ajustes</button>` : `<button class="btn btn-ghost btn-sm" type="button" data-act="back-analysis" data-uid="${uid}">Voltar para análise</button>`}
            <button class="btn btn-danger btn-sm" type="button" data-act="release" data-uid="${uid}">Liberar vaga</button></div>`;
        }
        detail = `<div class="q-detail">
          <span class="meter-txt">Reservada ${esc(ago(r.criadoEm))}${r.atualizadoEm ? " · ficha atualizada " + esc(ago(r.atualizadoEm)) : ""}${p.email ? " · " + esc(p.email) : ""}</span>
          ${r.notaMestre && r.status === "recusada" ? `<div class="callout"><b>Seu recado</b>${esc(r.notaMestre)}</div>` : ""}
          ${fichaView(r.ficha)}
          ${sec ? `<div class="secret"><b>Segredo do personagem</b>${esc(sec)}</div>` : ""}
          ${acts}
        </div>`;
      }
      return `<div class="q-item" style="--fac:${s.cor}">
        <button class="q-row" type="button" data-act="q-toggle" data-uid="${uid}" aria-expanded="${open}">
          <span class="q-main"><b>${esc((r.ficha && r.ficha.nome && r.status !== "aprovada" ? r.ficha.nome + " · " + (s.indep ? s.nome : s.papel) : titleLine(s, r)))}</b><small>${esc(r.jogador || "Jogador")}${esc(contato)}${dl ? " · " + esc(dl.txt) : ""}</small></span>
          <span class="pill ${cls}">${lbl}</span>
        </button>${detail}</div>`;
    }).join("");

    return `<div class="panel" style="display:grid;gap:18px">
      <div class="sub-head" style="margin:0"><h3>Painel do mestre</h3><span class="eyebrow">${SLOTS.length} vagas</span></div>
      <div class="kpis">
        <div class="kpi" style="color:var(--mint)"><b style="color:var(--ink)">${all.livre}</b><span>Disponíveis</span></div>
        <div class="kpi" style="color:var(--amber)"><b style="color:var(--ink)">${all.reservada}</b><span>Reservadas</span></div>
        <div class="kpi" style="color:var(--lilac)"><b style="color:var(--ink)">${all.analise}</b><span>Em análise</span></div>
        <div class="kpi" style="color:var(--ink-3)"><b style="color:var(--ink)">${all.ocupada}</b><span>Aprovadas</span></div>
      </div>
      ${meter(all, true)}
      <div class="seg" role="group" aria-label="Filtrar fichas">${seg}</div>
      <div class="queue">${items || `<p class="muted" style="margin:0">Nada por aqui.</p>`}</div>
    </div>`;
  }

  function configHTML() {
    const c = data().config || {};
    const p = data().privado || {};
    return `<div class="grid g2">
      <form id="f-config" class="form panel" novalidate>
        <div class="sub-head" style="margin:0"><h3>Avisos</h3></div>
        <div class="field"><label for="cf-aviso">Aviso na página inicial <span class="hint">deixe vazio para esconder</span></label><textarea class="textarea" id="cf-aviso" maxlength="2000">${esc(c.aviso || "")}</textarea></div>
        <label class="switch" for="cf-abertas"><input type="checkbox" id="cf-abertas"${c.inscricoesAbertas !== false ? " checked" : ""}>Inscrições abertas</label>
        <div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar avisos</button></div>
      </form>
      <form id="f-privado" class="form panel" novalidate>
        <div class="sub-head" style="margin:0"><h3>Links dos grupos</h3><span class="eyebrow">Só jogadores aprovados veem</span></div>
        <div class="field"><label for="cp-grupo">Grupo principal (ON)</label><input class="input" id="cp-grupo" type="url" maxlength="500" value="${esc(p.linkGrupo || "")}" placeholder="https://chat.whatsapp.com/..."></div>
        <div class="field"><label for="cp-off">Grupo OFF</label><input class="input" id="cp-off" type="url" maxlength="500" value="${esc(p.linkOff || "")}" placeholder="https://chat.whatsapp.com/..."></div>
        <div class="btn-row"><button class="btn btn-primary btn-sm" type="submit">Salvar links</button></div>
      </form>
    </div>
    ${B.mode === "demo" ? `<div style="margin-top:14px"><button class="btn btn-quiet btn-sm" type="button" data-act="reset-demo">Restaurar dados de exemplo</button></div>` : ""}`;
  }

  function renderPainel(force) {
    const u = me();
    const key = u ? u.uid : null;
    if (ui.shellFor !== key || force) {
      view.innerHTML = painelShell(u);
      ui.shellFor = key; ui.sig = {};
    }
    const pn = $("#pn");
    if (!pn) return;
    if (!u) {
      const sig = ui.pnTab + "|" + ui.pendingSlot + "|" + (B.loadError || "");
      if (ui.sig.auth !== sig) { pn.innerHTML = authHTML(); ui.sig.auth = sig; }
      return;
    }
    if ($("#pn-me") && !!$("#pn-admin") !== !!u.isAdmin) { pn.innerHTML = ""; ui.sig = {}; }
    if (!$("#pn-me")) {
      pn.innerHTML = `<div id="pn-account"></div><div id="pn-me"></div>${u.isAdmin ? `<div id="pn-admin"></div><div id="pn-config"></div>` : ""}`;
    }
    const r = myRes();
    const sA = JSON.stringify([u.nick, u.contato, u.email, u.isAdmin, u.emailVerified, ui.editProfile]);
    if (ui.sig.acc !== sA) { $("#pn-account").innerHTML = accountHTML(u); ui.sig.acc = sA; }

    const sM = JSON.stringify([r && r.slotId, r && r.status, r && r.notaMestre, r && r.status === "aprovada" ? r.ficha : null,
      data().privado, ui.confirmCancel, ui.pendingSlot, ui.pendingSlot ? slotState(ui.pendingSlot).st : null, inscricoesAbertas(), u.nick]);
    if (ui.sig.me !== sM) { $("#pn-me").innerHTML = meHTML(u); ui.sig.me = sM; }

    if (u.isAdmin && $("#pn-admin")) {
      const box = $("#pn-admin");
      const typing = box.contains(document.activeElement) && /^(TEXTAREA|INPUT)$/.test(document.activeElement.tagName);
      const sAd = JSON.stringify([data().reservas, data().perfis, data().segredos, data().vagas, ui.adminFiltro, ui.expanded, ui.ajusteFor, ui.confirmRelease]);
      if (ui.sig.admin !== sAd) {
        if (typing) ui.pendingAdmin = true;
        else { box.innerHTML = adminHTML(); ui.sig.admin = sAd; ui.pendingAdmin = false; }
      }
      const cbox = $("#pn-config");
      const sC = JSON.stringify([data().config, data().privado]);
      const cTyping = cbox.contains(document.activeElement);
      if (ui.sig.cfg !== sC && !(ui.cfgDirty || cTyping)) { cbox.innerHTML = configHTML(); ui.sig.cfg = sC; }
    }
  }

  /* ---------------- modal ---------------- */
  function renderModal() {
    const m = $("#modal");
    const id = ui.openSlot;
    if (!id || !SLOT[id]) { m.hidden = true; m.innerHTML = ""; document.documentElement.style.overflow = ""; return; }
    const s = SLOT[id];
    const f = FAC[s.faccao];
    const st = slotState(id);
    const r = st.r;
    const [lbl, cls] = PUB[st.st];
    const u = me();
    const mine = u && st.uid === u.uid;
    let info = "";
    if (st.st === "ocupada" && r) {
      info = `<div class="panel" style="padding:18px"><div class="sub-head" style="margin:0 0 12px"><h3>Ficha</h3><span class="meter-txt">Jogador: ${esc(r.jogador)}</span></div>${fichaView(r.ficha)}</div>`;
    } else if (st.st !== "livre") {
      info = `<p class="muted" style="margin:0">${st.st === "analise" ? "Ficha em análise" : "Vaga reservada"}${r ? " · jogador: " + esc(r.jogador) : ""}.</p>`;
    }
    let act = "";
    if (mine) act = `<a class="btn btn-primary" href="#painel" data-act="modal-close">Abrir meu painel</a>`;
    else if (st.st === "livre") {
      act = ui.confirmSlot === id
        ? `<div class="confirm-box"><span>Reservar <b>${esc(s.nome)}</b>? Você terá ${D.rp.prazoFichaHoras} horas para enviar a ficha.</span><div class="btn-row"><button class="btn btn-primary btn-sm" type="button" data-act="reserve-confirm" data-slot="${id}">Confirmar reserva</button><button class="btn btn-quiet btn-sm" type="button" data-act="reserve-back">Voltar</button></div></div>`
        : (inscricoesAbertas() ? `<button class="btn btn-primary" type="button" data-act="reserve" data-slot="${id}">Reservar vaga</button>` : `<button class="btn btn-ghost" type="button" disabled>Inscrições fechadas</button>`);
    }
    m.innerHTML = `<div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-t" style="--fac:${s.cor}">
      <div class="modal-close"><button type="button" data-act="modal-close" aria-label="Fechar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <div class="modal-top">${slotImg(s, st.st, r)}<div style="display:grid;gap:6px;min-width:0;padding-bottom:4px">
        <span class="slot-role">${esc(f.nome)}</span>
        <h2 id="modal-t" class="slot-name" style="font-size:24px">${esc(displayName(s, r))}</h2>
        <span class="meter-txt">${esc(s.papel)}</span>
        <span><span class="pill ${cls}">${lbl}</span></span>
      </div></div>
      <div class="modal-body">
        <p style="margin:0;color:var(--ink-2)">${esc(s.desc)}</p>
        ${s.nota ? `<p class="meter-txt" style="margin:0">${esc(s.nota)}</p>` : ""}
        ${info}
        ${act ? `<div class="btn-row">${act}</div>` : ""}
      </div></div>`;
    m.hidden = false;
    document.documentElement.style.overflow = "hidden";
  }

  /* ---------------- lightbox ---------------- */
  let lbReturn = null;
  function openLightbox(src, cap, from) {
    const lb = $("#lightbox");
    lbReturn = from || null;
    lb.innerHTML = `<button class="lb-close" type="button" data-act="lb-close" aria-label="Fechar foto"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <figure class="lb-fig"><img src="${esc(src)}" alt="${esc(cap)}">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
    lb.hidden = false;
    document.documentElement.style.overflow = "hidden";
    const c = lb.querySelector(".lb-close"); if (c) c.focus();
  }
  function closeLightbox() {
    const lb = $("#lightbox");
    if (lb.hidden) return;
    lb.hidden = true; lb.innerHTML = "";
    if (!ui.openSlot && $("#drawer").hidden) document.documentElement.style.overflow = "";
    if (lbReturn && document.body.contains(lbReturn)) { try { lbReturn.focus({ preventScroll: true }); } catch (e) {} }
    lbReturn = null;
  }

  /* ---------------- chrome ---------------- */
  function updateChrome() {
    const page = ui.page;
    const u = me();
    $("#nav").innerHTML = NAV.map(([k, n]) => `<a href="#${k}"${k === page ? ' aria-current="page"' : ""}>${n}</a>`).join("");
    $("#foot-links").innerHTML = NAV.map(([k, n]) => `<a href="#${k}">${n}</a>`).join("");
    $("#auth-slot").innerHTML = u
      ? `<a class="chip-user" href="#painel" aria-label="Seu painel"><span class="avatar">${initials(u.nick || u.email)}</span><span>${esc(u.nick || "Painel")}</span></a>`
      : `<a class="btn btn-ghost btn-sm" href="#painel">Entrar</a>`;
    $("#demo-bar").hidden = B.mode !== "demo";
    $("#foot-meta").textContent = "Miami, 2026 · " + D.faccoes.length + " facções · " + SLOTS.length + " vagas · área 305";
    if (!$("#drawer").hidden) renderDrawer();
  }
  function renderDrawer() {
    const d = $("#drawer");
    d.innerHTML = `<div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
      <button class="btn btn-ghost btn-sm drawer-close" type="button" data-act="drawer-close">Fechar</button>
      ${NAV.map(([k, n], i) => `<a href="#${k}" data-act="drawer-close"${k === ui.page ? ' aria-current="page"' : ""}>${n}<small>${String(i + 1).padStart(2, "0")}</small></a>`).join("")}
    </div>`;
  }
  function openDrawer(open) {
    const d = $("#drawer");
    if (open) { renderDrawer(); d.hidden = false; $("#menu-btn").setAttribute("aria-expanded", "true"); document.documentElement.style.overflow = "hidden"; const f = d.querySelector("a"); if (f) f.focus(); }
    else { d.hidden = true; $("#menu-btn").setAttribute("aria-expanded", "false"); if (!ui.openSlot) document.documentElement.style.overflow = ""; }
  }

  /* ---------------- router ---------------- */
  const VIEWS = { inicio: viewInicio, cidade: viewCidade, faccoes: viewFaccoes, locais: viewLocais, elenco: viewElenco, regras: viewRegras };
  function parseRoute() {
    const h = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (FAC[h]) return { page: "faccoes", anchor: h };
    if (h.indexOf("loc-") === 0) return { page: "locais", anchor: h };
    if (VIEWS[h] || h === "painel") return { page: h };
    return { page: "inicio" };
  }
  function scrollToAnchor(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ block: "start" });
  }
  function navigate() {
    const r = parseRoute();
    const changed = r.page !== ui.page;
    ui.page = r.page;
    ui.confirmSlot = null; ui.confirmProf = null;
    if (changed || r.page !== "faccoes") {
      if (r.page === "painel") { ui.shellFor = undefined; renderPainel(true); }
      else view.innerHTML = VIEWS[r.page]();
      if (!r.anchor) window.scrollTo(0, 0);
      try { view.focus({ preventScroll: true }); } catch (e) {}
    }
    updateChrome();
    if (r.anchor) requestAnimationFrame(() => scrollToAnchor(r.anchor));
  }
  let liveQueued = false;
  function live() {
    if (liveQueued) return;
    liveQueued = true;
    requestAnimationFrame(() => {
      liveQueued = false;
      if (!ui.page) return;
      if (ui.page === "painel") renderPainel(false);
      else {
        const y = window.scrollY;
        view.innerHTML = VIEWS[ui.page]();
        window.scrollTo(0, y);
      }
      if (ui.openSlot) renderModal();
      updateChrome();
    });
  }

  /* ---------------- actions ---------------- */
  function startReserve(id) {
    const u = me();
    if (!u) { ui.pendingSlot = id; ui.pnTab = "criar"; ui.openSlot = null; renderModal(); location.hash = "painel"; toast("Entre ou crie uma conta para reservar."); return; }
    if (myRes()) { toast("Você já tem uma vaga reservada. Cancele a atual no Painel para trocar.", true); return; }
    ui.confirmSlot = id; live();
  }
  function startReserveProf(pid) {
    const fs = freeSlotOf(pid);
    if (!fs) { toast("Não há vagas livres nessa profissão.", true); return; }
    if (!me()) { startReserve(fs.id); return; }
    if (myRes()) { toast("Você já tem uma vaga reservada. Cancele a atual no Painel para trocar.", true); return; }
    ui.confirmProf = pid; live();
  }
  async function confirmReserve(id) {
    const ok = await run(() => B.reserve(id), "Vaga reservada! Agora preencha sua ficha.");
    ui.confirmSlot = null; ui.pendingSlot = null;
    if (ok) { ui.openSlot = null; renderModal(); if (ui.page === "painel") renderPainel(true); else location.hash = "painel"; }
    else live();
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act]");
    if (!t) {
      if (e.target.id === "lightbox" || (e.target.closest && e.target.closest(".lb-fig") && e.target.tagName !== "IMG")) { closeLightbox(); return; }
      if (e.target.id === "modal") { ui.openSlot = null; ui.confirmSlot = null; renderModal(); }
      else if (e.target.id === "drawer") openDrawer(false);
      return;
    }
    const act = t.dataset.act, val = t.dataset.val, slot = t.dataset.slot, uid = t.dataset.uid;
    switch (act) {
      case "drawer-close": openDrawer(false); break;
      case "zoom": openLightbox(t.dataset.src, t.dataset.cap, t); break;
      case "lb-close": closeLightbox(); break;
      case "reserve": startReserve(slot); break;
      case "reserve-back": ui.confirmSlot = null; live(); break;
      case "prof-reserve": startReserveProf(val); break;
      case "prof-back": ui.confirmProf = null; live(); break;
      case "prof-confirm": {
        const fs = freeSlotOf(val);
        ui.confirmProf = null;
        if (fs) confirmReserve(fs.id); else { toast("As vagas dessa profissão acabaram de ser preenchidas.", true); live(); }
        break;
      }
      case "reserve-confirm": confirmReserve(slot); break;
      case "open": ui.openSlot = slot; ui.confirmSlot = null; renderModal(); break;
      case "modal-close": ui.openSlot = null; ui.confirmSlot = null; renderModal(); break;
      case "filter-fac": ui.filtroFac = val; live(); break;
      case "filter-st": ui.filtroSt = val; live(); break;
      case "filter-reset": ui.filtroFac = "todas"; ui.filtroSt = "todas"; live(); break;
      case "pn-tab": ui.pnTab = val; renderPainel(false); break;
      case "demo-login": run(() => B.demoLogin(val)); break;
      case "logout": ui.editProfile = false; ui.confirmCancel = false; run(() => B.signOut(), "Você saiu da conta."); break;
      case "verify-send": run(() => B.sendVerification(), "E-mail de confirmação enviado. Confira também o spam."); break;
      case "verify-check": run(() => B.checkVerification(), "E-mail confirmado."); break;
      case "edit-profile": ui.editProfile = !ui.editProfile; renderPainel(false); break;
      case "cancel-res": ui.confirmCancel = true; renderPainel(false); break;
      case "cancel-no": ui.confirmCancel = false; renderPainel(false); break;
      case "cancel-yes": ui.confirmCancel = false; run(() => B.cancel(), "Reserva cancelada. A vaga está livre de novo."); break;
      case "pending-confirm": if (ui.pendingSlot) confirmReserve(ui.pendingSlot); break;
      case "pending-clear": ui.pendingSlot = null; location.hash = "elenco"; break;
      case "q-filter": ui.adminFiltro = val; ui.ajusteFor = null; ui.confirmRelease = null; renderPainel(false); break;
      case "q-toggle": ui.expanded[uid] = !ui.expanded[uid]; ui.ajusteFor = null; ui.confirmRelease = null; renderPainel(false); break;
      case "approve": run(() => B.admin.setStatus(uid, "aprovada", ""), "Ficha aprovada."); break;
      case "back-analysis": run(() => B.admin.setStatus(uid, "ficha_enviada", ""), "Ficha voltou para análise."); break;
      case "ajuste": ui.ajusteFor = uid; ui.confirmRelease = null; renderPainel(false); setTimeout(() => { const x = $("#aj-" + uid); if (x) x.focus(); }, 0); break;
      case "ajuste-back": ui.ajusteFor = null; renderPainel(false); break;
      case "ajuste-send": {
        const nota = ($("#aj-" + uid) || {}).value || "";
        if (!nota.trim()) { toast("Escreva o que o jogador precisa ajustar.", true); break; }
        ui.ajusteFor = null;
        if (document.activeElement) document.activeElement.blur();
        run(() => B.admin.setStatus(uid, "recusada", nota), "Recado enviado ao jogador.");
        break;
      }
      case "release": ui.confirmRelease = uid; ui.ajusteFor = null; renderPainel(false); break;
      case "release-no": ui.confirmRelease = null; renderPainel(false); break;
      case "release-yes": ui.confirmRelease = null; delete ui.expanded[uid]; run(() => B.admin.release(uid), "Vaga liberada."); break;
      case "copy": {
        const txt = val || "";
        const done = () => toast("Link copiado.");
        const fallback = () => { const code = t.parentElement && t.parentElement.querySelector("code"); if (code) { const rg = document.createRange(); rg.selectNodeContents(code); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(rg); } toast("Selecionei o link. Copie com o menu do aparelho."); };
        try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (err) { fallback(); }
        break;
      }
      case "reset-demo": if (B.resetDemo) { ui.expanded = {}; ui.cfgDirty = false; run(() => B.resetDemo(), "Dados de exemplo restaurados."); } break;
    }
  });

  $("#menu-btn").addEventListener("click", () => openDrawer($("#drawer").hidden));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("#lightbox").hidden) { closeLightbox(); return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.dataset && e.target.dataset.act === "zoom") { e.preventDefault(); openLightbox(e.target.dataset.src, e.target.dataset.cap, e.target); return; }
    if (e.key === "Escape") {
      if (ui.openSlot) { ui.openSlot = null; ui.confirmSlot = null; renderModal(); }
      else if (!$("#drawer").hidden) openDrawer(false);
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("pin")) { e.preventDefault(); flashLoc(e.target.dataset.loc); }
  });
  document.addEventListener("click", (e) => {
    const pin = e.target.closest && e.target.closest(".pin");
    if (pin) flashLoc(pin.dataset.loc);
  });
  function flashLoc(id) {
    const el = document.getElementById("loc-" + id);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    el.classList.add("flash");
    setTimeout(() => el.classList.remove("flash"), 1800);
  }

  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && t.dataset && t.dataset.fallback) {
      const w = t.parentElement;
      if (w) { w.removeAttribute("data-act"); w.removeAttribute("role"); w.removeAttribute("tabindex"); const zb = w.querySelector(".zoom-badge"); if (zb) zb.remove(); }
      t.remove();
    }
  }, true);

  document.addEventListener("input", (e) => {
    if (e.target.closest && e.target.closest("#f-config, #f-privado")) ui.cfgDirty = true;
  });
  document.addEventListener("focusout", (e) => {
    if (ui.pendingAdmin && e.target.closest && e.target.closest("#pn-admin")) setTimeout(() => { if (ui.page === "painel") renderPainel(false); }, 0);
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("button[type=submit]");
    if (b) ui.submitter = b.value || null;
  }, true);

  document.addEventListener("submit", async (e) => {
    const f = e.target;
    if (!f.id) return;
    e.preventDefault();
    const v = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
    const btns = f.querySelectorAll("button");
    btns.forEach(b => { b.disabled = true; });
    const authErr = (msg) => { const m = $("#auth-msg"); if (m) { m.textContent = msg; m.hidden = false; } };
    try {
      if (f.id === "f-login") {
        await B.signIn(v("li-email"), v("li-pass"));
        toast("Bem-vindo de volta à Vice Coast.");
      } else if (f.id === "f-signup") {
        await B.signUp(v("su-email"), v("su-pass"), v("su-nick"), v("su-contato"));
        toast("Conta criada!");
      } else if (f.id === "f-reset") {
        await B.resetPassword(v("rp-email"));
        toast("Se existir uma conta com esse e-mail, o link já está a caminho.");
      } else if (f.id === "f-perfil") {
        await B.updateProfile({ nick: v("pf-nick"), contato: v("pf-contato") });
        ui.editProfile = false; ui.sig.acc = null; toast("Perfil salvo."); renderPainel(false);
      } else if (f.id === "f-ficha") {
        const enviar = (e.submitter ? e.submitter.value : ui.submitter) === "enviar";
        const ficha = {};
        ["nome", "idade", "ocupacao", "faceclaim", "imagem", "aparencia", "personalidade", "historia", "ganchos"].forEach(k => { ficha[k] = v("fc-" + k).trim(); });
        const msg = $("#ficha-msg");
        const problems = [];
        if (ficha.imagem && !validUrl(ficha.imagem)) problems.push("o link da imagem precisa começar com https://");
        if (ficha.idade && (isNaN(+ficha.idade) || +ficha.idade < 18)) problems.push("a idade precisa ser 18 ou mais");
        if (enviar) {
          if (!ficha.nome) problems.push("preencha o nome do personagem");
          if (!ficha.idade) problems.push("preencha a idade");
          if (!ficha.faceclaim) problems.push("informe o faceclaim");
          if (ficha.historia.length < 80) problems.push("escreva a história (pelo menos algumas linhas)");
        }
        if (problems.length) { msg.textContent = "Antes de " + (enviar ? "enviar" : "salvar") + ": " + problems.join("; ") + "."; msg.hidden = false; }
        else {
          msg.hidden = true;
          await B.saveFicha(ficha, enviar, v("fc-segredo"));
          toast(enviar ? "Ficha enviada ao mestre." : "Rascunho salvo.");
        }
      } else if (f.id === "f-config") {
        await B.admin.saveConfig({ aviso: v("cf-aviso"), inscricoesAbertas: $("#cf-abertas").checked });
        ui.cfgDirty = false; ui.sig.cfg = null; toast("Avisos salvos."); renderPainel(false);
      } else if (f.id === "f-privado") {
        const g = v("cp-grupo").trim(), o = v("cp-off").trim();
        if ((g && !validUrl(g)) || (o && !validUrl(o))) { toast("Os links precisam começar com https://", true); }
        else { await B.admin.savePrivate({ linkGrupo: g, linkOff: o }); ui.cfgDirty = false; ui.sig.cfg = null; toast("Links salvos."); renderPainel(false); }
      }
    } catch (err) {
      console.error(err);
      const m = (err && err.message) || "Algo deu errado. Tente de novo.";
      if (/^f-(login|signup|reset)$/.test(f.id)) authErr(m); else toast(m, true);
    } finally {
      btns.forEach(b => { if (document.body.contains(b)) b.disabled = false; });
    }
  });

  /* ---------------- boot ---------------- */
  window.addEventListener("hashchange", navigate);
  B.onAuth(() => {
    if (me() && ui.page === "painel" && ui.pendingSlot && myRes()) ui.pendingSlot = null;
    live();
  });
  B.onData(() => live());
  Promise.resolve(B.ready).then(() => { if (!ui.page) navigate(); else live(); });
  setTimeout(() => { if (!ui.page) navigate(); }, 4000);
})();
