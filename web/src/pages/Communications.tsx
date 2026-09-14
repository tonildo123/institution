import React, { useState } from 'react';
import { sendCommunicationToAll } from '../services/communicationsService';
import './Communications.css';

interface Communication {
  id: string;
  title: string;
  description: string;
  fileName?: string;
  fileType?: string;
  sentAt: string;
  sentBy: string;
  status: 'enviado' | 'visto';
  delivered?: number;
  failed?: number;
}

/**
 * Página de Comunicaciones
 * Admin/Preceptor pueden enviar comunicaciones a todos los usuarios
 */

export const Communications = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: '1',
      title: 'Aviso importante',
      description: 'Reunión de padres el viernes a las 18:00',
      fileName: 'reunion.pdf',
      fileType: 'pdf',
      sentAt: '2026-09-13 10:30',
      sentBy: 'Directora María',
      status: 'visto',
      delivered: 145,
      failed: 2,
    },
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'video/mp4', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten: JPG, PNG, MP4, PDF');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('El archivo no debe superar 50MB');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError('Título y descripción son requeridos');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Enviando comunicación...');

      // Llamar Cloud Function
      const result = await sendCommunicationToAll({
        title: title.trim(),
        body: description.trim(),
        description: description.trim(),
        data: {
          type: 'communication',
          timestamp: new Date().toISOString(),
        },
      });

      console.log('✅ Respuesta de Cloud Function:', result);

      // Agregar a la lista
      const newCommunication: Communication = {
        id: result.communicationId,
        title,
        description,
        sentAt: new Date().toLocaleString('es-AR'),
        sentBy: 'Usuario Actual',
        status: 'enviado',
        delivered: result.delivered,
        failed: result.failed,
      };

      setCommunications([newCommunication, ...communications]);

      setSuccess(
        `✅ ${result.message}\n📊 Entregados: ${result.delivered}/${result.totalUsers}`
      );

      // Limpiar formulario
      setTitle('');
      setDescription('');
      setSelectedFile(null);

      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('❌ Error:', err);

      // Extraer mensaje de error amigable
      let errorMessage = 'Error al enviar la comunicación';
      if (err.message?.includes('unauthenticated')) {
        errorMessage = 'Debes estar autenticado para enviar comunicaciones';
      } else if (err.message?.includes('permission')) {
        errorMessage = 'No tienes permisos para enviar comunicaciones';
      } else if (err.code === 'functions/internal') {
        errorMessage = err.message || 'Error interno en el servidor';
      } else {
        errorMessage = err.message || errorMessage;
      }

      setError(`❌ ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="communications-container">
      <div className="communications-header">
        <h1>📤 Comunicaciones</h1>
        <p>Envía mensajes a todos los usuarios registrados</p>
      </div>

      <div className="communications-content">
        {/* Formulario */}
        <div className="form-section">
          <h2>Enviar Nueva Comunicación</h2>

          <form onSubmit={handleSend} className="communication-form">
            {error && (
              <div className="alert alert-error">
                {error.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                {success.split('\n').map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                id="title"
                type="text"
                placeholder="Ej: Aviso importante"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                maxLength={100}
              />
              <small>{title.length}/100</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                placeholder="Escribe tu mensaje..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={5}
                maxLength={1000}
              />
              <small>{description.length}/1000</small>
            </div>

            <div className="form-group">
              <label htmlFor="file">Adjunto (Opcional)</label>
              <div className="file-input-wrapper">
                <input
                  id="file"
                  type="file"
                  accept="image/jpeg,image/png,video/mp4,application/pdf"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                <div className="file-info">
                  {selectedFile ? (
                    <span>
                      ✅ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                    </span>
                  ) : (
                    <span>📎 JPG, PNG, MP4, PDF (máx 50MB)</span>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? '⏳ Enviando...' : '📤 Enviar a Todos'}
            </button>
          </form>
        </div>

        {/* Historial */}
        <div className="history-section">
          <h2>Comunicaciones Enviadas</h2>

          <div className="communications-list">
            {communications.length === 0 ? (
              <p className="empty-state">No hay comunicaciones enviadas</p>
            ) : (
              communications.map((comm) => (
                <div key={comm.id} className="communication-item">
                  <div className="comm-header">
                    <div>
                      <h3>{comm.title}</h3>
                      <p className="sender">
                        Enviado por: <strong>{comm.sentBy}</strong>
                      </p>
                      {comm.delivered !== undefined && (
                        <p className="stats">
                          📊 Entregados: <strong>{comm.delivered}</strong>
                          {comm.failed ? ` | ❌ Fallidos: ${comm.failed}` : ''}
                        </p>
                      )}
                    </div>
                    <span className={`status status-${comm.status}`}>
                      {comm.status === 'visto' ? '✓✓ Visto' : '✓ Enviado'}
                    </span>
                  </div>

                  <p className="description">{comm.description}</p>

                  {comm.fileName && (
                    <div className="file-badge">
                      {comm.fileType === 'pdf' ? '📄' : comm.fileType?.startsWith('video') ? '🎥' : '🖼️'}{' '}
                      {comm.fileName}
                    </div>
                  )}

                  <p className="timestamp">{comm.sentAt}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communications;
