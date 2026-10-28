<?php
declare(strict_types=1);

use PHPMailer\PHPMailer\Exception as MailException;
use PHPMailer\PHPMailer\PHPMailer;

require_once dirname(__DIR__) . '/vendor/autoload.php';
$localConfigPath = __DIR__ . '/config.local.php';
$GLOBALS['finanza_config'] = is_file($localConfigPath) ? require $localConfigPath : [];

const RESET_CODE_LIFETIME = 900;
const EMAIL_VERIFICATION_LIFETIME = 86400;
const ACCESS_TOKEN_LIFETIME = 2592000;
const MAX_REQUEST_BYTES = 65536;
const TERMS_VERSION = '1.0-2026-10-27';

final class ApiError extends RuntimeException
{
    public int $status;

    public function __construct(int $status, string $message)
    {
        parent::__construct($message);
        $this->status = $status;
    }
}

function jsonResponse(int $status, array $payload): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function envValue(string $name, string $default = ''): string
{
    $value = getenv($name);
    if ($value !== false) {
        return trim($value);
    }

    $localValue = $GLOBALS['finanza_config'][$name] ?? null;
    return is_string($localValue) ? trim($localValue) : $default;
}

function configureCors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }

    $allowed = array_filter(array_map('trim', explode(',', envValue(
        'FINANZA_ALLOWED_ORIGINS',
        'https://localhost,capacitor://localhost,http://localhost'
    ))));
    $requestHost = strtolower($_SERVER['HTTP_HOST'] ?? '');
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));

    if (in_array($origin, $allowed, true) || ($requestHost !== '' && $originHost === explode(':', $requestHost)[0])) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        header('Access-Control-Max-Age: 600');
    }
}

function database(): PDO
{
    static $connection = null;
    if ($connection instanceof PDO) {
        return $connection;
    }

    $databasePath = envValue('FINANZA_DB_PATH', dirname(__DIR__) . '/storage/finanza.sqlite');
    $directory = dirname($databasePath);
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Could not create the SQLite storage directory.');
    }

    $connection = new PDO('sqlite:' . $databasePath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);
    $connection->exec('PRAGMA foreign_keys = ON');
    $connection->exec('PRAGMA journal_mode = WAL');
    $connection->exec('PRAGMA busy_timeout = 5000');
    $connection->exec(
        'CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT \'user\',
            is_active INTEGER NOT NULL DEFAULT 1,
            email_verified INTEGER NOT NULL DEFAULT 1,
            onboarding_completed INTEGER NOT NULL DEFAULT 1,
            paid_access_required INTEGER NOT NULL DEFAULT 0,
            timezone TEXT NOT NULL DEFAULT \'UTC\',
            terms_version TEXT NOT NULL DEFAULT \'\',
            terms_accepted_at INTEGER,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS auth_tokens (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS auth_tokens_user_id ON auth_tokens(user_id);
        CREATE TABLE IF NOT EXISTS password_resets (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            code_hash TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            last_sent_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS email_verifications (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            code_hash TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            last_sent_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS rate_limits (
            limiter_key TEXT PRIMARY KEY,
            attempts INTEGER NOT NULL,
            window_started_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL COLLATE NOCASE,
            created_at INTEGER NOT NULL,
            UNIQUE(user_id, name)
        );
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN (\'income\', \'expense\')),
            amount REAL NOT NULL CHECK(amount > 0),
            currency TEXT NOT NULL DEFAULT \'PEN\',
            exchange_rate REAL NOT NULL DEFAULT 1 CHECK(exchange_rate > 0),
            base_currency TEXT NOT NULL DEFAULT \'PEN\',
            date TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS transactions_user_date ON transactions(user_id, date DESC);
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            target REAL NOT NULL CHECK(target > 0),
            current REAL NOT NULL CHECK(current >= 0),
            currency TEXT NOT NULL DEFAULT \'PEN\',
            due_date TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS goals_user_id ON goals(user_id);
        CREATE TABLE IF NOT EXISTS scheduled_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL CHECK(amount > 0),
            currency TEXT NOT NULL,
            exchange_rate REAL NOT NULL CHECK(exchange_rate > 0),
            base_currency TEXT NOT NULL,
            recurrence TEXT NOT NULL CHECK(recurrence IN (\'once\', \'monthly\', \'yearly\')),
            anchor_month INTEGER NOT NULL CHECK(anchor_month BETWEEN 1 AND 12),
            anchor_day INTEGER NOT NULL CHECK(anchor_day BETWEEN 1 AND 31),
            reminder_time TEXT NOT NULL,
            timezone TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS scheduled_payments_user ON scheduled_payments(user_id, active);
        CREATE TABLE IF NOT EXISTS payment_occurrences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            payment_id INTEGER NOT NULL REFERENCES scheduled_payments(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            due_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT \'pending\' CHECK(status IN (\'pending\', \'paid\')),
            transaction_id INTEGER,
            created_at INTEGER NOT NULL,
            paid_at INTEGER,
            UNIQUE(payment_id, due_date)
        );
        CREATE INDEX IF NOT EXISTS payment_occurrences_user_due ON payment_occurrences(user_id, status, due_date);
        CREATE TABLE IF NOT EXISTS debts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            lender TEXT NOT NULL,
            original_amount REAL NOT NULL CHECK(original_amount > 0),
            balance REAL NOT NULL CHECK(balance >= 0),
            currency TEXT NOT NULL,
            exchange_rate REAL NOT NULL CHECK(exchange_rate > 0),
            base_currency TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS debts_user ON debts(user_id, balance);
        CREATE TABLE IF NOT EXISTS debt_payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            debt_id INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            principal_amount REAL NOT NULL CHECK(principal_amount >= 0),
            charges_amount REAL NOT NULL CHECK(charges_amount >= 0),
            currency TEXT NOT NULL,
            paid_date TEXT NOT NULL,
            transaction_id INTEGER,
            created_at INTEGER NOT NULL,
            CHECK(principal_amount + charges_amount > 0)
        );
        CREATE INDEX IF NOT EXISTS debt_payments_user ON debt_payments(user_id, paid_date DESC);
        CREATE TABLE IF NOT EXISTS budgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category TEXT NOT NULL COLLATE NOCASE,
            amount REAL NOT NULL CHECK(amount > 0),
            currency TEXT NOT NULL,
            updated_at INTEGER NOT NULL,
            UNIQUE(user_id, category)
        );
        CREATE TABLE IF NOT EXISTS emergency_funds (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            target_amount REAL NOT NULL CHECK(target_amount > 0),
            current_amount REAL NOT NULL CHECK(current_amount >= 0),
            currency TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS daily_payment_alerts (
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            local_date TEXT NOT NULL,
            status TEXT NOT NULL CHECK(status IN (\'processing\', \'sent\', \'failed\')),
            created_at INTEGER NOT NULL,
            sent_at INTEGER,
            PRIMARY KEY(user_id, local_date)
        );
        CREATE TABLE IF NOT EXISTS payment_reminders (
            occurrence_id INTEGER NOT NULL REFERENCES payment_occurrences(id) ON DELETE CASCADE,
            reminder_type TEXT NOT NULL CHECK(reminder_type IN (\'day_before\', \'due_day\')),
            status TEXT NOT NULL CHECK(status IN (\'processing\', \'sent\', \'failed\')),
            created_at INTEGER NOT NULL,
            sent_at INTEGER,
            PRIMARY KEY(occurrence_id, reminder_type)
        );
        CREATE TABLE IF NOT EXISTS app_settings (
            setting_key TEXT PRIMARY KEY,
            setting_value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS setup_state (
            setup_key TEXT PRIMARY KEY,
            consumed_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS suggestions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT \'new\' CHECK(status IN (\'new\', \'reviewing\', \'resolved\')),
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS subscription_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE COLLATE NOCASE,
            description TEXT NOT NULL DEFAULT \'\',
            features_json TEXT NOT NULL DEFAULT \'[]\',
            billing_period TEXT NOT NULL DEFAULT \'custom\',
            price_amount REAL NOT NULL DEFAULT 0,
            price_currency TEXT NOT NULL DEFAULT \'PEN\',
            trial_days INTEGER NOT NULL DEFAULT 0,
            active INTEGER NOT NULL DEFAULT 1,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS subscription_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            option_id INTEGER NOT NULL REFERENCES subscription_options(id),
            status TEXT NOT NULL DEFAULT \'active\' CHECK(status IN (\'active\', \'paused\', \'cancelled\')),
            starts_at TEXT NOT NULL,
            ends_at TEXT,
            is_trial INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS subscription_assignments_user ON subscription_assignments(user_id);
        CREATE TABLE IF NOT EXISTS ai_subscription_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status TEXT NOT NULL DEFAULT \'pending\' CHECK(status IN (\'pending\', \'paid\', \'rejected\')),
            requested_at INTEGER NOT NULL,
            processed_at INTEGER
        );
        CREATE INDEX IF NOT EXISTS ai_subscription_requests_status ON ai_subscription_requests(status, requested_at DESC);
        CREATE UNIQUE INDEX IF NOT EXISTS ai_subscription_requests_one_pending
            ON ai_subscription_requests(user_id) WHERE status = \'pending\';
        CREATE TABLE IF NOT EXISTS plan_payment_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            option_id INTEGER NOT NULL REFERENCES subscription_options(id),
            payment_method TEXT NOT NULL,
            payment_reference TEXT NOT NULL,
            payment_currency TEXT NOT NULL DEFAULT \'PEN\',
            payment_amount REAL NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT \'pending\' CHECK(status IN (\'pending\', \'approved\', \'rejected\')),
            requested_at INTEGER NOT NULL,
            processed_at INTEGER
        );
        CREATE INDEX IF NOT EXISTS plan_payment_requests_status ON plan_payment_requests(status, requested_at DESC)'
    );
    $userColumns = array_column($connection->query('PRAGMA table_info(users)')->fetchAll(), 'name');
    if (!in_array('role', $userColumns, true)) {
        $connection->exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
    }
    if (!in_array('is_active', $userColumns, true)) {
        $connection->exec('ALTER TABLE users ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1');
    }
    if (!in_array('email_verified', $userColumns, true)) {
        $connection->exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 1');
    }
    if (!in_array('onboarding_completed', $userColumns, true)) {
        $connection->exec('ALTER TABLE users ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 1');
    }
    if (!in_array('paid_access_required', $userColumns, true)) {
        $connection->exec('ALTER TABLE users ADD COLUMN paid_access_required INTEGER NOT NULL DEFAULT 0');
    }
    if (!in_array('terms_version', $userColumns, true)) {
        $connection->exec("ALTER TABLE users ADD COLUMN terms_version TEXT NOT NULL DEFAULT ''");
    }
    if (!in_array('terms_accepted_at', $userColumns, true)) {
        $connection->exec('ALTER TABLE users ADD COLUMN terms_accepted_at INTEGER');
    }
    if (!in_array('timezone', $userColumns, true)) {
        $connection->exec("ALTER TABLE users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'UTC'");
    }
    if (!in_array('trial_started_at', $userColumns, true)) {
        $connection->exec('ALTER TABLE users ADD COLUMN trial_started_at TEXT');
    }
    $subscriptionOptionColumns = array_column($connection->query('PRAGMA table_info(subscription_options)')->fetchAll(), 'name');
    if (!in_array('billing_period', $subscriptionOptionColumns, true)) {
        $connection->exec("ALTER TABLE subscription_options ADD COLUMN billing_period TEXT NOT NULL DEFAULT 'custom'");
    }
    if (!in_array('price_amount', $subscriptionOptionColumns, true)) {
        $connection->exec('ALTER TABLE subscription_options ADD COLUMN price_amount REAL NOT NULL DEFAULT 0');
    }
    if (!in_array('price_currency', $subscriptionOptionColumns, true)) {
        $connection->exec("ALTER TABLE subscription_options ADD COLUMN price_currency TEXT NOT NULL DEFAULT 'PEN'");
    }
    if (!in_array('trial_days', $subscriptionOptionColumns, true)) {
        $connection->exec('ALTER TABLE subscription_options ADD COLUMN trial_days INTEGER NOT NULL DEFAULT 0');
    }
    $assignmentColumns = array_column($connection->query('PRAGMA table_info(subscription_assignments)')->fetchAll(), 'name');
    if (!in_array('is_trial', $assignmentColumns, true)) {
        $connection->exec('ALTER TABLE subscription_assignments ADD COLUMN is_trial INTEGER NOT NULL DEFAULT 0');
    }
    $paymentRequestColumns = array_column($connection->query('PRAGMA table_info(plan_payment_requests)')->fetchAll(), 'name');
    if (!in_array('payment_currency', $paymentRequestColumns, true)) {
        $connection->exec("ALTER TABLE plan_payment_requests ADD COLUMN payment_currency TEXT NOT NULL DEFAULT 'PEN'");
    }
    if (!in_array('payment_amount', $paymentRequestColumns, true)) {
        $connection->exec('ALTER TABLE plan_payment_requests ADD COLUMN payment_amount REAL NOT NULL DEFAULT 0');
    }
    $connection->exec(
        "INSERT OR IGNORE INTO subscription_options (name, description, features_json, billing_period, price_amount, price_currency, trial_days, active, created_at)
         VALUES
         ('Gratis', 'Registro financiero básico, resumen y una meta de ahorro.', '[]', 'free', 0, 'PEN', 0, 1, strftime('%s','now')),
         ('Mensual', 'Funciones Pro por S/ 10 al mes. Acceso habilitado tras confirmar el pago.', '[\"Pagos y deudas\",\"Alertas por correo\",\"Presupuestos\",\"Reportes\"]', 'monthly', 10, 'PEN', 0, 1, strftime('%s','now')),
         ('Anual', 'Funciones Pro por S/ 150 al año.', '[\"Pagos y deudas\",\"Alertas por correo\",\"Presupuestos\",\"Reportes\"]', 'yearly', 150, 'PEN', 10, 1, strftime('%s','now'))"
    );
    $connection->exec(
        "UPDATE subscription_options
         SET description = 'Funciones Pro por S/ 10 al mes. Acceso habilitado tras confirmar el pago.',
             price_amount = 10, price_currency = 'PEN', trial_days = 0
         WHERE billing_period = 'monthly' AND active = 1
           AND (price_amount != 10 OR price_currency != 'PEN' OR trial_days != 0)"
    );
    $connection->exec("UPDATE subscription_options SET trial_days = 0 WHERE billing_period = 'yearly'");
    $monthlyPlan = $connection->query(
        "SELECT id, trial_days FROM subscription_options WHERE billing_period = 'monthly' AND active = 1 LIMIT 1"
    )->fetch();
    if ($monthlyPlan && (int) $monthlyPlan['trial_days'] > 0) {
        $trialStart = (new DateTimeImmutable('today'))->format('Y-m-d');
        $trialEnd = (new DateTimeImmutable($trialStart))
            ->modify('+' . ((int) $monthlyPlan['trial_days'] - 1) . ' days')
            ->format('Y-m-d');
        $connection->beginTransaction();
        try {
            $connection->prepare(
                "UPDATE users SET trial_started_at = (
                     SELECT MIN(subscription_assignments.starts_at)
                     FROM subscription_assignments
                     JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
                     WHERE subscription_assignments.user_id = users.id
                       AND subscription_options.billing_period IN ('monthly', 'yearly')
                 )
                 WHERE role = 'user' AND paid_access_required = 0 AND trial_started_at IS NULL
                   AND EXISTS (
                     SELECT 1 FROM subscription_assignments
                     JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
                     WHERE subscription_assignments.user_id = users.id
                       AND subscription_options.billing_period IN ('monthly', 'yearly')
                   )"
            )->execute();
            $connection->prepare(
                "INSERT INTO subscription_assignments
                    (user_id, option_id, status, starts_at, ends_at, is_trial, created_at)
                 SELECT users.id, ?, 'active', ?, ?, 1, ?
                 FROM users
                 WHERE users.role = 'user' AND users.is_active = 1 AND users.email_verified = 1
                   AND users.paid_access_required = 0
                   AND users.trial_started_at IS NULL
                   AND NOT EXISTS (
                     SELECT 1 FROM subscription_assignments
                     JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
                     WHERE subscription_assignments.user_id = users.id
                       AND subscription_options.billing_period IN ('monthly', 'yearly')
                   )"
            )->execute([(int) $monthlyPlan['id'], $trialStart, $trialEnd, time()]);
            $connection->prepare(
                "UPDATE users SET trial_started_at = ?
                 WHERE role = 'user' AND is_active = 1 AND email_verified = 1 AND paid_access_required = 0 AND trial_started_at IS NULL
                   AND NOT EXISTS (
                     SELECT 1 FROM subscription_assignments
                     JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
                     WHERE subscription_assignments.user_id = users.id
                       AND subscription_options.billing_period IN ('monthly', 'yearly')
                   )"
            )->execute([$trialStart]);
            $connection->commit();
        } catch (Throwable $error) {
            $connection->rollBack();
            throw $error;
        }
    }
    $transactionColumns = array_column($connection->query('PRAGMA table_info(transactions)')->fetchAll(), 'name');
    if (!in_array('currency', $transactionColumns, true)) {
        $connection->exec("ALTER TABLE transactions ADD COLUMN currency TEXT NOT NULL DEFAULT 'PEN'");
    }
    if (!in_array('exchange_rate', $transactionColumns, true)) {
        $connection->exec('ALTER TABLE transactions ADD COLUMN exchange_rate REAL NOT NULL DEFAULT 1');
    }
    if (!in_array('base_currency', $transactionColumns, true)) {
        $connection->exec("ALTER TABLE transactions ADD COLUMN base_currency TEXT NOT NULL DEFAULT 'PEN'");
    }
    $goalColumns = array_column($connection->query('PRAGMA table_info(goals)')->fetchAll(), 'name');
    if (!in_array('currency', $goalColumns, true)) {
        $connection->exec("ALTER TABLE goals ADD COLUMN currency TEXT NOT NULL DEFAULT 'PEN'");
    }

    return $connection;
}

function requestData(): array
{
    $length = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if (str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'multipart/form-data')) {
        if ($length > 3145728) {
            throw new ApiError(413, 'El archivo supera el tamaño permitido.');
        }
        return [];
    }
    if ($length > MAX_REQUEST_BYTES) {
        throw new ApiError(413, 'La solicitud es demasiado grande.');
    }

    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new ApiError(400, 'El cuerpo de la solicitud no es JSON válido.');
    }

    return $data;
}

function requiredString(array $data, string $key, int $maxLength): string
{
    $value = $data[$key] ?? null;
    if (!is_string($value)) {
        throw new ApiError(422, 'Completa los campos requeridos.');
    }
    $value = trim($value);
    if ($value === '' || mb_strlen($value) > $maxLength) {
        throw new ApiError(422, 'Revisa los campos ingresados.');
    }
    return $value;
}

function validDateString(array $data, string $key): string
{
    $value = requiredString($data, $key, 10);
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    if (!$date || $date->format('Y-m-d') !== $value) {
        throw new ApiError(422, 'La fecha no es válida.');
    }
    return $value;
}

function enforceRateLimit(string $key, int $limit, int $windowSeconds): void
{
    $db = database();
    $now = time();
    $statement = $db->prepare('SELECT attempts, window_started_at FROM rate_limits WHERE limiter_key = ?');
    $statement->execute([$key]);
    $row = $statement->fetch();

    if (!$row || $now - (int) $row['window_started_at'] >= $windowSeconds) {
        $upsert = $db->prepare(
            'INSERT INTO rate_limits (limiter_key, attempts, window_started_at) VALUES (?, 1, ?)
             ON CONFLICT(limiter_key) DO UPDATE SET attempts = 1, window_started_at = excluded.window_started_at'
        );
        $upsert->execute([$key, $now]);
        return;
    }

    if ((int) $row['attempts'] >= $limit) {
        throw new ApiError(429, 'Demasiados intentos. Espera un momento y vuelve a intentar.');
    }

    $update = $db->prepare('UPDATE rate_limits SET attempts = attempts + 1 WHERE limiter_key = ?');
    $update->execute([$key]);
}

function activationResendCooldownRemaining(string $key): int
{
    $statement = database()->prepare('SELECT attempts, window_started_at FROM rate_limits WHERE limiter_key = ?');
    $statement->execute([$key]);
    $row = $statement->fetch();
    if (!$row) {
        return 0;
    }

    $cooldowns = [300, 600, 1800, 3600, 18000];
    $cooldown = $cooldowns[min(max(0, (int) $row['attempts'] - 1), count($cooldowns) - 1)];
    return max(0, $cooldown - (time() - (int) $row['window_started_at']));
}

function recordActivationResend(string $key): void
{
    $statement = database()->prepare(
        'INSERT INTO rate_limits (limiter_key, attempts, window_started_at) VALUES (?, 1, ?)
         ON CONFLICT(limiter_key) DO UPDATE SET attempts = rate_limits.attempts + 1,
         window_started_at = excluded.window_started_at'
    );
    $statement->execute([$key, time()]);
}

function issueToken(int $userId): string
{
    $token = bin2hex(random_bytes(32));
    $statement = database()->prepare(
        'INSERT INTO auth_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)'
    );
    $statement->execute([hash('sha256', $token), $userId, time() + ACCESS_TOKEN_LIFETIME, time()]);
    return $token;
}

function authorizationHeader(): string
{
    foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION'] as $key) {
        $value = $_SERVER[$key] ?? '';
        if (is_string($value) && $value !== '') {
            return $value;
        }
    }

    if (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp((string) $name, 'Authorization') === 0 && is_string($value)) {
                return $value;
            }
        }
    }

    return '';
}

function authenticatedUser(): array
{
    $header = authorizationHeader();
    if (!preg_match('/^Bearer ([a-f0-9]{64})$/i', $header, $matches)) {
        throw new ApiError(401, 'Inicia sesión para continuar.');
    }

    $statement = database()->prepare(
        'SELECT users.id, users.name, users.email, users.role, users.onboarding_completed,
                users.paid_access_required, auth_tokens.token_hash
         FROM auth_tokens JOIN users ON users.id = auth_tokens.user_id
         WHERE auth_tokens.token_hash = ? AND auth_tokens.expires_at > ?
           AND users.is_active = 1 AND users.email_verified = 1'
    );
    $statement->execute([hash('sha256', $matches[1]), time()]);
    $user = $statement->fetch();
    if (!$user) {
        throw new ApiError(401, 'La sesión expiró. Inicia sesión de nuevo.');
    }
    return $user;
}

function userHasPaidAccess(array $user): bool
{
    if (($user['role'] ?? '') === 'master' || !(int) ($user['paid_access_required'] ?? 0)) {
        return true;
    }
    $statement = database()->prepare(
        "SELECT 1 FROM subscription_assignments
         JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
         WHERE subscription_assignments.user_id = ? AND subscription_assignments.status = 'active'
           AND subscription_assignments.is_trial = 0
           AND subscription_options.billing_period IN ('monthly', 'yearly')
           AND subscription_assignments.starts_at <= ?
           AND (subscription_assignments.ends_at IS NULL OR subscription_assignments.ends_at >= ?)
         LIMIT 1"
    );
    $today = date('Y-m-d');
    $statement->execute([(int) $user['id'], $today, $today]);
    return (bool) $statement->fetchColumn();
}

function publicUser(array $user): array
{
    return ['id' => (int) $user['id'], 'name' => $user['name'], 'email' => $user['email'],
        'role' => $user['role'] ?? 'user',
        'onboardingCompleted' => (bool) ($user['onboarding_completed'] ?? 1)];
}

function sendAccountEmail(string $email, string $subject, string $htmlBody, string $textBody): void
{
    $host = appSetting('smtp_host', envValue('FINANZA_SMTP_HOST'));
    $username = appSetting('smtp_user', envValue('FINANZA_SMTP_USER'));
    $storedPassword = appSetting('smtp_password_encrypted');
    $password = $storedPassword !== '' ? decryptSetting($storedPassword) : envValue('FINANZA_SMTP_PASSWORD');
    $fromEmail = appSetting('smtp_from_email', envValue('FINANZA_MAIL_FROM'));
    $fromName = appSetting('smtp_from_name', envValue('FINANZA_MAIL_FROM_NAME', 'Finanza'));

    if ($host === '' || $username === '' || $password === '' || !filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
        throw new RuntimeException('SMTP is not configured on this server.');
    }

    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $host;
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = $password;
    $mail->Port = (int) appSetting('smtp_port', envValue('FINANZA_SMTP_PORT', '587'));
    $mail->SMTPSecure = appSetting('smtp_encryption', envValue('FINANZA_SMTP_ENCRYPTION', 'tls'));
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($fromEmail, $fromName);
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $htmlBody;
    $mail->AltBody = $textBody;
    $mail->send();
}

function sendRecoveryCode(string $email, string $code): void
{
    $safeCode = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');
    $name = appSetting('app_name', 'Finanza');
    sendAccountEmail(
        $email,
        'Tu código de recuperación de ' . $name,
        '<p>Tu código de recuperación es:</p><p style="font-size:28px;font-weight:bold;letter-spacing:5px">' .
            $safeCode . '</p><p>Caduca en 15 minutos. Si no solicitaste este código, ignora este mensaje.</p>',
        "Tu código de recuperación es: {$code}. Caduca en 15 minutos."
    );
}

function sendEmailVerificationCode(string $email, string $code): void
{
    $safeCode = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');
    $name = appSetting('app_name', 'Finanza');
    sendAccountEmail(
        $email,
        'Activa tu cuenta de ' . $name,
        '<p>Usa este código para activar tu cuenta:</p><p style="font-size:28px;font-weight:bold;letter-spacing:5px">' .
            $safeCode . '</p><p>Caduca en 24 horas. Si no creaste esta cuenta, ignora este mensaje.</p>',
        "Tu código para activar la cuenta es: {$code}. Caduca en 24 horas."
    );
}

function saveEmailVerification(PDO $db, int $userId, string $email): void
{
    $code = (string) random_int(10000000, 99999999);
    $now = time();
    $statement = $db->prepare(
        'INSERT INTO email_verifications (user_id, code_hash, expires_at, attempts, last_sent_at)
         VALUES (?, ?, ?, 0, ?)
         ON CONFLICT(user_id) DO UPDATE SET code_hash = excluded.code_hash,
         expires_at = excluded.expires_at, attempts = 0, last_sent_at = excluded.last_sent_at'
    );
    $statement->execute([$userId, password_hash($code, PASSWORD_DEFAULT), $now + EMAIL_VERIFICATION_LIFETIME, $now]);
    try {
        sendEmailVerificationCode($email, $code);
    } catch (Throwable $error) {
        $db->prepare('DELETE FROM email_verifications WHERE user_id = ?')->execute([$userId]);
        throw $error;
    }
}

function claimPaymentReminder(PDO $db, int $occurrenceId, string $reminderType): bool
{
    $now = time();
    $statement = $db->prepare(
        'INSERT INTO payment_reminders (occurrence_id, reminder_type, status, created_at)
         VALUES (?, ?, \'processing\', ?)
         ON CONFLICT(occurrence_id, reminder_type) DO UPDATE SET
           status = \'processing\', created_at = excluded.created_at, sent_at = NULL
         WHERE payment_reminders.status = \'failed\'
            OR (payment_reminders.status = \'processing\' AND payment_reminders.created_at <= ?)'
    );
    $statement->execute([$occurrenceId, $reminderType, $now, $now - 900]);
    return $statement->rowCount() === 1;
}

function sendScheduledPaymentReminders(): array
{
    $db = database();
    $statement = $db->query(
        "SELECT occurrences.id AS occurrence_id, occurrences.due_date, payments.title, payments.amount,
                payments.currency, payments.reminder_time, payments.timezone, users.id AS user_id,
                users.role, users.email
         FROM payment_occurrences AS occurrences
         JOIN scheduled_payments AS payments ON payments.id = occurrences.payment_id
         JOIN users ON users.id = occurrences.user_id
         WHERE occurrences.status = 'pending' AND payments.active = 1 AND users.is_active = 1
           AND users.email_verified = 1
         ORDER BY occurrences.due_date ASC"
    );
    $sent = 0;
    $failed = 0;

    foreach ($statement->fetchAll() as $payment) {
        try {
            if (!userHasSubscriptionFeature([
                'id' => (int) $payment['user_id'],
                'role' => $payment['role']
            ], 'Alertas por correo')) {
                continue;
            }
            $timezone = new DateTimeZone($payment['timezone']);
            $now = new DateTimeImmutable('now', $timezone);
            $dueDate = DateTimeImmutable::createFromFormat('!Y-m-d', $payment['due_date'], $timezone);
            if (!$dueDate) {
                throw new RuntimeException('Invalid payment due date.');
            }

            $reminderType = null;
            if ($dueDate->format('Y-m-d') === $now->format('Y-m-d')) {
                $reminderType = 'due_day';
            } elseif ($dueDate->modify('-1 day')->format('Y-m-d') === $now->format('Y-m-d')) {
                $reminderType = 'day_before';
            }
            if ($reminderType === null || $now->format('H:i') < $payment['reminder_time']) {
                continue;
            }

            $occurrenceId = (int) $payment['occurrence_id'];
            if (!claimPaymentReminder($db, $occurrenceId, $reminderType)) {
                continue;
            }

            $safeTitle = htmlspecialchars($payment['title'], ENT_QUOTES, 'UTF-8');
            $dueDateText = $dueDate->format('d/m/Y');
            $when = $reminderType === 'due_day' ? 'vence hoy' : 'vence mañana';
            $amount = number_format((float) $payment['amount'], 2) . ' ' . $payment['currency'];
            try {
                sendAccountEmail(
                    $payment['email'],
                    'Recordatorio de pago: ' . $payment['title'],
                    '<p>Te recordamos que <strong>' . $safeTitle . '</strong> ' . $when .
                        ' (' . $dueDateText . ').</p><p>Monto registrado: ' . $amount .
                        '.</p><p>Abre Finanza para consultar tu agenda y marcarlo como pagado.</p>',
                    'Recordatorio: ' . $payment['title'] . ' ' . $when . ' (' . $dueDateText .
                        '). Monto registrado: ' . $amount . '.'
                );
                $db->prepare(
                    "UPDATE payment_reminders SET status = 'sent', sent_at = ? WHERE occurrence_id = ? AND reminder_type = ?"
                )->execute([time(), $occurrenceId, $reminderType]);
                $sent++;
            } catch (Throwable $error) {
                $db->prepare(
                    "UPDATE payment_reminders SET status = 'failed' WHERE occurrence_id = ? AND reminder_type = ?"
                )->execute([$occurrenceId, $reminderType]);
                error_log('Finanza payment reminder error: ' . $error->getMessage());
                $failed++;
            }
        } catch (Throwable $error) {
            error_log('Finanza payment reminder error: ' . $error->getMessage());
            $failed++;
        }
    }

    return ['sent' => $sent, 'failed' => $failed];
}

function sendDailyPaymentAlerts(): array
{
    $db = database();
    $users = $db->query(
        "SELECT DISTINCT users.id, users.email, users.timezone, users.role
         FROM users
         JOIN scheduled_payments ON scheduled_payments.user_id = users.id AND scheduled_payments.active = 1
         JOIN payment_occurrences ON payment_occurrences.payment_id = scheduled_payments.id
             AND payment_occurrences.status = 'pending'
         WHERE users.is_active = 1 AND users.email_verified = 1"
    )->fetchAll();
    $sent = 0;
    $failed = 0;

    foreach ($users as $user) {
        try {
            if (!userHasSubscriptionFeature([
                'id' => (int) $user['id'],
                'role' => $user['role']
            ], 'Alertas por correo')) {
                continue;
            }
            $timezone = new DateTimeZone($user['timezone']);
            $now = new DateTimeImmutable('now', $timezone);
            if ($now->format('H:i') < '07:00') {
                continue;
            }
            $today = $now->format('Y-m-d');
            $claim = $db->prepare(
                "INSERT INTO daily_payment_alerts (user_id, local_date, status, created_at)
                 VALUES (?, ?, 'processing', ?)
                 ON CONFLICT(user_id, local_date) DO UPDATE SET
                   status = 'processing', created_at = excluded.created_at, sent_at = NULL
                 WHERE daily_payment_alerts.status = 'failed'
                    OR (daily_payment_alerts.status = 'processing' AND daily_payment_alerts.created_at <= ?)"
            );
            $claim->execute([(int) $user['id'], $today, time(), time() - 900]);
            if ($claim->rowCount() !== 1) {
                continue;
            }

            $payments = $db->prepare(
                "SELECT payments.title, payments.amount, payments.currency, occurrences.due_date
                 FROM scheduled_payments AS payments
                 JOIN payment_occurrences AS occurrences ON occurrences.payment_id = payments.id
                 WHERE payments.user_id = ? AND payments.active = 1 AND occurrences.status = 'pending'
                   AND occurrences.due_date <= ?
                 ORDER BY occurrences.due_date ASC, payments.title COLLATE NOCASE ASC"
            );
            $throughDate = $now->modify('+7 days')->format('Y-m-d');
            $payments->execute([(int) $user['id'], $throughDate]);
            $rows = $payments->fetchAll();
            if (!$rows) {
                $db->prepare(
                    "DELETE FROM daily_payment_alerts WHERE user_id = ? AND local_date = ? AND status = 'processing'"
                )->execute([(int) $user['id'], $today]);
                continue;
            }

            $items = [];
            foreach ($rows as $payment) {
                $dueDate = DateTimeImmutable::createFromFormat('!Y-m-d', $payment['due_date'], $timezone);
                $status = $payment['due_date'] < $today
                    ? 'Vencido'
                    : ($payment['due_date'] === $today ? 'Vence hoy' : 'Próximo');
                $items[] = '<li><strong>' . htmlspecialchars($payment['title'], ENT_QUOTES, 'UTF-8') .
                    '</strong>: ' . $status . ' (' . $dueDate->format('d/m/Y') . ') · ' .
                    number_format((float) $payment['amount'], 2) . ' ' .
                    htmlspecialchars($payment['currency'], ENT_QUOTES, 'UTF-8') . '</li>';
            }
            $html = '<p>Este es tu resumen diario de pagos pendientes (vencidos, de hoy y de los próximos 7 días):</p><ul>' .
                implode('', $items) . '</ul><p>Abre Finanza para revisar tu agenda y actualizar los pagos.</p>';
            $text = "Resumen diario de pagos pendientes:\n" . implode("\n", array_map(
                static fn(array $payment): string => $payment['title'] . ' · ' . $payment['due_date'] . ' · ' .
                    number_format((float) $payment['amount'], 2) . ' ' . $payment['currency'],
                $rows
            ));

            try {
                sendAccountEmail(
                    $user['email'],
                    'Tu resumen diario de pagos pendientes',
                    $html,
                    $text
                );
                $db->prepare(
                    "UPDATE daily_payment_alerts SET status = 'sent', sent_at = ?
                     WHERE user_id = ? AND local_date = ?"
                )->execute([time(), (int) $user['id'], $today]);
                $sent++;
            } catch (Throwable $error) {
                $db->prepare(
                    "UPDATE daily_payment_alerts SET status = 'failed' WHERE user_id = ? AND local_date = ?"
                )->execute([(int) $user['id'], $today]);
                error_log('Finanza daily payment alert error: ' . $error->getMessage());
                $failed++;
            }
        } catch (Throwable $error) {
            error_log('Finanza daily payment alert error: ' . $error->getMessage());
            $failed++;
        }
    }

    return ['sent' => $sent, 'failed' => $failed];
}

function validateTransaction(array $data, ?string $baseCurrency = null): array
{
    $description = requiredString($data, 'description', 80);
    $category = requiredString($data, 'category', 40);
    $type = $data['type'] ?? null;
    $amount = filter_var($data['amount'] ?? null, FILTER_VALIDATE_FLOAT);
    $baseCurrency ??= appSetting('base_currency', 'PEN');
    $currency = $data['currency'] ?? $baseCurrency;
    if (!in_array($baseCurrency, ['PEN', 'USD', 'EUR'], true) ||
        !in_array($type, ['income', 'expense'], true) || $amount === false || !is_finite((float) $amount) || $amount <= 0 || $amount > 100000000000) {
        throw new ApiError(422, 'El tipo de movimiento o el monto no son válidos.');
    }
    if (!in_array($currency, ['PEN', 'USD', 'EUR'], true)) {
        throw new ApiError(422, 'La moneda seleccionada no es válida.');
    }
    $exchangeRate = $currency === $baseCurrency
        ? 1.0
        : filter_var($data['exchangeRate'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($exchangeRate === false || !is_finite((float) $exchangeRate) || $exchangeRate <= 0 || $exchangeRate > 100000) {
        throw new ApiError(422, 'Ingresa un tipo de cambio válido en soles.');
    }
    return [$description, $category, $type, (float) $amount, $currency, (float) $exchangeRate, $baseCurrency, validDateString($data, 'date')];
}

function validatePaymentSchedule(array $data): array
{
    $title = requiredString($data, 'title', 80);
    $category = requiredString($data, 'category', 40);
    $dueDate = validDateString($data, 'dueDate');
    $recurrence = $data['recurrence'] ?? null;
    if (!in_array($recurrence, ['once', 'monthly', 'yearly'], true)) {
        throw new ApiError(422, 'Selecciona una frecuencia de pago válida.');
    }

    $reminderTime = $data['reminderTime'] ?? null;
    if (!is_string($reminderTime) || !preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/', $reminderTime)) {
        throw new ApiError(422, 'Selecciona una hora válida para los avisos.');
    }
    $timezoneName = requiredString($data, 'timezone', 64);
    try {
        new DateTimeZone($timezoneName);
    } catch (Throwable $error) {
        throw new ApiError(422, 'La zona horaria no es válida.');
    }

    [$description, $category, , $amount, $currency, $exchangeRate, $baseCurrency] = validateTransaction([
        'description' => $title,
        'category' => $category,
        'type' => 'expense',
        'amount' => $data['amount'] ?? null,
        'currency' => $data['currency'] ?? null,
        'exchangeRate' => $data['exchangeRate'] ?? null,
        'date' => $dueDate
    ]);
    $dueDateObject = DateTimeImmutable::createFromFormat('!Y-m-d', $dueDate);

    return [
        $description,
        $category,
        $amount,
        $currency,
        $exchangeRate,
        $baseCurrency,
        $dueDate,
        $recurrence,
        (int) $dueDateObject->format('n'),
        (int) $dueDateObject->format('j'),
        $reminderTime,
        $timezoneName
    ];
}

function nextPaymentDueDate(string $dueDate, string $recurrence, int $anchorMonth, int $anchorDay): ?string
{
    if ($recurrence === 'once') {
        return null;
    }

    $currentDate = DateTimeImmutable::createFromFormat('!Y-m-d', $dueDate);
    $year = (int) $currentDate->format('Y');
    $month = (int) $currentDate->format('n');
    if ($recurrence === 'monthly') {
        $firstOfMonth = $currentDate->modify('first day of next month');
        $year = (int) $firstOfMonth->format('Y');
        $month = (int) $firstOfMonth->format('n');
    } else {
        $year++;
        $month = $anchorMonth;
    }

    $firstOfTargetMonth = DateTimeImmutable::createFromFormat('!Y-n-j', $year . '-' . $month . '-1');
    $day = min($anchorDay, (int) $firstOfTargetMonth->format('t'));
    return $firstOfTargetMonth->setDate($year, $month, $day)->format('Y-m-d');
}

function userSubscriptionFeatures(array $user): array
{
    if (($user['role'] ?? '') === 'master') {
        return ['Pagos y deudas', 'Alertas por correo', 'Presupuestos', 'Reportes', 'Registro inteligente con IA'];
    }
    $statement = database()->prepare(
        "SELECT subscription_options.features_json
         FROM subscription_assignments
         JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
         WHERE subscription_assignments.user_id = ? AND subscription_assignments.status = 'active'
           AND subscription_options.active = 1 AND subscription_assignments.starts_at <= ?
           AND (subscription_assignments.ends_at IS NULL OR subscription_assignments.ends_at >= ?)"
    );
    $today = date('Y-m-d');
    $statement->execute([(int) $user['id'], $today, $today]);
    $features = [];
    foreach ($statement->fetchAll(PDO::FETCH_COLUMN) as $featuresJson) {
        $assignmentFeatures = json_decode((string) $featuresJson, true);
        if (is_array($assignmentFeatures)) {
            $features = array_merge($features, array_filter($assignmentFeatures, 'is_string'));
        }
    }
    return array_values(array_unique($features));
}

function userHasSubscriptionFeature(array $user, string $feature): bool
{
    return in_array($feature, userSubscriptionFeatures($user), true);
}

function requireSubscriptionFeature(array $user, string $feature): void
{
    if (!userHasSubscriptionFeature($user, $feature)) {
        throw new ApiError(403, 'Esta función está disponible en los planes Mensual y Anual. Revisa Plan y suscripción para actualizar.');
    }
}

function subscriptionPeriodEnd(DateTimeImmutable $start, string $period): DateTimeImmutable
{
    $year = (int) $start->format('Y') + ($period === 'yearly' ? 1 : 0);
    $month = (int) $start->format('n') + ($period === 'monthly' ? 1 : 0);
    if ($month > 12) {
        $year++;
        $month = 1;
    }
    $firstOfMonth = DateTimeImmutable::createFromFormat('!Y-n-j', $year . '-' . $month . '-1');
    $day = min((int) $start->format('j'), (int) $firstOfMonth->format('t'));
    return $firstOfMonth->setDate($year, $month, $day)->modify('-1 day');
}

function userHasAiAssistant(array $user): bool
{
    return userHasSubscriptionFeature($user, 'Registro inteligente con IA');
}

function extractAiTransaction(array $input, int $userId): array
{
    $source = $input['source'] ?? '';
    $parts = [];
    $image = null;
    if ($source === 'voice') {
        $transcript = requiredString($input, 'transcript', 500);
        $parts[] = ['text' => "Interpreta esta descripción hablada para registrar un movimiento financiero. No inventes datos que no aparezcan. found_total debe ser true solamente si el monto se dijo de forma clara; si falta, amount será 0 y found_total false. Identifica la moneda si se menciona y devuelve currency como PEN, USD o EUR; si no se especifica, usa " . appSetting('base_currency', 'PEN') . ". Si no se menciona una fecha, usa hoy (" . date('Y-m-d') . "). Devuelve JSON con found_total (booleano), type (income o expense), amount (número), currency (PEN, USD o EUR), description (máximo 80 caracteres, conserva el detalle útil), category (elige una categoría de la lista), y date (YYYY-MM-DD). Categorías: " . json_encode(aiTransactionCategories($userId), JSON_UNESCAPED_UNICODE) . ". Texto: " . $transcript];
    } elseif ($source === 'receipt') {
        $upload = $_FILES['image'] ?? null;
        if (!is_array($upload) || ($upload['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            throw new ApiError(422, 'Selecciona una foto válida del comprobante.');
        }
        if (($upload['size'] ?? 0) < 1 || $upload['size'] > 2097152) {
            throw new ApiError(413, 'La foto debe pesar como máximo 2 MB.');
        }
        $mimeType = (new finfo(FILEINFO_MIME_TYPE))->file((string) $upload['tmp_name']);
        if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)) {
            throw new ApiError(422, 'Usa una imagen JPG, PNG o WebP.');
        }
        $image = file_get_contents((string) $upload['tmp_name']);
        if ($image === false) {
            throw new ApiError(422, 'No se pudo leer la foto seleccionada.');
        }
        $categories = aiTransactionCategories($userId);
        $parts[] = ['text' => "Responde en formato json válido con los campos found_total, amount, currency, description, category, date y type. Analiza la imagen completa, que puede ser una captura de Yape u otro comprobante de pago. Identifica la moneda del importe y devuelve currency como PEN, USD o EUR; si no es visible, usa " . appSetting('base_currency', 'PEN') . ". Para una captura de Yape con el texto “¡Yapeaste!”, registra un gasto (type=expense) y toma como amount el importe grande que aparece debajo de ese texto; no busques la palabra “total” si no aparece. El texto del mensaje/notificación indica el concepto y debe formar parte de description junto con el servicio o comercio (por ejemplo, “Yape - HBO”). No uses el nombre del destinatario como concepto si hay un mensaje que indique el motivo. En otros comprobantes, identifica el importe final realmente pagado; no confundas subtotal, impuestos, efectivo recibido, vuelto o un artículo individual. Conserva el valor y decimales visibles, pero devuelve amount como número. Si el importe se ve claramente, found_total=true incluso si el comprobante usa otra etiqueta, y no inventes importes. Si hay lista de productos, resume los conceptos legibles en description (hasta 80 caracteres). Si no hay importe legible, found_total=false y amount=0. date debe ser YYYY-MM-DD usando la fecha de la captura; si no aparece, usa hoy " . date('Y-m-d') . ". category debe ser exactamente una de estas: " . json_encode($categories, JSON_UNESCAPED_UNICODE) . ". Devuelve solo el objeto json, sin markdown ni texto adicional."];
        $parts[] = ['inlineData' => ['mimeType' => $mimeType, 'data' => base64_encode($image)]];
    } else {
        throw new ApiError(422, 'El tipo de registro inteligente no es válido.');
    }

    $provider = appSetting('ai_provider', 'gemini');
    if (!in_array($provider, ['gemini', 'groq'], true)) {
        throw new ApiError(503, 'El proveedor de IA configurado no es válido. Revisa Administración → Configuración.');
    }
    $keySetting = $provider . '_api_key_encrypted';
    $keyEnvironment = 'FINANZA_' . strtoupper($provider) . '_API_KEY';
    $storedApiKey = appSetting($keySetting);
    $apiKey = $storedApiKey !== '' ? decryptSetting($storedApiKey) : envValue($keyEnvironment);
    if ($apiKey === '') {
        throw new ApiError(503, 'Falta configurar la clave API del proveedor ' . strtoupper($provider) . ' en Administración → Configuración.');
    }
    if (!function_exists('curl_init')) {
        throw new ApiError(503, 'El servidor no tiene habilitado cURL para conectar con el proveedor de IA.');
    }

    enforceRateLimit('ai-extraction:' . $userId, 30, 86400);
    $responseProperties = [
        'found_total' => ['type' => 'BOOLEAN'],
        'amount' => ['type' => 'NUMBER'],
        'currency' => ['type' => 'STRING', 'enum' => ['PEN', 'USD', 'EUR']],
        'description' => ['type' => 'STRING'],
        'category' => ['type' => 'STRING', 'enum' => aiTransactionCategories($userId)],
        'date' => ['type' => 'STRING'],
        'type' => ['type' => 'STRING', 'enum' => ['income', 'expense']]
    ];
    if ($provider === 'gemini') {
        $payloadData = [
            'contents' => [['parts' => $parts]],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'OBJECT',
                    'properties' => $responseProperties,
                    'required' => array_keys($responseProperties)
                ]
            ]
        ];
        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        $headers = ['Content-Type: application/json', 'x-goog-api-key: ' . $apiKey];
    } else {
        $prompt = $parts[0]['text'];
        $content = [['type' => 'text', 'text' => $prompt]];
        if ($source === 'receipt') {
            $content[] = [
                'type' => 'image_url',
                'image_url' => ['url' => 'data:' . $mimeType . ';base64,' . base64_encode($image)]
            ];
        }
        $payloadData = [
            'model' => 'qwen/qwen3.8-27b',
            'messages' => [['role' => 'user', 'content' => $content]],
            'temperature' => 0.2,
            'max_completion_tokens' => 500,
            'response_format' => ['type' => 'json_object']
        ];
        $endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        $headers = ['Content-Type: application/json', 'Authorization: Bearer ' . $apiKey];
    }
    $payload = json_encode($payloadData, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    $curl = curl_init($endpoint);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 35,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => $payload
    ]);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $curlErrorNumber = curl_errno($curl);
    $curlError = curl_error($curl);
    curl_close($curl);
    if ($response === false || $status < 200 || $status >= 300) {
        $providerError = is_string($response) ? json_decode($response, true) : null;
        $providerMessage = is_array($providerError) && is_string($providerError['error']['message'] ?? null)
            ? mb_substr(preg_replace('/[\r\n\t]+/', ' ', $providerError['error']['message']), 0, 300)
            : '';
        error_log('Finanza ' . strtoupper($provider) . ' request failed; HTTP ' . $status .
            ($curlError !== '' ? '; cURL ' . $curlErrorNumber . ': ' . $curlError : '') .
            ($providerMessage !== '' ? '; provider: ' . $providerMessage : ''));
        if ($status === 0) {
            throw new ApiError(502, 'PHP no pudo conectarse a ' . strtoupper($provider) . '. Revisa la conexión saliente HTTPS (cURL/SSL) de Apache.');
        }
        if ($status === 401 || $status === 403) {
            throw new ApiError(503, 'La clave de ' . strtoupper($provider) . ' no es válida o no tiene acceso. Contacta al administrador.');
        }
        if ($status === 404 && $provider === 'gemini') {
            throw new ApiError(503, 'Gemini respondió 404: el modelo o endpoint no está disponible para esta solicitud. Revisa el proyecto asociado a la clave y la API Gemini habilitada, o selecciona Groq en Administración → Configuración.');
        }
        if ($status === 404 && $provider === 'groq') {
            throw new ApiError(503, 'Groq no encontró el modelo seleccionado. Verifica que tu cuenta tenga acceso al modelo Qwen Vision o contacta al administrador.');
        }
        if ($status === 429) {
            throw new ApiError(503, strtoupper($provider) . ' está temporalmente sin cuota. Inténtalo más tarde.');
        }
        if ($status === 400) {
            throw new ApiError(422, 'No se pudo procesar esa imagen. Prueba con una foto nítida del comprobante completo.');
        }
        throw new ApiError(502, strtoupper($provider) . ' respondió con un error HTTP ' . $status . '. Revisa el registro de errores del servidor para ver el detalle.');
    }

    $decoded = json_decode($response, true);
    if ($provider === 'gemini') {
        $candidate = $decoded['candidates'][0] ?? null;
        if (!is_array($candidate) || (!empty($candidate['finishReason']) && $candidate['finishReason'] !== 'STOP')) {
            error_log('Finanza Gemini returned no usable candidate; finish reason: ' .
                (string) ($candidate['finishReason'] ?? $decoded['promptFeedback']['blockReason'] ?? 'unknown'));
            throw new ApiError(422, 'La IA no pudo leer el comprobante. Prueba una foto más cercana, nítida y con el total visible.');
        }
        $text = implode("\n", array_filter(array_map(
            static fn(array $part): string => is_string($part['text'] ?? null) ? $part['text'] : '',
            $candidate['content']['parts'] ?? []
        )));
    } else {
        $text = $decoded['choices'][0]['message']['content'] ?? '';
    }
    $transaction = is_string($text) ? json_decode($text, true) : null;
    if (!is_array($transaction)) {
        throw new ApiError(422, 'La IA no pudo leer el comprobante. Prueba una foto más cercana, nítida y con el total visible.');
    }
    if ($source === 'receipt' && (empty($transaction['found_total']) || (float) ($transaction['amount'] ?? 0) <= 0)) {
        throw new ApiError(422, 'No se encontró un total legible. Toma la foto más cerca y asegúrate de incluir el importe total.');
    }
    if ($source === 'voice' && (empty($transaction['found_total']) || (float) ($transaction['amount'] ?? 0) <= 0)) {
        throw new ApiError(422, 'No se reconoció un monto claro en la voz. Repite la frase incluyendo el importe.');
    }
    $transaction['exchangeRate'] ??= 1;
    [$description, $category, $type, $amount, $currency, $exchangeRate, $baseCurrency, $date] = validateTransaction($transaction);
    $allowedCategories = aiTransactionCategories($userId);
    $categoryWarning = !in_array($category, $allowedCategories, true);
    if ($categoryWarning) {
        $category = 'Otros';
    }
    return [
        'transaction' => [
            'description' => $description,
            'category' => $category,
            'type' => $type,
            'amount' => $amount,
            'currency' => $currency,
            'exchangeRate' => $exchangeRate,
            'baseCurrency' => $baseCurrency,
            'amountInBaseCurrency' => round($amount * $exchangeRate, 2),
            'date' => $date
        ],
        'categoryWarning' => $categoryWarning
    ];
}

function aiTransactionCategories(int $userId): array
{
    $categories = ['Alimentación', 'Vivienda', 'Transporte', 'Salud', 'Entretenimiento', 'Educación', 'Ahorro', 'Ingresos', 'Otros'];
    $statement = database()->prepare('SELECT name FROM categories WHERE user_id = ? ORDER BY name COLLATE NOCASE LIMIT 40');
    $statement->execute([$userId]);
    return array_values(array_unique(array_merge($categories, $statement->fetchAll(PDO::FETCH_COLUMN))));
}

function appSetting(string $key, string $default = ''): string
{
    $statement = database()->prepare('SELECT setting_value FROM app_settings WHERE setting_key = ?');
    $statement->execute([$key]);
    $value = $statement->fetchColumn();
    return $value === false ? $default : (string) $value;
}

function saveAppSetting(string $key, string $value): void
{
    $statement = database()->prepare(
        'INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)
         ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value'
    );
    $statement->execute([$key, $value]);
}

function settingsEncryptionKey(): string
{
    $key = envValue('FINANZA_SETTINGS_ENCRYPTION_KEY');
    if (strlen($key) < 32) {
        throw new RuntimeException('FINANZA_SETTINGS_ENCRYPTION_KEY must contain at least 32 characters.');
    }
    return hash('sha256', $key, true);
}

function encryptSetting(string $value): string
{
    $nonce = random_bytes(12);
    $tag = '';
    $ciphertext = openssl_encrypt($value, 'aes-256-gcm', settingsEncryptionKey(), OPENSSL_RAW_DATA, $nonce, $tag);
    if ($ciphertext === false) {
        throw new RuntimeException('Could not encrypt the SMTP credential.');
    }
    return base64_encode($nonce . $tag . $ciphertext);
}

function decryptSetting(string $value): string
{
    $payload = base64_decode($value, true);
    if ($payload === false || strlen($payload) < 29) {
        throw new RuntimeException('Stored SMTP credential is invalid.');
    }
    $plaintext = openssl_decrypt(substr($payload, 28), 'aes-256-gcm', settingsEncryptionKey(),
        OPENSSL_RAW_DATA, substr($payload, 0, 12), substr($payload, 12, 16));
    if ($plaintext === false) {
        throw new RuntimeException('Could not decrypt the SMTP credential.');
    }
    return $plaintext;
}

function requireMaster(array $user): void
{
    if (($user['role'] ?? '') !== 'master') {
        throw new ApiError(403, 'No tienes permiso para realizar esta acción.');
    }
}

function publicBranding(): array
{
    return [
        'appName' => appSetting('app_name', 'Finanza'),
        'contactEmail' => appSetting('contact_email'),
        'logoUrl' => appSetting('logo_url'),
        'faviconUrl' => appSetting('favicon_url'),
        'baseCurrency' => appSetting('base_currency', 'PEN')
    ];
}

function uploadBrandAsset(string $kind): array
{
    if (!in_array($kind, ['logo', 'favicon'], true)) {
        throw new ApiError(422, 'El tipo de imagen no es válido.');
    }
    $file = $_FILES['file'] ?? null;
    if (!is_array($file) || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK ||
        (int) ($file['size'] ?? 0) < 1 || (int) $file['size'] > 2097152 || !is_uploaded_file($file['tmp_name'] ?? '')) {
        throw new ApiError(422, 'Selecciona una imagen de hasta 2 MB.');
    }
    $image = @getimagesize($file['tmp_name']);
    $mime = is_array($image) ? ($image['mime'] ?? '') : '';
    $extensions = ['image/png' => 'png', 'image/jpeg' => 'jpg', 'image/webp' => 'webp'];
    if (!isset($extensions[$mime]) || (int) $image[0] > 2400 || (int) $image[1] > 2400) {
        throw new ApiError(422, 'Usa una imagen PNG, JPG o WebP de hasta 2400 × 2400 píxeles.');
    }
    $directory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'uploads';
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        throw new RuntimeException('Could not create the upload directory.');
    }
    $filename = $kind . '-' . bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($file['tmp_name'], $directory . DIRECTORY_SEPARATOR . $filename)) {
        throw new RuntimeException('Could not store the uploaded image.');
    }
    $setting = $kind === 'logo' ? 'logo_url' : 'favicon_url';
    $url = 'uploads/' . $filename;
    $oldUrl = appSetting($setting);
    saveAppSetting($setting, $url);
    if (preg_match('~^uploads/(logo|favicon)-[a-f0-9]{32}\.(png|jpg|webp)$~', $oldUrl)) {
        @unlink($directory . DIRECTORY_SEPARATOR . basename($oldUrl));
    }
    return publicBranding();
}

function handleRequest(string $action, string $method, array $data): array
{
    $db = database();

    if ($action === 'public-settings' && $method === 'GET') {
        return ['settings' => publicBranding()];
    }
    if ($action === 'plans' && $method === 'GET') {
        $options = $db->query(
            "SELECT id, name, description, features_json AS featuresJson, billing_period AS billingPeriod,
                    price_amount AS priceAmount, price_currency AS priceCurrency, trial_days AS trialDays
             FROM subscription_options WHERE active = 1 AND billing_period IN ('free', 'monthly', 'yearly')
             ORDER BY CASE billing_period WHEN 'free' THEN 0 WHEN 'monthly' THEN 1 ELSE 2 END"
        )->fetchAll();
        foreach ($options as &$option) {
            $option['id'] = (int) $option['id'];
            $option['priceAmount'] = (float) $option['priceAmount'];
            $option['trialDays'] = (int) $option['trialDays'];
            $option['features'] = json_decode($option['featuresJson'], true) ?: [];
            unset($option['featuresJson']);
        }
        unset($option);
        return ['plans' => $options, 'paymentInstructions' => [
            'yapeNumber' => appSetting('yape_number'),
            'yapeName' => appSetting('yape_name'),
            'bankAccounts' => appSetting('bank_accounts'),
            'gateways' => [
                'culqi' => appSetting('culqi_secret_encrypted') !== '',
                'mercadoPago' => appSetting('mercado_pago_secret_encrypted') !== '',
                'paypal' => appSetting('paypal_secret_encrypted') !== ''
            ]
        ]];
    }
    if ($action === 'setup-status' && $method === 'GET') {
        $consumed = (bool) $db->query("SELECT 1 FROM setup_state WHERE setup_key = 'master'")->fetchColumn();
        $masterExists = (int) $db->query("SELECT COUNT(*) FROM users WHERE role = 'master'")->fetchColumn() > 0;
        return ['available' => !$consumed && !$masterExists && envValue('FINANZA_MASTER_SETUP_CODE') !== ''];
    }
    if ($action === 'bootstrap-master' && $method === 'POST') {
        $code = requiredString($data, 'code', 200);
        $expectedCode = envValue('FINANZA_MASTER_SETUP_CODE');
        if ($expectedCode === '') {
            throw new ApiError(403, 'La configuración inicial ya no está disponible.');
        }
        enforceRateLimit('master-setup:' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), 5, 3600);
        $db->exec('BEGIN IMMEDIATE');
        try {
            $consumed = (bool) $db->query("SELECT 1 FROM setup_state WHERE setup_key = 'master'")->fetchColumn();
            $masters = (int) $db->query("SELECT COUNT(*) FROM users WHERE role = 'master'")->fetchColumn();
            if ($consumed || $masters > 0 || !hash_equals($expectedCode, $code)) {
                $db->rollBack();
                throw new ApiError(403, 'El código no es válido o la configuración inicial ya fue completada.');
            }
            $name = requiredString($data, 'name', 80);
            $email = strtolower(requiredString($data, 'email', 254));
            $password = $data['password'] ?? null;
            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) ||
                strlen($password) < 12 || strlen($password) > 200) {
                $db->rollBack();
                throw new ApiError(422, 'Usa un correo válido y una contraseña de al menos 12 caracteres.');
            }
            $statement = $db->prepare(
                "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'master', ?)"
            );
            $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), time()]);
            $userId = (int) $db->lastInsertId();
            $db->prepare('INSERT INTO setup_state (setup_key, consumed_at) VALUES (?, ?)')->execute(['master', time()]);
            $token = issueToken($userId);
            $db->commit();
            return ['token' => $token, 'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'master']];
        } catch (Throwable $error) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            throw $error;
        }
    }

    if ($action === 'register' && $method === 'POST') {
        $name = requiredString($data, 'name', 80);
        $email = strtolower(requiredString($data, 'email', 254));
        $password = $data['password'] ?? null;
        if (($data['termsAccepted'] ?? false) !== true || ($data['termsVersion'] ?? null) !== TERMS_VERSION) {
            throw new ApiError(422, 'Debes aceptar los Términos y condiciones vigentes para crear tu cuenta.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || strlen($password) < 12 || strlen($password) > 200) {
            throw new ApiError(422, 'Usa un correo válido y una contraseña de al menos 12 caracteres.');
        }
        enforceRateLimit('register:' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), 8, 3600);
        try {
            $statement = $db->prepare(
                'INSERT INTO users
                    (name, email, password_hash, email_verified, onboarding_completed, paid_access_required,
                     terms_version, terms_accepted_at, created_at)
                 VALUES (?, ?, ?, 0, 0, 1, ?, ?, ?)'
            );
            $acceptedAt = time();
            $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), TERMS_VERSION, $acceptedAt, $acceptedAt]);
        } catch (PDOException $error) {
            if (str_contains(strtolower($error->getMessage()), 'unique')) {
                throw new ApiError(409, 'Ya existe una cuenta con ese correo.');
            }
            throw $error;
        }
        $id = (int) $db->lastInsertId();
        try {
            saveEmailVerification($db, $id, $email);
        } catch (Throwable $mailError) {
            error_log('Finanza activation email error: ' . $mailError->getMessage());
            throw new ApiError(503, 'La cuenta se creó, pero no se pudo enviar el código. Revisa el correo e intenta reenviarlo.');
        }
        return ['message' => 'Te enviamos un código de activación. Confirma tu correo para continuar con la activación de tu cuenta.'];
    }

    if ($action === 'resend-activation' && $method === 'POST') {
        $email = strtolower(requiredString($data, 'email', 254));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ApiError(422, 'Escribe un correo válido.');
        }
        enforceRateLimit('activation-ip:' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 3600);
        enforceRateLimit('activation-email:' . hash('sha256', $email), 5, 3600);
        $statement = $db->prepare('SELECT id, email_verified FROM users WHERE email = ?');
        $statement->execute([$email]);
        $target = $statement->fetch();
        if ($target && !(int) $target['email_verified']) {
            $userId = (int) $target['id'];
            $existing = $db->prepare('SELECT last_sent_at FROM email_verifications WHERE user_id = ?');
            $existing->execute([$userId]);
            $lastSentAt = $existing->fetchColumn();
            if ($lastSentAt !== false && time() - (int) $lastSentAt < 60) {
                throw new ApiError(429, 'Espera un minuto antes de solicitar otro código.');
            }
            try {
                saveEmailVerification($db, $userId, $email);
            } catch (Throwable $mailError) {
                error_log('Finanza activation email error: ' . $mailError->getMessage());
                throw new ApiError(503, 'No se pudo enviar el código. Revisa la configuración del correo e inténtalo nuevamente.');
            }
        }
        return ['message' => 'Si el correo corresponde a una cuenta pendiente, recibirás un código de activación.'];
    }

    if ($action === 'verify-email' && $method === 'POST') {
        $email = strtolower(requiredString($data, 'email', 254));
        $code = requiredString($data, 'code', 8);
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[0-9]{8}$/', $code)) {
            throw new ApiError(422, 'Escribe un correo válido y el código de 8 dígitos.');
        }
        $statement = $db->prepare(
            'SELECT users.id, users.name, users.email, users.role, users.email_verified,
                    users.paid_access_required,
                    email_verifications.code_hash, email_verifications.expires_at, email_verifications.attempts
             FROM users LEFT JOIN email_verifications ON email_verifications.user_id = users.id
             WHERE users.email = ?'
        );
        $statement->execute([$email]);
        $verification = $statement->fetch();
        if (!$verification || (int) $verification['email_verified']) {
            throw new ApiError(400, 'El código no es válido o la cuenta ya fue activada.');
        }
        if (!$verification['code_hash'] || (int) $verification['expires_at'] <= time() ||
            (int) $verification['attempts'] >= 5) {
            throw new ApiError(400, 'El código no es válido o ya caducó. Solicita uno nuevo.');
        }
        if (!password_verify($code, $verification['code_hash'])) {
            $db->prepare('UPDATE email_verifications SET attempts = attempts + 1 WHERE user_id = ?')
                ->execute([(int) $verification['id']]);
            throw new ApiError(400, 'El código no es válido o ya caducó. Solicita uno nuevo.');
        }
        $db->beginTransaction();
        try {
            $db->prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
                ->execute([(int) $verification['id']]);
            $trialPlan = $db->query(
                "SELECT id, trial_days FROM subscription_options
                 WHERE billing_period = 'monthly' AND active = 1 ORDER BY id LIMIT 1"
            )->fetch();
            if (!(int) $verification['paid_access_required'] && $trialPlan && (int) $trialPlan['trial_days'] > 0) {
                $trialStart = (new DateTimeImmutable('today'))->format('Y-m-d');
                $trialEnd = (new DateTimeImmutable($trialStart))
                    ->modify('+' . ((int) $trialPlan['trial_days'] - 1) . ' days')
                    ->format('Y-m-d');
                $db->prepare('UPDATE users SET trial_started_at = ? WHERE id = ? AND trial_started_at IS NULL')
                    ->execute([$trialStart, (int) $verification['id']]);
                $db->prepare(
                    "INSERT INTO subscription_assignments
                        (user_id, option_id, status, starts_at, ends_at, is_trial, created_at)
                     VALUES (?, ?, 'active', ?, ?, 1, ?)"
                )->execute([
                    (int) $verification['id'], (int) $trialPlan['id'],
                    $trialStart, $trialEnd, time()
                ]);
            }
            $db->prepare('DELETE FROM email_verifications WHERE user_id = ?')
                ->execute([(int) $verification['id']]);
            $db->prepare('DELETE FROM rate_limits WHERE limiter_key = ?')
                ->execute(['admin-activation-backoff:' . (int) $verification['id']]);
            $db->commit();
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
        $user = [
            'id' => (int) $verification['id'],
            'name' => $verification['name'],
            'email' => $verification['email'],
            'role' => $verification['role'],
            'onboarding_completed' => 0
        ];
        return ['token' => issueToken((int) $verification['id']), 'user' => publicUser($user)];
    }

    if ($action === 'login' && $method === 'POST') {
        $email = strtolower(requiredString($data, 'email', 254));
        $password = $data['password'] ?? null;
        if (!is_string($password)) {
            throw new ApiError(422, 'Correo o contraseña incorrectos.');
        }
        enforceRateLimit('login:' . hash('sha256', strtolower($email) . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown')), 10, 900);
        $statement = $db->prepare(
            'SELECT id, name, email, password_hash, role, is_active, email_verified, onboarding_completed
             FROM users WHERE email = ?'
        );
        $statement->execute([$email]);
        $user = $statement->fetch();
        if (!$user || !(int) $user['is_active'] || !password_verify($password, $user['password_hash'])) {
            throw new ApiError(401, 'Correo o contraseña incorrectos.');
        }
        if (!(int) $user['email_verified']) {
            throw new ApiError(403, 'Confirma tu correo con el código de activación antes de iniciar sesión.');
        }
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            $update = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $update->execute([password_hash($password, PASSWORD_DEFAULT), $user['id']]);
        }
        return ['token' => issueToken((int) $user['id']), 'user' => publicUser($user)];
    }

    if ($action === 'request-reset' && $method === 'POST') {
        $email = strtolower(requiredString($data, 'email', 254));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new ApiError(422, 'Escribe un correo válido.');
        }
        enforceRateLimit('reset-ip:' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), 10, 3600);
        enforceRateLimit('reset-email:' . hash('sha256', $email), 3, 3600);
        $statement = $db->prepare('SELECT id FROM users WHERE email = ?');
        $statement->execute([$email]);
        $user = $statement->fetch();
        if ($user) {
            $userId = (int) $user['id'];
            $existing = $db->prepare('SELECT last_sent_at FROM password_resets WHERE user_id = ?');
            $existing->execute([$userId]);
            $lastSentAt = $existing->fetchColumn();
            if ($lastSentAt !== false && time() - (int) $lastSentAt < 60) {
                throw new ApiError(429, 'Espera un minuto antes de solicitar otro código.');
            }
            $code = (string) random_int(10000000, 99999999);
            $insert = $db->prepare(
                'INSERT INTO password_resets (user_id, code_hash, expires_at, attempts, last_sent_at)
                 VALUES (?, ?, ?, 0, ?)
                 ON CONFLICT(user_id) DO UPDATE SET code_hash = excluded.code_hash,
                 expires_at = excluded.expires_at, attempts = 0, last_sent_at = excluded.last_sent_at'
            );
            $insert->execute([$userId, password_hash($code, PASSWORD_DEFAULT), time() + RESET_CODE_LIFETIME, time()]);
            try {
                sendRecoveryCode($email, $code);
            } catch (Throwable $mailError) {
                $delete = $db->prepare('DELETE FROM password_resets WHERE user_id = ?');
                $delete->execute([$userId]);
                throw $mailError;
            }
        }
        return ['message' => 'Si el correo está registrado, recibirás un código de recuperación.'];
    }

    if ($action === 'reset-password' && $method === 'POST') {
        $email = strtolower(requiredString($data, 'email', 254));
        $code = requiredString($data, 'code', 8);
        $password = $data['password'] ?? null;
        if (!preg_match('/^[0-9]{8}$/', $code) || !is_string($password) || strlen($password) < 12 || strlen($password) > 200) {
            throw new ApiError(422, 'El código debe tener 8 dígitos y la contraseña al menos 12 caracteres.');
        }
        $statement = $db->prepare(
            'SELECT password_resets.user_id, password_resets.code_hash, password_resets.expires_at,
                    password_resets.attempts
             FROM password_resets JOIN users ON users.id = password_resets.user_id
             WHERE users.email = ?'
        );
        $statement->execute([$email]);
        $reset = $statement->fetch();
        if (!$reset || (int) $reset['expires_at'] <= time() || (int) $reset['attempts'] >= 5) {
            throw new ApiError(400, 'El código no es válido o ya caducó. Solicita uno nuevo.');
        }
        if (!password_verify($code, $reset['code_hash'])) {
            $increment = $db->prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE user_id = ?');
            $increment->execute([$reset['user_id']]);
            throw new ApiError(400, 'El código no es válido o ya caducó. Solicita uno nuevo.');
        }
        $db->beginTransaction();
        try {
            $update = $db->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
            $update->execute([password_hash($password, PASSWORD_DEFAULT), $reset['user_id']]);
            $db->prepare('DELETE FROM password_resets WHERE user_id = ?')->execute([$reset['user_id']]);
            $db->prepare('DELETE FROM auth_tokens WHERE user_id = ?')->execute([$reset['user_id']]);
            $db->commit();
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
        return ['message' => 'Contraseña actualizada. Inicia sesión con la nueva contraseña.'];
    }

    if (in_array($action, ['login', 'register', 'resend-activation', 'verify-email', 'request-reset', 'reset-password'], true)) {
        throw new ApiError(405, 'Método no permitido.');
    }

    $user = authenticatedUser();
    $userId = (int) $user['id'];
    if (!userHasPaidAccess($user) &&
        !in_array($action, ['me', 'logout', 'plans', 'plan-status', 'plan-request', 'public-settings'], true)) {
        throw new ApiError(402, 'Completa el pago mensual para habilitar el acceso a Finanza.');
    }

    if ($action === 'suggestion' && $method === 'POST') {
        $message = requiredString($data, 'message', 1200);
        enforceRateLimit('suggestion:' . $userId, 10, 3600);
        $statement = $db->prepare(
            "INSERT INTO suggestions (user_id, message, created_at, updated_at) VALUES (?, ?, ?, ?)"
        );
        $statement->execute([$userId, $message, time(), time()]);
        return ['message' => 'Gracias por compartir tu sugerencia.'];
    }

    if ($action === 'ai-assistant-status' && $method === 'GET') {
        $request = $db->prepare(
            "SELECT status FROM ai_subscription_requests WHERE user_id = ? ORDER BY requested_at DESC, id DESC LIMIT 1"
        );
        $request->execute([$userId]);
        return [
            'available' => userHasAiAssistant($user),
            'isMaster' => ($user['role'] ?? '') === 'master',
            'requestStatus' => $request->fetchColumn() ?: null
        ];
    }
    if ($action === 'plan-status' && $method === 'GET') {
        $today = date('Y-m-d');
        $current = $db->prepare(
            "SELECT subscription_options.name, subscription_options.billing_period AS billingPeriod,
                    subscription_options.price_amount AS priceAmount, subscription_options.price_currency AS priceCurrency,
                    subscription_assignments.starts_at AS startsAt, subscription_assignments.ends_at AS endsAt,
                    subscription_assignments.is_trial AS isTrial
             FROM subscription_assignments
             JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
             WHERE subscription_assignments.user_id = ? AND subscription_assignments.status = 'active'
               AND subscription_assignments.starts_at <= ?
               AND (subscription_assignments.ends_at IS NULL OR subscription_assignments.ends_at >= ?)
             ORDER BY CASE WHEN subscription_options.billing_period IN ('monthly', 'yearly') THEN 0 ELSE 1 END,
                      subscription_assignments.starts_at DESC, subscription_assignments.id DESC LIMIT 1"
        );
        $current->execute([$userId, $today, $today]);
        $subscription = $current->fetch();
        if ($subscription) {
            $subscription['priceAmount'] = (float) $subscription['priceAmount'];
            $subscription['isTrial'] = (bool) $subscription['isTrial'];
        } else {
            $free = $db->query(
                "SELECT name, billing_period AS billingPeriod, price_amount AS priceAmount,
                        price_currency AS priceCurrency, NULL AS startsAt, NULL AS endsAt, 0 AS isTrial
                 FROM subscription_options WHERE billing_period = 'free' AND active = 1 LIMIT 1"
            )->fetch();
            $subscription = $free ?: null;
        }
        $pending = $db->prepare(
            "SELECT 1 FROM plan_payment_requests WHERE user_id = ? AND status = 'pending' LIMIT 1"
        );
        $pending->execute([$userId]);
        $features = userSubscriptionFeatures($user);
        return [
            'subscription' => $subscription,
            'hasPendingRequest' => (bool) $pending->fetchColumn(),
            'accessAllowed' => userHasPaidAccess($user),
            'featureAccess' => [
                'payments' => in_array('Pagos y deudas', $features, true),
                'debts' => in_array('Pagos y deudas', $features, true),
                'alerts' => in_array('Alertas por correo', $features, true),
                'budgets' => in_array('Presupuestos', $features, true),
                'reports' => in_array('Reportes', $features, true)
            ]
        ];
    }
    if ($action === 'plan-request' && $method === 'POST') {
        if (($user['role'] ?? '') === 'master') {
            throw new ApiError(403, 'La cuenta maestra no requiere un plan.');
        }
        $period = $data['billingPeriod'] ?? null;
        $methodName = $data['paymentMethod'] ?? null;
        $reference = requiredString($data, 'paymentReference', 120);
        if (!in_array($period, ['monthly', 'yearly'], true) ||
            !in_array($methodName, ['yape', 'transfer'], true)) {
            throw new ApiError(422, 'Selecciona un plan y un método de pago manual válido.');
        }
        if ((int) ($user['paid_access_required'] ?? 0) && $period !== 'monthly') {
            throw new ApiError(422, 'La suscripción inicial disponible es mensual.');
        }
        $paymentCurrency = strtoupper((string) ($data['paymentCurrency'] ?? 'PEN'));
        if (!in_array($paymentCurrency, ['PEN', 'USD'], true)) {
            throw new ApiError(422, 'Selecciona soles o dólares como moneda de pago.');
        }
        if ($paymentCurrency === 'USD' && $methodName === 'yape') {
            throw new ApiError(422, 'Los pagos en dólares deben realizarse por transferencia bancaria.');
        }
        if ($methodName === 'yape' && appSetting('yape_number') === '' ||
            $methodName === 'transfer' && appSetting('bank_accounts') === '') {
            throw new ApiError(422, 'El administrador aún no configuró los datos de este método de pago.');
        }
        enforceRateLimit('plan-request:' . $userId, 5, 2592000);
        $pending = $db->prepare(
            "SELECT 1 FROM plan_payment_requests WHERE user_id = ? AND status = 'pending' LIMIT 1"
        );
        $pending->execute([$userId]);
        if ($pending->fetchColumn()) {
            throw new ApiError(409, 'Ya tienes un pago de plan pendiente de revisión.');
        }
        $plan = $db->prepare(
            'SELECT id, price_amount, price_currency FROM subscription_options
             WHERE billing_period = ? AND active = 1 LIMIT 1'
        );
        $plan->execute([$period]);
        $selectedPlan = $plan->fetch();
        if (!$selectedPlan) {
            throw new ApiError(404, 'Ese plan no está disponible.');
        }
        $planCurrency = strtoupper((string) $selectedPlan['price_currency']);
        if (!in_array($planCurrency, ['PEN', 'USD'], true)) {
            throw new ApiError(409, 'La moneda configurada para este plan no es compatible.');
        }
        $planAmount = (float) $selectedPlan['price_amount'];
        $expectedAmount = $paymentCurrency === $planCurrency
            ? $planAmount
            : ($paymentCurrency === 'USD' ? $planAmount / 3.60 : $planAmount * 3.60);
        $expectedAmount = round($expectedAmount, 2);
        $submittedAmount = $data['paymentAmount'] ?? $expectedAmount;
        if (!is_numeric($submittedAmount) || !is_finite((float) $submittedAmount) ||
            abs((float) $submittedAmount - $expectedAmount) > 0.009) {
            throw new ApiError(422, 'El importe no coincide con el precio del plan y el tipo de cambio vigente.');
        }
        $db->prepare(
            "INSERT INTO plan_payment_requests
                (user_id, option_id, payment_method, payment_reference, payment_currency, payment_amount, status, requested_at)
             VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)"
        )->execute([
            $userId, (int) $selectedPlan['id'], $methodName, $reference,
            $paymentCurrency, $expectedAmount, time()
        ]);
        return ['message' => 'Solicitud enviada. La activación se realizará cuando el administrador confirme el pago.'];
    }
    if ($action === 'ai-subscription-request' && $method === 'POST') {
        if (($user['role'] ?? '') === 'master' || userHasAiAssistant($user)) {
            throw new ApiError(409, 'Tu cuenta ya tiene acceso al registro inteligente.');
        }
        enforceRateLimit('ai-subscription-request:' . $userId, 3, 2592000);
        $pending = $db->prepare(
            "SELECT 1 FROM ai_subscription_requests WHERE user_id = ? AND status = 'pending' LIMIT 1"
        );
        $pending->execute([$userId]);
        if ($pending->fetchColumn()) {
            throw new ApiError(409, 'Ya tienes una solicitud pendiente de revisión.');
        }
        try {
            $db->prepare(
                "INSERT INTO ai_subscription_requests (user_id, status, requested_at) VALUES (?, 'pending', ?)"
            )->execute([$userId, time()]);
        } catch (PDOException $error) {
            if (str_contains(strtolower($error->getMessage()), 'unique')) {
                throw new ApiError(409, 'Ya tienes una solicitud pendiente de revisión.');
            }
            throw $error;
        }
        return ['message' => 'Solicitud enviada. El administrador revisará el pago y habilitará el servicio.'];
    }
    if ($action === 'ai-transaction' && $method === 'POST') {
        if (!userHasAiAssistant($user)) {
            throw new ApiError(403, 'El registro inteligente está disponible para el plan que incluye “Registro inteligente con IA”.');
        }
        $input = str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'multipart/form-data')
            ? $_POST
            : $data;
        return extractAiTransaction($input, $userId);
    }

    $masterActions = [
        'admin-users', 'admin-settings', 'admin-upload', 'admin-suggestions',
        'admin-subscriptions', 'admin-assignments', 'admin-ai-requests', 'admin-resend-activation',
        'admin-plan-requests'
    ];
    if (in_array($action, $masterActions, true)) {
        requireMaster($user);

        if ($action === 'admin-users' && $method === 'GET') {
            $statement = $db->query(
                "SELECT id, name, email, is_active, email_verified, created_at
                 FROM users WHERE role = 'user' ORDER BY id DESC LIMIT 500"
            );
            return ['users' => array_map(static function (array $row): array {
                $row['id'] = (int) $row['id'];
                $row['isActive'] = (bool) $row['is_active'];
                $row['emailVerified'] = (bool) $row['email_verified'];
                $row['createdAt'] = (int) $row['created_at'];
                unset($row['is_active'], $row['email_verified'], $row['created_at']);
                return $row;
            }, $statement->fetchAll())];
        }
        if ($action === 'admin-users' && $method === 'POST') {
            $name = requiredString($data, 'name', 80);
            $email = strtolower(requiredString($data, 'email', 254));
            $password = $data['password'] ?? null;
            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) ||
                strlen($password) < 12 || strlen($password) > 200) {
                throw new ApiError(422, 'Usa un correo válido y una contraseña de al menos 12 caracteres.');
            }
            try {
                $statement = $db->prepare(
                    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'user', ?)"
                );
                $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), time()]);
            } catch (PDOException $error) {
                if (str_contains(strtolower($error->getMessage()), 'unique')) {
                    throw new ApiError(409, 'Ya existe una cuenta con ese correo.');
                }
                throw $error;
            }
            return ['user' => ['id' => (int) $db->lastInsertId(), 'name' => $name, 'email' => $email, 'isActive' => true]];
        }
        if ($action === 'admin-users' && $method === 'PUT') {
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            $name = requiredString($data, 'name', 80);
            $email = strtolower(requiredString($data, 'email', 254));
            $password = $data['password'] ?? '';
            $isActive = $data['isActive'] ?? null;
            if (!$id || $id < 1 || !filter_var($email, FILTER_VALIDATE_EMAIL) ||
                !is_string($password) || ($password !== '' && (strlen($password) < 12 || strlen($password) > 200)) ||
                !is_bool($isActive)) {
                throw new ApiError(422, 'Revisa los datos de la cuenta.');
            }
            $exists = $db->prepare("SELECT 1 FROM users WHERE id = ? AND role = 'user'");
            $exists->execute([$id]);
            if (!$exists->fetchColumn()) {
                throw new ApiError(404, 'No se encontró esa cuenta de cliente.');
            }
            try {
                if ($password !== '') {
                    $statement = $db->prepare(
                        'UPDATE users SET name = ?, email = ?, password_hash = ?, is_active = ? WHERE id = ? AND role = ?'
                    );
                    $statement->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT), (int) $isActive, $id, 'user']);
                } else {
                    $statement = $db->prepare(
                        'UPDATE users SET name = ?, email = ?, is_active = ? WHERE id = ? AND role = ?'
                    );
                    $statement->execute([$name, $email, (int) $isActive, $id, 'user']);
                }
            } catch (PDOException $error) {
                if (str_contains(strtolower($error->getMessage()), 'unique')) {
                    throw new ApiError(409, 'Ya existe una cuenta con ese correo.');
                }
                throw $error;
            }
            if (!$isActive || $password !== '') {
                $db->prepare('DELETE FROM auth_tokens WHERE user_id = ?')->execute([$id]);
            }
            return ['message' => 'Cuenta actualizada.'];
        }
        if ($action === 'admin-users' && $method === 'DELETE') {
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            if (!$id || $id < 1) {
                throw new ApiError(422, 'Selecciona una cuenta de cliente válida.');
            }
            $statement = $db->prepare("DELETE FROM users WHERE id = ? AND role = 'user'");
            $statement->execute([$id]);
            if ($statement->rowCount() === 0) {
                throw new ApiError(404, 'No se encontró esa cuenta de cliente.');
            }
            return ['message' => 'Cuenta de cliente y sus datos eliminados.'];
        }
        if ($action === 'admin-resend-activation' && $method === 'POST') {
            $id = filter_var($data['userId'] ?? null, FILTER_VALIDATE_INT);
            if (!$id || $id < 1) {
                throw new ApiError(422, 'Selecciona una cuenta de cliente válida.');
            }
            $statement = $db->prepare(
                "SELECT email FROM users WHERE id = ? AND role = 'user' AND email_verified = 0"
            );
            $statement->execute([$id]);
            $target = $statement->fetch();
            if (!$target) {
                throw new ApiError(409, 'La cuenta ya está activada o no existe.');
            }
            $limiterKey = 'admin-activation-backoff:' . $id;
            $cooldownRemaining = activationResendCooldownRemaining($limiterKey);
            if ($cooldownRemaining > 0) {
                $waitMinutes = (int) ceil($cooldownRemaining / 60);
                $hours = intdiv($waitMinutes, 60);
                $minutes = $waitMinutes % 60;
                $wait = $hours > 0
                    ? $hours . ' ' . ($hours === 1 ? 'hora' : 'horas') .
                        ($minutes > 0 ? ' y ' . $minutes . ' ' . ($minutes === 1 ? 'minuto' : 'minutos') : '')
                    : $waitMinutes . ' ' . ($waitMinutes === 1 ? 'minuto' : 'minutos');
                throw new ApiError(429, 'Espera ' . $wait . ' antes de reenviar el código.');
            }
            try {
                saveEmailVerification($db, (int) $id, $target['email']);
            } catch (Throwable $mailError) {
                error_log('Finanza activation email error: ' . $mailError->getMessage());
                throw new ApiError(503, 'No se pudo reenviar el correo de activación. Revisa la configuración SMTP.');
            }
            recordActivationResend($limiterKey);
            return ['message' => 'Correo de activación reenviado.'];
        }

        if ($action === 'admin-settings' && $method === 'GET') {
            $storedPassword = appSetting('smtp_password_encrypted');
            $smtpPasswordSet = $storedPassword !== '' || envValue('FINANZA_SMTP_PASSWORD') !== '';
            $storedGeminiKey = appSetting('gemini_api_key_encrypted');
            $storedGroqKey = appSetting('groq_api_key_encrypted');
            return ['settings' => publicBranding() + [
                'smtpHost' => appSetting('smtp_host', envValue('FINANZA_SMTP_HOST')),
                'smtpPort' => appSetting('smtp_port', envValue('FINANZA_SMTP_PORT', '587')),
                'smtpEncryption' => appSetting('smtp_encryption', envValue('FINANZA_SMTP_ENCRYPTION', 'tls')),
                'smtpUser' => appSetting('smtp_user', envValue('FINANZA_SMTP_USER')),
                'mailFrom' => appSetting('smtp_from_email', envValue('FINANZA_MAIL_FROM')),
                'mailFromName' => appSetting('smtp_from_name', envValue('FINANZA_MAIL_FROM_NAME', 'Finanza')),
                'smtpPasswordSet' => $smtpPasswordSet,
                'aiProvider' => appSetting('ai_provider', 'gemini'),
                'geminiApiKeySet' => $storedGeminiKey !== '' || envValue('FINANZA_GEMINI_API_KEY') !== '',
                'groqApiKeySet' => $storedGroqKey !== '' || envValue('FINANZA_GROQ_API_KEY') !== '',
                'yapeNumber' => appSetting('yape_number'),
                'yapeName' => appSetting('yape_name'),
                'bankAccounts' => appSetting('bank_accounts'),
                'culqiPublicKey' => appSetting('culqi_public_key'),
                'culqiSecretSet' => appSetting('culqi_secret_encrypted') !== '',
                'mercadoPagoPublicKey' => appSetting('mercado_pago_public_key'),
                'mercadoPagoSecretSet' => appSetting('mercado_pago_secret_encrypted') !== '',
                'paypalClientId' => appSetting('paypal_client_id'),
                'paypalSecretSet' => appSetting('paypal_secret_encrypted') !== ''
            ]];
        }
        if ($action === 'admin-settings' && $method === 'PUT') {
            $appName = requiredString($data, 'appName', 60);
            $contactEmail = trim((string) ($data['contactEmail'] ?? ''));
            $baseCurrency = $data['baseCurrency'] ?? 'PEN';
            if ($contactEmail !== '' && (!filter_var($contactEmail, FILTER_VALIDATE_EMAIL) || strlen($contactEmail) > 254)) {
                throw new ApiError(422, 'El correo de contacto no es válido.');
            }
            $smtpHost = trim((string) ($data['smtpHost'] ?? ''));
            $smtpPort = trim((string) ($data['smtpPort'] ?? '587'));
            $smtpEncryption = trim((string) ($data['smtpEncryption'] ?? 'tls'));
            $smtpUser = trim((string) ($data['smtpUser'] ?? ''));
            $mailFrom = trim((string) ($data['mailFrom'] ?? ''));
            $mailFromName = trim((string) ($data['mailFromName'] ?? $appName));
            $smtpPassword = $data['smtpPassword'] ?? '';
            $geminiApiKey = $data['geminiApiKey'] ?? '';
            $groqApiKey = $data['groqApiKey'] ?? '';
            $aiProvider = $data['aiProvider'] ?? 'gemini';
            $yapeNumber = trim((string) ($data['yapeNumber'] ?? ''));
            $yapeName = trim((string) ($data['yapeName'] ?? ''));
            $bankAccounts = trim((string) ($data['bankAccounts'] ?? ''));
            $culqiPublicKey = trim((string) ($data['culqiPublicKey'] ?? ''));
            $culqiSecret = $data['culqiSecret'] ?? '';
            $mercadoPagoPublicKey = trim((string) ($data['mercadoPagoPublicKey'] ?? ''));
            $mercadoPagoSecret = $data['mercadoPagoSecret'] ?? '';
            $paypalClientId = trim((string) ($data['paypalClientId'] ?? ''));
            $paypalSecret = $data['paypalSecret'] ?? '';
            $gatewaySecrets = [$culqiSecret, $mercadoPagoSecret, $paypalSecret];
            $hasSmtpSettings = $smtpHost !== '' || $smtpUser !== '' || $mailFrom !== '' || $smtpPassword !== '';
            if (!in_array($baseCurrency, ['PEN', 'USD', 'EUR'], true) ||
                !is_string($smtpPassword) || strlen($smtpPassword) > 500 ||
                !is_string($geminiApiKey) || strlen($geminiApiKey) > 500 ||
                !is_string($groqApiKey) || strlen($groqApiKey) > 500 ||
                !is_string($culqiSecret) || strlen($culqiSecret) > 500 ||
                !is_string($mercadoPagoSecret) || strlen($mercadoPagoSecret) > 500 ||
                !is_string($paypalSecret) || strlen($paypalSecret) > 500 ||
                !in_array($aiProvider, ['gemini', 'groq'], true) ||
                !preg_match('/^[0-9]{1,5}$/', $smtpPort) || (int) $smtpPort < 1 || (int) $smtpPort > 65535 ||
                !in_array($smtpEncryption, ['tls', 'ssl', ''], true) || strlen($mailFromName) > 100) {
                throw new ApiError(422, 'Revisa la configuración del correo y del proveedor de IA.');
            }
            if (strlen($yapeNumber) > 40 || strlen($yapeName) > 100 || strlen($bankAccounts) > 2000 ||
                strlen($culqiPublicKey) > 500 || strlen($mercadoPagoPublicKey) > 500 ||
                strlen($paypalClientId) > 500) {
                throw new ApiError(422, 'Revisa los datos de pago y las claves de las pasarelas.');
            }
            if ($hasSmtpSettings && ($smtpHost === '' || $smtpUser === '' || !filter_var($mailFrom, FILTER_VALIDATE_EMAIL))) {
                throw new ApiError(422, 'Completa el servidor, usuario y correo remitente SMTP.');
            }
            if ($hasSmtpSettings) {
                $passwordAvailable = $smtpPassword !== '' || appSetting('smtp_password_encrypted') !== '' ||
                    envValue('FINANZA_SMTP_PASSWORD') !== '';
                if (!$passwordAvailable) {
                    throw new ApiError(422, 'Ingresa la contraseña SMTP.');
                }
            }
            if ($smtpPassword !== '' && strlen(envValue('FINANZA_SETTINGS_ENCRYPTION_KEY')) < 32) {
                throw new ApiError(422, 'Configura la clave de cifrado del servidor antes de guardar la contraseña SMTP.');
            }
            if ($geminiApiKey !== '' && strlen(envValue('FINANZA_SETTINGS_ENCRYPTION_KEY')) < 32) {
                throw new ApiError(422, 'Configura la clave de cifrado del servidor antes de guardar claves de IA.');
            }
            if ($groqApiKey !== '' && strlen(envValue('FINANZA_SETTINGS_ENCRYPTION_KEY')) < 32) {
                throw new ApiError(422, 'Configura la clave de cifrado del servidor antes de guardar claves de IA.');
            }
            if (array_filter($gatewaySecrets, static fn($secret): bool => is_string($secret) && $secret !== '') &&
                strlen(envValue('FINANZA_SETTINGS_ENCRYPTION_KEY')) < 32) {
                throw new ApiError(422, 'Configura FINANZA_SETTINGS_ENCRYPTION_KEY antes de guardar claves de pasarelas.');
            }
            $encryptedPassword = $smtpPassword !== '' ? encryptSetting($smtpPassword) : null;
            $encryptedGeminiKey = $geminiApiKey !== '' ? encryptSetting(trim($geminiApiKey)) : null;
            $encryptedGroqKey = $groqApiKey !== '' ? encryptSetting(trim($groqApiKey)) : null;
            $encryptedGatewaySecrets = [
                'culqi_secret_encrypted' => $culqiSecret !== '' ? encryptSetting($culqiSecret) : null,
                'mercado_pago_secret_encrypted' => $mercadoPagoSecret !== '' ? encryptSetting($mercadoPagoSecret) : null,
                'paypal_secret_encrypted' => $paypalSecret !== '' ? encryptSetting($paypalSecret) : null
            ];
            $db->beginTransaction();
            try {
                saveAppSetting('app_name', $appName);
                saveAppSetting('contact_email', $contactEmail);
                saveAppSetting('base_currency', $baseCurrency);
                saveAppSetting('yape_number', $yapeNumber);
                saveAppSetting('yape_name', $yapeName);
                saveAppSetting('bank_accounts', $bankAccounts);
                saveAppSetting('culqi_public_key', $culqiPublicKey);
                saveAppSetting('mercado_pago_public_key', $mercadoPagoPublicKey);
                saveAppSetting('paypal_client_id', $paypalClientId);
                foreach ($encryptedGatewaySecrets as $key => $secret) {
                    if ($secret !== null) {
                        saveAppSetting($key, $secret);
                    }
                }
                if ($hasSmtpSettings) {
                    saveAppSetting('smtp_host', $smtpHost);
                    saveAppSetting('smtp_port', $smtpPort);
                    saveAppSetting('smtp_encryption', $smtpEncryption);
                    saveAppSetting('smtp_user', $smtpUser);
                    saveAppSetting('smtp_from_email', $mailFrom);
                    saveAppSetting('smtp_from_name', $mailFromName);
                    if ($encryptedPassword !== null) {
                        saveAppSetting('smtp_password_encrypted', $encryptedPassword);
                    }
                }
                if ($encryptedGeminiKey !== null) {
                    saveAppSetting('gemini_api_key_encrypted', $encryptedGeminiKey);
                }
                if ($encryptedGroqKey !== null) {
                    saveAppSetting('groq_api_key_encrypted', $encryptedGroqKey);
                }
                saveAppSetting('ai_provider', $aiProvider);
                $db->commit();
            } catch (Throwable $error) {
                $db->rollBack();
                throw $error;
            }
            return ['settings' => publicBranding() + [
                'baseCurrency' => $baseCurrency
            ]];
        }
        if ($action === 'admin-upload' && $method === 'POST') {
            return ['settings' => uploadBrandAsset((string) ($_POST['kind'] ?? ''))];
        }

        if ($action === 'admin-suggestions' && $method === 'GET') {
            $statement = $db->query(
                'SELECT suggestions.id, suggestions.message, suggestions.status, suggestions.created_at,
                        users.name, users.email FROM suggestions
                 JOIN users ON users.id = suggestions.user_id ORDER BY suggestions.created_at DESC LIMIT 500'
            );
            return ['suggestions' => array_map(static function (array $row): array {
                $row['id'] = (int) $row['id'];
                $row['createdAt'] = (int) $row['created_at'];
                unset($row['created_at']);
                return $row;
            }, $statement->fetchAll())];
        }
        if ($action === 'admin-suggestions' && $method === 'PUT') {
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            $status = $data['status'] ?? null;
            if (!$id || !in_array($status, ['new', 'reviewing', 'resolved'], true)) {
                throw new ApiError(422, 'El estado de la sugerencia no es válido.');
            }
            $statement = $db->prepare('UPDATE suggestions SET status = ?, updated_at = ? WHERE id = ?');
            $statement->execute([$status, time(), $id]);
            if ($statement->rowCount() === 0) {
                $exists = $db->prepare('SELECT 1 FROM suggestions WHERE id = ?');
                $exists->execute([$id]);
                if (!$exists->fetchColumn()) {
                    throw new ApiError(404, 'No se encontró esa sugerencia.');
                }
            }
            return ['message' => 'Estado de sugerencia actualizado.'];
        }

        if ($action === 'admin-subscriptions' && $method === 'GET') {
            $options = $db->query(
                'SELECT id, name, description, features_json AS featuresJson, active FROM subscription_options ORDER BY name'
            )->fetchAll();
            foreach ($options as &$option) {
                $option['id'] = (int) $option['id'];
                $option['active'] = (bool) $option['active'];
                $option['features'] = json_decode($option['featuresJson'], true) ?: [];
                unset($option['featuresJson']);
            }
            unset($option);
            $assignments = $db->query(
                'SELECT subscription_assignments.id, subscription_assignments.user_id AS userId,
                        subscription_assignments.option_id AS optionId, subscription_assignments.status,
                        subscription_assignments.starts_at AS startsAt, subscription_assignments.ends_at AS endsAt,
                        subscription_assignments.is_trial AS isTrial,
                        users.name AS userName, users.email, subscription_options.name AS optionName
                 FROM subscription_assignments
                 JOIN users ON users.id = subscription_assignments.user_id
                 JOIN subscription_options ON subscription_options.id = subscription_assignments.option_id
                 ORDER BY subscription_assignments.id DESC LIMIT 500'
            )->fetchAll();
            foreach ($assignments as &$assignment) {
                $assignment['id'] = (int) $assignment['id'];
                $assignment['userId'] = (int) $assignment['userId'];
                $assignment['optionId'] = (int) $assignment['optionId'];
                $assignment['isTrial'] = (bool) $assignment['isTrial'];
            }
            unset($assignment);
            $users = $db->query("SELECT id, name, email FROM users WHERE role = 'user' ORDER BY name")->fetchAll();
            $aiRequests = $db->query(
                'SELECT ai_subscription_requests.id, ai_subscription_requests.user_id AS userId,
                        ai_subscription_requests.status, ai_subscription_requests.requested_at AS requestedAt,
                        users.name, users.email
                 FROM ai_subscription_requests
                 JOIN users ON users.id = ai_subscription_requests.user_id
                 ORDER BY ai_subscription_requests.requested_at DESC LIMIT 500'
            )->fetchAll();
            foreach ($aiRequests as &$request) {
                $request['id'] = (int) $request['id'];
                $request['userId'] = (int) $request['userId'];
                $request['requestedAt'] = (int) $request['requestedAt'];
            }
            unset($request);
            return ['options' => $options, 'assignments' => $assignments, 'users' => $users, 'aiRequests' => $aiRequests];
        }
        if ($action === 'admin-plan-requests' && $method === 'GET') {
            $requests = $db->query(
                'SELECT plan_payment_requests.id, plan_payment_requests.status,
                        plan_payment_requests.payment_method AS paymentMethod,
                        plan_payment_requests.payment_reference AS paymentReference,
                            CASE WHEN plan_payment_requests.payment_amount > 0
                                 THEN plan_payment_requests.payment_currency
                                 ELSE subscription_options.price_currency END AS paymentCurrency,
                            CASE WHEN plan_payment_requests.payment_amount > 0
                                 THEN plan_payment_requests.payment_amount
                                 ELSE subscription_options.price_amount END AS paymentAmount,
                        plan_payment_requests.requested_at AS requestedAt,
                        users.name, users.email, subscription_options.name AS planName,
                        subscription_options.billing_period AS billingPeriod,
                        subscription_options.price_amount AS priceAmount
                 FROM plan_payment_requests
                 JOIN users ON users.id = plan_payment_requests.user_id
                 JOIN subscription_options ON subscription_options.id = plan_payment_requests.option_id
                 ORDER BY plan_payment_requests.requested_at DESC LIMIT 500'
            )->fetchAll();
            return ['requests' => array_map(static function (array $row): array {
                $row['id'] = (int) $row['id'];
                $row['requestedAt'] = (int) $row['requestedAt'];
                $row['priceAmount'] = (float) $row['priceAmount'];
                $row['paymentAmount'] = (float) $row['paymentAmount'];
                return $row;
            }, $requests)];
        }
        if ($action === 'admin-plan-requests' && $method === 'PUT') {
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            $decision = $data['decision'] ?? null;
            if (!$id || $id < 1 || !in_array($decision, ['approved', 'rejected'], true)) {
                throw new ApiError(422, 'Revisa la solicitud de plan.');
            }
            $db->beginTransaction();
            try {
                $request = $db->prepare(
                    "SELECT user_id, option_id FROM plan_payment_requests WHERE id = ? AND status = 'pending'"
                );
                $request->execute([$id]);
                $pendingRequest = $request->fetch();
                if (!$pendingRequest) {
                    throw new ApiError(409, 'La solicitud ya fue atendida o no existe.');
                }
                $db->prepare(
                    'UPDATE plan_payment_requests SET status = ?, processed_at = ? WHERE id = ?'
                )->execute([$decision, time(), $id]);
                if ($decision === 'approved') {
                    $planStatement = $db->prepare(
                        'SELECT billing_period FROM subscription_options WHERE id = ? AND active = 1'
                    );
                    $planStatement->execute([(int) $pendingRequest['option_id']]);
                    $period = $planStatement->fetchColumn();
                    if (!in_array($period, ['monthly', 'yearly'], true)) {
                        throw new ApiError(409, 'El plan de esta solicitud ya no está disponible.');
                    }
                    $today = new DateTimeImmutable('today');
                    $priorEnd = $db->prepare(
                        "SELECT MAX(ends_at) FROM subscription_assignments
                         WHERE user_id = ? AND status = 'active' AND ends_at >= ? AND is_trial = 0"
                    );
                    $priorEnd->execute([(int) $pendingRequest['user_id'], $today->format('Y-m-d')]);
                    $existingEnd = $priorEnd->fetchColumn();
                    $start = $today;
                    if (is_string($existingEnd) && $existingEnd >= $today->format('Y-m-d')) {
                        $start = (new DateTimeImmutable($existingEnd))->modify('+1 day');
                    }
                    $end = subscriptionPeriodEnd($start, (string) $period);
                    $db->prepare(
                        "INSERT INTO subscription_assignments
                            (user_id, option_id, status, starts_at, ends_at, is_trial, created_at)
                         VALUES (?, ?, 'active', ?, ?, 0, ?)"
                    )->execute([
                        (int) $pendingRequest['user_id'], (int) $pendingRequest['option_id'],
                        $start->format('Y-m-d'), $end->format('Y-m-d'), time()
                    ]);
                }
                $db->commit();
            } catch (Throwable $error) {
                $db->rollBack();
                throw $error;
            }
            return ['message' => $decision === 'approved'
                ? 'Pago confirmado y plan activado.'
                : 'Solicitud de pago rechazada.'];
        }
        if ($action === 'admin-subscriptions' && in_array($method, ['POST', 'PUT'], true)) {
            $name = requiredString($data, 'name', 60);
            $description = trim((string) ($data['description'] ?? ''));
            $features = $data['features'] ?? [];
            if (strlen($description) > 300 || !is_array($features) || count($features) > 20) {
                throw new ApiError(422, 'Revisa los datos de la opción.');
            }
            $cleanFeatures = [];
            foreach ($features as $feature) {
                if (!is_string($feature) || trim($feature) === '' || mb_strlen(trim($feature)) > 60) {
                    throw new ApiError(422, 'Cada característica debe tener entre 1 y 60 caracteres.');
                }
                $cleanFeatures[] = trim($feature);
            }
            if ($method === 'POST') {
                $statement = $db->prepare(
                    'INSERT INTO subscription_options (name, description, features_json, created_at) VALUES (?, ?, ?, ?)'
                );
                try {
                    $statement->execute([$name, $description, json_encode($cleanFeatures, JSON_UNESCAPED_UNICODE), time()]);
                } catch (PDOException $error) {
                    if (str_contains(strtolower($error->getMessage()), 'unique')) {
                        throw new ApiError(409, 'Ya existe una opción con ese nombre.');
                    }
                    throw $error;
                }
                return ['message' => 'Opción creada.'];
            }
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            $active = $data['active'] ?? null;
            if (!$id || !is_bool($active)) {
                throw new ApiError(422, 'Revisa la opción de suscripción.');
            }
            $statement = $db->prepare(
                'UPDATE subscription_options SET name = ?, description = ?, features_json = ?, active = ? WHERE id = ?'
            );
            try {
                $statement->execute([$name, $description, json_encode($cleanFeatures, JSON_UNESCAPED_UNICODE), (int) $active, $id]);
            } catch (PDOException $error) {
                if (str_contains(strtolower($error->getMessage()), 'unique')) {
                    throw new ApiError(409, 'Ya existe una opción con ese nombre.');
                }
                throw $error;
            }
            if ($statement->rowCount() === 0) {
                $exists = $db->prepare('SELECT 1 FROM subscription_options WHERE id = ?');
                $exists->execute([$id]);
                if (!$exists->fetchColumn()) {
                    throw new ApiError(404, 'No se encontró esa opción.');
                }
            }
            return ['message' => 'Opción actualizada.'];
        }
        if ($action === 'admin-assignments' && $method === 'POST') {
            $userId = filter_var($data['userId'] ?? null, FILTER_VALIDATE_INT);
            $optionId = filter_var($data['optionId'] ?? null, FILTER_VALIDATE_INT);
            $startsAt = isset($data['startsAt']) && $data['startsAt'] !== '' ? validDateString($data, 'startsAt') : date('Y-m-d');
            $endsAt = isset($data['endsAt']) && $data['endsAt'] !== '' ? validDateString($data, 'endsAt') : null;
            $status = $data['status'] ?? 'active';
            if (!$userId || !$optionId || !in_array($status, ['active', 'paused', 'cancelled'], true) ||
                ($endsAt !== null && $endsAt < $startsAt)) {
                throw new ApiError(422, 'Revisa la asignación.');
            }
            $statement = $db->prepare(
                "INSERT INTO subscription_assignments (user_id, option_id, status, starts_at, ends_at, created_at)
                 SELECT users.id, subscription_options.id, ?, ?, ?, ?
                 FROM users, subscription_options WHERE users.id = ? AND users.role = 'user'
                 AND subscription_options.id = ?"
            );
            $statement->execute([$status, $startsAt, $endsAt, time(), $userId, $optionId]);
            if ($statement->rowCount() === 0) {
                throw new ApiError(422, 'Selecciona una cuenta de cliente y una opción existentes.');
            }
            return ['message' => 'Suscripción asignada.'];
        }
        if ($action === 'admin-assignments' && $method === 'PUT') {
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            $status = $data['status'] ?? null;
            $endsAt = isset($data['endsAt']) && $data['endsAt'] !== '' ? validDateString($data, 'endsAt') : null;
            if (!$id || !in_array($status, ['active', 'paused', 'cancelled'], true)) {
                throw new ApiError(422, 'Revisa la asignación.');
            }
            $existing = $db->prepare('SELECT starts_at FROM subscription_assignments WHERE id = ?');
            $existing->execute([$id]);
            $startsAt = $existing->fetchColumn();
            if ($startsAt === false) {
                throw new ApiError(404, 'No se encontró esa asignación.');
            }
            if ($endsAt !== null && $endsAt < $startsAt) {
                throw new ApiError(422, 'La fecha de fin no puede ser anterior al inicio.');
            }
            $statement = $db->prepare('UPDATE subscription_assignments SET status = ?, ends_at = ? WHERE id = ?');
            $statement->execute([$status, $endsAt, $id]);
            return ['message' => 'Suscripción actualizada.'];
        }
        if ($action === 'admin-assignments' && $method === 'DELETE') {
            $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            if (!$id || $id < 1) {
                throw new ApiError(422, 'La asignación no es válida.');
            }
            $statement = $db->prepare('DELETE FROM subscription_assignments WHERE id = ?');
            $statement->execute([$id]);
            if ($statement->rowCount() === 0) {
                throw new ApiError(404, 'No se encontró esa asignación.');
            }
            return ['message' => 'Asignación eliminada.'];
        }
        if ($action === 'admin-ai-requests' && $method === 'PUT') {
            $requestId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
            $decision = $data['decision'] ?? null;
            if (!$requestId || !in_array($decision, ['paid', 'rejected'], true)) {
                throw new ApiError(422, 'La decisión de la solicitud no es válida.');
            }
            $db->beginTransaction();
            try {
                $requestStatement = $db->prepare(
                    "SELECT user_id FROM ai_subscription_requests WHERE id = ? AND status = 'pending'"
                );
                $requestStatement->execute([$requestId]);
                $requestedUserId = $requestStatement->fetchColumn();
                if ($requestedUserId === false) {
                    throw new ApiError(404, 'La solicitud ya fue atendida o no existe.');
                }
                $db->prepare('UPDATE ai_subscription_requests SET status = ?, processed_at = ? WHERE id = ?')
                    ->execute([$decision, time(), $requestId]);
                if ($decision === 'paid') {
                    $optionName = 'IA mensual - S/ 10';
                    $features = json_encode(['Registro inteligente con IA'], JSON_UNESCAPED_UNICODE);
                    $db->prepare(
                        'INSERT INTO subscription_options (name, description, features_json, active, created_at)
                         VALUES (?, ?, ?, 1, ?)
                         ON CONFLICT(name) DO UPDATE SET description = excluded.description,
                         features_json = excluded.features_json, active = 1'
                    )->execute([$optionName, 'Registro inteligente con IA por S/ 10 al mes. Renovación manual.', $features, time()]);
                    $optionStatement = $db->prepare('SELECT id FROM subscription_options WHERE name = ?');
                    $optionStatement->execute([$optionName]);
                    $optionId = (int) $optionStatement->fetchColumn();
                    $today = date('Y-m-d');
                    $latest = $db->prepare(
                        "SELECT MAX(ends_at) FROM subscription_assignments
                         WHERE user_id = ? AND option_id = ? AND status = 'active' AND ends_at >= ?"
                    );
                    $latest->execute([(int) $requestedUserId, $optionId, $today]);
                    $currentEnd = $latest->fetchColumn();
                    $startsAt = is_string($currentEnd) && $currentEnd >= $today
                        ? date('Y-m-d', strtotime($currentEnd . ' +1 day'))
                        : $today;
                    $endsAt = date('Y-m-d', strtotime($startsAt . ' +30 days'));
                    $db->prepare(
                        "INSERT INTO subscription_assignments (user_id, option_id, status, starts_at, ends_at, created_at)
                         VALUES (?, ?, 'active', ?, ?, ?)"
                    )->execute([(int) $requestedUserId, $optionId, $startsAt, $endsAt, time()]);
                }
                $db->commit();
            } catch (Throwable $error) {
                $db->rollBack();
                throw $error;
            }
            return ['message' => $decision === 'paid'
                ? 'Pago confirmado y acceso habilitado por 30 días.'
                : 'Solicitud rechazada.'];
        }
        throw new ApiError(405, 'Método no permitido.');
    }

    if ($action === 'me' && $method === 'GET') {
        return ['user' => publicUser($user)];
    }
    if ($action === 'complete-onboarding' && $method === 'POST') {
        $db->prepare('UPDATE users SET onboarding_completed = 1 WHERE id = ?')->execute([$userId]);
        return ['message' => 'Guía completada.'];
    }
    if ($action === 'logout' && $method === 'POST') {
        $db->prepare('DELETE FROM auth_tokens WHERE token_hash = ?')->execute([$user['token_hash']]);
        return ['message' => 'Sesión cerrada.'];
    }

    if ($action === 'payments' && $method === 'GET') {
        $statement = $db->prepare(
            "SELECT payments.id, occurrences.id AS occurrenceId, payments.title, payments.category,
                    payments.amount, payments.currency, payments.exchange_rate AS exchangeRate,
                    payments.base_currency AS baseCurrency, occurrences.due_date AS dueDate,
                    payments.recurrence, payments.reminder_time AS reminderTime
             FROM scheduled_payments AS payments
             JOIN payment_occurrences AS occurrences ON occurrences.payment_id = payments.id
             WHERE payments.user_id = ? AND payments.active = 1 AND occurrences.status = 'pending'
             ORDER BY occurrences.due_date ASC, payments.title COLLATE NOCASE ASC"
        );
        $statement->execute([$userId]);
        $payments = array_map(static function (array $row): array {
            $row['id'] = (string) $row['id'];
            $row['occurrenceId'] = (string) $row['occurrenceId'];
            $row['amount'] = (float) $row['amount'];
            $row['exchangeRate'] = (float) $row['exchangeRate'];
            return $row;
        }, $statement->fetchAll());
        return ['payments' => $payments];
    }
    if ($action === 'payments' && $method === 'POST') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        [
            $title, $category, $amount, $currency, $exchangeRate, $baseCurrency,
            $dueDate, $recurrence, $anchorMonth, $anchorDay, $reminderTime, $timezone
        ] = validatePaymentSchedule($data);
        $now = time();
        $db->beginTransaction();
        try {
            $insert = $db->prepare(
                'INSERT INTO scheduled_payments
                    (user_id, title, category, amount, currency, exchange_rate, base_currency,
                     recurrence, anchor_month, anchor_day, reminder_time, timezone, active, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)'
            );
            $insert->execute([
                $userId, $title, $category, $amount, $currency, $exchangeRate, $baseCurrency,
                $recurrence, $anchorMonth, $anchorDay, $reminderTime, $timezone, $now, $now
            ]);
            $paymentId = (int) $db->lastInsertId();
            $occurrence = $db->prepare(
                'INSERT INTO payment_occurrences (payment_id, user_id, due_date, created_at) VALUES (?, ?, ?, ?)'
            );
            $occurrence->execute([$paymentId, $userId, $dueDate, $now]);
            $occurrenceId = (int) $db->lastInsertId();
            $db->prepare('UPDATE users SET timezone = ? WHERE id = ?')->execute([$timezone, $userId]);
            $db->commit();
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
        return ['payment' => [
            'id' => (string) $paymentId,
            'occurrenceId' => (string) $occurrenceId,
            'title' => $title,
            'category' => $category,
            'amount' => $amount,
            'currency' => $currency,
            'exchangeRate' => $exchangeRate,
            'baseCurrency' => $baseCurrency,
            'dueDate' => $dueDate,
            'recurrence' => $recurrence,
            'reminderTime' => $reminderTime
        ]];
    }
    if ($action === 'payments' && $method === 'DELETE') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'El pago programado no es válido.');
        }
        $statement = $db->prepare('DELETE FROM scheduled_payments WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró ese pago programado.');
        }
        return ['message' => 'Pago programado eliminado.'];
    }
    if ($action === 'payment-paid' && $method === 'POST') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        $occurrenceId = filter_var($data['occurrenceId'] ?? null, FILTER_VALIDATE_INT);
        if (!$occurrenceId || $occurrenceId < 1) {
            throw new ApiError(422, 'El vencimiento no es válido.');
        }

        $db->beginTransaction();
        try {
            $statement = $db->prepare(
                "SELECT occurrences.payment_id, occurrences.due_date, payments.title, payments.category,
                        payments.amount, payments.currency, payments.exchange_rate, payments.base_currency,
                        payments.recurrence, payments.anchor_month, payments.anchor_day, payments.timezone
                 FROM payment_occurrences AS occurrences
                 JOIN scheduled_payments AS payments ON payments.id = occurrences.payment_id
                 WHERE occurrences.id = ? AND occurrences.user_id = ? AND occurrences.status = 'pending'
                   AND payments.active = 1"
            );
            $statement->execute([$occurrenceId, $userId]);
            $payment = $statement->fetch();
            if (!$payment) {
                throw new ApiError(409, 'Este vencimiento ya fue registrado o no está disponible.');
            }
            $claim = $db->prepare(
                "UPDATE payment_occurrences SET status = 'paid', paid_at = ?
                 WHERE id = ? AND user_id = ? AND status = 'pending'"
            );
            $claim->execute([time(), $occurrenceId, $userId]);
            if ($claim->rowCount() !== 1) {
                throw new ApiError(409, 'Este vencimiento ya fue registrado.');
            }

            $paidDate = (new DateTimeImmutable('now', new DateTimeZone($payment['timezone'])))->format('Y-m-d');
            $transaction = $db->prepare(
                'INSERT INTO transactions
                    (user_id, description, category, type, amount, currency, exchange_rate, base_currency, date, created_at)
                 VALUES (?, ?, ?, \'expense\', ?, ?, ?, ?, ?, ?)'
            );
            $transaction->execute([
                $userId, 'Pago: ' . $payment['title'], $payment['category'], $payment['amount'],
                $payment['currency'], $payment['exchange_rate'], $payment['base_currency'],
                $paidDate, time()
            ]);
            $transactionId = (int) $db->lastInsertId();
            $db->prepare('UPDATE payment_occurrences SET transaction_id = ? WHERE id = ?')
                ->execute([$transactionId, $occurrenceId]);

            $nextDueDate = nextPaymentDueDate(
                $payment['due_date'],
                $payment['recurrence'],
                (int) $payment['anchor_month'],
                (int) $payment['anchor_day']
            );
            if ($nextDueDate !== null) {
                $db->prepare(
                    'INSERT INTO payment_occurrences (payment_id, user_id, due_date, created_at) VALUES (?, ?, ?, ?)'
                )->execute([(int) $payment['payment_id'], $userId, $nextDueDate, time()]);
            } else {
                $db->prepare('UPDATE scheduled_payments SET active = 0, updated_at = ? WHERE id = ? AND user_id = ?')
                    ->execute([time(), (int) $payment['payment_id'], $userId]);
            }
            $db->commit();
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
        return ['message' => 'Pago registrado como gasto.', 'transactionId' => (string) $transactionId];
    }

    if ($action === 'transactions' && $method === 'GET') {
        $statement = $db->prepare(
            'SELECT id, description, category, type, amount, currency, exchange_rate AS exchangeRate,
                    base_currency AS baseCurrency, ROUND(amount * exchange_rate, 2) AS amountInBaseCurrency, date FROM transactions
             WHERE user_id = ? ORDER BY date DESC, id DESC'
        );
        $statement->execute([$userId]);
        return ['transactions' => array_map(static function (array $row): array {
            $row['id'] = (string) $row['id'];
            $row['amount'] = (float) $row['amount'];
            $row['exchangeRate'] = (float) $row['exchangeRate'];
            $row['amountInBaseCurrency'] = (float) $row['amountInBaseCurrency'];
            return $row;
        }, $statement->fetchAll())];
    }
    if ($action === 'transactions' && in_array($method, ['POST', 'PUT'], true)) {
        if ($method === 'POST') {
            [$description, $category, $type, $amount, $currency, $exchangeRate, $baseCurrency, $date] = validateTransaction($data);
            $statement = $db->prepare(
                'INSERT INTO transactions (user_id, description, category, type, amount, currency, exchange_rate, base_currency, date, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $statement->execute([$userId, $description, $category, $type, $amount, $currency, $exchangeRate, $baseCurrency, $date, time()]);
            return ['transaction' => ['id' => (string) $db->lastInsertId(), 'description' => $description,
                'category' => $category, 'type' => $type, 'amount' => $amount, 'currency' => $currency,
                'exchangeRate' => $exchangeRate, 'baseCurrency' => $baseCurrency,
                'amountInBaseCurrency' => round($amount * $exchangeRate, 2), 'date' => $date]];
        }
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'El movimiento no es válido.');
        }
        $baseStatement = $db->prepare('SELECT base_currency FROM transactions WHERE id = ? AND user_id = ?');
        $baseStatement->execute([$id, $userId]);
        $baseCurrency = $baseStatement->fetchColumn();
        if ($baseCurrency === false) {
            throw new ApiError(404, 'No se encontró ese movimiento.');
        }
        $debtOrigin = $db->prepare('SELECT 1 FROM debt_payments WHERE transaction_id = ? AND user_id = ?');
        $debtOrigin->execute([$id, $userId]);
        if ($debtOrigin->fetchColumn()) {
            throw new ApiError(409, 'Un pago de deuda conserva su capital e intereses; no se puede editar desde movimientos.');
        }
        [$description, $category, $type, $amount, $currency, $exchangeRate, $baseCurrency, $date] =
            validateTransaction($data, (string) $baseCurrency);
        $paymentOrigin = $db->prepare(
            'SELECT 1 FROM payment_occurrences WHERE transaction_id = ? AND user_id = ?'
        );
        $paymentOrigin->execute([$id, $userId]);
        $isScheduledPayment = (bool) $paymentOrigin->fetchColumn();
        if ($isScheduledPayment) {
            requireSubscriptionFeature($user, 'Pagos y deudas');
        }
        if ($isScheduledPayment && $type !== 'expense') {
            throw new ApiError(422, 'Un pago de la agenda debe conservarse como gasto.');
        }
        $statement = $db->prepare(
            'UPDATE transactions SET description = ?, category = ?, type = ?, amount = ?, currency = ?, exchange_rate = ?, date = ?
             WHERE id = ? AND user_id = ?'
        );
        $statement->execute([$description, $category, $type, $amount, $currency, $exchangeRate, $date, $id, $userId]);
        if ($statement->rowCount() === 0) {
            $exists = $db->prepare('SELECT 1 FROM transactions WHERE id = ? AND user_id = ?');
            $exists->execute([$id, $userId]);
            if (!$exists->fetchColumn()) {
                throw new ApiError(404, 'No se encontró ese movimiento.');
            }
        }
        return ['transaction' => ['id' => (string) $id, 'description' => $description,
            'category' => $category, 'type' => $type, 'amount' => $amount, 'currency' => $currency,
            'exchangeRate' => $exchangeRate, 'baseCurrency' => $baseCurrency,
            'amountInBaseCurrency' => round($amount * $exchangeRate, 2), 'date' => $date]];
    }
    if ($action === 'transactions' && $method === 'DELETE') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'El movimiento no es válido.');
        }
        $linkedPayment = $db->prepare(
            'SELECT id, payment_id FROM payment_occurrences
             WHERE transaction_id = ? AND user_id = ? AND status = \'paid\''
        );
        $linkedPayment->execute([$id, $userId]);
        $occurrence = $linkedPayment->fetch();
        $debtOrigin = $db->prepare('SELECT 1 FROM debt_payments WHERE transaction_id = ? AND user_id = ?');
        $debtOrigin->execute([$id, $userId]);
        if ($debtOrigin->fetchColumn()) {
            throw new ApiError(409, 'Un pago de deuda conserva su historial y saldo; no se puede eliminar desde movimientos.');
        }
        if ($occurrence) {
            requireSubscriptionFeature($user, 'Pagos y deudas');
            $db->beginTransaction();
            try {
                $db->prepare(
                    "UPDATE payment_occurrences SET status = 'pending', transaction_id = NULL, paid_at = NULL
                     WHERE id = ? AND user_id = ?"
                )->execute([(int) $occurrence['id'], $userId]);
                $db->prepare(
                    "DELETE FROM payment_occurrences
                     WHERE payment_id = ? AND user_id = ? AND status = 'pending' AND id != ?"
                )->execute([(int) $occurrence['payment_id'], $userId, (int) $occurrence['id']]);
                $db->prepare('UPDATE scheduled_payments SET active = 1, updated_at = ? WHERE id = ? AND user_id = ?')
                    ->execute([time(), (int) $occurrence['payment_id'], $userId]);
                $deleted = $db->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
                $deleted->execute([$id, $userId]);
                if ($deleted->rowCount() === 0) {
                    throw new ApiError(404, 'No se encontró ese movimiento.');
                }
                $db->commit();
            } catch (Throwable $error) {
                $db->rollBack();
                throw $error;
            }
            return ['message' => 'Gasto eliminado y pago devuelto a la agenda.'];
        }
        $statement = $db->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró ese movimiento.');
        }
        return ['message' => 'Movimiento eliminado.'];
    }

    if ($action === 'debts' && $method === 'GET') {
        $statement = $db->prepare(
            'SELECT id, name, lender, original_amount AS originalAmount, balance, currency,
                    exchange_rate AS exchangeRate, base_currency AS baseCurrency, created_at AS createdAt
             FROM debts WHERE user_id = ? ORDER BY balance DESC, name COLLATE NOCASE ASC'
        );
        $statement->execute([$userId]);
        $debts = $statement->fetchAll();
        foreach ($debts as &$debt) {
            $debt['id'] = (string) $debt['id'];
            foreach (['originalAmount', 'balance', 'exchangeRate'] as $field) {
                $debt[$field] = (float) $debt[$field];
            }
            $debt['createdAt'] = (int) $debt['createdAt'];
        }
        unset($debt);
        $payments = $db->prepare(
            'SELECT debt_payments.id, debt_payments.debt_id AS debtId,
                    debt_payments.principal_amount AS principalAmount,
                    debt_payments.charges_amount AS chargesAmount, debt_payments.currency,
                    debt_payments.paid_date AS paidDate, debts.name AS debtName
             FROM debt_payments JOIN debts ON debts.id = debt_payments.debt_id
             WHERE debt_payments.user_id = ? ORDER BY debt_payments.paid_date DESC, debt_payments.id DESC LIMIT 100'
        );
        $payments->execute([$userId]);
        $history = array_map(static function (array $row): array {
            $row['id'] = (string) $row['id'];
            $row['debtId'] = (string) $row['debtId'];
            $row['principalAmount'] = (float) $row['principalAmount'];
            $row['chargesAmount'] = (float) $row['chargesAmount'];
            return $row;
        }, $payments->fetchAll());
        return ['debts' => $debts, 'payments' => $history];
    }
    if ($action === 'debts' && $method === 'POST') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        $name = requiredString($data, 'name', 80);
        $lender = requiredString($data, 'lender', 100);
        $amount = filter_var($data['amount'] ?? null, FILTER_VALIDATE_FLOAT);
        $currency = $data['currency'] ?? appSetting('base_currency', 'PEN');
        $baseCurrency = appSetting('base_currency', 'PEN');
        $exchangeRate = $currency === $baseCurrency
            ? 1.0
            : filter_var($data['exchangeRate'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($amount === false || !is_finite((float) $amount) || $amount <= 0 || $amount > 100000000000 ||
            !in_array($currency, ['PEN', 'USD', 'EUR'], true) ||
            $exchangeRate === false || !is_finite((float) $exchangeRate) ||
            $exchangeRate <= 0 || $exchangeRate > 100000) {
            throw new ApiError(422, 'Revisa el monto, moneda y tipo de cambio de la deuda.');
        }
        $now = time();
        $statement = $db->prepare(
            'INSERT INTO debts
                (user_id, name, lender, original_amount, balance, currency, exchange_rate, base_currency, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([
            $userId, $name, $lender, $amount, $amount, $currency, $exchangeRate, $baseCurrency, $now, $now
        ]);
        return ['debt' => [
            'id' => (string) $db->lastInsertId(),
            'name' => $name,
            'lender' => $lender,
            'originalAmount' => (float) $amount,
            'balance' => (float) $amount,
            'currency' => $currency,
            'exchangeRate' => (float) $exchangeRate,
            'baseCurrency' => $baseCurrency
        ]];
    }
    if ($action === 'debts' && $method === 'DELETE') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'Selecciona una deuda válida.');
        }
        $history = $db->prepare('SELECT 1 FROM debt_payments WHERE debt_id = ? AND user_id = ? LIMIT 1');
        $history->execute([$id, $userId]);
        if ($history->fetchColumn()) {
            throw new ApiError(409, 'No puedes eliminar una deuda con pagos registrados; conserva su historial.');
        }
        $statement = $db->prepare('DELETE FROM debts WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró esa deuda.');
        }
        return ['message' => 'Deuda eliminada.'];
    }
    if ($action === 'debt-payment' && $method === 'POST') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        $debtId = filter_var($data['debtId'] ?? null, FILTER_VALIDATE_INT);
        $principal = filter_var($data['principalAmount'] ?? null, FILTER_VALIDATE_FLOAT);
        $charges = filter_var($data['chargesAmount'] ?? 0, FILTER_VALIDATE_FLOAT);
        $paidDate = validDateString($data, 'date');
        if (!$debtId || $debtId < 1 || $principal === false || $charges === false ||
            !is_finite((float) $principal) || !is_finite((float) $charges) ||
            $principal < 0 || $charges < 0 || $principal + $charges <= 0) {
            throw new ApiError(422, 'Ingresa un abono a capital o cargos válido.');
        }
        $db->beginTransaction();
        try {
            $statement = $db->prepare(
                'SELECT name, balance, currency, exchange_rate, base_currency
                 FROM debts WHERE id = ? AND user_id = ?'
            );
            $statement->execute([$debtId, $userId]);
            $debt = $statement->fetch();
            if (!$debt) {
                throw new ApiError(404, 'No se encontró esa deuda.');
            }
            if ((float) $debt['balance'] <= 0 || $principal > (float) $debt['balance'] + 0.000001) {
                throw new ApiError(422, 'El abono a capital no puede superar el saldo pendiente.');
            }
            $total = round((float) $principal + (float) $charges, 2);
            $transaction = $db->prepare(
                'INSERT INTO transactions
                    (user_id, description, category, type, amount, currency, exchange_rate, base_currency, date, created_at)
                 VALUES (?, ?, \'Deudas\', \'expense\', ?, ?, ?, ?, ?, ?)'
            );
            $transaction->execute([
                $userId, 'Pago de deuda: ' . $debt['name'], $total, $debt['currency'],
                $debt['exchange_rate'], $debt['base_currency'], $paidDate, time()
            ]);
            $transactionId = (int) $db->lastInsertId();
            $db->prepare(
                'INSERT INTO debt_payments
                    (debt_id, user_id, principal_amount, charges_amount, currency, paid_date, transaction_id, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([
                $debtId, $userId, $principal, $charges, $debt['currency'], $paidDate, $transactionId, time()
            ]);
            $newBalance = max(0, round((float) $debt['balance'] - (float) $principal, 2));
            $db->prepare('UPDATE debts SET balance = ?, updated_at = ? WHERE id = ? AND user_id = ?')
                ->execute([$newBalance, time(), $debtId, $userId]);
            $db->commit();
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
        return ['message' => 'Pago registrado y saldo actualizado.', 'transactionId' => (string) $transactionId];
    }
    if ($action === 'debt-payment' && $method === 'DELETE') {
        requireSubscriptionFeature($user, 'Pagos y deudas');
        $paymentId = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$paymentId || $paymentId < 1) {
            throw new ApiError(422, 'Selecciona un pago válido para anular.');
        }
        $db->beginTransaction();
        try {
            $statement = $db->prepare(
                'SELECT debt_payments.debt_id, debt_payments.principal_amount,
                        debt_payments.transaction_id, debts.balance, debts.original_amount
                 FROM debt_payments
                 JOIN debts ON debts.id = debt_payments.debt_id
                 WHERE debt_payments.id = ? AND debt_payments.user_id = ? AND debts.user_id = ?'
            );
            $statement->execute([$paymentId, $userId, $userId]);
            $payment = $statement->fetch();
            if (!$payment) {
                throw new ApiError(404, 'No se encontró ese pago de deuda.');
            }

            $restoredBalance = min(
                (float) $payment['original_amount'],
                round((float) $payment['balance'] + (float) $payment['principal_amount'], 2)
            );
            $db->prepare('UPDATE debts SET balance = ?, updated_at = ? WHERE id = ? AND user_id = ?')
                ->execute([$restoredBalance, time(), $payment['debt_id'], $userId]);

            if ($payment['transaction_id'] !== null) {
                $db->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?')
                    ->execute([$payment['transaction_id'], $userId]);
            }
            $db->prepare('DELETE FROM debt_payments WHERE id = ? AND user_id = ?')
                ->execute([$paymentId, $userId]);
            $db->commit();
        } catch (Throwable $error) {
            $db->rollBack();
            throw $error;
        }
        return ['message' => 'Pago anulado; se restauró el saldo y se eliminó el gasto asociado.'];
    }

    if ($action === 'budgets' && $method === 'GET') {
        $statement = $db->prepare(
            'SELECT id, category, amount, currency FROM budgets WHERE user_id = ? ORDER BY category COLLATE NOCASE'
        );
        $statement->execute([$userId]);
        $rows = array_map(static function (array $row): array {
            $row['id'] = (string) $row['id'];
            $row['amount'] = (float) $row['amount'];
            return $row;
        }, $statement->fetchAll());
        return ['budgets' => $rows];
    }
    if ($action === 'budgets' && $method === 'POST') {
        requireSubscriptionFeature($user, 'Presupuestos');
        $category = requiredString($data, 'category', 40);
        $amount = filter_var($data['amount'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($amount === false || !is_finite((float) $amount) || $amount <= 0 || $amount > 100000000000) {
            throw new ApiError(422, 'Ingresa un límite mensual mayor que cero.');
        }
        $currency = appSetting('base_currency', 'PEN');
        try {
            $db->prepare(
                'INSERT INTO budgets (user_id, category, amount, currency, updated_at) VALUES (?, ?, ?, ?, ?)'
            )->execute([$userId, $category, $amount, $currency, time()]);
        } catch (PDOException $error) {
            if (str_contains(strtolower($error->getMessage()), 'unique')) {
                throw new ApiError(409, 'Ya existe un presupuesto para esa categoría.');
            }
            throw $error;
        }
        return ['budget' => [
            'id' => (string) $db->lastInsertId(),
            'category' => $category,
            'amount' => (float) $amount,
            'currency' => $currency
        ]];
    }
    if ($action === 'budgets' && $method === 'PUT') {
        requireSubscriptionFeature($user, 'Presupuestos');
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        $category = requiredString($data, 'category', 40);
        $amount = filter_var($data['amount'] ?? null, FILTER_VALIDATE_FLOAT);
        if (!$id || $id < 1 || $amount === false || !is_finite((float) $amount) ||
            $amount <= 0 || $amount > 100000000000) {
            throw new ApiError(422, 'Revisa el presupuesto y su categoría.');
        }
        $statement = $db->prepare(
            'UPDATE budgets SET category = ?, amount = ?, currency = ?, updated_at = ? WHERE id = ? AND user_id = ?'
        );
        try {
            $statement->execute([$category, $amount, appSetting('base_currency', 'PEN'), time(), $id, $userId]);
        } catch (PDOException $error) {
            if (str_contains(strtolower($error->getMessage()), 'unique')) {
                throw new ApiError(409, 'Ya existe un presupuesto para esa categoría.');
            }
            throw $error;
        }
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró ese presupuesto.');
        }
        return ['message' => 'Presupuesto actualizado.'];
    }
    if ($action === 'budgets' && $method === 'DELETE') {
        requireSubscriptionFeature($user, 'Presupuestos');
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'Selecciona un presupuesto válido.');
        }
        $statement = $db->prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró ese presupuesto.');
        }
        return ['message' => 'Presupuesto eliminado.'];
    }
    if ($action === 'emergency-fund' && $method === 'GET') {
        $statement = $db->prepare(
            'SELECT target_amount AS target, current_amount AS current, currency
             FROM emergency_funds WHERE user_id = ?'
        );
        $statement->execute([$userId]);
        $fund = $statement->fetch();
        if ($fund) {
            $fund['target'] = (float) $fund['target'];
            $fund['current'] = (float) $fund['current'];
        }
        return ['fund' => $fund ?: null];
    }
    if ($action === 'emergency-fund' && $method === 'PUT') {
        $target = filter_var($data['target'] ?? null, FILTER_VALIDATE_FLOAT);
        $current = filter_var($data['current'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($target === false || $current === false || !is_finite((float) $target) ||
            !is_finite((float) $current) || $target <= 0 || $current < 0 ||
            $target > 100000000000 || $current > 100000000000) {
            throw new ApiError(422, 'Revisa la meta y el ahorro actual del fondo.');
        }
        $currency = appSetting('base_currency', 'PEN');
        $db->prepare(
            'INSERT INTO emergency_funds (user_id, target_amount, current_amount, currency, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET target_amount = excluded.target_amount,
             current_amount = excluded.current_amount, currency = excluded.currency, updated_at = excluded.updated_at'
        )->execute([$userId, $target, $current, $currency, time()]);
        return ['fund' => ['target' => (float) $target, 'current' => (float) $current, 'currency' => $currency]];
    }

    if ($action === 'categories' && $method === 'GET') {
        $statement = $db->prepare('SELECT id, name FROM categories WHERE user_id = ? ORDER BY name COLLATE NOCASE');
        $statement->execute([$userId]);
        return ['categories' => array_map(static function (array $row): array {
            $row['id'] = (string) $row['id'];
            return $row;
        }, $statement->fetchAll())];
    }
    if ($action === 'categories' && $method === 'POST') {
        $name = requiredString($data, 'name', 40);
        $suggestedNames = ['Alimentación', 'Vivienda', 'Transporte', 'Salud', 'Entretenimiento', 'Educación', 'Ahorro', 'Ingresos', 'Otros'];
        foreach ($suggestedNames as $suggestedName) {
            if (strcasecmp($name, $suggestedName) === 0) {
                throw new ApiError(409, 'Esa categoría ya está entre las sugeridas.');
            }
        }
        try {
            $statement = $db->prepare('INSERT INTO categories (user_id, name, created_at) VALUES (?, ?, ?)');
            $statement->execute([$userId, $name, time()]);
        } catch (PDOException $error) {
            if (str_contains(strtolower($error->getMessage()), 'unique')) {
                throw new ApiError(409, 'Ya existe una categoría con ese nombre.');
            }
            throw $error;
        }
        return ['category' => ['id' => (string) $db->lastInsertId(), 'name' => $name]];
    }
    if ($action === 'categories' && $method === 'DELETE') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'La categoría no es válida.');
        }
        $statement = $db->prepare('DELETE FROM categories WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró esa categoría.');
        }
        return ['message' => 'Categoría eliminada.'];
    }

    if ($action === 'goals' && $method === 'GET') {
        $statement = $db->prepare(
            'SELECT id, name, target, current, currency, due_date AS dueDate FROM goals
             WHERE user_id = ? ORDER BY due_date ASC'
        );
        $statement->execute([$userId]);
        return ['goals' => array_map(static function (array $row): array {
            $row['id'] = (string) $row['id'];
            $row['target'] = (float) $row['target'];
            $row['current'] = (float) $row['current'];
            return $row;
        }, $statement->fetchAll())];
    }
    if ($action === 'goals' && $method === 'POST') {
        if (($user['role'] ?? '') !== 'master' && !userHasSubscriptionFeature($user, 'Presupuestos')) {
            $count = $db->prepare('SELECT COUNT(*) FROM goals WHERE user_id = ?');
            $count->execute([$userId]);
            if ((int) $count->fetchColumn() >= 1) {
                throw new ApiError(403, 'El plan Gratis incluye una meta de ahorro. Activa Mensual o Anual para crear más metas.');
            }
        }
        $name = requiredString($data, 'name', 60);
        $currency = appSetting('base_currency', 'PEN');
        $target = filter_var($data['target'] ?? null, FILTER_VALIDATE_FLOAT);
        $current = filter_var($data['current'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($target === false || $target <= 0 || $current === false || $current < 0 || !is_finite((float) $target) || !is_finite((float) $current)) {
            throw new ApiError(422, 'Revisa los montos de la meta.');
        }
        $dueDate = validDateString($data, 'dueDate');
        $statement = $db->prepare(
            'INSERT INTO goals (user_id, name, target, current, currency, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $statement->execute([$userId, $name, $target, $current, $currency, $dueDate, time()]);
        return ['goal' => ['id' => (string) $db->lastInsertId(), 'name' => $name,
            'target' => (float) $target, 'current' => (float) $current, 'currency' => $currency, 'dueDate' => $dueDate]];
    }
    if ($action === 'goals' && $method === 'DELETE') {
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            throw new ApiError(422, 'La meta no es válida.');
        }
        $statement = $db->prepare('DELETE FROM goals WHERE id = ? AND user_id = ?');
        $statement->execute([$id, $userId]);
        if ($statement->rowCount() === 0) {
            throw new ApiError(404, 'No se encontró esa meta.');
        }
        return ['message' => 'Meta eliminada.'];
    }

    throw new ApiError(404, 'No se encontró esta operación.');
}

if (PHP_SAPI === 'cli') {
    $job = $argv[1] ?? '';
    if (!in_array($job, ['send-payment-reminders', 'send-daily-payment-alerts'], true)) {
        fwrite(STDERR, "Usage: php api/index.php send-payment-reminders|send-daily-payment-alerts\n");
        exit(64);
    }

    try {
        $result = $job === 'send-daily-payment-alerts'
            ? sendDailyPaymentAlerts()
            : sendScheduledPaymentReminders();
        fwrite(STDOUT, sprintf("Payment emails sent: %d; failed: %d\n", $result['sent'], $result['failed']));
        exit($result['failed'] > 0 ? 1 : 0);
    } catch (Throwable $error) {
        error_log('Finanza payment reminder job error: ' . $error->getMessage());
        fwrite(STDERR, "Could not process payment reminders. Check the PHP error log.\n");
        exit(1);
    }
}

configureCors();
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header('Cache-Control: no-store, max-age=0');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $action = trim((string) ($_GET['action'] ?? ''));
    $data = requestData();
    $result = handleRequest($action, $method, $data);
    jsonResponse(200, ['ok' => true] + $result);
} catch (ApiError $error) {
    jsonResponse($error->status, ['ok' => false, 'error' => $error->getMessage()]);
} catch (Throwable $error) {
    error_log('Finanza API error: ' . $error->getMessage());
    jsonResponse(500, ['ok' => false, 'error' => 'Error interno del servidor. Revisa la configuración del servicio.']);
}
