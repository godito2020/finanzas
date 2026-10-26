import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const AUTH_TOKEN_KEY = 'finanza-auth-token-v1';
const SUGGESTED_CATEGORIES = [
  'Alimentación',
  'Vivienda',
  'Transporte',
  'Salud',
  'Entretenimiento',
  'Educación',
  'Ahorro',
  'Ingresos',
  'Otros'
];

const form = document.getElementById('transactionForm');
const tableBody = document.getElementById('transactionTableBody');
const budgetList = document.getElementById('budgetList');
const goalsList = document.getElementById('goalsList');
const monthlyChart = document.getElementById('monthlyChart');
const categoryChart = document.getElementById('categoryChart');
const installButton = document.getElementById('installButton');
const authInstallButton = document.getElementById('authInstallButton');
const authInstallHelp = document.getElementById('authInstallHelp');
const reportButton = document.getElementById('reportButton');
const authScreen = document.getElementById('authScreen');
const appShell = document.getElementById('appShell');
const authMessage = document.getElementById('authMessage');
const authConfigNote = document.getElementById('authConfigNote');
const authTitle = document.getElementById('authTitle');
const authIntro = document.getElementById('authIntro');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const requestResetForm = document.getElementById('requestResetForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const recoveryEmail = document.getElementById('recoveryEmail');
const resetEmail = document.getElementById('resetEmail');
const resetCode = document.getElementById('resetCode');
const newPassword = document.getElementById('newPassword');
const accountEmail = document.getElementById('accountEmail');
const logoutButton = document.getElementById('logoutButton');
const showRecoveryButton = document.getElementById('showRecoveryButton');
const resendCodeButton = document.getElementById('resendCodeButton');
const appNotice = document.getElementById('appNotice');
const balanceValue = document.getElementById('balanceValue');
const incomeValue = document.getElementById('incomeValue');
const expenseValue = document.getElementById('expenseValue');
const savedValue = document.getElementById('savedValue');
const monthLabel = document.getElementById('monthLabel');
const descriptionInput = document.getElementById('descriptionInput');
const categoryInput = document.getElementById('categoryInput');
const categoryForm = document.getElementById('categoryForm');
const newCategoryInput = document.getElementById('newCategoryInput');
const customCategoryList = document.getElementById('customCategoryList');
const typeInput = document.getElementById('typeInput');
const amountInput = document.getElementById('amountInput');
const dateInput = document.getElementById('dateInput');
const cancelEditButton = document.getElementById('cancelEditButton');
const transactionFormTitle = document.getElementById('transactionFormTitle');
const submitButton = document.getElementById('submitButton');
const filterTypeInput = document.getElementById('filterTypeInput');
const filterCategoryInput = document.getElementById('filterCategoryInput');
const filterMonthInput = document.getElementById('filterMonthInput');
const searchInput = document.getElementById('searchInput');
const goalForm = document.getElementById('goalForm');
const goalNameInput = document.getElementById('goalNameInput');
const goalTargetInput = document.getElementById('goalTargetInput');
const goalCurrentInput = document.getElementById('goalCurrentInput');
const goalDateInput = document.getElementById('goalDateInput');
const setupMasterForm = document.getElementById('setupMasterForm');
const setupCodeInput = document.getElementById('setupCode');
const setupNameInput = document.getElementById('setupName');
const setupEmailInput = document.getElementById('setupEmail');
const setupPasswordInput = document.getElementById('setupPassword');
const showSetupButton = document.getElementById('showSetupButton');
const adminPanel = document.getElementById('adminPanel');
const adminPanelButton = document.getElementById('adminPanelButton');
const closeAdminButton = document.getElementById('closeAdminButton');
const suggestionForm = document.getElementById('suggestionForm');
const suggestionInput = document.getElementById('suggestionInput');
const adminUserForm = document.getElementById('adminUserForm');
const adminSettingsForm = document.getElementById('adminSettingsForm');
const subscriptionOptionForm = document.getElementById('subscriptionOptionForm');
const subscriptionAssignmentForm = document.getElementById('subscriptionAssignmentForm');
const mobileNav = document.querySelector('.mobile-nav');

let transactions = [];
let goals = [];
let categories = [];
let editingTransactionId = null;
let deferredInstallPrompt = null;
let authToken = localStorage.getItem(AUTH_TOKEN_KEY) || '';
let currentUser = null;
let apiBaseUrl = '';
let adminUsers = [];
let subscriptionOptions = [];
let subscriptionUsers = [];
let publicBrand = { appName: 'Finanza', logoUrl: '', faviconUrl: '' };

initialize();

function initialize() {
  dateInput.value = getDateString(0);
  goalDateInput.value = getDateString(90);
  form.addEventListener('submit', handleSubmit);
  goalForm.addEventListener('submit', handleGoalSubmit);
  logoutButton.addEventListener('click', handleLogout);
  cancelEditButton.addEventListener('click', resetFormState);
  filterTypeInput.addEventListener('change', renderTable);
  filterCategoryInput.addEventListener('change', renderTable);
  filterMonthInput.addEventListener('change', renderTable);
  searchInput.addEventListener('input', renderTable);
  installButton.addEventListener('click', handleInstallClick);
  authInstallButton.addEventListener('click', handleInstallClick);
  reportButton.addEventListener('click', handleReportClick);
  categoryForm.addEventListener('submit', handleCategorySubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);
  registerForm.addEventListener('submit', handleRegisterSubmit);
  requestResetForm.addEventListener('submit', handleRequestResetSubmit);
  resetPasswordForm.addEventListener('submit', handleResetPasswordSubmit);
  showRecoveryButton.addEventListener('click', () => {
    recoveryEmail.value = loginEmail.value;
    showAuthView('requestReset');
  });
  resendCodeButton.addEventListener('click', handleResendCode);
  setupMasterForm.addEventListener('submit', handleBootstrapSubmit);
  showSetupButton.addEventListener('click', () => showAuthView('setupMaster'));
  suggestionForm.addEventListener('submit', handleSuggestionSubmit);
  adminUserForm.addEventListener('submit', handleAdminUserSubmit);
  adminSettingsForm.addEventListener('submit', handleAdminSettingsSubmit);
  subscriptionOptionForm.addEventListener('submit', handleSubscriptionOptionSubmit);
  subscriptionAssignmentForm.addEventListener('submit', handleSubscriptionAssignmentSubmit);
  adminPanelButton.addEventListener('click', openAdminPanel);
  closeAdminButton.addEventListener('click', closeAdminPanel);
  document.querySelectorAll('.upload-button').forEach((button) => {
    button.addEventListener('click', () => handleBrandUpload(button.dataset.uploadKind, button));
  });
  document.querySelectorAll('[data-auth-view]').forEach((button) => {
    button.addEventListener('click', () => showAuthView(button.dataset.authView));
  });

  installButton.hidden = true;
  authInstallButton.hidden = isAppInstalled() || !isMobileBrowser();
  authScreen.hidden = false;
  appShell.hidden = true;
  mobileNav.hidden = true;
  apiBaseUrl = getApiBaseUrl();
  initializePublicSettings();

  if (!isNativePlatform() && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.error('No se pudo registrar el modo sin conexión.', error);
      });
    });
  }

  async function initializePublicSettings() {
    if (!apiBaseUrl) return;
    try {
      const [branding, setup] = await Promise.all([
        apiRequest('public-settings'),
        apiRequest('setup-status')
      ]);
      publicBrand = branding.settings;
      applyBranding(publicBrand);
      showSetupButton.hidden = !setup.available;
    } catch (error) {
      console.warn('No se pudo cargar la configuración pública.', error);
    }
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    if (isAppInstalled()) {
      return;
    }
    deferredInstallPrompt = event;
    installButton.hidden = false;
    authInstallButton.hidden = false;
    authInstallHelp.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    hideInstallButton();
  });

  window.addEventListener('pageshow', updateInstallButtonVisibility);
  document.addEventListener('visibilitychange', updateInstallButtonVisibility);

  if (isNativePlatform() && !apiBaseUrl) {
    authConfigNote.hidden = false;
    authConfigNote.textContent = 'Configura la URL HTTPS del servidor en api-config.js y vuelve a compilar la app para Android.';
  }

  if (apiBaseUrl && authToken) {
    restoreSession();
  } else if (!apiBaseUrl) {
    showAuthMessage('La conexión con el servidor todavía no está configurada.', true);
  }
}

function applyBranding(settings) {
  const name = settings.appName || 'Finanza';
  document.title = `${name} — tus números en orden`;
  document.querySelector('meta[name="apple-mobile-web-app-title"]').content = name;
  document.querySelectorAll('.brand-name').forEach((element) => { element.textContent = name; });
  const contact = document.getElementById('publicContactEmail');
  contact.hidden = !settings.contactEmail;
  contact.replaceChildren(document.createTextNode(' · Contacto: '));
  if (settings.contactEmail) {
    const link = document.createElement('a');
    link.href = `mailto:${settings.contactEmail}`;
    link.textContent = settings.contactEmail;
    contact.append(link);
  }
  for (const [id, url] of [['authLogo', settings.logoUrl], ['appLogo', settings.logoUrl]]) {
    const image = document.getElementById(id);
    image.hidden = !url;
    image.src = url ? resolveBrandAsset(url) : '';
    image.previousElementSibling.hidden = Boolean(url);
  }
  if (settings.faviconUrl) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.append(favicon);
    }
    favicon.href = resolveBrandAsset(settings.faviconUrl);
  }
}

function resolveBrandAsset(path) {
  const apiDirectory = new URL('../', new URL(apiBaseUrl, document.baseURI));
  return new URL(path, apiDirectory).href;
}

function getApiBaseUrl() {
  const configuredUrl = typeof window.FINANZA_API_BASE_URL === 'string'
    ? window.FINANZA_API_BASE_URL.trim()
    : '';

  if (isNativePlatform()) {
    return configuredUrl;
  }

  if (configuredUrl) {
    return configuredUrl;
  }

  return new URL('api/index.php', document.baseURI).href;
}

async function apiRequest(action, options = {}) {
  if (!apiBaseUrl) {
    throw new Error('Configura la URL del servidor para continuar.');
  }

  const url = new URL(apiBaseUrl, document.baseURI);
  url.searchParams.set('action', action);
  const headers = { Accept: 'application/json' };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url.href, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
    credentials: 'omit'
  });
  let result;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error('El servidor devolvió una respuesta inválida. Verifica la URL y configuración del API.');
  }

  if (!response.ok || !result.ok) {
    if (response.status === 401 && authToken) {
      clearAuthSession();
      showAuthMessage('Tu sesión terminó. Inicia sesión de nuevo.');
    }
    throw new Error(result.error || 'No se pudo completar la solicitud.');
  }

  return result;
}

async function restoreSession() {
  try {
    const result = await apiRequest('me');
    currentUser = result.user;
    await loadAccountData();
    showApp();
  } catch (error) {
    clearAuthSession();
    showAuthMessage(`No pudimos restaurar tu sesión. ${error.message}`);
  }
}

async function loadAccountData() {
  const [transactionResult, goalResult, categoryResult] = await Promise.all([
    apiRequest('transactions'),
    apiRequest('goals'),
    apiRequest('categories')
  ]);
  transactions = transactionResult.transactions;
  goals = goalResult.goals;
  categories = categoryResult.categories;
  renderCategories();
  render();
}

function showApp() {
  authScreen.hidden = true;
  appShell.hidden = false;
  mobileNav.hidden = false;
  accountEmail.textContent = currentUser ? currentUser.email : '';
  adminPanelButton.hidden = currentUser?.role !== 'master';
  closeAdminPanel();
}

function clearAuthSession() {
  authToken = '';
  currentUser = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  appShell.hidden = true;
  authScreen.hidden = false;
  mobileNav.hidden = true;
}

function showAuthView(view, message = '') {
  const forms = {
    login: loginForm,
    setupMaster: setupMasterForm,
    register: registerForm,
    requestReset: requestResetForm,
    resetPassword: resetPasswordForm
  };
  const headings = {
    login: ['Qué gusto verte.', 'Inicia sesión para consultar tus movimientos desde cualquier dispositivo.'],
    setupMaster: ['Configura el acceso maestro.', 'Usa el código único definido en la configuración privada del servidor.'],
    register: ['Empieza con claridad.', 'Crea tu cuenta para mantener tus movimientos y metas sincronizados.'],
    requestReset: ['Recuperemos el acceso.', 'Te enviaremos un código de un solo uso a tu correo.'],
    resetPassword: ['Crea una nueva clave.', 'El código enviado a tu correo caduca en 15 minutos.']
  };

  Object.entries(forms).forEach(([name, form]) => {
    form.hidden = name !== view;
  });
  authTitle.textContent = headings[view][0];
  authIntro.textContent = headings[view][1];
  showAuthMessage(message);
}

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.hidden = !message;
  authMessage.classList.toggle('error', isError);
}

function showAppNotice(message, isError = false) {
  appNotice.textContent = message;
  appNotice.hidden = !message;
  appNotice.classList.toggle('error', isError);
  if (message) {
    window.setTimeout(() => {
      appNotice.hidden = true;
    }, 5000);
  }
}

async function submitAuthForm(form, callback) {
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    await callback();
  } catch (error) {
    showAuthMessage(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  await submitAuthForm(loginForm, async () => {
    const result = await apiRequest('login', {
      method: 'POST',
      body: { email: loginEmail.value.trim(), password: loginPassword.value }
    });
    await completeAuthentication(result);
  });
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  await submitAuthForm(registerForm, async () => {
    const result = await apiRequest('register', {
      method: 'POST',
      body: {
        name: registerName.value.trim(),
        email: registerEmail.value.trim(),
        password: registerPassword.value
      }
    });
    await completeAuthentication(result);
  });
}

async function handleBootstrapSubmit(event) {
  event.preventDefault();
  await submitAuthForm(setupMasterForm, async () => {
    const result = await apiRequest('bootstrap-master', {
      method: 'POST',
      body: {
        code: setupCodeInput.value,
        name: setupNameInput.value.trim(),
        email: setupEmailInput.value.trim(),
        password: setupPasswordInput.value
      }
    });
    setupCodeInput.value = '';
    showSetupButton.hidden = true;
    await completeAuthentication(result);
  });
}

async function handleSuggestionSubmit(event) {
  event.preventDefault();
  const button = suggestionForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('suggestion', {
      method: 'POST',
      body: { message: suggestionInput.value.trim() }
    });
    suggestionForm.reset();
    showAppNotice(result.message);
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function openAdminPanel() {
  if (currentUser?.role !== 'master') return;
  adminPanel.hidden = false;
  document.querySelectorAll('#overview > :not(#adminPanel)').forEach((element) => { element.hidden = true; });
  mobileNav.hidden = true;
  loadAdminData().catch((error) => showAppNotice(error.message, true));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAdminPanel() {
  adminPanel.hidden = true;
  document.querySelectorAll('#overview > :not(#adminPanel)').forEach((element) => { element.hidden = false; });
  mobileNav.hidden = false;
  appNotice.hidden = true;
}

async function loadAdminData() {
  const [usersResult, settingsResult, suggestionsResult, subscriptionsResult] = await Promise.all([
    apiRequest('admin-users'),
    apiRequest('admin-settings'),
    apiRequest('admin-suggestions'),
    apiRequest('admin-subscriptions')
  ]);
  adminUsers = usersResult.users;
  subscriptionOptions = subscriptionsResult.options;
  subscriptionUsers = subscriptionsResult.users;
  renderAdminUsers(adminUsers);
  renderAdminSuggestions(suggestionsResult.suggestions);
  renderSubscriptionData(subscriptionsResult);
  fillAdminSettings(settingsResult.settings);
}

function fillAdminSettings(settings) {
  document.getElementById('appNameInput').value = settings.appName || '';
  document.getElementById('contactEmailInput').value = settings.contactEmail || '';
  document.getElementById('smtpHostInput').value = settings.smtpHost || '';
  document.getElementById('smtpPortInput').value = settings.smtpPort || '587';
  document.getElementById('smtpEncryptionInput').value = settings.smtpEncryption || 'tls';
  document.getElementById('smtpUserInput').value = settings.smtpUser || '';
  document.getElementById('smtpPasswordInput').value = '';
  document.getElementById('smtpPasswordInput').placeholder = settings.smtpPasswordSet
    ? 'Configurada; escribe solo si deseas cambiarla'
    : 'Sin configurar';
  document.getElementById('mailFromInput').value = settings.mailFrom || '';
  document.getElementById('mailFromNameInput').value = settings.mailFromName || '';
}

function renderAdminUsers(users) {
  const container = document.getElementById('adminUsersList');
  if (!users.length) {
    container.innerHTML = '<p class="empty-state">Todavía no hay cuentas de cliente.</p>';
    return;
  }
  container.innerHTML = users.map((user) => `
    <form class="admin-record admin-user-record" data-user-id="${user.id}">
      <label>Nombre<input name="name" maxlength="80" value="${escapeHtml(user.name)}" required /></label>
      <label>Correo<input name="email" type="email" maxlength="254" value="${escapeHtml(user.email)}" required /></label>
      <label>Nueva contraseña<input name="password" type="password" minlength="12" autocomplete="new-password" placeholder="Dejar vacía para conservar" /></label>
      <label class="admin-check"><input name="isActive" type="checkbox" ${user.isActive ? 'checked' : ''} /> Cuenta activa</label>
      <button class="button button-quiet" type="submit">Guardar</button>
    </form>
  `).join('');
  container.querySelectorAll('.admin-user-record').forEach((record) => {
    record.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = record.querySelector('button[type="submit"]');
      const fields = new FormData(record);
      button.disabled = true;
      try {
        await apiRequest('admin-users', {
          method: 'PUT',
          body: {
            id: record.dataset.userId,
            name: fields.get('name'),
            email: fields.get('email'),
            password: fields.get('password'),
            isActive: fields.get('isActive') === 'on'
          }
        });
        showAppNotice('Cuenta actualizada.');
        await loadAdminData();
      } catch (error) {
        showAppNotice(error.message, true);
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function handleAdminUserSubmit(event) {
  event.preventDefault();
  const button = adminUserForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await apiRequest('admin-users', {
      method: 'POST',
      body: {
        name: document.getElementById('adminUserName').value.trim(),
        email: document.getElementById('adminUserEmail').value.trim(),
        password: document.getElementById('adminUserPassword').value
      }
    });
    adminUserForm.reset();
    showAppNotice('Cuenta de cliente creada.');
    await loadAdminData();
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleAdminSettingsSubmit(event) {
  event.preventDefault();
  const button = adminSettingsForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('admin-settings', {
      method: 'PUT',
      body: {
        appName: document.getElementById('appNameInput').value.trim(),
        contactEmail: document.getElementById('contactEmailInput').value.trim(),
        smtpHost: document.getElementById('smtpHostInput').value.trim(),
        smtpPort: document.getElementById('smtpPortInput').value,
        smtpEncryption: document.getElementById('smtpEncryptionInput').value,
        smtpUser: document.getElementById('smtpUserInput').value.trim(),
        smtpPassword: document.getElementById('smtpPasswordInput').value,
        mailFrom: document.getElementById('mailFromInput').value.trim(),
        mailFromName: document.getElementById('mailFromNameInput').value.trim()
      }
    });
    applyBranding(result.settings);
    document.getElementById('smtpPasswordInput').value = '';
    showAppNotice('Configuración guardada.');
    await loadAdminData();
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleBrandUpload(kind, button) {
  const input = document.getElementById(kind === 'logo' ? 'logoUpload' : 'faviconUpload');
  const file = input.files?.[0];
  if (!file) {
    showAppNotice('Selecciona una imagen primero.', true);
    return;
  }
  button.disabled = true;
  try {
    const url = new URL(apiBaseUrl, document.baseURI);
    url.searchParams.set('action', 'admin-upload');
    const body = new FormData();
    body.set('kind', kind);
    body.set('file', file);
    const response = await fetch(url.href, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}`, Accept: 'application/json' },
      body,
      cache: 'no-store',
      credentials: 'omit'
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo guardar la imagen.');
    applyBranding(result.settings);
    input.value = '';
    showAppNotice(kind === 'logo' ? 'Logotipo actualizado.' : 'Favicon actualizado.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function renderAdminSuggestions(suggestions) {
  const container = document.getElementById('adminSuggestionsList');
  if (!suggestions.length) {
    container.innerHTML = '<p class="empty-state">Aún no recibimos sugerencias.</p>';
    return;
  }
  const labels = { new: 'Nueva', reviewing: 'En revisión', resolved: 'Resuelta' };
  container.innerHTML = suggestions.map((item) => `
    <div class="admin-record suggestion-record" data-suggestion-id="${item.id}">
      <div><strong>${escapeHtml(item.name)} · ${escapeHtml(item.email)}</strong><p>${escapeHtml(item.message)}</p></div>
      <label>Estado<select class="suggestion-status">
        ${Object.entries(labels).map(([value, label]) => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${label}</option>`).join('')}
      </select></label>
      <button class="button button-quiet suggestion-save" type="button">Guardar estado</button>
    </div>
  `).join('');
  container.querySelectorAll('.suggestion-save').forEach((button) => {
    button.addEventListener('click', async () => {
      const record = button.closest('.suggestion-record');
      button.disabled = true;
      try {
        await apiRequest('admin-suggestions', {
          method: 'PUT',
          body: { id: record.dataset.suggestionId, status: record.querySelector('.suggestion-status').value }
        });
        showAppNotice('Estado de sugerencia actualizado.');
        await loadAdminData();
      } catch (error) {
        showAppNotice(error.message, true);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function renderSubscriptionData(data) {
  const optionsList = document.getElementById('subscriptionOptionsList');
  const usersSelect = document.getElementById('assignmentUserInput');
  const optionsSelect = document.getElementById('assignmentOptionInput');
  usersSelect.innerHTML = '<option value="">Selecciona cliente</option>' + data.users
    .map((user) => `<option value="${user.id}">${escapeHtml(user.name)} · ${escapeHtml(user.email)}</option>`).join('');
  optionsSelect.innerHTML = '<option value="">Selecciona opción</option>' + data.options
    .filter((option) => option.active)
    .map((option) => `<option value="${option.id}">${escapeHtml(option.name)}</option>`).join('');
  if (!data.options.length) {
    optionsList.innerHTML = '<p class="empty-state">Crea una opción para empezar a asignar suscripciones.</p>';
  } else {
    optionsList.innerHTML = data.options.map((option) => `
      <form class="admin-record subscription-option-record" data-option-id="${option.id}">
        <label>Nombre<input name="name" maxlength="60" value="${escapeHtml(option.name)}" required /></label>
        <label>Descripción<input name="description" maxlength="300" value="${escapeHtml(option.description)}" /></label>
        <label>Características<input name="features" maxlength="1000" value="${escapeHtml(option.features.join(', '))}" /></label>
        <label class="admin-check"><input name="active" type="checkbox" ${option.active ? 'checked' : ''} /> Disponible</label>
        <button class="button button-quiet" type="submit">Guardar</button>
      </form>
    `).join('');
    optionsList.querySelectorAll('.subscription-option-record').forEach((record) => {
      record.addEventListener('submit', async (event) => {
        event.preventDefault();
        const fields = new FormData(record);
        const button = record.querySelector('button[type="submit"]');
        button.disabled = true;
        try {
          await apiRequest('admin-subscriptions', {
            method: 'PUT',
            body: {
              id: record.dataset.optionId,
              name: fields.get('name'),
              description: fields.get('description'),
              features: String(fields.get('features') || '').split(',').map((feature) => feature.trim()).filter(Boolean),
              active: fields.get('active') === 'on'
            }
          });
          showAppNotice('Opción actualizada.');
          await loadAdminData();
        } catch (error) {
          showAppNotice(error.message, true);
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  const assignmentsList = document.getElementById('subscriptionAssignmentsList');
  if (!data.assignments.length) {
    assignmentsList.innerHTML = '<p class="empty-state">No hay suscripciones asignadas manualmente.</p>';
    return;
  }
  assignmentsList.innerHTML = data.assignments.map((item) => `
    <div class="admin-record assignment-record" data-assignment-id="${item.id}">
      <div><strong>${escapeHtml(item.userName)} · ${escapeHtml(item.email)}</strong><small>${escapeHtml(item.optionName)} · Inicio: ${escapeHtml(item.startsAt)}</small></div>
      <label>Estado<select class="assignment-status">
        <option value="active" ${item.status === 'active' ? 'selected' : ''}>Activa</option>
        <option value="paused" ${item.status === 'paused' ? 'selected' : ''}>Pausada</option>
        <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
      </select></label>
      <label>Fin<input class="assignment-end" type="date" value="${escapeHtml(item.endsAt || '')}" /></label>
      <button class="button button-quiet assignment-save" type="button">Guardar</button>
      <button class="button button-reset assignment-delete" type="button">Eliminar</button>
    </div>
  `).join('');
  assignmentsList.querySelectorAll('.assignment-save').forEach((button) => {
    button.addEventListener('click', async () => {
      const record = button.closest('.assignment-record');
      button.disabled = true;
      try {
        await apiRequest('admin-assignments', {
          method: 'PUT',
          body: {
            id: record.dataset.assignmentId,
            status: record.querySelector('.assignment-status').value,
            endsAt: record.querySelector('.assignment-end').value
          }
        });
        showAppNotice('Suscripción actualizada.');
        await loadAdminData();
      } catch (error) {
        showAppNotice(error.message, true);
      } finally {
        button.disabled = false;
      }
    });
  });
  assignmentsList.querySelectorAll('.assignment-delete').forEach((button) => {
    button.addEventListener('click', async () => {
      const record = button.closest('.assignment-record');
      button.disabled = true;
      try {
        await apiRequest('admin-assignments', { method: 'DELETE', body: { id: record.dataset.assignmentId } });
        showAppNotice('Asignación eliminada.');
        await loadAdminData();
      } catch (error) {
        showAppNotice(error.message, true);
      } finally {
        button.disabled = false;
      }
    });
  });
}

async function handleSubscriptionOptionSubmit(event) {
  event.preventDefault();
  const button = subscriptionOptionForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await apiRequest('admin-subscriptions', {
      method: 'POST',
      body: {
        name: document.getElementById('optionNameInput').value.trim(),
        description: document.getElementById('optionDescriptionInput').value.trim(),
        features: document.getElementById('optionFeaturesInput').value.split(',').map((feature) => feature.trim()).filter(Boolean)
      }
    });
    subscriptionOptionForm.reset();
    showAppNotice('Opción creada.');
    await loadAdminData();
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleSubscriptionAssignmentSubmit(event) {
  event.preventDefault();
  const button = subscriptionAssignmentForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    await apiRequest('admin-assignments', {
      method: 'POST',
      body: {
        userId: document.getElementById('assignmentUserInput').value,
        optionId: document.getElementById('assignmentOptionInput').value,
        startsAt: document.getElementById('assignmentStartInput').value,
        endsAt: document.getElementById('assignmentEndInput').value
      }
    });
    subscriptionAssignmentForm.reset();
    showAppNotice('Suscripción asignada.');
    await loadAdminData();
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function completeAuthentication(result) {
  authToken = result.token;
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
  currentUser = result.user;
  try {
    await loadAccountData();
    showApp();
  } catch (error) {
    clearAuthSession();
    throw error;
  }
}

async function handleRequestResetSubmit(event) {
  event.preventDefault();
  await submitAuthForm(requestResetForm, async () => {
    const email = recoveryEmail.value.trim();
    await apiRequest('request-reset', { method: 'POST', body: { email } });
    resetEmail.value = email;
    resetCode.value = '';
    newPassword.value = '';
    showAuthView('resetPassword', 'Si el correo está registrado, recibirás un código de recuperación.');
  });
}

async function handleResendCode() {
  resendCodeButton.disabled = true;
  try {
    await apiRequest('request-reset', { method: 'POST', body: { email: resetEmail.value.trim() } });
    showAuthMessage('Si el correo está registrado, recibirás un código nuevo.');
  } catch (error) {
    showAuthMessage(error.message, true);
  } finally {
    resendCodeButton.disabled = false;
  }
}

async function handleResetPasswordSubmit(event) {
  event.preventDefault();
  await submitAuthForm(resetPasswordForm, async () => {
    const result = await apiRequest('reset-password', {
      method: 'POST',
      body: {
        email: resetEmail.value.trim(),
        code: resetCode.value.trim(),
        password: newPassword.value
      }
    });
    loginEmail.value = resetEmail.value;
    loginPassword.value = '';
    showAuthView('login', result.message);
  });
}

async function handleLogout() {
  logoutButton.disabled = true;
  try {
    await apiRequest('logout', { method: 'POST', body: {} });
    clearAuthSession();
    showAuthView('login', 'Cerraste sesión.');
  } catch (error) {
    showAppNotice(`No se pudo cerrar la sesión en el servidor. ${error.message}`, true);
  } finally {
    logoutButton.disabled = false;
  }
}

function isNativePlatform() {
  return Boolean(
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform()
  );
}

function isAppInstalled() {
  const displayMode = window.matchMedia &&
    ['standalone', 'minimal-ui', 'fullscreen'].some((mode) =>
      window.matchMedia(`(display-mode: ${mode})`).matches
    );
  const iosStandalone = navigator.standalone === true;

  return isNativePlatform() || displayMode || iosStandalone;
}

function hideInstallButton() {
  deferredInstallPrompt = null;
  installButton.hidden = true;
  authInstallButton.hidden = true;
  authInstallHelp.hidden = true;
}

function updateInstallButtonVisibility() {
  if (isAppInstalled()) {
    hideInstallButton();
  }
}

async function handleReportClick() {
  try {
    reportButton.disabled = true;
    reportButton.textContent = 'Preparando PDF…';
    await exportReportPDF();
  } catch (error) {
    console.error('No se pudo generar o compartir el reporte PDF.', error);
    window.alert('No se pudo generar el reporte. Intenta de nuevo.');
  } finally {
    reportButton.disabled = false;
    reportButton.innerHTML = '<span aria-hidden="true">↓</span> Descargar reporte PDF';
  }
}

async function exportReportPDF() {
  const jsPDF = await loadJsPDF();
  const reportTransactions = getFilteredTransactions().sort((a, b) => a.date.localeCompare(b.date));
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 16;
  const right = pageWidth - left;
  const period = filterMonthInput.value === 'all' ? 'Todo el período' : formatMonthLabel(filterMonthInput.value);
  const totals = reportTransactions.reduce(
    (summary, transaction) => {
      summary[transaction.type] += transaction.amount;
      return summary;
    },
    { income: 0, expense: 0 }
  );
  const categoryTotals = reportTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((result, transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + transaction.amount;
      return result;
    }, {});

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 48, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(publicBrand.appName || 'Finanza', left, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Reporte de ingresos y gastos', left, 28);
  doc.text(`Período: ${period}`, left, 36);
  doc.text(`Generado: ${formatDate(getDateString(0))}`, right, 36, { align: 'right' });

  let y = 61;
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RESUMEN', left, y);
  y += 8;
  const summaryCards = [
    ['Ingresos', totals.income, [22, 163, 74]],
    ['Gastos', totals.expense, [239, 68, 68]],
    ['Balance', totals.income - totals.expense, [59, 130, 246]]
  ];
  const cardGap = 4;
  const cardWidth = (right - left - cardGap * 2) / 3;

  summaryCards.forEach(([label, value, color], index) => {
    const x = left + index * (cardWidth + cardGap);
    doc.setFillColor(245, 247, 251);
    doc.roundedRect(x, y, cardWidth, 23, 3, 3, 'F');
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label, x + 4, y + 7);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(formatReportAmount(value), x + 4, y + 17);
  });

  y += 35;
  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  if (categories.length) {
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GASTOS POR CATEGORÍA', left, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    categories.slice(0, 8).forEach(([category, value]) => {
      doc.setTextColor(75, 85, 99);
      doc.text(category, left, y);
      doc.setTextColor(31, 41, 55);
      doc.text(formatReportAmount(value), right, y, { align: 'right' });
      y += 6;
    });
    y += 5;
  }

  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('MOVIMIENTOS', left, y);
  y += 8;

  const columns = { date: left, description: left + 27, category: left + 105, amount: right };
  const drawTableHeader = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(left, y - 5, right - left, 9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FECHA', columns.date + 2, y);
    doc.text('DESCRIPCIÓN', columns.description, y);
    doc.text('CATEGORÍA', columns.category, y);
    doc.text('MONTO', columns.amount - 2, y, { align: 'right' });
    y += 8;
  };
  drawTableHeader();

  reportTransactions.forEach((transaction, index) => {
    const descriptionLines = doc.splitTextToSize(transaction.description, 72);
    const rowHeight = Math.max(8, descriptionLines.length * 4 + 3);
    if (y + rowHeight > pageHeight - 16) {
      doc.addPage();
      y = 18;
      drawTableHeader();
    }

    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(left, y - 5, right - left, rowHeight, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    doc.text(formatDate(transaction.date), columns.date + 2, y);
    doc.text(descriptionLines, columns.description, y);
    doc.text(doc.splitTextToSize(transaction.category, 30), columns.category, y);
    doc.setTextColor(transaction.type === 'income' ? 22 : 220, transaction.type === 'income' ? 163 : 38, transaction.type === 'income' ? 74 : 38);
    doc.text(`${transaction.type === 'income' ? '+' : '-'}${formatReportAmount(transaction.amount)}`, columns.amount - 2, y, { align: 'right' });
    y += rowHeight;
  });

  if (!reportTransactions.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('No hay movimientos para los filtros seleccionados.', left, y);
  }

  const filename = `finanza-reporte-${filterMonthInput.value === 'all' ? 'completo' : filterMonthInput.value}.pdf`;
  const pdfBlob = doc.output('blob');

  if (isNativePlatform()) {
    const base64 = await blobToBase64(pdfBlob);
    const file = await Filesystem.writeFile({
      path: filename,
      data: base64,
      directory: Directory.Cache
    });
    await Share.share({
      title: 'Reporte financiero',
      text: `Reporte de Finanza - ${period}`,
      url: file.uri,
      dialogTitle: 'Guardar o compartir reporte PDF'
    });
    return;
  }

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) {
    return Promise.resolve(window.jspdf.jsPDF);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('vendor/jspdf.umd.min.js', document.baseURI).href;
    script.onload = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve(window.jspdf.jsPDF);
      } else {
        reject(new Error('La librería de reportes no se pudo iniciar.'));
      }
    };
    script.onerror = () => reject(new Error('No se pudo cargar la librería de reportes.'));
    document.head.appendChild(script);
  });
}

function formatReportAmount(value) {
  return `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo preparar el reporte PDF.'));
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('El reporte PDF tiene un formato inesperado.'));
        return;
      }
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

async function handleInstallClick() {
  if (isAppInstalled()) {
    hideInstallButton();
    return;
  }

  if (!deferredInstallPrompt) {
    authInstallHelp.textContent = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      ? 'En Safari, toca Compartir y elige “Añadir a pantalla de inicio”.'
      : 'Abre el menú del navegador y elige “Instalar app” o “Añadir a pantalla principal”.';
    authInstallHelp.hidden = false;
    return;
  }

  deferredInstallPrompt.prompt();
  const choiceResult = await deferredInstallPrompt.userChoice;

  if (choiceResult.outcome === 'accepted' || isAppInstalled()) {
    hideInstallButton();
    return;
  }

  hideInstallButton();
}

function handleSubmit(event) {
  event.preventDefault();
  submitTransaction();
}

async function submitTransaction() {
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const type = typeInput.value;
  const amount = Number(amountInput.value);
  const date = dateInput.value;

  if (!description || !date || Number.isNaN(amount) || amount <= 0) {
    return;
  }

  const payload = { description, category, type, amount, date };

  submitButton.disabled = true;
  try {
    if (editingTransactionId) {
      const result = await apiRequest('transactions', {
        method: 'PUT',
        body: { id: editingTransactionId, ...payload }
      });
      transactions = transactions.map((transaction) =>
        transaction.id === editingTransactionId ? result.transaction : transaction
      );
    } else {
      const result = await apiRequest('transactions', { method: 'POST', body: payload });
      transactions.unshift(result.transaction);
    }

    resetFormState();
    render();
    showAppNotice('Movimiento guardado.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
}

function handleGoalSubmit(event) {
  event.preventDefault();
  submitGoal();
}

async function submitGoal() {
  const name = goalNameInput.value.trim();
  const target = Number(goalTargetInput.value);
  const current = Number(goalCurrentInput.value);
  const dueDate = goalDateInput.value;

  if (!name || Number.isNaN(target) || target <= 0 || Number.isNaN(current) || current < 0 || !dueDate) {
    return;
  }

  try {
    const result = await apiRequest('goals', { method: 'POST', body: { name, target, current, dueDate } });
    goals.push(result.goal);
    goals = goals.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    goalForm.reset();
    goalDateInput.value = getDateString(90);
    renderGoals();
    showAppNotice('Meta guardada.');
  } catch (error) {
    showAppNotice(error.message, true);
  }
}

function render() {
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' });
  monthLabel.textContent = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const summary = summarizeTransactions();
  balanceValue.textContent = formatCurrency(summary.balance);
  incomeValue.textContent = formatCurrency(summary.income);
  expenseValue.textContent = formatCurrency(summary.expense);
  savedValue.textContent = formatCurrency(summary.saved);
  balanceValue.parentElement.querySelector('small').textContent = summary.deltaText;

  renderMonthlyChart();
  renderCategoryChart();
  renderCategories();
  renderBudget(buildBudgetData());
  renderGoals();
  renderMonthOptions();
  renderTable();
}

function summarizeTransactions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    const date = new Date(transaction.date + 'T00:00:00');
    const sameMonth = date.getFullYear() === currentYear && date.getMonth() === currentMonth;

    if (!sameMonth) {
      continue;
    }

    if (transaction.type === 'income') {
      income += transaction.amount;
    } else {
      expense += transaction.amount;
    }
  }

  const balance = income - expense;
  const saved = Math.max(0, income * 0.3);
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousIncome = transactions
    .filter((t) => {
      const date = new Date(t.date + 'T00:00:00');
      return date.getFullYear() === previousMonth.getFullYear() && date.getMonth() === previousMonth.getMonth();
    })
    .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);

  const previousExpense = transactions
    .filter((t) => {
      const date = new Date(t.date + 'T00:00:00');
      return date.getFullYear() === previousMonth.getFullYear() && date.getMonth() === previousMonth.getMonth();
    })
    .reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);

  const prevBalance = previousIncome - previousExpense;
  const delta = balance - prevBalance;

  return {
    income,
    expense,
    balance,
    saved,
    deltaText: delta >= 0 ? `+${formatCurrency(delta)} vs. mes anterior` : `${formatCurrency(delta)} vs. mes anterior`
  };
}

function buildBudgetData() {
  const categories = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  for (const transaction of transactions) {
    const date = new Date(transaction.date + 'T00:00:00');
    if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth || transaction.type !== 'expense') {
      continue;
    }

    const category = transaction.category || 'Otros';
    categories[category] = (categories[category] || 0) + transaction.amount;
  }

  const entries = Object.entries(categories)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return entries;
}

function renderBudget(entries) {
  if (!entries.length) {
    budgetList.innerHTML = '<p class="empty-state">Aún no hay gastos este mes.</p>';
    return;
  }

  const maxTotal = Math.max(...entries.map((entry) => entry.total), 1);

  budgetList.innerHTML = entries
    .map((entry) => {
      const width = Math.min((entry.total / maxTotal) * 100, 100);
      return `
        <div class="budget-item">
          <header>
            <span>${escapeHtml(entry.category)}</span>
            <span>${formatCurrency(entry.total)}</span>
          </header>
          <div class="progress-track">
            <span class="progress-fill expense" style="width: ${width}%"></span>
          </div>
        </div>
      `;
    })
    .join('');
}

async function handleCategorySubmit(event) {
  event.preventDefault();
  const name = newCategoryInput.value.trim();
  if (!name) {
    return;
  }
  if (SUGGESTED_CATEGORIES.some((category) => category.toLowerCase() === name.toLowerCase())) {
    showAppNotice('Esa categoría ya está entre las sugeridas.', true);
    return;
  }

  const button = categoryForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('categories', { method: 'POST', body: { name } });
    categories.push(result.category);
    newCategoryInput.value = '';
    renderCategories();
    categoryInput.value = result.category.name;
    showAppNotice('Categoría agregada.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function renderCategories() {
  const selectedCategory = categoryInput.value;
  const allNames = [...SUGGESTED_CATEGORIES, ...categories.map((category) => category.name)]
    .filter((name, index, names) => names.findIndex((candidate) => candidate.toLowerCase() === name.toLowerCase()) === index);

  categoryInput.innerHTML = allNames
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  if (allNames.includes(selectedCategory)) {
    categoryInput.value = selectedCategory;
  }

  const filterValue = filterCategoryInput.value;
  filterCategoryInput.innerHTML = '<option value="all">Todas las categorías</option>' + allNames
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  filterCategoryInput.value = allNames.includes(filterValue) ? filterValue : 'all';

  if (!categories.length) {
    customCategoryList.innerHTML = '<p class="empty-state">Aún no tienes categorías personalizadas.</p>';
    return;
  }

  customCategoryList.innerHTML = categories
    .map((category) => `
      <span class="custom-category">
        ${escapeHtml(category.name)}
        <button class="category-delete-button" type="button" data-category-id="${escapeHtml(category.id)}" aria-label="Eliminar categoría ${escapeHtml(category.name)}">×</button>
      </span>
    `)
    .join('');

  customCategoryList.querySelectorAll('.category-delete-button').forEach((button) => {
    button.addEventListener('click', async () => {
      try {
        await apiRequest('categories', { method: 'DELETE', body: { id: button.dataset.categoryId } });
        categories = categories.filter((category) => category.id !== button.dataset.categoryId);
        renderCategories();
        renderTable();
        showAppNotice('Categoría eliminada. Los movimientos anteriores conservan su categoría.');
      } catch (error) {
        showAppNotice(error.message, true);
      }
    });
  });
}

function getFilteredTransactions() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const typeValue = filterTypeInput.value;
  const categoryValue = filterCategoryInput.value;
  const monthValue = filterMonthInput.value;

  return [...transactions].filter((transaction) => {
    const matchesSearch = !searchValue || transaction.description.toLowerCase().includes(searchValue) || transaction.category.toLowerCase().includes(searchValue);
    const matchesType = typeValue === 'all' || transaction.type === typeValue;
    const matchesCategory = categoryValue === 'all' || transaction.category === categoryValue;
    const matchesMonth = monthValue === 'all' || transaction.date.startsWith(monthValue);

    return matchesSearch && matchesType && matchesCategory && matchesMonth;
  });
}

function renderTable() {
  const filteredTransactions = getFilteredTransactions();

  if (!filteredTransactions.length) {
    tableBody.innerHTML = '<tr><td colspan="5"><p class="empty-state">Sin movimientos que coincidan con los filtros.</p></td></tr>';
    return;
  }

  const sorted = filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  tableBody.innerHTML = sorted
    .map(
      (row) => `
        <tr>
          <td data-label="Descripción">${escapeHtml(row.description)}</td>
          <td data-label="Categoría">${escapeHtml(row.category)}</td>
          <td data-label="Fecha">${formatDate(row.date)}</td>
          <td data-label="Monto" class="${row.type === 'income' ? 'amount-income' : 'amount-expense'}">
            ${row.type === 'income' ? '+' : '-'}${formatCurrency(row.amount)}
          </td>
          <td data-label="Acciones">
            <div class="goal-actions">
              <button class="edit-button" type="button" data-edit-id="${row.id}">Editar</button>
              <button class="delete-button" type="button" data-delete-id="${row.id}">Eliminar</button>
            </div>
          </td>
        </tr>
      `
    )
    .join('');

  tableBody.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteId;
      button.disabled = true;
      try {
        await apiRequest('transactions', { method: 'DELETE', body: { id } });
        transactions = transactions.filter((item) => item.id !== id);
        if (editingTransactionId === id) {
          resetFormState();
        }
        render();
        showAppNotice('Movimiento eliminado.');
      } catch (error) {
        button.disabled = false;
        showAppNotice(error.message, true);
      }
    });
  });

  tableBody.querySelectorAll('.edit-button').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.editId;
      const item = transactions.find((transaction) => transaction.id === id);

      if (!item) {
        return;
      }

      editingTransactionId = id;
      transactionFormTitle.textContent = 'Editar movimiento';
      submitButton.textContent = 'Guardar cambios';
      cancelEditButton.hidden = false;
      descriptionInput.value = item.description;
      categoryInput.value = item.category;
      typeInput.value = item.type;
      amountInput.value = String(item.amount);
      dateInput.value = item.date;
      descriptionInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function renderMonthlyChart() {
  const lastSixMonths = [];
  const today = new Date();

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    lastSixMonths.push({
      label: date.toLocaleString('es-ES', { month: 'short' }),
      monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      income: 0,
      expense: 0
    });
  }

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date + 'T00:00:00');
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const entry = lastSixMonths.find((item) => item.monthKey === monthKey);

    if (!entry) {
      return;
    }

    if (transaction.type === 'income') {
      entry.income += transaction.amount;
    } else {
      entry.expense += transaction.amount;
    }
  });

  const maxValue = Math.max(...lastSixMonths.flatMap((entry) => [entry.income, entry.expense]), 1);

  monthlyChart.innerHTML = lastSixMonths
    .map(
      (entry) => `
        <div class="chart-bar-group">
          <div class="chart-stack">
            <span class="bar bar-income" style="height: ${(entry.income / maxValue) * 100}%" title="Ingresos: ${formatCurrency(entry.income)}"></span>
            <span class="bar bar-expense" style="height: ${(entry.expense / maxValue) * 100}%" title="Gastos: ${formatCurrency(entry.expense)}"></span>
          </div>
          <span class="chart-label">${escapeHtml(entry.label)}</span>
        </div>
      `
    )
    .join('');
}

function renderCategoryChart() {
  const currentMonth = new Date();
  const totals = {};

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date + 'T00:00:00');
    if (date.getFullYear() !== currentMonth.getFullYear() || date.getMonth() !== currentMonth.getMonth() || transaction.type !== 'expense') {
      return;
    }

    const category = transaction.category || 'Otros';
    totals[category] = (totals[category] || 0) + transaction.amount;
  });

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const totalValue = entries.reduce((sum, [, value]) => sum + value, 0) || 1;
  const palette = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  let cumulative = 0;
  const gradientParts = entries
    .map(([category, value], index) => {
      const start = cumulative / totalValue * 100;
      cumulative += value;
      const end = cumulative / totalValue * 100;
      return `${palette[index % palette.length]} ${start}% ${end}%`;
    })
    .join(', ');

  categoryChart.innerHTML = `
    <div class="donut-wrap" style="background: conic-gradient(${gradientParts});">
      <div class="donut-center">${entries.length ? formatCurrency(totalValue) : '$0'}</div>
    </div>
    <div class="category-legend">
      ${
        entries.length
          ? entries
              .map(
                ([category, value], index) => `
                  <div class="legend-item">
                    <div>
                      <span class="legend-dot" style="background:${palette[index % palette.length]};"></span>
                      <span>${escapeHtml(category)}</span>
                    </div>
                    <strong>${formatCurrency(value)}</strong>
                  </div>
                `
              )
              .join('')
          : '<div class="legend-item"><span>No hay gastos</span></div>'
      }
    </div>
  `;
}

function renderGoals() {
  if (!goals.length) {
    goalsList.innerHTML = '<p class="empty-state">Aún no agregas metas.</p>';
    return;
  }

  goalsList.innerHTML = goals
    .map((goal) => {
      const percent = Math.min((goal.current / goal.target) * 100, 100);
      const remaining = Math.max(goal.target - goal.current, 0);
      return `
        <article class="goal-item">
          <header>
            <strong>${escapeHtml(goal.name)}</strong>
            <span>${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}</span>
          </header>
          <div class="goal-progress">
            <div class="progress-track">
              <span class="progress-fill" style="width: ${percent}%"></span>
            </div>
          </div>
          <footer>
            <span>${Math.round(percent)}% completado</span>
            <span>${formatCurrency(remaining)} restantes</span>
          </footer>
          <div class="goal-actions" style="margin-top: 12px;">
            <button class="goal-delete-button" type="button" data-goal-id="${goal.id}">Eliminar</button>
          </div>
        </article>
      `;
    })
    .join('');

  goalsList.querySelectorAll('.goal-delete-button').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.goalId;
      button.disabled = true;
      try {
        await apiRequest('goals', { method: 'DELETE', body: { id } });
        goals = goals.filter((goal) => goal.id !== id);
        renderGoals();
        showAppNotice('Meta eliminada.');
      } catch (error) {
        button.disabled = false;
        showAppNotice(error.message, true);
      }
    });
  });
}

function renderMonthOptions() {
  const uniqueMonths = [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))].sort().reverse();
  const current = filterMonthInput.value;

  filterMonthInput.innerHTML = '<option value="all">Todo el período</option>' + uniqueMonths
    .map((month) => `<option value="${month}">${formatMonthLabel(month)}</option>`)
    .join('');

  filterMonthInput.value = uniqueMonths.includes(current) ? current : 'all';
}

function resetFormState() {
  editingTransactionId = null;
  form.reset();
  transactionFormTitle.textContent = 'Agregar movimiento';
  submitButton.textContent = 'Guardar movimiento';
  cancelEditButton.hidden = true;
  dateInput.value = getDateString(0);
  typeInput.value = 'expense';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
}

function formatDate(value) {
  const date = new Date(value + 'T00:00:00');
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
}

function getDateString(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
