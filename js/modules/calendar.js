/* js/modules/calendar.js */
import { UI } from '../dom.js';

let onDateSelectCallback = null;

const CN_NUMS = ['初','一','二','三','四','五','六','七','八','九','十'];

function getLunarDayText(date) {
    if (typeof Astronomy === 'undefined') return '';
    const phase = Astronomy.MoonPhase(date);
    let age = Math.floor((phase / 360) * 29.53059) + 1;
    if (age > 30) age = 1;

    if (age === 1) return '初一';
    if (age === 15) return '十五';
    if (age === 10) return '初十';
    if (age === 20) return '二十';
    if (age === 30) return '三十';
    
    const prefix = age < 11 ? '初' : age < 20 ? '十' : '廿';
    const digit = age % 10;
    
    if(age === 20) return '二十';
    return prefix + (digit === 0 ? '' : CN_NUMS[digit]); 
}

function getDailyMoonInfo(date) {
    if (typeof Astronomy === 'undefined') return { label: '', illum: 0 };
    const phase = Astronomy.MoonPhase(date);
    const illum = Astronomy.Illumination("Moon", date).phase_fraction;
    let label = "", isSpecial = false;
    if (phase <= 5 || phase >= 355) { label = "朔"; isSpecial = true; }
    else if (phase >= 175 && phase <= 185) { label = "望"; isSpecial = true; }
    return { label, illum, isSpecial };
}

// date 参数：当前视图应该显示的月份参照，同时也是“选中”的日期
function renderGrid(viewDate) {
    if (!UI.calGrid) return;
    
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const selectedDay = viewDate.getDate(); // 当前选中的天
    
    // 获取当月第一天是周几
    const firstDayObj = new Date(year, month, 1);
    const firstDayOfWeek = firstDayObj.getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // 真实的“今天” (System Date)
    const now = new Date();
    const isCurrentMonthReal = now.getFullYear() === year && now.getMonth() === month;
    const realToday = now.getDate();

    let html = '';
    
    // 填充空白
    for(let i=0; i<firstDayOfWeek; i++) {
        html += `<div class="c-day empty"></div>`;
    }
    
    for(let d=1; d<=daysInMonth; d++) {
        const cellDate = new Date(year, month, d, 12, 0, 0);
        
        // Moon Info
        const { label, illum, isSpecial } = getDailyMoonInfo(cellDate);
        let trHtml = '';
        if (label || illum > 0) {
            trHtml = `
                ${label ? `<span class="moon-txt-small ${isSpecial?'special-phase':''}">${label}</span>` : ''}
                <div class="moon-dot-small"><div class="moon-lit-small" style="opacity: ${illum.toFixed(2)}"></div></div>
            `;
        }

        // Lunar Text
        const lunarText = getLunarDayText(cellDate);
        const isLunarSpecial = lunarText === '初一' || lunarText === '十五';
        const blHtml = `<span style="${isLunarSpecial ? 'color:var(--gold-dim);font-weight:bold':''}">${lunarText}</span>`;

        // Classes
        const isSystemToday = isCurrentMonthReal && d === realToday;
        const isSelected = d === selectedDay; // 是否是用户当前查看/选中的日期
        
        let classes = 'c-day';
        if (isSystemToday) classes += ' today';
        if (isSelected) classes += ' selected';
        
        // 关键修复：将视图的年份和月份注入到 data 属性中，以便点击时读取
        html += `
        <div class="${classes}" data-day="${d}" data-year="${year}" data-month="${month}">
            <div class="c-corner tl"></div>
            <div class="c-corner tr">${trHtml}</div>
            <div class="c-center">${d}</div>
            <div class="c-corner bl">${blHtml}</div>
            <div class="c-corner br"></div>
        </div>`;
    }
    
    UI.calGrid.innerHTML = html;
}

function updateAstronomyData(date) {
    if (typeof Astronomy === 'undefined' || !UI.moonPhase) return;
    const illum = Astronomy.Illumination("Moon", date).phase_fraction * 100;
    const phase = Astronomy.MoonPhase(date);
    
    let phaseName = "朔";
    if (phase >= 350 || phase < 10) phaseName = "新月(朔)";
    else if (phase < 80) phaseName = "蛾眉月";
    else if (phase < 100) phaseName = "上弦月";
    else if (phase < 170) phaseName = "盈凸月";
    else if (phase < 190) phaseName = "满月(望)";
    else if (phase < 260) phaseName = "亏凸月";
    else if (phase < 280) phaseName = "下弦月";
    else phaseName = "残月";

    UI.moonPhase.innerText = phaseName;
    UI.moonIllum.innerText = illum.toFixed(1) + '%';
}

export function setOnDateSelect(fn) { onDateSelectCallback = fn; }
export function updateCalendarView(date) { renderGrid(date); updateAstronomyData(date); }
export function mountCalendar() {
    if (UI.calGrid) UI.calGrid.addEventListener('click', (e) => {
        const t = e.target.closest('.c-day');
        if(t && !t.classList.contains('empty') && onDateSelectCallback) {
            // 修复 BUG：不再使用 new Date() 而是从 data 属性读取视图的年/月
            const y = parseInt(t.dataset.year);
            const m = parseInt(t.dataset.month);
            const d = parseInt(t.dataset.day);
            
            // 构造选中的日期
            const selectedDate = new Date(y, m, d);
            onDateSelectCallback(selectedDate); 
        }
    });
}