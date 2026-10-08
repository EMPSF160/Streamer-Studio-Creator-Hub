/**
 * APEX Streamer Studio & Creator Hub - Master State Store & Audio Engine
 */

const APEX_STORAGE_KEYS = {
  CURRENT_USER: 'apex_current_user',
  USERS: 'apex_users',
  BOOKINGS: 'apex_bookings',
  KANBAN_TASKS: 'apex_kanban_tasks',
  EQUIPMENT: 'apex_equipment',
  STUDIO_TELEMETRY: 'apex_studio_telemetry',
  CART: 'apex_gear_cart',
  THEME: 'apex_theme'
};

// Seed Users
const DEFAULT_USERS = [
  {
    id: 'usr_alex',
    name: 'Alex "Valkyrie" Mercer',
    email: 'alex.valk@creatorhub.tv',
    role: 'creator',
    roleTitle: 'Partnered Streamer & Content Lead',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    followers: '850K',
    tier: 'Elite Creator',
    channel: 'twitch.tv/valkyrie_live',
    bio: 'Twitch Partner & Tech Reviewer. Producing 4K multi-cam live shows and weekly tech teardowns.',
    verified: true,
    badges: ['Twitch Partner', '4K Broadcast Pro', 'Soundstage VIP'],
    stats: { streams: 142, hours: 620, avgViewers: '12.4K' }
  },
  {
    id: 'usr_elena',
    name: 'Elena Rostova',
    email: 'elena.dp@apexstudio.io',
    role: 'photographer',
    roleTitle: 'Director of Photography & Colorist',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    followers: '210K',
    tier: 'Studio Pro',
    channel: 'instagram.com/rostova_dp',
    bio: 'Fashion & commercial cinematographer. Mastering in 8K RAW, DaVinci Resolve & anamorphic lenses.',
    verified: true,
    badges: ['Certified Master DP', 'RED Certified', 'DaVinci Pro'],
    stats: { shoots: 94, commercials: 42, awards: 6 }
  },
  {
    id: 'usr_marcus',
    name: 'Marcus Vance',
    email: 'marcus.admin@apexstudio.io',
    role: 'admin',
    roleTitle: 'Executive Studio Producer & Admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    followers: 'Staff',
    tier: 'Studio Executive',
    channel: 'apexstudio.io/team/marcus',
    bio: 'Managing soundstages, live fiber broadcast infrastructure, and studio gear allocations.',
    verified: true,
    badges: ['Studio Admin', 'Broadcast Engineer', 'System Controller'],
    stats: { managedBookings: 1840, uptime: '99.98%' }
  }
];

// Seed Soundstages
const SOUNDSTAGES = [
  {
    id: 'stage_alpha',
    name: 'Stage Alpha: Cyberpunk & Neon Live Suite',
    category: 'live_stream',
    hourlyRate: 120,
    dailyRate: 850,
    capacity: '8-12 Persons',
    sqft: '1,400 sq ft',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80',
    tagline: 'High-energy esports, multi-cam live podcasts, and Cyberpunk broadcast aesthetic.',
    features: ['3x 4K PTZ Robotic Cams', '10Gbps Dedicated Symmetrical Fiber', 'Full DMX RGB Overhead Grid', 'Elgato 24" Prompter Array', 'ATEM Constellation 4K Switcher', 'Acoustic Wall Paneling Class A'],
    popular: true
  },
  {
    id: 'stage_beta',
    name: 'Stage Beta: Infinite White Cyclorama & Photo Studio',
    category: 'photo_video',
    hourlyRate: 140,
    dailyRate: 980,
    capacity: '15 Persons',
    sqft: '2,200 sq ft',
    image: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Seamless 30ft infinity cyclorama with overhead motorized softbox for fashion & high-key commercials.',
    features: ['30x25ft Corner Cyc Wall', 'Aputure 1200d & 600d Rigging', 'Motorized Pantograph Grid', 'Model Prep & Makeup Suite', 'Full Color Backdrop Rolls', 'Drive-in Vehicle Loading Access'],
    popular: true
  },
  {
    id: 'stage_gamma',
    name: 'Stage Gamma: Multi-mic Talk Show & Podcast Lounge',
    category: 'podcast',
    hourlyRate: 95,
    dailyRate: 650,
    capacity: '6 Persons',
    sqft: '900 sq ft',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Acoustically tuned warm lounge with mahogany finish, 4-mic podcast station, and automated 4K switching.',
    features: ['4x Shure SM7B Broadcast Mics', 'Rodecaster Pro II Audio Console', 'Blackmagic Cinema 6K Studio Cams', 'Custom LED Backlit Acoustic Slats', 'Live Audio Monitor Displays', 'Instant Multi-track SD Export'],
    popular: false
  },
  {
    id: 'stage_delta',
    name: 'Stage Delta: Virtual Production & MoCap Green Screen',
    category: 'vfx_virtual',
    hourlyRate: 180,
    dailyRate: 1250,
    capacity: '10 Persons',
    sqft: '1,800 sq ft',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Full U-curve Rosco Chroma Green stage with OptiTrack MoCap integration and real-time Unreal Engine 5 rendering.',
    features: ['OptiTrack PrimeX 13 Camera Grid', 'Zero-Spill Rosco Chroma Floor', 'Real-time Camera Tracking Rig', 'Dual RTX 4090 Rendering Nodes', 'Live Chromakey Hardware Compositing', 'Vicon Shogun Data Stream'],
    popular: false
  },
  {
    id: 'booth_epsilon',
    name: 'Booth Epsilon: Dolby Atmos Audio & Voiceover Lab',
    category: 'audio',
    hourlyRate: 85,
    dailyRate: 580,
    capacity: '3 Persons',
    sqft: '450 sq ft',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80',
    tagline: 'Floating floor WhisperRoom isolation with Neumann U87, Avalon 737 tube preamp, and Genelec 7.1.4 Atmos monitoring.',
    features: ['Neumann U87 Ai & TLM 103', 'Genelec 7.1.4 Smart Active Monitors', 'Avalon VT-737sp Vacuum Tube Preamp', 'Pro Tools Ultimate HDX Rig', 'Source-Connect Pro Ready', 'Floating Acoustic Isolation Floor'],
    popular: false
  }
];

// Seed Gear Equipment
const DEFAULT_EQUIPMENT = [
  {
    id: 'eq_red_raptor',
    name: 'RED V-Raptor 8K VV Cinema Camera',
    category: 'cameras',
    rateDay: 280,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
    specs: '8K Multi-Format Sensor | 120fps @ 8K | REDCODE RAW'
  },
  {
    id: 'eq_sony_fx6',
    name: 'Sony FX6 Full-Frame Cinema Line',
    category: 'cameras',
    rateDay: 175,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80',
    specs: '4K 120p | Dual Native ISO | Electronic Variable ND'
  },
  {
    id: 'eq_lens_gmaster',
    name: 'Sony FE 24-70mm f/2.8 GM II Lens',
    category: 'lenses',
    rateDay: 55,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80',
    specs: 'E-Mount | Extreme Aspherical Elements | Dual XD Motors'
  },
  {
    id: 'eq_lens_cooke',
    name: 'Cooke Anamorphic /i Full Frame 50mm T2.3',
    category: 'lenses',
    rateDay: 190,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1588693951525-6b5093f4124e?auto=format&fit=crop&w=600&q=80',
    specs: 'PL Mount | Classic Cooke Look | 1.8x Squeeze Factor'
  },
  {
    id: 'eq_light_aputure600',
    name: 'Aputure LS 600d Pro Daylight LED',
    category: 'lighting',
    rateDay: 75,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80',
    specs: '600W COB | Bowens Mount | Sidus Link App Control'
  },
  {
    id: 'eq_light_nanlite',
    name: 'Nanlite PavoTube II 30X RGBWW Tube (4-Light Kit)',
    category: 'lighting',
    rateDay: 65,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    specs: 'Built-in Battery | Pixel Effects | Wireless DMX'
  },
  {
    id: 'eq_audio_shure',
    name: 'Shure SM7B Broadcast Dynamic Mic + Cloudlifter',
    category: 'audio',
    rateDay: 25,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80',
    specs: 'Cardioid | Flat 50Hz-20kHz | Shielded Electromagnetic Hum'
  },
  {
    id: 'eq_stream_deck',
    name: 'Elgato Stream Deck XL + Prompter 24" Bundle',
    category: 'streaming',
    rateDay: 40,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
    specs: '32 LCD Keys | Low Latency HDMI Beam-Splitter Display'
  }
];

// Seed Bookings
const DEFAULT_BOOKINGS = [
  {
    id: 'BK-8941',
    stageId: 'stage_alpha',
    stageName: 'Stage Alpha: Cyberpunk Live Suite',
    userId: 'usr_alex',
    userName: 'Alex "Valkyrie" Mercer',
    date: '2026-10-12',
    startTime: '14:00',
    hours: 4,
    addons: ['RED V-Raptor 8K', 'Teleprompter 24"', 'Live Colorist'],
    totalPrice: 680,
    status: 'Confirmed',
    purpose: 'Apex Legends Global Series Stream & Sponsor Segment',
    notes: 'Requires dual HDMI feed to Discord and Twitch simultaneously.'
  },
  {
    id: 'BK-8942',
    stageId: 'stage_beta',
    stageName: 'Stage Beta: Infinite White Cyclorama',
    userId: 'usr_elena',
    userName: 'Elena Rostova',
    date: '2026-10-14',
    startTime: '10:00',
    hours: 6,
    addons: ['Aputure LS 600d Pro', 'Cooke Anamorphic 50mm'],
    totalPrice: 1040,
    status: 'In-Progress',
    purpose: 'Summer Fashion Lookbook & 4K Commercial Shoot',
    notes: 'Clean white cyc repainting completed.'
  },
  {
    id: 'BK-8943',
    stageId: 'stage_gamma',
    stageName: 'Stage Gamma: Multi-mic Talk Show',
    userId: 'usr_alex',
    userName: 'Alex "Valkyrie" Mercer',
    date: '2026-10-16',
    startTime: '16:00',
    hours: 2.5,
    addons: ['4x Shure SM7B', 'Rodecaster Pro II'],
    totalPrice: 285,
    status: 'Pending',
    purpose: 'Creator Economy Deep Dive Podcast Ep. 48',
    notes: 'Guest arriving via remote Riverside.fm connection.'
  }
];

// Seed Kanban Tasks
const DEFAULT_KANBAN = [
  {
    id: 'task_1',
    title: 'Cyberpunk Stream: OBS Scene Polish & Lower Thirds',
    stage: 'pre_prod',
    column: 'Pre-Production',
    assignee: 'Alex Mercer',
    priority: 'High',
    category: 'Stream Setup',
    tags: ['Motion Graphics', 'Twitch Alerts', '4K 60fps'],
    dueDate: 'Oct 11'
  },
  {
    id: 'task_2',
    title: 'Sony FX6 Multi-Cam Interview: Soundstage Alpha Booking',
    stage: 'scheduled',
    column: 'Scheduled Shoot',
    assignee: 'Elena Rostova',
    priority: 'Urgent',
    category: 'Production',
    tags: ['Stage Alpha', 'DMX Lighting', 'Shure SM7B'],
    dueDate: 'Oct 12'
  },
  {
    id: 'task_3',
    title: '4K Commercial Lookbook: Rough Cut & Multicam Sync',
    stage: 'post_prod',
    column: 'Post-Production',
    assignee: 'Marcus Vance',
    priority: 'Medium',
    category: 'Editing',
    tags: ['Premiere Pro', 'Multi-Cam Sync', 'Audio Clean'],
    dueDate: 'Oct 15'
  },
  {
    id: 'task_4',
    title: 'Anamorphic 8K Footage: DaVinci Color Grading & Film Grain',
    stage: 'color_grade',
    column: 'Color Grading & VFX',
    assignee: 'Elena Rostova',
    priority: 'High',
    category: 'Post / Color',
    tags: ['DaVinci Resolve', 'ACEScct', 'Film Print LUT'],
    dueDate: 'Oct 17'
  },
  {
    id: 'task_5',
    title: 'Studio Showcase Reel: 4K Master Render Published to YouTube',
    stage: 'published',
    column: 'Published & Live',
    assignee: 'Alex Mercer',
    priority: 'Done',
    category: 'Deliverable',
    tags: ['ProRes 422 HQ', 'YouTube 4K', 'HDR10'],
    dueDate: 'Oct 07'
  }
];

// Seed Assets
const DEFAULT_ASSETS = [
  {
    id: 'ast_1',
    title: 'Cyberpunk Neon Stinger Transition',
    category: 'video',
    format: 'WebM Alpha 4K',
    size: '14.2 MB',
    thumb: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    tags: ['Stinger', 'OBS', 'Neon']
  },
  {
    id: 'ast_2',
    title: 'Film Look Fuji 35mm Studio LUT Pack',
    category: 'luts',
    format: '.CUBE (33x33x33)',
    size: '4.8 MB',
    thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    tags: ['LUT', 'DaVinci', 'Fuji']
  },
  {
    id: 'ast_3',
    title: 'Studio Atmosphere & Lo-Fi Chill Synth Stems',
    category: 'audio',
    format: 'WAV 24-Bit / 48kHz',
    size: '88.5 MB',
    thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    tags: ['Audio Stems', 'DMCA Free', 'BGM']
  },
  {
    id: 'ast_4',
    title: 'Studio Lighting Setup High-Res Diagram',
    category: 'photo',
    format: 'RAW TIFF / PSD',
    size: '124 MB',
    thumb: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=600&q=80',
    tags: ['Lighting', 'Diagram', 'Cycc']
  },
  {
    id: 'ast_5',
    title: 'Animated Twitch Sub & Donation Alerts V2',
    category: 'overlays',
    format: 'HTML5 / CSS / WebM',
    size: '18.1 MB',
    thumb: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    tags: ['Twitch', 'Streamlabs', 'Alerts']
  }
];

class StudioStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem(APEX_STORAGE_KEYS.USERS)) {
      localStorage.setItem(APEX_STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(APEX_STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(APEX_STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    }
    if (!localStorage.getItem(APEX_STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(APEX_STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(APEX_STORAGE_KEYS.KANBAN_TASKS)) {
      localStorage.setItem(APEX_STORAGE_KEYS.KANBAN_TASKS, JSON.stringify(DEFAULT_KANBAN));
    }
    if (!localStorage.getItem(APEX_STORAGE_KEYS.EQUIPMENT)) {
      localStorage.setItem(APEX_STORAGE_KEYS.EQUIPMENT, JSON.stringify(DEFAULT_EQUIPMENT));
    }
    if (!localStorage.getItem(APEX_STORAGE_KEYS.STUDIO_TELEMETRY)) {
      const defaultTelemetry = {
        onAir: true,
        masterStageLighting: 'Cyber Neon (Indigo / Cyan)',
        tempF: 68.5,
        acMode: 'Silent Acoustic High-Flow',
        activeStageId: 'stage_alpha',
        networkSpeedMbps: 9840,
        occupiedStages: 3,
        totalStages: 5
      };
      localStorage.setItem(APEX_STORAGE_KEYS.STUDIO_TELEMETRY, JSON.stringify(defaultTelemetry));
    }
  }

  // Current User Management
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(APEX_STORAGE_KEYS.CURRENT_USER)) || DEFAULT_USERS[0];
    } catch (e) {
      return DEFAULT_USERS[0];
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(APEX_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.dispatchEvent('user_changed', user);
  }

  switchUserById(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId) || users[0];
    this.setCurrentUser(user);
    return user;
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(APEX_STORAGE_KEYS.USERS)) || DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  }

  registerUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: userData.name,
      email: userData.email,
      role: userData.role || 'creator',
      roleTitle: userData.roleTitle || 'Content Creator',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      followers: '0',
      tier: 'Standard Creator',
      channel: userData.channel || 'youtube.com/@creator',
      bio: userData.bio || 'New member at APEX Streamer Studio & Creator Hub.',
      verified: false,
      badges: ['Creator Hub Member'],
      stats: { streams: 0, hours: 0, avgViewers: '0' }
    };
    users.push(newUser);
    localStorage.setItem(APEX_STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  // Soundstages
  getStages() {
    return SOUNDSTAGES;
  }

  getStageById(id) {
    return SOUNDSTAGES.find(s => s.id === id) || SOUNDSTAGES[0];
  }

  // Bookings
  getBookings() {
    try {
      return JSON.parse(localStorage.getItem(APEX_STORAGE_KEYS.BOOKINGS)) || DEFAULT_BOOKINGS;
    } catch (e) {
      return DEFAULT_BOOKINGS;
    }
  }

  createBooking(bookingData) {
    const bookings = this.getBookings();
    const newBooking = {
      id: 'BK-' + Math.floor(1000 + Math.random() * 9000),
      stageId: bookingData.stageId,
      stageName: bookingData.stageName,
      userId: this.getCurrentUser().id,
      userName: this.getCurrentUser().name,
      date: bookingData.date,
      startTime: bookingData.startTime,
      hours: parseFloat(bookingData.hours) || 2,
      addons: bookingData.addons || [],
      totalPrice: bookingData.totalPrice,
      status: 'Confirmed',
      purpose: bookingData.purpose || 'Live Broadcast & Content Creation',
      notes: bookingData.notes || '',
      createdAt: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    localStorage.setItem(APEX_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    this.dispatchEvent('booking_created', newBooking);
    return newBooking;
  }

  updateBookingStatus(bookingId, status) {
    const bookings = this.getBookings();
    const item = bookings.find(b => b.id === bookingId);
    if (item) {
      item.status = status;
      localStorage.setItem(APEX_STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      this.dispatchEvent('booking_updated', item);
    }
    return item;
  }

  // Equipment Locker
  getEquipment() {
    try {
      return JSON.parse(localStorage.getItem(APEX_STORAGE_KEYS.EQUIPMENT)) || DEFAULT_EQUIPMENT;
    } catch (e) {
      return DEFAULT_EQUIPMENT;
    }
  }

  addEquipment(item) {
    const equipment = this.getEquipment();
    item.id = 'eq_' + Date.now().toString(36);
    equipment.unshift(item);
    localStorage.setItem(APEX_STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
    this.dispatchEvent('equipment_updated', equipment);
    return item;
  }

  updateEquipmentStatus(id, status) {
    const equipment = this.getEquipment();
    const gear = equipment.find(g => g.id === id);
    if (gear) {
      gear.status = status;
      localStorage.setItem(APEX_STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
      this.dispatchEvent('equipment_updated', equipment);
    }
    return gear;
  }

  // Kanban Tasks
  getKanbanTasks() {
    try {
      return JSON.parse(localStorage.getItem(APEX_STORAGE_KEYS.KANBAN_TASKS)) || DEFAULT_KANBAN;
    } catch (e) {
      return DEFAULT_KANBAN;
    }
  }

  addKanbanTask(task) {
    const tasks = this.getKanbanTasks();
    const newTask = {
      id: 'task_' + Date.now().toString(36),
      title: task.title,
      stage: task.stage || 'pre_prod',
      column: this.getColumnName(task.stage || 'pre_prod'),
      assignee: task.assignee || this.getCurrentUser().name,
      priority: task.priority || 'Medium',
      category: task.category || 'Production',
      tags: task.tags || ['4K 60fps'],
      dueDate: task.dueDate || 'Soon'
    };
    tasks.push(newTask);
    localStorage.setItem(APEX_STORAGE_KEYS.KANBAN_TASKS, JSON.stringify(tasks));
    this.dispatchEvent('kanban_updated', tasks);
    return newTask;
  }

  moveKanbanTask(taskId, newStage) {
    const tasks = this.getKanbanTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.stage = newStage;
      task.column = this.getColumnName(newStage);
      localStorage.setItem(APEX_STORAGE_KEYS.KANBAN_TASKS, JSON.stringify(tasks));
      this.dispatchEvent('kanban_updated', tasks);
    }
    return task;
  }

  deleteKanbanTask(taskId) {
    let tasks = this.getKanbanTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(APEX_STORAGE_KEYS.KANBAN_TASKS, JSON.stringify(tasks));
    this.dispatchEvent('kanban_updated', tasks);
  }

  getColumnName(stage) {
    const map = {
      pre_prod: 'Pre-Production',
      scheduled: 'Scheduled Shoot',
      post_prod: 'Post-Production',
      color_grade: 'Color Grading & VFX',
      published: 'Published & Live'
    };
    return map[stage] || 'Production';
  }

  // Telemetry & Studio Controls
  getTelemetry() {
    try {
      return JSON.parse(localStorage.getItem(APEX_STORAGE_KEYS.STUDIO_TELEMETRY));
    } catch (e) {
      return {};
    }
  }

  updateTelemetry(key, value) {
    const telemetry = this.getTelemetry();
    telemetry[key] = value;
    localStorage.setItem(APEX_STORAGE_KEYS.STUDIO_TELEMETRY, JSON.stringify(telemetry));
    this.dispatchEvent('telemetry_updated', telemetry);
    return telemetry;
  }

  // Assets
  getAssets() {
    return DEFAULT_ASSETS;
  }

  // Event dispatcher for reactive UI updates
  dispatchEvent(name, detail) {
    const event = new CustomEvent(`apex_${name}`, { detail });
    window.dispatchEvent(event);
  }
}

// Web Audio API Soundboard Synth Engine
class SoundboardSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playAirhorn() {
    this.init();
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Iconic airhorn fundamental chords
    osc1.frequency.setValueAtTime(466.16, t); // Bb4
    osc2.frequency.setValueAtTime(587.33, t); // D5

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
    gain.gain.setValueAtTime(0.3, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.46);
    osc2.stop(t + 0.46);

    // Staccato blast
    setTimeout(() => {
      this.playSingleHorn(0.18);
    }, 180);
  }

  playSingleHorn(dur = 0.25) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(466.16, t);
    osc2.frequency.setValueAtTime(587.33, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur + 0.01);
    osc2.stop(t + dur + 0.01);
  }

  playCheer() {
    this.init();
    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 1.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  playLevelUp() {
    this.init();
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  playBuzzer() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  playSciFiSwoop() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.4);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }
}

// Global Singletons
window.apexStore = new StudioStore();
window.apexSoundboard = new SoundboardSynth();

// Toast helper
window.showToast = function (message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item ${type}`;
  
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <div class="flex items-center gap-3">
      <span class="font-bold text-sm text-indigo-400">${iconMap[type] || 'ℹ'}</span>
      <span class="text-sm font-medium text-slate-100">${message}</span>
    </div>
  `;

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};
