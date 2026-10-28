import {
  priorityLabels,
  type Board,
  type Column,
  type Task,
  tones,
} from "./model";
let cachedFont: Promise<string> | undefined;
function loadFont() {
  return (cachedFont ??= (async () => {
    const r = await fetch(
      new URL("fonts/NotoSans-Regular.ttf", document.baseURI),
    );
    if (!r.ok) throw Error("Yazı tipi yüklenemedi.");
    const bytes = new Uint8Array(await r.arrayBuffer());
    let s = "";
    for (let i = 0; i < bytes.length; i += 8192)
      s += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(s);
  })().catch((e) => {
    cachedFont = undefined;
    throw e;
  }));
}
export async function downloadColumnPdf(
  brand: string,
  board: Board,
  column: Column,
  tasks: Task[],
) {
  const [{ jsPDF }, font] = await Promise.all([import("jspdf"), loadFont()]);
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.addFileToVFS("NotoSans.ttf", font);
  doc.addFont("NotoSans.ttf", "NotoSans", "normal");
  doc.setFont("NotoSans");
  doc.setProperties({
    title: `${board.name} - ${column.title}`,
    subject: "Kanban sütun raporu",
    creator: brand,
    author: brand,
  });
  const hex = tones.find((t) => t.value === column.color)!.hex;
  let y = 0;
  const header = () => {
    doc.setFillColor(hex);
    doc.rect(0, 0, 210, 3, "F");
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text(`${brand} / ${board.name}`, 18, 15);
    doc.setTextColor(28, 35, 46);
    doc.setFontSize(21);
    const heading = doc.splitTextToSize(column.title, 174) as string[];
    doc.text(heading, 18, 29);
    const offset = (heading.length - 1) * 9;
    doc.setFontSize(9);
    doc.setTextColor(105);
    doc.text(
      `${tasks.length} görev · ${new Date().toLocaleDateString("tr-TR")}`,
      18,
      37 + offset,
    );
    doc.setDrawColor(224, 228, 234);
    doc.line(18, 43 + offset, 192, 43 + offset);
    y = 52 + offset;
  };
  header();
  const ensure = (h: number) => {
    if (y + h > 278) {
      doc.addPage();
      header();
    }
  };
  const write = (text: string, size = 10, color = "#394253", indent = 0) => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, 174 - indent) as string[];
    for (const line of lines) {
      ensure(6);
      doc.text(line, 18 + indent, y);
      y += size > 12 ? 7 : 5;
    }
  };
  if (!tasks.length) write("Bu sütunda görev bulunmuyor.");
  tasks.forEach((t, index) => {
    ensure(35);
    write(`${String(index + 1).padStart(2, "0")}  ${t.title}`, 13, "#172131");
    y += 2;
    write(
      `${priorityLabels[t.priority]} öncelik${t.date ? "  |  " + new Date(t.date + "T12:00:00").toLocaleDateString("tr-TR") : ""}  |  ${t.assignee === "self" ? "Bana atanan" : "Atanmamış"}`,
      9,
      "#697386",
    );
    if (t.tags.length) write(t.tags.join(" / "), 9, hex);
    if (t.description) {
      y += 3;
      write(t.description);
    }
    if (t.checklist.length) {
      y += 3;
      write("Kontrol listesi", 10, "#172131");
      t.checklist.forEach((c) =>
        write(
          `${c.done ? "[x]" : "[ ]"} ${c.text}`,
          10,
          c.done ? "#697386" : "#394253",
          3,
        ),
      );
    }
    y += 7;
    ensure(3);
    doc.setDrawColor(232, 235, 239);
    doc.line(18, y, 192, y);
    y += 8;
  });
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text("Bu rapor seçilen sütundaki tüm görevleri içerir.", 18, 289);
    doc.text(`${i} / ${pages}`, 192, 289, { align: "right" });
  }
  const slug = (s: string) =>
    s
      .toLocaleLowerCase("tr")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  await doc.save(
    `${slug(brand)}-${slug(board.name)}-${slug(column.title)}.pdf`,
    { returnPromise: true },
  );
}
