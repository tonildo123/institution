import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PublicShell } from './PublicPages';

const supportEmail = 'kit.institucional@gmail.com';

export default function Support() {
  const [prepared, setPrepared] = useState(false);
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const subject = `${values.get('request')} — KIT IMEP`;
    const body = `Nombre y apellido: ${values.get('name')}\nEmail de la cuenta: ${values.get('email')}\nInstitución: ${values.get('institution')}\nSolicitud: ${values.get('request')}\n\nDetalle de los datos que solicito eliminar o de mi consulta:\n${values.get('details')}`;
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setPrepared(true);
  }
  return (
    <PublicShell title="Soporte y eliminación de datos de KIT IMEP">
      <article className="legal-document">
        <p>Contactá a administración para recibir ayuda o solicitar la eliminación de tus datos personales o de tu cuenta de KIT IMEP. No necesitás iniciar sesión ni tener la app instalada.</p>
        <section id="eliminacion-de-datos" aria-labelledby="deletion-title">
          <h2 id="deletion-title">Cómo solicitar la eliminación</h2>
          <ol>
            <li>Elegí si querés eliminar determinados datos o tu cuenta y sus datos asociados.</li>
            <li>Completá el formulario con tu nombre, el email de tu cuenta, tu institución y el detalle de la solicitud.</li>
            <li>Presioná «Preparar email» y enviá el mensaje desde tu aplicación de correo, preferentemente desde el email registrado.</li>
          </ol>
          <p>También podés escribir directamente a <a href={`mailto:${supportEmail}`}>{supportEmail}</a> con el asunto «Eliminar datos KIT IMEP» o «Eliminar cuenta KIT IMEP», indicando esos mismos datos. Si no tenés acceso al email registrado, explicalo para que administración pueda verificar tu identidad por otro medio.</p>
          <p>Administración atenderá tu solicitud dentro de las 24 horas de recibido el correo. La revisión es manual: verificará tu identidad y el alcance del pedido antes de eliminar datos. No incluyas contraseñas, copias de documentos ni datos de salud en el mensaje inicial.</p>
        </section>
        <h2>Datos incluidos en la solicitud</h2>
        <p>Podés solicitar la eliminación de datos de perfil y contacto, foto de perfil, reportes y archivos personales asociados. Al solicitar eliminar la cuenta, el pedido incluye también las credenciales de acceso, preferencias, tokens de notificaciones y los demás datos personales vinculados a ella. Indicá si querés eliminar solo algunos datos y conservar tu cuenta.</p>
        <p>Si la solicitud incluye datos de alumnos a tu cargo, identificá qué información querés eliminar. Administración verificará tu vínculo y revisará si existen registros escolares o derechos de otras personas que deban respetarse.</p>
        <p>Antes de completar el pedido, administración te informará si corresponde conservar registros institucionales o datos por una obligación legal, cuáles son, el motivo y el plazo de conservación aplicable. Podés consultar el estado de tu solicitud en el mismo correo.</p>
        <h2>Enviar una solicitud a administración</h2>
        <form className="support-form" onSubmit={prepareEmail}>
          <label>Tipo de solicitud<select name="request" required>
            <option>Eliminar mis datos</option>
            <option>Eliminar mi cuenta y los datos asociados</option>
            <option>Consulta de soporte</option>
          </select></label>
          <label>Nombre y apellido<input name="name" autoComplete="name" required maxLength={150} /></label>
          <label>Email de la cuenta<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>Institución<input name="institution" required maxLength={200} /></label>
          <label>Detalle de la solicitud<textarea name="details" rows={5} required maxLength={3000} /></label>
          <p>El formulario prepara un email en tu aplicación de correo. La solicitud se envía cuando confirmás el envío allí.</p>
          <button className="button button-solid" type="submit">Preparar email</button>
          {prepared && <p role="status">Se solicitó abrir tu aplicación de correo. Revisá y enviá el mensaje. Si no se abrió, escribí directamente a {supportEmail}.</p>}
        </form>
        <p>Consultá también nuestra <Link to="/privacidad">Política de privacidad</Link>.</p>
      </article>
    </PublicShell>
  );
}
