(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const KEY = "mova.workspace.v1";
  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    "check-circle": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    columns:
      '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1 .6-1.7 1-1.7 2.2M12 17h.01"/>',
    moon: '<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
    settings:
      '<path d="m9 3-.5 3-2 1L4 6l-2 3 2 2v2l-2 2 2 3 2.5-1 2 1 .5 3h4l.5-3 2-1 2.5 1 2-3-2-2v-2l2-2-2-3-2.5 1-2-1-.5-3z"/><circle cx="11" cy="12" r="3"/>',
    x: '<path d="m6 6 12 12M6 18 18 6"/>',
    "arrow-right": '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
    "check-square":
      '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m7 12 3 3 7-7"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  };
  const icon = (name) =>
    `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.grid}</svg>`;
  $$("[data-icon]").forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    `m${Date.now()}${Math.random().toString(36).slice(2)}`;
  const today = new Date();
  const dateAt = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const columns = [
    {
      id: "backlog",
      title: "Fikirler",
      subtitle: "Her şey bir fikirle başlar",
    },
    { id: "todo", title: "Yapılacak", subtitle: "Sıradaki küçük adımlar" },
    { id: "progress", title: "Devam ediyor", subtitle: "Güzel şeyler oluyor" },
    { id: "done", title: "Tamamlandı", subtitle: "Biraz da kutlama zamanı" },
  ];
  const priorities = { high: "Yüksek", medium: "Orta", low: "Düşük" };
  const makeTask = (id, title, status, tags, extras = {}) => ({
    id,
    title,
    status,
    tags,
    description: "",
    priority: "medium",
    date: "",
    assignee: "self",
    cover: "",
    checklist: [],
    ...extras,
  });
  const initialState = () => ({
    version: 1,
    activeBoard: "studio",
    theme: "light",
    boards: [
      {
        id: "studio",
        name: "Studio lansmanı",
        description: "Bir fikri, birlikte güzel bir şeye dönüştürelim.",
        color: "orange",
        tasks: [
          makeTask(
            "s1",
            "Markanın hikâyesini bulalım",
            "backlog",
            ["Strateji"],
            {
              description:
                "Neye inanıyoruz? Kimin hayatına dokunmak istiyoruz? Her şey buradan başlıyor.",
              priority: "low",
              assignee: "Deniz",
              date: dateAt(4),
            },
          ),
          makeTask("s2", "Biraz ilham, bolca keşif", "backlog", ["Tasarım"], {
            cover: "wave",
            description:
              "Renkler, dokular, tipografi. Bizi heyecanlandıran referansları bir araya getirelim.",
            assignee: "Ece",
            date: dateAt(5),
          }),
          makeTask("s3", "Küçük ama etkili fikirler", "backlog", ["İçerik"], {
            description:
              "Lansman haftası için alışılmışın dışında üç paylaşım fikri.",
            priority: "low",
            assignee: "none",
          }),
          makeTask("s4", "İlk izlenim her şeydir", "todo", ["Tasarım", "Web"], {
            cover: "orbit",
            description: "Yeni açılış sayfamızın görsel yönünü belirleyelim.",
            priority: "high",
            date: dateAt(1),
            checklist: [
              { id: "c1", text: "Ana mesajı netleştir", done: true },
              { id: "c2", text: "İlk ekranı tasarla", done: false },
              { id: "c3", text: "Mobil düzeni düşün", done: false },
            ],
          }),
          makeTask("s5", "Kelimeler de tasarımın parçası", "todo", ["İçerik"], {
            description:
              "Başlıklar kısa, mesajlar net, sesimiz bize ait olsun.",
            assignee: "Deniz",
            date: dateAt(3),
          }),
          makeTask("s6", "Her ekranda iyi hissettirsin", "todo", ["Web"], {
            description: "Telefon, tablet, masaüstü. Her boyutta aynı özen.",
            priority: "low",
            assignee: "Can",
            date: dateAt(6),
          }),
          makeTask(
            "s7",
            "Tasarım sistemine son dokunuşlar",
            "progress",
            ["Tasarım"],
            {
              description: "Tutarlı bileşenler, daha akıcı bir deneyim.",
              priority: "high",
              date: dateAt(0),
              checklist: [
                { id: "c4", text: "Renk paleti ve tipografi", done: true },
                { id: "c5", text: "Buton ve form bileşenleri", done: true },
                { id: "c6", text: "Durumlar ve etkileşimler", done: false },
              ],
            },
          ),
          makeTask("s8", "Birlikte büyüyen bir kimlik", "progress", ["Marka"], {
            cover: "garden",
            description: "Sade, esnek ve bize ait bir görsel dil.",
            assignee: "Ece",
            date: dateAt(2),
          }),
          makeTask(
            "s9",
            "İlk prototipi hayata geçir",
            "progress",
            ["Web", "Ürün"],
            {
              description: "Fikri tıklanabilir bir deneyime dönüştürme zamanı.",
              assignee: "Can",
              date: dateAt(2),
            },
          ),
          makeTask("s10", "Güzel bir başlangıç yaptık", "done", ["Strateji"], {
            description:
              "Projenin amacı, kapsamı ve ilk adımları belli. Artık yoldayız.",
            priority: "low",
            date: dateAt(-2),
            checklist: [
              { id: "c7", text: "Proje çerçevesini oluştur", done: true },
              { id: "c8", text: "İlk hedefleri belirle", done: true },
            ],
          }),
          makeTask("s11", "İhtiyaçları dinledik", "done", ["Araştırma"], {
            description:
              "Kısa görüşmeler, değerli notlar. İnsanları merkeze aldık.",
            assignee: "Deniz",
            date: dateAt(-1),
          }),
          makeTask("s12", "Herkes aynı sayfada", "done", ["Ürün"], {
            description: "İlk yol haritası hazır. Şimdi adım adım ilerleyelim.",
            priority: "low",
            assignee: "self",
            date: dateAt(-1),
          }),
        ],
      },
      {
        id: "personal",
        name: "Hayatın küçük işleri",
        description: "Kendine zaman ayır, küçük hedeflere yer aç.",
        color: "purple",
        tasks: [
          makeTask("p1", "Yeni bir şey öğren", "backlog", ["Kişisel"], {
            description:
              "Aklındaki o kurs, kitap ya da yeni hobi için küçük bir başlangıç.",
            cover: "wave",
            priority: "low",
          }),
          makeTask("p2", "Haftanın menüsünü planla", "todo", ["Yaşam"], {
            date: dateAt(2),
            checklist: [
              { id: "p2c1", text: "Buzdolabını kontrol et", done: false },
              { id: "p2c2", text: "Alışveriş listesini yaz", done: false },
            ],
          }),
          makeTask(
            "p3",
            "Portfolyoma bir proje ekle",
            "progress",
            ["Kişisel", "Web"],
            {
              description: "Yaptıklarını paylaşmanın zamanı.",
              priority: "high",
              date: dateAt(4),
              cover: "orbit",
            },
          ),
          makeTask("p4", "Çalışma alanını sadeleştir", "done", ["Yaşam"], {
            description: "Daha az eşya, daha çok odak.",
            priority: "low",
            cover: "garden",
          }),
        ],
      },
    ],
  });
  function validState(s) {
    if (
      !s ||
      s.version !== 1 ||
      !Array.isArray(s.boards) ||
      !s.boards.length ||
      s.boards.length > 100
    )
      return false;
    const boardIds = new Set();
    for (const b of s.boards) {
      if (
        !b ||
        typeof b.id !== "string" ||
        !b.id ||
        boardIds.has(b.id) ||
        typeof b.name !== "string" ||
        !b.name.trim() ||
        b.name.length > 70 ||
        typeof b.description !== "string" ||
        b.description.length > 200 ||
        !["orange", "purple", "green", "blue"].includes(b.color) ||
        !Array.isArray(b.tasks) ||
        b.tasks.length > 5000
      )
        return false;
      boardIds.add(b.id);
      const taskIds = new Set();
      for (const t of b.tasks) {
        if (
          !t ||
          typeof t.id !== "string" ||
          !t.id ||
          taskIds.has(t.id) ||
          typeof t.title !== "string" ||
          !t.title.trim() ||
          t.title.length > 160 ||
          typeof t.description !== "string" ||
          t.description.length > 5000 ||
          !columns.some((c) => c.id === t.status) ||
          !Object.hasOwn(priorities, t.priority) ||
          !["self", "none", "Deniz", "Ece", "Can"].includes(t.assignee) ||
          !["", "orbit", "wave", "garden"].includes(t.cover) ||
          typeof t.date !== "string" ||
          (t.date !== "" &&
            (!/^\d{4}-\d{2}-\d{2}$/.test(t.date) ||
              Number.isNaN(new Date(t.date + "T12:00:00").getTime()))) ||
          !Array.isArray(t.tags) ||
          t.tags.length > 20 ||
          !t.tags.every(
            (tag) => typeof tag === "string" && tag.length <= 160,
          ) ||
          !Array.isArray(t.checklist) ||
          t.checklist.length > 100
        )
          return false;
        taskIds.add(t.id);
        const checkIds = new Set();
        for (const c of t.checklist) {
          if (
            !c ||
            typeof c.id !== "string" ||
            !c.id ||
            checkIds.has(c.id) ||
            typeof c.text !== "string" ||
            c.text.length > 200 ||
            typeof c.done !== "boolean"
          )
            return false;
          checkIds.add(c.id);
        }
      }
    }
    return boardIds.has(s.activeBoard) && ["light", "dark"].includes(s.theme);
  }
  let state,
    startupWarning = "";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) {
      state = JSON.parse(saved);
      if (!validState(state)) throw new Error("invalid");
    } else state = initialState();
  } catch {
    state = initialState();
    startupWarning =
      "Kayıt okunamadı. Örnek pano açıldı; varsa JSON yedeğini kısa tur bölümünden yükleyebilirsin.";
  }
  let view = "board",
    query = "",
    priorityFilter = "all",
    tagFilter = "all",
    assignedOnly = false,
    draftChecklist = [],
    draggedId = null,
    toastTimer;
  const currentBoard = () =>
    state.boards.find((b) => b.id === state.activeBoard);
  const normal = (s) => s.toLocaleLowerCase("tr-TR");
  const filteredTasks = () =>
    currentBoard().tasks.filter(
      (t) =>
        (!query ||
          normal(`${t.title} ${t.description} ${t.tags.join(" ")}`).includes(
            normal(query),
          )) &&
        (priorityFilter === "all" || t.priority === priorityFilter) &&
        (tagFilter === "all" || t.tags.includes(tagFilter)) &&
        (!assignedOnly || t.assignee === "self"),
    );
  function toast(message) {
    $("#toast").textContent = message;
    $("#toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(
      () => $("#toast").classList.remove("visible"),
      4200,
    );
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      $("#save-status").textContent = "Değişiklikler kayıtlı";
      return true;
    } catch {
      $("#save-status").textContent = "Kayıt yapılamadı";
      toast(
        "Tarayıcıya kaydedilemedi. Verilerini üstteki indirme düğmesiyle yedekle.",
      );
      return false;
    }
  }
  const taskById = (id) => currentBoard().tasks.find((t) => t.id === id);
  const tagColors = {
    Tasarım: "purple",
    Web: "blue",
    İçerik: "orange",
    Strateji: "green",
    Marka: "pink",
    Ürün: "blue",
    Araştırma: "green",
    Kişisel: "purple",
    Yaşam: "green",
  };
  const tagMarkup = (tag) =>
    `<span class="tag ${tagColors[tag] || ["green", "blue", "orange", "purple"][tag.length % 4]}">${esc(tag)}</span>`;
  function avatar(t) {
    return t.assignee === "none"
      ? '<span class="avatar" title="Atanmamış">–</span>'
      : `<span class="avatar ${t.assignee === "self" ? "self" : "person-" + normal(t.assignee)}" title="${t.assignee === "self" ? "Sen" : esc(t.assignee) + " · örnek kişi"}">${t.assignee === "self" ? "S" : esc(t.assignee[0])}</span>`;
  }
  function dateMarkup(t) {
    if (!t.date) return "";
    const d = new Date(t.date + "T12:00:00");
    const text =
      t.date === dateAt(0)
        ? "Bugün"
        : new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "short",
          }).format(d);
    return `<span class="date ${t.status !== "done" && t.date < dateAt(0) ? "overdue" : ""}">${icon("calendar")}${esc(text)}</span>`;
  }
  function priorityMark(t) {
    return `<span class="priority-mark ${t.priority}" title="${priorities[t.priority]} öncelik" aria-label="${priorities[t.priority]} öncelik"><i></i><i></i><i></i></span>`;
  }
  function coverMarkup(t) {
    if (!t.cover) return "";
    return `<div class="card-cover ${t.cover}" aria-hidden="true">${t.cover === "orbit" ? '<span class="orbit-shape"></span><span class="cover-label">MAKE IT HAPPEN</span>' : t.cover === "wave" ? '<i class="wave-piece"></i>'.repeat(5) + '<span class="cover-label">FIND YOUR FLOW</span>' : '<span class="garden-sun"></span><span class="garden-stem"></span><span class="cover-label">ROOM TO GROW</span>'}</div>`;
  }
  function taskMarkup(t) {
    const done = t.checklist.filter((c) => c.done).length;
    return `<article class="task-card" tabindex="0" draggable="true" data-task="${esc(t.id)}" aria-label="${esc(t.title)}. Detayları açmak için Enter tuşuna bas.">${coverMarkup(t)}<div class="card-labels">${t.tags.map(tagMarkup).join("")}</div><span class="card-menu" aria-hidden="true">···</span><h3>${esc(t.title)}</h3>${t.description ? `<p class="card-description">${esc(t.description)}</p>` : ""}${
      t.checklist.length
        ? `<div class="card-checklist">${t.checklist
            .slice(0, 3)
            .map(
              (c) =>
                `<label class="card-check-item ${c.done ? "checked" : ""}"><input type="checkbox" data-check="${esc(c.id)}" data-owner="${esc(t.id)}" ${c.done ? "checked" : ""}><span>${esc(c.text)}</span></label>`,
            )
            .join(
              "",
            )}${t.checklist.length > 3 ? `<span class="card-check-item">+${t.checklist.length - 3} adım daha</span>` : ""}</div>`
        : ""
    }<div class="card-bottom">${priorityMark(t)}${dateMarkup(t)}${t.checklist.length ? `<span class="check-count" aria-label="${t.checklist.length} adımdan ${done} tamamlandı">${icon("check-square")}${done}/${t.checklist.length}</span>` : ""}${avatar(t)}</div></article>`;
  }
  function render() {
    const board = currentBoard();
    if (
      tagFilter !== "all" &&
      !board.tasks.some((t) => t.tags.includes(tagFilter))
    )
      tagFilter = "all";
    const tasks = filteredTasks();
    document.title = `${board.name} · Mova`;
    $("#board-title").innerHTML =
      esc(board.name) + '<span class="title-dot">.</span>';
    $("#breadcrumb-board").textContent = board.name;
    $("#board-description").textContent =
      board.description || "Fikirlerine alan aç. Kendi hızında ilerle.";
    $("#board-count").textContent = state.boards.length;
    $("#board-nav").innerHTML = state.boards
      .map(
        (b) =>
          `<button data-board="${esc(b.id)}" class="${b.id === state.activeBoard ? "active" : ""}" ${b.id === state.activeBoard ? 'aria-current="page"' : ""}><span class="board-dot ${b.color}"></span><span>${esc(b.name)}</span><span class="board-nav-count">${b.tasks.length}</span></button>`,
      )
      .join("");
    const complete = board.tasks.filter((t) => t.status === "done").length,
      percent = board.tasks.length
        ? Math.round((complete / board.tasks.length) * 100)
        : 0;
    $("#task-total").textContent = `${board.tasks.length} görev`;
    $("#progress-bar").style.width = percent + "%";
    $("#progress-label").textContent = `%${percent} tamamlandı`;
    $("#all-tasks").classList.toggle("active", !assignedOnly);
    $("#my-tasks").classList.toggle("active", assignedOnly);
    $("#assigned-banner").hidden = !assignedOnly;
    $("#board").hidden = view !== "board";
    $("#list-view").hidden = view !== "list";
    $$(".view-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.view === view);
      b.setAttribute("aria-pressed", String(b.dataset.view === view));
    });
    $("#board").innerHTML = columns
      .map(
        (c) =>
          `<div class="column" data-column="${c.id}"><div class="column-header"><span class="status-dot ${c.id}"></span><h2>${c.title}</h2><span class="column-count">${tasks.filter((t) => t.status === c.id).length}</span><button class="icon-button" data-add="${c.id}" aria-label="${c.title} sütununa görev ekle">${icon("plus")}</button></div><span class="column-subtitle">${c.subtitle}</span><div class="cards">${
            tasks
              .filter((t) => t.status === c.id)
              .map(taskMarkup)
              .join("") ||
            '<div class="empty-column">' +
              (query ||
              priorityFilter !== "all" ||
              tagFilter !== "all" ||
              assignedOnly
                ? "Eşleşen görev yok."
                : "Bir sonraki adımına<br>burada yer var.") +
              "</div>"
          }</div><button class="add-card" data-add="${c.id}">${icon("plus")}Görev ekle</button></div>`,
      )
      .join("");
    $("#list-view").innerHTML =
      `<div class="list-row list-head"><span>Görev</span><span>Durum</span><span>Öncelik</span><span>Tarih</span><span>Kişi</span></div>` +
      tasks
        .map(
          (t) =>
            `<div class="list-row" data-task="${esc(t.id)}" tabindex="0" role="button" aria-label="${esc(t.title)} detaylarını aç"><span class="list-title"><span class="status-dot ${t.status}"></span><strong>${esc(t.title)}</strong></span><span class="list-status">${columns.find((c) => c.id === t.status).title}</span><span class="priority-label">${priorityMark(t)}${priorities[t.priority]}</span><span>${dateMarkup(t) || "—"}</span>${avatar(t)}</div>`,
        )
        .join("") +
      (tasks.length
        ? ""
        : '<div class="empty-column">Eşleşen görev yok. Yeni bir görev ekleyebilir veya filtrelerini değiştirebilirsin.</div>');
    const tags = [...new Set(board.tasks.flatMap((t) => t.tags))].sort((a, b) =>
      a.localeCompare(b, "tr"),
    );
    if (tagFilter !== "all" && !tags.includes(tagFilter)) tagFilter = "all";
    $("#tag-filter").innerHTML =
      '<option value="all">Tüm etiketler</option>' +
      tags
        .map((tag) => `<option value="${esc(tag)}">${esc(tag)}</option>`)
        .join("");
    $("#tag-filter").value = tagFilter;
    const filterCount =
      Number(priorityFilter !== "all") + Number(tagFilter !== "all");
    $("#filter-count").textContent = filterCount ? String(filterCount) : "";
    $("#filter-toggle").classList.toggle("active", filterCount > 0);
    $("#result-count").textContent = `${tasks.length} görev gösteriliyor`;
    document.body.classList.toggle("dark", state.theme === "dark");
    $("#theme-label").textContent =
      state.theme === "dark" ? "Açık görünüm" : "Koyu görünüm";
    $("#theme-toggle [data-icon]").innerHTML = icon(
      state.theme === "dark" ? "sun" : "moon",
    );
  }
  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#sidebar-scrim").classList.remove("visible");
    $("#mobile-menu").setAttribute("aria-expanded", "false");
  }
  function selectBoard(id) {
    state.activeBoard = id;
    query = "";
    priorityFilter = "all";
    tagFilter = "all";
    $("#search").value = "";
    $("#priority-filter").value = "all";
    save();
    render();
    closeSidebar();
  }
  $("#board-nav").addEventListener("click", (e) => {
    const b = e.target.closest("[data-board]");
    if (b) selectBoard(b.dataset.board);
  });
  $("#all-tasks").addEventListener("click", () => {
    assignedOnly = false;
    render();
  });
  $("#my-tasks").addEventListener("click", () => {
    assignedOnly = true;
    render();
  });
  $("#show-all").addEventListener("click", () => {
    assignedOnly = false;
    render();
  });
  $("#mobile-menu").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
    $("#sidebar-scrim").classList.toggle("visible");
    $("#mobile-menu").setAttribute(
      "aria-expanded",
      String($("#sidebar").classList.contains("open")),
    );
  });
  $("#sidebar-scrim").addEventListener("click", closeSidebar);
  $$(".view-tab").forEach((b) =>
    b.addEventListener("click", () => {
      view = b.dataset.view;
      render();
    }),
  );
  $("#search").addEventListener("input", (e) => {
    query = e.target.value.trim();
    render();
  });
  $("#priority-filter").addEventListener("change", (e) => {
    priorityFilter = e.target.value;
    render();
  });
  $("#tag-filter").addEventListener("change", (e) => {
    tagFilter = e.target.value;
    render();
  });
  $("#filter-toggle").addEventListener("click", () => {
    const panel = $("#filter-panel");
    panel.hidden = !panel.hidden;
    $("#filter-toggle").setAttribute("aria-expanded", String(!panel.hidden));
  });
  $("#clear-filters").addEventListener("click", () => {
    priorityFilter = "all";
    tagFilter = "all";
    $("#priority-filter").value = "all";
    render();
  });
  $("#theme-toggle").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    save();
    render();
  });
  $("#help").addEventListener("click", () => {
    closeSidebar();
    $("#help-dialog").showModal();
  });
  $("#workspace-info").addEventListener("click", () => {
    closeSidebar();
    $("#help-dialog").showModal();
  });
  function renderChecklist() {
    $("#checklist-items").innerHTML = draftChecklist
      .map(
        (c) =>
          `<div class="editor-check ${c.done ? "checked" : ""}"><input type="checkbox" data-draft-check="${esc(c.id)}" ${c.done ? "checked" : ""} aria-label="${esc(c.text)} tamamlandı"><span>${esc(c.text)}</span><button type="button" data-remove-check="${esc(c.id)}" aria-label="Adımı sil">×</button></div>`,
      )
      .join("");
    $("#checklist-progress").textContent = draftChecklist.length
      ? `${draftChecklist.filter((c) => c.done).length}/${draftChecklist.length}`
      : "";
  }
  function addChecklist() {
    const input = $("#checklist-input"),
      text = input.value.trim();
    if (!text) return;
    if (draftChecklist.length >= 100) {
      toast("En fazla 100 adım ekleyebilirsin.");
      return;
    }
    draftChecklist.push({ id: uid(), text, done: false });
    input.value = "";
    renderChecklist();
    input.focus();
  }
  $("#add-checklist-item").addEventListener("click", addChecklist);
  $("#checklist-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addChecklist();
    }
  });
  $("#checklist-items").addEventListener("change", (e) => {
    const id = e.target.dataset.draftCheck;
    if (id) {
      const c = draftChecklist.find((c) => c.id === id);
      c.done = e.target.checked;
      renderChecklist();
    }
  });
  $("#checklist-items").addEventListener("click", (e) => {
    const b = e.target.closest("[data-remove-check]");
    if (b) {
      draftChecklist = draftChecklist.filter(
        (c) => c.id !== b.dataset.removeCheck,
      );
      renderChecklist();
    }
  });
  function openTask(id = null, status = "backlog") {
    const t = id ? taskById(id) : null;
    if (id && !t) return;
    $("#task-form").reset();
    $("#task-id").value = t?.id || "";
    $("#task-title").value = t?.title || "";
    $("#task-description").value = t?.description || "";
    $("#task-status").value = t?.status || status;
    $("#task-priority").value = t?.priority || "medium";
    $("#task-date").value = t?.date || "";
    $("#task-assignee").value = t?.assignee || "self";
    $("#task-tags").value = t?.tags.join(", ") || "";
    $("#task-cover").value = t?.cover || "";
    draftChecklist = t ? structuredClone(t.checklist) : [];
    renderChecklist();
    $("#delete-task").hidden = !t;
    $("#task-dialog-eyebrow").textContent = t
      ? "BİR ADIM DAHA İLERİ"
      : "YENİ BİR ADIM";
    $("#task-dialog").showModal();
    $("#task-title").focus();
  }
  $("#new-task").addEventListener("click", () => openTask(null, "todo"));
  $("#task-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#task-title").value.trim();
    if (!title) {
      $("#task-title").setCustomValidity("Görevine bir başlık ver.");
      $("#task-title").reportValidity();
      return;
    }
    $("#task-title").setCustomValidity("");
    if ($("#checklist-input").value.trim()) addChecklist();
    const tags = [
      ...new Set(
        $("#task-tags")
          .value.split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ];
    if (tags.length > 20) {
      toast("En fazla 20 etiket ekleyebilirsin.");
      return;
    }
    const id = $("#task-id").value,
      t = {
        id: id || uid(),
        title,
        description: $("#task-description").value.trim(),
        status: $("#task-status").value,
        priority: $("#task-priority").value,
        date: $("#task-date").value,
        assignee: $("#task-assignee").value,
        tags,
        cover: $("#task-cover").value,
        checklist: structuredClone(draftChecklist),
      };
    const tasks = currentBoard().tasks,
      index = tasks.findIndex((x) => x.id === id);
    if (index >= 0) tasks[index] = t;
    else tasks.push(t);
    const saved = save();
    $("#task-dialog").close();
    render();
    if (saved)
      toast(
        id
          ? "Görev güncellendi. Küçük adımlar, güzel sonuçlar."
          : "Yeni bir adım eklendi. Hadi başlayalım.",
      );
  });
  $("#task-title").addEventListener("input", () =>
    $("#task-title").setCustomValidity(""),
  );
  async function confirmAction(title, message) {
    $("#confirm-title").textContent = title;
    $("#confirm-message").textContent = message;
    const d = $("#confirm-dialog");
    d.returnValue = "";
    d.showModal();
    return new Promise((resolve) =>
      d.addEventListener("close", () => resolve(d.returnValue === "confirm"), {
        once: true,
      }),
    );
  }
  $("#delete-task").addEventListener("click", async () => {
    const id = $("#task-id").value;
    if (
      !(await confirmAction(
        "Bu görevi silelim mi?",
        "Görev ve kontrol listesi kalıcı olarak kaldırılacak.",
      ))
    )
      return;
    currentBoard().tasks = currentBoard().tasks.filter((t) => t.id !== id);
    const saved = save();
    $("#task-dialog").close();
    render();
    if (saved) toast("Görev silindi. Yeni fikirlere yer açıldı.");
  });
  function openBoard(edit = false) {
    const b = edit ? currentBoard() : null;
    $("#board-form").reset();
    $("#editing-board-id").value = b?.id || "";
    $("#board-name").value = b?.name || "";
    $("#board-desc").value = b?.description || "";
    $("#board-color").value = b?.color || "orange";
    $("#board-dialog-heading").textContent = edit
      ? "SENİN PANON, SENİN DÜZENİN"
      : "YENİ BİR ALAN";
    $("#board-form-title").textContent = edit
      ? "Alanını kendine göre düzenle."
      : "Fikirlerine yer aç.";
    $("#delete-board").hidden = !edit || state.boards.length < 2;
    closeSidebar();
    $("#board-dialog").showModal();
    $("#board-name").focus();
  }
  $("#add-board").addEventListener("click", () => openBoard());
  $("#new-board").addEventListener("click", () => openBoard());
  $("#board-settings").addEventListener("click", () => openBoard(true));
  $("#board-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#board-name").value.trim();
    if (!name) {
      $("#board-name").setCustomValidity("Panona bir isim ver.");
      $("#board-name").reportValidity();
      return;
    }
    const id = $("#editing-board-id").value;
    if (id) {
      const b = state.boards.find((x) => x.id === id);
      if (!b) return;
      b.name = name;
      b.description = $("#board-desc").value.trim();
      b.color = $("#board-color").value;
      save();
      render();
    } else {
      const b = {
        id: uid(),
        name,
        description: $("#board-desc").value.trim(),
        color: $("#board-color").value,
        tasks: [],
      };
      state.boards.push(b);
      selectBoard(b.id);
    }
    $("#board-dialog").close();
    toast(id ? "Pano güncellendi." : "Yeni panon hazır. İlk fikrini ekle.");
  });
  $("#board-name").addEventListener("input", () =>
    $("#board-name").setCustomValidity(""),
  );
  $("#delete-board").addEventListener("click", async () => {
    if (state.boards.length < 2) return;
    const id = $("#editing-board-id").value,
      b = state.boards.find((x) => x.id === id);
    if (!b) return;
    if (
      !(await confirmAction(
        "Bu panoyu silelim mi?",
        `“${b.name}” ve içindeki tüm görevler kalıcı olarak kaldırılacak.`,
      ))
    )
      return;
    state.boards = state.boards.filter((b) => b.id !== id);
    selectBoard(state.boards[0].id);
    $("#board-dialog").close();
    toast("Pano silindi.");
  });
  $$("[data-close]").forEach((b) =>
    b.addEventListener("click", () => b.closest("dialog").close()),
  );
  $$("dialog").forEach((d) =>
    d.addEventListener("click", (e) => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          d.close();
      }
    }),
  );
  function boardClick(e) {
    const add = e.target.closest("[data-add]");
    if (add) {
      openTask(null, add.dataset.add);
      return;
    }
    if (e.target.closest(".card-check-item")) return;
    const card = e.target.closest("[data-task]");
    if (card) openTask(card.dataset.task);
  }
  $("#board").addEventListener("click", boardClick);
  $("#list-view").addEventListener("click", boardClick);
  function openByKeyboard(e) {
    if (
      (e.key === "Enter" || e.key === " ") &&
      e.target.matches("[data-task]")
    ) {
      e.preventDefault();
      openTask(e.target.dataset.task);
    }
  }
  $("#board").addEventListener("keydown", openByKeyboard);
  $("#list-view").addEventListener("keydown", openByKeyboard);
  $("#board").addEventListener("change", (e) => {
    if (e.target.dataset.check) {
      const t = taskById(e.target.dataset.owner);
      const c = t?.checklist.find((c) => c.id === e.target.dataset.check);
      if (c) {
        c.done = e.target.checked;
        save();
        render();
      }
    }
  });
  $("#board").addEventListener("dragstart", (e) => {
    const card = e.target.closest("[data-task]");
    if (!card || e.target.closest("input,label,button")) {
      e.preventDefault();
      return;
    }
    draggedId = card.dataset.task;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", draggedId);
    card.classList.add("dragging");
  });
  $("#board").addEventListener("dragover", (e) => {
    if (!draggedId) return;
    const col = e.target.closest("[data-column]");
    if (col) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      $$(".drag-over").forEach((c) => c.classList.remove("drag-over"));
      col.classList.add("drag-over");
    }
  });
  $("#board").addEventListener("dragleave", (e) => {
    const col = e.target.closest("[data-column]");
    if (col && !col.contains(e.relatedTarget))
      col.classList.remove("drag-over");
  });
  $("#board").addEventListener("drop", (e) => {
    e.preventDefault();
    const col = e.target.closest("[data-column]"),
      task = taskById(draggedId);
    if (!col || !task) return;
    const target = e.target.closest("[data-task]");
    task.status = col.dataset.column;
    const tasks = currentBoard().tasks,
      from = tasks.indexOf(task);
    tasks.splice(from, 1);
    if (target && target.dataset.task !== task.id) {
      let to = tasks.findIndex((t) => t.id === target.dataset.task);
      const rect = target.getBoundingClientRect();
      if (e.clientY > rect.top + rect.height / 2) to++;
      tasks.splice(Math.max(to, 0), 0, task);
    } else tasks.push(task);
    draggedId = null;
    const saved = save();
    render();
    if (saved)
      toast(
        `Görev “${columns.find((c) => c.id === task.status).title}” sütununa taşındı.`,
      );
  });
  $("#board").addEventListener("dragend", () => {
    draggedId = null;
    $$(".drag-over,.dragging").forEach((c) =>
      c.classList.remove("drag-over", "dragging"),
    );
  });
  $("#export-data").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `mova-yedek-${dateAt(0)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("Çalışma alanın JSON olarak indirildi.");
  });
  $("#import-data").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 10000000) throw new Error("large");
      const parsed = JSON.parse(await file.text());
      if (!validState(parsed)) throw new Error("schema");
      if (
        !(await confirmAction(
          "Yedeği geri yükleyelim mi?",
          "Bu tarayıcıdaki çalışma alanı, yedekteki panolar ve görevlerle değiştirilecek. Mevcut verilerini önce indirmiş olduğundan emin ol.",
        ))
      )
        return;
      state = parsed;
      query = "";
      priorityFilter = "all";
      tagFilter = "all";
      assignedOnly = false;
      $("#search").value = "";
      $("#priority-filter").value = "all";
      const saved = save();
      $("#help-dialog").close();
      render();
      if (saved)
        toast("Çalışma alanın geri yüklendi. Kaldığın yerden devam et.");
    } catch {
      toast(
        "Bu dosya geçerli bir Mova yedeği değil. En fazla 10 MB boyutunda bir JSON yedeği seç.",
      );
    } finally {
      e.target.value = "";
    }
  });
  $("#reset-demo").addEventListener("click", async () => {
    if (
      !(await confirmAction(
        "Örnek alanı yeniden kuralım mı?",
        "Mevcut panolar ve görevler örnek içerikle değiştirilecek. Saklamak istediğin verileri önce indirme düğmesiyle yedekle.",
      ))
    )
      return;
    const theme = state.theme;
    state = initialState();
    state.theme = theme;
    query = "";
    priorityFilter = "all";
    tagFilter = "all";
    assignedOnly = false;
    $("#search").value = "";
    $("#priority-filter").value = "all";
    const saved = save();
    $("#help-dialog").close();
    render();
    if (saved) toast("Taze bir başlangıç. Örnek çalışma alanın hazır.");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
    if (
      e.ctrlKey ||
      e.metaKey ||
      e.altKey ||
      $("dialog[open]") ||
      e.target.closest("input,textarea,select,[contenteditable]")
    )
      return;
    if (e.key.toLowerCase() === "n") {
      e.preventDefault();
      openTask(null, "todo");
    }
    if (e.key === "/") {
      e.preventDefault();
      $("#search").focus();
    }
  });
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try {
      const incoming = JSON.parse(e.newValue);
      if (validState(incoming)) {
        if ($("dialog[open]")) {
          toast(
            "Diğer sekmede değişiklik var. Bu form açıkken otomatik yüklenmedi; kaydetmeden önce sekmeleri kontrol et.",
          );
          return;
        }
        state = incoming;
        render();
        toast("Diğer sekmedeki değişiklikler yüklendi.");
      }
    } catch {
      /* Keep current valid workspace. */
    }
  });
  render();
  if (startupWarning) toast(startupWarning);
})();
