# Finanza

Aplicación web/PWA y Android para registrar ingresos, gastos, categorías y metas. Las cuentas usan un API PHP y una base de datos SQLite por usuario; no se requiere MySQL.

## Requisitos del servidor

- PHP 8.1 o posterior con `pdo_sqlite`, `mbstring` y `openssl`.
- Composer 2.
- HTTPS para el sitio y el API.
- Un servidor SMTP con credenciales para entregar los códigos de recuperación.
- Permisos de escritura para el directorio donde se guarde el archivo SQLite.

## Publicar en un servidor web

1. Publica los archivos web de este proyecto junto con la carpeta `api/`. Instala las dependencias PHP en el servidor con `composer install --no-dev --optimize-autoloader`.
2. Configura el servidor para que `api/index.php` sea accesible en `/api/index.php`. Si el document root es público, configura `FINANZA_DB_PATH` para que la base de datos esté **fuera del document root**. La carpeta `storage/` incluye protección para Apache, pero no reemplaza esta medida en servidores Nginx.
3. Configura estas variables de entorno en el panel del hosting, o copia `api/config.local.php.example` a `api/config.local.php` y completa sus valores. No publiques ni compartas ese archivo.
   - `FINANZA_DB_PATH`: ruta absoluta del archivo SQLite.
   - `FINANZA_ALLOWED_ORIGINS`: orígenes web y de la app que pueden llamar al API, separados por coma.
   - `FINANZA_MASTER_SETUP_CODE`: código aleatorio, largo y de un solo uso para crear la primera cuenta maestra.
   - `FINANZA_SETTINGS_ENCRYPTION_KEY`: secreto aleatorio de al menos 32 caracteres, guardado fuera de la base de datos y del código.
   - `FINANZA_SMTP_HOST`, `FINANZA_SMTP_PORT`, `FINANZA_SMTP_ENCRYPTION`, `FINANZA_SMTP_USER`, `FINANZA_SMTP_PASSWORD`.
   - `FINANZA_MAIL_FROM` y, opcionalmente, `FINANZA_MAIL_FROM_NAME`.
4. Para la web, el API usa por defecto el mismo dominio bajo `/api/index.php`.
5. Para Android, establece la URL pública HTTPS completa del API en `api-config.js`, por ejemplo `window.FINANZA_API_BASE_URL = 'https://finanzas.ejemplo.com/api/index.php';`, y vuelve a compilar/sincronizar. Agrega el origen de Capacitor (`https://localhost`) a `FINANZA_ALLOWED_ORIGINS`.

El archivo SQLite se crea al primer uso. Haz respaldos consistentes del archivo y de cualquier archivo `-wal`/`-shm` generado cuando la base de datos está activa; para un respaldo en caliente, usa la API de backup de SQLite o detén temporalmente el servicio antes de copiarlo.

## Cuentas y recuperación

- Las contraseñas se guardan con `password_hash`; las sesiones usan tokens aleatorios almacenados como hashes y caducan en 30 días.
- El código de recuperación tiene 8 dígitos, se envía por SMTP, caduca en 15 minutos y permite hasta cinco intentos.
- Se limitan los intentos de acceso y las solicitudes de recuperación. La respuesta de recuperación no revela si una dirección tiene cuenta.
- No pongas credenciales SMTP, secretos ni la base de datos dentro de JavaScript, del bundle Android, ni del repositorio.

## Administración maestra

1. Define `FINANZA_MASTER_SETUP_CODE` en la configuración privada del hosting antes de publicar o abrir el sitio. No uses un código de ejemplo y no lo compartas con clientes.
2. En la pantalla de acceso, abre **Configurar cuenta maestra** y crea el administrador con una contraseña segura de al menos 12 caracteres. La operación es atómica; después de crear la primera cuenta, la instalación queda marcada como completada de forma permanente en SQLite, incluso si la variable se conserva.
3. Retira `FINANZA_MASTER_SETUP_CODE` de la configuración del servidor inmediatamente después de completar la instalación. El API vuelve a rechazar cualquier intento de instalación tras el primer uso.
4. Las cuentas creadas desde Administración siempre son cuentas de cliente; no se puede promover una cuenta de cliente a maestra. Desactivar una cuenta o cambiar su contraseña revoca sus sesiones.
5. Si guardas SMTP desde el panel, la contraseña se cifra con AES-256-GCM. Mantén `FINANZA_SETTINGS_ENCRYPTION_KEY` como secreto estable y respaldado de forma independiente: perderlo impide descifrar la contraseña guardada. Si no vas a administrar SMTP desde el panel, puedes continuar configurándolo solo con variables de entorno.
6. La cuenta maestra puede administrar cuentas, marca, correo, sugerencias y opciones/asignaciones manuales de suscripción. Las suscripciones no procesan pagos.
7. El servidor necesita permiso de escritura en `uploads/` para guardar imágenes de marca. El API acepta únicamente PNG, JPG y WebP de hasta 2 MB y genera nombres aleatorios; bloquea la ejecución de scripts en esa carpeta. En Nginx configura una regla equivalente.

## Desarrollo local

Con XAMPP, abre la raíz del proyecto bajo `htdocs` y visita `http://localhost/finanza/`. El API web es `http://localhost/finanza/api/index.php`. Composer debe estar instalado en el entorno PHP que atiende Apache. Para probar desde un teléfono en la red local, usa la dirección LAN del equipo; `localhost` en el teléfono apunta al propio teléfono.

El bundle y los recursos Android se regeneran con:

```sh
npm run sync:android
```
