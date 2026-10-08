/**
 * APEX Streamer Studio & Creator Hub - Main Interactive Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.apexStore;
  const soundboard = window.apexSoundboard;

  // Initialize UI components
  initGlobalHeader();
  initAuthSystem();
  initStageBooking();
  initLiveProductionConsole();
  initKanbanWorkflow();
  initThumbnailStudio();
  initEquipmentLocker();
  initAdminDashboard();
  initThemeAndAnimations();
});

/* ==========================================================================
   1. GLOBAL HEADER & QUICK PROFILE SWITCHER
   ========================================================================== */
function initGlobalHeader() {
  const store = window.apexStore;
  const userBtn = document.getElementById('userProfileMenuBtn');
  const userDropdown = document.getElementById('userProfileDropdown');
  const authModal = document.getElementById('authModal');
  const quickRoleBtns = document.querySelectorAll('.quick-role-switch');

  function renderUserHeader() {
    const user = store.getCurrentUser();
    const avatarEls = document.querySelectorAll('.header-user-avatar');
    const nameEls = document.querySelectorAll('.header-user-name');
    const roleEls = document.querySelectorAll('.header-user-role');
    const tierEls = document.querySelectorAll('.header-user-tier');

    avatarEls.forEach(el => {
      if (el.tagName === 'IMG') el.src = user.avatar;
    });
    nameEls.forEach(el => el.textContent = user.name);
    roleEls.forEach(el => el.textContent = user.roleTitle);
    tierEls.forEach(el => el.textContent = user.tier);

    // Update admin menu link visibility
    const adminLinks = document.querySelectorAll('.admin-nav-link');
    adminLinks.forEach(link => {
      link.style.display = (user.role === 'admin') ? 'inline-flex' : 'none';
    });
  }

  renderUserHeader();
  window.addEventListener('apex_user_changed', renderUserHeader);

  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && !userBtn.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
  }

  // Quick Switch Roles
  quickRoleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetUserId = btn.getAttribute('data-user-id');
      const user = store.switchUserById(targetUserId);
      if (userDropdown) userDropdown.classList.add('hidden');
      window.showToast(`Switched profile to ${user.name} (${user.roleTitle})`, 'info');
    });
  });
}

/* ==========================================================================
   2. AUTHENTICATION MODAL & PROFILE CONTROLLER
   ========================================================================== */
function initAuthSystem() {
  const store = window.apexStore;
  const authModal = document.getElementById('authModal');
  const openAuthBtns = document.querySelectorAll('.open-auth-modal-btn');
  const closeAuthBtns = document.querySelectorAll('.close-auth-modal-btn');
  const authTabLogin = document.getElementById('authTabLogin');
  const authTabRegister = document.getElementById('authTabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  openAuthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (authModal) authModal.classList.remove('hidden');
    });
  });

  closeAuthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (authModal) authModal.classList.add('hidden');
    });
  });

  if (authTabLogin && authTabRegister && loginForm && registerForm) {
    authTabLogin.addEventListener('click', () => {
      authTabLogin.classList.add('border-indigo-500', 'text-indigo-400');
      authTabLogin.classList.remove('border-transparent', 'text-slate-400');
      authTabRegister.classList.remove('border-indigo-500', 'text-indigo-400');
      authTabRegister.classList.add('border-transparent', 'text-slate-400');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    });

    authTabRegister.addEventListener('click', () => {
      authTabRegister.classList.add('border-indigo-500', 'text-indigo-400');
      authTabRegister.classList.remove('border-transparent', 'text-slate-400');
      authTabLogin.classList.remove('border-indigo-500', 'text-indigo-400');
      authTabLogin.classList.add('border-transparent', 'text-slate-400');
      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value.trim();
      const users = store.getUsers();
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (matched) {
        store.setCurrentUser(matched);
        if (authModal) authModal.classList.add('hidden');
        window.showToast(`Welcome back, ${matched.name}!`, 'success');
      } else {
        // Fallback default
        const user = users[0];
        store.setCurrentUser(user);
        if (authModal) authModal.classList.add('hidden');
        window.showToast(`Signed in as ${user.name}`, 'success');
      }
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('regName')?.value.trim();
      const email = document.getElementById('regEmail')?.value.trim();
      const role = document.getElementById('regRole')?.value || 'creator';
      const channel = document.getElementById('regChannel')?.value.trim();

      if (!name || !email) {
        window.showToast('Please fill in all required fields.', 'error');
        return;
      }

      const newUser = store.registerUser({
        name,
        email,
        role,
        roleTitle: role === 'creator' ? 'Streamer & Creator' : (role === 'photographer' ? 'Director of Photography' : 'Studio Member'),
        channel: channel || 'twitch.tv/newcreator'
      });

      if (authModal) authModal.classList.add('hidden');
      window.showToast(`Account created for ${newUser.name}! Welcome to APEX.`, 'success');
    });
  }
}

/* ==========================================================================
   3. STUDIO STAGE BOOKING & SCHEDULER
   ========================================================================== */
function initStageBooking() {
  const store = window.apexStore;
  const stageSelect = document.getElementById('bookingStageSelect');
  const hoursInput = document.getElementById('bookingHours');
  const dateInput = document.getElementById('bookingDate');
  const timeInput = document.getElementById('bookingTime');
  const addonCheckboxes = document.querySelectorAll('.booking-addon-checkbox');
  const totalPriceEl = document.getElementById('bookingTotalPrice');
  const bookingForm = document.getElementById('stageBookingForm');
  const bookingSummaryModal = document.getElementById('bookingSummaryModal');

  // Set default date to tomorrow
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  function calculateBookingTotal() {
    if (!stageSelect || !hoursInput || !totalPriceEl) return;
    const stageId = stageSelect.value;
    const stage = store.getStageById(stageId);
    const hours = parseFloat(hoursInput.value) || 2;
    let basePrice = stage.hourlyRate * hours;

    let addonTotal = 0;
    addonCheckboxes.forEach(cb => {
      if (cb.checked) {
        addonTotal += parseFloat(cb.getAttribute('data-price') || 0);
      }
    });

    const total = basePrice + addonTotal;
    totalPriceEl.textContent = `$${total.toFixed(0)}`;
    return total;
  }

  if (stageSelect) stageSelect.addEventListener('change', calculateBookingTotal);
  if (hoursInput) hoursInput.addEventListener('input', calculateBookingTotal);
  addonCheckboxes.forEach(cb => cb.addEventListener('change', calculateBookingTotal));

  calculateBookingTotal();

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const stageId = stageSelect.value;
      const stage = store.getStageById(stageId);
      const hours = parseFloat(hoursInput.value) || 2;
      const date = dateInput.value;
      const time = timeInput?.value || '14:00';
      const purpose = document.getElementById('bookingPurpose')?.value || 'Live Stream Production';
      
      const selectedAddons = [];
      addonCheckboxes.forEach(cb => {
        if (cb.checked) selectedAddons.push(cb.getAttribute('data-name'));
      });

      const total = calculateBookingTotal();

      const booking = store.createBooking({
        stageId,
        stageName: stage.name,
        date,
        startTime: time,
        hours,
        addons: selectedAddons,
        totalPrice: total,
        purpose
      });

      window.apexSoundboard.playLevelUp();
      window.showToast(`Soundstage reserved successfully! Ref: ${booking.id}`, 'success');

      // Populate confirmation modal if exists
      const confModal = document.getElementById('bookingConfirmationModal');
      if (confModal) {
        document.getElementById('confBookingId').textContent = booking.id;
        document.getElementById('confStageName').textContent = booking.stageName;
        document.getElementById('confDate').textContent = `${booking.date} at ${booking.startTime} (${booking.hours} hrs)`;
        document.getElementById('confTotal').textContent = `$${booking.totalPrice}`;
        confModal.classList.remove('hidden');
      }

      bookingForm.reset();
      calculateBookingTotal();
    });
  }

  // Quick book buttons on stage cards
  const quickBookButtons = document.querySelectorAll('.quick-book-stage-btn');
  quickBookButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const stageId = btn.getAttribute('data-stage-id');
      if (stageSelect) {
        stageSelect.value = stageId;
        calculateBookingTotal();
      }
      const bookingSection = document.getElementById('bookingSection');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ==========================================================================
   4. LIVE PRODUCTION CONSOLE & SWITCHER SIMULATOR
   ========================================================================== */
function initLiveProductionConsole() {
  const soundboard = window.apexSoundboard;
  
  // Scene Switcher Buttons
  const sceneBtns = document.querySelectorAll('.switcher-scene-btn');
  const previewScreen = document.getElementById('liveSwitcherScreen');
  const previewLabel = document.getElementById('liveSwitcherLabel');
  const liveTallyBadge = document.getElementById('liveTallyBadge');

  const scenes = {
    cam1: {
      label: 'CAM 1: HOST STUDIO (4K MAIN)',
      bg: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
      badge: 'LIVE // 4K 60FPS'
    },
    cam2: {
      label: 'CAM 2: DUAL GAMEPLAY & WEBCAM PIP',
      bg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
      badge: 'LIVE // DUAL PIP'
    },
    cam3: {
      label: 'CAM 3: OVERHEAD UNBOXING / TECH RIG',
      bg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      badge: 'LIVE // TOP CAM'
    },
    brb: {
      label: 'SCENE 4: INTERMISSION / BRB SCREEN',
      bg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      badge: 'STANDBY // BRB'
    }
  };

  sceneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sceneKey = btn.getAttribute('data-scene');
      sceneBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-400');
        b.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
      });

      btn.classList.add('bg-indigo-600', 'text-white', 'border-indigo-400');
      btn.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');

      if (scenes[sceneKey] && previewScreen) {
        previewScreen.style.backgroundImage = `linear-gradient(rgba(10, 12, 22, 0.4), rgba(10, 12, 22, 0.7)), url('${scenes[sceneKey].bg}')`;
        if (previewLabel) previewLabel.textContent = scenes[sceneKey].label;
        if (liveTallyBadge) liveTallyBadge.textContent = scenes[sceneKey].badge;
      }
      soundboard.playSciFiSwoop();
      window.showToast(`Switched broadcast to ${scenes[sceneKey]?.label || sceneKey}`, 'info');
    });
  });

  // Soundboard Trigger Buttons
  const sfxAirhorn = document.getElementById('sfxAirhorn');
  const sfxCheer = document.getElementById('sfxCheer');
  const sfxLevelUp = document.getElementById('sfxLevelUp');
  const sfxBuzzer = document.getElementById('sfxBuzzer');
  const sfxSwoop = document.getElementById('sfxSwoop');

  sfxAirhorn?.addEventListener('click', () => { soundboard.playAirhorn(); triggerVisualSFX('AIRHORN BLAST 📢'); });
  sfxCheer?.addEventListener('click', () => { soundboard.playCheer(); triggerVisualSFX('CROWD CHEER 👏'); });
  sfxLevelUp?.addEventListener('click', () => { soundboard.playLevelUp(); triggerVisualSFX('LEVEL UP 🎮'); });
  sfxBuzzer?.addEventListener('click', () => { soundboard.playBuzzer(); triggerVisualSFX('BUZZER 🚨'); });
  sfxSwoop?.addEventListener('click', () => { soundboard.playSciFiSwoop(); triggerVisualSFX('CYBER SWOOP ✨'); });

  function triggerVisualSFX(text) {
    const sfxBadge = document.getElementById('liveSFXBadge');
    if (sfxBadge) {
      sfxBadge.textContent = text;
      sfxBadge.classList.remove('opacity-0');
      sfxBadge.classList.add('opacity-100');
      setTimeout(() => {
        sfxBadge.classList.add('opacity-0');
      }, 1400);
    }
  }

  // Interactive Live Chat Simulator
  const chatMessagesContainer = document.getElementById('liveChatMessages');
  const chatInput = document.getElementById('liveChatInput');
  const chatSendBtn = document.getElementById('liveChatSendBtn');

  const simulatedChatters = [
    { name: 'Kira_Byte', badge: 'VIP', color: 'text-pink-400', msg: 'That lighting looks insane! What stage is this?' },
    { name: 'PixelSamurai', badge: 'SUB 12MO', color: 'text-amber-400', msg: 'Clip that 4K shot! Absolute cinema 🔥' },
    { name: 'NeonValkyrie', badge: 'MOD', color: 'text-cyan-400', msg: 'Welcome everyone! Sound is crystal clear today.' },
    { name: 'DriftKing_99', badge: '', color: 'text-emerald-400', msg: 'Are you shooting with the RED Komodo or FX6?' },
    { name: 'StudioFanatic', badge: 'SUB 3MO', color: 'text-indigo-400', msg: 'HYPERS!! Let’s goooo!' }
  ];

  function addChatMessage(author, text, badge = '', color = 'text-indigo-400') {
    if (!chatMessagesContainer) return;
    const msgEl = document.createElement('div');
    msgEl.className = 'flex items-start gap-2 text-xs py-1 border-b border-slate-800/40 animate-fade-in';
    msgEl.innerHTML = `
      ${badge ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${badge}</span>` : ''}
      <span class="font-semibold ${color}">${author}:</span>
      <span class="text-slate-300 break-words flex-1">${text}</span>
    `;
    chatMessagesContainer.appendChild(msgEl);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    // Keep chat container light
    if (chatMessagesContainer.children.length > 30) {
      chatMessagesContainer.removeChild(chatMessagesContainer.children[0]);
    }
  }

  // Auto chat interval simulator
  let chatIdx = 0;
  setInterval(() => {
    if (chatMessagesContainer && document.visibilityState === 'visible') {
      const chatter = simulatedChatters[chatIdx % simulatedChatters.length];
      addChatMessage(chatter.name, chatter.msg, chatter.badge, chatter.color);
      chatIdx++;
    }
  }, 4500);

  function sendUserChatMessage() {
    if (!chatInput) return;
    const text = chatInput.value.trim();
    if (!text) return;
    const currentUser = window.apexStore.getCurrentUser();
    addChatMessage(currentUser.name, text, 'HOST', 'text-amber-300');
    chatInput.value = '';
  }

  chatSendBtn?.addEventListener('click', sendUserChatMessage);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendUserChatMessage();
  });

  // Stream Alerts Tester
  const alertBtns = document.querySelectorAll('.trigger-alert-btn');
  const alertDisplay = document.getElementById('streamAlertOverlay');
  const alertTitle = document.getElementById('streamAlertTitle');
  const alertSubtitle = document.getElementById('streamAlertSubtitle');

  alertBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-alert-type');
      let title = '🎉 NEW SUBSCRIBER!';
      let subtitle = 'CyberKnight just subscribed for 6 Months!';

      if (type === 'superchat') {
        title = '💎 $100 SUPER CHAT!';
        subtitle = 'Alex_Tech: "Huge fan of the studio build! Keep crushing it!"';
      } else if (type === 'raid') {
        title = '⚔️ MASSIVE RAID!';
        subtitle = 'Shroud is raiding with 14,280 viewers!';
      } else if (type === 'follow') {
        title = '💜 NEW FOLLOWER!';
        subtitle = 'HyperWave_Studio joined the crew!';
      }

      if (alertDisplay && alertTitle && alertSubtitle) {
        alertTitle.textContent = title;
        alertSubtitle.textContent = subtitle;
        alertDisplay.classList.remove('hidden');
        alertDisplay.classList.add('animate-bounce');
        soundboard.playLevelUp();

        setTimeout(() => {
          alertDisplay.classList.add('hidden');
          alertDisplay.classList.remove('animate-bounce');
        }, 3200);
      }
    });
  });
}

/* ==========================================================================
   5. PRODUCTION PIPELINE & SHOT LIST KANBAN
   ========================================================================== */
function initKanbanWorkflow() {
  const store = window.apexStore;
  const kanbanBoard = document.getElementById('kanbanBoard');
  const addTaskBtn = document.getElementById('addKanbanTaskBtn');
  const taskModal = document.getElementById('kanbanTaskModal');
  const taskForm = document.getElementById('kanbanTaskForm');

  function renderKanban() {
    if (!kanbanBoard) return;
    const tasks = store.getKanbanTasks();
    const columns = {
      pre_prod: document.getElementById('col_pre_prod'),
      scheduled: document.getElementById('col_scheduled'),
      post_prod: document.getElementById('col_post_prod'),
      color_grade: document.getElementById('col_color_grade'),
      published: document.getElementById('col_published')
    };

    // Clear column task containers
    Object.keys(columns).forEach(colKey => {
      if (columns[colKey]) {
        const list = columns[colKey].querySelector('.kanban-task-list');
        const countBadge = columns[colKey].querySelector('.kanban-count-badge');
        if (list) list.innerHTML = '';
        if (countBadge) {
          const colTasks = tasks.filter(t => t.stage === colKey);
          countBadge.textContent = colTasks.length;
        }
      }
    });

    tasks.forEach(task => {
      const colEl = columns[task.stage];
      if (!colEl) return;
      const list = colEl.querySelector('.kanban-task-list');
      if (!list) return;

      const card = document.createElement('div');
      card.className = 'glass-panel p-4 rounded-xl border border-slate-700/60 hover:border-indigo-500/80 transition shadow-lg group cursor-grab mb-3';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-task-id', task.id);

      const priorityColors = {
        Urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        Medium: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        Done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };

      const pClass = priorityColors[task.priority] || priorityColors.Medium;

      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${pClass}">
            ${task.priority}
          </span>
          <span class="text-xs text-slate-400 font-mono">${task.dueDate}</span>
        </div>
        <h4 class="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-2 mb-2">
          ${task.title}
        </h4>
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${(task.tags || []).map(tag => `<span class="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">${tag}</span>`).join('')}
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
            ${task.assignee}
          </span>
          <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100">
            <button class="move-task-btn p-1 hover:text-indigo-400" title="Move Next" data-task-id="${task.id}" data-current="${task.stage}">➜</button>
            <button class="delete-task-btn p-1 hover:text-rose-400" title="Delete Task" data-task-id="${task.id}">✕</button>
          </div>
        </div>
      `;

      // Drag and Drop handlers
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
      });

      list.appendChild(card);
    });

    // Attach Next Stage & Delete listeners
    document.querySelectorAll('.move-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        const currentStage = btn.getAttribute('data-current');
        const stageOrder = ['pre_prod', 'scheduled', 'post_prod', 'color_grade', 'published'];
        const currentIdx = stageOrder.indexOf(currentStage);
        const nextStage = stageOrder[(currentIdx + 1) % stageOrder.length];

        store.moveKanbanTask(taskId, nextStage);
        renderKanban();
        window.showToast(`Task advanced to ${store.getColumnName(nextStage)}`, 'info');
      });
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.getAttribute('data-task-id');
        store.deleteKanbanTask(taskId);
        renderKanban();
        window.showToast('Task removed from pipeline.', 'warning');
      });
    });
  }

  renderKanban();
  window.addEventListener('apex_kanban_updated', renderKanban);

  // Drag over columns
  const dropColumns = document.querySelectorAll('.kanban-col-drop');
  dropColumns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('bg-indigo-900/20');
    });
    col.addEventListener('dragleave', () => {
      col.classList.remove('bg-indigo-900/20');
    });
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('bg-indigo-900/20');
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStage = col.getAttribute('data-stage-key');
      if (taskId && targetStage) {
        store.moveKanbanTask(taskId, targetStage);
        renderKanban();
        window.showToast(`Task moved to ${store.getColumnName(targetStage)}`, 'info');
      }
    });
  });

  // Add Task Modal
  addTaskBtn?.addEventListener('click', () => {
    taskModal?.classList.remove('hidden');
  });

  document.querySelectorAll('.close-kanban-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      taskModal?.classList.add('hidden');
    });
  });

  taskForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('taskTitle')?.value.trim();
    const stage = document.getElementById('taskStage')?.value || 'pre_prod';
    const priority = document.getElementById('taskPriority')?.value || 'Medium';
    const assignee = document.getElementById('taskAssignee')?.value.trim() || store.getCurrentUser().name;
    const tagInput = document.getElementById('taskTags')?.value.trim() || '4K Production';
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);

    if (!title) return;

    store.addKanbanTask({
      title,
      stage,
      priority,
      assignee,
      tags,
      dueDate: 'Oct ' + (10 + Math.floor(Math.random() * 15))
    });

    taskModal?.classList.add('hidden');
    taskForm.reset();
    renderKanban();
    window.showToast('New production shot item added!', 'success');
  });

  // Export Call Sheet
  const exportBtn = document.getElementById('exportCallSheetBtn');
  exportBtn?.addEventListener('click', () => {
    const tasks = store.getKanbanTasks();
    const currentUser = store.getCurrentUser();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>APEX Studio - Production Call Sheet & Shot List</title>
          <style>
            body { font-family: sans-serif; padding: 30px; color: #111; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .header-bar { border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <h1>APEX STREAMER STUDIO // PRODUCTION CALL SHEET</h1>
            <p>Generated by: ${currentUser.name} | Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Shot / Task Name</th>
                <th>Pipeline Stage</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Tags & Setup</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map(t => `
                <tr>
                  <td><strong>${t.title}</strong></td>
                  <td>${t.column}</td>
                  <td>${t.priority}</td>
                  <td>${t.assignee}</td>
                  <td>${(t.tags || []).join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  });
}

/* ==========================================================================
   6. IN-BROWSER THUMBNAIL STUDIO & ASSET VAULT
   ========================================================================== */
function initThumbnailStudio() {
  const canvas = document.getElementById('thumbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const mainTextInput = document.getElementById('thumbMainText');
  const subTextInput = document.getElementById('thumbSubText');
  const bgPresetSelect = document.getElementById('thumbBgPreset');
  const badgeSelect = document.getElementById('thumbBadge');
  const downloadBtn = document.getElementById('downloadThumbBtn');

  function renderThumbnail() {
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    const bg = bgPresetSelect ? bgPresetSelect.value : 'cyber';
    const mainText = mainTextInput ? (mainTextInput.value.trim() || 'EPIC 4K LIVE STREAM') : 'EPIC 4K LIVE STREAM';
    const subText = subTextInput ? (subTextInput.value.trim() || 'STREAMER STUDIO & GEAR TOUR') : 'STREAMER STUDIO & GEAR TOUR';
    const badge = badgeSelect ? badgeSelect.value : 'LIVE';

    // 1. Draw Background Gradient
    if (bg === 'cyber') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#312e81');
      grad.addColorStop(1, '#0e7490');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bg === 'neon_red') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#450a0a');
      grad.addColorStop(0.6, '#991b1b');
      grad.addColorStop(1, '#7c2d12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bg === 'studio_gold') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.5, '#78350f');
      grad.addColorStop(1, '#d97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = '#090a0f';
      ctx.fillRect(0, 0, width, height);
    }

    // Grid / Tech Accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Outer Glow Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 8;
    ctx.strokeRect(16, 16, width - 32, height - 32);

    // 2. Draw Badge
    if (badge && badge !== 'none') {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.roundRect(60, 60, 160, 50, 8);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`● ${badge}`, 140, 85);
      ctx.restore();
    }

    // 3. Draw Main Heading
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 68px "Outfit", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;
    ctx.fillText(mainText.toUpperCase(), 60, 420);

    // Main text accent stroke
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeText(mainText.toUpperCase(), 60, 420);
    ctx.restore();

    // 4. Draw Sub Text
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 36px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 15;
    ctx.fillText(subText.toUpperCase(), 60, 490);
    ctx.restore();

    // 5. Studio Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillText('APEX STUDIO // 4K BROADCAST MASTER', 60, 650);
  }

  renderThumbnail();

  if (mainTextInput) mainTextInput.addEventListener('input', renderThumbnail);
  if (subTextInput) subTextInput.addEventListener('input', renderThumbnail);
  if (bgPresetSelect) bgPresetSelect.addEventListener('change', renderThumbnail);
  if (badgeSelect) badgeSelect.addEventListener('change', renderThumbnail);

  downloadBtn?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `APEX-Thumbnail-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    window.showToast('Thumbnail exported in 1280x720 HD!', 'success');
  });

  // Asset Vault Filter
  const assetFilterBtns = document.querySelectorAll('.asset-filter-btn');
  const assetCards = document.querySelectorAll('.asset-vault-card');

  assetFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      assetFilterBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-400');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-400');

      assetCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Download asset simulator
  document.querySelectorAll('.download-asset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title') || 'Asset File';
      window.showToast(`Downloading package: "${title}"...`, 'info');
      setTimeout(() => {
        window.showToast(`"${title}" downloaded successfully!`, 'success');
      }, 1000);
    });
  });
}

/* ==========================================================================
   7. EQUIPMENT LOCKER & RENTAL CHECKOUT
   ========================================================================== */
function initEquipmentLocker() {
  const store = window.apexStore;
  const gearGrid = document.getElementById('gearLockerGrid');
  const filterBtns = document.querySelectorAll('.gear-category-filter');
  const cartBadge = document.getElementById('gearCartBadge');
  const cartModal = document.getElementById('gearCartModal');
  const cartItemsContainer = document.getElementById('gearCartItems');
  const cartTotalEl = document.getElementById('gearCartTotal');

  let cart = [];

  function renderGear(category = 'all') {
    if (!gearGrid) return;
    const gearList = store.getEquipment();
    gearGrid.innerHTML = '';

    const filtered = category === 'all' ? gearList : gearList.filter(g => g.category === category);

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/60 transition group flex flex-col justify-between';
      card.innerHTML = `
        <div class="relative h-48 overflow-hidden bg-slate-900">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute top-3 right-3 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-mono font-bold text-indigo-300 border border-indigo-500/30">
            $${item.rateDay}/day
          </div>
          <div class="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold uppercase text-emerald-400 border border-emerald-500/30">
            ● ${item.status}
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition">${item.name}</h4>
            <p class="mt-1 text-xs text-slate-400 line-clamp-2">${item.specs}</p>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-400 font-mono">ID: ${item.id}</span>
            <button class="add-gear-to-cart-btn px-4 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-xs font-semibold text-white transition shadow-md" data-item-id="${item.id}">
              Add to Rig +
            </button>
          </div>
        </div>
      `;
      gearGrid.appendChild(card);
    });

    // Add click handlers
    document.querySelectorAll('.add-gear-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-item-id');
        const item = gearList.find(g => g.id === itemId);
        if (item) {
          cart.push(item);
          updateCartUI();
          window.showToast(`Added ${item.name} to rental locker!`, 'success');
        }
      });
    });
  }

  function updateCartUI() {
    if (cartBadge) {
      cartBadge.textContent = cart.length;
      cartBadge.style.display = cart.length > 0 ? 'inline-flex' : 'none';
    }

    if (cartItemsContainer && cartTotalEl) {
      cartItemsContainer.innerHTML = '';
      let total = 0;

      if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-slate-400 text-sm py-4 text-center">Your equipment locker is currently empty.</p>';
      } else {
        cart.forEach((item, idx) => {
          total += item.rateDay;
          const row = document.createElement('div');
          row.className = 'flex items-center justify-between py-2 border-b border-slate-800 text-sm';
          row.innerHTML = `
            <div>
              <p class="font-medium text-slate-200">${item.name}</p>
              <span class="text-xs text-slate-400 font-mono">$${item.rateDay}/day</span>
            </div>
            <button class="remove-cart-item-btn text-rose-400 hover:text-rose-300 text-xs" data-index="${idx}">Remove</button>
          `;
          cartItemsContainer.appendChild(row);
        });
      }

      cartTotalEl.textContent = `$${total.toFixed(0)}`;

      document.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.getAttribute('data-index'));
          cart.splice(index, 1);
          updateCartUI();
        });
      });
    }
  }

  renderGear('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-category');
      filterBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-400');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-400');
      renderGear(cat);
    });
  });

  // Open Cart
  document.getElementById('openGearCartBtn')?.addEventListener('click', () => {
    cartModal?.classList.remove('hidden');
    updateCartUI();
  });

  document.getElementById('closeGearCartBtn')?.addEventListener('click', () => {
    cartModal?.classList.add('hidden');
  });

  document.getElementById('checkoutGearBtn')?.addEventListener('click', () => {
    if (cart.length === 0) {
      window.showToast('Please add items to your rental locker first.', 'warning');
      return;
    }
    const total = cart.reduce((acc, curr) => acc + curr.rateDay, 0);
    cartModal?.classList.add('hidden');
    window.apexSoundboard.playLevelUp();
    window.showToast(`Locker reservation placed! Total: $${total}/day`, 'success');
    cart = [];
    updateCartUI();
  });
}

/* ==========================================================================
   8. ADMIN MANAGEMENT & TELEMETRY DASHBOARD
   ========================================================================== */
function initAdminDashboard() {
  const store = window.apexStore;
  const bookingsTableBody = document.getElementById('adminBookingsTableBody');
  const lightingSelect = document.getElementById('adminLightingPreset');
  const onAirToggle = document.getElementById('adminOnAirToggle');
  const acTempInput = document.getElementById('adminAcTemp');
  const acTempDisplay = document.getElementById('adminAcTempDisplay');

  function renderAdminBookings() {
    if (!bookingsTableBody) return;
    const bookings = store.getBookings();
    bookingsTableBody.innerHTML = '';

    bookings.forEach(b => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/80 hover:bg-slate-800/30 text-xs';

      const statusColors = {
        Confirmed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        'In-Progress': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        Cancelled: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      };

      const sBadge = statusColors[b.status] || statusColors.Pending;

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono font-bold text-indigo-400">${b.id}</td>
        <td class="py-3 px-4 font-semibold text-slate-200">${b.stageName}</td>
        <td class="py-3 px-4 text-slate-300">${b.userName}</td>
        <td class="py-3 px-4 text-slate-400 font-mono">${b.date} (${b.startTime})</td>
        <td class="py-3 px-4 font-mono font-bold text-slate-100">$${b.totalPrice}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sBadge}">
            ${b.status}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <div class="inline-flex items-center gap-1.5">
            <button class="admin-status-btn px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-600 text-[10px] font-bold text-white transition" data-id="${b.id}" data-status="Confirmed">Approve</button>
            <button class="admin-status-btn px-2 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-[10px] font-bold text-white transition" data-id="${b.id}" data-status="In-Progress">Check-In</button>
            <button class="admin-status-btn px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-[10px] font-bold text-white transition" data-id="${b.id}" data-status="Cancelled">Cancel</button>
          </div>
        </td>
      `;
      bookingsTableBody.appendChild(tr);
    });

    document.querySelectorAll('.admin-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const status = btn.getAttribute('data-status');
        store.updateBookingStatus(id, status);
        renderAdminBookings();
        window.showToast(`Booking ${id} status set to ${status}.`, 'info');
      });
    });
  }

  renderAdminBookings();
  window.addEventListener('apex_booking_created', renderAdminBookings);
  window.addEventListener('apex_booking_updated', renderAdminBookings);

  // Studio Telemetry Smart Controls
  const telemetry = store.getTelemetry();

  if (lightingSelect) {
    lightingSelect.value = telemetry.masterStageLighting || 'Cyber Neon';
    lightingSelect.addEventListener('change', (e) => {
      store.updateTelemetry('masterStageLighting', e.target.value);
      window.showToast(`Stage lighting preset changed to: ${e.target.value}`, 'info');
    });
  }

  if (onAirToggle) {
    onAirToggle.checked = !!telemetry.onAir;
    onAirToggle.addEventListener('change', (e) => {
      store.updateTelemetry('onAir', e.target.checked);
      const badge = document.getElementById('globalLiveStatusBadge');
      if (badge) {
        badge.innerHTML = e.target.checked 
          ? '<span class="w-2 h-2 rounded-full bg-rose-500 animate-live-pulse"></span><span class="text-rose-400 font-bold">LIVE ON AIR</span>'
          : '<span class="w-2 h-2 rounded-full bg-slate-500"></span><span class="text-slate-400">STUDIO STANDBY</span>';
      }
      window.showToast(e.target.checked ? 'Master ON AIR broadcast light engaged!' : 'ON AIR broadcast light turned OFF.', 'warning');
    });
  }

  if (acTempInput && acTempDisplay) {
    acTempInput.value = telemetry.tempF || 68.5;
    acTempDisplay.textContent = `${acTempInput.value}°F`;
    acTempInput.addEventListener('input', (e) => {
      acTempDisplay.textContent = `${e.target.value}°F`;
      store.updateTelemetry('tempF', parseFloat(e.target.value));
    });
  }
}

/* ==========================================================================
   9. THEME TOGGLE, MOBILE NAVIGATION & SCROLL OBSERVER
   ========================================================================== */
function initThemeAndAnimations() {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');
  const mobileThemeIcon = document.getElementById('mobileThemeIcon');
  const mobileMenuBtn = document.getElementById('mobileMenuToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  function applyTheme(isDark) {
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (mobileThemeIcon) mobileThemeIcon.textContent = '☀️';
      localStorage.setItem('apex_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (mobileThemeIcon) mobileThemeIcon.textContent = '🌙';
      localStorage.setItem('apex_theme', 'light');
    }
  }

  const savedTheme = localStorage.getItem('apex_theme') || 'dark';
  applyTheme(savedTheme === 'dark');

  themeToggle?.addEventListener('click', () => {
    const isDark = root.classList.contains('dark');
    applyTheme(!isDark);
  });

  mobileThemeToggle?.addEventListener('click', () => {
    const isDark = root.classList.contains('dark');
    applyTheme(!isDark);
  });

  // Mobile menu
  mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('hidden');
  });

  // Scroll animations
  const targets = document.querySelectorAll('.animate-on-scroll');
  if (targets.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(t => observer.observe(t));
  }
}
