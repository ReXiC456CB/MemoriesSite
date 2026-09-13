const STORAGE_KEY = 'memory-archive-v1';
const AUTH_KEY = 'memory-auth-v1';
const THEME_KEY = 'memory-theme-v1';
const API_URL = (typeof window !== 'undefined' && window.MEMORY_API_URL) ? window.MEMORY_API_URL : '/api/memories';
const DEFAULT_USERS = [];
const THEME_SEQUENCE = ['light', 'dark'];

const sampleMemories = [
  {
    id: 'memory-1',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    title: 'Летний вечер у воды',
    date: '2024-07-11',
    location: 'Крым',
    memory: 'Это был тот вечер, когда небо постепенно становилось золотым, а все вокруг будто замедлялось. Мы сидели на берегу и говорили обо всем: о планах, о страхах, о мечтах, которые почему-то стали ближе. Я помню, как солнце уходило в воду, и казалось, что мир на секунду застыл, чтобы дать нам этот момент.',
    folderId: 'folder-travel',
    author: 'Гость',
    createdBy: 'Гость',
    updatedBy: 'Гость'
  },
  {
    id: 'memory-2',
    image: 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
    title: 'Утро после дождя',
    date: '2023-09-02',
    location: 'Москва',
    memory: 'По пути в кафе мы шли под ещё влажным воздухом, и улицы пахли свежестью. В тот день было чувство, будто после длинного периода все вдруг стало возможным. Я сделал этот кадр почти случайно, но потом он стал напоминанием о том, как важно замечать маленькие счастливые моменты.',
    folderId: 'folder-city',
    author: 'Гость',
    createdBy: 'Гость',
    updatedBy: 'Гость'
  },
  {
    id: 'memory-3',
    image: 'https://images.unsplash.com/photo-1517841905240-472988c247ac?auto=format&fit=crop&w=1200&q=80',
    title: 'Семейный ужин',
    date: '2021-12-24',
    location: 'Дом',
    memory: 'За столом было тепло и шумно — много смеха, лишнего ужина, привычных жестов, которые уже давно стали дорогими. В этот вечер я почувствовал, как быстро проходят годы, но как важно сохранять такие ритуалы: одинаковый стол, одинаковые лица, одинаковое чувство дома.',
    folderId: 'folder-family',
    author: 'Гость',
    createdBy: 'Гость',
    updatedBy: 'Гость'
  },
  {
    id: 'memory-4',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    title: 'Горный путь',
    date: '2022-06-15',
    location: 'Альпы',
    memory: 'Мы шли вверх и почти не разговаривали: только звук шагов и ветер. В какой-то момент я увидел этот взгляд на фоне гор и понял, что не нужно ничего говорить — иногда сам пейзаж передаёт то, что словами не сказать.',
    folderId: 'folder-travel',
    author: 'Гость',
    createdBy: 'Гость',
    updatedBy: 'Гость'
  }
];

const defaultFolders = [
  { id: 'folder-travel', name: 'Путешествия', icon: '', createdBy: 'Гость', updatedBy: 'Гость' },
  { id: 'folder-city', name: 'Город', icon: '', createdBy: 'Гость', updatedBy: 'Гость' },
  { id: 'folder-family', name: 'Семья', icon: '', createdBy: 'Гость', updatedBy: 'Гость' }
];

const state = {
  items: [...sampleMemories],
  folders: [{ id: 'all', name: 'Все' }, ...defaultFolders],
  users: [...DEFAULT_USERS],
  selectedId: null,
  selectedFolderId: 'all',
  auth: { username: '', displayName: '', isLoggedIn: false },
  authMode: 'login'
};

let folderDraftIcon = '';
let pendingFolderIcon = '';
let actionModalMode = null;
let pendingFolderId = null;
let pendingMemoryId = null;

const gallery = document.getElementById('gallery');
const folderList = document.getElementById('folderList');
const addFolderButton = document.getElementById('addFolderButton');
const featuredMemory = document.getElementById('featuredMemory');
const photoInput = document.getElementById('photoInput');
const uploadButton = document.getElementById('uploadButton');
const photoCount = document.getElementById('photoCount');
const memoryCount = document.getElementById('memoryCount');
const authButton = document.getElementById('authButton');
const themeToggleButton = document.getElementById('themeToggleButton');
const authModal = document.getElementById('authModal');
const authModalCloseButton = document.getElementById('authModalCloseButton');
const authUsernameInput = document.getElementById('authUsernameInput');
const authPasswordInput = document.getElementById('authPasswordInput');
const authMessage = document.getElementById('authMessage');
const authModalTitle = document.getElementById('authModalTitle');
const authSubmitButton = document.getElementById('authSubmitButton');
const authLogoutButton = document.getElementById('authLogoutButton');
const authToggleModeButton = document.getElementById('authToggleModeButton');

const modal = document.getElementById('memoryModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalLocation = document.getElementById('modalLocation');
const modalAuthor = document.getElementById('modalAuthor');
const memoryReadOnly = document.getElementById('memoryReadOnly');
const memoryEditor = document.getElementById('memoryEditor');
const titleInput = document.getElementById('titleInput');
const dateInput = document.getElementById('dateInput');
const locationInput = document.getElementById('locationInput');
const folderSelect = document.getElementById('folderSelect');
const memoryInput = document.getElementById('memoryInput');
const editMemoryButton = document.getElementById('editMemoryButton');
const saveMemoryButton = document.getElementById('saveMemoryButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const replaceImageButton = document.getElementById('replaceImageButton');
const replaceImageInput = document.getElementById('replaceImageInput');
const deleteMemoryButton = document.getElementById('deleteMemoryButton');
const memoryModalCloseButton = document.getElementById('memoryModalCloseButton');
const folderModal = document.getElementById('folderModal');
const folderModalCloseButton = document.getElementById('folderModalCloseButton');
const folderNameInput = document.getElementById('folderNameInput');
const folderPreviewImage = document.getElementById('folderPreviewImage');
const folderPreviewFallback = document.getElementById('folderPreviewFallback');
const folderSelectIconButton = document.getElementById('folderSelectIconButton');
const folderIconInput = document.getElementById('folderIconInput');
const folderClearIconButton = document.getElementById('folderClearIconButton');
const folderCreateSubmit = document.getElementById('folderCreateSubmit');
const folderCreateCancel = document.getElementById('folderCreateCancel');
const actionModal = document.getElementById('actionModal');
const actionModalCloseButton = document.getElementById('actionModalCloseButton');
const actionModalEyebrow = document.getElementById('actionModalEyebrow');
const actionModalTitle = document.getElementById('actionModalTitle');
const actionModalMessage = document.getElementById('actionModalMessage');
const actionInputWrap = document.getElementById('actionInputWrap');
const actionInput = document.getElementById('actionInput');
const actionConfirmButton = document.getElementById('actionConfirmButton');
const actionCancelButton = document.getElementById('actionCancelButton');
const actionIconWrap = document.getElementById('actionIconWrap');
const actionSelectIconButton = document.getElementById('actionSelectIconButton');
const actionClearIconButton = document.getElementById('actionClearIconButton');
const actionIconInput = document.getElementById('actionIconInput');

bindEvents();
init();
setupSunBackground();

function setupSunBackground() {
  const canvas = document.getElementById('sunBackground');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    const count = Math.max(70, Math.min(180, Math.floor((window.innerWidth * window.innerHeight) / 12)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.6 + 1,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
      a: Math.random() * 0.9 + 0.2
    }));
  }

  function render() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const cx = window.innerWidth * 0.5;
    const cy = window.innerHeight * 0.34;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(window.innerWidth, window.innerHeight) * 0.45);
    glow.addColorStop(0, 'rgba(255, 191, 110, 0.95)');
    glow.addColorStop(0.18, 'rgba(255, 168, 102, 0.7)');
    glow.addColorStop(0.44, 'rgba(255, 142, 82, 0.32)');
    glow.addColorStop(1, 'rgba(255, 142, 82, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle) => {
      particle.x += particle.dx;
      particle.y += particle.dy;

      if (particle.x < 0 || particle.x > window.innerWidth) particle.dx *= -1;
      if (particle.y < 0 || particle.y > window.innerHeight) particle.dy *= -1;

      const dx = particle.x - cx;
      const dy = particle.y - cy;
      const dist = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - dist / (Math.max(window.innerWidth, window.innerHeight) * 0.7));

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 201, 132, ${particle.a * (0.5 + falloff)})`;
      ctx.arc(particle.x, particle.y, particle.r + falloff * 2.2, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(render);
}

function bindEvents() {
  if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);
  if (authButton) authButton.addEventListener('click', openAuthModal);
  if (authModalCloseButton) authModalCloseButton.addEventListener('click', closeAuthModal);
  if (authToggleModeButton) authToggleModeButton.addEventListener('click', toggleAuthMode);
  if (authSubmitButton) authSubmitButton.addEventListener('click', handleAuthSubmit);
  if (authLogoutButton) authLogoutButton.addEventListener('click', handleLogout);
  if (authModal) {
    authModal.addEventListener('click', (event) => {
      if (event.target.dataset.closeAuth === 'true') closeAuthModal();
    });
  }

  uploadButton.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', handleUpload);
  addFolderButton.addEventListener('click', openFolderModal);
  folderSelectIconButton.addEventListener('click', () => folderIconInput.click());
  folderClearIconButton.addEventListener('click', () => {
    folderDraftIcon = '';
    updateFolderPreview();
  });
  folderIconInput.addEventListener('change', handleFolderIconSelection);
  folderCreateSubmit.addEventListener('click', handleCreateFolder);
  folderCreateCancel.addEventListener('click', closeFolderModal);
  if (folderModal) {
    folderModal.addEventListener('click', (event) => {
      if (event.target.dataset.closeFolder === 'true') closeFolderModal();
    });
  }
  if (actionModal) {
    actionModal.addEventListener('click', (event) => {
      if (event.target.dataset.closeAction === 'true') closeActionModal();
    });
  }
  if (actionSelectIconButton) actionSelectIconButton.addEventListener('click', () => actionIconInput.click());
  if (actionClearIconButton) actionClearIconButton.addEventListener('click', () => {
    pendingFolderIcon = '';
    if (actionIconInput) actionIconInput.value = '';
  });
  if (actionIconInput) actionIconInput.addEventListener('change', handleActionIconSelection);
  if (actionConfirmButton) actionConfirmButton.addEventListener('click', handleActionConfirm);
  if (actionCancelButton) actionCancelButton.addEventListener('click', closeActionModal);
  if (actionModalCloseButton) actionModalCloseButton.addEventListener('click', closeActionModal);
  if (replaceImageButton) replaceImageButton.addEventListener('click', () => replaceImageInput.click());
  if (replaceImageInput) replaceImageInput.addEventListener('change', handleReplaceImage);
  if (deleteMemoryButton) deleteMemoryButton.addEventListener('click', handleDeleteMemory);
  if (memoryModalCloseButton) memoryModalCloseButton.addEventListener('click', closeModal);
  if (folderModalCloseButton) folderModalCloseButton.addEventListener('click', closeFolderModal);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target.dataset.close === 'true') closeModal();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!actionModal.classList.contains('hidden')) {
      closeActionModal();
      return;
    }
    if (!authModal.classList.contains('hidden')) {
      closeAuthModal();
      return;
    }
    if (!folderModal.classList.contains('hidden')) {
      closeFolderModal();
      return;
    }
    if (!modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  if (editMemoryButton) {
    editMemoryButton.addEventListener('click', () => {
      if (!requireAuthForAction('редактировать воспоминание')) return;
      const item = getSelectedItem();
      if (!item) return;
      titleInput.value = item.title;
      dateInput.value = item.date || '';
      locationInput.value = item.location || '';
      folderSelect.innerHTML = ['<option value="">Без папки</option>']
        .concat(state.folders.filter((folder) => folder.id !== 'all').map((folder) => `<option value="${folder.id}">${escapeHtml(folder.name)}</option>`))
        .join('');
      folderSelect.value = item.folderId || '';
      memoryInput.value = item.memory;
      memoryEditor.classList.remove('hidden');
      memoryReadOnly.classList.add('hidden');
      editMemoryButton.classList.add('hidden');
    });
  }

  if (cancelEditButton) {
    cancelEditButton.addEventListener('click', () => {
      memoryEditor.classList.add('hidden');
      memoryReadOnly.classList.remove('hidden');
      editMemoryButton.classList.remove('hidden');
    });
  }

  if (saveMemoryButton) {
    saveMemoryButton.addEventListener('click', async () => {
      if (!requireAuthForAction('сохранять воспоминание')) return;
      const item = getSelectedItem();
      if (!item) return;
      const nextTitle = titleInput.value.trim();
      const nextDate = dateInput.value;
      const nextLocation = locationInput.value.trim();
      const nextText = memoryInput.value.trim();
      const nextFolderId = folderSelect.value || '';

      if (!nextTitle || !nextText) {
        if (!nextTitle) titleInput.focus();
        else memoryInput.focus();
        return;
      }

      item.title = nextTitle;
      item.date = nextDate || new Date().toISOString().slice(0, 10);
      item.location = nextLocation || 'Место, которое запомнилось';
      item.folderId = nextFolderId;
      item.memory = nextText;
      item.author = item.author || getCurrentUserLabel();
      item.createdBy = item.createdBy || item.author;
      item.updatedBy = getCurrentUserLabel();

      await saveArchive();
      renderGallery();
      renderModal(item.id);
      memoryEditor.classList.add('hidden');
      memoryReadOnly.classList.remove('hidden');
      editMemoryButton.classList.remove('hidden');
    });
  }
}

async function init() {
  applyTheme(readStoredTheme());
  await hydrateState();
  ensureFolders();
  renderFolderList();
  renderFeaturedMemory();
  renderGallery();
  updateCounters();
  setAuthButtonState();
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch (error) {
    return 'light';
  }
}

function applyTheme(theme) {
  const nextTheme = THEME_SEQUENCE.includes(theme) ? theme : 'light';
  document.body.dataset.theme = nextTheme;
  if (themeToggleButton) {
    themeToggleButton.textContent = nextTheme === 'dark' ? '☀' : '☾';
    themeToggleButton.setAttribute('aria-label', nextTheme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    themeToggleButton.title = nextTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
    themeToggleButton.classList.toggle('is-dark', nextTheme === 'dark');
  }
  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    // ignore storage issues in restricted contexts
  }
}

function toggleTheme() {
  const current = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
  const currentIndex = THEME_SEQUENCE.indexOf(current);
  const nextTheme = THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
  applyTheme(nextTheme);
}

async function hydrateState() {
  try {
    const payload = await fetchArchiveFromServer();
    state.items = normalizeItems(payload.items || []);
    state.folders = [{ id: 'all', name: 'Все' }, ...normalizeFolders(payload.folders || defaultFolders)];
    state.users = normalizeUsers(payload.users || DEFAULT_USERS);

    const serverSession = normalizeSession(payload.session || {});
    const activeUser = serverSession.isLoggedIn && serverSession.username
      ? state.users.find((user) => user.username === serverSession.username.toLowerCase())
      : null;

    if (activeUser) {
      state.auth = {
        username: activeUser.username,
        displayName: activeUser.displayName || activeUser.username,
        isLoggedIn: true
      };
    } else {
      const savedAuth = normalizeSession(readLocalSession());
      const localUser = savedAuth.isLoggedIn && savedAuth.username
        ? state.users.find((user) => user.username === savedAuth.username.toLowerCase())
        : null;

      state.auth = localUser
        ? {
            username: localUser.username,
            displayName: localUser.displayName || localUser.username,
            isLoggedIn: true
          }
        : { username: '', displayName: '', isLoggedIn: false };
    }

    syncCanonicalStorage(payload);
    return;
  } catch (error) {
    console.warn('Server unavailable; using local fallback.', error);
  }

  const raw = readLocalArchive();
  if (raw) {
    state.items = normalizeItems(raw.items || []);
    state.folders = [{ id: 'all', name: 'Все' }, ...normalizeFolders(raw.folders || defaultFolders)];
    state.users = normalizeUsers(raw.users || DEFAULT_USERS);
    const session = normalizeSession(raw.session || readLocalSession());
    state.auth = session.isLoggedIn && session.username
      ? {
          username: session.username.toLowerCase(),
          displayName: session.displayName || session.username,
          isLoggedIn: true
        }
      : { username: '', displayName: '', isLoggedIn: false };
    persistSession();
    return;
  }

  state.items = normalizeItems(sampleMemories);
  state.folders = [{ id: 'all', name: 'Все' }, ...normalizeFolders(defaultFolders)];
  state.users = normalizeUsers(DEFAULT_USERS);
  state.auth = { username: '', displayName: '', isLoggedIn: false };
  persistSession();
  await saveArchive();
}

function readLocalArchive() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Could not read archive from local storage.', error);
    return null;
  }
}

function readLocalSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return { username: '', displayName: '', isLoggedIn: false };
    return normalizeSession(JSON.parse(raw));
  } catch (error) {
    return { username: '', displayName: '', isLoggedIn: false };
  }
}

function persistSession() {
  const nextSession = {
    username: state.auth.username || '',
    displayName: state.auth.displayName || state.auth.username || '',
    isLoggedIn: Boolean(state.auth.isLoggedIn)
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(nextSession));
}

function syncCanonicalStorage(payload) {
  const canonical = {
    version: 1,
    items: normalizeItems(payload.items || []),
    folders: normalizeFolders(payload.folders || []),
    users: normalizeUsers(payload.users || []),
    session: normalizeSession(payload.session || {}),
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(canonical));
  persistSession();
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const author = String(item?.author || item?.createdBy || item?.updatedBy || 'Гость').trim() || 'Гость';
    return {
      id: item.id || `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      image: item.image || '',
      title: item.title || 'Новый момент',
      date: item.date || new Date().toISOString().slice(0, 10),
      location: item.location || 'Место, которое запомнилось',
      memory: item.memory || 'Добавьте описание этого момента.',
      folderId: item.folderId || '',
      author,
      createdBy: String(item?.createdBy || author).trim() || author,
      updatedBy: String(item?.updatedBy || author).trim() || author
    };
  });
}

function normalizeFolders(folders) {
  if (!Array.isArray(folders)) return [...defaultFolders];
  return folders
    .filter((folder) => folder && typeof folder === 'object' && folder.id)
    .map((folder) => ({
      id: String(folder.id),
      name: String(folder.name || 'Новая папка').trim() || 'Новая папка',
      icon: typeof folder.icon === 'string' ? folder.icon : '',
      createdBy: String(folder.createdBy || folder.author || 'Гость').trim() || 'Гость',
      updatedBy: String(folder.updatedBy || folder.createdBy || 'Гость').trim() || 'Гость'
    }));
}

function normalizeUsers(users) {
  if (!Array.isArray(users)) return [...DEFAULT_USERS];
  return users
    .filter((user) => user && typeof user === 'object' && user.username)
    .map((user) => ({
      username: String(user.username).trim().toLowerCase(),
      password: String(user.password || '').trim(),
      displayName: String(user.displayName || user.username || 'Пользователь').trim() || String(user.username)
    }))
    .filter((user) => user.username && user.password && user.username !== 'demo');
}

function normalizeSession(session) {
  if (!session || typeof session !== 'object') {
    return { username: '', displayName: '', isLoggedIn: false };
  }
  const username = String(session.username || '').trim();
  const normalizedUsername = username.toLowerCase();
  return {
    username: normalizedUsername === 'demo' ? '' : username,
    displayName: normalizedUsername === 'demo' ? '' : String(session.displayName || username || '').trim(),
    isLoggedIn: Boolean(session.isLoggedIn && username && normalizedUsername !== 'demo')
  };
}

function ensureFolders() {
  const foldersWithoutAll = state.folders.filter((folder) => folder.id !== 'all');
  const seen = new Set(foldersWithoutAll.map((folder) => folder.id));
  state.items.forEach((item) => {
    if (item.folderId && !seen.has(item.folderId)) {
      foldersWithoutAll.push({
        id: item.folderId,
        name: item.folderId.replace(/^folder-/, '').replace(/[-_]+/g, ' ') || 'Папка',
        icon: '',
        createdBy: item.createdBy || 'Гость',
        updatedBy: item.updatedBy || 'Гость'
      });
      seen.add(item.folderId);
    }
  });
  state.folders = [{ id: 'all', name: 'Все' }, ...foldersWithoutAll];
}

async function saveArchive() {
  const normalizedItems = normalizeItems(state.items);
  const normalizedFolders = normalizeFolders(state.folders.filter((folder) => folder.id !== 'all'));
  const normalizedUsers = normalizeUsers(state.users);
  state.items = normalizedItems;
  state.folders = [{ id: 'all', name: 'Все' }, ...normalizedFolders];
  state.users = normalizedUsers;

  const payload = {
    items: normalizedItems,
    folders: normalizedFolders,
    users: normalizedUsers,
    session: {
      username: state.auth.username || '',
      displayName: state.auth.displayName || state.auth.username || '',
      isLoggedIn: Boolean(state.auth.isLoggedIn)
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, ...payload, updatedAt: new Date().toISOString() }));
  persistSession();

  if (state.auth.isLoggedIn && state.auth.username) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({
      username: state.auth.username,
      displayName: state.auth.displayName || state.auth.username,
      isLoggedIn: true
    }));
  }

  try {
    await fetchArchiveToServer(payload);
  } catch (error) {
    console.warn('Server save failed; archive remains saved in local storage.', error);
  }
}

async function fetchArchiveFromServer() {
  const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    folders: Array.isArray(payload?.folders) ? payload.folders : [],
    users: Array.isArray(payload?.users) ? payload.users : [],
    session: payload?.session || null
  };
}

async function fetchArchiveToServer(payload) {
  const response = await fetch(API_URL, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function getCurrentUser() {
  const username = (state.auth.username || '').trim().toLowerCase();
  if (!username) return null;
  return state.users.find((user) => user.username === username) || null;
}

function getCurrentUserLabel() {
  const user = getCurrentUser();
  return user ? user.displayName || user.username : 'Гость';
}

function setAuthButtonState() {
  const user = getCurrentUser();
  if (authButton) {
    authButton.textContent = user ? user.displayName || user.username : 'Войти';
    authButton.classList.toggle('logged-in', Boolean(user));
  }

  const loggedIn = Boolean(state.auth.isLoggedIn && state.auth.username);
  if (uploadButton) uploadButton.disabled = !loggedIn;
  if (addFolderButton) addFolderButton.disabled = !loggedIn;
  if (editMemoryButton) editMemoryButton.disabled = !loggedIn;
  if (replaceImageButton) replaceImageButton.disabled = !loggedIn;
  if (deleteMemoryButton) deleteMemoryButton.disabled = !loggedIn;

  if (loggedIn) {
    uploadButton?.classList.remove('is-locked');
    addFolderButton?.classList.remove('is-locked');
    editMemoryButton?.classList.remove('is-locked');
    replaceImageButton?.classList.remove('is-locked');
    deleteMemoryButton?.classList.remove('is-locked');
  } else {
    uploadButton?.classList.add('is-locked');
    addFolderButton?.classList.add('is-locked');
    editMemoryButton?.classList.add('is-locked');
    replaceImageButton?.classList.add('is-locked');
    deleteMemoryButton?.classList.add('is-locked');
  }
}

function requireAuthForAction(actionLabel = 'Это действие') {
  if (!state.auth.isLoggedIn || !state.auth.username) {
    openAuthModal();
    return false;
  }
  return true;
}

function renderAuthModalState() {
  const isLoggedIn = Boolean(state.auth.isLoggedIn && state.auth.username);
  const usernameField = authUsernameInput.closest('.field-group');
  const passwordField = authPasswordInput.closest('.field-group');

  authUsernameInput.classList.toggle('hidden', isLoggedIn);
  authPasswordInput.classList.toggle('hidden', isLoggedIn);
  if (usernameField) usernameField.classList.toggle('hidden', isLoggedIn);
  if (passwordField) passwordField.classList.toggle('hidden', isLoggedIn);

  authSubmitButton.classList.toggle('hidden', isLoggedIn);
  authLogoutButton.classList.toggle('hidden', !isLoggedIn);
  authToggleModeButton.classList.toggle('hidden', isLoggedIn);

  if (isLoggedIn) {
    authModalTitle.textContent = 'Аккаунт';
    authMessage.textContent = `Вы вошли как ${state.auth.displayName || state.auth.username}.`;
    authMessage.classList.remove('error');
    authMessage.classList.add('success');
    return;
  }

  const isRegister = state.authMode === 'register';
  authModalTitle.textContent = isRegister ? 'Создать аккаунт' : 'Войти';
  authSubmitButton.textContent = isRegister ? 'Создать' : 'Войти';
  authToggleModeButton.textContent = isRegister ? 'Уже есть аккаунт' : 'Создать аккаунт';
  authMessage.textContent = '';
  authMessage.classList.remove('error', 'success');
}

async function openAuthModal() {
  if (state.auth.isLoggedIn) {
    authUsernameInput.value = '';
    authPasswordInput.value = '';
    renderAuthModalState();
    authModal.classList.remove('hidden');
    authModal.setAttribute('aria-hidden', 'false');
    return;
  }

  state.authMode = 'login';
  authUsernameInput.value = '';
  authPasswordInput.value = '';
  setAuthMessage('', '');
  renderAuthModalState();
  authModal.classList.remove('hidden');
  authModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => authUsernameInput.focus(), 60);
}

function closeAuthModal() {
  authModal.classList.add('hidden');
  authModal.setAttribute('aria-hidden', 'true');
  authUsernameInput.value = '';
  authPasswordInput.value = '';
  state.authMode = 'login';
  renderAuthModalState();
  setAuthMessage('', '');
}

function toggleAuthMode() {
  if (state.auth.isLoggedIn) return;
  state.authMode = state.authMode === 'login' ? 'register' : 'login';
  renderAuthModalState();
}

async function handleLogout() {
  state.auth = { username: '', displayName: '', isLoggedIn: false };
  state.authMode = 'login';
  authUsernameInput.value = '';
  authPasswordInput.value = '';
  await saveArchive();
  persistSession();
  setAuthButtonState();
  closeAuthModal();
}

function setAuthMessage(message, type = '') {
  authMessage.textContent = message;
  authMessage.classList.remove('error', 'success');
  if (type) authMessage.classList.add(type);
}

async function handleAuthSubmit() {
  const username = authUsernameInput.value.trim();
  const password = authPasswordInput.value.trim();
  if (!username || !password) {
    setAuthMessage('Введите логин и пароль.', 'error');
    return;
  }

  const normalizedUsername = username.toLowerCase();
  if (state.authMode === 'register') {
    if (state.users.some((user) => user.username === normalizedUsername)) {
      setAuthMessage('Пользователь с таким логином уже есть.', 'error');
      return;
    }
    state.users.push({
      username: normalizedUsername,
      password,
      displayName: username
    });
    state.auth = { username: normalizedUsername, displayName: username, isLoggedIn: true };
    await saveArchive();
    setAuthButtonState();
    closeAuthModal();
    return;
  }

  const foundUser = state.users.find((user) => user.username === normalizedUsername);
  if (!foundUser || foundUser.password !== password) {
    setAuthMessage('Неверный логин или пароль.', 'error');
    return;
  }

  state.auth = {
    username: foundUser.username,
    displayName: foundUser.displayName || foundUser.username,
    isLoggedIn: true
  };
  await saveArchive();
  setAuthButtonState();
  closeAuthModal();
}

function openFolderModal() {
  if (!requireAuthForAction('создавать папку')) return;
  folderNameInput.value = '';
  folderDraftIcon = '';
  updateFolderPreview();
  folderModal.classList.remove('hidden');
  folderModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => folderNameInput.focus(), 60);
}

function closeFolderModal() {
  folderModal.classList.add('hidden');
  folderModal.setAttribute('aria-hidden', 'true');
  folderNameInput.value = '';
  folderDraftIcon = '';
  folderIconInput.value = '';
  updateFolderPreview();
}

function updateFolderPreview() {
  const previewSource = folderDraftIcon || getFolderPreviewImage(state.selectedFolderId !== 'all' ? state.selectedFolderId : '');
  if (previewSource) {
    folderPreviewImage.src = previewSource;
    folderPreviewImage.hidden = false;
    folderPreviewFallback.hidden = true;
  } else {
    folderPreviewImage.removeAttribute('src');
    folderPreviewImage.hidden = true;
    folderPreviewFallback.hidden = false;
  }
}

async function handleFolderIconSelection(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) {
    event.target.value = '';
    return;
  }
  folderDraftIcon = await readFileAsDataUrl(file);
  updateFolderPreview();
  event.target.value = '';
}

async function handleCreateFolder() {
  if (!requireAuthForAction('создавать папку')) return;

  const cleanName = folderNameInput.value.trim();
  if (!cleanName) {
    folderNameInput.focus();
    return;
  }

  const creator = getCurrentUserLabel();
  const id = `folder-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const nextFolder = {
    id,
    name: cleanName,
    icon: folderDraftIcon || getFolderPreviewImage(state.selectedFolderId !== 'all' ? state.selectedFolderId : '') || '',
    createdBy: creator,
    updatedBy: creator
  };

  state.folders.push(nextFolder);
  state.selectedFolderId = id;
  await saveArchive();
  renderFolderList();
  renderGallery();
  closeFolderModal();
}

function openActionModal({ eyebrow, title, message, inputMode = false, defaultValue = '', confirmLabel = 'Подтвердить', folderId = null, memoryId = null }) {
  actionModalEyebrow.textContent = eyebrow;
  actionModalTitle.textContent = title;
  actionModalMessage.textContent = message;
  actionConfirmButton.textContent = confirmLabel;
  actionModalMode = inputMode ? 'input' : 'confirm';
  pendingFolderId = folderId;
  pendingMemoryId = memoryId;
  pendingFolderIcon = folderId ? (state.folders.find((entry) => entry.id === folderId)?.icon || '') : '';

  if (inputMode) {
    actionInputWrap.classList.remove('hidden');
    actionInput.value = defaultValue;
    actionIconWrap.classList.remove('hidden');
    setTimeout(() => actionInput.focus(), 30);
  } else {
    actionInputWrap.classList.add('hidden');
    actionInput.value = '';
    actionIconWrap.classList.add('hidden');
  }

  actionModal.classList.remove('hidden');
  actionModal.setAttribute('aria-hidden', 'false');
}

function closeActionModal() {
  actionModal.classList.add('hidden');
  actionModal.setAttribute('aria-hidden', 'true');
  actionModalMode = null;
  pendingFolderId = null;
  pendingMemoryId = null;
  pendingFolderIcon = '';
  actionInput.value = '';
  actionInputWrap.classList.add('hidden');
  actionIconWrap.classList.add('hidden');
  if (actionIconInput) actionIconInput.value = '';
}

async function handleActionConfirm() {
  if (!state.auth.isLoggedIn || !state.auth.username) {
    closeActionModal();
    openAuthModal();
    return;
  }

  if (actionModalMode === 'input' && pendingFolderId) {
    const nextName = actionInput.value.trim();
    if (!nextName) {
      actionInput.focus();
      return;
    }
    const folder = state.folders.find((entry) => entry.id === pendingFolderId);
    if (folder) {
      folder.name = nextName;
      folder.icon = pendingFolderIcon || folder.icon || '';
      folder.updatedBy = getCurrentUserLabel();
      await saveArchive();
      renderFolderList();
    }
    closeActionModal();
    return;
  }

  if (pendingFolderId) {
    const folder = state.folders.find((entry) => entry.id === pendingFolderId);
    if (folder) {
      state.folders = state.folders.filter((entry) => entry.id !== pendingFolderId);
      state.items = state.items.map((item) => {
        if (item.folderId === pendingFolderId) {
          return { ...item, folderId: '', updatedBy: getCurrentUserLabel() };
        }
        return item;
      });
      state.selectedFolderId = 'all';
      await saveArchive();
      renderFolderList();
      renderGallery();
    }
    closeActionModal();
    return;
  }

  if (pendingMemoryId) {
    state.items = state.items.filter((entry) => entry.id !== pendingMemoryId);
    await saveArchive();
    renderGallery();
    closeActionModal();
    closeModal();
  }
}

function renameFolder(folderId) {
  if (!requireAuthForAction('редактировать папку')) return;
  const folder = state.folders.find((entry) => entry.id === folderId);
  if (!folder) return;
  pendingFolderIcon = folder.icon || '';
  openActionModal({
    eyebrow: 'Редактирование папки',
    title: 'Переименовать папку',
    message: `Укажите новое название и иконку для папки «${folder.name}».`,
    inputMode: true,
    defaultValue: folder.name,
    confirmLabel: 'Сохранить',
    folderId
  });
}

function deleteFolder(folderId) {
  if (!requireAuthForAction('удалять папку')) return;
  if (folderId === 'all') return;
  const folder = state.folders.find((entry) => entry.id === folderId);
  if (!folder) return;
  openActionModal({
    eyebrow: 'Удаление папки',
    title: 'Удалить папку?',
    message: `Папка «${folder.name}» будет удалена. Воспоминания из неё останутся без папки.`,
    inputMode: false,
    confirmLabel: 'Удалить',
    folderId
  });
}

async function handleDeleteMemory() {
  if (!requireAuthForAction('удалять воспоминание')) return;
  const item = getSelectedItem();
  if (!item) return;
  openActionModal({
    eyebrow: 'Удаление воспоминания',
    title: 'Удалить воспоминание?',
    message: `Воспоминание «${item.title}» будет удалено без возможности восстановления.`,
    inputMode: false,
    confirmLabel: 'Удалить',
    memoryId: item.id
  });
}

function renderFolderList() {
  folderList.innerHTML = '';

  const allButton = document.createElement('button');
  allButton.type = 'button';
  allButton.className = `folder-pill ${state.selectedFolderId === 'all' ? 'active' : ''}`;
  allButton.textContent = 'Все';
  allButton.addEventListener('click', () => {
    state.selectedFolderId = 'all';
    renderFolderList();
    renderGallery();
  });
  folderList.appendChild(allButton);

  state.folders.filter((folder) => folder.id !== 'all').forEach((folder) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'folder-pill-wrap';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `folder-pill ${state.selectedFolderId === folder.id ? 'active' : ''}`;
    button.appendChild(createFolderAvatar(folder));

    const label = document.createElement('span');
    label.textContent = folder.name;
    button.appendChild(label);

    const author = document.createElement('span');
    author.className = 'folder-author';
    author.textContent = `· ${folder.createdBy || 'Гость'}`;
    button.appendChild(author);

    button.addEventListener('click', () => {
      state.selectedFolderId = folder.id;
      renderFolderList();
      renderGallery();
    });

    const canManageFolders = Boolean(state.auth.isLoggedIn && state.auth.username);
    const renameButton = document.createElement('span');
    renameButton.className = `folder-action ${canManageFolders ? '' : 'hidden'}`;
    renameButton.textContent = '✎';
    renameButton.title = 'Переименовать папку';
    renameButton.addEventListener('click', (event) => {
      event.stopPropagation();
      renameFolder(folder.id);
    });

    const deleteButton = document.createElement('span');
    deleteButton.className = `folder-action danger ${canManageFolders ? '' : 'hidden'}`;
    deleteButton.textContent = '×';
    deleteButton.title = 'Удалить папку';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      deleteFolder(folder.id);
    });

    wrapper.appendChild(button);
    wrapper.appendChild(renameButton);
    wrapper.appendChild(deleteButton);
    folderList.appendChild(wrapper);
  });
}

function createFolderAvatar(folder) {
  const avatar = document.createElement('span');
  avatar.className = 'folder-avatar';
  const preview = getFolderPreviewImage(folder.id);
  if (preview) {
    const image = document.createElement('img');
    image.src = preview;
    image.alt = folder.name;
    avatar.appendChild(image);
    return avatar;
  }
  avatar.textContent = (folder.name || 'П').charAt(0).toUpperCase();
  return avatar;
}

function getFolderPreviewImage(folderId) {
  const folder = state.folders.find((entry) => entry.id === folderId);
  if (folder?.icon) return folder.icon;

  const latest = [...state.items]
    .filter((item) => item.folderId === folderId)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0];
  return latest?.image || '';
}

function renderFeaturedMemory() {
  if (!featuredMemory) return;
  if (!state.items.length) {
    featuredMemory.innerHTML = '<div class="featured-empty">Пока нет ни одного воспоминания.</div>';
    return;
  }

  const randomItem = shuffle([...state.items])[0];
  featuredMemory.innerHTML = `
    <div class="featured-image-wrap">
      <img src="${randomItem.image}" alt="${escapeHtml(randomItem.title)}" />
    </div>
    <div class="featured-copy">
      <p class="featured-label">Случайное воспоминание</p>
      <h3>${escapeHtml(randomItem.title)}</h3>
      <p class="featured-date">${formatDate(randomItem.date)}</p>
      <p class="featured-text">${escapeHtml(randomItem.memory.slice(0, 180))}${randomItem.memory.length > 180 ? '…' : ''}</p>
    </div>
  `;
  featuredMemory.addEventListener('click', () => openMemory(randomItem.id));
}

function renderGallery() {
  gallery.innerHTML = '';
  const visibleItems = state.selectedFolderId === 'all'
    ? [...state.items]
    : state.items.filter((item) => item.folderId === state.selectedFolderId);

  if (!visibleItems.length) {
    gallery.innerHTML = '<div class="empty-state">Пока нет ни одного воспоминания в этой папке.</div>';
    updateCounters();
    return;
  }

  shuffle([...visibleItems]).forEach((item) => {
    const card = document.createElement('article');
    card.className = 'memory-card';
    card.tabIndex = 0;
    card.dataset.id = item.id;
    card.innerHTML = `
      <img src="${item.image}" alt="${escapeHtml(item.title)}" />
      <div class="card-meta">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${formatDate(item.date)}</p>
      </div>
    `;
    card.addEventListener('click', () => openMemory(item.id));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMemory(item.id);
      }
    });
    gallery.appendChild(card);
  });

  updateCounters();
}

function openMemory(id) {
  state.selectedId = id;
  renderModal(id);
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  state.selectedId = null;
  memoryEditor.classList.add('hidden');
  memoryReadOnly.classList.remove('hidden');
  editMemoryButton.classList.remove('hidden');
}

function renderModal(id) {
  const item = state.items.find((entry) => entry.id === id);
  if (!item) return;
  modalImage.src = item.image;
  modalImage.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = formatDate(item.date);
  modalLocation.textContent = item.location || 'Момент без названия';
  modalAuthor.textContent = `Добавил: ${item.author || item.createdBy || 'неизвестно'}`;
  memoryReadOnly.textContent = item.memory;
  titleInput.value = item.title;
  dateInput.value = item.date || '';
  locationInput.value = item.location || '';
  folderSelect.innerHTML = ['<option value="">Без папки</option>']
    .concat(state.folders.filter((folder) => folder.id !== 'all').map((folder) => `<option value="${folder.id}">${escapeHtml(folder.name)}</option>`))
    .join('');
  folderSelect.value = item.folderId || '';
  memoryInput.value = item.memory;
}

async function handleUpload(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  if (!requireAuthForAction('добавлять фото')) {
    event.target.value = '';
    return;
  }

  const entries = [];
  const currentUser = getCurrentUserLabel();
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    const imageData = await readFileAsDataUrl(file);
    const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Новый момент';
    entries.push({
      id: `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      image: imageData,
      title,
      date: new Date().toISOString().slice(0, 10),
      location: 'Место, которое запомнилось',
      memory: 'Добавьте здесь описание этого момента: что происходило, кто был рядом и почему вы хотите сохранить эту фотографию.',
      folderId: state.selectedFolderId === 'all' ? '' : state.selectedFolderId,
      author: currentUser,
      createdBy: currentUser,
      updatedBy: currentUser
    });
  }

  if (!entries.length) {
    event.target.value = '';
    return;
  }

  state.items = [...entries, ...state.items];
  await saveArchive();
  renderFolderList();
  renderGallery();
  openMemory(entries[0].id);
  event.target.value = '';
}

async function handleReplaceImage(event) {
  if (!requireAuthForAction('менять фото')) {
    event.target.value = '';
    return;
  }
  const file = event.target.files?.[0];
  if (!file || !state.selectedId) return;
  const item = getSelectedItem();
  if (!item || !file.type.startsWith('image/')) {
    event.target.value = '';
    return;
  }
  item.image = await readFileAsDataUrl(file);
  item.updatedBy = getCurrentUserLabel();
  await saveArchive();
  renderGallery();
  renderModal(item.id);
  event.target.value = '';
}

async function handleActionIconSelection(event) {
  const file = event.target.files?.[0];
  if (!file || !file.type.startsWith('image/')) {
    event.target.value = '';
    return;
  }
  pendingFolderIcon = await readFileAsDataUrl(file);
  event.target.value = '';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function getSelectedItem() {
  return state.items.find((item) => item.id === state.selectedId) || null;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Без даты';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

window.addEventListener('storage', (event) => {
  if (event.key === AUTH_KEY && event.newValue) {
    try {
      const session = normalizeSession(JSON.parse(event.newValue));
      if (session.isLoggedIn && session.username) {
        const found = state.users.find((user) => user.username === session.username.toLowerCase());
        state.auth = {
          username: found ? found.username : session.username.toLowerCase(),
          displayName: found ? found.displayName : session.displayName || session.username,
          isLoggedIn: true
        };
      } else {
        state.auth = { username: '', displayName: '', isLoggedIn: false };
      }
      setAuthButtonState();
    } catch (error) {
      console.warn('Unable to sync auth session.', error);
    }
  }
});

function updateCounters() {
  if (photoCount) photoCount.textContent = String(state.items.length);
  if (memoryCount) memoryCount.textContent = String(state.items.length);
}

setAuthButtonState();
