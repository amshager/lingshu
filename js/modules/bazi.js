/* js/modules/bazi.js */
import { computeGanzhi, getWuXingFromNayin } from './ganzhi.js';
import { updateCalendarView, setOnDateSelect } from './calendar.js';
import { calculateAstroData } from './astrology.js';
import { UI } from '../dom.js'; 

let state = {
    mode: 'AUTO', 
    manualDate: null, 
    lat: 39.9042, 
    lon: 116.4074
};

// 五行映射表
const WUXING_MAP = {
    '甲': 'mu', '乙': 'mu', '寅': 'mu', '卯': 'mu',
    '丙': 'huo', '丁': 'huo', '巳': 'huo', '午': 'huo',
    '戊': 'tu', '己': 'tu', '辰': 'tu', '戌': 'tu', '丑': 'tu', '未': 'tu',
    '庚': 'jin', '辛': 'jin', '申': 'jin', '酉': 'jin',
    '壬': 'shui', '癸': 'shui', '亥': 'shui', '子': 'shui'
};

function getElClass(char) {
    return WUXING_MAP[char] ? `el-${WUXING_MAP[char]}` : '';
}

// GPS 初始化
function initGPS() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                state.lat = latitude;
                state.lon = longitude;
                if(UI.gpsDot) UI.gpsDot.classList.add('active');
                if(UI.gpsCoords) UI.gpsCoords.innerText = `${longitude.toFixed(2)}E,${latitude.toFixed(2)}N`;
                if(UI.gpsAcc) UI.gpsAcc.innerText = `±${Math.round(accuracy)}m`;
                if (state.mode === 'AUTO') updateAll();
            },
            (err) => { if(UI.gpsCoords) UI.gpsCoords.innerText = "GPS OFF"; },
            { enableHighAccuracy: true }
        );
    }
}

function createPillarHTML(pillar) {
    const ganClass = getElClass(pillar.gan);
    const zhiClass = getElClass(pillar.zhi);
    const nyWx = getWuXingFromNayin(pillar.nayin); 
    const nyMap = {金:'jin',木:'mu',水:'shui',火:'huo',土:'tu'};
    const nyClass = nyWx ? `el-${nyMap[nyWx]}` : '';

    return `
        <div class="pillar-item">
            <div class="gz-char ${ganClass}">${pillar.gan}</div>
            <div class="gz-char ${zhiClass}">${pillar.zhi}</div>
            <div class="nayin-sub ${nyClass}">${pillar.nayin}</div>
        </div>
    `;
}

function updateAll() {
    let targetDate = state.mode === 'AUTO' ? new Date() : state.manualDate;

    // 0. 更新日历标题
    if (UI.calTitleDate) {
        const y = targetDate.getFullYear();
        const m = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        UI.calTitleDate.innerText = `${y}年${m}月`;
    }

    // 1. 更新法定时间 UI
    if (UI.legalTime) {
        const pad = n => n.toString().padStart(2,'0');
        UI.legalTime.innerText = `${pad(targetDate.getHours())}:${pad(targetDate.getMinutes())}:${pad(targetDate.getSeconds())}`;
    }
    
    // 2. 更新模式图标
    if (UI.modeDisplay) {
        if (state.mode === 'AUTO') {
            UI.modeDisplay.innerText = "自动";
            UI.iconPause.style.display = 'block'; UI.iconPlay.style.display = 'none';
        } else if (state.mode === 'MANUAL_PLAY') {
            UI.modeDisplay.innerText = "回放";
            UI.iconPause.style.display = 'block'; UI.iconPlay.style.display = 'none';
        } else {
            UI.modeDisplay.innerText = "暂停";
            UI.iconPause.style.display = 'none'; UI.iconPlay.style.display = 'block';
        }
    }

    // 3. 核心计算
    if (typeof Astronomy !== 'undefined') {
        
        try {
            // 时区偏移 (分钟) - 注意 JS 的 getTimezoneOffset 返回的是 "UTC - Local"，所以东八区是 -480
            // 我们需要标准的 offset，即东八区为 +480
            const jsOffset = targetDate.getTimezoneOffset();
            const tzOffset = -jsOffset; 

            const result = computeGanzhi({
                dateUTC: targetDate, 
                lat: state.lat, 
                lon: state.lon, 
                tzOffsetMinutes: tzOffset
            });

            // 显示真太阳时
            const { trueSolarClock, eotMinutes } = result.trueSolar;
            const pad = n => n.toString().padStart(2,'0');
            if(UI.tsTime) UI.tsTime.innerText = `${pad(trueSolarClock.getUTCHours())}:${pad(trueSolarClock.getUTCMinutes())}:${pad(trueSolarClock.getUTCSeconds())}`;
            
            // 计算 Delta
            // 算法: Δ = (经度 * 4) - 时区偏移 + EoT
            // 例如北京(116.4): (116.4 * 4 = 465.6) - 480 + EoT
            const lonOffset = state.lon * 4;
            const deltaMins = lonOffset - tzOffset + eotMinutes;
            const deltaSign = deltaMins >= 0 ? '+' : '';
            
            if(UI.timeDelta) UI.timeDelta.innerText = `Δ ${deltaSign}${deltaMins.toFixed(1)}m`;

            // 显示四柱
            const { year, month, day, hour } = result.pillars;
            if(UI.gzBox) {
                UI.gzBox.innerHTML = `
                    ${createPillarHTML(year)}
                    ${createPillarHTML(month)}
                    ${createPillarHTML(day)}
                    ${createPillarHTML(hour)}
                `;
            }

        } catch (e) { 
            console.error("排盘错误:", e); 
        }

        try {
            if (UI.ayanVal) {
                const astro = calculateAstroData(targetDate);
                if (astro) {
                    UI.ayanVal.innerText = `Lahiri Ayan: ${astro.ayanamsa.toFixed(4)}°`;
                    UI.sunTrop.innerText = astro.sun.trop;
                    UI.sunSid.innerText  = astro.sun.sid;
                    UI.sunMans.innerText = astro.sun.mans;
                    UI.sunOv.innerHTML   = astro.sun.ov.overlap ? '<span class="ov-yes">是</span>' : '<span class="ov-no">否</span>';
                    UI.moonTrop.innerText = astro.moon.trop;
                    UI.moonSid.innerText  = astro.moon.sid;
                    UI.moonMans.innerText = astro.moon.mans;
                    UI.moonOv.innerHTML   = astro.moon.ov.overlap ? '<span class="ov-yes">是</span>' : '<span class="ov-no">否</span>';
                }
            }
        } catch (e) {
            console.error("天文数据错误:", e);
        }
    }

    // 4. 通知日历刷新
    updateCalendarView(targetDate);
}

// Controls
function addTime(sign) {
    const val = UI.stepSel.value;
    const unit = val.slice(-1);
    const amount = parseInt(val.slice(0, -1)) * sign;
    let base = state.mode === 'AUTO' ? new Date() : new Date(state.manualDate);
    
    if (unit === 'm') base.setMinutes(base.getMinutes() + amount);
    if (unit === 'h') base.setHours(base.getHours() + amount);
    if (unit === 'd') base.setDate(base.getDate() + amount);
    if (unit === 'M') base.setMonth(base.getMonth() + amount);
    if (unit === 'y') base.setFullYear(base.getFullYear() + amount);
    
    state.manualDate = base; 
    state.mode = 'MANUAL'; 
    updateAll();
}

function toggleFlow() {
    if (state.mode === 'AUTO' || state.mode === 'MANUAL_PLAY') {
        state.manualDate = state.mode === 'AUTO' ? new Date() : state.manualDate;
        state.mode = 'MANUAL';
    } else { 
        state.mode = 'MANUAL_PLAY'; 
    }
    updateAll();
}

function resetNow() { state.mode = 'AUTO'; updateAll(); }

function saveSettings() {
    const tVal = UI.inputTime.value;
    const latVal = parseFloat(UI.inputLat.value);
    const lonVal = parseFloat(UI.inputLon.value);
    if (tVal) { state.manualDate = new Date(tVal); state.mode = 'MANUAL'; }
    if (!isNaN(latVal)) state.lat = latVal;
    if (!isNaN(lonVal)) state.lon = lonVal;
    UI.modal.classList.add('hidden'); 
    updateAll();
}

export function mountBazi() {
    initGPS();
    
    if(UI.btnPrev) UI.btnPrev.addEventListener('click', () => addTime(-1));
    if(UI.btnNext) UI.btnNext.addEventListener('click', () => addTime(1));
    if(UI.btnFlow) UI.btnFlow.addEventListener('click', toggleFlow);
    if(UI.btnReset) UI.btnReset.addEventListener('click', resetNow);
    
    if(UI.btnSettings) UI.btnSettings.addEventListener('click', () => {
        const now = state.mode === 'AUTO' ? new Date() : state.manualDate;
        const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        UI.inputTime.value = localIso;
        UI.inputLat.value = state.lat; 
        UI.inputLon.value = state.lon;
        UI.modal.classList.remove('hidden');
    });
    
    if(UI.btnConfirm) UI.btnConfirm.addEventListener('click', saveSettings);
    if(UI.btnCancel) UI.btnCancel.addEventListener('click', () => UI.modal.classList.add('hidden'));

    setOnDateSelect((d) => {
        const ref = state.mode === 'AUTO' ? new Date() : state.manualDate;
        state.manualDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), ref.getHours(), ref.getMinutes(), ref.getSeconds());
        state.mode = 'MANUAL'; 
        updateAll();
    });

    setInterval(() => {
        if (state.mode === 'AUTO') {
            updateAll();
        } else if (state.mode === 'MANUAL_PLAY') { 
            state.manualDate.setSeconds(state.manualDate.getSeconds() + 1); 
            updateAll(); 
        }
    }, 1000);

    updateAll();
    console.log("Module: Bazi Pro (Combined Logic) Mounted");
}