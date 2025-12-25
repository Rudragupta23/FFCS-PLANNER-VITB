const timeSlots = ["DAY", "08:30-10:00", "10:05-11:35", "11:40-13:10", "LUNCH", "13:15-14:45", "14:50-16:20", "16:25-17:55", "18:00-19:30"];
const gridData = {
    'MON': ['A11', 'B11', 'C11', 'LUNCH', 'A21', 'A14', 'B21', 'C21'],
    'TUE': ['D11', 'E11', 'F11', 'LUNCH', 'D21', 'E14', 'E21', 'F21'],
    'WED': ['A12', 'B12', 'C12', 'LUNCH', 'A22', 'B14', 'B22', 'A24'],
    'THU': ['D12', 'E12', 'F12', 'LUNCH', 'D22', 'F14', 'E22', 'F22'],
    'FRI': ['A13', 'B13', 'C13', 'LUNCH', 'A23', 'C14', 'B23', 'B24'],
    'SAT': ['D13', 'E13', 'F13', 'LUNCH', 'D23', 'D14', 'D24', 'E23']
};

const clashMap = { 
    'C11': 'A21', 'A21': 'C11', 
    'F11': 'D21', 'D21': 'F11', 
    'C12': 'A22', 'A22': 'C12', 
    'F12': 'D22', 'D22': 'F12', 
    'C13': 'A23', 'A23': 'C13', 
    'F13': 'D23', 'D23': 'F13' 
};

let currentTempSelection = [];
let assignedSubjects = [];
let editingId = null;
let currentVersion = 1;

// INITIALIZATION

function init() {
    const head = document.getElementById('headerRow');
    head.innerHTML = '';
    timeSlots.forEach(t => head.innerHTML += `<th>${t}</th>`);
    
    const body = document.getElementById('timetableBody');
    body.innerHTML = '';
    Object.keys(gridData).forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `<td style="color:var(--neon); font-weight:800">${day}</td>`;
        gridData[day].forEach((slot, index) => {
            if(slot === 'LUNCH') row.innerHTML += `<td style="color:var(--text-dim); font-size:0.7rem;">LUNCH</td>`;
            else row.innerHTML += `<td class="slot" data-slot="${slot}" data-day="${day}" data-idx="${index}" onclick="toggleSlot('${slot}', this)">${slot}</td>`;
        });
        body.appendChild(row);
    });

    loadData();
    setupFeedbackForm();
    checkIncomingShare(); 
}

// VERSION & THEME CONTROL

function switchVersion(v) {
    currentVersion = v;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab${v}`).classList.add('active');
    editingId = null;
    currentTempSelection = [];
    document.getElementById('submitBtn').innerText = "Assign to Grid";
    ['subName', 'facName', 'prefSlots'].forEach(id => document.getElementById(id).value = '');
    loadData();
    showToast(`Switched to Draft ${v} 📂`);
}

function toggleTheme() {
    const root = document.documentElement;
    const themeBtn = document.getElementById('themeToggle');
    const current = root.getAttribute('data-theme');
    if (current === 'dark') {
        root.setAttribute('data-theme', 'light');
        themeBtn.innerText = '☀️';
    } else {
        root.setAttribute('data-theme', 'dark');
        themeBtn.innerText = '🌙';
    }
}


// DRAFT SHARING LOGIC 

function generateShareLink() {
    if (assignedSubjects.length === 0) {
        return alert("Add some courses before sharing!");
    }

    const shareData = assignedSubjects.map(s => ({
        n: s.name,
        f: s.fac,
        v: s.venue,
        c: s.credits,
        s: s.slots,
        cl: s.color
    }));

    try {
        const jsonStr = JSON.stringify(shareData);
        const encodedData = btoa(encodeURIComponent(jsonStr));
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encodedData}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("Share link copied to clipboard! 🔗");
        });
    } catch (e) {
        alert("Error generating link. The schedule might be too large.");
    }
}

function checkIncomingShare() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('share');

    if (sharedData) {
        try {
            const decodedData = decodeURIComponent(atob(sharedData));
            const imported = JSON.parse(decodedData);

            const mapped = imported.map(s => ({
                id: Date.now() + Math.random(),
                name: s.n,
                fac: s.f,
                venue: s.v,
                credits: s.c,
                slots: s.s,
                color: s.cl
            }));

            if (confirm(`Import shared draft into Draft ${currentVersion}? This will replace your current data.`)) {
                assignedSubjects = mapped;
                saveData();
                render();
                showToast("Imported successfully! ✨");
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (e) {
            console.error("Share Import Error:", e);
        }
    }
}

// FEEDBACK LOGIC

function toggleFeedback() {
    const overlay = document.getElementById('feedbackOverlay');
    overlay.style.display = overlay.style.display === 'flex' ? 'none' : 'flex';
}

function setupFeedbackForm() {
    const form = document.getElementById('feedbackForm');
    const result = document.getElementById('feedbackResult');
    const submitBtn = document.getElementById('feedbackSubmit');

    if(!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerText = "Sending...";
        
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);

        result.innerHTML = "Please wait...";

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                ...object,
                access_key: "d0688854-a6d4-4999-b998-d2060af401a7" 
            })
        })
        .then(async (response) => {
            let resJson = await response.json();
            if (response.status == 200) {
                result.innerHTML = "Feedback sent successfully! ✨";
                result.style.color = "var(--neon)";
                form.reset();
                setTimeout(() => { toggleFeedback(); result.innerHTML = ""; }, 2000);
            } else {
                result.innerHTML = resJson.message;
                result.style.color = "#ef4444";
            }
        })
        .catch(error => {
            result.innerHTML = "Something went wrong!";
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerText = "Send Message";
        });
    });
}

// CORE GRID LOGIC

function toggleSlot(slot, el) {
    if (assignedSubjects.some(s => s.slots.includes(slot) && s.id !== editingId)) return;
    const clash = clashMap[slot];
    if (clash && (currentTempSelection.includes(clash) || assignedSubjects.some(s => s.slots.includes(clash) && s.id !== editingId))) {
        alert(`⚠️ Clash Rule: ${slot} conflicts with ${clash}!`); return;
    }
    if(currentTempSelection.includes(slot)) {
        currentTempSelection = currentTempSelection.filter(s => s !== slot);
        el.classList.remove('selected-temp');
    } else {
        currentTempSelection.push(slot);
        el.classList.add('selected-temp');
    }
}

function assignSubject() {
    const subInput = document.getElementById('subName');
    const facInput = document.getElementById('facName');
    const venueInput = document.getElementById('venueName');
    const credits = parseInt(document.getElementById('courseCredits').value);
    
    const currentTotal = assignedSubjects.reduce((acc, s) => acc + (s.id === editingId ? 0 : s.credits), 0);
    if (currentTotal + credits > 29) return alert("⚠️ Credit Limit Exceeded! Max is 29.");
    if (!subInput.value.trim() || !facInput.value.trim() || currentTempSelection.length === 0) {
        return alert("Fill all subject details and select slots!");
    }

    if (editingId) {
        const idx = assignedSubjects.findIndex(s => s.id === editingId);
        assignedSubjects[idx].name = subInput.value.trim();
        assignedSubjects[idx].fac = facInput.value.trim();
        assignedSubjects[idx].venue = venueInput.value;
        assignedSubjects[idx].credits = credits;
        assignedSubjects[idx].slots = [...currentTempSelection];
        showToast("Course Updated! ✅");
        editingId = null;
        document.getElementById('submitBtn').innerText = "Assign to Grid";
    } else {
        assignedSubjects.push({
            id: Date.now(),
            name: subInput.value.trim(),
            fac: facInput.value.trim(),
            venue: venueInput.value,
            credits: credits,
            slots: [...currentTempSelection],
            color: `hsl(${Math.random() * 360}, 75%, 60%)`
        });
        showToast("Course Added! ✅");
    }

    currentTempSelection = [];
    subInput.value = ''; facInput.value = ''; document.getElementById('prefSlots').value = '';
    saveData(); render();
}

function render() {
    let creds = 0;
    let hasSprints = false;
    const searchTerm = document.getElementById('courseSearch').value.toLowerCase();
    
    document.querySelectorAll('.slot').forEach(el => {
        const s = el.dataset.slot;
        const day = el.dataset.day;
        const idx = parseInt(el.dataset.idx);
        const m = assignedSubjects.find(sub => sub.slots.includes(s));
        
        if (m) {
            let sprintWarning = "";
            const prevIdx = idx - 1;
            if (prevIdx >= 0) {
                const prevSlot = gridData[day][prevIdx];
                if (prevSlot !== 'LUNCH') {
                    const prevCourse = assignedSubjects.find(sub => sub.slots.includes(prevSlot));
                    if (prevCourse && prevCourse.venue !== m.venue) {
                        sprintWarning = `<span title="Sprint: ${prevCourse.venue} to ${m.venue}" style="font-size:1.1rem;">🏃‍♂️</span>`;
                        hasSprints = true;
                    }
                }
            }
            el.style.backgroundColor = m.color;
            el.style.color = '#fff';
            el.innerHTML = `<strong>${s}</strong> ${sprintWarning}<br><small>${m.name}</small><br><span style="font-size:0.6rem;">${m.venue}</span>`;
        } else {
            el.style.backgroundColor = 'transparent'; el.style.color = 'var(--text-main)';
            el.innerHTML = s;
        }
        el.classList.remove('selected-temp');
    });

    document.getElementById('sprintLegend').style.display = hasSprints ? 'block' : 'none';

    currentTempSelection.forEach(slot => {
        const el = document.querySelector(`[data-slot="${slot}"]`);
        if(el) el.classList.add('selected-temp');
    });

    const body = document.getElementById('summaryBody');
    body.innerHTML = '';
    assignedSubjects.forEach((s, i) => {
        creds += s.credits;
        if (s.name.toLowerCase().includes(searchTerm) || s.fac.toLowerCase().includes(searchTerm)) {
            body.innerHTML += `<tr>
                <td style="color:var(--neon)">${i+1}</td>
                <td style="font-family:monospace">${s.slots.join('-')}</td>
                <td>${s.name}</td><td>${s.fac}</td><td>${s.venue}</td><td>${s.credits}</td>
                <td><div class="color-swatch" style="background:${s.color}"></div></td>
                <td>
                    <button onclick="editSub(${s.id})" class="action-btn edit-icon">✏️</button>
                    <button onclick="deleteSub(${s.id})" class="action-btn delete-icon">🗑️</button>
                </td>
            </tr>`;
        }
    });
    document.getElementById('creditCount').innerText = creds;
    document.getElementById('courseCount').innerText = assignedSubjects.length;
}

// EXPORTS

function suggestSlots() {
    const input = document.getElementById('prefSlots').value.toUpperCase().replace(/\s/g, '');
    if(!input) return alert("Enter slot codes separated by hyphens (e.g. A11-A12)");
    const inputSlots = input.split('-');
    let found = 0;
    inputSlots.forEach(slot => {
        const el = document.querySelector(`[data-slot="${slot}"]`);
        if(el && !assignedSubjects.some(s => s.slots.includes(slot))) {
            const clash = clashMap[slot];
            if(!currentTempSelection.includes(clash) && !assignedSubjects.some(s => s.slots.includes(clash))) {
                if(!currentTempSelection.includes(slot)) {
                    currentTempSelection.push(slot);
                    el.classList.add('selected-temp');
                    found++;
                }
            }
        }
    });
    if(found > 0) showToast(`Added ${found} available slots! ✨`);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    if(msg) toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function toggleOverlay() {
    const overlay = document.getElementById('coursesOverlay');
    const container = document.getElementById('overlayCourseList');
    if (overlay.style.display === 'flex') {
        overlay.style.display = 'none';
    } else {
        container.innerHTML = '';
        if (assignedSubjects.length === 0) {
            container.innerHTML = '<p style="text-align:center; opacity:0.6;">No courses registered yet.</p>';
        } else {
            assignedSubjects.forEach(s => {
                container.innerHTML += `
                    <div class="overlay-course-item">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                            <strong style="color:var(--neon); font-size:1.1rem;">${s.name}</strong>
                            <span class="stat-badge" style="padding:2px 8px; font-size:0.7rem;">${s.credits} CR</span>
                        </div>
                        <div style="font-size:0.85rem; opacity:0.8;">${s.fac} | ${s.venue}</div>
                        <div style="margin-top:5px; font-family:monospace; color:var(--neon); font-size:0.8rem;">Slots: ${s.slots.join('-')}</div>
                    </div>`;
            });
        }
        overlay.style.display = 'flex';
    }
}

function copyCourseList() {
    if (assignedSubjects.length === 0) return alert("No courses registered yet!");
    let text = `--- MY COURSE LIST (Draft ${currentVersion}) ---\n\n`;
    assignedSubjects.forEach((s, i) => {
        text += `${i+1}. ${s.name} [${s.credits} CR]\n   Faculty: ${s.fac}\n   Venue: ${s.venue}\n   Slots: ${s.slots.join('-')}\n\n`;
    });
    text += `TOTAL CREDITS: ${assignedSubjects.reduce((acc, s) => acc + s.credits, 0)}/29`;
    navigator.clipboard.writeText(text).then(() => showToast("Course List Copied! 📋"));
}

function saveData() { localStorage.setItem(`vit_ffcs_v${currentVersion}`, JSON.stringify(assignedSubjects)); }
function loadData() {
    const d = localStorage.getItem(`vit_ffcs_v${currentVersion}`);
    assignedSubjects = d ? JSON.parse(d) : [];
    render();
}

function deleteSub(id) { 
    if(confirm("Remove this course?")) {
        assignedSubjects = assignedSubjects.filter(s => s.id !== id);
        saveData(); render();
    }
}

function editSub(id) {
    const sub = assignedSubjects.find(s => s.id === id);
    if(!sub) return;
    editingId = id;
    document.getElementById('subName').value = sub.name;
    document.getElementById('facName').value = sub.fac;
    document.getElementById('venueName').value = sub.venue;
    document.getElementById('courseCredits').value = sub.credits;
    currentTempSelection = [...sub.slots];
    document.getElementById('submitBtn').innerText = "Update Course";
    render();
}

function resetApp() { if(confirm(`Clear Draft ${currentVersion}?`)) { localStorage.removeItem(`vit_ffcs_v${currentVersion}`); loadData(); } }

async function downloadPNG() {
    const canvas = await html2canvas(document.getElementById('captureArea'), { backgroundColor: '#030712' });
    const link = document.createElement('a'); link.download = `Draft${currentVersion}.png`; link.href = canvas.toDataURL(); link.click();
}

async function downloadPDF() {
    const element = document.getElementById('captureArea');
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#030712' });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'landscape' });
    pdf.addImage(imgData, 'JPEG', 10, 10, 280, 150);
    pdf.save(`Draft${currentVersion}.pdf`);
}

// Start Application

init();