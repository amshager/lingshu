/* js/dom.js */
export const UI = {
    // 日历相关
    calGrid: document.getElementById('cal-grid'),
    moonPhase: document.getElementById('moon-phase'),
    moonIllum: document.getElementById('moon-illum'),
    calTitleDate: document.getElementById('cal-title-year-month'),
    
    // 兼容接口
    gzBox: document.getElementById('gz-container'),
    time: document.getElementById('time-display'),
    timeDelta: document.getElementById('time-delta'), // New
    ring: document.getElementById('cw-ring'),
    deg: document.getElementById('deg-num'),
    dir: document.getElementById('dir-txt'),
    dot: document.getElementById('level-dot'),
    
    // Controls
    stepSel: document.getElementById('step-selector'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnFlow: document.getElementById('btn-toggle-flow'),
    iconPause: document.getElementById('icon-pause'),
    iconPlay: document.getElementById('icon-play'),
    btnReset: document.getElementById('btn-reset-now'),
    btnSettings: document.getElementById('btn-settings'),
    
    // Modal
    modal: document.getElementById('settings-modal'),
    inputTime: document.getElementById('set-time'),
    inputLon: document.getElementById('set-lon'),
    inputLat: document.getElementById('set-lat'),
    btnCancel: document.getElementById('btn-cancel'),
    btnConfirm: document.getElementById('btn-confirm'),
    
    // Astro
    ayanVal: document.getElementById('ayanamsa-val'),
    sunTrop: document.getElementById('sun-trop'),
    sunSid:  document.getElementById('sun-sid'),
    sunMans: document.getElementById('sun-mans'),
    sunOv:   document.getElementById('sun-ov'),
    moonTrop: document.getElementById('moon-trop'),
    moonSid:  document.getElementById('moon-sid'),
    moonMans: document.getElementById('moon-mans'),
    moonOv:   document.getElementById('moon-ov'),
    
    // Misc
    gpsDot: document.querySelector('.gps-dot'),
    gpsCoords: document.getElementById('gps-coords'),
    gpsAcc: document.getElementById('gps-accuracy'),
    modeDisplay: document.getElementById('mode-display'),
    tsTime: document.getElementById('true-solar-display'),
    // tsSub removed
    legalDate: document.getElementById('date-display'),
    legalTime: document.getElementById('time-display')
};