export function ShowcaseSwitcher({
  current,
}: {
  current: "mova" | "rota" | "katman";
}) {
  return (
    <nav className="showcase-switcher" aria-label="Proje değiştir">
      <a className="showcase-home" href="../" aria-label="Tüm projelere dön">
        ↖ <span>Tüm projeler</span>
      </a>
      <span className="showcase-separator" />
      {[
        { id: "mova", name: "Mova" },
        { id: "rota", name: "Rota" },
        { id: "katman", name: "Katman" },
      ].map((app) => (
        <a
          key={app.id}
          href={`../${app.id}/`}
          className={`showcase-${app.id}`}
          aria-current={app.id === current ? "page" : undefined}
        >
          {app.name}
        </a>
      ))}
    </nav>
  );
}
