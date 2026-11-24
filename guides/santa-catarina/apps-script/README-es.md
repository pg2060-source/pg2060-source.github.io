# Cómo conectar el formulario de la guía

Esta guía es para dejar andando el envío del PDF. No hace falta saber programar. Seguí los pasos en orden.

La página del sitio no manda el mail sola. Manda los datos a una dirección de Google (Apps Script). Ese script anota el contacto en una hoja y manda el email con el botón de descarga.

Vas a necesitar la cuenta de Gmail desde la que querés que salgan los mensajes. El nombre que ve la gente es **Pablo y Luisa Garcia**. La dirección de respuesta es esa cuenta de Gmail.

## 1. Creá la hoja

1. Entrá a [Google Drive](https://drive.google.com) con esa cuenta.
2. Nuevo → Hoja de cálculo de Google.
3. Ponéle un nombre, por ejemplo `Leads Santa Catarina`.

No hace falta armar columnas. La primera vez que llega alguien, el script crea una pestaña llamada **Leads** con esta fila de títulos:

`timestamp`, `name`, `email`, `country`, `travel_month`, `trip_length`, `guide_language`, `newsletter_opt_in`, `consent`, `page_language`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign`

Cada envío suma una fila. Si la misma persona pide la guía dos veces, quedan dos filas. No borramos duplicados.

## 2. Pegá el código

1. Con la hoja abierta: **Extensiones → Apps Script**.
2. Se abre un proyecto con un archivo `Código.gs` y una función de ejemplo. Borralo todo.
3. Abrí `Code.gs` de esta carpeta, copiá el archivo entero y pegalo en el editor.
4. Arriba a la izquierda, fijate que el proyecto use el entorno de ejecución **V8** (es el habitual). Si ves un error de sintaxis con `const`, cambialo en Configuración del proyecto.

## 3. Subí los tres PDF a Drive

Subí estos tres archivos a tu Drive. **No los subas al sitio ni al repositorio.** La página pública no debe tener el PDF.

- La guía en español
- La guía en inglés
- La guía en portugués

En cada archivo:

1. Clic derecho → **Compartir**.
2. En Acceso general, elegí **Cualquier persona con el enlace**.
3. El rol tiene que ser **Lector**.
4. Copiá el enlace. Empieza con `https://`.

Si el enlace pide permiso, la gente no va a poder bajar la guía.

## 4. Pegá los enlaces en el código

Al principio de `Code.gs` hay dos líneas:

```javascript
const GUIDE_URL_ES = 'PASTE_GUIDE_URL_ES_HERE';
const GUIDE_URL_EN = 'PASTE_GUIDE_URL_EN_HERE';
const GUIDE_URL_PT = 'PASTE_GUIDE_URL_PT_HERE';
```

Reemplazá `PASTE_GUIDE_URL_ES_HERE` por el enlace del PDF en español, `PASTE_GUIDE_URL_EN_HERE` por el del PDF en inglés, y `PASTE_GUIDE_URL_PT_HERE` por el del PDF en portugués. Dejá las comillas.

La página ofrece los tres idiomas del PDF. Si la persona elige portugués, el mail y el botón usan `GUIDE_URL_PT`. El mail sale en portugués cuando la página está en portugués, con el enlace del idioma que eligió. No hace falta cambiar las columnas de la hoja.

Guardá (Ctrl+S o el ícono de disco).

Los mismos tres enlaces tienen que estar en `guides/santa-catarina/script.js`, porque la página de gracias también muestra un botón de descarga por si el mail tarda. Pasale esos enlaces a quien mantiene el sitio, junto con la URL del paso 6.

## 5. Publicá la aplicación web

1. **Implementar → Nueva implementación**.
2. Tocá el engranaje al lado de "Seleccionar tipo" y elegí **Aplicación web**.
3. Descripción: `Guía Santa Catarina`.
4. **Ejecutar como:** Yo.
5. **Quién tiene acceso:** Cualquier persona.
6. **Implementar**.

Google pide permiso:

1. Elegí la cuenta.
2. Si dice que la app no está verificada, abrí **Configuración avanzada** y seguí hacia el proyecto. Es tu propio script.
3. Aceptá el acceso a la hoja y a enviar correo.

## 6. Copiá la URL y mandala

Al terminar, Google muestra una **URL de la aplicación web**. Termina en `/exec`. Copiala completa.

Esa URL es la que va en `script.js` en esta línea:

```javascript
const LEAD_ENDPOINT = 'PASTE_APPS_SCRIPT_URL_HERE';
```

Mandanos:

- `LEAD_ENDPOINT`: la URL que termina en `/exec`
- `GUIDE_URL_ES`: el enlace de Drive del PDF en español
- `GUIDE_URL_EN`: el enlace de Drive del PDF en inglés
- `GUIDE_URL_PT`: el enlace de Drive del PDF en portugués

Sin esos datos el formulario no puede entregar la guía.

## 7. Probá

1. Abrí la URL `/exec` en el navegador. Tiene que verse algo así: `{"ok":true,"service":"santa-catarina-leads"}`.
2. Cuando la página ya tenga esa URL pegada, completá el formulario con tu propio email.
3. Mirá la pestaña **Leads** (puede tardar unos segundos en aparecer) y la bandeja de entrada. El asunto es `Tu guía de Santa Catarina 🌴` o `Your Santa Catarina guide 🌴`, según el idioma que elegiste.
4. El botón del mail abre el PDF. Si no abre, el mail también trae el enlace para copiar.

Si algo falla: en Apps Script, menú **Ejecuciones**. Ahí queda el error.

## Si más adelante cambiás el código

**Implementar → Gestionar implementaciones → lápiz → Versión: Nueva versión → Implementar.**

La URL no cambia. No hace falta una implementación nueva desde cero. Si creás otra, la URL vieja deja de servir y hay que actualizar `LEAD_ENDPOINT`.

## Cuántos mails se pueden mandar

Una cuenta personal de Gmail, con MailApp, puede enviar alrededor de **100 mails por día**. El límite lo pone Google y puede variar. Si esperás más pedidos por día, hace falta una cuenta de Google Workspace, que tiene un cupo más alto.

El script usa `MailApp`. El mensaje queda enviado desde tu cuenta, con el nombre Pablo y Luisa Garcia. Si el mail no sale pero la fila sí se guardó, la persona igual puede usar el botón de descarga de la página de gracias.

## Qué no guarda

Si el campo trampa (honeypot) viene con texto, el script responde que está bien y no escribe la fila ni manda el mail. Sirve para que los bots no llenen la hoja.
