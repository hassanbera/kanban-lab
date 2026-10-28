"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleHelp,
  ClipboardList,
  Columns3,
  FileDown,
  FolderKanban,
  GripVertical,
  Layers2,
  LayoutGrid,
  List,
  ListChecks,
  LockKeyhole,
  Menu,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button, Checkbox, Modal } from "./ui";
import {
  blankTask,
  dateOffset,
  defaultColumns,
  displayDate,
  isWorkspace,
  priorityLabels,
  seedWorkspace,
  tones,
  uid,
  type Board,
  type Column,
  type Task,
  type Tone,
  type Workspace,
} from "./model";
import { downloadColumnPdf } from "./column-pdf";

function Swatches({
  value,
  onChange,
  allowNone = false,
}: {
  value: Tone | "";
  onChange: (v: Tone | "") => void;
  allowNone?: boolean;
}) {
  return (
    <div className="swatches" role="group" aria-label="Renk seçenekleri">
      {allowNone && (
        <button
          type="button"
          className={`swatch-option ${value === "" ? "selected" : ""}`}
          aria-pressed={value === ""}
          onClick={() => onChange("")}
        >
          <span className="swatch-none">
            <X size={16} />
          </span>
          <small>Yok</small>
        </button>
      )}
      {tones.map((t) => (
        <button
          type="button"
          key={t.value}
          className={`swatch-option ${value === t.value ? "selected" : ""}`}
          aria-pressed={value === t.value}
          onClick={() => onChange(t.value)}
          title={t.name}
        >
          <span style={{ background: t.hex }}>
            {value === t.value && <Check size={17} />}
          </span>
          <small>{t.name}</small>
        </button>
      ))}
    </div>
  );
}

function TaskCard({
  task,
  column,
  onOpen,
  onCheck,
  overlay = false,
}: {
  task: Task;
  column: Column;
  onOpen: (task: Task) => void;
  onCheck: (id: string, checkId: string, value: boolean) => void;
  overlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { column: task.status },
    disabled: overlay,
  });
  const complete = task.checklist.filter((c) => c.done).length;
  return (
    <article
      ref={setNodeRef}
      className={`task-card ${isDragging ? "is-dragging" : ""} ${overlay ? "is-overlay" : ""}`}
      style={
        {
          transform: CSS.Transform.toString(transform),
          transition,
        } as CSSProperties
      }
    >
      {task.cover && (
        <div
          className={`task-cover tone-${task.cover}`}
          aria-label={`${tones.find((t) => t.value === task.cover)?.name} kart kapağı`}
        >
          <span />
          <i />
          <b />
        </div>
      )}
      <div className="card-top">
        <div className="tag-row">
          {task.tags.map((tag, i) => (
            <span
              key={tag}
              className={`tag tone-${tones[(tag.length + i) % tones.length].value}`}
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          className="drag-handle"
          aria-label={`${task.title} görevini taşı`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} />
        </button>
      </div>
      <button className="card-title" onClick={() => onOpen(task)}>
        {task.title}
      </button>
      {task.description && (
        <p className="card-description">{task.description}</p>
      )}
      {task.checklist.length > 0 && (
        <div className="card-checklist">
          <div className="checklist-summary">
            <ListChecks size={14} />
            <span>Kontrol listesi</span>
            <b>
              {complete}/{task.checklist.length}
            </b>
          </div>
          {task.checklist.slice(0, 3).map((item) => (
            <label
              key={item.id}
              className={`check-row ${item.done ? "checked" : ""}`}
            >
              <Checkbox
                checked={item.done}
                onChange={(v) => onCheck(task.id, item.id, v)}
                label={item.text}
              />
              <span>{item.text}</span>
            </label>
          ))}
          {task.checklist.length > 3 && (
            <button className="more-checks" onClick={() => onOpen(task)}>
              +{task.checklist.length - 3} madde daha
            </button>
          )}
        </div>
      )}
      <footer className="card-footer">
        <span className={`priority priority-${task.priority}`}>
          <i />
          {priorityLabels[task.priority]}
        </span>
        {task.date && (
          <span
            className={`task-date ${task.date < dateOffset(0) && column.id !== "done" ? "overdue" : ""}`}
          >
            <CalendarDays size={12} />
            {displayDate(task.date)}
          </span>
        )}
        <button
          className={`assignee ${task.assignee === "self" ? "assigned" : ""}`}
          aria-label={
            task.assignee === "self"
              ? "Bana atanan görev, detaylarını aç"
              : "Atanmamış görev, detaylarını aç"
          }
          onClick={() => onOpen(task)}
        >
          {task.assignee === "self" ? "B" : <UserRound size={13} />}
        </button>
      </footer>
    </article>
  );
}
function KanbanColumn({
  column,
  tasks,
  onOpen,
  onAdd,
  onCheck,
  onSettings,
  onPdf,
  busy,
}: {
  column: Column;
  tasks: Task[];
  onOpen: (t: Task) => void;
  onAdd: (s: string) => void;
  onCheck: (id: string, c: string, v: boolean) => void;
  onSettings: () => void;
  onPdf: () => void;
  busy: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column: column.id },
  });
  return (
    <section
      ref={setNodeRef}
      className={`kanban-column tone-${column.color} ${isOver ? "drop-over" : ""}`}
      aria-label={`${column.title} sütunu`}
    >
      <header className="column-header">
        <span className="column-status">
          {column.id === "done" ? (
            <CheckCheck size={16} />
          ) : column.id === "doing" ? (
            <Circle size={15} />
          ) : (
            <span className="status-square" />
          )}
        </span>
        <h2>{column.title}</h2>
        <span className="column-count">{tasks.length}</span>
        <div className="column-actions">
          <Button
            variant="ghost"
            className="icon-btn"
            aria-label={`${column.title} sütununu PDF indir`}
            onClick={onPdf}
            disabled={busy}
          >
            <FileDown size={15} />
          </Button>
          <Button
            variant="ghost"
            className="icon-btn"
            aria-label={`${column.title} sütununu düzenle`}
            onClick={onSettings}
          >
            <MoreHorizontal size={17} />
          </Button>
        </div>
      </header>
      <div className="column-content">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              column={column}
              onOpen={onOpen}
              onCheck={onCheck}
            />
          ))}
        </SortableContext>
        {!tasks.length && (
          <div className="empty-column">
            <ClipboardList size={24} />
            <p>Burada henüz görev yok.</p>
            <span>İlk adımı ekleyebilirsin.</span>
          </div>
        )}
        <Button
          className="add-card"
          variant="ghost"
          onClick={() => onAdd(column.id)}
        >
          <Plus size={15} />
          Görev ekle
        </Button>
      </div>
    </section>
  );
}

export function KanbanApp({
  brand,
  variant,
}: {
  brand: string;
  variant: "rota" | "katman";
}) {
  const key = `${variant}.workspace.v2`;
  const [workspace, setWorkspace] = useState<Workspace | null>(null),
    [storageError, setStorageError] = useState(false);
  const [query, setQuery] = useState(""),
    [priority, setPriority] = useState("all"),
    [tag, setTag] = useState("all"),
    [mine, setMine] = useState(false),
    [view, setView] = useState<"board" | "list">("board"),
    [filters, setFilters] = useState(false),
    [sidebar, setSidebar] = useState(false);
  const [taskDraft, setTaskDraft] = useState<Task | null>(null),
    [taskBoard, setTaskBoard] = useState(""),
    [tagDraft, setTagDraft] = useState(""),
    [stepDraft, setStepDraft] = useState("");
  const [boardDraft, setBoardDraft] = useState<Board | null>(null),
    [boardMode, setBoardMode] = useState<"new" | "edit">("new"),
    [columnDraft, setColumnDraft] = useState<Column | null>(null);
  const [help, setHelp] = useState(false),
    [pdfOpen, setPdfOpen] = useState(false),
    [pdfBusy, setPdfBusy] = useState<string | null>(null),
    [dragId, setDragId] = useState<string | null>(null),
    [notice, setNotice] = useState("");
  const [confirm, setConfirm] = useState<{
    title: string;
    description: string;
    action: () => void;
  } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null),
    importRef = useRef<HTMLInputElement>(null),
    dirtyRef = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  useEffect(() => {
    let loaded: Workspace;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data: unknown = JSON.parse(raw);
        if (!isWorkspace(data)) throw Error();
        loaded = data;
      } else loaded = seedWorkspace(brand);
    } catch {
      loaded = seedWorkspace(brand);
      setStorageError(true);
      setNotice(
        "Yerel kayıt okunamadı. Örnek alan açıldı; yedeğini Ayarlar bölümünden yükleyebilirsin.",
      );
    }
    setWorkspace(loaded);
  }, [key, brand]);
  useEffect(() => {
    if (!workspace) return;
    document.documentElement.dataset.theme = workspace.theme;
    document.documentElement.dataset.variant = variant;
  }, [workspace?.theme, variant, workspace]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  const board = workspace?.boards.find((b) => b.id === workspace.activeBoard);
  const update = (change: (w: Workspace) => Workspace) => {
    dirtyRef.current = true;
    setWorkspace((w) => (w ? change(structuredClone(w)) : w));
  };
  useEffect(() => {
    if (!workspace || !dirtyRef.current) return;
    dirtyRef.current = false;
    try {
      localStorage.setItem(key, JSON.stringify(workspace));
      setStorageError(false);
    } catch {
      setStorageError(true);
      setNotice(
        "Kayıt yapılamadı. Ayarlar bölümünden JSON yedeği alabilirsin.",
      );
    }
  }, [workspace, key]);
  useEffect(() => {
    if (board) document.title = `${board.name} · ${brand}`;
  }, [board?.name, brand]);
  const modifyBoard = (change: (b: Board) => void) =>
    update((w) => {
      const b = w.boards.find((b) => b.id === w.activeBoard);
      if (b) change(b);
      return w;
    });
  const openTask = (task?: Task, status?: string) => {
    if (!board) return;
    setTaskBoard(board.id);
    setTaskDraft(
      task
        ? structuredClone(task)
        : blankTask(status || board.columns[1]?.id || board.columns[0].id),
    );
    setTagDraft(task?.tags.join(", ") || "");
    setStepDraft("");
  };
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        taskDraft ||
        boardDraft ||
        columnDraft ||
        help ||
        pdfOpen ||
        confirm ||
        (e.target instanceof HTMLElement &&
          e.target.closest("input,textarea,select,[contenteditable]"))
      )
        return;
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        openTask();
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSidebar(false);
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  });
  const visible = useMemo(
    () =>
      board?.tasks.filter(
        (t) =>
          (!query ||
            `${t.title} ${t.description} ${t.tags.join(" ")}`
              .toLocaleLowerCase("tr")
              .includes(query.toLocaleLowerCase("tr"))) &&
          (priority === "all" || t.priority === priority) &&
          (tag === "all" || t.tags.includes(tag)) &&
          (!mine || t.assignee === "self"),
      ) || [],
    [board, query, priority, tag, mine],
  );
  if (!workspace || !board)
    return (
      <div className={`loading-app ${variant}`}>
        <Layers2 size={30} />
        <strong>{brand}</strong>
        <p>Çalışma alanı hazırlanıyor…</p>
      </div>
    );
  const done = board.tasks.filter((t) => t.status === "done").length,
    progress = board.tasks.length
      ? Math.round((done / board.tasks.length) * 100)
      : 0;
  const tags = [...new Set(board.tasks.flatMap((t) => t.tags))].sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
  const taskColumnBoard =
    workspace.boards.find((b) => b.id === taskBoard) || board;
  const switchBoard = (id: string) => {
    update((w) => ({ ...w, activeBoard: id }));
    setQuery("");
    setPriority("all");
    setTag("all");
    setSidebar(false);
  };
  const toggleCheck = (id: string, checkId: string, value: boolean) =>
    modifyBoard((b) => {
      const item = b.tasks
        .find((t) => t.id === id)
        ?.checklist.find((c) => c.id === checkId);
      if (item) item.done = value;
    });
  const saveTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskDraft || !taskDraft.title.trim()) return;
    const clean = structuredClone(taskDraft);
    clean.title = clean.title.trim();
    clean.tags = [
      ...new Set(
        tagDraft
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    ];
    if (clean.tags.length > 20 || clean.tags.some((t) => t.length > 80)) {
      setNotice(
        "En fazla 20 etiket; her etiket en fazla 80 karakter olabilir.",
      );
      return;
    }
    if (stepDraft.trim()) {
      if (clean.checklist.length >= 100) {
        setNotice("En fazla 100 kontrol maddesi ekleyebilirsin.");
        return;
      }
      clean.checklist.push({ id: uid(), text: stepDraft.trim(), done: false });
    }
    update((w) => {
      const b = w.boards.find((b) => b.id === taskBoard);
      if (!b) return w;
      const idx = b.tasks.findIndex((t) => t.id === clean.id);
      if (idx < 0) b.tasks.push(clean);
      else b.tasks[idx] = clean;
      return w;
    });
    setTaskDraft(null);
    setNotice("Görev kaydedildi.");
  };
  const saveBoard = (e: FormEvent) => {
    e.preventDefault();
    if (!boardDraft || !boardDraft.name.trim()) return;
    const clean = { ...boardDraft, name: boardDraft.name.trim() };
    update((w) => {
      if (boardMode === "new") {
        if (w.boards.length >= 100) return w;
        w.boards.push(clean);
        w.activeBoard = clean.id;
      } else {
        const idx = w.boards.findIndex((b) => b.id === clean.id);
        if (idx >= 0)
          w.boards[idx] = {
            ...w.boards[idx],
            name: clean.name,
            description: clean.description,
            color: clean.color,
          };
      }
      return w;
    });
    setBoardDraft(null);
    setQuery("");
    setPriority("all");
    setTag("all");
    setNotice("Pano kaydedildi.");
  };
  const openBoard = (edit = false) => {
    setBoardMode(edit ? "edit" : "new");
    setBoardDraft(
      edit
        ? structuredClone(board)
        : {
            id: uid(),
            name: "",
            description: "",
            color: variant === "rota" ? "blue" : "violet",
            columns: defaultColumns(),
            tasks: [],
          },
    );
    setSidebar(false);
  };
  const exportPdf = async (col: Column) => {
    if (pdfBusy) return;
    setPdfBusy(col.id);
    try {
      await downloadColumnPdf(
        brand,
        board,
        col,
        board.tasks.filter((t) => t.status === col.id),
      );
      setNotice(`${col.title} sütunu PDF olarak indirildi.`);
      setPdfOpen(false);
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "PDF oluşturulamadı. Tekrar dene.",
      );
    } finally {
      setPdfBusy(null);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    modifyBoard((b) => {
      const task = b.tasks.find((t) => t.id === active.id);
      if (!task) return;
      const target = b.tasks.find((t) => t.id === over.id);
      const col = target?.status || b.columns.find((c) => c.id === over.id)?.id;
      if (!col) return;
      task.status = col;
      const from = b.tasks.findIndex((t) => t.id === task.id);
      b.tasks.splice(from, 1);
      if (target) {
        const to = b.tasks.findIndex((t) => t.id === target.id);
        b.tasks.splice(Math.max(0, to), 0, task);
      } else b.tasks.push(task);
    });
  };
  const saveBackup = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(workspace, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${variant}-yedek-${dateOffset(0)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const loadBackup = async (file: File) => {
    try {
      if (file.size > 10_000_000) throw Error();
      const parsed: unknown = JSON.parse(await file.text());
      if (!isWorkspace(parsed)) throw Error();
      setConfirm({
        title: "Yedeği geri yükle",
        description:
          "Bu tarayıcıdaki tüm panolar yedekteki içerikle değiştirilecek. Önce mevcut verilerini yedekleyebilirsin.",
        action: () => {
          update(() => parsed);
          setHelp(false);
          setQuery("");
          setPriority("all");
          setTag("all");
          setMine(false);
          setNotice("Yedek geri yüklendi.");
        },
      });
    } catch {
      setNotice(
        "Geçerli bir Rota / Katman JSON yedeği seç. Dosya en fazla 10 MB olabilir.",
      );
    }
  };
  const activeTask = board.tasks.find((t) => t.id === dragId);
  return (
    <div className={`kanban-app ${variant}`}>
      {sidebar && (
        <button
          className="sidebar-scrim"
          aria-label="Menüyü kapat"
          onClick={() => setSidebar(false)}
        />
      )}
      <aside
        id="app-sidebar"
        aria-label="Çalışma alanı gezintisi"
        className={`sidebar ${sidebar ? "open" : ""}`}
      >
        <div className="brand">
          <span className="brand-symbol">
            {variant === "rota" ? (
              <FolderKanban size={23} />
            ) : (
              <Layers2 size={25} />
            )}
          </span>
          <strong>{brand.toLocaleLowerCase("tr")}</strong>
          <span className="brand-beta">kişisel</span>
        </div>
        <div className="workspace-box">
          <span className="workspace-avatar">B</span>
          <div>
            <strong>Benim çalışma alanım</strong>
            <small>Yerel çalışma alanı</small>
          </div>
        </div>
        <p className="nav-label">ÇALIŞMA ALANI</p>
        <button
          className={`nav-link ${!mine ? "active" : ""}`}
          onClick={() => setMine(false)}
        >
          <LayoutGrid size={17} />
          Panolarım<span>{workspace.boards.length}</span>
        </button>
        <button
          className={`nav-link ${mine ? "active" : ""}`}
          onClick={() => setMine(true)}
        >
          <CheckCircle2 size={17} />
          Bana atananlar
        </button>
        <div className="nav-label board-nav-heading">
          PANOLAR
          <button aria-label="Yeni pano oluştur" onClick={() => openBoard()}>
            <Plus size={16} />
          </button>
        </div>
        <nav className="board-nav" aria-label="Panolar">
          {workspace.boards.map((b) => (
            <button
              key={b.id}
              onClick={() => switchBoard(b.id)}
              className={b.id === board.id ? "active" : ""}
              aria-current={b.id === board.id ? "page" : undefined}
            >
              <i className={`tone-${b.color}`} />
              <span>{b.name}</span>
              <small>{b.tasks.length}</small>
            </button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="new-board"
          onClick={() => openBoard()}
        >
          <Plus size={15} />
          Yeni pano
        </Button>
        <div className="sidebar-bottom">
          <div className="local-info">
            <LockKeyhole size={17} />
            <strong>Kişisel alanın</strong>
            <p>
              Panoların bu tarayıcıda saklanır.
              <br />
              Hesap veya ekip bağlantısı gerekmez.
            </p>
          </div>
          <button
            className="nav-link"
            onClick={() =>
              update((w) => ({
                ...w,
                theme: w.theme === "light" ? "dark" : "light",
              }))
            }
          >
            {workspace.theme === "light" ? (
              <Moon size={17} />
            ) : (
              <Sun size={17} />
            )}
            <span>
              {workspace.theme === "light" ? "Koyu görünüm" : "Açık görünüm"}
            </span>
          </button>
          <button className="nav-link" onClick={() => setHelp(true)}>
            <CircleHelp size={17} />
            Ayarlar ve yardım
          </button>
          <div className="profile">
            <span className="profile-avatar">B</span>
            <div>
              <strong>Benim alanım</strong>
              <small>
                <i className={storageError ? "warning" : ""} />
                {storageError ? "Kayıt sorunu" : "Bu tarayıcıda kayıtlı"}
              </small>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              variant="ghost"
              className="icon-btn mobile-menu"
              aria-label="Menüyü aç"
              aria-controls="app-sidebar"
              aria-expanded={sidebar}
              onClick={() => setSidebar(true)}
            >
              <Menu size={20} />
            </Button>
            <FolderKanban size={16} />
            <span>Panolarım</span>
            <ChevronRight size={13} />
            <strong>{board.name}</strong>
          </div>
          <div className="top-actions">
            <span className={`save-indicator ${storageError ? "warning" : ""}`}>
              <i />
              {storageError ? "Kayıt yapılamadı" : "Değişiklikler kayıtlı"}
            </span>
            <Button
              variant="ghost"
              className="icon-btn"
              aria-label="Sütun PDF indir"
              onClick={() => setPdfOpen(true)}
            >
              <FileDown size={18} />
            </Button>
            <span className="profile-avatar">B</span>
          </div>
        </header>
        <section className="board-heading">
          <div className="heading-kicker">
            <span className={`board-symbol tone-${board.color}`}>
              <FolderKanban size={19} />
            </span>
            <span>PROJE PANOSU</span>
          </div>
          <div className="board-title-row">
            <div>
              <h1>{board.name}</h1>
              <p>
                {board.description ||
                  "Görevlerini düzenle ve ilerlemeyi takip et."}
              </p>
            </div>
            <Button variant="primary" onClick={() => openTask()}>
              <Plus size={17} />
              Yeni görev<kbd>N</kbd>
            </Button>
          </div>
          <div className="board-meta">
            <span className="meta-pill tone-violet">
              <LockKeyhole size={13} />
              Kişisel pano
            </span>
            <span className="meta-pill tone-blue">
              <ClipboardList size={13} />
              {board.tasks.length} görev
            </span>
            <span className="meta-pill tone-green">
              <CheckCheck size={14} />
              {done} tamamlandı
            </span>
            <span className="meta-progress">
              <span>
                <i style={{ width: `${progress}%` }} />
              </span>
              <b>%{progress}</b>
            </span>
            <Button
              variant="ghost"
              onClick={() => openBoard(true)}
              className="board-settings"
              aria-label="Pano ayarları"
            >
              <Settings2 size={15} />
              <span>Pano ayarları</span>
            </Button>
          </div>
        </section>
        <section className="toolbar" aria-label="Pano araçları">
          <div className="view-tabs" role="group" aria-label="Görünüm">
            <Button
              variant="ghost"
              className={view === "board" ? "active" : ""}
              onClick={() => setView("board")}
              aria-pressed={view === "board"}
            >
              <Columns3 size={16} />
              Pano
            </Button>
            <Button
              variant="ghost"
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
            >
              <List size={16} />
              Liste
            </Button>
          </div>
          <div className="toolbar-controls">
            <label className="search-field">
              <Search size={16} />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Görevlerde ara…"
                aria-label="Görevlerde ara"
              />
              <kbd>/</kbd>
            </label>
            <Button
              className={
                filters || priority !== "all" || tag !== "all"
                  ? "filter-active"
                  : ""
              }
              onClick={() => setFilters(!filters)}
              aria-label="Filtrele"
              aria-expanded={filters}
            >
              <SlidersHorizontal size={16} />
              <span className="filter-label">Filtrele</span>
              {(priority !== "all" || tag !== "all") && (
                <i className="filter-dot" />
              )}
            </Button>
          </div>
        </section>
        {filters && (
          <div className="filter-panel">
            <label>
              Öncelik
              <select
                aria-label="Öncelik filtresi"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="all">Tüm öncelikler</option>
                {Object.entries(priorityLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Etiket
              <select
                aria-label="Etiket filtresi"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="all">Tüm etiketler</option>
                {tags.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <Button
              variant="ghost"
              onClick={() => {
                setPriority("all");
                setTag("all");
                setQuery("");
              }}
            >
              Temizle
            </Button>
            <span>{visible.length} görev gösteriliyor</span>
          </div>
        )}
        {mine && (
          <div className="assigned-banner">
            <UserRound size={15} />
            Bana atanan görevler
            <Button variant="ghost" onClick={() => setMine(false)}>
              Tümünü göster
              <X size={13} />
            </Button>
          </div>
        )}
        {view === "board" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(e) => setDragId(String(e.active.id))}
            onDragCancel={() => setDragId(null)}
            onDragEnd={handleDragEnd}
          >
            <div className="board-scroll" aria-label="Kanban panosu">
              <div className="board-columns">
                {board.columns.map((c) => (
                  <KanbanColumn
                    key={c.id}
                    column={c}
                    tasks={visible.filter((t) => t.status === c.id)}
                    onOpen={openTask}
                    onAdd={(s) => openTask(undefined, s)}
                    onCheck={toggleCheck}
                    onSettings={() => setColumnDraft({ ...c })}
                    onPdf={() => exportPdf(c)}
                    busy={pdfBusy !== null}
                  />
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeTask && (
                <TaskCard
                  task={activeTask}
                  column={
                    board.columns.find((c) => c.id === activeTask.status)!
                  }
                  onOpen={() => {}}
                  onCheck={() => {}}
                  overlay
                />
              )}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="list-scroll">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Görev</th>
                  <th>Durum</th>
                  <th>Öncelik</th>
                  <th>Tarih</th>
                  <th>Atanan</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <button onClick={() => openTask(t)}>{t.title}</button>
                    </td>
                    <td>
                      <span
                        className={`meta-pill tone-${board.columns.find((c) => c.id === t.status)?.color}`}
                      >
                        {board.columns.find((c) => c.id === t.status)?.title}
                      </span>
                    </td>
                    <td>
                      <span className={`priority priority-${t.priority}`}>
                        <i />
                        {priorityLabels[t.priority]}
                      </span>
                    </td>
                    <td>{displayDate(t.date) || "—"}</td>
                    <td>{t.assignee === "self" ? "Ben" : "Atanmamış"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visible.length && (
              <div className="list-empty">Eşleşen görev bulunamadı.</div>
            )}
          </div>
        )}
        <footer className="page-footer">
          <span>
            {visible.length} / {board.tasks.length} görev
          </span>
          <span>
            Kartın tutamacıyla taşı · <kbd>N</kbd> yeni görev · <kbd>/</kbd> ara
          </span>
          <span>{brand} / Kişisel kullanım</span>
        </footer>
      </main>

      <Modal
        open={!!taskDraft}
        onOpenChange={(v) => {
          if (!v) setTaskDraft(null);
        }}
        title={
          board.tasks.some((t) => t.id === taskDraft?.id)
            ? "Görev detayları"
            : "Yeni görev"
        }
        description="Görevin içeriğini ve çalışma adımlarını düzenle."
        wide
        footer={
          <>
            <Button
              variant="danger"
              className="delete-task"
              disabled={!board.tasks.some((t) => t.id === taskDraft?.id)}
              onClick={() => {
                if (!taskDraft) return;
                const id = taskDraft.id,
                  bid = taskBoard;
                setConfirm({
                  title: "Görev silinsin mi?",
                  description:
                    "Görev ve içindeki kontrol listesi kaldırılacak.",
                  action: () => {
                    update((w) => {
                      const b = w.boards.find((b) => b.id === bid);
                      if (b) b.tasks = b.tasks.filter((t) => t.id !== id);
                      return w;
                    });
                    setTaskDraft(null);
                    setNotice("Görev silindi.");
                  },
                });
              }}
            >
              <Trash2 size={15} />
              <span>Sil</span>
            </Button>
            <span className="spacer" />
            <Button onClick={() => setTaskDraft(null)}>Vazgeç</Button>
            <Button variant="primary" type="submit" form="task-form">
              Kaydet
              <Check size={16} />
            </Button>
          </>
        }
      >
        {taskDraft && (
          <form id="task-form" onSubmit={saveTask} className="task-editor">
            <div className="editor-main">
              <label className="field">
                Görev başlığı
                <input
                  aria-label="Görev başlığı"
                  autoFocus
                  required
                  maxLength={160}
                  value={taskDraft.title}
                  onChange={(e) =>
                    setTaskDraft({ ...taskDraft, title: e.target.value })
                  }
                  placeholder="Görevine bir ad ver"
                  className="title-input"
                />
              </label>
              <label className="field">
                Açıklama
                <textarea
                  aria-label="Açıklama"
                  rows={4}
                  maxLength={5000}
                  value={taskDraft.description}
                  onChange={(e) =>
                    setTaskDraft({ ...taskDraft, description: e.target.value })
                  }
                  placeholder="İşin kapsamı, bağlantılar ve notlar…"
                />
              </label>
              <section className="editor-section section-green">
                <h3>
                  <ListChecks size={17} />
                  Kontrol listesi
                  <span>
                    {taskDraft.checklist.filter((c) => c.done).length}/
                    {taskDraft.checklist.length}
                  </span>
                </h3>
                <div className="editor-checks">
                  {taskDraft.checklist.map((c) => (
                    <div
                      className={`check-row ${c.done ? "checked" : ""}`}
                      key={c.id}
                    >
                      <Checkbox
                        checked={c.done}
                        onChange={(v) =>
                          setTaskDraft({
                            ...taskDraft,
                            checklist: taskDraft.checklist.map((i) =>
                              i.id === c.id ? { ...i, done: v } : i,
                            ),
                          })
                        }
                        label={c.text}
                      />
                      <span>{c.text}</span>
                      <Button
                        variant="ghost"
                        className="icon-btn"
                        aria-label={`${c.text} maddesini kaldır`}
                        onClick={() =>
                          setTaskDraft({
                            ...taskDraft,
                            checklist: taskDraft.checklist.filter(
                              (i) => i.id !== c.id,
                            ),
                          })
                        }
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="add-step">
                  <input
                    value={stepDraft}
                    maxLength={200}
                    placeholder="Yeni bir adım ekle"
                    aria-label="Yeni kontrol maddesi"
                    onChange={(e) => setStepDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (
                          stepDraft.trim() &&
                          taskDraft.checklist.length < 100
                        ) {
                          setTaskDraft({
                            ...taskDraft,
                            checklist: [
                              ...taskDraft.checklist,
                              {
                                id: uid(),
                                text: stepDraft.trim(),
                                done: false,
                              },
                            ],
                          });
                          setStepDraft("");
                        }
                      }
                    }}
                  />
                  <Button
                    disabled={
                      !stepDraft.trim() || taskDraft.checklist.length >= 100
                    }
                    onClick={() => {
                      setTaskDraft({
                        ...taskDraft,
                        checklist: [
                          ...taskDraft.checklist,
                          { id: uid(), text: stepDraft.trim(), done: false },
                        ],
                      });
                      setStepDraft("");
                    }}
                    aria-label="Kontrol maddesi ekle"
                  >
                    <Plus size={17} />
                  </Button>
                </div>
              </section>
              <section className="editor-section section-violet">
                <h3>
                  <Layers2 size={17} />
                  Kart kapağı
                </h3>
                <p className="section-hint">
                  Renk seçimi panoda kartın üstünde görünür.
                </p>
                <Swatches
                  value={taskDraft.cover}
                  allowNone
                  onChange={(v) => setTaskDraft({ ...taskDraft, cover: v })}
                />
              </section>
            </div>
            <aside className="editor-details">
              <h3>
                <Settings2 size={16} />
                Özellikler
              </h3>
              <label className="field">
                Durum
                <select
                  aria-label="Durum"
                  value={taskDraft.status}
                  onChange={(e) =>
                    setTaskDraft({ ...taskDraft, status: e.target.value })
                  }
                >
                  {taskColumnBoard.columns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Öncelik
                <select
                  aria-label="Öncelik"
                  value={taskDraft.priority}
                  onChange={(e) =>
                    setTaskDraft({
                      ...taskDraft,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                >
                  {Object.entries(priorityLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Bitiş tarihi
                <input
                  aria-label="Bitiş tarihi"
                  type="date"
                  value={taskDraft.date}
                  onChange={(e) =>
                    setTaskDraft({ ...taskDraft, date: e.target.value })
                  }
                />
              </label>
              <label className="field">
                Atanan
                <select
                  aria-label="Atanan"
                  value={taskDraft.assignee}
                  onChange={(e) =>
                    setTaskDraft({
                      ...taskDraft,
                      assignee: e.target.value as Task["assignee"],
                    })
                  }
                >
                  <option value="self">Ben</option>
                  <option value="none">Atanmamış</option>
                </select>
              </label>
              <label className="field">
                Etiketler
                <input
                  aria-label="Etiketler"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  maxLength={500}
                  placeholder="Tasarım, Ürün"
                />
                <small>Birden fazlası için virgül kullan.</small>
              </label>
              <div className="tag-preview">
                {tagDraft
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 6)
                  .map((t, i) => (
                    <span
                      key={i}
                      className={`tag tone-${tones[i % tones.length].value}`}
                    >
                      {t}
                    </span>
                  ))}
              </div>
            </aside>
          </form>
        )}
      </Modal>

      <Modal
        open={!!boardDraft}
        onOpenChange={(v) => {
          if (!v) setBoardDraft(null);
        }}
        title={boardMode === "new" ? "Yeni pano" : "Pano ayarları"}
        description="Panonun adını ve görsel kimliğini belirle."
        footer={
          <>
            <Button
              variant="danger"
              disabled={boardMode === "new" || workspace.boards.length < 2}
              onClick={() => {
                if (!boardDraft) return;
                const id = boardDraft.id;
                setConfirm({
                  title: "Pano silinsin mi?",
                  description: `“${boardDraft.name}” ve içindeki tüm görevler kaldırılacak.`,
                  action: () => {
                    update((w) => {
                      w.boards = w.boards.filter((b) => b.id !== id);
                      w.activeBoard = w.boards[0].id;
                      return w;
                    });
                    setBoardDraft(null);
                    setNotice("Pano silindi.");
                  },
                });
              }}
            >
              <Trash2 size={15} />
              Sil
            </Button>
            <span className="spacer" />
            <Button onClick={() => setBoardDraft(null)}>Vazgeç</Button>
            <Button variant="primary" type="submit" form="board-form">
              Kaydet
            </Button>
          </>
        }
      >
        {boardDraft && (
          <form id="board-form" onSubmit={saveBoard}>
            <label className="field">
              Pano adı
              <input
                aria-label="Pano adı"
                required
                maxLength={70}
                autoFocus
                value={boardDraft.name}
                onChange={(e) =>
                  setBoardDraft({ ...boardDraft, name: e.target.value })
                }
              />
            </label>
            <label className="field">
              Açıklama
              <textarea
                aria-label="Pano açıklaması"
                rows={3}
                maxLength={300}
                value={boardDraft.description}
                onChange={(e) =>
                  setBoardDraft({ ...boardDraft, description: e.target.value })
                }
              />
            </label>
            <div className="field">
              Pano rengi
              <Swatches
                value={boardDraft.color}
                onChange={(v) => {
                  if (v) setBoardDraft({ ...boardDraft, color: v });
                }}
              />
            </div>
          </form>
        )}
      </Modal>
      <Modal
        open={!!columnDraft}
        onOpenChange={(v) => {
          if (!v) setColumnDraft(null);
        }}
        title="Sütun ayarları"
        description="Başlık ve renk, görevlerin bulunduğu aşamayı belirtir."
        footer={
          <>
            <span className="spacer" />
            <Button onClick={() => setColumnDraft(null)}>Vazgeç</Button>
            <Button variant="primary" form="column-form" type="submit">
              Kaydet
            </Button>
          </>
        }
      >
        {columnDraft && (
          <form
            id="column-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!columnDraft.title.trim()) return;
              modifyBoard((b) => {
                b.columns = b.columns.map((c) =>
                  c.id === columnDraft.id
                    ? { ...columnDraft, title: columnDraft.title.trim() }
                    : c,
                );
              });
              setColumnDraft(null);
            }}
          >
            <label className="field">
              Sütun adı
              <input
                aria-label="Sütun adı"
                required
                maxLength={60}
                autoFocus
                value={columnDraft.title}
                onChange={(e) =>
                  setColumnDraft({ ...columnDraft, title: e.target.value })
                }
              />
            </label>
            <div className="field">
              Sütun rengi
              <Swatches
                value={columnDraft.color}
                onChange={(v) => {
                  if (v) setColumnDraft({ ...columnDraft, color: v });
                }}
              />
            </div>
          </form>
        )}
      </Modal>
      <Modal
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        title="Sütun PDF indir"
        description="Seçtiğin sütundaki tüm görevler tek bir PDF dosyasına aktarılır. Arama ve filtreler raporu daraltmaz."
      >
        <div className="pdf-options">
          {board.columns.map((c) => (
            <button
              key={c.id}
              className={`pdf-column tone-${c.color}`}
              onClick={() => exportPdf(c)}
              disabled={pdfBusy !== null}
            >
              <FileDown size={23} />
              <span>
                <strong>{c.title}</strong>
                <small>
                  {board.tasks.filter((t) => t.status === c.id).length} görev ·
                  açıklamalar ve kontrol listeleri
                </small>
              </span>
              <span>
                {pdfBusy === c.id ? (
                  "Hazırlanıyor…"
                ) : (
                  <ArrowDownToLine size={18} />
                )}
              </span>
            </button>
          ))}
        </div>
      </Modal>
      <Modal
        open={help}
        onOpenChange={setHelp}
        title="Ayarlar ve yardım"
        description={`${brand}, kişisel projelerin için bir Kanban çalışma alanı.`}
      >
        <div className="help-section">
          <h3>
            <LockKeyhole size={17} />
            Verilerin nerede?
          </h3>
          <p>
            Panoların yalnızca bu tarayıcıda saklanır. Bu sürümde backend,
            kullanıcı hesabı ve cihazlar arası senkronizasyon yoktur. Site
            verileri temizlenirse kayıtlar silinir.
          </p>
        </div>
        <div className="help-section">
          <h3>
            <GripVertical size={17} />
            Görevleri nasıl taşırsın?
          </h3>
          <p>
            Kartın sağ üstündeki tutamacı sürükle. Klavyeyle tutamaçta boşluk
            tuşuna bas, oklarla taşı ve tekrar boşlukla bırak. Görev detayındaki
            Durum alanını da kullanabilirsin.
          </p>
        </div>
        <div className="help-section">
          <h3>
            <FileDown size={17} />
            PDF ve yedekleme
          </h3>
          <p>
            Sütun başlığındaki indirme düğmesi, o sütunu PDF olarak indirir.
            JSON dosyaları yalnızca çalışma alanını yedeklemek ve geri yüklemek
            içindir.
          </p>
          <div className="help-buttons">
            <Button onClick={saveBackup}>
              <ArrowDownToLine size={15} />
              JSON yedeği al
            </Button>
            <Button onClick={() => importRef.current?.click()}>
              Yedek yükle
            </Button>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void loadBackup(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
        <Button
          variant="ghost"
          className="reset-demo"
          onClick={() =>
            setConfirm({
              title: "Örnek alan yeniden kurulsun mu?",
              description:
                "Mevcut bütün panolar örnek içerikle değiştirilecek. Önce JSON yedeği alabilirsin.",
              action: () => {
                update((w) => ({ ...seedWorkspace(brand), theme: w.theme }));
                setHelp(false);
                setQuery("");
                setPriority("all");
                setTag("all");
                setMine(false);
                setNotice("Örnek çalışma alanı yeniden kuruldu.");
              },
            })
          }
        >
          Örnek çalışma alanını yeniden kur
        </Button>
      </Modal>
      <Modal
        open={!!confirm}
        onOpenChange={(v) => {
          if (!v) setConfirm(null);
        }}
        title={confirm?.title || "Onay"}
        description={confirm?.description || ""}
        footer={
          <>
            <span className="spacer" />
            <Button onClick={() => setConfirm(null)}>Vazgeç</Button>
            <Button
              variant="danger"
              onClick={() => {
                const action = confirm?.action;
                setConfirm(null);
                action?.();
              }}
            >
              Evet, devam et
            </Button>
          </>
        }
      >
        <div />
      </Modal>
      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button aria-label="Bildirimi kapat" onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
