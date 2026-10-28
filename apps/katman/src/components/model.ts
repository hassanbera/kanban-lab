export type Tone = "slate" | "blue" | "amber" | "green" | "violet" | "rose";
export type Priority = "low" | "medium" | "high";
export type ChecklistItem = { id: string; text: string; done: boolean };
export type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: Priority;
  date: string;
  tags: string[];
  cover: Tone | "";
  assignee: "self" | "none";
  checklist: ChecklistItem[];
};
export type Column = { id: string; title: string; color: Tone };
export type Board = {
  id: string;
  name: string;
  description: string;
  color: Tone;
  columns: Column[];
  tasks: Task[];
};
export type Workspace = {
  version: 2;
  activeBoard: string;
  theme: "light" | "dark";
  boards: Board[];
};
export const tones: { value: Tone; name: string; hex: string }[] = [
  { value: "slate", name: "Arduvaz", hex: "#64748b" },
  { value: "blue", name: "Mavi", hex: "#3978ca" },
  { value: "amber", name: "Kehribar", hex: "#bc8225" },
  { value: "green", name: "Yeşil", hex: "#34866c" },
  { value: "violet", name: "Menekşe", hex: "#8a63b0" },
  { value: "rose", name: "Gül", hex: "#b85e7d" },
];
export const priorityLabels: Record<Priority, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};
export const uid = () => crypto.randomUUID();
export function dateOffset(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export const defaultColumns = (): Column[] => [
  { id: "ideas", title: "Fikirler", color: "violet" },
  { id: "todo", title: "Yapılacak", color: "blue" },
  { id: "doing", title: "Devam ediyor", color: "amber" },
  { id: "done", title: "Tamamlandı", color: "green" },
];
export function blankTask(status: string): Task {
  return {
    id: uid(),
    title: "",
    description: "",
    status,
    priority: "medium",
    date: "",
    tags: [],
    cover: "",
    assignee: "self",
    checklist: [],
  };
}
function seedTask(
  id: string,
  title: string,
  status: string,
  tags: string[],
  rest: Partial<Task> = {},
): Task {
  return {
    id,
    title,
    status,
    tags,
    description: "",
    priority: "medium",
    date: "",
    cover: "",
    assignee: "self",
    checklist: [],
    ...rest,
  };
}
export function seedWorkspace(brand: string): Workspace {
  return {
    version: 2,
    activeBoard: "project",
    theme: "light",
    boards: [
      {
        id: "project",
        name: brand === "Rota" ? "Ürün geliştirme" : "İçerik stüdyosu",
        description:
          brand === "Rota"
            ? "Araştırmadan yayına, ürünün bütün adımları."
            : "Fikir, üretim ve yayın. Bütün içerik akışı tek yerde.",
        color: brand === "Rota" ? "blue" : "violet",
        columns: defaultColumns(),
        tasks: [
          seedTask(
            "t1",
            "Kullanıcı görüşmelerini planla",
            "ideas",
            ["Araştırma"],
            {
              description:
                "İlk kullanıcılarla 20 dakikalık görüşmeler. Soruları ve görüşme takvimini hazırlayalım.",
              priority: "low",
              date: dateOffset(5),
              checklist: [
                { id: "c1", text: "Görüşme sorularını yaz", done: false },
                { id: "c2", text: "Katılımcı listesini oluştur", done: false },
              ],
            },
          ),
          seedTask("t2", "Referans kütüphanesi", "ideas", ["Tasarım"], {
            description:
              "Navigasyon, tipografi ve kart düzeni için seçilmiş referanslar.",
            cover: "violet",
            priority: "low",
            assignee: "none",
          }),
          seedTask("t3", "Yeni özellik önerileri", "ideas", ["Ürün"], {
            description:
              "Kullanıcı geri bildirimlerinden gelen fikirleri değerlendirelim.",
            assignee: "none",
          }),
          seedTask("t4", "Ana ekran tasarımı", "todo", ["Tasarım", "Web"], {
            description:
              "Kullanıcı ilk bakışta ne yapacağını anlayabilmeli. Öncelik, bilgi hiyerarşisi ve gezinme.",
            priority: "high",
            date: dateOffset(1),
            cover: "blue",
            checklist: [
              { id: "c3", text: "Bilgi hiyerarşisini belirle", done: true },
              { id: "c4", text: "Masaüstü düzenini hazırla", done: false },
              { id: "c5", text: "Mobil akışı tamamla", done: false },
            ],
          }),
          seedTask("t5", "İçerik metinlerini düzenle", "todo", ["İçerik"], {
            description:
              "Sayfa başlıkları, form açıklamaları ve boş durum metinleri.",
            date: dateOffset(3),
          }),
          seedTask("t6", "Erişilebilirlik kontrolü", "todo", ["Kalite"], {
            description:
              "Klavye kullanımı, alan etiketleri ve renk kontrastları.",
            priority: "high",
            date: dateOffset(4),
          }),
          seedTask(
            "t7",
            "Bileşen kütüphanesi",
            "doing",
            ["Tasarım", "Geliştirme"],
            {
              description:
                "Ortak bileşenleri ve etkileşim durumlarını bir araya getir.",
              priority: "high",
              date: dateOffset(0),
              checklist: [
                { id: "c6", text: "Buton ve form alanları", done: true },
                { id: "c7", text: "Modal ve seçim alanları", done: true },
                { id: "c8", text: "Hata ve yükleme durumları", done: false },
              ],
            },
          ),
          seedTask("t8", "Prototip üzerinde çalış", "doing", ["Ürün"], {
            description:
              "Ana akışları birbirine bağla ve tıklanabilir bir prototip hazırla.",
            date: dateOffset(2),
            cover: "amber",
          }),
          seedTask("t9", "Lansman kontrol listesi", "doing", ["İçerik"], {
            description:
              "Yayın öncesi içerik, bağlantı ve görsel kontrollerini tamamla.",
            date: dateOffset(3),
          }),
          seedTask("t10", "Proje kapsamını belirle", "done", ["Planlama"], {
            description: "İlk sürümün hedefleri ve öncelikleri belirlendi.",
            priority: "low",
            date: dateOffset(-2),
          }),
          seedTask("t11", "Temel renk paleti", "done", ["Tasarım"], {
            description:
              "Durumlar, aksiyonlar ve geri bildirimler için renk rolleri hazır.",
            priority: "low",
            cover: "green",
          }),
          seedTask("t12", "Başlangıç toplantısı", "done", ["Planlama"], {
            description: "Notlar düzenlendi ve ilk görevler panoya eklendi.",
            date: dateOffset(-1),
            checklist: [
              { id: "c9", text: "Gündem ve hedefler", done: true },
              { id: "c10", text: "İlk adımlar", done: true },
            ],
          }),
        ],
      },
      {
        id: "personal",
        name: "Kişisel planlar",
        description: "Günlük işler ve kendine ayırdığın zaman.",
        color: "green",
        columns: defaultColumns(),
        tasks: [
          seedTask("p1", "Haftalık alışveriş", "todo", ["Yaşam"], {
            checklist: [
              { id: "pc1", text: "Eksikleri not al", done: false },
              { id: "pc2", text: "Listeyi tamamla", done: false },
            ],
            date: dateOffset(1),
          }),
          seedTask("p2", "Portfolyo projesi", "doing", ["Kişisel"], {
            description:
              "Yeni projenin ekran görüntülerini ve açıklamasını hazırla.",
            priority: "high",
            cover: "violet",
          }),
          seedTask("p3", "Okuma listesi", "ideas", ["Kişisel"], {
            description: "Bu ay okumak istediğin kitapları seç.",
            priority: "low",
          }),
          seedTask("p4", "Çalışma alanını düzenle", "done", ["Yaşam"], {
            priority: "low",
          }),
        ],
      },
    ],
  };
}
export function isWorkspace(value: unknown): value is Workspace {
  if (!value || typeof value !== "object") return false;
  const w = value as Workspace;
  if (
    w.version !== 2 ||
    !["light", "dark"].includes(w.theme) ||
    !Array.isArray(w.boards) ||
    !w.boards.length ||
    w.boards.length > 100
  )
    return false;
  const text = (s: unknown, n: number) =>
    typeof s === "string" && s.length <= n;
  const tone = (s: unknown) => tones.some((t) => t.value === s);
  const ids = new Set<string>();
  for (const b of w.boards) {
    if (
      !b ||
      !text(b.id, 100) ||
      !b.id ||
      ids.has(b.id) ||
      !text(b.name, 70) ||
      !b.name.trim() ||
      !text(b.description, 300) ||
      !tone(b.color) ||
      !Array.isArray(b.columns) ||
      !b.columns.length ||
      b.columns.length > 20 ||
      !Array.isArray(b.tasks) ||
      b.tasks.length > 5000
    )
      return false;
    ids.add(b.id);
    const colIds = new Set<string>();
    for (const c of b.columns) {
      if (
        !c ||
        !text(c.id, 100) ||
        !c.id ||
        colIds.has(c.id) ||
        !text(c.title, 60) ||
        !c.title.trim() ||
        !tone(c.color)
      )
        return false;
      colIds.add(c.id);
    }
    const taskIds = new Set<string>();
    for (const t of b.tasks) {
      if (
        !t ||
        !text(t.id, 100) ||
        !t.id ||
        taskIds.has(t.id) ||
        !text(t.title, 160) ||
        !t.title.trim() ||
        !text(t.description, 5000) ||
        !colIds.has(t.status) ||
        !Object.hasOwn(priorityLabels, t.priority) ||
        !["self", "none"].includes(t.assignee) ||
        !(t.cover === "" || tone(t.cover)) ||
        !text(t.date, 10) ||
        (t.date !== "" &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(t.date) ||
            Number.isNaN(new Date(t.date + "T12:00:00").getTime()))) ||
        !Array.isArray(t.tags) ||
        t.tags.length > 20 ||
        !t.tags.every((x) => text(x, 80)) ||
        !Array.isArray(t.checklist) ||
        t.checklist.length > 100
      )
        return false;
      taskIds.add(t.id);
      const checks = new Set<string>();
      for (const c of t.checklist) {
        if (
          !c ||
          !text(c.id, 100) ||
          !c.id ||
          checks.has(c.id) ||
          !text(c.text, 200) ||
          typeof c.done !== "boolean"
        )
          return false;
        checks.add(c.id);
      }
    }
  }
  return ids.has(w.activeBoard);
}
export function displayDate(date: string) {
  if (!date) return "";
  return date === dateOffset(0)
    ? "Bugün"
    : new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "short",
      }).format(new Date(date + "T12:00:00"));
}
