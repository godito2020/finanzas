import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

const AUTH_TOKEN_KEY = 'finanza-auth-token-v1';
const THEME_PREFERENCE_KEY = 'finanza-theme';
const TERMS_VERSION = '1.0-2026-10-27';
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
const aiFloatingButton = document.getElementById('aiFloatingButton');
const authInstallButton = document.getElementById('authInstallButton');
const authInstallHelp = document.getElementById('authInstallHelp');
const reportButton = document.getElementById('reportButton');
const restartOnboardingButton = document.getElementById('restartOnboardingButton');
const authScreen = document.getElementById('authScreen');
const appShell = document.getElementById('appShell');
const authMessage = document.getElementById('authMessage');
const authConfigNote = document.getElementById('authConfigNote');
const authTitle = document.getElementById('authTitle');
const authIntro = document.getElementById('authIntro');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const requiredPaymentForm = document.getElementById('requiredPaymentForm');
const requiredPaymentCurrency = document.getElementById('requiredPaymentCurrency');
const requiredPaymentMethod = document.getElementById('requiredPaymentMethod');
const requiredPaymentAmount = document.getElementById('requiredPaymentAmount');
const requiredPaymentEquivalent = document.getElementById('requiredPaymentEquivalent');
const requiredPaymentInstructions = document.getElementById('requiredPaymentInstructions');
const requiredPaymentReference = document.getElementById('requiredPaymentReference');
const requiredPaymentStatus = document.getElementById('requiredPaymentStatus');
const requiredPaymentSubmit = document.getElementById('requiredPaymentSubmit');
const requiredMercadoPagoOption = document.getElementById('requiredMercadoPagoOption');
const requiredPaymentReferenceLabel = document.getElementById('requiredPaymentReferenceLabel');
const mercadoPagoWalletContainer = document.getElementById('mercadoPagoWalletContainer');
const mercadoPagoCheckoutLink = document.getElementById('mercadoPagoCheckoutLink');
const mercadoPagoWebhookSecretInput = document.getElementById('mercadoPagoWebhookSecretInput');
const aiPaymentCurrency = document.getElementById('aiPaymentCurrency');
const aiPaymentMethod = document.getElementById('aiPaymentMethod');
const aiPaymentAmount = document.getElementById('aiPaymentAmount');
const aiPaymentInstructions = document.getElementById('aiPaymentInstructions');
const aiPaymentReference = document.getElementById('aiPaymentReference');
const aiPaymentControls = document.getElementById('aiPaymentControls');
const aiActivateLifetimeButton = document.getElementById('aiActivateLifetimeButton');
const verifyEmailForm = document.getElementById('verifyEmailForm');
const verificationEmail = document.getElementById('verificationEmail');
const verificationCode = document.getElementById('verificationCode');
const resendActivationButton = document.getElementById('resendActivationButton');
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
const accountName = document.getElementById('accountName');
const logoutButton = document.getElementById('logoutButton');
const showRecoveryButton = document.getElementById('showRecoveryButton');
const resendCodeButton = document.getElementById('resendCodeButton');
const appNotice = document.getElementById('appNotice');
const balanceValue = document.getElementById('balanceValue');
const incomeValue = document.getElementById('incomeValue');
const expenseValue = document.getElementById('expenseValue');
const savedValue = document.getElementById('savedValue');
const paymentForm = document.getElementById('paymentForm');
const paymentNameInput = document.getElementById('paymentNameInput');
const paymentCategoryInput = document.getElementById('paymentCategoryInput');
const paymentAmountInput = document.getElementById('paymentAmountInput');
const paymentCurrencyInput = document.getElementById('paymentCurrencyInput');
const paymentExchangeRateField = document.getElementById('paymentExchangeRateField');
const paymentExchangeRateInput = document.getElementById('paymentExchangeRateInput');
const paymentExchangeRateHint = document.getElementById('paymentExchangeRateHint');
const paymentDueDateInput = document.getElementById('paymentDueDateInput');
const paymentRecurrenceInput = document.getElementById('paymentRecurrenceInput');
const paymentReminderTimeInput = document.getElementById('paymentReminderTimeInput');
const paymentCalendar = document.getElementById('paymentCalendar');
const paymentMonthLabel = document.getElementById('paymentMonthLabel');
const selectedPaymentDateLabel = document.getElementById('selectedPaymentDateLabel');
const paymentsList = document.getElementById('paymentsList');
const upcomingPaymentsList = document.getElementById('upcomingPaymentsList');
const previousPaymentMonth = document.getElementById('previousPaymentMonth');
const nextPaymentMonth = document.getElementById('nextPaymentMonth');
const descriptionInput = document.getElementById('descriptionInput');
const categoryInput = document.getElementById('categoryInput');
const categoryForm = document.getElementById('categoryForm');
const newCategoryInput = document.getElementById('newCategoryInput');
const customCategoryList = document.getElementById('customCategoryList');
const typeInput = document.getElementById('typeInput');
const amountInput = document.getElementById('amountInput');
const currencyInput = document.getElementById('currencyInput');
const exchangeRateField = document.getElementById('exchangeRateField');
const exchangeRateInput = document.getElementById('exchangeRateInput');
const exchangeRateHint = document.getElementById('exchangeRateHint');
const currencyHistoryNotice = document.getElementById('currencyHistoryNotice');
const dateInput = document.getElementById('dateInput');
const cancelEditButton = document.getElementById('cancelEditButton');
const transactionFormTitle = document.getElementById('transactionFormTitle');
const submitButton = document.getElementById('submitButton');
const openAiAssistantButton = document.getElementById('openAiAssistantButton');
const aiAssistantDialog = document.getElementById('aiAssistantDialog');
const aiAssistantTitle = document.getElementById('aiAssistantTitle');
const closeAiAssistantButton = document.getElementById('closeAiAssistantButton');
const cancelAiAssistantButton = document.getElementById('cancelAiAssistantButton');
const aiAssistantStatus = document.getElementById('aiAssistantStatus');
const aiAssistantTools = document.getElementById('aiAssistantTools');
const aiPaidOffer = document.getElementById('aiPaidOffer');
const aiRequestStatus = document.getElementById('aiRequestStatus');
const requestAiAccessButton = document.getElementById('requestAiAccessButton');
const aiReceiptInput = document.getElementById('aiReceiptInput');
const aiReceiptPreview = document.getElementById('aiReceiptPreview');
const analyzeReceiptButton = document.getElementById('analyzeReceiptButton');
const aiTranscriptInput = document.getElementById('aiTranscriptInput');
const startVoiceButton = document.getElementById('startVoiceButton');
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
const suggestionDialog = document.getElementById('suggestionDialog');
const suggestionMessage = document.getElementById('suggestionMessage');
const openSuggestionButton = document.getElementById('openSuggestionButton');
const closeSuggestionButton = document.getElementById('closeSuggestionButton');
const cancelSuggestionButton = document.getElementById('cancelSuggestionButton');
const adminUserForm = document.getElementById('adminUserForm');
const adminSettingsForm = document.getElementById('adminSettingsForm');
const subscriptionOptionForm = document.getElementById('subscriptionOptionForm');
const subscriptionAssignmentForm = document.getElementById('subscriptionAssignmentForm');
const mobileNav = document.querySelector('.mobile-nav');
const utilityMenu = document.querySelector('.utility-menu');
const themePreferenceInput = document.getElementById('themePreferenceInput');
const reportPeriodInput = document.getElementById('reportPeriodInput');
const reportTypeInput = document.getElementById('reportTypeInput');
const reportCategoryInput = document.getElementById('reportCategoryInput');
const reportGroupInput = document.getElementById('reportGroupInput');
const reportStartDate = document.getElementById('reportStartDate');
const reportEndDate = document.getElementById('reportEndDate');
const reportStartField = document.getElementById('reportStartField');
const reportEndField = document.getElementById('reportEndField');
const reportSearchInput = document.getElementById('reportSearchInput');
const reportBreakdown = document.getElementById('reportBreakdown');
const reportTableBody = document.getElementById('reportTableBody');
const appPages = [...document.querySelectorAll('[data-app-page]')];
const budgetForm = document.getElementById('budgetForm');
const budgetCategoryInput = document.getElementById('budgetCategoryInput');
const budgetAmountInput = document.getElementById('budgetAmountInput');
const dashboardDateRange = document.getElementById('dashboardDateRange');
const dashboardStartDate = document.getElementById('dashboardStartDate');
const dashboardEndDate = document.getElementById('dashboardEndDate');
const dashboardPeriodLabel = document.getElementById('dashboardPeriodLabel');
const dashboardPendingList = document.getElementById('dashboardPendingList');
const dashboardRecentList = document.getElementById('dashboardRecentList');
const debtsList = document.getElementById('debtsList');
const debtPaymentsList = document.getElementById('debtPaymentsList');
const debtForm = document.getElementById('debtForm');
const debtNameInput = document.getElementById('debtNameInput');
const debtLenderInput = document.getElementById('debtLenderInput');
const debtAmountInput = document.getElementById('debtAmountInput');
const debtCurrencyInput = document.getElementById('debtCurrencyInput');
const debtExchangeRateField = document.getElementById('debtExchangeRateField');
const debtExchangeRateInput = document.getElementById('debtExchangeRateInput');
const debtExchangeRateHint = document.getElementById('debtExchangeRateHint');
const emergencyFundForm = document.getElementById('emergencyFundForm');
const emergencyTargetInput = document.getElementById('emergencyTargetInput');
const emergencyCurrentInput = document.getElementById('emergencyCurrentInput');
const planPaymentForm = document.getElementById('planPaymentForm');
const planPaymentMethodInput = document.getElementById('planPaymentMethodInput');
const selectedPlanPeriod = document.getElementById('selectedPlanPeriod');
const planPaymentInstructions = document.getElementById('planPaymentInstructions');
const planPaymentReferenceInput = document.getElementById('planPaymentReferenceInput');
const planPaymentReferenceField = document.getElementById('planPaymentReferenceField');
const planMercadoPagoOption = document.getElementById('planMercadoPagoOption');
const planMercadoPagoWalletContainer = document.getElementById('planMercadoPagoWalletContainer');
const planMercadoPagoCheckoutLink = document.getElementById('planMercadoPagoCheckoutLink');
const resumePlanPaymentButton = document.getElementById('resumePlanPaymentButton');
const cancelPlanRequestButton = document.getElementById('cancelPlanRequestButton');
const onboardingDialog = document.getElementById('onboardingDialog');
const onboardingSpotlight = document.getElementById('onboardingSpotlight');
const onboardingStepLabel = document.getElementById('onboardingStepLabel');
const onboardingTitle = document.getElementById('onboardingTitle');
const onboardingDescription = document.getElementById('onboardingDescription');
const onboardingStatus = document.getElementById('onboardingStatus');
const previousOnboardingButton = document.getElementById('previousOnboardingButton');
const nextOnboardingButton = document.getElementById('nextOnboardingButton');
const skipOnboardingButton = document.getElementById('skipOnboardingButton');

let transactions = [];
let goals = [];
let categories = [];
let paymentSchedules = [];
let debts = [];
let debtPayments = [];
let budgets = [];
let emergencyFund = null;
let dashboardPeriod = 'month';
let activeAppPage = 'summary';
let subscriptionPlans = [];
let paymentInstructions = {};
let currentSubscription = null;
let hasPendingPlanRequest = false;
let pendingPlanGateway = null;
let mercadoPagoWalletBrick = null;
let featureAccess = { payments: false, debts: false, alerts: false, budgets: false, reports: false };
let paymentCalendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedPaymentDate = getDateString(0);
let editingTransactionId = null;
let appBaseCurrency = 'PEN';
let formBaseCurrency = 'PEN';
let deferredInstallPrompt = null;
let authToken = localStorage.getItem(AUTH_TOKEN_KEY) || '';
let currentUser = null;
let apiBaseUrl = '';
let adminUsers = [];
let subscriptionOptions = [];
let subscriptionUsers = [];
let aiRecognition = null;
let aiReceiptPreviewUrl = '';
let aiVoiceRecognitionFailed = false;
let aiVoiceCancelled = false;
let aiAssistantAccess = { available: false, isMaster: false, requestStatus: null };
let publicBrand = { appName: 'Finanza', logoUrl: '', faviconUrl: '' };
let onboardingStep = 0;
const onboardingSteps = [
  {
    title: 'Bienvenido a tu resumen',
    description: 'Este es el punto de partida. Desde el menú lateral puedes entrar a cada módulo; durante este recorrido iremos abriendo las opciones principales para que veas dónde está cada herramienta.',
    target: '.dashboard-filters',
    page: 'summary',
    hash: 'overview'
  },
  {
    title: 'Consulta tus cifras',
    description: 'Las tarjetas muestran el balance, los ingresos, los gastos y los pagos pendientes del período. Usa los filtros de semana, mes, año, todo o rango para cambiar lo que estás analizando.',
    target: '.cards',
    page: 'summary',
    hash: 'overview'
  },
  {
    title: 'Revisa tus tendencias',
    description: 'Los gráficos comparan ingresos y gastos por mes y muestran en qué categorías se concentran los gastos. Se actualizan con los movimientos que registres.',
    target: '.analytics-grid',
    page: 'summary',
    hash: 'overview'
  },
  {
    title: 'Registra un ingreso o gasto',
    description: 'Abre “Nuevo movimiento” para anotar una descripción, tipo, categoría, monto y fecha. Si usas otra moneda, selecciónala e indica el tipo de cambio. Puedes limpiar el formulario antes de guardar y, si tienes IA habilitada, dictar o analizar un comprobante.',
    target: '#transactionForm',
    page: 'capture',
    hash: 'capture'
  },
  {
    title: 'Explora tus movimientos',
    description: 'En “Movimientos” está tu historial completo. Busca por descripción y filtra por tipo, categoría o mes. Desde la columna de acciones puedes editar o eliminar un registro.',
    target: '#transactions',
    page: 'transactions',
    hash: 'transactions'
  },
  {
    title: 'Programa tus pagos',
    description: 'En “Pagos” registra servicios, alquileres o tarjetas con monto, moneda, vencimiento, recurrencia y hora del aviso. El calendario y la lista te ayudan a revisar lo que vence; marcar un pago como realizado también lo registra como gasto.',
    target: '#payments',
    page: 'agenda',
    hash: 'payments'
  },
  {
    title: 'Controla tus deudas',
    description: 'En “Deudas” registra préstamos y consulta el saldo pendiente. Cuando realices un pago, separa el abono a capital de los intereses o cargos para mantener actualizado el saldo y el historial.',
    target: '#debts',
    page: 'debts',
    hash: 'debts'
  },
  {
    title: 'Prepara tu fondo de emergencia',
    description: 'Define una meta y registra cuánto tienes ahorrado para ver tu progreso. La sugerencia se basa en tus gastos recientes; Finanza solo lleva el control y no mueve dinero.',
    target: '#emergencyFund',
    page: 'emergency',
    hash: 'emergencyFund'
  },
  {
    title: 'Personaliza tus categorías',
    description: 'Crea categorías propias, como Mascotas o Suscripciones. Luego estarán disponibles al registrar movimientos y podrás identificar mejor en qué se va el dinero.',
    target: '#categories',
    page: 'categories',
    hash: 'categories'
  },
  {
    title: 'Define tus metas de ahorro',
    description: 'En “Metas” indica qué quieres lograr, el monto objetivo, cuánto llevas ahorrado y una fecha. Finanza mostrará el avance para ayudarte a seguir tu plan.',
    target: '#goalForm',
    page: 'goals',
    hash: 'goals'
  },
  {
    title: 'Planea presupuestos',
    description: 'Asigna un límite mensual a una categoría y consulta cuánto has gastado frente a ese monto. Así puedes detectar a tiempo si te acercas al tope.',
    target: '#dashboardBudgets',
    page: 'budgets',
    hash: 'dashboardBudgets'
  },
  {
    title: 'Conoce tus planes',
    description: 'En “Planes” puedes consultar las funciones disponibles para tu cuenta y las condiciones de cada suscripción. Los pagos manuales quedan pendientes hasta que el administrador los valide.',
    target: '#subscriptionPlans',
    page: 'plans',
    hash: 'subscriptionPlans'
  },
  {
    title: 'Genera reportes detallados',
    description: 'Filtra los movimientos por período, tipo y categoría; revisa los totales y el detalle incluido antes de descargar el reporte en PDF.',
    target: '#reports',
    page: 'reports',
    hash: 'reports'
  },
  {
    title: 'Vuelve a este recorrido cuando quieras',
    description: 'El menú “Opciones” reúne accesos rápidos, apariencia, el manual y el botón “Ver guía”. Puedes regresar al resumen desde el menú lateral. ¡Listo para empezar!',
    target: '.utility-menu > summary',
    page: 'reports',
    hash: 'reports'
  }
];

initialize();

function setActiveMobileNav(activeLink) {
  mobileNav.querySelectorAll('a').forEach((link) => {
    const isActive = link === activeLink;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function updateAppPageVisibility() {
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  const isPageAvailable = (page) => isMobile
    ? (page.dataset.mobilePage || page.dataset.appPage) === activeAppPage
    : page.dataset.appPage === activeAppPage;
  if (!appPages.some(isPageAvailable)) {
    const previousPage = appPages.find((page) => page.dataset.appPage === activeAppPage);
    activeAppPage = isMobile ? (previousPage?.dataset.mobilePage || 'summary') : 'summary';
  }
  appPages.forEach((page) => {
    const pageName = isMobile ? (page.dataset.mobilePage || page.dataset.appPage) : page.dataset.appPage;
    page.hidden = pageName !== activeAppPage;
  });
}

function setAppPage(pageName, { scroll = false } = {}) {
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  const matchingPage = appPages.find((page) => isMobile
    ? page.dataset.appPage === pageName || page.dataset.mobilePage === pageName
    : page.dataset.appPage === pageName);
  if (!matchingPage) return false;
  activeAppPage = isMobile
    ? (matchingPage.dataset.mobilePage || matchingPage.dataset.appPage)
    : matchingPage.dataset.appPage;
  updateAppPageVisibility();
  const mobilePageName = isMobile ? activeAppPage : (matchingPage.dataset.mobilePage || pageName);
  setActiveMobileNav(mobileNav.querySelector(`[data-page="${mobilePageName}"]`));
  document.querySelectorAll('.nav-item[data-page]').forEach((link) => {
    const isActive = link.dataset.page === activeAppPage;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const pageCopy = {
    summary: ['TU RESUMEN FINANCIERO', 'Hola, aquí está tu dinero.'],
    transactions: ['TU HISTORIAL', 'Movimientos'],
    capture: ['REGISTRO RÁPIDO', 'Registra un movimiento'],
    agenda: ['ORGANIZA TUS VENCIMIENTOS', 'Agenda de pagos'],
    planning: ['TU ORGANIZACIÓN', 'Ahorros y planificación'],
    debts: ['ORGANIZA TUS PRÉSTAMOS', 'Pagos y deudas'],
    emergency: ['PROTECCIÓN FINANCIERA', 'Fondo de emergencia'],
    categories: ['ORGANIZA', 'Tus categorías'],
    goals: ['PASO A PASO', 'Tus metas'],
    budgets: ['PLANIFICA TU MES', 'Presupuestos por categoría'],
    plans: ['TU CUENTA', 'Funciones avanzadas'],
    reports: ['ANÁLISIS FINANCIERO', 'Reportes detallados']
  }[activeAppPage];
  document.getElementById('pageEyebrow').textContent = pageCopy[0];
  document.getElementById('pageTitle').textContent = pageCopy[1];
  if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  return true;
}

function pageForHash(hash) {
  const target = document.getElementById(hash);
  const page = target?.closest('[data-app-page]');
  return (window.matchMedia('(max-width: 760px)').matches
    ? page?.dataset.mobilePage || page?.dataset.appPage
    : page?.dataset.appPage) ||
    (hash === 'overview' ? 'summary' : null);
}

function handleAppNavigation(event) {
  const link = event.target.closest('a[href^="#"]');
  if (!link || !appShell.contains(link)) return;
  const pageName = link.dataset.page || pageForHash(link.hash.slice(1));
  if (!pageName) return;
  event.preventDefault();
  if (!adminPanel.hidden) closeAdminPanel();
  if (!setAppPage(pageName, { scroll: true })) return;
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}${link.hash}`);
  utilityMenu.open = false;
}

function initializeTheme() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const storedPreference = localStorage.getItem(THEME_PREFERENCE_KEY);
  let preference = storedPreference === 'light' || storedPreference === 'dark'
    ? storedPreference
    : 'system';
  themePreferenceInput.value = preference;

  const applyTheme = () => {
    const theme = preference === 'system'
      ? (systemTheme.matches ? 'dark' : 'light')
      : preference;
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content =
      theme === 'dark' ? '#1a1e2e' : '#f7f8f4';
  };

  themePreferenceInput.addEventListener('change', () => {
    preference = themePreferenceInput.value;
    if (preference === 'system') localStorage.removeItem(THEME_PREFERENCE_KEY);
    else localStorage.setItem(THEME_PREFERENCE_KEY, preference);
    applyTheme();
  });
  systemTheme.addEventListener('change', () => {
    if (themePreferenceInput.value === 'system') applyTheme();
  });
  applyTheme();
}

function initialize() {
  initializeTheme();
  setAppPage(pageForHash(window.location.hash.slice(1)) || 'summary');
  dateInput.value = getDateString(0);
  goalDateInput.value = getDateString(90);
  paymentDueDateInput.value = getDateString(1);
  dashboardStartDate.value = getDateString(0);
  dashboardEndDate.value = getDateString(0);
  reportStartDate.value = `${getDateString(0).slice(0, 7)}-01`;
  reportEndDate.value = getDateString(0);
  setDefaultAssignmentDates();
  formBaseCurrency = appBaseCurrency;
  updateExchangeRateField();
  updateDebtExchangeRateField();
  form.addEventListener('submit', handleSubmit);
  paymentForm.addEventListener('submit', handlePaymentSubmit);
  paymentCurrencyInput.addEventListener('change', updatePaymentExchangeRateField);
  previousPaymentMonth.addEventListener('click', () => changePaymentCalendarMonth(-1));
  nextPaymentMonth.addEventListener('click', () => changePaymentCalendarMonth(1));
  paymentCalendar.addEventListener('click', handlePaymentCalendarClick);
  paymentsList.addEventListener('click', handlePaymentListClick);
  upcomingPaymentsList.addEventListener('click', handlePaymentListClick);
  budgetForm.addEventListener('submit', handleBudgetSubmit);
  budgetList.addEventListener('click', handleBudgetListClick);
  debtForm.addEventListener('submit', handleDebtSubmit);
  debtsList.addEventListener('submit', handleDebtPaymentSubmit);
  debtsList.addEventListener('click', handleDebtListClick);
  emergencyFundForm.addEventListener('submit', handleEmergencyFundSubmit);
  planPaymentForm.addEventListener('submit', handlePlanPaymentSubmit);
  requiredPaymentForm.addEventListener('submit', handleRequiredPaymentSubmit);
  requiredPaymentCurrency.addEventListener('change', renderRequiredPayment);
  requiredPaymentMethod.addEventListener('change', renderRequiredPayment);
  aiPaymentCurrency.addEventListener('change', renderAiPaymentOffer);
  aiPaymentMethod.addEventListener('change', renderAiPaymentOffer);
  document.getElementById('refreshPaymentStatusButton').addEventListener('click', refreshRequiredPaymentStatus);
  document.getElementById('paymentGateLogoutButton').addEventListener('click', handlePaymentGateLogout);
  planPaymentMethodInput.addEventListener('change', renderPlanPaymentInstructions);
  resumePlanPaymentButton.addEventListener('click', resumePlanMercadoPagoCheckout);
  cancelPlanRequestButton.addEventListener('click', () => { planPaymentForm.hidden = true; });
  document.getElementById('planCards').addEventListener('click', handlePlanCardClick);
  document.getElementById('togglePlansButton').addEventListener('click', togglePlanOffers);
  document.getElementById('emergencyFundHelpButton').addEventListener('click', toggleEmergencyFundHelp);
  document.querySelectorAll('[data-open-plans]').forEach((button) => {
    button.addEventListener('click', openPlanOffers);
  });
  debtCurrencyInput.addEventListener('change', updateDebtExchangeRateField);
  document.querySelectorAll('[data-period]').forEach((button) => {
    button.addEventListener('click', () => setDashboardPeriod(button.dataset.period));
  });
  appShell.addEventListener('click', handleAppNavigation);
  utilityMenu.addEventListener('click', (event) => {
    if (event.target.closest('button, a')) utilityMenu.open = false;
  });
  document.addEventListener('click', (event) => {
    if (!utilityMenu.contains(event.target)) utilityMenu.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') utilityMenu.open = false;
  });
  window.addEventListener('hashchange', () => {
    const pageName = pageForHash(window.location.hash.slice(1));
    if (pageName) setAppPage(pageName);
  });
  window.addEventListener('resize', () => {
    setAppPage(pageForHash(window.location.hash.slice(1)) || 'summary');
  });
  dashboardStartDate.addEventListener('change', render);
  dashboardEndDate.addEventListener('change', render);
  currencyInput.addEventListener('change', () => {
    if (currencyInput.value !== formBaseCurrency && exchangeRateInput.value === '1') {
      exchangeRateInput.value = '';
    }
    updateExchangeRateField();
  });
  openAiAssistantButton.addEventListener('click', openAiAssistant);
  aiFloatingButton.addEventListener('click', () => {
    openAiAssistant();
    startAiDictation();
  });
  requestAiAccessButton.addEventListener('click', requestAiSubscription);
  aiActivateLifetimeButton.addEventListener('click', () => {
    aiAssistantDialog.close();
    openPlanOffers();
  });
  closeAiAssistantButton.addEventListener('click', () => aiAssistantDialog.close());
  cancelAiAssistantButton.addEventListener('click', () => aiAssistantDialog.close());
  aiAssistantDialog.addEventListener('click', (event) => {
    if (event.target === aiAssistantDialog) aiAssistantDialog.close();
  });
  aiAssistantDialog.addEventListener('close', () => {
    if (aiRecognition) {
      aiVoiceCancelled = true;
      aiRecognition.stop();
    }
  });
  aiReceiptInput.addEventListener('change', handleAiReceiptSelection);
  analyzeReceiptButton.addEventListener('click', handleReceiptAnalysis);
  startVoiceButton.addEventListener('click', startAiDictation);
  goalForm.addEventListener('submit', handleGoalSubmit);
  logoutButton.addEventListener('click', handleLogout);
  cancelEditButton.addEventListener('click', () => {
    const wasEditing = Boolean(editingTransactionId);
    resetFormState();
    showAppNotice(wasEditing ? 'Edición cancelada.' : 'Formulario limpio.');
  });
  filterTypeInput.addEventListener('change', renderTable);
  filterCategoryInput.addEventListener('change', renderTable);
  filterMonthInput.addEventListener('change', renderTable);
  searchInput.addEventListener('input', renderTable);
  installButton.addEventListener('click', handleInstallClick);
  authInstallButton.addEventListener('click', handleInstallClick);
  reportButton.addEventListener('click', handleReportClick);
  [reportPeriodInput, reportTypeInput, reportCategoryInput, reportGroupInput, reportStartDate, reportEndDate]
    .forEach((input) => input.addEventListener('change', renderReports));
  reportSearchInput.addEventListener('input', renderReports);
  restartOnboardingButton.addEventListener('click', () => maybeStartOnboarding(true));
  categoryForm.addEventListener('submit', handleCategorySubmit);
  loginForm.addEventListener('submit', handleLoginSubmit);
  registerForm.addEventListener('submit', handleRegisterSubmit);
  verifyEmailForm.addEventListener('submit', handleVerifyEmailSubmit);
  resendActivationButton.addEventListener('click', handleResendActivation);
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
  openSuggestionButton.addEventListener('click', () => {
    suggestionMessage.hidden = true;
    suggestionMessage.textContent = '';
    suggestionMessage.classList.remove('error');
    suggestionDialog.showModal();
    suggestionInput.focus();
  });
  closeSuggestionButton.addEventListener('click', () => suggestionDialog.close());
  cancelSuggestionButton.addEventListener('click', () => suggestionDialog.close());
  suggestionDialog.addEventListener('click', (event) => {
    if (event.target === suggestionDialog) suggestionDialog.close();
  });
  adminUserForm.addEventListener('submit', handleAdminUserSubmit);
  adminSettingsForm.addEventListener('submit', handleAdminSettingsSubmit);
  subscriptionOptionForm.addEventListener('submit', handleSubscriptionOptionSubmit);
  subscriptionAssignmentForm.addEventListener('submit', handleSubscriptionAssignmentSubmit);
  previousOnboardingButton.addEventListener('click', () => {
    if (onboardingStep > 0) {
      onboardingStep -= 1;
      renderOnboardingStep();
    }
  });
  nextOnboardingButton.addEventListener('click', () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      onboardingStep += 1;
      renderOnboardingStep();
    } else {
      finishOnboarding();
    }
  });
  skipOnboardingButton.addEventListener('click', finishOnboarding);
  onboardingDialog.addEventListener('cancel', (event) => event.preventDefault());
  onboardingDialog.addEventListener('close', () => {
    onboardingSpotlight.hidden = true;
    onboardingDialog.style.removeProperty('left');
    onboardingDialog.style.removeProperty('top');
  });
  window.addEventListener('resize', updateOnboardingSpotlight);
  window.addEventListener('scroll', updateOnboardingSpotlight, true);
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
      applyBaseCurrency(publicBrand.baseCurrency);
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
    installButton.classList.add('install-ready');
    authInstallButton.hidden = false;
    authInstallHelp.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    hideInstallButton();
  });

  window.addEventListener('pageshow', updateInstallButtonVisibility);
  document.addEventListener('visibilitychange', () => {
    updateInstallButtonVisibility();
    if (!document.hidden && authToken) {
      refreshBaseCurrency();
    }
  });

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
  const isFormData = options.body instanceof FormData;
  const headers = { Accept: 'application/json' };
  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url.href, {
    method: options.method || 'GET',
    headers,
    body: options.body === undefined ? undefined : isFormData ? options.body : JSON.stringify(options.body),
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
    await checkMercadoPagoReturn();
    if (await showRequiredPaymentIfNeeded()) return;
    await loadAccountData();
    showApp();
    maybeStartOnboarding();
  } catch (error) {
    clearAuthSession();
    showAuthMessage(`No pudimos restaurar tu sesión. ${error.message}`);
  }
}

async function showRequiredPaymentIfNeeded() {
  let status = await apiRequest('plan-status');
  currentSubscription = status.subscription;
  hasPendingPlanRequest = status.hasPendingRequest;
  pendingPlanGateway = status.pendingGateway;
  if (status.accessAllowed) return false;
  if (status.accessAllowed) return false;
  const result = await apiRequest('plans');
  subscriptionPlans = result.plans;
  paymentInstructions = result.paymentInstructions;
  renderRequiredPayment();
  showAuthView('requiredPayment');
  return true;
}

function renderRequiredPayment() {
  requiredPaymentStatus.classList.remove('error');
  const plan = subscriptionPlans.find((item) => item.billingPeriod === 'lifetime');
  const amount = plan ? Number(plan.priceAmount) : 30;
  const mercadoPagoAvailable = Boolean(paymentInstructions.mercadoPagoAvailable);
  if (requiredPaymentMethod.value === 'mercado_pago' && requiredPaymentCurrency.value === 'USD') {
    requiredPaymentCurrency.value = 'PEN';
  }
  const currency = requiredPaymentCurrency.value;
  requiredMercadoPagoOption.hidden = !mercadoPagoAvailable;
  requiredMercadoPagoOption.disabled = !mercadoPagoAvailable || currency === 'USD';
  if (!mercadoPagoAvailable && requiredPaymentMethod.value === 'mercado_pago') {
    requiredPaymentMethod.value = 'transfer';
  }
  const hasPaymentMethod = configurePaymentOptions(
    requiredPaymentMethod,
    currency,
    mercadoPagoAvailable && currency === 'PEN'
  );
  const useMercadoPago = requiredPaymentMethod.value === 'mercado_pago';
  const paymentAmount = currency === 'USD' ? Math.round((amount / 3.6) * 100) / 100 : amount;
  requiredPaymentAmount.textContent = formatCurrency(paymentAmount, currency);
  requiredPaymentEquivalent.textContent = currency === 'USD'
    ? `${formatCurrency(amount, 'PEN')} · tipo de cambio fijo S/ 3.60 por USD`
    : `${formatCurrency(Math.round((amount / 3.6) * 100) / 100, 'USD')} · tipo de cambio fijo S/ 3.60 por USD`;
  requiredPaymentSubmit.disabled = !plan || !hasPaymentMethod || (useMercadoPago && !mercadoPagoAvailable) || (hasPendingPlanRequest &&
    !(useMercadoPago && pendingPlanGateway === 'mercado_pago'));
  requiredPaymentSubmit.textContent = useMercadoPago
    ? 'Preparar pago con Mercado Pago'
    : hasPendingPlanRequest
      ? 'Pago enviado · En revisión'
      : !hasPaymentMethod ? 'Métodos de pago no configurados'
        : plan ? 'Enviar pago único para validación' : 'Plan no disponible';
  requiredPaymentReference.disabled = hasPendingPlanRequest || !plan || useMercadoPago || !hasPaymentMethod;
  requiredPaymentReference.required = !useMercadoPago && hasPaymentMethod;
  requiredPaymentReference.hidden = useMercadoPago || !hasPaymentMethod;
  requiredPaymentReferenceLabel.hidden = useMercadoPago || !hasPaymentMethod;
  requiredPaymentInstructions.hidden = useMercadoPago;
  requiredPaymentStatus.hidden = !hasPendingPlanRequest;
  requiredPaymentStatus.textContent = hasPendingPlanRequest
    ? pendingPlanGateway === 'mercado_pago'
      ? 'Pago iniciado en Mercado Pago. Completa o vuelve a abrir el checkout; el acceso se activa al confirmarse el pago.'
      : 'Tu operación está pendiente de validación. Puedes verificar el estado más tarde.'
    : '';
  mercadoPagoWalletContainer.hidden = !useMercadoPago || !mercadoPagoWalletContainer.childElementCount;
  mercadoPagoCheckoutLink.hidden = !useMercadoPago || !mercadoPagoCheckoutLink.getAttribute('href');
  if (!useMercadoPago) {
    mercadoPagoCheckoutLink.removeAttribute('href');
  }
  renderRequiredPaymentInstructions();
}

function renderRequiredPaymentInstructions() {
  requiredPaymentInstructions.innerHTML = paymentMethodInstructionsMarkup(requiredPaymentMethod.value);
}

function configurePaymentOptions(select, currency, allowMercadoPago = false) {
  const available = {
    yape: currency === 'PEN' && Boolean(paymentInstructions.yapeNumber || paymentInstructions.yapeQrUrl),
    transfer: Boolean(paymentInstructions.bankAccounts),
    mercado_pago: allowMercadoPago && Boolean(paymentInstructions.mercadoPagoAvailable)
  };
  const options = [...select.options].filter((option) => option.value);
  options.forEach((option) => {
    const enabled = Boolean(available[option.value]);
    option.hidden = !enabled;
    option.disabled = !enabled;
  });
  const values = options.filter((option) => available[option.value]).map((option) => option.value);
  if (!values.includes(select.value)) select.value = values[0] || '';
  select.disabled = values.length === 0;
  return values.length > 0;
}

function paymentMethodInstructionsMarkup(method) {
  if (method === 'yape') {
    const number = paymentInstructions.yapeNumber;
    const owner = paymentInstructions.yapeName;
    const qrUrl = paymentInstructions.yapeQrUrl;
    const details = number
      ? `Yapea al <strong>${escapeHtml(number)}</strong>${owner ? ` · Titular: ${escapeHtml(owner)}` : ''}.`
      : 'Escanea el código QR de Yape para realizar el pago.';
    return `<p>${details} Luego ingresa el número de operación.</p>${qrUrl
      ? `<img class="yape-payment-qr" src="${escapeHtml(qrUrl)}" alt="Código QR de Yape" loading="lazy" />`
      : ''}`;
  }
  if (method === 'transfer' && paymentInstructions.bankAccounts) {
    return `<p>${escapeHtml(paymentInstructions.bankAccounts).replace(/\n/g, '<br>')}</p>`;
  }
  return '<p>El administrador aún no ha configurado métodos de pago disponibles. Inténtalo más tarde.</p>';
}

async function handleRequiredPaymentSubmit(event) {
  event.preventDefault();
  const useMercadoPago = requiredPaymentMethod.value === 'mercado_pago';
  if (hasPendingPlanRequest && !(useMercadoPago && pendingPlanGateway === 'mercado_pago')) return;
  const plan = subscriptionPlans.find((item) => item.billingPeriod === 'lifetime');
  if (!plan) return;
  if (useMercadoPago) {
    requiredPaymentSubmit.disabled = true;
    requiredPaymentStatus.classList.remove('error');
    try {
      await startMercadoPagoCheckout();
    } catch (error) {
      requiredPaymentStatus.hidden = false;
      requiredPaymentStatus.textContent = error.message;
      requiredPaymentStatus.classList.add('error');
    } finally {
      requiredPaymentSubmit.disabled = hasPendingPlanRequest && pendingPlanGateway !== 'mercado_pago';
    }
    return;
  }
  const currency = requiredPaymentCurrency.value;
  const amount = currency === 'USD'
    ? Math.round((Number(plan.priceAmount) / 3.6) * 100) / 100
    : Number(plan.priceAmount);
  requiredPaymentStatus.classList.remove('error');
  requiredPaymentStatus.hidden = true;
  requiredPaymentSubmit.disabled = true;
  try {
    const result = await apiRequest('plan-request', {
      method: 'POST',
      body: {
        billingPeriod: 'lifetime',
        paymentMethod: requiredPaymentMethod.value,
        paymentReference: requiredPaymentReference.value.trim(),
        paymentCurrency: currency,
        paymentAmount: amount
      }
    });
    hasPendingPlanRequest = true;
    pendingPlanGateway = 'manual';
    requiredPaymentReference.value = '';
    renderRequiredPayment();
    requiredPaymentStatus.hidden = false;
    requiredPaymentStatus.textContent = result.message;
  } catch (error) {
    requiredPaymentStatus.hidden = false;
    requiredPaymentStatus.textContent = error.message;
    requiredPaymentStatus.classList.add('error');
  } finally {
    requiredPaymentSubmit.disabled = hasPendingPlanRequest &&
      !(requiredPaymentMethod.value === 'mercado_pago' && pendingPlanGateway === 'mercado_pago');
  }
}

async function startMercadoPagoCheckout() {
  const result = await apiRequest('plan-checkout', {
    method: 'POST',
    body: { billingPeriod: 'lifetime' }
  });
  pendingPlanGateway = 'mercado_pago';
  hasPendingPlanRequest = true;
  requiredPaymentStatus.classList.remove('error');
  requiredPaymentStatus.hidden = false;
  requiredPaymentStatus.textContent =
    'Completa el pago desde el botón seguro de Mercado Pago. Tu cuenta se activará al confirmarse.';
  const mounted = await mountMercadoPagoWallet(
    result,
    mercadoPagoWalletContainer,
    mercadoPagoCheckoutLink
  );
  if (!mounted) {
    requiredPaymentStatus.textContent =
      'No se pudo cargar el botón de Mercado Pago. Usa el enlace seguro para continuar.';
  }
}

async function mountMercadoPagoWallet(result, container, checkoutLink) {
  checkoutLink.href = result.checkoutUrl;
  checkoutLink.hidden = false;
  if (!window.MercadoPago) return false;
  if (mercadoPagoWalletBrick && typeof mercadoPagoWalletBrick.unmount === 'function') {
    await mercadoPagoWalletBrick.unmount();
  }
  container.replaceChildren();
  container.hidden = false;
  const mercadoPago = new window.MercadoPago(result.publicKey, { locale: 'es-PE' });
  mercadoPagoWalletBrick = await mercadoPago.bricks().create(
    'wallet',
    container.id,
    { initialization: { preferenceId: result.preferenceId } }
  );
  checkoutLink.hidden = true;
  return true;
}

async function checkMercadoPagoReturn() {
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('payment_id') || params.get('collection_id');
  const externalReference = params.get('external_reference');
  if (!paymentId || !externalReference) return null;

  const url = new URL(window.location.href);
  ['payment', 'payment_id', 'collection_id', 'collection_status', 'external_reference',
    'preference_id', 'merchant_order_id', 'status'].forEach((key) => url.searchParams.delete(key));
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  try {
    const result = await apiRequest('plan-checkout-status', {
      method: 'POST',
      body: { paymentId, externalReference }
    });
    if (result.approved) return true;
    showAuthMessage('Mercado Pago aún no confirma el pago. Actualiza el estado en unos momentos.');
  } catch (error) {
    showAuthMessage(`No pudimos verificar el pago con Mercado Pago. ${error.message}`, true);
  }
  return false;
}

async function refreshRequiredPaymentStatus() {
  const button = document.getElementById('refreshPaymentStatusButton');
  button.disabled = true;
  try {
    let status = await apiRequest('plan-status');
    currentSubscription = status.subscription;
    hasPendingPlanRequest = status.hasPendingRequest;
    pendingPlanGateway = status.pendingGateway;
    if (pendingPlanGateway === 'mercado_pago' && status.pendingPaymentId && status.pendingExternalReference) {
      await apiRequest('plan-checkout-status', {
        method: 'POST',
        body: { paymentId: status.pendingPaymentId, externalReference: status.pendingExternalReference }
      });
      status = await apiRequest('plan-status');
      currentSubscription = status.subscription;
      hasPendingPlanRequest = status.hasPendingRequest;
      pendingPlanGateway = status.pendingGateway;
    }
    if (status.accessAllowed) {
      await loadAccountData();
      showApp();
      maybeStartOnboarding();
      return;
    }
    renderRequiredPayment();
    requiredPaymentStatus.hidden = false;
    requiredPaymentStatus.classList.remove('error');
    requiredPaymentStatus.textContent = hasPendingPlanRequest
      ? pendingPlanGateway === 'mercado_pago'
        ? 'Mercado Pago aún no confirma el pago. Actualiza el estado en unos momentos.'
        : 'El pago sigue pendiente de validación.'
      : 'Aún no hay un pago aprobado. Puedes enviar tu operación cuando realices el pago.';
  } catch (error) {
    requiredPaymentStatus.hidden = false;
    requiredPaymentStatus.classList.add('error');
    requiredPaymentStatus.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function handlePaymentGateLogout() {
  const button = document.getElementById('paymentGateLogoutButton');
  button.disabled = true;
  try {
    await apiRequest('logout', { method: 'POST', body: {} });
    clearAuthSession();
    showAuthView('login', 'Cerraste sesión.');
  } catch (error) {
    requiredPaymentStatus.hidden = false;
    requiredPaymentStatus.classList.add('error');
    requiredPaymentStatus.textContent = error.message;
  } finally {
    button.disabled = false;
  }
}

async function loadAccountData() {
  const [transactionResult, goalResult, categoryResult, aiStatus, publicSettings, paymentResult,
    debtResult, budgetResult, emergencyResult, planResult, planStatus] = await Promise.all([
    apiRequest('transactions'),
    apiRequest('goals'),
    apiRequest('categories'),
    apiRequest('ai-assistant-status'),
    apiRequest('public-settings'),
    apiRequest('payments'),
    apiRequest('debts'),
    apiRequest('budgets'),
    apiRequest('emergency-fund'),
    apiRequest('plans'),
    apiRequest('plan-status')
  ]);
  transactions = transactionResult.transactions;
  goals = goalResult.goals;
  categories = categoryResult.categories;
  paymentSchedules = paymentResult.payments;
  debts = debtResult.debts;
  debtPayments = debtResult.payments;
  budgets = budgetResult.budgets;
  emergencyFund = emergencyResult.fund;
  subscriptionPlans = planResult.plans;
  paymentInstructions = planResult.paymentInstructions;
  currentSubscription = planStatus.subscription;
  hasPendingPlanRequest = planStatus.hasPendingRequest;
  pendingPlanGateway = planStatus.pendingGateway;
  featureAccess = planStatus.featureAccess || featureAccess;
  aiAssistantAccess = aiStatus;
  aiAssistantAccess.lifetimeAccess = planStatus.lifetimeAccess;
  applyBaseCurrency(publicSettings.settings.baseCurrency);
  openAiAssistantButton.hidden = false;
  aiFloatingButton.hidden = !aiStatus.available;
  openAiAssistantButton.textContent = aiStatus.isMaster
    ? 'Registro inteligente'
    : aiStatus.available
      ? 'Registro inteligente Pro'
      : 'Registro inteligente · S/ 10 al mes';
  renderCategories();
  render();
}

async function refreshBaseCurrency() {
  try {
    const result = await apiRequest('public-settings');
    if (result.settings.baseCurrency !== appBaseCurrency) {
      applyBaseCurrency(result.settings.baseCurrency);
    }
  } catch (error) {
    console.warn('No se pudo actualizar la moneda principal.', error);
  }
}

function showApp() {
  authScreen.hidden = true;
  appShell.hidden = false;
  mobileNav.hidden = false;
  accountName.textContent = currentUser ? (currentUser.name || currentUser.email) : '';
  logoutButton.title = currentUser ? `Cerrar sesión de ${currentUser.name || currentUser.email}` : 'Cerrar sesión';
  adminPanelButton.hidden = currentUser?.role !== 'master';
  closeAdminPanel();
  setAppPage('summary', { scroll: true });
  installButton.hidden = isAppInstalled() || (!deferredInstallPrompt && !isMobileBrowser());
  history.replaceState(null, '', `${window.location.pathname}${window.location.search}#overview`);
}

function clearAuthSession() {
  authToken = '';
  currentUser = null;
  if (onboardingDialog.open) onboardingDialog.close();
  localStorage.removeItem(AUTH_TOKEN_KEY);
  appShell.hidden = true;
  authScreen.hidden = false;
  mobileNav.hidden = true;
}

function showAuthView(view, message = '') {
  authScreen.classList.toggle('payment-gate', view === 'requiredPayment');
  const forms = {
    login: loginForm,
    setupMaster: setupMasterForm,
    register: registerForm,
    requiredPayment: requiredPaymentForm,
    verifyEmail: verifyEmailForm,
    requestReset: requestResetForm,
    resetPassword: resetPasswordForm
  };
  const headings = {
    login: ['Qué gusto verte.', 'Inicia sesión para consultar tus movimientos desde cualquier dispositivo.'],
    setupMaster: ['Configura el acceso maestro.', 'Usa el código único definido en la configuración privada del servidor.'],
    register: ['Empieza con claridad.', 'Crea tu cuenta y activa Finanza con un pago único de S/ 30 o USD 8.33. La IA es opcional por S/ 10 mensuales.'],
    requiredPayment: ['Activa tu cuenta.', 'El acceso de por vida cuesta S/ 30 o USD 8.33, en un único pago. La operación se validará manualmente.'],
    verifyEmail: ['Confirma tu correo.', 'Ingresa el código de 8 dígitos que enviamos a tu correo para activar tu cuenta.'],
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
  const noticeText = typeof message === 'string' ? message.trim() : '';
  appNotice.textContent = noticeText;
  appNotice.hidden = !noticeText;
  appNotice.classList.toggle('error', isError);
  if (noticeText) {
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
    const email = registerEmail.value.trim();
    verificationEmail.value = email;
    verificationCode.value = '';
    try {
      const result = await apiRequest('register', {
        method: 'POST',
        body: {
          name: registerName.value.trim(),
          email,
          password: registerPassword.value,
          termsAccepted: document.getElementById('registerTerms').checked,
          termsVersion: TERMS_VERSION
        }
      });
      showAuthView('verifyEmail', result.message);
    } catch (error) {
      if (error.message.startsWith('La cuenta se creó, pero no se pudo enviar el código.')) {
        showAuthView('verifyEmail', error.message);
        showAuthMessage(error.message, true);
        return;
      }
      throw error;
    }
  });
}

async function handleVerifyEmailSubmit(event) {
  event.preventDefault();
  await submitAuthForm(verifyEmailForm, async () => {
    const result = await apiRequest('verify-email', {
      method: 'POST',
      body: { email: verificationEmail.value.trim(), code: verificationCode.value.trim() }
    });
    await completeAuthentication(result);
  });
}

async function handleResendActivation() {
  resendActivationButton.disabled = true;
  try {
    const result = await apiRequest('resend-activation', {
      method: 'POST',
      body: { email: verificationEmail.value.trim() }
    });
    showAuthMessage(result.message);
  } catch (error) {
    showAuthMessage(error.message, true);
  } finally {
    resendActivationButton.disabled = false;
  }
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
  suggestionMessage.hidden = true;
  suggestionMessage.textContent = '';
  suggestionMessage.classList.remove('error');
  try {
    const result = await apiRequest('suggestion', {
      method: 'POST',
      body: { message: suggestionInput.value.trim() }
    });
    suggestionForm.reset();
    suggestionDialog.close();
    showAppNotice(result.message);
  } catch (error) {
    suggestionMessage.textContent = error.message;
    suggestionMessage.classList.add('error');
    suggestionMessage.hidden = false;
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
  updateAppPageVisibility();
  mobileNav.hidden = false;
  appNotice.hidden = true;
}

async function loadAdminData() {
  const [usersResult, settingsResult, suggestionsResult, subscriptionsResult, planRequestsResult] = await Promise.all([
    apiRequest('admin-users'),
    apiRequest('admin-settings'),
    apiRequest('admin-suggestions'),
    apiRequest('admin-subscriptions'),
    apiRequest('admin-plan-requests')
  ]);
  adminUsers = usersResult.users;
  subscriptionOptions = subscriptionsResult.options;
  subscriptionUsers = subscriptionsResult.users;
  renderAdminUsers(adminUsers);
  renderAdminSuggestions(suggestionsResult.suggestions);
  renderSubscriptionData(subscriptionsResult);
  renderPlanPaymentRequests(planRequestsResult.requests);
  fillAdminSettings(settingsResult.settings);
}

function fillAdminSettings(settings) {
  document.getElementById('appNameInput').value = settings.appName || '';
  document.getElementById('contactEmailInput').value = settings.contactEmail || '';
  document.getElementById('baseCurrencyInput').value = settings.baseCurrency || 'PEN';
  applyBaseCurrency(settings.baseCurrency || 'PEN');
  document.getElementById('aiProviderInput').value = settings.aiProvider || 'gemini';
  document.getElementById('geminiApiKeyInput').value = '';
  document.getElementById('geminiApiKeyInput').placeholder = settings.geminiApiKeySet
    ? 'Configurada; escribe solo si deseas reemplazarla'
    : 'Pega aquí la clave API de Gemini';
  document.getElementById('groqApiKeyInput').value = '';
  document.getElementById('groqApiKeyInput').placeholder = settings.groqApiKeySet
    ? 'Configurada; escribe solo si deseas reemplazarla'
    : 'Pega aquí la clave API de Groq';
  const configuredProviders = [
    settings.geminiApiKeySet ? 'Gemini' : '',
    settings.groqApiKeySet ? 'Groq' : ''
  ].filter(Boolean);
  document.getElementById('aiProviderStatus').textContent = configuredProviders.length
    ? `Claves configuradas: ${configuredProviders.join(' y ')}. Proveedor activo: ${settings.aiProvider === 'groq' ? 'Groq' : 'Gemini'}.`
    : 'Configura al menos una clave del proveedor que quieras usar.';
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
  document.getElementById('yapeNumberInput').value = settings.yapeNumber || '';
  document.getElementById('yapeNameInput').value = settings.yapeName || '';
  const yapeQrPreview = document.getElementById('yapeQrPreview');
  if (settings.yapeQrUrl) {
    yapeQrPreview.src = settings.yapeQrUrl;
    yapeQrPreview.hidden = false;
  } else {
    yapeQrPreview.removeAttribute('src');
    yapeQrPreview.hidden = true;
  }
  document.getElementById('bankAccountsInput').value = settings.bankAccounts || '';
  document.getElementById('culqiPublicKeyInput').value = settings.culqiPublicKey || '';
  document.getElementById('culqiSecretInput').value = '';
  document.getElementById('culqiSecretInput').placeholder = settings.culqiSecretSet ? 'Configurada; vacía para conservar' : 'Sin configurar';
  document.getElementById('mercadoPagoPublicKeyInput').value = settings.mercadoPagoPublicKey || '';
  document.getElementById('mercadoPagoSecretInput').value = '';
  document.getElementById('mercadoPagoSecretInput').placeholder = settings.mercadoPagoSecretSet ? 'Configurada; vacía para conservar' : 'Sin configurar';
  mercadoPagoWebhookSecretInput.value = '';
  mercadoPagoWebhookSecretInput.placeholder = settings.mercadoPagoWebhookSecretSet ? 'Configurada; vacía para conservar' : 'Sin configurar';
  document.getElementById('paypalClientIdInput').value = settings.paypalClientId || '';
  document.getElementById('paypalSecretInput').value = '';
  document.getElementById('paypalSecretInput').placeholder = settings.paypalSecretSet ? 'Configurada; vacía para conservar' : 'Sin configurar';
  document.getElementById('gatewayStatus').textContent =
    `Culqi ${settings.culqiSecretSet ? 'configurado' : 'sin configurar'} · Mercado Pago ${settings.mercadoPagoSecretSet && settings.mercadoPagoWebhookSecretSet && settings.mercadoPagoAppUrlSet ? 'listo para Checkout Pro' : 'incompleto'} · PayPal ${settings.paypalSecretSet ? 'configurado' : 'sin configurar'}.`;
}

function renderAdminUsers(users) {
  const container = document.getElementById('adminUsersList');
  if (!users.length) {
    container.innerHTML = '<p class="empty-state">Todavía no hay cuentas de cliente.</p>';
    return;
  }
  container.innerHTML = `
    <div class="admin-users-header" aria-hidden="true">
      <span>Nombre</span><span>Correo</span><span>Nueva contraseña</span>
      <span>Cuenta</span><span>Verificación</span><span>Acciones</span>
    </div>
    ${users.map((user) => `
    <form class="admin-record admin-user-record" data-user-id="${user.id}">
      <label>Nombre<input name="name" maxlength="80" value="${escapeHtml(user.name)}" required disabled /></label>
      <label>Correo<input name="email" type="email" maxlength="254" value="${escapeHtml(user.email)}" required disabled /></label>
      <label>Nueva contraseña<input name="password" type="password" minlength="12" autocomplete="new-password" placeholder="Dejar vacía para conservar" disabled /></label>
      <label class="admin-check"><input name="isActive" type="checkbox" ${user.isActive ? 'checked' : ''} disabled /> Cuenta activa</label>
      <p class="admin-user-status ${user.emailVerified ? 'verified' : 'unverified'}">${user.emailVerified ? 'Correo activado' : 'Correo pendiente de activación'}</p>
      <div class="admin-user-actions">
        <button class="button button-quiet user-edit-button" type="button">Editar</button>
        <button class="button button-quiet user-save-button" type="submit" disabled>Guardar</button>
        ${user.emailVerified ? '' : '<button class="button button-quiet user-resend-button" type="button">Reenviar activación</button>'}
        <button class="button button-delete user-delete-button" type="button">Eliminar</button>
      </div>
    </form>
  `).join('')}
  `;
  container.querySelectorAll('.admin-user-record').forEach((record) => {
    const fields = [...record.querySelectorAll('input')];
    const editButton = record.querySelector('.user-edit-button');
    const saveButton = record.querySelector('.user-save-button');
    editButton.addEventListener('click', () => {
      fields.forEach((field) => { field.disabled = false; });
      editButton.hidden = true;
      saveButton.disabled = false;
      record.querySelector('[name="name"]').focus();
    });
    record.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submit = record.querySelector('button[type="submit"]');
      const values = new FormData(record);
      submit.disabled = true;
      try {
        await apiRequest('admin-users', {
          method: 'PUT',
          body: {
            id: record.dataset.userId,
            name: values.get('name'),
            email: values.get('email'),
            password: values.get('password'),
            isActive: values.get('isActive') === 'on'
          }
        });
        showAppNotice('Cuenta actualizada.');
        await loadAdminData();
      } catch (error) {
        showAppNotice(error.message, true);
      } finally {
        submit.disabled = false;
      }
    });
    record.querySelector('.user-resend-button')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        const result = await apiRequest('admin-resend-activation', {
          method: 'POST',
          body: { userId: record.dataset.userId }
        });
        showAppNotice(result.message);
      } catch (error) {
        showAppNotice(error.message, true);
      } finally {
        button.disabled = false;
      }
    });
    record.querySelector('.user-delete-button').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const name = record.querySelector('[name="name"]').value;
      if (!window.confirm(`¿Eliminar la cuenta de ${name}? También se borrarán permanentemente sus movimientos, metas y demás datos asociados.`)) {
        return;
      }
      button.disabled = true;
      try {
        const result = await apiRequest('admin-users', {
          method: 'DELETE',
          body: { id: record.dataset.userId }
        });
        showAppNotice(result.message);
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
        baseCurrency: document.getElementById('baseCurrencyInput').value,
        smtpHost: document.getElementById('smtpHostInput').value.trim(),
        smtpPort: document.getElementById('smtpPortInput').value,
        smtpEncryption: document.getElementById('smtpEncryptionInput').value,
        smtpUser: document.getElementById('smtpUserInput').value.trim(),
        smtpPassword: document.getElementById('smtpPasswordInput').value,
        geminiApiKey: document.getElementById('geminiApiKeyInput').value.trim(),
        groqApiKey: document.getElementById('groqApiKeyInput').value.trim(),
        yapeNumber: document.getElementById('yapeNumberInput').value.trim(),
        yapeName: document.getElementById('yapeNameInput').value.trim(),
        bankAccounts: document.getElementById('bankAccountsInput').value.trim(),
        culqiPublicKey: document.getElementById('culqiPublicKeyInput').value.trim(),
        culqiSecret: document.getElementById('culqiSecretInput').value.trim(),
        mercadoPagoPublicKey: document.getElementById('mercadoPagoPublicKeyInput').value.trim(),
        mercadoPagoSecret: document.getElementById('mercadoPagoSecretInput').value.trim(),
        mercadoPagoWebhookSecret: mercadoPagoWebhookSecretInput.value.trim(),
        paypalClientId: document.getElementById('paypalClientIdInput').value.trim(),
        paypalSecret: document.getElementById('paypalSecretInput').value.trim(),
        aiProvider: document.getElementById('aiProviderInput').value,
        mailFrom: document.getElementById('mailFromInput').value.trim(),
        mailFromName: document.getElementById('mailFromNameInput').value.trim()
      }
    });
    applyBranding(result.settings);
    applyBaseCurrency(result.settings.baseCurrency);
    document.getElementById('smtpPasswordInput').value = '';
    document.getElementById('geminiApiKeyInput').value = '';
    document.getElementById('groqApiKeyInput').value = '';
    document.getElementById('culqiSecretInput').value = '';
    document.getElementById('mercadoPagoSecretInput').value = '';
    mercadoPagoWebhookSecretInput.value = '';
    document.getElementById('paypalSecretInput').value = '';
    showAppNotice('Configuración guardada.');
    await loadAdminData();
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleBrandUpload(kind, button) {
  const inputId = { logo: 'logoUpload', favicon: 'faviconUpload', 'yape-qr': 'yapeQrUpload' }[kind];
  const input = document.getElementById(inputId);
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
    if (kind === 'yape-qr') {
      paymentInstructions.yapeQrUrl = result.settings.yapeQrUrl;
      const preview = document.getElementById('yapeQrPreview');
      preview.src = result.settings.yapeQrUrl;
      preview.hidden = false;
      renderRequiredPayment();
      renderPlanPaymentInstructions();
      renderAiPaymentOffer();
    }
    input.value = '';
    showAppNotice(kind === 'logo' ? 'Logotipo actualizado.'
      : kind === 'favicon' ? 'Favicon actualizado.' : 'Código QR de Yape actualizado.');
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
  const aiRequestsList = document.getElementById('aiSubscriptionRequestsList');
  const requestStatusLabels = { pending: 'Pendiente de pago/verificación', paid: 'Pago confirmado', rejected: 'Rechazada' };
  if (!data.aiRequests.length) {
    aiRequestsList.innerHTML = '<p class="empty-state">No hay solicitudes de registro inteligente.</p>';
  } else {
    aiRequestsList.innerHTML = data.aiRequests.map((request) => `
      <div class="admin-record ai-request-record" data-request-id="${request.id}">
        <div>
          <strong>${escapeHtml(request.name)} · ${escapeHtml(request.email)}</strong>
          <small>${requestStatusLabels[request.status]} · ${new Date(request.requestedAt * 1000).toLocaleString('es-PE')}</small>
          <small>Pago: ${request.paymentAmount === null ? 'Datos antiguos sin detalle' : `${formatCurrency(request.paymentAmount, request.paymentCurrency)} · ${request.paymentMethod === 'yape' ? 'Yape' : 'Transferencia'} · Ref. ${escapeHtml(request.paymentReference || '—')}`}</small>
        </div>
        ${request.status === 'pending' ? '<button class="button button-primary ai-request-paid" type="button">Confirmar pago y habilitar un mes</button><button class="button button-reset ai-request-reject" type="button">Rechazar</button>' : ''}
      </div>
    `).join('');
    aiRequestsList.querySelectorAll('.ai-request-paid, .ai-request-reject').forEach((button) => {
      button.addEventListener('click', async () => {
        const record = button.closest('.ai-request-record');
        const decision = button.classList.contains('ai-request-paid') ? 'paid' : 'rejected';
        if (decision === 'paid' && !window.confirm('Confirma que recibiste y verificaste el pago mensual de IA. Se habilitará un mes desde hoy (o después de su periodo actual).')) return;
        button.disabled = true;
        try {
          const result = await apiRequest('admin-ai-requests', {
            method: 'PUT',
            body: { id: record.dataset.requestId, decision }
          });
          showAppNotice(result.message);
          await loadAdminData();
        } catch (error) {
          showAppNotice(error.message, true);
        } finally {
          button.disabled = false;
        }
      });
    });
  }
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
      <div><strong>${escapeHtml(item.userName)} · ${escapeHtml(item.email)}</strong><small>${escapeHtml(item.optionName)}${item.isTrial ? ' · Prueba gratis' : ''} · Inicio: ${escapeHtml(item.startsAt)} · Fin: ${escapeHtml(item.endsAt || 'Sin fecha')}</small></div>
      <label>Estado<select class="assignment-status">
        <option value="active" ${item.status === 'active' ? 'selected' : ''}>Activa</option>
        <option value="paused" ${item.status === 'paused' ? 'selected' : ''}>Pausada</option>
        <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
      </select></label>
      <label>Fin<input class="assignment-end" type="date" value="${escapeHtml(item.endsAt || '')}" /></label>
      <div class="assignment-actions">
        <button class="button button-quiet assignment-save" type="button">Guardar</button>
        <button class="button button-delete assignment-delete" type="button">Eliminar</button>
      </div>
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

function renderPlanPaymentRequests(requests) {
  const container = document.getElementById('planPaymentRequestsList');
  if (!requests.length) {
    container.innerHTML = '<p class="empty-state">No hay solicitudes de planes.</p>';
    return;
  }
  const labels = { pending: 'Pendiente', approved: 'Aprobada', rejected: 'Rechazada' };
  container.innerHTML = requests.map((request) => `
    <article class="admin-record plan-request-record" data-plan-request-id="${request.id}">
      <div>
        <strong>${escapeHtml(request.name)} · ${escapeHtml(request.email)}</strong>
        <small>${escapeHtml(request.planName)} · Pagó ${formatCurrency(request.paymentAmount, request.paymentCurrency)} · ${request.gateway === 'mercado_pago' ? 'Mercado Pago' : request.paymentMethod === 'yape' ? 'Yape' : 'Transferencia'}</small>
        <small>Referencia: ${escapeHtml(request.paymentReference)} · ${new Date(request.requestedAt * 1000).toLocaleString('es-PE')}</small>
        ${request.gateway === 'mercado_pago' ? `<small>Preferencia: ${escapeHtml(request.preferenceId || 'pendiente')} · Pago: ${escapeHtml(request.paymentId || 'pendiente de confirmación automática')}</small>` : ''}
        <small>Estado: ${labels[request.status] || request.status}</small>
      </div>
      ${request.status === 'pending' && request.gateway !== 'mercado_pago' ? '<button class="button button-primary plan-request-approve" type="button">Confirmar pago</button><button class="button button-reset plan-request-reject" type="button">Rechazar</button>' : ''}
    </article>
  `).join('');
  container.querySelectorAll('.plan-request-approve, .plan-request-reject').forEach((button) => {
    button.addEventListener('click', async () => {
      const record = button.closest('.plan-request-record');
      const decision = button.classList.contains('plan-request-approve') ? 'approved' : 'rejected';
      if (decision === 'approved' && !window.confirm('Confirma que recibiste el pago y activa el plan del usuario.')) return;
      button.disabled = true;
      try {
        const result = await apiRequest('admin-plan-requests', {
          method: 'PUT',
          body: { id: record.dataset.planRequestId, decision }
        });
        showAppNotice(result.message);
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
    setDefaultAssignmentDates();
    showAppNotice('Suscripción asignada.');
    await loadAdminData();
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function setDefaultAssignmentDates() {
  const start = document.getElementById('assignmentStartInput');
  const end = document.getElementById('assignmentEndInput');
  start.value = getDateString(0);
  end.value = getDateString(30);
}

async function completeAuthentication(result) {
  authToken = result.token;
  localStorage.setItem(AUTH_TOKEN_KEY, authToken);
  currentUser = result.user;
  try {
    if (await showRequiredPaymentIfNeeded()) return;
    await loadAccountData();
    showApp();
    maybeStartOnboarding();
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
  installButton.classList.remove('install-ready');
  authInstallButton.hidden = true;
  authInstallHelp.hidden = true;
}

function updateInstallButtonVisibility() {
  if (isAppInstalled()) {
    hideInstallButton();
  }
}

async function handleReportClick() {
  if (!featureAccess.reports) {
    showAppNotice('La descarga de reportes está disponible con el acceso de por vida. Revisa Plan y suscripción.', true);
    return;
  }
  try {
    reportButton.disabled = true;
    reportButton.innerHTML = '<span aria-hidden="true">…</span> Preparando PDF';
    const report = getReportData();
    await exportReportPDF(report.transactions, report.range.label, report.filters);
  } catch (error) {
    console.error('No se pudo generar o compartir el reporte PDF.', error);
    window.alert('No se pudo generar el reporte. Intenta de nuevo.');
  } finally {
    reportButton.disabled = false;
    reportButton.innerHTML = '<span aria-hidden="true">↓</span> Descargar PDF';
  }
}

async function exportReportPDF(reportTransactions, period, filters) {
  const jsPDF = await loadJsPDF();
  reportTransactions.sort((a, b) => a.date.localeCompare(b.date));
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 16;
  const right = pageWidth - left;
  const totals = reportTransactions.reduce(
    (summary, transaction) => {
      summary[transaction.type] += transaction.amountInBaseCurrency;
      return summary;
    },
    { income: 0, expense: 0 }
  );
  const categoryTotals = reportTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((result, transaction) => {
      result[transaction.category] = (result[transaction.category] || 0) + transaction.amountInBaseCurrency;
      return result;
    }, {});

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 54, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(publicBrand.appName || 'Finanza', left, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Reporte de ingresos y gastos', left, 28);
  doc.text(`Período: ${period}`, left, 36);
  doc.text(`Generado: ${formatDate(getDateString(0))}`, right, 36, { align: 'right' });
  doc.setFontSize(8);
  doc.text(`Filtros: ${filters.join(' · ')}`, left, 44);

  let y = 65;
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
    doc.text(`${reportTypeInput.value === 'income' ? 'INGRESOS' : 'GASTOS'} POR CATEGORÍA`, left, y);
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
    doc.text(`${transaction.type === 'income' ? '+' : '-'}${formatReportAmount(transaction.amount, transaction.currency)}`, columns.amount - 2, y, { align: 'right' });
    y += rowHeight;
  });

  if (!reportTransactions.length) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text('No hay movimientos para los filtros seleccionados.', left, y);
  }

  const filename = `finanza-reporte-${getDateString(0)}.pdf`;
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

function formatReportAmount(value, currency = appBaseCurrency) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
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
    const helpText = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      ? 'En Safari, toca Compartir y elige “Añadir a pantalla de inicio”.'
      : 'Abre el menú del navegador y elige “Instalar app” o “Añadir a pantalla principal”.';
    if (appShell.hidden) {
      authInstallHelp.textContent = helpText;
      authInstallHelp.hidden = false;
    } else {
      showAppNotice(helpText);
    }
    return;
  }

  deferredInstallPrompt.prompt();
  const choiceResult = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  if (isAppInstalled()) {
    hideInstallButton();
  }
  if (choiceResult.outcome === 'accepted' && !isAppInstalled()) {
    showAppNotice('Finanza se instalará en tu dispositivo. El botón desaparecerá al completar la instalación.');
  }
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
  const currency = currencyInput.value;
  const exchangeRate = currency === formBaseCurrency ? 1 : Number(exchangeRateInput.value);
  const date = dateInput.value;

  if (!description || !date || Number.isNaN(amount) || amount <= 0 ||
      !['PEN', 'USD', 'EUR'].includes(currency) || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return;
  }

  const payload = { description, category, type, amount, currency, exchangeRate, date };

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

function openAiAssistant() {
  aiAssistantStatus.textContent = 'La foto o transcripción se enviará al servicio de IA para analizarla; no se guardará como archivo.';
  aiAssistantStatus.classList.remove('error');
  aiAssistantTitle.textContent = aiAssistantAccess.isMaster
    ? 'Registro inteligente'
    : 'Registro inteligente Pro';
  aiAssistantTools.hidden = !aiAssistantAccess.available;
  aiPaidOffer.hidden = aiAssistantAccess.available;
  aiPaymentReference.value = '';
  renderAiPaymentOffer();
  startVoiceButton.textContent = window.SpeechRecognition || window.webkitSpeechRecognition
    ? 'Grabar descripción'
    : 'Interpretar texto';
  if (!aiAssistantAccess.available) {
    const isPending = aiAssistantAccess.requestStatus === 'pending';
    const needsLifetime = !aiAssistantAccess.lifetimeAccess && !isPending;
    aiRequestStatus.textContent = isPending
      ? 'Ya recibimos tu solicitud. Te habilitaremos el servicio cuando el administrador confirme el pago.'
      : needsLifetime
        ? 'La IA es opcional: primero activa Finanza por única vez y luego podrás solicitar la mensualidad de IA.'
        : aiAssistantAccess.requestStatus === 'rejected'
          ? 'La solicitud anterior no fue aprobada. Si ya realizaste el pago, puedes enviar una nueva solicitud.'
          : 'Luego de realizar el pago, solicita aquí la activación. El administrador verificará el pago.';
    aiPaymentControls.hidden = needsLifetime || isPending;
    aiActivateLifetimeButton.hidden = !needsLifetime;
    requestAiAccessButton.hidden = isPending || needsLifetime;
    aiPaymentReference.disabled = isPending;
    aiPaymentCurrency.disabled = isPending;
    aiPaymentMethod.disabled = isPending;
    aiRequestStatus.classList.remove('error');
  }
  aiReceiptInput.value = '';
  aiTranscriptInput.value = '';
  aiReceiptPreview.hidden = true;
  if (aiReceiptPreviewUrl) {
    URL.revokeObjectURL(aiReceiptPreviewUrl);
    aiReceiptPreviewUrl = '';
  }
  aiAssistantDialog.showModal();
}

function renderAiPaymentOffer() {
  const currency = aiPaymentCurrency.value;
  const amount = currency === 'USD' ? 2.78 : 10;
  aiPaymentAmount.textContent = formatCurrency(amount, currency);
  const hasPaymentMethod = configurePaymentOptions(aiPaymentMethod, currency);
  requestAiAccessButton.disabled = !hasPaymentMethod;
  aiPaymentReference.required = hasPaymentMethod;
  aiPaymentReference.hidden = !hasPaymentMethod;
  aiPaymentInstructions.innerHTML = paymentMethodInstructionsMarkup(aiPaymentMethod.value);
}

function maybeStartOnboarding(force = false) {
  if (!currentUser || (!force && currentUser.onboardingCompleted !== false) || onboardingDialog.open) return;
  onboardingStep = 0;
  onboardingStatus.hidden = true;
  onboardingStatus.classList.remove('error');
  renderOnboardingStep();
  onboardingDialog.showModal();
  onboardingSpotlight.hidden = false;
  updateOnboardingSpotlight();
  window.setTimeout(() => updateOnboardingSpotlight(), 350);
}

function renderOnboardingStep() {
  onboardingStepLabel.textContent = `GUÍA INICIAL · ${onboardingStep + 1} DE ${onboardingSteps.length}`;
  const step = onboardingSteps[onboardingStep];
  onboardingTitle.textContent = step.title;
  onboardingDescription.textContent = step.description;
  previousOnboardingButton.disabled = onboardingStep === 0;
  nextOnboardingButton.textContent = onboardingStep === onboardingSteps.length - 1 ? 'Terminar' : 'Siguiente';
  setAppPage(step.page, { scroll: false });
  if (step.hash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${step.hash}`);
  }
  const target = document.querySelector(step.target);
  if (!target) {
    onboardingSpotlight.hidden = true;
    return;
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (onboardingDialog.open) {
    onboardingSpotlight.hidden = false;
    window.setTimeout(() => updateOnboardingSpotlight(), 350);
  }
}

function updateOnboardingSpotlight() {
  if (!onboardingDialog.open || onboardingSpotlight.hidden) return;
  const target = document.querySelector(onboardingSteps[onboardingStep].target);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const padding = 7;
  const left = Math.max(8, rect.left - padding);
  const top = Math.max(8, rect.top - padding);
  onboardingSpotlight.style.left = `${left}px`;
  onboardingSpotlight.style.top = `${top}px`;
  onboardingSpotlight.style.width = `${Math.min(rect.right + padding - left, window.innerWidth - left - 8)}px`;
  onboardingSpotlight.style.height = `${Math.min(rect.bottom + padding - top, window.innerHeight - top - 8)}px`;

  const dialogRect = onboardingDialog.getBoundingClientRect();
  const dialogLeft = Math.min(
    Math.max(12, rect.left + rect.width / 2 - dialogRect.width / 2),
    window.innerWidth - dialogRect.width - 12
  );
  const spaceBelow = window.innerHeight - rect.bottom;
  const dialogTop = spaceBelow >= dialogRect.height + 24
    ? rect.bottom + 12
    : Math.max(12, rect.top - dialogRect.height - 12);
  onboardingDialog.style.left = `${dialogLeft}px`;
  onboardingDialog.style.top = `${Math.min(dialogTop, window.innerHeight - dialogRect.height - 12)}px`;
}

async function finishOnboarding() {
  const buttons = [skipOnboardingButton, previousOnboardingButton, nextOnboardingButton];
  buttons.forEach((button) => { button.disabled = true; });
  onboardingStatus.hidden = true;
  try {
    await apiRequest('complete-onboarding', { method: 'POST', body: {} });
    currentUser.onboardingCompleted = true;
    onboardingDialog.close();
    setAppPage('summary', { scroll: true });
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#overview`);
  } catch (error) {
    onboardingStatus.textContent = error.message;
    onboardingStatus.classList.add('error');
    onboardingStatus.hidden = false;
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
  }
}

async function requestAiSubscription() {
  requestAiAccessButton.disabled = true;
  aiRequestStatus.classList.remove('error');
  try {
    const currency = aiPaymentCurrency.value;
    const result = await apiRequest('ai-subscription-request', {
      method: 'POST',
      body: {
        paymentMethod: aiPaymentMethod.value,
        paymentCurrency: currency,
        paymentAmount: currency === 'USD' ? 2.78 : 10,
        paymentReference: aiPaymentReference.value.trim()
      }
    });
    showAppNotice(result.message);
    aiAssistantAccess.requestStatus = 'pending';
    aiRequestStatus.textContent = 'Solicitud enviada. Te habilitaremos el servicio cuando el administrador confirme el pago.';
    requestAiAccessButton.hidden = true;
    aiPaymentReference.disabled = true;
    aiPaymentCurrency.disabled = true;
    aiPaymentMethod.disabled = true;
  } catch (error) {
    aiRequestStatus.textContent = error.message;
    aiRequestStatus.classList.add('error');
  } finally {
    requestAiAccessButton.disabled = false;
  }
}

function handleAiReceiptSelection() {
  const file = aiReceiptInput.files[0];
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    aiReceiptInput.value = '';
    setAiAssistantStatus('Selecciona una imagen JPG, PNG o WebP.', true);
    return;
  }
  if (aiReceiptPreviewUrl) URL.revokeObjectURL(aiReceiptPreviewUrl);
  aiReceiptPreviewUrl = URL.createObjectURL(file);
  aiReceiptPreview.src = aiReceiptPreviewUrl;
  aiReceiptPreview.hidden = false;
  setAiAssistantStatus('Comprueba que el total y los conceptos sean legibles.');
}

async function handleReceiptAnalysis() {
  const file = aiReceiptInput.files[0];
  if (!file) {
    setAiAssistantStatus('Selecciona o toma una foto del comprobante primero.', true);
    return;
  }
  const button = analyzeReceiptButton;
  button.disabled = true;
  setAiAssistantStatus('Analizando el comprobante…');
  try {
    const image = await compressReceiptImage(file);
    const body = new FormData();
    body.append('source', 'receipt');
    body.append('image', image, 'comprobante.jpg');
    const result = await apiRequest('ai-transaction', { method: 'POST', body });
    applyAiTransaction(result);
  } catch (error) {
    setAiAssistantStatus(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleVoiceInterpretation() {
  const transcript = aiTranscriptInput.value.trim();
  if (!transcript) {
    setAiAssistantStatus('No se reconoció ninguna frase. Inténtalo otra vez o escribe la descripción.', true);
    return;
  }
  startVoiceButton.disabled = true;
  startVoiceButton.textContent = 'Interpretando…';
  setAiAssistantStatus('Interpretando el movimiento…');
  try {
    const result = await apiRequest('ai-transaction', {
      method: 'POST',
      body: { source: 'voice', transcript }
    });
    applyAiTransaction(result);
  } catch (error) {
    setAiAssistantStatus(error.message, true);
  } finally {
    startVoiceButton.disabled = false;
    startVoiceButton.textContent = window.SpeechRecognition || window.webkitSpeechRecognition
      ? 'Grabar descripción'
      : 'Interpretar texto';
  }
}

function startAiDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (aiTranscriptInput.value.trim()) {
      handleVoiceInterpretation();
    } else {
      setAiAssistantStatus('Este navegador no admite dictado. Escribe la descripción para interpretarla.', true);
    }
    return;
  }
  if (aiRecognition) {
    startVoiceButton.textContent = 'Procesando…';
    aiRecognition.stop();
    return;
  }
  if (aiTranscriptInput.value.trim()) {
    handleVoiceInterpretation();
    return;
  }
  const recognition = new SpeechRecognition();
  aiRecognition = recognition;
  aiVoiceRecognitionFailed = false;
  aiVoiceCancelled = false;
  aiTranscriptInput.value = '';
  recognition.lang = 'es-PE';
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  startVoiceButton.textContent = 'Terminar y analizar';
  setAiAssistantStatus('Escuchando… Al terminar, interpretaré automáticamente lo reconocido.');
  recognition.onresult = (event) => {
    aiTranscriptInput.value = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(' ')
      .trim();
  };
  recognition.onerror = (event) => {
    aiVoiceRecognitionFailed = true;
    setAiAssistantStatus(event.error === 'not-allowed'
      ? 'Permite el acceso al micrófono en tu navegador e inténtalo de nuevo.'
      : 'No se pudo reconocer la voz. Puedes escribir la descripción.', true);
  };
  recognition.onend = () => {
    aiRecognition = null;
    if (aiVoiceCancelled || !aiAssistantDialog.open) return;
    if (aiVoiceRecognitionFailed) {
      startVoiceButton.textContent = 'Interpretar texto';
      return;
    }
    if (aiTranscriptInput.value.trim()) {
      handleVoiceInterpretation();
    } else {
      startVoiceButton.textContent = 'Grabar descripción';
      setAiAssistantStatus('No se reconoció ninguna frase. Inténtalo otra vez o escribe la descripción.', true);
    }
  };
  recognition.start();
}

async function compressReceiptImage(file) {
  if (file.size > 15728640) {
    throw new Error('La foto original supera 15 MB. Toma una foto más pequeña e inténtalo de nuevo.');
  }
  const imageUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('No se pudo abrir la imagen. Usa JPG, PNG o WebP.'));
      element.src = imageUrl;
    });
    let scale = Math.min(1, 2560 / Math.max(image.width, image.height));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo preparar la imagen en este dispositivo.');
    let blob = null;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const quality = attempt < 3 ? [0.9, 0.84, 0.78][attempt] : 0.74;
      blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= 2097152) break;
      scale *= 0.82;
    }
    if (!blob || blob.size > 2097152) {
      throw new Error('No se pudo preparar la foto para su análisis. Toma otra con menor resolución.');
    }
    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function applyAiTransaction(result) {
  const transaction = result.transaction;
  resetFormState();
  descriptionInput.value = transaction.description;
  typeInput.value = transaction.type;
  amountInput.value = String(transaction.amount);
  formBaseCurrency = appBaseCurrency;
  currencyInput.value = transaction.currency || appBaseCurrency;
  exchangeRateInput.value = currencyInput.value === formBaseCurrency
    ? '1'
    : '';
  updateExchangeRateField();
  dateInput.value = transaction.date;
  const categoryExists = Array.from(categoryInput.options).some((option) => option.value === transaction.category);
  categoryInput.value = categoryExists ? transaction.category : 'Otros';
  aiAssistantDialog.close();
  showAppNotice(result.categoryWarning
    ? 'Movimiento completado. Revisa la categoría sugerida antes de guardarlo.'
    : 'Movimiento completado con IA. Revísalo y pulsa Guardar movimiento.');
}

function setAiAssistantStatus(message, error = false) {
  aiAssistantStatus.textContent = message;
  aiAssistantStatus.classList.toggle('error', error);
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

async function handlePaymentSubmit(event) {
  event.preventDefault();
  const title = paymentNameInput.value.trim();
  const category = paymentCategoryInput.value;
  const amount = Number(paymentAmountInput.value);
  const currency = paymentCurrencyInput.value;
  const exchangeRate = currency === appBaseCurrency ? 1 : Number(paymentExchangeRateInput.value);
  const dueDate = paymentDueDateInput.value;
  const reminderTime = paymentReminderTimeInput.value;
  if (!title || !category || !dueDate || !reminderTime || !Number.isFinite(amount) || amount <= 0 ||
      !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    showAppNotice('Revisa el monto, la fecha y el tipo de cambio del pago.', true);
    return;
  }

  const submitButton = paymentForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  try {
    const result = await apiRequest('payments', {
      method: 'POST',
      body: {
        title,
        category,
        amount,
        currency,
        exchangeRate,
        dueDate,
        recurrence: paymentRecurrenceInput.value,
        reminderTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      }
    });
    paymentSchedules.push(result.payment);
    paymentSchedules.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const [year, month, day] = dueDate.split('-').map(Number);
    paymentCalendarMonth = new Date(year, month - 1, 1);
    selectedPaymentDate = dueDate;
    paymentForm.reset();
    paymentDueDateInput.value = getDateString(1);
    paymentCurrencyInput.value = appBaseCurrency;
    updatePaymentExchangeRateField();
    renderPaymentCalendar();
    paymentForm.hidden = !featureAccess.payments;
    document.getElementById('paymentsUpgradeNotice').hidden = featureAccess.payments;
    document.getElementById('dailyAlertNote').hidden = !featureAccess.alerts;
    showAppNotice('Recordatorio de pago guardado.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
}

function updatePaymentExchangeRateField() {
  const needsExchangeRate = paymentCurrencyInput.value !== appBaseCurrency;
  paymentExchangeRateField.hidden = !needsExchangeRate;
  paymentExchangeRateInput.required = needsExchangeRate;
  paymentExchangeRateHint.textContent = `${appBaseCurrency} por cada unidad de ${paymentCurrencyInput.value}`;
  if (!needsExchangeRate) {
    paymentExchangeRateInput.value = '';
  }
}

function updateDebtExchangeRateField() {
  const needsExchangeRate = debtCurrencyInput.value !== appBaseCurrency;
  debtExchangeRateField.hidden = !needsExchangeRate;
  debtExchangeRateInput.required = needsExchangeRate;
  debtExchangeRateHint.textContent = `${appBaseCurrency} por cada unidad de ${debtCurrencyInput.value}`;
  if (!needsExchangeRate) debtExchangeRateInput.value = '';
}

async function handleDebtSubmit(event) {
  event.preventDefault();
  const currency = debtCurrencyInput.value;
  const exchangeRate = currency === appBaseCurrency ? 1 : Number(debtExchangeRateInput.value);
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    showAppNotice('Ingresa un tipo de cambio válido para esta deuda.', true);
    return;
  }
  const button = debtForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('debts', {
      method: 'POST',
      body: {
        name: debtNameInput.value.trim(),
        lender: debtLenderInput.value.trim(),
        amount: Number(debtAmountInput.value),
        currency,
        exchangeRate
      }
    });
    debts.push(result.debt);
    debtForm.reset();
    debtCurrencyInput.value = appBaseCurrency;
    updateDebtExchangeRateField();
    render();
    showAppNotice('Deuda registrada.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleDebtPaymentSubmit(event) {
  const paymentFormElement = event.target.closest('[data-debt-payment-form]');
  if (!paymentFormElement) return;
  event.preventDefault();
  const fields = new FormData(paymentFormElement);
  const button = paymentFormElement.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('debt-payment', {
      method: 'POST',
      body: {
        debtId: paymentFormElement.dataset.debtId,
        principalAmount: Number(fields.get('principalAmount')),
        chargesAmount: Number(fields.get('chargesAmount') || 0),
        date: fields.get('date')
      }
    });
    const [debtResult, transactionResult] = await Promise.all([
      apiRequest('debts'),
      apiRequest('transactions')
    ]);
    debts = debtResult.debts;
    debtPayments = debtResult.payments;
    transactions = transactionResult.transactions;
    render();
    showAppNotice(result.message);
  } catch (error) {
    button.disabled = false;
    showAppNotice(error.message, true);
  }
}

async function handleDebtListClick(event) {
  const paymentButton = event.target.closest('[data-delete-debt-payment]');
  if (paymentButton) {
    if (!window.confirm('¿Anular este pago? El saldo de la deuda se restaurará y también se eliminará el gasto asociado.')) return;
    paymentButton.disabled = true;
    try {
      const result = await apiRequest('debt-payment', {
        method: 'DELETE',
        body: { id: paymentButton.dataset.deleteDebtPayment }
      });
      const [debtResult, transactionResult] = await Promise.all([
        apiRequest('debts'),
        apiRequest('transactions')
      ]);
      debts = debtResult.debts;
      debtPayments = debtResult.payments;
      transactions = transactionResult.transactions;
      render();
      showAppNotice(result.message);
    } catch (error) {
      paymentButton.disabled = false;
      showAppNotice(error.message, true);
    }
    return;
  }
  const button = event.target.closest('[data-delete-debt]');
  if (!button) return;
  if (!window.confirm('¿Eliminar esta deuda? Las deudas con pagos registrados conservan su historial y no se pueden borrar.')) return;
  button.disabled = true;
  try {
    await apiRequest('debts', { method: 'DELETE', body: { id: button.dataset.deleteDebt } });
    debts = debts.filter((debt) => debt.id !== button.dataset.deleteDebt);
    render();
    showAppNotice('Deuda eliminada.');
  } catch (error) {
    button.disabled = false;
    showAppNotice(error.message, true);
  }
}

function renderDebts() {
  debtForm.hidden = !featureAccess.debts;
  document.getElementById('debtFormDetails').hidden = !featureAccess.debts;
  document.getElementById('debtUpgradeNotice').hidden = featureAccess.debts;
  const openDebts = debts.filter((debt) => debt.balance > 0);
  const totals = new Map();
  openDebts.forEach((debt) => totals.set(debt.currency, (totals.get(debt.currency) || 0) + debt.balance));
  const totalText = [...totals].map(([currency, amount]) => formatCurrency(amount, currency)).join(' · ') || formatCurrency(0);
  document.getElementById('debtSummaryValue').textContent = totalText;
  document.getElementById('debtTotalValue').textContent = totalText;
  document.getElementById('debtCountLabel').textContent = `${openDebts.length} deuda(s) pendiente(s)`;
  document.getElementById('debtSummaryLabel').textContent = `${openDebts.length} deuda(s) pendiente(s)`;

  if (!debts.length) {
    debtsList.innerHTML = `<p class="empty-state">${featureAccess.debts
      ? 'Aún no registras préstamos o deudas.'
      : 'Tus préstamos y pagos aparecerán aquí al activar el acceso de por vida.'}</p>`;
  } else {
    debtsList.innerHTML = debts.map((debt) => {
      const history = debtPayments.filter((payment) => payment.debtId === debt.id);
      const principalPaid = Math.max(0, debt.originalAmount - debt.balance);
      const chargesPaid = history.reduce((sum, payment) => sum + payment.chargesAmount, 0);
      return `
        <article class="debt-card">
          <div class="debt-card-heading">
            <div><strong>${escapeHtml(debt.name)}</strong><small>${escapeHtml(debt.lender)}</small></div>
            ${featureAccess.debts ? `<button class="goal-delete-button" type="button" data-delete-debt="${escapeHtml(debt.id)}">Eliminar</button>` : ''}
          </div>
          <p>Saldo pendiente <strong>${formatCurrency(debt.balance, debt.currency)}</strong></p>
          <div class="debt-metrics">
            <span>Abonado a capital<strong>${formatCurrency(principalPaid, debt.currency)}</strong></span>
            <span>Intereses y cargos pagados<strong>${formatCurrency(chargesPaid, debt.currency)}</strong></span>
          </div>
          ${debt.balance > 0 && featureAccess.debts ? `
            <details class="debt-payment-details">
              <summary>Registrar un pago</summary>
              <form class="debt-payment-form" data-debt-payment-form data-debt-id="${escapeHtml(debt.id)}">
                <p class="field-hint">El abono a capital reduce el saldo. Intereses y cargos forman parte del gasto, pero no reducen la deuda.</p>
                <label>Abono a capital (reduce el saldo)<input name="principalAmount" type="number" min="0" max="${debt.balance}" step="0.01" value="0" required /></label>
                <label>Intereses y cargos<input name="chargesAmount" type="number" min="0" step="0.01" value="0" /></label>
                <label>Fecha<input name="date" type="date" value="${getDateString(0)}" required /></label>
                <button class="button button-primary" type="submit">Guardar pago</button>
              </form>
            </details>
          ` : debt.balance <= 0 ? '<p class="debt-paid-label">Deuda saldada</p>' : ''}
          <details class="debt-payment-details">
            <summary>Pagos registrados (${history.length})</summary>
            <div class="dashboard-compact-list">${history.length
              ? history.map((payment) => `
                <div class="debt-payment-history">
                  <p>${formatDate(payment.paidDate)} · Capital ${formatCurrency(payment.principalAmount, payment.currency)} · Cargos ${formatCurrency(payment.chargesAmount, payment.currency)}</p>
                  ${featureAccess.debts ? `<button class="goal-delete-button" type="button" data-delete-debt-payment="${escapeHtml(payment.id)}">Anular pago</button>` : ''}
                </div>
              `).join('')
              : '<p class="empty-state">Sin pagos registrados.</p>'}</div>
          </details>
        </article>
      `;
    }).join('');
  }

  debtPaymentsList.innerHTML = debtPayments.length
    ? debtPayments.slice(0, 8).map((payment) => `
      <article class="dashboard-compact-item">
        <span>${escapeHtml(payment.debtName)} · ${formatDate(payment.paidDate)}</span>
        <strong>${formatCurrency(payment.principalAmount + payment.chargesAmount, payment.currency)}</strong>
      </article>
    `).join('')
    : '<p class="empty-state">Los pagos de tus préstamos aparecerán aquí.</p>';
}

function renderDashboardLists() {
  const upcoming = [...paymentSchedules]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  dashboardPendingList.innerHTML = upcoming.length
    ? upcoming.map((payment) => `
      <article class="dashboard-compact-item">
        <span><strong>${escapeHtml(payment.title)}</strong><small>${formatPaymentDate(payment.dueDate)}</small></span>
        <strong>${formatCurrency(payment.amount, payment.currency)}</strong>
      </article>
    `).join('')
    : '<p class="empty-state">No tienes vencimientos programados.</p>';

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  dashboardRecentList.innerHTML = recent.length
    ? recent.map((transaction) => `
      <article class="dashboard-compact-item">
        <span><strong>${escapeHtml(transaction.description)}</strong><small>${escapeHtml(transaction.category)} · ${formatDate(transaction.date)}</small></span>
        <strong class="${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}">${transaction.type === 'income' ? '+' : '−'}${formatCurrency(transaction.amount, transaction.currency)}</strong>
      </article>
    `).join('')
    : '<p class="empty-state">Aún no hay movimientos.</p>';
}

function suggestedEmergencyFundTarget() {
  const now = new Date();
  const firstMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const start = localDateString(firstMonth);
  const end = getDateString(0);
  const total = transactions
    .filter((transaction) => transaction.type === 'expense' &&
      transaction.date >= start && transaction.date <= end &&
      (transaction.baseCurrency || 'PEN') === appBaseCurrency)
    .reduce((sum, transaction) => sum + transaction.amountInBaseCurrency, 0);
  return Math.max(total, 1);
}

function renderEmergencyFund() {
  const suggested = suggestedEmergencyFundTarget();
  const fundCurrency = emergencyFund?.currency || appBaseCurrency;
  const target = emergencyFund?.target || suggested;
  const current = emergencyFund?.current || 0;
  const percent = Math.min((current / target) * 100, 100);
  document.getElementById('emergencyFundValue').textContent =
    `${formatCurrency(current, fundCurrency)} / ${formatCurrency(target, fundCurrency)}`;
  document.getElementById('emergencyFundProgress').textContent =
    `${Math.round(percent)}% de la meta · faltan ${formatCurrency(Math.max(target - current, 0), fundCurrency)}`;
  document.getElementById('emergencyFundProgressBar').style.width = `${percent}%`;
  document.querySelector('.emergency-fund-progress[role="progressbar"]')
    .setAttribute('aria-valuenow', String(Math.round(percent)));
  emergencyTargetInput.value = String(target.toFixed(2));
  emergencyCurrentInput.value = String(current.toFixed(2));
  emergencyTargetInput.placeholder = String(suggested.toFixed(2));
}

function toggleEmergencyFundHelp() {
  const help = document.getElementById('emergencyFundHelp');
  const button = document.getElementById('emergencyFundHelpButton');
  help.hidden = !help.hidden;
  button.setAttribute('aria-expanded', String(!help.hidden));
}

function togglePlanOffers() {
  const planCards = document.getElementById('planCards');
  const button = document.getElementById('togglePlansButton');
  planCards.hidden = !planCards.hidden;
  button.setAttribute('aria-expanded', String(!planCards.hidden));
  button.textContent = planCards.hidden ? 'Conocer planes' : 'Ocultar planes';
}

function openPlanOffers() {
  setAppPage('planning');
  const planCards = document.getElementById('planCards');
  const button = document.getElementById('togglePlansButton');
  planCards.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  button.textContent = 'Ocultar planes';
  document.getElementById('subscriptionPlans').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPlans() {
  const planSection = document.getElementById('subscriptionPlans');
  if (currentUser?.role === 'master') {
    planSection.hidden = true;
    return;
  }
  planSection.hidden = false;
  resumePlanPaymentButton.hidden = !hasPendingPlanRequest || pendingPlanGateway !== 'mercado_pago';
  const pendingPlanText = hasPendingPlanRequest
    ? pendingPlanGateway === 'mercado_pago'
      ? ' · tienes un pago de Mercado Pago pendiente.'
      : ' · tienes un pago pendiente de revisión.'
    : '';
  if (!subscriptionPlans.length) {
    document.getElementById('planCards').innerHTML = '<p class="empty-state">No hay planes publicados.</p>';
    return;
  }
  if (currentSubscription) {
    const trialText = currentSubscription.isTrial
      ? ` · prueba gratis hasta ${formatDate(currentSubscription.endsAt)}`
      : currentSubscription.endsAt ? ` · vigente hasta ${formatDate(currentSubscription.endsAt)}` : '';
    document.getElementById('currentPlanSummary').textContent =
      `Tu plan actual: ${currentSubscription.name}${trialText}${pendingPlanText}`;
  } else {
    document.getElementById('currentPlanSummary').textContent =
      `Tu plan actual es Gratis.${pendingPlanText}`;
  }
  document.getElementById('planCards').innerHTML = subscriptionPlans
    .filter((plan) => !(plan.billingPeriod === 'lifetime' && currentSubscription?.billingPeriod === 'lifetime'))
    .map((plan) => {
    const paid = ['lifetime', 'monthly', 'yearly'].includes(plan.billingPeriod);
    const price = plan.billingPeriod === 'yearly'
      ? `${formatCurrency(plan.priceAmount, plan.priceCurrency)} al año`
      : plan.billingPeriod === 'monthly'
        ? `${formatCurrency(plan.priceAmount, plan.priceCurrency)} al mes`
        : plan.billingPeriod === 'lifetime'
          ? `${formatCurrency(plan.priceAmount, plan.priceCurrency)} · pago único`
        : 'Gratis';
    const features = plan.features.length
      ? `<ul>${plan.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}</ul>`
      : '<ul><li>Ingresos y gastos</li><li>Resumen financiero</li><li>Una meta de ahorro</li></ul>';
    return `
      <article class="plan-card${plan.billingPeriod === currentSubscription?.billingPeriod ? ' current' : ''}">
        <h3>${escapeHtml(plan.name)}</h3>
        <strong>${price}</strong>
        <p>${escapeHtml(plan.description)}</p>
        ${features}
        ${paid && plan.trialDays > 0 ? `<small class="plan-trial">Prueba gratuita de ${plan.trialDays} días</small>` : ''}
        ${paid ? `<button class="button button-primary wide" type="button" data-plan-period="${escapeHtml(plan.billingPeriod)}" ${hasPendingPlanRequest ? 'disabled' : ''}>${hasPendingPlanRequest ? pendingPlanGateway === 'mercado_pago' ? 'Pago pendiente' : 'Pago en revisión' : 'Elegir plan'}</button>` : ''}
      </article>
    `;
  }).join('');
}

function handlePlanCardClick(event) {
  const button = event.target.closest('[data-plan-period]');
  if (!button || hasPendingPlanRequest) return;
  const plan = subscriptionPlans.find((item) => item.billingPeriod === button.dataset.planPeriod);
  if (!plan) return;
  selectedPlanPeriod.value = plan.billingPeriod;
  document.getElementById('selectedPlanHeading').textContent =
    `Solicitar ${plan.name} · ${formatCurrency(plan.priceAmount, plan.priceCurrency)}`;
  planPaymentReferenceInput.value = '';
  planPaymentForm.hidden = false;
  renderPlanPaymentInstructions();
  planPaymentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderPlanPaymentInstructions() {
  const isLifetimePlan = selectedPlanPeriod.value === 'lifetime';
  const mercadoPagoAvailable = Boolean(paymentInstructions.mercadoPagoAvailable);
  planMercadoPagoOption.hidden = !isLifetimePlan || !mercadoPagoAvailable;
  planMercadoPagoOption.disabled = planMercadoPagoOption.hidden;
  if ((!isLifetimePlan || !mercadoPagoAvailable) && planPaymentMethodInput.value === 'mercado_pago') {
    planPaymentMethodInput.value = 'transfer';
  }
  const hasPaymentMethod = configurePaymentOptions(
    planPaymentMethodInput,
    'PEN',
    isLifetimePlan && mercadoPagoAvailable
  );
  const useMercadoPago = planPaymentMethodInput.value === 'mercado_pago';
  planPaymentInstructions.hidden = useMercadoPago;
  planPaymentReferenceField.hidden = useMercadoPago || !hasPaymentMethod;
  planPaymentReferenceInput.required = !useMercadoPago && hasPaymentMethod;
  planMercadoPagoWalletContainer.hidden = !useMercadoPago || !planMercadoPagoWalletContainer.childElementCount;
  planMercadoPagoCheckoutLink.hidden = !useMercadoPago || !planMercadoPagoCheckoutLink.getAttribute('href');
  if (!useMercadoPago) planMercadoPagoCheckoutLink.removeAttribute('href');
  const submitButton = planPaymentForm.querySelector('button[type="submit"]');
  submitButton.textContent = useMercadoPago ? 'Preparar pago con Mercado Pago' : 'Enviar solicitud';
  submitButton.disabled = !hasPaymentMethod || (hasPendingPlanRequest &&
    !(useMercadoPago && pendingPlanGateway === 'mercado_pago'));
  if (useMercadoPago) return;
  planPaymentInstructions.innerHTML = paymentMethodInstructionsMarkup(planPaymentMethodInput.value);
}

async function handlePlanPaymentSubmit(event) {
  event.preventDefault();
  const button = planPaymentForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    if (planPaymentMethodInput.value === 'mercado_pago') {
      await startPlanMercadoPagoCheckout();
      return;
    }
    const result = await apiRequest('plan-request', {
      method: 'POST',
      body: {
        billingPeriod: selectedPlanPeriod.value,
        paymentMethod: planPaymentMethodInput.value,
        paymentReference: planPaymentReferenceInput.value.trim()
      }
    });
    const status = await apiRequest('plan-status');
    currentSubscription = status.subscription;
    hasPendingPlanRequest = status.hasPendingRequest;
    pendingPlanGateway = status.pendingGateway;
    planPaymentForm.hidden = true;
    renderPlans();
    showAppNotice(result.message);
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    if (!planPaymentForm.hidden) renderPlanPaymentInstructions();
  }
}

async function startPlanMercadoPagoCheckout() {
  const checkout = await apiRequest('plan-checkout', {
    method: 'POST',
    body: { billingPeriod: selectedPlanPeriod.value }
  });
  pendingPlanGateway = 'mercado_pago';
  hasPendingPlanRequest = true;
  const mounted = await mountMercadoPagoWallet(
    checkout,
    planMercadoPagoWalletContainer,
    planMercadoPagoCheckoutLink
  );
  showAppNotice(mounted
    ? 'Completa el pago desde el botón seguro de Mercado Pago.'
    : 'No se pudo cargar el botón de Mercado Pago. Usa el enlace seguro para continuar.', !mounted);
  renderPlanPaymentInstructions();
  renderPlans();
}

async function resumePlanMercadoPagoCheckout() {
  selectedPlanPeriod.value = 'lifetime';
  document.getElementById('selectedPlanHeading').textContent = 'Completar activación de por vida';
  planPaymentMethodInput.value = 'mercado_pago';
  planPaymentForm.hidden = false;
  renderPlanPaymentInstructions();
  try {
    await startPlanMercadoPagoCheckout();
    planPaymentForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (error) {
    showAppNotice(error.message, true);
  }
}

async function handleEmergencyFundSubmit(event) {
  event.preventDefault();
  const button = emergencyFundForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('emergency-fund', {
      method: 'PUT',
      body: {
        target: Number(emergencyTargetInput.value),
        current: Number(emergencyCurrentInput.value)
      }
    });
    emergencyFund = result.fund;
    render();
    showAppNotice('Fondo de emergencia actualizado.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

function handlePaymentCalendarClick(event) {
  const dayButton = event.target.closest('[data-payment-date]');
  if (!dayButton) return;
  selectedPaymentDate = dayButton.dataset.paymentDate;
  renderPaymentCalendar();
}

function changePaymentCalendarMonth(offset) {
  paymentCalendarMonth = new Date(
    paymentCalendarMonth.getFullYear(),
    paymentCalendarMonth.getMonth() + offset,
    1
  );
  selectedPaymentDate = localDateString(paymentCalendarMonth);
  renderPaymentCalendar();
}

function localDateString(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function projectedPaymentDates(payment, monthStart, monthEnd) {
  const anchor = parseLocalDate(payment.dueDate);
  let date = new Date(anchor);
  const dates = [];
  for (let count = 0; count < 120 && date <= monthEnd; count += 1) {
    if (date >= monthStart) {
      dates.push(localDateString(date));
    }
    if (payment.recurrence === 'once') break;
    if (payment.recurrence === 'monthly') {
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      date = new Date(
        nextMonth.getFullYear(),
        nextMonth.getMonth(),
        Math.min(anchor.getDate(), new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate())
      );
    } else {
      const nextYear = date.getFullYear() + 1;
      date = new Date(
        nextYear,
        anchor.getMonth(),
        Math.min(anchor.getDate(), new Date(nextYear, anchor.getMonth() + 1, 0).getDate())
      );
    }
  }
  return dates;
}

function renderPaymentCalendar() {
  const year = paymentCalendarMonth.getFullYear();
  const month = paymentCalendarMonth.getMonth();
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthText = paymentCalendarMonth.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
  paymentMonthLabel.textContent = monthText.charAt(0).toUpperCase() + monthText.slice(1);

  const paymentDates = new Map();
  for (const payment of paymentSchedules) {
    for (const date of projectedPaymentDates(payment, monthStart, monthEnd)) {
      const entries = paymentDates.get(date) || [];
      entries.push(payment);
      paymentDates.set(date, entries);
    }
  }

  const weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const dayCount = monthEnd.getDate();
  const cellCount = Math.ceil((leadingDays + dayCount) / 7) * 7;
  const cells = [];
  for (let index = 0; index < cellCount; index += 1) {
    const day = index - leadingDays + 1;
    if (day < 1 || day > dayCount) {
      cells.push('<span class="payment-calendar-empty" aria-hidden="true"></span>');
      continue;
    }
    const date = localDateString(new Date(year, month, day));
    const events = paymentDates.get(date) || [];
    const isSelected = date === selectedPaymentDate;
    const isToday = date === getDateString(0);
    cells.push(`
      <button class="payment-calendar-day${events.length ? ' has-payment' : ''}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}"
        type="button" data-payment-date="${date}" aria-pressed="${isSelected}" aria-label="${date}${events.length ? `, ${events.length} pago(s)` : ''}">
        <span>${day}</span>${events.length ? `<i aria-hidden="true"></i>` : ''}
      </button>
    `);
  }
  paymentCalendar.innerHTML = `
    <div class="payment-calendar-grid payment-calendar-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join('')}</div>
    <div class="payment-calendar-grid">${cells.join('')}</div>
  `;

  const selectedDateText = parseLocalDate(selectedPaymentDate)
    .toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  selectedPaymentDateLabel.textContent = `Pagos para ${selectedDateText}`;
  const selectedPayments = paymentDates.get(selectedPaymentDate) || [];
  if (!selectedPayments.length) {
    paymentsList.innerHTML = '<p class="empty-state">No hay vencimientos programados para este día.</p>';
  } else {
    paymentsList.innerHTML = selectedPayments.map((payment) => {
      const actualOccurrence = payment.dueDate === selectedPaymentDate;
      return `
        <article class="payment-item">
          <div><strong>${escapeHtml(payment.title)}</strong><span>${formatCurrency(payment.amount, payment.currency)} · ${escapeHtml(payment.category)}</span></div>
          <p>${actualOccurrence ? 'Vencimiento programado' : 'Próximo vencimiento estimado; registra el anterior para habilitarlo.'}</p>
        </article>
      `;
    }).join('');
  }

  const currentPending = paymentSchedules.filter((payment) => payment.dueDate >= getDateString(0));
  if (paymentSchedules.length && !currentPending.length) {
    paymentsList.insertAdjacentHTML('beforeend', '<p class="empty-state">Tienes pagos vencidos sin marcar. Revísalos en la lista de próximos vencimientos.</p>');
  }
  renderUpcomingPayments();
}

function renderUpcomingPayments() {
  if (!paymentSchedules.length) {
    upcomingPaymentsList.innerHTML = '<p class="empty-state">Aún no has programado pagos.</p>';
    return;
  }

  upcomingPaymentsList.innerHTML = paymentSchedules.map((payment) => {
    const due = parseLocalDate(payment.dueDate);
    const today = parseLocalDate(getDateString(0));
    const daysRemaining = Math.round((due - today) / 86400000);
    const status = daysRemaining < 0
      ? `Vencido hace ${Math.abs(daysRemaining)} día(s)`
      : daysRemaining === 0 ? 'Vence hoy' : `Vence en ${daysRemaining} día(s)`;
    const recurrence = payment.recurrence === 'monthly'
      ? 'Mensual'
      : payment.recurrence === 'yearly' ? 'Anual' : 'Una sola vez';
    return `
      <article class="payment-item upcoming-payment${daysRemaining < 0 ? ' overdue' : ''}">
        <div class="payment-item-heading">
          <div><strong>${escapeHtml(payment.title)}</strong><span>${escapeHtml(payment.category)} · ${recurrence}</span></div>
          <strong>${formatCurrency(payment.amount, payment.currency)}</strong>
        </div>
        <p>${status} · ${formatPaymentDate(payment.dueDate)}</p>
        <div class="goal-actions">
          ${featureAccess.payments ? `<button class="edit-button" type="button" data-mark-payment="${escapeHtml(payment.occurrenceId)}">Marcar pagado</button>
          <button class="goal-delete-button" type="button" data-delete-payment="${escapeHtml(payment.id)}">Eliminar</button>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function formatPaymentDate(value) {
  return parseLocalDate(value).toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

async function handlePaymentListClick(event) {
  const paidButton = event.target.closest('[data-mark-payment]');
  const deleteButton = event.target.closest('[data-delete-payment]');
  if (paidButton) {
    paidButton.disabled = true;
    try {
      const result = await apiRequest('payment-paid', {
        method: 'POST',
        body: { occurrenceId: paidButton.dataset.markPayment }
      });
      const [paymentResult, transactionResult] = await Promise.all([
        apiRequest('payments'),
        apiRequest('transactions')
      ]);
      paymentSchedules = paymentResult.payments;
      transactions = transactionResult.transactions;
      render();
      showAppNotice(result.message);
    } catch (error) {
      paidButton.disabled = false;
      showAppNotice(error.message, true);
    }
    return;
  }
  if (deleteButton) {
    if (!window.confirm('¿Eliminar este recordatorio y sus próximos vencimientos? Los gastos que ya registraste se conservarán.')) {
      return;
    }
    deleteButton.disabled = true;
    try {
      await apiRequest('payments', { method: 'DELETE', body: { id: deleteButton.dataset.deletePayment } });
      paymentSchedules = paymentSchedules.filter((payment) => payment.id !== deleteButton.dataset.deletePayment);
      renderPaymentCalendar();
      showAppNotice('Recordatorio eliminado.');
    } catch (error) {
      deleteButton.disabled = false;
      showAppNotice(error.message, true);
    }
  }
}

function render() {
  const range = getDashboardDateRange();
  dashboardPeriodLabel.textContent = range.label;
  const summary = summarizeTransactions(range);
  balanceValue.textContent = formatCurrency(summary.balance);
  incomeValue.textContent = formatCurrency(summary.income);
  expenseValue.textContent = formatCurrency(summary.expense);
  document.getElementById('incomePeriodCaption').textContent = 'Entradas registradas';
  document.getElementById('expensePeriodCaption').textContent = 'Salidas registradas';
  document.getElementById('pendingPaymentsValue').textContent = String(
    paymentSchedules.filter((payment) => payment.dueDate <= getDateString(7)).length
  );
  document.getElementById('pendingPaymentsCaption').textContent =
    `${paymentSchedules.filter((payment) => payment.dueDate < getDateString(0)).length} vencidos · próximos 7 días`;

  renderMonthlyChart(range);
  renderCategoryChart(range);
  renderCategories();
  renderBudget(buildBudgetData(), budgets);
  renderPaymentCalendar();
  renderDashboardLists();
  renderDebts();
  renderEmergencyFund();
  renderPlans();
  renderGoals();
  renderMonthOptions();
  renderTable();
  renderReports();
  updateCurrencyHistoryNotice();
}

function getReportDateRange() {
  const today = getDateString(0);
  const period = reportPeriodInput.value;
  let start = today;
  let end = today;
  let label = '';

  if (period === 'week') {
    const date = parseLocalDate(today);
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    start = localDateString(date);
    label = `Semana del ${formatDate(start)} al ${formatDate(today)}`;
  } else if (period === 'month') {
    start = `${today.slice(0, 7)}-01`;
    label = formatMonthLabel(today.slice(0, 7));
  } else if (period === 'year') {
    start = `${today.slice(0, 4)}-01-01`;
    label = `Año ${today.slice(0, 4)}`;
  } else if (period === 'all') {
    start = transactions.length
      ? transactions.reduce((earliest, transaction) => transaction.date < earliest ? transaction.date : earliest, today)
      : today;
    end = transactions.length
      ? transactions.reduce((latest, transaction) => transaction.date > latest ? transaction.date : latest, today)
      : today;
    label = 'Todo el período';
  } else {
    start = reportStartDate.value;
    end = reportEndDate.value;
    if (!start || !end || start > end) {
      return { start, end, label: 'Selecciona un rango de fechas válido', valid: false };
    }
    label = `${formatDate(start)} al ${formatDate(end)}`;
  }

  return { start, end, label, valid: true };
}

function getReportData() {
  const range = getReportDateRange();
  const search = reportSearchInput.value.trim().toLocaleLowerCase();
  const type = reportTypeInput.value;
  const category = reportCategoryInput.value;
  const filtered = range.valid
    ? transactions.filter((transaction) => {
      const description = String(transaction.description || '').toLocaleLowerCase();
      const transactionCategory = String(transaction.category || 'Otros');
      return transaction.date >= range.start && transaction.date <= range.end &&
        (transaction.baseCurrency || 'PEN') === appBaseCurrency &&
        (type === 'all' || transaction.type === type) &&
        (category === 'all' || transactionCategory === category) &&
        (!search || description.includes(search) || transactionCategory.toLocaleLowerCase().includes(search));
    })
    : [];
  const typeLabels = { all: 'Ingresos y gastos', income: 'Solo ingresos', expense: 'Solo gastos' };
  const filters = [
    typeLabels[type],
    category === 'all' ? 'Todas las categorías' : `Categoría: ${category}`,
    search ? `Búsqueda: ${search}` : 'Sin búsqueda'
  ];
  return { range, filters, transactions: filtered.sort((a, b) => b.date.localeCompare(a.date)) };
}

function renderReports() {
  const customRange = reportPeriodInput.value === 'custom';
  reportStartField.hidden = !customRange;
  reportEndField.hidden = !customRange;

  const selectedCategory = reportCategoryInput.value;
  const categoryOptions = [...new Set(transactions.map((transaction) => transaction.category || 'Otros'))]
    .sort((a, b) => a.localeCompare(b, 'es'));
  reportCategoryInput.innerHTML = '<option value="all">Todas las categorías</option>' +
    categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join('');
  reportCategoryInput.value = categoryOptions.includes(selectedCategory) ? selectedCategory : 'all';

  const { range, transactions: matching } = getReportData();
  const totals = matching.reduce((result, transaction) => {
    result[transaction.type] += transaction.amountInBaseCurrency;
    return result;
  }, { income: 0, expense: 0 });
  document.getElementById('reportIncomeValue').textContent = formatCurrency(totals.income);
  document.getElementById('reportExpenseValue').textContent = formatCurrency(totals.expense);
  document.getElementById('reportBalanceValue').textContent = formatCurrency(totals.income - totals.expense);
  document.getElementById('reportCountValue').textContent = String(matching.length);
  document.getElementById('reportResultCaption').textContent =
    `${range.label} · ${matching.length} movimiento${matching.length === 1 ? '' : 's'} en ${appBaseCurrency}`;

  const byMonth = reportGroupInput.value === 'month';
  const selectedType = reportTypeInput.value;
  document.getElementById('reportBreakdownTitle').textContent = byMonth
    ? 'Actividad por mes'
    : selectedType === 'income' ? 'Ingresos por categoría' : 'Gastos por categoría';
  renderReportBreakdown(matching, { byMonth, selectedType });

  if (!matching.length) {
    reportTableBody.innerHTML = '<tr><td colspan="5"><p class="empty-state">No hay movimientos para los filtros seleccionados.</p></td></tr>';
    return;
  }
  reportTableBody.innerHTML = matching.map((transaction) => `
    <tr>
      <td data-label="Fecha">${formatDate(transaction.date)}</td>
      <td data-label="Descripción">${escapeHtml(transaction.description)}</td>
      <td data-label="Categoría">${escapeHtml(transaction.category || 'Otros')}</td>
      <td data-label="Tipo">${transaction.type === 'income' ? 'Ingreso' : 'Gasto'}</td>
      <td data-label="Monto" class="${transaction.type === 'income' ? 'amount-income' : 'amount-expense'}">
        ${transaction.type === 'income' ? '+' : '−'}${formatCurrency(transaction.amountInBaseCurrency)}
      </td>
    </tr>
  `).join('');
}

function renderReportBreakdown(matching, { byMonth, selectedType }) {
  if (byMonth) {
    const months = new Map();
    matching.forEach((transaction) => {
      const key = transaction.date.slice(0, 7);
      const totals = months.get(key) || { income: 0, expense: 0 };
      totals[transaction.type] += transaction.amountInBaseCurrency;
      months.set(key, totals);
    });
    const entries = [...months.entries()].sort(([a], [b]) => a.localeCompare(b));
    if (!entries.length) {
      reportBreakdown.innerHTML = '<p class="empty-state">No hay datos para mostrar.</p>';
      return;
    }
    reportBreakdown.innerHTML = entries.map(([month, totals]) => `
      <article class="report-month-row">
        <strong>${escapeHtml(formatMonthLabel(month))}</strong>
        <span class="amount-income">Ingresos ${formatCurrency(totals.income)}</span>
        <span class="amount-expense">Gastos ${formatCurrency(totals.expense)}</span>
      </article>
    `).join('');
    return;
  }

  const type = selectedType === 'all' ? 'expense' : selectedType;
  const amounts = new Map();
  matching.filter((transaction) => transaction.type === type).forEach((transaction) => {
    const category = transaction.category || 'Otros';
    amounts.set(category, (amounts.get(category) || 0) + transaction.amountInBaseCurrency);
  });
  const entries = [...amounts.entries()].sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    reportBreakdown.innerHTML = '<p class="empty-state">No hay datos para mostrar con estos filtros.</p>';
    return;
  }
  const maxAmount = entries[0][1] || 1;
  reportBreakdown.innerHTML = entries.map(([category, amount]) => `
    <div class="report-category-row">
      <div class="report-category-label"><span>${escapeHtml(category)}</span><strong>${formatCurrency(amount)}</strong></div>
      <div class="report-category-track"><span class="${type === 'income' ? 'income' : 'expense'}" style="width:${Math.max((amount / maxAmount) * 100, 2)}%"></span></div>
    </div>
  `).join('');
}

function updateCurrencyHistoryNotice() {
  const historicalCurrencies = [...new Set([
    ...transactions.map((transaction) => transaction.baseCurrency || 'PEN'),
    ...goals.map((goal) => goal.currency || 'PEN')
  ]
    .filter((currency) => currency !== appBaseCurrency))];
  currencyHistoryNotice.hidden = historicalCurrencies.length === 0;
  currencyHistoryNotice.textContent = historicalCurrencies.length
    ? `La moneda principal es ${appBaseCurrency}. Los registros históricos en ${historicalCurrencies.join(', ')} conservan su valor y no se mezclan en los resúmenes actuales.`
    : '';
  currencyHistoryNotice.hidden = !currencyHistoryNotice.textContent.trim();
}

function summarizeTransactions(range) {
  let income = 0;
  let expense = 0;
  for (const transaction of transactions) {
    if (transaction.date < range.start || transaction.date > range.end ||
        (transaction.baseCurrency || 'PEN') !== appBaseCurrency) {
      continue;
    }
    if (transaction.type === 'income') {
      income += transaction.amountInBaseCurrency;
    } else {
      expense += transaction.amountInBaseCurrency;
    }
  }

  return { income, expense, balance: income - expense };
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
    if ((transaction.baseCurrency || 'PEN') === appBaseCurrency) {
      categories[category] = (categories[category] || 0) + transaction.amountInBaseCurrency;
    }
  }

  const entries = Object.entries(categories)
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);

  return entries;
}

function renderBudget(entries) {
  const expenses = new Map(entries.map((entry) => [entry.category.toLowerCase(), entry.total]));
  budgetForm.hidden = !featureAccess.budgets;
  document.getElementById('budgetUpgradeNotice').hidden = featureAccess.budgets;
  if (!budgets.length) {
    budgetList.innerHTML = `<p class="empty-state">${featureAccess.budgets
      ? 'Aún no defines límites mensuales. Agrega un presupuesto para vigilar una categoría.'
      : 'Tus presupuestos aparecerán aquí al activar el acceso de por vida.'}</p>`;
    return;
  }
  budgetList.innerHTML = budgets.map((budget) => {
    const spent = budget.currency === appBaseCurrency ? (expenses.get(budget.category.toLowerCase()) || 0) : null;
    const percent = spent === null ? 0 : Math.min((spent / budget.amount) * 100, 100);
    return `
      <article class="budget-item" data-budget-id="${escapeHtml(budget.id)}">
        <header><span>${escapeHtml(budget.category)}</span><strong>${formatCurrency(budget.amount, budget.currency)}</strong></header>
        <p>${spent === null ? `Moneda anterior: ${escapeHtml(budget.currency)}. Actualiza el límite en ${appBaseCurrency}.` : `${formatCurrency(spent)} de ${formatCurrency(budget.amount)} · ${Math.round(percent)}%`}</p>
        <div class="progress-track"><span class="progress-fill expense" style="width:${percent}%"></span></div>
        ${featureAccess.budgets ? `<button class="goal-delete-button" type="button" data-delete-budget="${escapeHtml(budget.id)}">Eliminar</button>` : ''}
      </article>
    `;
  }).join('');
}

async function handleBudgetSubmit(event) {
  event.preventDefault();
  const button = budgetForm.querySelector('button[type="submit"]');
  button.disabled = true;
  try {
    const result = await apiRequest('budgets', {
      method: 'POST',
      body: { category: budgetCategoryInput.value, amount: Number(budgetAmountInput.value) }
    });
    budgets.push(result.budget);
    budgetForm.reset();
    render();
    showAppNotice('Presupuesto mensual guardado.');
  } catch (error) {
    showAppNotice(error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function handleBudgetListClick(event) {
  const button = event.target.closest('[data-delete-budget]');
  if (!button) return;
  button.disabled = true;
  try {
    await apiRequest('budgets', { method: 'DELETE', body: { id: button.dataset.deleteBudget } });
    budgets = budgets.filter((item) => item.id !== button.dataset.deleteBudget);
    render();
    showAppNotice('Presupuesto eliminado.');
  } catch (error) {
    button.disabled = false;
    showAppNotice(error.message, true);
  }
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
  const selectedPaymentCategory = paymentCategoryInput.value;
  const allNames = [...SUGGESTED_CATEGORIES, ...categories.map((category) => category.name)]
    .filter((name, index, names) => names.findIndex((candidate) => candidate.toLowerCase() === name.toLowerCase()) === index);

  categoryInput.innerHTML = allNames
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  if (allNames.includes(selectedCategory)) {
    categoryInput.value = selectedCategory;
  }
  paymentCategoryInput.innerHTML = allNames
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  if (allNames.includes(selectedPaymentCategory)) {
    paymentCategoryInput.value = selectedPaymentCategory;
  }

  const filterValue = filterCategoryInput.value;
  filterCategoryInput.innerHTML = '<option value="all">Todas las categorías</option>' + allNames
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  filterCategoryInput.value = allNames.includes(filterValue) ? filterValue : 'all';
  const budgetCategory = budgetCategoryInput.value;
  budgetCategoryInput.innerHTML = allNames
    .filter((name) => name !== 'Ingresos')
    .map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
  if ([...budgetCategoryInput.options].some((option) => option.value === budgetCategory)) {
    budgetCategoryInput.value = budgetCategory;
  }

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
            ${row.type === 'income' ? '+' : '-'}${formatCurrency(row.amount, row.currency)}
            ${row.currency !== (row.baseCurrency || 'PEN') ? `<small>≈ ${formatCurrency(row.amountInBaseCurrency, row.baseCurrency || 'PEN')}</small>` : ''}
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
      cancelEditButton.textContent = 'Cancelar edición';
      cancelEditButton.hidden = false;
      descriptionInput.value = item.description;
      categoryInput.value = item.category;
      typeInput.value = item.type;
      formBaseCurrency = item.baseCurrency || 'PEN';
      amountInput.value = String(item.amount);
      currencyInput.value = item.currency || formBaseCurrency;
      exchangeRateInput.value = String(item.exchangeRate || 1);
      updateExchangeRateField();
      dateInput.value = item.date;
      descriptionInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function setDashboardPeriod(period) {
  if (!['week', 'month', 'year', 'all', 'range'].includes(period)) return;
  dashboardPeriod = period;
  document.querySelectorAll('[data-period]').forEach((button) => {
    button.classList.toggle('active', button.dataset.period === period);
  });
  dashboardDateRange.hidden = period !== 'range';
  render();
}

function getDashboardDateRange() {
  const today = getDateString(0);
  let start = today;
  let end = today;
  let label = '';
  if (dashboardPeriod === 'week') {
    const date = parseLocalDate(today);
    const mondayOffset = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - mondayOffset);
    start = localDateString(date);
    label = `Semana del ${formatDate(start)} al ${formatDate(today)}`;
  } else if (dashboardPeriod === 'month') {
    start = `${today.slice(0, 7)}-01`;
    label = parseLocalDate(today).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  } else if (dashboardPeriod === 'year') {
    start = `${today.slice(0, 4)}-01-01`;
    label = `Año ${today.slice(0, 4)}`;
  } else if (dashboardPeriod === 'all') {
    start = transactions.length ? transactions.reduce((min, item) => item.date < min ? item.date : min, today) : today;
    label = 'Todo el período';
  } else {
    start = dashboardStartDate.value || today;
    end = dashboardEndDate.value || today;
    label = start <= end ? `${formatDate(start)} al ${formatDate(end)}` : 'El rango de fechas no es válido';
    if (start > end) {
      return { start: today, end: today, label };
    }
  }
  return { start, end, label };
}

function renderMonthlyChart(range) {
  const start = parseLocalDate(range.start);
  const end = parseLocalDate(range.end);
  const dayCount = Math.max(1, Math.round((end - start) / 86400000) + 1);
  const groupByMonth = dayCount > 62;
  const data = new Map();
  for (const transaction of transactions) {
    if (transaction.date < range.start || transaction.date > range.end ||
        (transaction.baseCurrency || 'PEN') !== appBaseCurrency) continue;
    const date = parseLocalDate(transaction.date);
    const key = groupByMonth ? transaction.date.slice(0, 7) : transaction.date;
    const entry = data.get(key) || {
      label: groupByMonth
        ? date.toLocaleDateString('es-PE', { month: 'short', year: dayCount > 366 ? '2-digit' : undefined })
        : String(date.getDate()),
      income: 0,
      expense: 0
    };
    entry[transaction.type] += transaction.amountInBaseCurrency;
    data.set(key, entry);
  }
  const points = [];
  if (groupByMonth) {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= lastMonth && points.length < 120) {
      const key = localDateString(cursor).slice(0, 7);
      points.push(data.get(key) || {
        label: cursor.toLocaleDateString('es-PE', { month: 'short', year: dayCount > 366 ? '2-digit' : undefined }),
        income: 0,
        expense: 0
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else {
    const cursor = new Date(start);
    while (cursor <= end && points.length < 62) {
      const key = localDateString(cursor);
      points.push(data.get(key) || { label: String(cursor.getDate()), income: 0, expense: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  const maxValue = Math.max(...points.flatMap((entry) => [entry.income, entry.expense]), 1);
  monthlyChart.style.gridTemplateColumns = `repeat(${Math.max(points.length, 1)}, minmax(0, 1fr))`;
  monthlyChart.innerHTML = points.map((entry) => `
    <div class="chart-bar-group">
      <div class="chart-stack">
        <span class="bar bar-income" style="height:${entry.income ? Math.max((entry.income / maxValue) * 100, 2) : 0}%" title="Ingresos: ${formatCurrency(entry.income)}"></span>
        <span class="bar bar-expense" style="height:${entry.expense ? Math.max((entry.expense / maxValue) * 100, 2) : 0}%" title="Gastos: ${formatCurrency(entry.expense)}"></span>
      </div>
      <span class="chart-label">${escapeHtml(entry.label)}</span>
    </div>
  `).join('');
}

function renderCategoryChart(range) {
  const totals = {};
  transactions.forEach((transaction) => {
    if (transaction.date < range.start || transaction.date > range.end || transaction.type !== 'expense' ||
        (transaction.baseCurrency || 'PEN') !== appBaseCurrency) {
      return;
    }

    const category = transaction.category || 'Otros';
    totals[category] = (totals[category] || 0) + transaction.amountInBaseCurrency;
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
      <div class="donut-center">${entries.length ? formatCurrency(totalValue) : formatCurrency(0)}</div>
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
  const atFreeGoalLimit = currentUser?.role !== 'master' && !featureAccess.budgets && goals.length >= 1;
  document.getElementById('goalFormDetails').hidden = atFreeGoalLimit;
  document.getElementById('goalUpgradeNotice').hidden = !atFreeGoalLimit;
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
            <span>${formatCurrency(goal.current, goal.currency || 'PEN')} / ${formatCurrency(goal.target, goal.currency || 'PEN')}</span>
          </header>
          <div class="goal-progress">
            <div class="progress-track">
              <span class="progress-fill" style="width: ${percent}%"></span>
            </div>
          </div>
          <footer>
            <span>${Math.round(percent)}% completado</span>
            <span>${formatCurrency(remaining, goal.currency || 'PEN')} restantes</span>
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
  cancelEditButton.textContent = 'Limpiar';
  cancelEditButton.hidden = false;
  dateInput.value = getDateString(0);
  typeInput.value = 'expense';
  formBaseCurrency = appBaseCurrency;
  currencyInput.value = appBaseCurrency;
  updateExchangeRateField();
}

function updateExchangeRateField() {
  const needsExchangeRate = currencyInput.value !== formBaseCurrency;
  exchangeRateField.hidden = !needsExchangeRate;
  exchangeRateInput.required = needsExchangeRate;
  exchangeRateHint.textContent = `${formBaseCurrency} por cada unidad de ${currencyInput.value}`;
  if (!needsExchangeRate) {
    exchangeRateInput.value = '1';
  }
}

function applyBaseCurrency(currency) {
  if (!['PEN', 'USD', 'EUR'].includes(currency)) return;
  const previousBaseCurrency = appBaseCurrency;
  appBaseCurrency = currency;
  document.getElementById('baseCurrencyInput').value = appBaseCurrency;
  document.querySelectorAll('.base-currency-label').forEach((label) => {
    label.textContent = appBaseCurrency;
  });
  if (!editingTransactionId) {
    formBaseCurrency = appBaseCurrency;
    if (currencyInput.value === previousBaseCurrency) {
      currencyInput.value = appBaseCurrency;
    }
    updateExchangeRateField();
  }
  if (paymentCurrencyInput.value === previousBaseCurrency) {
    paymentCurrencyInput.value = appBaseCurrency;
  }
  updatePaymentExchangeRateField();
  render();
}

function formatCurrency(value, currency = appBaseCurrency) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency
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
