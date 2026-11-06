import { useEffect, useMemo, useState } from 'react';
import {
  deleteReportedImage,
  formatWhen,
  getReportOwner,
  listImageReports,
  REPORT_STATUS_LABEL,
  setImageReportStatus,
  setUserEnabled,
  sourceKind,
  type ImageReport,
  type ImageReportStatus,
  type ReportOwner,
} from '@/services/imageReportsService';
import './ImageReports.css';

/** Reportes de imágenes: lista a la izquierda y, al elegir uno, la imagen y las acciones a la derecha. */
const ImageReports = () => {
  const [reports, setReports] = useState<ImageReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [owner, setOwner] = useState<ReportOwner | null>(null);
  const [filter, setFilter] = useState<ImageReportStatus | 'todos'>('todos');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setReports(await listImageReports());
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selected = useMemo(() => reports.find((r) => r.id === selectedId) ?? null, [reports, selectedId]);
  const visible = filter === 'todos' ? reports : reports.filter((r) => r.status === filter);

  // Datos del dueño de la imagen (para mostrar su nombre y si está bloqueado)
  useEffect(() => {
    setOwner(null);
    if (!selected) return;
    getReportOwner(selected.ownerId).then(setOwner).catch(() => setOwner(null));
  }, [selected?.ownerId]);

  // Ejecuta una acción del panel y recarga los datos
  const run = async (action: () => Promise<unknown>, okText: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage({ type: 'ok', text: okText });
      await load();
      if (selected) setOwner(await getReportOwner(selected.ownerId));
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = (status: ImageReportStatus) => {
    if (!selected) return;
    void run(() => setImageReportStatus(selected.id, status), 'Estado actualizado.');
  };

  const removePhoto = () => {
    if (!selected) return;
    if (!window.confirm('¿Borrar la imagen reportada? Se quita del mensaje o entrega para todos y no se puede deshacer.')) return;
    void run(() => deleteReportedImage(selected.id), 'Imagen borrada.');
  };

  const toggleBlock = () => {
    if (!selected || !owner) return;
    const enable = !owner.isEnabled;
    const question = enable
      ? `¿Desbloquear a ${owner.displayName}?`
      : `¿Bloquear a ${owner.displayName}? No podrá ingresar a la app hasta que lo habilites de nuevo.`;
    if (!window.confirm(question)) return;
    void run(() => setUserEnabled(selected.ownerId, enable), enable ? 'Usuario habilitado.' : 'Usuario bloqueado.');
  };

  const imageRemoved = !!selected?.imageRemovedAt;

  return (
    <section className="reports">
      <header className="reports-header">
        <h2>Reportes de imágenes</h2>
        <select className="reports-filter" value={filter} onChange={(e) => setFilter(e.target.value as ImageReportStatus | 'todos')}>
          <option value="todos">Todos los estados</option>
          {Object.entries(REPORT_STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </header>

      {message && <p className={message.type === 'ok' ? 'reports-ok' : 'reports-error'}>{message.text}</p>}

      <div className="reports-body">
        <div className="reports-list">
          {loading && <p className="reports-muted">Cargando…</p>}
          {!loading && visible.length === 0 && <p className="reports-muted">No hay reportes en este estado.</p>}
          {visible.map((report) => (
            <button
              key={report.id}
              type="button"
              className={`reports-item ${report.id === selectedId ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(report.id)}
            >
              <span className="reports-item-title">{sourceKind(report.sourcePath)} · {report.reporterName}</span>
              <span className="reports-muted">{formatWhen(report.createdAt)} · {REPORT_STATUS_LABEL[report.status]}</span>
            </button>
          ))}
        </div>

        <div className="reports-detail">
          {!selected && <p className="reports-muted">Elegí un reporte para ver la imagen y las acciones.</p>}
          {selected && (
            <>
              {imageRemoved ? (
                <p className="reports-muted">Esta imagen ya fue borrada.</p>
              ) : (
                <img className="reports-image" src={selected.imageURL} alt="Imagen reportada" />
              )}

              <dl className="reports-facts">
                <dt>Origen</dt><dd>{sourceKind(selected.sourcePath)}</dd>
                <dt>Reportó</dt><dd>{selected.reporterName} ({selected.reporterRole})</dd>
                <dt>Fecha</dt><dd>{formatWhen(selected.createdAt)}</dd>
                <dt>Motivo</dt><dd>{selected.reason || <span className="reports-muted">Sin motivo</span>}</dd>
                <dt>Dueño de la imagen</dt><dd>{owner ? `${owner.displayName} (${owner.role})${owner.isEnabled ? '' : ' · bloqueado'}` : '—'}</dd>
              </dl>

              <label className="reports-field">
                Estado
                <select value={selected.status} disabled={busy} onChange={(e) => changeStatus(e.target.value as ImageReportStatus)}>
                  {Object.entries(REPORT_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>

              <div className="reports-actions">
                <button type="button" className="reports-danger" disabled={busy || imageRemoved} onClick={removePhoto}>
                  Borrar foto
                </button>
                <button
                  type="button"
                  className="reports-danger"
                  disabled={busy || !owner || owner.role === 'admin' || owner.role === 'equipo directivo' || owner.role === 'representante legal'}
                  onClick={toggleBlock}
                >
                  {owner?.isEnabled === false ? 'Desbloquear usuario' : 'Bloquear usuario'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImageReports;
