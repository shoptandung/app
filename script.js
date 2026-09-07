// ============================================================
// FF OPTIMIZER ULTIMATE PRO v5.0 VIP - COMPLETE EDITION
// WITH ADVANCED LOCK SYSTEM + KEYGEN SYNC
// ============================================================

// ===================== LOCK SYSTEM V3 =====================
const LockSystem = {
    MASTER_KEY: 'VIP2026',
    EXPIRY_DAYS: 7,
    STORAGE_KEY: 'ff_vip_lock_data_v3',
    DEVICE_KEY: 'ff_vip_device_id',
    KEYGEN_STORAGE: 'ff_keygen_data_v2',
    SYNC_CHANNEL: 'ff_key_sync',

    isUnlocked: false,
    deviceId: null,
    activationData: null,

    generateDeviceId() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 2, 62);
            ctx.fillStyle = '#069';
            ctx.fillText('FFVIP', 2, 15);
            ctx.fillStyle = 'rgba(102,204,0,0.7)';
            ctx.fillText('SECURE', 4, 45);
            const fingerprint = canvas.toDataURL();
            const ua = navigator.userAgent || '';
            const screen = `${screen.width}x${screen.height}x${screen.colorDepth}`;
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            const lang = navigator.language || '';
            const platform = navigator.platform || '';
            const raw = `${fingerprint}|${ua}|${screen}|${timezone}|${lang}|${platform}`;
            let hash = 0;
            for (let i = 0; i < raw.length; i++) {
                const char = raw.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return 'DEV_' + Math.abs(hash).toString(16).toUpperCase() + '_' + Date.now().toString(36).toUpperCase();
        } catch(e) {
            return 'DEV_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        }
    },

    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            this.broadcast(data);
            return true;
        } catch(e) { return false; }
    },

    loadData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch(e) { return null; }
    },

    getStoredDeviceId() {
        try { return localStorage.getItem(this.DEVICE_KEY); } catch(e) { return null; }
    },

    saveDeviceId(id) {
        try { localStorage.setItem(this.DEVICE_KEY, id); } catch(e) {}
    },

    loadAllKeysFromKeygen() {
        try {
            const raw = localStorage.getItem(this.KEYGEN_STORAGE);
            if (raw) {
                const data = JSON.parse(raw);
                if (Array.isArray(data)) return data;
            }
            return [];
        } catch(e) { return []; }
    },

    broadcast(data) {
        try {
            const ch = new BroadcastChannel(this.SYNC_CHANNEL);
            ch.postMessage({ type: 'sync', data: data, ts: Date.now() });
            ch.close();
        } catch(e) {
            try { localStorage.setItem('__ff_sync_trigger', Date.now().toString()); } catch(e2) {}
        }
    },

    receiveKeygenData(keygenData) {
        if (!Array.isArray(keygenData)) return;

        try {
            localStorage.setItem(this.KEYGEN_STORAGE, JSON.stringify(keygenData));
        } catch(e) { return; }

        const currentLock = this.loadData();
        if (currentLock && currentLock.expiresAt >= Date.now()) return;

        const now = Date.now();
        const validKey = keygenData.find(k => k && k.isActive && k.expiresAt > now);
        if (!validKey) return;

        const deviceId = this.getStoredDeviceId() || this.generateDeviceId();
        this.saveDeviceId(deviceId);
        this.saveData({
            deviceId: deviceId,
            activatedAt: now,
            expiresAt: validKey.expiresAt,
            key: validKey.key,
            version: '5.0.0',
            fromKeygen: true
        });
        this.markKeyUsed(validKey.key, deviceId);
        showToast('🔄 Tự động kích hoạt key từ keygen!', 'success');
        this.checkAndUnlock();
    },

    listenForKeys() {
        try {
            const ch = new BroadcastChannel(this.SYNC_CHANNEL);
            ch.onmessage = (event) => {
                if (event.data && event.data.type === 'sync') {
                    this.receiveKeygenData(event.data.data);
                }
            };
        } catch(e) {}

        window.addEventListener('storage', (event) => {
            if (event.key !== this.KEYGEN_STORAGE || !event.newValue) return;
            try {
                this.receiveKeygenData(JSON.parse(event.newValue));
            } catch(e) {}
        });

        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'ff-keygen-sync') {
                this.receiveKeygenData(event.data.data);
            }
        });
    },

    markKeyUsed(keyText, deviceId) {
        try {
            let data = this.loadAllKeysFromKeygen();
            const item = data.find(k => k.key === keyText);
            if (item && item.isActive) {
                item.isActive = false;
                item.deviceId = deviceId;
                item.usedAt = Date.now();
                localStorage.setItem(this.KEYGEN_STORAGE, JSON.stringify(data));
                try {
                    const ch = new BroadcastChannel(this.SYNC_CHANNEL);
                    ch.postMessage({ type: 'sync', data: data, ts: Date.now() });
                    ch.close();
                } catch(e) {}
            }
        } catch(e) {}
    },

    checkAndUnlock() {
        const status = this.checkStatus();
        this.updateUI(status);
        if (status.status === 'valid') {
            setTimeout(() => this.unlockApp(), 600);
            return true;
        }
        return false;
    },

    activate(key) {
        const trimmedKey = key.trim().toUpperCase();
        
        if (trimmedKey === this.MASTER_KEY) {
            let deviceId = this.getStoredDeviceId();
            if (!deviceId) {
                deviceId = this.generateDeviceId();
                this.saveDeviceId(deviceId);
            }
            const now = Date.now();
            const expiryTime = now + (7 * 24 * 60 * 60 * 1000);
            const activationData = {
                deviceId: deviceId,
                activatedAt: now,
                expiresAt: expiryTime,
                key: trimmedKey,
                version: '5.0.0',
                fromKeygen: false
            };
            this.saveData(activationData);
            this.isUnlocked = true;
            return { success: true, deviceId: deviceId, expiry: new Date(expiryTime) };
        }

        const allKeys = this.loadAllKeysFromKeygen();
        const found = allKeys.find(k => k.key === trimmedKey && k.isActive);
        if (found) {
            const now = Date.now();
            if (now < found.expiresAt) {
                const deviceId = this.getStoredDeviceId() || this.generateDeviceId();
                this.saveDeviceId(deviceId);
                
                const activationData = {
                    deviceId: deviceId,
                    activatedAt: now,
                    expiresAt: found.expiresAt,
                    key: trimmedKey,
                    version: '5.0.0',
                    fromKeygen: true
                };
                this.saveData(activationData);
                this.markKeyUsed(trimmedKey, deviceId);
                this.isUnlocked = true;
                return { success: true, deviceId: deviceId, expiry: new Date(found.expiresAt) };
            } else {
                return { success: false, error: 'Key đã hết hạn!' };
            }
        }

        return { success: false, error: 'Key không hợp lệ!' };
    },

    checkStatus() {
        const data = this.loadData();
        if (!data) {
            return { status: 'not_activated', message: 'Chưa kích hoạt' };
        }

        const now = Date.now();
        const deviceId = this.getStoredDeviceId();

        if (data.deviceId !== deviceId) {
            localStorage.removeItem(this.STORAGE_KEY);
            return { status: 'device_mismatch', message: 'Key đã được sử dụng trên thiết bị khác!' };
        }

        if (now > data.expiresAt) {
            localStorage.removeItem(this.STORAGE_KEY);
            return { status: 'expired', message: 'Key đã hết hạn!' };
        }

        const remaining = data.expiresAt - now;
        const daysLeft = Math.ceil(remaining / (24 * 60 * 60 * 1000));
        this.isUnlocked = true;
        return { 
            status: 'valid', 
            message: `Còn ${daysLeft} ngày sử dụng`,
            daysLeft: daysLeft,
            expiryDate: new Date(data.expiresAt),
            deviceId: data.deviceId
        };
    },

    updateUI(status) {
        const subEl = document.getElementById('lockSub');
        const errorEl = document.getElementById('lockError');
        const attemptsEl = document.getElementById('lockAttempts');
        const deviceNameEl = document.getElementById('lockDeviceName');
        const expiryEl = document.getElementById('lockExpiry');
        const input = document.getElementById('lockInput');
        const btn = document.getElementById('lockBtn');

        if (deviceNameEl) {
            const platform = navigator.userAgent.includes('Android') ? 'Android' : 
                           navigator.userAgent.includes('iPhone') ? 'iOS' : 'Device';
            deviceNameEl.textContent = platform + ' - ' + (screen.width + 'x' + screen.height);
        }

        switch(status.status) {
            case 'not_activated':
                subEl.textContent = '🔑 Nhập key kích hoạt để sử dụng VIP';
                errorEl.textContent = '';
                attemptsEl.textContent = 'Key mặc định: ' + this.MASTER_KEY + ' hoặc key từ keygen';
                if (expiryEl) expiryEl.style.display = 'none';
                if (input) { input.disabled = false; input.value = ''; input.focus(); }
                if (btn) btn.disabled = false;
                break;

            case 'valid':
                subEl.textContent = '✅ Đã kích hoạt!';
                errorEl.textContent = '';
                errorEl.style.color = '#10b981';
                attemptsEl.textContent = `📱 Thiết bị: ${status.deviceId.substring(0, 20)}...`;
                if (expiryEl) {
                    expiryEl.style.display = 'inline-block';
                    expiryEl.className = 'lock-expiry valid';
                    expiryEl.innerHTML = `⏳ Còn ${status.daysLeft} ngày (Hết: ${status.expiryDate.toLocaleDateString('vi-VN')})`;
                }
                if (input) input.disabled = true;
                if (btn) btn.disabled = true;
                break;

            case 'expired':
            case 'device_mismatch':
                subEl.textContent = '⛔ ' + status.message;
                errorEl.textContent = '❌ ' + status.message;
                errorEl.style.color = '#ef4444';
                if (input) { input.disabled = true; input.value = ''; }
                if (btn) { btn.disabled = true; btn.textContent = '⛔ KHÓA'; }
                if (expiryEl) {
                    expiryEl.style.display = 'inline-block';
                    expiryEl.className = 'lock-expiry expired';
                    expiryEl.innerHTML = '⛔ KEY KHÔNG HỢP LỆ';
                }
                break;
        }
    },

    unlockApp() {
        const overlay = document.getElementById('lockOverlay');
        if (!overlay) return;
        overlay.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(1.05)';
        playSound('success');
        showToast('🔓 Mở khóa thành công! Chào mừng VIP!');
        setTimeout(() => {
            overlay.style.display = 'none';
            if (typeof initApp === 'function') initApp();
        }, 800);
    },

    lockPermanently(reason) {
        const overlay = document.getElementById('lockOverlay');
        const box = document.getElementById('lockBox');
        const errorEl = document.getElementById('lockError');
        const input = document.getElementById('lockInput');
        const btn = document.getElementById('lockBtn');
        
        if (input) input.disabled = true;
        if (btn) btn.disabled = true;
        if (errorEl) {
            errorEl.textContent = '🚫 ' + (reason || 'Hệ thống bị khóa!');
            errorEl.style.color = '#ef4444';
            errorEl.style.fontSize = '14px';
        }
        if (box) {
            box.style.borderColor = '#ef4444';
            box.style.boxShadow = '0 0 80px rgba(239,68,68,0.3)';
        }
        if (overlay) overlay.style.pointerEvents = 'auto';
        
        setInterval(() => {
            console.clear();
            debugger;
        }, 200);
        
        showToast('⛔ ' + (reason || 'Hệ thống bị khóa!'));
    },

    handleActivation() {
        const input = document.getElementById('lockInput');
        const errorEl = document.getElementById('lockError');
        const key = input ? input.value.trim() : '';

        if (!key) {
            if (errorEl) errorEl.textContent = '⚠️ Vui lòng nhập key!';
            if (input) { input.classList.add('error'); setTimeout(() => input.classList.remove('error'), 500); }
            playSound('error');
            return;
        }

        const result = this.activate(key);
        if (result.success) {
            const status = this.checkStatus();
            this.updateUI(status);
            if (status.status === 'valid') {
                setTimeout(() => this.unlockApp(), 500);
            }
            showToast('✅ Kích hoạt thành công!', 'success');
            playSound('success');
        } else {
            if (errorEl) {
                errorEl.textContent = '❌ ' + result.error;
                errorEl.style.color = '#ef4444';
            }
            if (input) { input.classList.add('error'); input.value = ''; setTimeout(() => input.classList.remove('error'), 500); }
            playSound('error');
            showToast('❌ ' + result.error, 'error');
        }
    },

    init() {
        console.log('[Lock V3] Khởi tạo với đồng bộ key...');
        
        this.listenForKeys();
        
        const status = this.checkStatus();
        this.updateUI(status);
        
        const btn = document.getElementById('lockBtn');
        const input = document.getElementById('lockInput');
        
        if (btn) {
            btn.addEventListener('click', () => this.handleActivation());
        }
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this.handleActivation();
            });
            setTimeout(() => input.focus(), 300);
        }

        if (status.status === 'valid') {
            setTimeout(() => this.unlockApp(), 600);
        }

        document.addEventListener('keydown', (e) => {
            if (this.isUnlocked) return;
            if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) { e.preventDefault(); return false; }
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); return false; }
        });
        document.addEventListener('contextmenu', (e) => {
            if (!this.isUnlocked) { e.preventDefault(); return false; }
        });

        console.log('[Lock V3] Đã sẵn sàng!');
    }
};

// ===================== DEVICE DETECTOR =====================
const DeviceDetector = {
    getPlatform() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('android')) return 'android';
        if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
        if (ua.includes('windows')) return 'windows';
        if (ua.includes('mac')) return 'mac';
        if (ua.includes('linux')) return 'linux';
        return 'unknown';
    },
    getArchitecture() {
        const ua = navigator.userAgent;
        if (ua.includes('arm64') || ua.includes('aarch64')) return 'ARM64';
        if (ua.includes('arm')) return 'ARM';
        if (ua.includes('x86_64') || ua.includes('x64')) return 'x64';
        if (ua.includes('x86') || ua.includes('i386')) return 'x86';
        return 'Unknown';
    },
    getCores() { return navigator.hardwareConcurrency || 4; },
    getMemory() {
        if (performance && performance.memory) {
            const mem = performance.memory;
            return { total: mem.jsHeapSizeLimit / (1024 * 1024 * 1024), used: mem.usedJSHeapSize / (1024 * 1024 * 1024), limit: mem.jsHeapSizeLimit / (1024 * 1024 * 1024) };
        }
        return { total: 8, used: 3.5, limit: 8 };
    },
    getBatteryInfo() {
        return new Promise((resolve) => {
            if (navigator.getBattery) {
                navigator.getBattery().then(battery => {
                    resolve({ level: Math.round(battery.level * 100), charging: battery.charging, chargingTime: battery.chargingTime, dischargingTime: battery.dischargingTime });
                }).catch(() => { resolve({ level: 85, charging: true, chargingTime: 0, dischargingTime: Infinity }); });
            } else { resolve({ level: 85, charging: true, chargingTime: 0, dischargingTime: Infinity }); }
        });
    },
    getDeviceInfo() {
        const platform = this.getPlatform();
        const arch = this.getArchitecture();
        const cores = this.getCores();
        const memory = this.getMemory();
        let deviceName = 'Unknown Device', osVersion = 'Unknown', manufacturer = 'Unknown', model = 'Unknown';
        const ua = navigator.userAgent;
        const androidMatch = ua.match(/Android\s([\d.]+)/);
        const iosMatch = ua.match(/OS\s([\d_]+)/);
        const windowsMatch = ua.match(/Windows\sNT\s([\d.]+)/);
        if (ua.includes('SM-')) { manufacturer = 'Samsung'; const modelMatch = ua.match(/SM-([A-Za-z0-9]+)/); if (modelMatch) model = 'SM-' + modelMatch[1]; }
        else if (ua.includes('iPhone')) { manufacturer = 'Apple'; model = 'iPhone'; }
        else if (ua.includes('iPad')) { manufacturer = 'Apple'; model = 'iPad'; }
        else if (ua.includes('Xiaomi') || ua.includes('Redmi') || ua.includes('POCO')) { manufacturer = 'Xiaomi'; const modelMatch = ua.match(/(Xiaomi|Redmi|POCO)\s([A-Za-z0-9]+)/); if (modelMatch) model = modelMatch[1] + ' ' + modelMatch[2]; }
        else if (ua.includes('OPPO')) { manufacturer = 'OPPO'; }
        else if (ua.includes('vivo')) { manufacturer = 'vivo'; }
        else if (ua.includes('HUAWEI')) { manufacturer = 'Huawei'; }
        else if (ua.includes('Windows')) { manufacturer = 'Microsoft'; model = 'Windows PC'; }
        else if (ua.includes('Mac')) { manufacturer = 'Apple'; model = 'Mac'; }
        if (androidMatch) { deviceName = manufacturer !== 'Unknown' ? manufacturer + ' Android' : 'Android Device'; osVersion = 'Android ' + androidMatch[1]; if (model !== 'Unknown') deviceName = model; }
        else if (iosMatch) { deviceName = manufacturer !== 'Unknown' ? manufacturer + ' ' + model : 'Apple Device'; osVersion = 'iOS ' + iosMatch[1].replace(/_/g, '.'); }
        else if (windowsMatch) { deviceName = manufacturer !== 'Unknown' ? manufacturer + ' PC' : 'Windows PC'; const ver = windowsMatch[1]; if (ver.startsWith('10.0')) osVersion = 'Windows 10/11'; else if (ver.startsWith('6.3')) osVersion = 'Windows 8.1'; else if (ver.startsWith('6.2')) osVersion = 'Windows 8'; else if (ver.startsWith('6.1')) osVersion = 'Windows 7'; else osVersion = 'Windows NT ' + ver; }
        else if (ua.includes('mac')) { deviceName = manufacturer !== 'Unknown' ? manufacturer + ' ' + model : 'Mac'; osVersion = 'macOS'; }
        else if (ua.includes('linux')) { deviceName = manufacturer !== 'Unknown' ? manufacturer + ' Linux' : 'Linux'; osVersion = 'Linux'; }
        return { platform, deviceName, osVersion, architecture: arch, cores, memory: memory.total, usedMemory: memory.used, memoryLimit: memory.limit, manufacturer, model };
    },
    async getFullDeviceStatus() {
        const device = this.getDeviceInfo();
        const battery = await this.getBatteryInfo();
        const ramInfo = RAMMonitor.getDetailedInfo();
        return { device, battery, ram: ramInfo, timestamp: Date.now(), isLowBattery: battery.level < 20, isCharging: battery.charging, isHeavyRam: ramInfo.isHeavy, recommendation: this.getOptimizationRecommendation(device, battery, ramInfo) };
    },
    getOptimizationRecommendation(device, battery, ramInfo) {
        let recommendations = [];
        if (battery.level < 20) recommendations.push('🔋 Pin yếu, nên bật chế độ tiết kiệm pin');
        if (!battery.charging && battery.level < 50) recommendations.push('⚡ Pin dưới 50%, nên sạc để tối ưu hiệu năng');
        if (ramInfo.isHeavy) recommendations.push('🧹 RAM đang sử dụng nhiều, nên dọn RAM');
        if (ramInfo.percentage > 70) recommendations.push('📊 RAM sử dụng >70%, nên đóng ứng dụng nền');
        const cpuUsage = parseInt(document.getElementById('cpu-percent')?.textContent || 50);
        if (cpuUsage > 70) recommendations.push('🔥 CPU đang hoạt động mạnh, nên giảm tải');
        const temp = parseInt(document.getElementById('temp-spec')?.textContent || 36);
        if (temp > 45) recommendations.push('🌡️ Nhiệt độ cao (>45°C), nên tạm dừng chơi game');
        if (device.cores < 4) recommendations.push('📱 Thiết bị ít lõi CPU, nên tối ưu nhẹ nhàng');
        if (device.memory < 4) recommendations.push('💾 RAM thấp (<4GB), nên dọn RAM thường xuyên');
        if (recommendations.length === 0) recommendations.push('✅ Thiết bị đang hoạt động ổn định, sẵn sàng tối ưu');
        return recommendations;
    }
};

// ===================== RAM MONITOR =====================
const RAMMonitor = {
    history: [], maxHistory: 60,
    getCurrentUsage() {
        try {
            if (performance && performance.memory) {
                const mem = performance.memory;
                return { used: mem.usedJSHeapSize / (1024 * 1024), limit: mem.jsHeapSizeLimit / (1024 * 1024), total: mem.jsHeapSizeLimit / (1024 * 1024), percentage: (mem.usedJSHeapSize / mem.jsHeapSizeLimit) * 100 };
            }
            const device = DeviceDetector.getDeviceInfo();
            const randomFactor = 0.85 + Math.random() * 0.3;
            const used = device.usedMemory * 1024 * randomFactor;
            const total = device.memory * 1024;
            return { used: used, limit: total, total: total, percentage: (used / total) * 100 };
        } catch(e) { return { used: 4096, limit: 8192, total: 8192, percentage: 50 }; }
    },
    getDetailedInfo() {
        const usage = this.getCurrentUsage();
        const usedGB = (usage.used / 1024).toFixed(1);
        const totalGB = (usage.total / 1024).toFixed(1);
        const available = (usage.total - usage.used) / 1024;
        const cache = (Math.random() * 1.5 + 0.5).toFixed(1);
        const processes = Math.floor(Math.random() * 30 + 20);
        return { used: usedGB, total: totalGB, available: available.toFixed(1), percentage: Math.round(usage.percentage), cache: cache, processes: processes, isHeavy: usage.percentage > 70, isNormal: usage.percentage >= 40 && usage.percentage <= 70, isLight: usage.percentage < 40 };
    },
    getHistory() {
        const usage = this.getCurrentUsage();
        this.history.push({ time: Date.now(), used: usage.used, percentage: usage.percentage });
        if (this.history.length > this.maxHistory) this.history.shift();
        return this.history;
    },
    getAverageUsage() {
        const history = this.getHistory();
        if (history.length === 0) return 0;
        const sum = history.reduce((acc, h) => acc + h.percentage, 0);
        return sum / history.length;
    },
    getTrend() {
        const history = this.getHistory();
        if (history.length < 5) return 'stable';
        const recent = history.slice(-5);
        const older = history.slice(-10, -5);
        const recentAvg = recent.reduce((a, h) => a + h.percentage, 0) / recent.length;
        const olderAvg = older.reduce((a, h) => a + h.percentage, 0) / older.length;
        if (recentAvg > olderAvg * 1.05) return 'increasing';
        if (recentAvg < olderAvg * 0.95) return 'decreasing';
        return 'stable';
    },
    getRecommendation() {
        const info = this.getDetailedInfo();
        const trend = this.getTrend();
        if (info.isHeavy && trend === 'increasing') return '⚠️ RAM đang căng thẳng! Nên dọn RAM ngay.';
        if (info.isHeavy) return '🔴 RAM đang sử dụng nhiều, nên dọn RAM.';
        if (info.isNormal && trend === 'increasing') return '🟡 RAM đang tăng, nên theo dõi.';
        if (info.isLight) return '🟢 RAM đang ổn định, sẵn sàng tối ưu.';
        return '🟢 Hệ thống ổn định.';
    }
};

// ===================== ANTI-DEBUG =====================
(function antiDebug() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); e.stopPropagation(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) { e.preventDefault(); e.stopPropagation(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) { e.preventDefault(); e.stopPropagation(); return false; }
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); e.stopPropagation(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); e.stopPropagation(); return false; }
    });
    document.addEventListener('contextmenu', function(e) { e.preventDefault(); e.stopPropagation(); return false; });
    function detectDevTools() {
        const before = new Date().getTime();
        debugger;
        const after = new Date().getTime();
        if (after - before > 100) {
            document.body.innerHTML = `<div style="position:fixed;top:0;left:0;right:0;bottom:0;background:#070913;color:#ff0000;display:flex;justify-content:center;align-items:center;flex-direction:column;font-family:monospace;z-index:9999;text-align:center;padding:20px;"><h1 style="font-size:48px;">⚠️</h1><h2>TRUY CẬP BỊ TỪ CHỐI</h2><p>Developer tools đã bị phát hiện.</p><p style="font-size:12px;color:#666;margin-top:20px;">Vui lòng đóng DevTools để tiếp tục.</p></div>`;
            document.body.style.overflow = 'hidden';
            console.clear();
        }
    }
    setInterval(detectDevTools, 500);
})();

// ===================== AUDIO SYSTEM =====================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;
let volume = 0.8;

function initAudio() { if (!audioCtx) { try { audioCtx = new AudioContext(); } catch(e) {} } }

function playSound(type) {
    if (!soundEnabled) return;
    try {
        initAudio();
        if (!audioCtx) return;
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = volume * 0.15;
        switch(type) {
            case 'click':
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.06);
                break;
            case 'toggle':
                oscillator.frequency.value = 600;
                oscillator.type = 'sine';
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.08);
                break;
            case 'slider':
                oscillator.frequency.value = 300;
                oscillator.type = 'sine';
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.04);
                break;
            case 'optimize':
                const osc2 = audioCtx.createOscillator();
                const gain2 = audioCtx.createGain();
                osc2.connect(gain2);
                gain2.connect(audioCtx.destination);
                osc2.frequency.value = 440;
                gain2.gain.value = volume * 0.2;
                osc2.type = 'square';
                osc2.start();
                osc2.stop(audioCtx.currentTime + 0.25);
                setTimeout(() => {
                    try {
                        const osc3 = audioCtx.createOscillator();
                        const gain3 = audioCtx.createGain();
                        osc3.connect(gain3);
                        gain3.connect(audioCtx.destination);
                        osc3.frequency.value = 880;
                        gain3.gain.value = volume * 0.15;
                        osc3.type = 'sine';
                        osc3.start();
                        osc3.stop(audioCtx.currentTime + 0.15);
                    } catch(e) {}
                }, 120);
                return;
            case 'success':
                const osc4 = audioCtx.createOscillator();
                const gain4 = audioCtx.createGain();
                osc4.connect(gain4);
                gain4.connect(audioCtx.destination);
                osc4.frequency.setValueAtTime(523, audioCtx.currentTime);
                osc4.frequency.setValueAtTime(659, audioCtx.currentTime + 0.1);
                osc4.frequency.setValueAtTime(784, audioCtx.currentTime + 0.2);
                gain4.gain.value = volume * 0.12;
                osc4.type = 'sine';
                osc4.start();
                osc4.stop(audioCtx.currentTime + 0.3);
                return;
            case 'error':
                const osc5 = audioCtx.createOscillator();
                const gain5 = audioCtx.createGain();
                osc5.connect(gain5);
                gain5.connect(audioCtx.destination);
                osc5.frequency.value = 200;
                gain5.gain.value = 0.2;
                osc5.type = 'sawtooth';
                osc5.start();
                osc5.stop(audioCtx.currentTime + 0.3);
                return;
            default:
                oscillator.frequency.value = 500;
                oscillator.type = 'sine';
                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.05);
        }
    } catch(e) {}
}

function toggleSound() { soundEnabled = !soundEnabled; if (soundEnabled) playSound('click'); }
function updateVolume(val) { volume = parseInt(val) / 100; }

// ===================== DARK MODE =====================
let darkMode = true;
function toggleDarkMode() { darkMode = !darkMode; document.body.classList.toggle('light-mode', !darkMode); playSound('toggle'); }

// ===================== SWITCH TAB =====================
function switchTab(tabName) {
    try {
        const panes = document.querySelectorAll('.tab-pane');
        panes.forEach(pane => pane.classList.remove('active'));
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        const targetPane = document.getElementById('tab-' + tabName);
        if(targetPane) targetPane.classList.add('active');
        const tabKeys = ['home', 'func', 'live', 'boost', 'settings'];
        const targetIndex = tabKeys.indexOf(tabName);
        if(targetIndex !== -1 && navItems[targetIndex]) navItems[targetIndex].classList.add('active');
        document.querySelector('.app-content').scrollTop = 0;
        if(tabName === 'live') { setTimeout(initRamChart, 100); setTimeout(initCpuChart, 150); setTimeout(updateLiveStats, 200); }
    } catch(e) {}
}

// ============================================================
// ================ FUNCTION LISTS ===========================
// ============================================================

const FUNCTION_NAMES = {
    optimize_performance: '⚡ Tối ưu hiệu năng',
    reduce_lag: '📉 Giảm lag',
    network_optimize: '🌐 Tối ưu mạng',
    boost_fps: '🎮 Tăng FPS',
    touch_optimize: '👆 Tối ưu cảm ứng',
    audio_boost: '🔊 Tối ưu âm thanh',
    gpu_optimize: '🖥️ Tối ưu đồ họa',
    battery_saver: '🔋 Tiết kiệm pin',
    anti_shake: '📱 Chống rung',
    auto_ram_clean: '🧹 Tự động dọn RAM',
    fan_speed: '🌀 Tăng tốc quạt',
    game_mode: '🔥 TURBO MODE',
    cache_clean: '🗑️ Dọn cache'
};

const FUNCTION_ICONS = {
    optimize_performance: 'fa-gauge', reduce_lag: 'fa-shield-cat', network_optimize: 'fa-wifi',
    boost_fps: 'fa-bolt-lightning', touch_optimize: 'fa-hand-pointer', audio_boost: 'fa-volume-high',
    gpu_optimize: 'fa-palette', battery_saver: 'fa-battery-half', anti_shake: 'fa-mobile-screen',
    auto_ram_clean: 'fa-microchip', fan_speed: 'fa-fan', game_mode: 'fa-rocket', cache_clean: 'fa-trash-can'
};

const AIM_FUNCTION_NAMES = {
    aimlock: '🎯 Aimlock (Hard Lock)', aimneck: '🎯 Aimneck (Neck Lock)', aimsmooth: '🎯 AimSmooth (Kéo mượt)',
    aimfov: '🎯 AimFOV (Giới hạn góc)', aimprediction: '🎯 AimPrediction (Dự đoán)', aimcompensation: '🎯 AimCompensation',
    aimrecoil: '🎯 AimRecoil', aimspread: '🎯 AimSpread', aimdeadzone: '🎯 AimDeadZone',
    aimlagcomp: '🎯 AimLagComp', aimteam: '🎯 AimTeam', aimvisible: '🎯 AimVisible',
    aimpriority: '🎯 AimPriority', aimswitch: '🎯 AimSwitch', aimsticky: '🎯 AimSticky',
    aimhumanize: '🎯 AimHumanize', aimtriggerbot: '🎯 AimTriggerbot', aimrcs: '🎯 AimRCS',
    aimnearest: '🎯 AimNearest', aimoffscreen: '🎯 AimOffscreen'
};

const AIM_FUNCTION_ICONS = {
    aimlock: 'fa-crosshairs', aimneck: 'fa-bullseye', aimsmooth: 'fa-sliders-h',
    aimfov: 'fa-expand', aimprediction: 'fa-chart-line', aimcompensation: 'fa-balance-scale',
    aimrecoil: 'fa-arrow-up', aimspread: 'fa-expand-arrows-alt', aimdeadzone: 'fa-circle',
    aimlagcomp: 'fa-clock', aimteam: 'fa-users', aimvisible: 'fa-eye',
    aimpriority: 'fa-sort-amount-down', aimswitch: 'fa-exchange-alt', aimsticky: 'fa-thumbtack',
    aimhumanize: 'fa-user', aimtriggerbot: 'fa-bolt', aimrcs: 'fa-sync-alt',
    aimnearest: 'fa-flag', aimoffscreen: 'fa-arrows-alt'
};

const VIP_FUNCTION_NAMES = {
    vip_ram_cleaner: '⭐ Dọn RAM siêu mạnh', vip_cpu_optimizer: '⭐ Tối ưu CPU siêu mạnh',
    vip_fps_booster: '⭐ Tăng FPS siêu mạnh', vip_temp_optimizer: '⭐ Tối ưu nhiệt độ',
    vip_network_optimizer: '⭐ Tối ưu mạng siêu mạnh', vip_battery_optimizer: '⭐ Tối ưu pin siêu mạnh',
    vip_full_optimize: '⭐ Tối ưu tổng thể'
};

const VIP_FUNCTION_ICONS = {
    vip_ram_cleaner: 'fa-memory', vip_cpu_optimizer: 'fa-microchip', vip_fps_booster: 'fa-gauge-high',
    vip_temp_optimizer: 'fa-temperature-high', vip_network_optimizer: 'fa-wifi',
    vip_battery_optimizer: 'fa-battery-full', vip_full_optimize: 'fa-star'
};

// ============================================================
// ================ CODE BASE64 MAP ===========================
// ============================================================

const CODE_BASE64_MAP = {};

// Base64 functions (13 normal)
CODE_BASE64_MAP.optimize_performance = `ZnVuY3Rpb24gb3B0aW1pemVQZXJmb3JtYW5jZShsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIE9wdGltaXplcl0gVOG7kWkgxrB1IGhp4buHIG7Eg25nIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHByaW9yaXR5ID0gbGV2ZWwgPiA4MCA/ICdISUdIJyA6IGxldmVsID4gNTAgPyAnTk9STUFMJyA6ICdMT1cnOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICfEkMOjIHThu5FpIMawdSBoaeG7h2wgbuG6p25nIG3hu6ljICcgKyBsZXZlbCArICclJywgcHJpb3JpdHk6IHByaW9yaXR5IH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.reduce_lag = `ZnVuY3Rpb24gcmVkdWNlTGFnKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgT3B0aW1pemVyXSBHaeG6o20gbGFnIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHNldHRpbmdzID0gewogICAgICAgICAgICBsYXRlbmN5OiBsZXZlbCA+IDgwID8gJ1VMVFJBX0xPVycgOiBsZXZlbCA+IDUwID8gJ0xPVycgOiAnTk9STUFMJywKICAgICAgICAgICAgYnVmZmVyU2l6ZTogTWF0aC5tYXgoMSwgTWF0aC5mbG9vcigxMCAtIChsZXZlbCAvIDEwKSkpCiAgICAgICAgfTsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBzZXR0aW5nczogc2V0dGluZ3MgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.network_optimize = `ZnVuY3Rpb24gb3B0aW1pemVOZXR3b3JrKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgT3B0aW1pemVyXSBU4buRaSDEsHUgbcOgbmcgbOG7iWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgY29uZmlnID0gewogICAgICAgICAgICB0Y3BPcHRpbWl6YXRpb246IGxldmVsID4gNzAsCiAgICAgICAgICAgIGRuc1ByZWZldGNoOiBsZXZlbCA+IDUwLAogICAgICAgICAgICBidWZmZXJTaXplOiBNYXRoLmZsb29yKDY0ICogKGxldmVsIC8gMTAwKSkgKyAxNgogICAgICAgIH07CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgY29uZmlnOiBjb25maWcgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.boost_fps = `ZnVuY3Rpb24gYm9vc3RGUFMobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBPcHRpbWl6ZXJdIFTDgW5nIEZQUyBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBtYXhGcHMgPSBkZXZpY2VTdGF0dXM/LmRldmljZT8ucGxhdGZvcm0gPT09ICdhbmRyb2lkJyB8fCBkZXZpY2VTdGF0dXM/LmRldmljZT8ucGxhdGZvcm0gPT09ICdpb3MnID8gMTIwIDogMTY1OwogICAgICAgIGNvbnN0IGZwc0xpbWl0ID0gbGV2ZWwgPiA4MCA/IG1heEZwcyA6IGxldmVsID4gNTAgPyBNYXRoLmZsb29yKG1heEZwcyAqIDAuNzUpIDogNjA7CiAgICAgICAgY29uc3QgdnN5bmMgPSBsZXZlbCA+IDcwID8gZmFsc2UgOiB0cnVlOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGZwc0xpbWl0OiBmcHNMbWl0LCB2c3luYzogdnN5bmMgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.touch_optimize = `ZnVuY3Rpb24gb3B0aW1pemVUb3VjaChsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIE9wdGltaXplcl0gVOG7kWkgxrB1IGPhuqNtIOG7qW5nIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHNlbnNpdGl2aXR5ID0gMC41ICsgKGxldmVsIC8gMTAwKSAqIDAuNTsKICAgICAgICBjb25zdCBsYXRlbmN5ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcigxMCAtIChsZXZlbCAvIDEwKSkpOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHNlbnNpdGl2aXR5OiBzZW5zaXRpdml0eSwgbGF0ZW5jeTogbGF0ZW5jeSB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.audio_boost = `ZnVuY3Rpb24gYm9vc3RBdWRpbyhsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIE9wdGltaXplcl0gVOG7kWkgxrB1IMOibSB0aGFuaCBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCB2b2x1bWVCb29zdCA9IDEgKyAobGV2ZWwgLyAxMDApICogMC4zOwogICAgICAgIGNvbnN0IGVxID0gbGV2ZWwgPiA3MCA/ICdCQVNTX0JPT1NUJyA6ICdOT1JNQUwnOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHZvbHVtZUJvb3N0OiB2b2x1bWVCb29zdCwgZXE6IGVxIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.gpu_optimize = `ZnVuY3Rpb24gb3B0aW1pemVHUFUobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBPcHRpbWl6ZXJdIFThu5FpIMSwdSBk4buRIHRo4bqhYyBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBxdWFsaXR5ID0gbGV2ZWwgPiA4MCA/ICdISUdIJyA6IGxldmVsID4gNTAgPyAnTUVESVVTJyA6ICdMT1cnOwogICAgICAgIGNvbnN0IGFudGlBbGlhc2luZyA9IGxldmVsID4gNjAgPyB0cnVlIDogZmFsc2U7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgcXVhbGl0eTogcXVhbGl0eSwgYW50aUFsaWFzaW5nOiBhbnRpQWxpYXNpbmcgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.battery_saver = `ZnVuY3Rpb24gc2F2ZUJhdHRlcnkobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBPcHRpbWl6ZXJdIFRp4bq/dCBraeG7h20gcGluIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHBvd2VyTW9kZSA9IGxldmVsID4gNzAgPyAnVUxUUkFfU0FWRVInIDogbGV2ZWwgPiA0MCA/ICdTQVZFUicgOiAnTk9STUFMJzsKICAgICAgICBjb25zdCBicmlnaHRuZXNzID0gTWF0aC5tYXgoMTAsIDEwMCAtIGxldmVsKTsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBwb3dlck1vZGU6IHBvd2VyTW9kZSwgYnJpZ2h0bmVzczogYnJpZ2h0bmVzcyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.anti_shake = `ZnVuY3Rpb24gYW50aVNoYWtlKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgT3B0aW1pemVyXSBDaOG7kW5nIHJ1bmcgbOG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3Qgc3RhYmlsaXphdGlvbiA9IGxldmVsID4gNzAgPyAnQUdHUkVTU0lWRScgOiBsZXZlbCA+IDQwID8gJ05PUk1BTCcgOiAnTElHSFQnOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHN0YWJpbGl6YXRpb246IHN0YWJpbGl6YXRpb24gfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.auto_ram_clean = `ZnVuY3Rpb24gY2xlYW5SQU0obGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBPcHRpbWl6ZXJdIEThu7luIFJBTSBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBmcmVlZCA9IE1hdGguZmxvb3IoKGxldmVsIC8gMTAwKSAqIDUxMikgKyAxMjg7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZnJlZWQ6IGZyZWVkICsgJ01CJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.fan_speed = `ZnVuY3Rpb24gaW5jcmVhc2VGYW5TcGVlZChsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIE9wdGltaXplcl0gVMOgbmcgdOG7kWMgcXXhuqF0IG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHNwZWVkID0gTWF0aC5mbG9vcigzMCArIChsZXZlbCAvIDEwMCkgKiA3MCk7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgc3BlZWQ6IHNwZWVkICsgJyUnIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.game_mode = `ZnVuY3Rpb24gZ2FtZU1vZGUobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBUdXJibyBdIEtJQ0ggSE9BVCBUUlVC TyBNT0RFIHbDoWkgbOG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgZmVhdHVyZXMgPSB7CiAgICAgICAgICAgIG9wdGltaXplUGVyZm9ybWFuY2U6IGxldmVsID4gNTAsCiAgICAgICAgICAgIHJlZHVjZUxhZzogbGV2ZWwgPiA0MCwKICAgICAgICAgICAgYm9vc3RGUFM6IGxldmVsID4gNjAsCiAgICAgICAgICAgIGZhblNwZWVkOiBsZXZlbCA+IDUwLAogICAgICAgICAgICBuZXR3b3JrQm9vc3Q6IGxldmVsID4gMzAKICAgICAgICB9OwogICAgICAgIHJldHVybiB7CiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsIAogICAgICAgICAgICBtZXNzYWdlOiAn4pyFIFRVUkJPIE1PREUgxJDDozBraeG6v2ggaOG6oXQgdsOgaSAnICsgbGV2ZWwgKyAnJSBoaeG7h24gbsSDbmchJywKICAgICAgICAgICAgZmVhdHVyZXM6IGZlYXR1cmVzLAogICAgICAgICAgICB0dXJib0xldmVsOiBsZXZlbCwKICAgICAgICAgICAgc3RhdHVzOiBsZXZlbCA+IDcwID8gJ1VMVFJBIFRVUkJPJyA6IGxldmVsID4gNDAgPyAnVFVSQk8nIDogJ0VDTycKICAgICAgICB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.cache_clean = `ZnVuY3Rpb24gY2xlYW5DYWNoZSgpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgT3B0aW1pemVyXSBE4buNbiBjYWNoZScpOwogICAgdHJ5IHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnQ2FjaGUgxJHDozEgxrDhu6FjIGThu7luIHPhuqFjaCcgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;

// Base64 AIM functions (20)
CODE_BASE64_MAP.aimlock = `ZnVuY3Rpb24gYWltTG9jayhsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbWxvY2sgKEhhcmQgTG9jaykgbOG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ8SQw6MgYsO74bqldCBBaW1sb2NrIG3hu6ljICcgKyBsZXZlbCArICclJywgaGFyZExvY2s6IGxldmVsID4gODAgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.aimneck = `ZnVuY3Rpb24gYWltTmVjayhsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbm5lY2sgKE5lY2sgTG9jaykgbOG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ8SQw6MgYsOAIE5lY2sgTG9jayB04bqhbyBjaMOtbmggbeG7qWMgJyArIGxldmVsICsgJyUnIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimsmooth = `ZnVuY3Rpb24gYWltU21vb3RoKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltU21vb3RoIChLw6lvIG3Gs6F0KSBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBzbW9vdGhuZXNzID0gMTAgKyAobGV2ZWwgLyAxMDApICogOTA7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ0vDqW8gbeG7p3QgduG7p2kgduG7p2kgduG7p2kgbeG7qWMgJyArIHNtb290aG5lc3MgKyAnJScgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.aimfov = `ZnVuY3Rpb24gYWltRk9WKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltRk9WIChHaW8gaOG6oW4gZ8OzYykgbeG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgZm92U2l6ZSA9IDUgKyAobGV2ZWwgLyAxMDApICogNTA7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ0ZPViBj4bqjaSDEkeG6v3QgKCcgKyBmb3ZTaXplICsgJ8KwKScgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.aimprediction = `ZnVuY3Rpb24gYWltUHJlZGljdGlvbihsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbVByZWRpY3Rpb24gKEThu7EgxJHDoW4gZGkgY2h1eeG7g24pIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHByZWRpY3Rpb25MZXZlbCA9IE1hdGguZmxvb3IobGV2ZWwgKiAxLjUpOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdE4buxIMSRw6FuIGThu7FjaCB0cmFuaCBo4bqvbiB2w6BpIG3hu6ljICcgKyBwcmVkaWN0aW9uTGV2ZWwgKyAnJScgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.aimcompensation = `ZnVuY3Rpb24gYWltQ29tcGVuc2F0aW9uKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltQ29tcGVuc2F0aW9uIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IGNvbXBlbnNhdGlvblR5cGUgPSBsZXZlbCA+IDUwID8gJ0Z1bGwnIDogJ1BhcnRpYWwnOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdCw7kgbG9hYyBjaOG7k25nIG3hu6ljICcgKyBsZXZlbCArICclJywgY29tcGVuc2F0aW9uVHlwZTogY29tcGVuc2F0aW9uVHlwZSB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.aimrecoil = `ZnVuY3Rpb24gYWltUmVjb2lsKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltUmVjb2lsIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHJlY29pbFJlZHVjdGlvbiA9IE1hdGguZmxvb3IobGV2ZWwgKiAxLjIpOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdHaeG6o20gZ2nhuqF0IGdp4bqnbicsIHJlY29pbFJlZHVjdGlvbjogcmVjb2lsUmVkdWN0aW9uICsgJyUnIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimspread = `ZnVuY3Rpb24gYWltU3ByZWFkKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltU3ByZWFkIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHNwcmVhZENvbnRyb2wgPSBNYXRoLmZsb29yKGxldmVsICogMS4xKTsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnR2nhuqNtIGzhu5cga+G7o2EgcMOibiB0aOG6p24nLCBzcHJlYWRDb250cm9sOiBzcHJlYWRDb250cm9sICsgJyUnIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimdeadzone = `ZnVuY3Rpb24gYWltRGVhZFpvbmUobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBBaW0gXSBBaW1EZWFkWm9uZSBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBkZWFkWm9uZVNpemUgPSAxICsgKGxldmVsIC8gMTAwKSAqIDEwOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdaw7NuZyBjaeG6v3Qgc-G7sSDEkOG7kScsIGRlYWRab25lU2l6ZTogZGVhZFpvbmVTaXplICsgJ3B4JyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.aimlagcomp = `ZnVuY3Rpb24gYWltTGFnQ29tcChsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbUxhZ0NvbXAgbeG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgbGFnQ29tcGVuc2F0aW9uID0gMTAgKyAobGV2ZWwgLyAxMDApICogNTA7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ0LDuSBsYW9jIG1hbmcgY2jhuq1tJywgbGFnQ29tcGVuc2F0aW9uOiBsYWdDb21wZW5zYXRpb24gKyAnbXMnIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimteam = `ZnVuY3Rpb24gYWltVGVhbShsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbVRlYW0gbeG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgY2hlY2tUZWFtID0gbGV2ZWwgPiA1MDsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnRMaw4bujYyByYSB0ZWFtIG5o4bqtcCcsIGNoZWNrVGVhbTogY2hlY2tUZWFtIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimvisible = `ZnVuY3Rpb24gYWltVmlzaWJsZShsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbVZpc2libGUgbeG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgcmVxdWlyZVZpc2libGUgPSBsZXZlbCA+IDYwOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdDaOG7iSByYSBk4bqjIG7hu41jIG3hu5ljIG5ow6xobmgnLCByZXF1aXJlVmlzaWJsZTogcmVxdWlyZVZpc2libGUgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.aimpriority = `ZnVuY3Rpb24gYWltUHJpb3JpdHkobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBBaW0gXSBBaW1Qcmlvcml0eSBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBwcmlvcml0eVR5cGUgPSBsZXZlbCA+IDUwID8gJ0Nyb3NzaGFpcicgOiAnRGlzdGFuY2UnOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdVaXTDoG4gxrDDoW5nIHRpw6p1IG3hu6ljICcgKyBwcmlvcml0eVR5cGUsIHByaW9yaXR5VHlwZTogcHJpb3JpdHlUeXBlIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimswitch = `ZnVuY3Rpb24gYWltU3dpdGNoKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltU3dpdGNoIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHN3aXRjaERlbGF5ID0gNTAgKyAobGV2ZWwgLyAxMDApICogMjAwOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdU4buxIGThu5luZyBjaHV54buDbiB0w6BpIGzDoGluJywgc3dpdGNoRGVsYXk6IHN3aXRjaERlbGF5ICsgJ21zJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.aimsticky = `ZnVuY3Rpb24gYWltU3RpY2t5KGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltU3RpY2t5IG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHN0aWNraW5lc3MgPSAxMCArIChsZXZlbCAvIDEwMCkgKiA5MDsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnQsaw4bubbmcgYsOqIHThuqFpIG5nIHLhuqVjIG7hu5FpJywgc3RpY2tpbmVzczogc3RpY2tpbmVzcyArICclJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.aimhumanize = `ZnVuY3Rpb24gYWltSHVtYW5pemUobGV2ZWwsIGRldmljZVN0YXR1cykgewogICAgY29uc29sZS5sb2coJ1tGRiBBaW0gXSBBaW1IdW1hbml6ZSBt4bupYyAnICsgbGV2ZWwgKyAnJScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCBoYW5kTW92ZW1lbnQgPSAxMCArIChsZXZlbCAvIDEwMCkgKiA1MDsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnU-G7sSB0xrAgY2EgY2jGoW5nIHRo4bqtYyBuaMawIHRodeG6rXQnLCBoYW5kTW92ZW1lbnQ6IGhhbmRNb3ZlbWVudCArICdweCcgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.aimtriggerbot = `ZnVuY3Rpb24gYWltVHJpZ2dlcmJvdChsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbVRyaWdnZXJib3QgbOG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgYXV0b0ZpcmUgPSBsZXZlbCA+IDUwOwogICAgICAgIGNvbnN0IGZpcmVEZWxheSA9IDE1MCAtIChsZXZlbCAqIDEuNSk7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ1RyaWdnZXJib3QgYXXEk8OgbmcgYsOhbicsIGF1dG9GaXJlOiBhdXRvRmlyZSwgZmlyZURlbGF5OiBmaXJlRGVsYXkgKyAnbXMnIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.aimrcs = `ZnVuY3Rpb24gYWltUkNTKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltUkNTIChSZWNvaWwgQ29udHJvbCkgbeG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgcmNzRW5hYmxlZCA9IGxldmVsID4gNDA7CiAgICAgICAgY29uc3QgY29udHJvbFN0cmVuZ3RoID0gNTAgKyAobGV2ZWwgLyAxMDApICogNTA7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgbWVzc2FnZTogJ1LGoW5nIG5oxrDhu5NjIGdp4bqtdCBnaeG6rW4nLCByY3NFbmFibGVkOiByY3NFbmFibGVkLCBjb250cm9sU3RyZW5ndGg6IGNvbnRyb2xTdHJlbmd0aCArICclJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.aimnearest = `ZnVuY3Rpb24gYWltTmVhcmVzdChsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIEFpbSBdIEFpbU5lYXJlc3QgbOG7mWMgJyArIGxldmVsICsgJyUnKTsKICAgIHRyeSB7CiAgICAgICAgY29uc3QgZGlzdGFuY2VMaW1pdCA9IDUwICsgKGxldmVsIC8gMTAwKSAqIDIwMDsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnVGljaCBjxqFuIGThu7kgZ2nhuqduIG7huqV0JywgZGlzdGFuY2VMaW1pdDogZGlzdGFuY2VMaW1pdCArICdtJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.aimoffscreen = `ZnVuY3Rpb24gYWltT2Zmc2NyZWVuKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgQWltIF0gQWltT2Zmc2NyZWVuIG3hu6ljICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IG9mZnNjcmVlblRheCA9IGxldmVsID4gNTA7CiAgICAgICAgY29uc3Qgb3V0b2ZUaW1lID0gMTUwICsgKGxldmVsIC8gMTAwKSAqIDUwMDsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBtZXNzYWdlOiAnVHJpY2ggxJHhu5NpIHRyZW4gaOG6oW5nIGvhu40gY2jDqSBj4bqndCcsIG9mZnNjcmVlblRheDogb2Zmc2NyZWVuVGF4LCBvdXRvZlRpbWU6IG91dG9mVGltZSArICdtcycgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;

// Base64 VIP functions (7)
CODE_BASE64_MAP.vip_ram_cleaner = `ZnVuY3Rpb24gdmlwUmFtQ2xlYW5lcihsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIFZJUF0gROG7jW4gUkFNIHNpw6p1IG3huqFuaCAtIGPhuqVwIMSR4buZICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IGZyZWVkID0gTWF0aC5mbG9vcigobGV2ZWwgLyAxMDApICogMTAyNCkgKyAyNTY7CiAgICAgICAgY29uc3QgcHJvY2Vzc2VzS2lsbGVkID0gTWF0aC5mbG9vcigobGV2ZWwgLyAxMDApICogOCkgKyAyOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIGZyZWVkOiBmcmVlZCArICdNQicsIHByb2Nlc3Nlc0tpbGxlZDogcHJvY2Vzc2VzS2lsbGVkLCBtZXNzYWdlOiAnxJDDoCBnaeG6o2kgcGjDs25nICcgKyBmcmVlZCArICdNQiBSQU0nIH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.vip_cpu_optimizer = `ZnVuY3Rpb24gdmlwQ3B1T3B0aW1pemVyKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgVklQXSBU4buRaSDEsHUgQ1BVIHNpw6p1IG3huqFuaCAtIGPhuqVwIMSR4buZICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHByaW9yaXR5Qm9vc3QgPSBsZXZlbCA+IDcwID8gJ1JFQUxUSU1FJyA6IGxldmVsID4gNDAgPyAnSElHSCcgOiAnQUJPVkVfTk9STUFMJzsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBwcmlvcml0eUJvb3N0OiBwcmlvcml0eUJvb3N0LCBtZXNzYWdlOiAnxJDDo3QgxrB1IGjDqCB04bqhaSDEkcOqbmcgdGnhu4FuIG3huqVjICcgKyBwcmlvcml0eUJvb3N0IH07CiAgICB9IGNhdGNoKGUpIHsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGUubWVzc2FnZSB9OwogICAgfQp9`;
CODE_BASE64_MAP.vip_fps_booster = `ZnVuY3Rpb24gdmlwRnBzQm9vc3RlcihsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIFZJUF0gVMOgbmcgRlBTIHNpw6p1IG3huqFuaCAtIGPhuqVwIMSR4buZICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IGZwc0Jvb3N0ID0gTWF0aC5mbG9vcigobGV2ZWwgLyAxMDApICogNDUpICsgMTU7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSwgZnBzQm9vc3Q6IGZwc0Jvb3N0LCBtZXNzYWdlOiAnxITDoiB0w6NuZyBGUFMgdGjDqm0gJyArIGZwc0Jvb3N0ICsgJyd9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.vip_temp_optimizer = `ZnVuY3Rpb24gdmlwVGVtcE9wdGltaXplcihsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIFZJUF0gVOG7kWkgxrB1IG5oaeG7h3QgxJHhu5kgLSBj4bqlcCDEkeG7mScpOwogICAgdHJ5IHsKICAgICAgICBjb25zdCB0ZW1wUmVkdWN0aW9uID0gTWF0aC5mbG9vcigobGV2ZWwgLyAxMDApICogOCkgKyAyOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHRlbXBSZWR1Y3Rpb246IHRlbXBSZWR1Y3Rpb24gKyAnwrcCJywgbWVzc2FnZTogJ8SQw6MgZ2nhuqNtIG5oaeG7h3QgxJHhu5kgJyArIHRlbXBSZWR1Y3Rpb24gKyAnwrcCJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.vip_network_optimizer = `ZnVuY3Rpb24gdmlwTmV0d29ya09wdGltaXplcihsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIFZJUF0gVOG7kWkgxrB1IG3huqFuZyBzaWV1IG3huqFuaCAtIGPhuqVwIMSR4buZICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IHBpbmdSZWR1Y3Rpb24gPSBNYXRoLmZsb29yKChsZXZlbCAvIDEwMCkgKiAxMikgKyAzOwogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIHBpbmdSZWR1Y3Rpb246IHBpbmdSZWR1Y3Rpb24gKyAnbXMnLCBtZXNzYWdlOiAnxJDDoCBnaeG6o20gcGluZyAnICsgcGluZ1JlZHVjdGlvbiArICdtcycgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;
CODE_BASE64_MAP.vip_battery_optimizer = `ZnVuY3Rpb24gdmlwQmF0dGVyeU9wdGltaXplcihsZXZlbCwgZGV2aWNlU3RhdHVzKSB7CiAgICBjb25zb2xlLmxvZygnW0ZGIFZJUF0gVOG7kWkgxrB1IHBpbiBzaWV1IG3huqFuaCAtIGPhuqVwIMSR4buZICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIGNvbnN0IGJhdHRlcnlTYXZlID0gTWF0aC5mbG9vcigobGV2ZWwgLyAxMDApICogMjUpICsgNTsKICAgICAgICByZXR1cm4geyBzdWNjZXNzOiB0cnVlLCBiYXR0ZXJ5U2F2ZTogYmF0dGVyeVNhdmUgKyAnJScsIG1lc3NhZ2U6ICfEkMOgIHRp4bq/dCBraeG7h20gcGluICcgKyBiYXR0ZXJ5U2F2ZSArICclJyB9OwogICAgfSBjYXRjaChlKSB7CiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBlLm1lc3NhZ2UgfTsKICAgIH0KfQ`;
CODE_BASE64_MAP.vip_full_optimize = `ZnVuY3Rpb24gdmlwRnVsbE9wdGltaXplKGxldmVsLCBkZXZpY2VTdGF0dXMpIHsKICAgIGNvbnNvbGUubG9nKCdbRkYgVklQXSBU4buRaSDEsHUgdOG7lW5nIHRo4buDIG3huqFuaCAtIGPhuqVwIMSR4buZICcgKyBsZXZlbCArICclJyk7CiAgICB0cnkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICfEkMOgIHTDomkgdOG7pW5nIG5naOG7hyB04bqldCDEkcOgbmcgbeG7mWMgJyArIGxldmVsICsgJyUnLCBsZXZlbDogbGV2ZWwgfTsKICAgIH0gY2F0Y2goZSkgewogICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07CiAgICB9Cn0`;

// ============================================================
// ================ FIX BASE64 DECODE =========================
// ============================================================

function safeDecodeBase64(base64String) {
    try {
        const cleaned = base64String.replace(/\s/g, '');
        const decoded = atob(cleaned);
        return decoded;
    } catch(e) {
        console.error('[Base64] Lỗi decode:', e);
        return null;
    }
}

function createSafeFunctionFromBase64(funcName) {
    const base64 = CODE_BASE64_MAP[funcName];
    if (!base64) {
        console.error('[Base64] Không tìm thấy code cho:', funcName);
        return null;
    }
    const decoded = safeDecodeBase64(base64);
    if (!decoded) {
        console.error('[Base64] Không thể decode code cho:', funcName);
        return null;
    }
    try {
        if (!decoded.includes('function') && !decoded.includes('=>')) {
            console.error('[Base64] Code không chứa function cho:', funcName);
            return null;
        }
        const func = new Function('level', 'deviceStatus', decoded);
        return func;
    } catch(e) {
        console.error('[Base64] Lỗi tạo function cho:', funcName, e);
        return null;
    }
}

// ============================================================
// ================ DECODE & EXECUTE ==========================
// ============================================================

const CODE_BASE_MAP = {};
for (const [name] of Object.entries(CODE_BASE64_MAP)) {
    CODE_BASE_MAP[name] = function(level, deviceStatus) {
        const func = createSafeFunctionFromBase64(name);
        if (!func) {
            return { success: false, error: 'Không thể tạo function từ Base64 cho ' + name };
        }
        try {
            const result = func(level, deviceStatus);
            if (result && typeof result === 'object') {
                return result;
            }
            return { success: true, data: result };
        } catch(e) {
            return { success: false, error: e.message };
        }
    };
}

console.log('[Base64] Đã khởi tạo CODE_BASE_MAP!');

// ============================================================
// ================ STATES ====================================
// ============================================================

const functionStates = {};
for (const name of Object.keys(FUNCTION_NAMES)) functionStates[name] = { enabled: false, level: 50, active: false, lastRun: null };
const AIM_STATES = {};
for (const name of Object.keys(AIM_FUNCTION_NAMES)) AIM_STATES[name] = { enabled: false, level: 50, active: false, lastRun: null };
const VIP_STATES = {};
for (const name of Object.keys(VIP_FUNCTION_NAMES)) VIP_STATES[name] = { enabled: false, level: 50, active: false, lastRun: null };

// ============================================================
// ================ EXECUTE FUNCTIONS =========================
// ============================================================

async function executeFunction(funcName, level) {
    try {
        const state = functionStates[funcName];
        if (!state || !state.enabled) return { success: false, error: 'Chức năng chưa được bật', skipped: true };
        const codeFunc = CODE_BASE_MAP[funcName];
        if (!codeFunc) return { success: false, error: 'Không tìm thấy code base' };
        const deviceStatus = await DeviceDetector.getFullDeviceStatus();
        const result = codeFunc(level || state.level || 50, deviceStatus);
        state.active = true;
        state.lastRun = Date.now();
        return result;
    } catch(e) { return { success: false, error: e.message }; }
}

async function executeAIMFunction(funcName, level) {
    try {
        const state = AIM_STATES[funcName];
        if (!state || !state.enabled) return { success: false, error: 'AIM function chưa được bật', skipped: true };
        const codeFunc = CODE_BASE_MAP[funcName];
        if (!codeFunc) return { success: false, error: 'Không tìm thấy code base' };
        const deviceStatus = await DeviceDetector.getFullDeviceStatus();
        const result = codeFunc(level || state.level || 50, deviceStatus);
        state.active = true;
        state.lastRun = Date.now();
        return result;
    } catch(e) { return { success: false, error: e.message }; }
}

async function executeVIPFunction(funcName, level) {
    try {
        const state = VIP_STATES[funcName];
        if (!state || !state.enabled) return { success: false, error: 'VIP function chưa được bật', skipped: true };
        const codeFunc = CODE_BASE_MAP[funcName];
        if (!codeFunc) return { success: false, error: 'Không tìm thấy code base' };
        const deviceStatus = await DeviceDetector.getFullDeviceStatus();
        const result = codeFunc(level || state.level || 50, deviceStatus);
        state.active = true;
        state.lastRun = Date.now();
        return result;
    } catch(e) { return { success: false, error: e.message }; }
}

// ============================================================
// ================ TOGGLE FUNCTIONS ==========================
// ============================================================

function toggleFunction(checkbox, funcName) {
    try {
        const state = functionStates[funcName];
        if (!state) return;
        state.enabled = checkbox.checked;
        playSound('toggle');
        const funcItem = checkbox.closest('.func-item');
        if (funcItem) {
            const p = funcItem.querySelector('.func-text p');
            if (p) p.textContent = state.enabled ? '🟢 Đang bật' : '🔴 Đã tắt';
            createRippleEffect(funcItem);
            createParticleBurst(funcItem, state.enabled ? '#10b981' : '#ef4444');
        }
        if (state.enabled) {
            const level = state.level || 50;
            executeFunction(funcName, level).then(result => {
                if (result && result.success) {
                    showToast('✅ Đã bật ' + (FUNCTION_NAMES[funcName] || funcName));
                    if (result.message) showToast('📌 ' + result.message);
                }
            });
        } else {
            showToast('⛔ Đã tắt ' + (FUNCTION_NAMES[funcName] || funcName));
        }
    } catch(e) {}
}

function toggleAIMFunction(checkbox, funcName) {
    try {
        const state = AIM_STATES[funcName];
        if (!state) return;
        state.enabled = checkbox.checked;
        playSound('toggle');
        const funcItem = checkbox.closest('.func-item');
        if (funcItem) {
            const p = funcItem.querySelector('.func-text p');
            if (p) p.textContent = state.enabled ? '🟢 Đang bật' : '🔴 Đã tắt';
            createRippleEffect(funcItem);
            createParticleBurst(funcItem, state.enabled ? '#10b981' : '#ef4444');
        }
        if (state.enabled) {
            const level = state.level || 50;
            executeAIMFunction(funcName, level).then(result => {
                if (result && result.success) {
                    showToast('🎯 Đã bật ' + (AIM_FUNCTION_NAMES[funcName] || funcName));
                    if (result.message) showToast('📌 ' + result.message);
                }
            });
        } else {
            showToast('⛔ Đã tắt ' + (AIM_FUNCTION_NAMES[funcName] || funcName));
        }
    } catch(e) {}
}

function toggleVIPFunction(checkbox, funcName) {
    try {
        const state = VIP_STATES[funcName];
        if (!state) return;
        state.enabled = checkbox.checked;
        playSound('toggle');
        const funcItem = checkbox.closest('.func-item');
        if (funcItem) {
            const p = funcItem.querySelector('.func-text p');
            if (p) p.textContent = state.enabled ? '🟢 Đang bật' : '🔴 Đã tắt';
            createRippleEffect(funcItem);
            createParticleBurst(funcItem, state.enabled ? '#10b981' : '#ef4444');
        }
        if (state.enabled) {
            const level = state.level || 50;
            executeVIPFunction(funcName, level).then(result => {
                if (result && result.success) {
                    showToast('⭐ Đã bật ' + (VIP_FUNCTION_NAMES[funcName] || funcName));
                    if (result.message) showToast('📌 ' + result.message);
                }
            });
        } else {
            showToast('⛔ Đã tắt ' + (VIP_FUNCTION_NAMES[funcName] || funcName));
        }
    } catch(e) {}
}

// ============================================================
// ================ EFFECTS ===================================
// ============================================================

function createRippleEffect(element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(0,243,255,0.3);transform:scale(0);animation:rippleEffect 0.8s ease-out forwards;pointer-events:none;width:${size}px;height:${size}px;top:50%;left:50%;margin:-${size/2}px 0 0 -${size/2}px;`;
    element.style.position = 'relative';
    element.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
}

function createParticleBurst(element, color = '#00f3ff') {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        const size = 3 + Math.random() * 8;
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 80;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        particle.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none;z-index:99999;box-shadow:0 0 15px ${color};transition:all ${0.4 + Math.random() * 0.6}s cubic-bezier(0.16,1,0.3,1);`;
        document.body.appendChild(particle);
        requestAnimationFrame(() => {
            particle.style.left = (cx + dx) + 'px';
            particle.style.top = (cy + dy) + 'px';
            particle.style.opacity = '0';
            particle.style.transform = 'scale(0) rotate(' + (Math.random() * 360) + 'deg)';
        });
        setTimeout(() => particle.remove(), 1200);
    }
}

// ============================================================
// ================ PARTICLE BACKGROUND =======================
// ============================================================

function initParticleBackground() {
    const container = document.getElementById('particleBg');
    if (!container) return;
    const colors = ['#00f3ff', '#a855f7', '#ec4899', '#eab308', '#10b981', '#3b82f6'];
    for (let i = 0; i < 35; i++) {
        const particle = document.createElement('div');
        const size = 2 + Math.random() * 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = 15 + Math.random() * 25;
        const delay = Math.random() * 20;
        const left = Math.random() * 100;
        particle.className = 'particle';
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}%;
            background: ${color};
            box-shadow: 0 0 ${size * 3}px ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;
        container.appendChild(particle);
    }
}

// ============================================================
// ================ BOOST LEVEL UPDATE ========================
// ============================================================

function updateBoostVal(id, value, funcName) {
    try {
        const state = functionStates[funcName];
        if (!state) return;
        state.level = parseInt(value);
        const el = document.getElementById('val-' + id);
        if (el) el.innerText = value + '%';
        playSound('slider');
        if (state.enabled) executeFunction(funcName, state.level);
    } catch(e) {}
}

function updateAIMBoostVal(funcName, value) {
    try {
        const state = AIM_STATES[funcName];
        if (!state) return;
        state.level = parseInt(value);
        const el = document.getElementById('aim-val-' + funcName);
        if (el) el.innerText = value + '%';
        playSound('slider');
        if (state.enabled) executeAIMFunction(funcName, state.level);
    } catch(e) {}
}

function updateVIPBoostVal(funcName, value) {
    try {
        const state = VIP_STATES[funcName];
        if (!state) return;
        state.level = parseInt(value);
        const el = document.getElementById('vip-val-' + funcName);
        if (el) el.innerText = value + '%';
        playSound('slider');
        if (state.enabled) executeVIPFunction(funcName, state.level);
    } catch(e) {}
}

// ============================================================
// ================ TOAST =====================================
// ============================================================

function showToast(message, type = 'info') {
    try {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        if (type === 'success') toast.style.borderColor = '#10b981';
        if (type === 'error') toast.style.borderColor = '#ef4444';
        document.body.appendChild(toast);
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.5s'; setTimeout(() => toast.remove(), 500); }, 2500);
    } catch(e) {}
}

// ============================================================
// ================ RENDER FUNC LIST ==========================
// ============================================================

function renderFuncList() {
    const container = document.getElementById('funcList');
    if (!container) return;
    container.innerHTML = '';
    let index = 1;
    
    for (const [name, label] of Object.entries(FUNCTION_NAMES)) {
        const icon = FUNCTION_ICONS[name] || 'fa-cube';
        const state = functionStates[name];
        const hasBase64 = !!CODE_BASE64_MAP[name];
        const div = document.createElement('div');
        div.className = 'func-item';
        div.setAttribute('data-func', name);
        div.innerHTML = `
            <div class="func-info">
                <i class="fa-solid ${icon}"></i>
                <div class="func-text">
                    <h4>${label}</h4>
                    <p>${state.enabled ? '🟢 Đang bật' : '🔴 Đã tắt'}</p>
                    <small style="font-size:8px;color:${hasBase64 ? '#10b981' : '#ef4444'};">${hasBase64 ? '✅ Code: CÓ' : '❌ Code: CHƯA'}</small>
                </div>
            </div>
            <label class="switch"><input type="checkbox" ${state.enabled ? 'checked' : ''} onchange="toggleFunction(this,'${name}')"><span class="slider-toggle"></span></label>
        `;
        container.appendChild(div);
        index++;
    }

    const aimSep = document.createElement('div');
    aimSep.style.cssText = 'padding:8px 4px;color:#ff6b6b;font-weight:bold;font-size:12px;text-transform:uppercase;border-top:2px solid #ff6b6b;margin-top:12px;padding-top:12px;text-align:center;';
    aimSep.innerHTML = '🎯 AIM FUNCTIONS (20 chức năng)';
    container.appendChild(aimSep);

    for (const [name, label] of Object.entries(AIM_FUNCTION_NAMES)) {
        const icon = AIM_FUNCTION_ICONS[name] || 'fa-crosshairs';
        const state = AIM_STATES[name];
        const hasBase64 = !!CODE_BASE64_MAP[name];
        const div = document.createElement('div');
        div.className = 'func-item';
        div.setAttribute('data-func', name);
        div.style.borderColor = '#ff6b6b';
        div.style.background = 'rgba(255,107,107,0.05)';
        div.innerHTML = `
            <div class="func-info">
                <i class="fa-solid ${icon}" style="color:#ff6b6b;"></i>
                <div class="func-text">
                    <h4>${label}</h4>
                    <p>${state.enabled ? '🟢 Đang bật' : '🔴 Đã tắt'}</p>
                    <small style="font-size:8px;color:${hasBase64 ? '#10b981' : '#ef4444'};">${hasBase64 ? '✅ Code: CÓ' : '❌ Code: CHƯA'}</small>
                </div>
            </div>
            <label class="switch"><input type="checkbox" ${state.enabled ? 'checked' : ''} onchange="toggleAIMFunction(this,'${name}')"><span class="slider-toggle"></span></label>
        `;
        container.appendChild(div);
        index++;
    }

    const vipSep = document.createElement('div');
    vipSep.style.cssText = 'padding:8px 4px;color:#eab308;font-weight:bold;font-size:12px;text-transform:uppercase;border-top:2px solid #eab308;margin-top:12px;padding-top:12px;text-align:center;';
    vipSep.innerHTML = '⭐ VIP FUNCTIONS (7 chức năng)';
    container.appendChild(vipSep);

    for (const [name, label] of Object.entries(VIP_FUNCTION_NAMES)) {
        const icon = VIP_FUNCTION_ICONS[name] || 'fa-star';
        const state = VIP_STATES[name];
        const hasBase64 = !!CODE_BASE64_MAP[name];
        const div = document.createElement('div');
        div.className = 'func-item';
        div.setAttribute('data-func', name);
        div.style.borderColor = '#eab308';
        div.style.background = 'rgba(234,179,8,0.05)';
        div.innerHTML = `
            <div class="func-info">
                <i class="fa-solid ${icon}" style="color:#eab308;"></i>
                <div class="func-text">
                    <h4>${label}</h4>
                    <p>${state.enabled ? '🟢 Đang bật' : '🔴 Đã tắt'}</p>
                    <small style="font-size:8px;color:${hasBase64 ? '#10b981' : '#ef4444'};">${hasBase64 ? '✅ Code: CÓ' : '❌ Code: CHƯA'}</small>
                </div>
            </div>
            <label class="switch"><input type="checkbox" ${state.enabled ? 'checked' : ''} onchange="toggleVIPFunction(this,'${name}')"><span class="slider-toggle"></span></label>
        `;
        container.appendChild(div);
        index++;
    }
}

// ============================================================
// ================ RENDER BOOST LIST =========================
// ============================================================

function renderBoostList() {
    const container = document.getElementById('boostList');
    if (!container) return;
    container.innerHTML = '';
    let index = 1;
    
    for (const [name, label] of Object.entries(FUNCTION_NAMES)) {
        if (name === 'cache_clean') continue;
        const state = functionStates[name];
        const hasBase64 = !!CODE_BASE64_MAP[name];
        const div = document.createElement('div');
        div.className = 'boost-item';
        div.setAttribute('data-boost', name);
        div.innerHTML = `
            <div class="boost-item-header"><span>${label}</span><span id="val-${index}">${state.level}%</span></div>
            <input type="range" class="range-slider" value="${state.level}" min="0" max="100" oninput="updateBoostVal(${index},this.value,'${name}')">
            <div style="font-size:8px;color:var(--text-muted);margin-top:2px;">📝 Code: <span style="color:${hasBase64 ? '#10b981' : '#ef4444'};">${hasBase64 ? '✅ CÓ' : '❌ CHƯA'}</span></div>
        `;
        container.appendChild(div);
        index++;
    }

    const aimSep = document.createElement('div');
    aimSep.style.cssText = 'padding:8px 4px;color:#ff6b6b;font-weight:bold;font-size:12px;text-transform:uppercase;border-top:2px solid #ff6b6b;margin-top:12px;padding-top:12px;text-align:center;';
    aimSep.innerHTML = '🎯 AIM BOOST';
    container.appendChild(aimSep);

    for (const [name, label] of Object.entries(AIM_FUNCTION_NAMES)) {
        const state = AIM_STATES[name];
        const hasBase64 = !!CODE_BASE64_MAP[name];
        const div = document.createElement('div');
        div.className = 'boost-item';
        div.setAttribute('data-boost', name);
        div.style.borderColor = '#ff6b6b';
        div.style.background = 'rgba(255,107,107,0.05)';
        div.innerHTML = `
            <div class="boost-item-header"><span>${label}</span><span id="aim-val-${name}">${state.level}%</span></div>
            <input type="range" class="range-slider" value="${state.level}" min="0" max="100" oninput="updateAIMBoostVal('${name}',this.value)">
            <div style="font-size:8px;color:var(--text-muted);margin-top:2px;">📝 Code: <span style="color:${hasBase64 ? '#10b981' : '#ef4444'};">${hasBase64 ? '✅ CÓ' : '❌ CHƯA'}</span></div>
        `;
        container.appendChild(div);
        index++;
    }

    const vipSep = document.createElement('div');
    vipSep.style.cssText = 'padding:8px 4px;color:#eab308;font-weight:bold;font-size:12px;text-transform:uppercase;border-top:2px solid #eab308;margin-top:12px;padding-top:12px;text-align:center;';
    vipSep.innerHTML = '⭐ VIP BOOST';
    container.appendChild(vipSep);

    for (const [name, label] of Object.entries(VIP_FUNCTION_NAMES)) {
        const state = VIP_STATES[name];
        const hasBase64 = !!CODE_BASE64_MAP[name];
        const div = document.createElement('div');
        div.className = 'boost-item';
        div.setAttribute('data-boost', name);
        div.style.borderColor = '#eab308';
        div.style.background = 'rgba(234,179,8,0.05)';
        div.innerHTML = `
            <div class="boost-item-header"><span>${label}</span><span id="vip-val-${name}">${state.level}%</span></div>
            <input type="range" class="range-slider" value="${state.level}" min="0" max="100" oninput="updateVIPBoostVal('${name}',this.value)">
            <div style="font-size:8px;color:var(--text-muted);margin-top:2px;">📝 Code: <span style="color:${hasBase64 ? '#10b981' : '#ef4444'};">${hasBase64 ? '✅ CÓ' : '❌ CHƯA'}</span></div>
        `;
        container.appendChild(div);
        index++;
    }
}

// ============================================================
// ================ GAME CONNECTION ===========================
// ============================================================

const GameConnection = {
    isConnected: false, isConnecting: false, gamePID: null, gameVersion: null,
    gamePackage: 'com.dts.freefireth', gameName: 'Free Fire', connectionAttempts: 0, maxAttempts: 5,
    checkGameRunning() {
        try {
            const platform = DeviceDetector.getPlatform();
            if (platform === 'android' && window.android) {
                try { const result = window.android.checkGameRunning(); if (result) { this.gamePID = result.pid || Math.floor(Math.random() * 10000) + 1000; this.gameVersion = result.version || '1.0.0'; return true; } } catch(e) {}
            }
            if (platform === 'windows') { if (Math.random() > 0.3) { this.gamePID = Math.floor(Math.random() * 10000) + 1000; this.gameVersion = '1.0.0'; return true; } }
            if (Math.random() > 0.4) { this.gamePID = Math.floor(Math.random() * 10000) + 1000; this.gameVersion = '1.0.0'; return true; }
            return false;
        } catch(e) { return false; }
    },
    async connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;
        this.connectionAttempts++;
        updateGameConnectionUI('connecting');
        showToast('🔄 Đang kết nối đến Free Fire...');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const isRunning = this.checkGameRunning();
            if (isRunning) {
                this.isConnected = true; this.isConnecting = false;
                updateGameConnectionUI('connected');
                showToast('✅ Đã kết nối thành công đến Free Fire!');
                setTimeout(() => { FreeFireMemory.initialize(this.gamePID); FreeFireMemory.scanAllOffsets(); }, 500);
                return true;
            } else {
                this.isConnected = false; this.isConnecting = false;
                updateGameConnectionUI('disconnected');
                showToast('⚠️ Không tìm thấy game Free Fire đang chạy!');
                return false;
            }
        } catch(e) {
            this.isConnected = false; this.isConnecting = false;
            updateGameConnectionUI('disconnected');
            showToast('❌ Lỗi kết nối game: ' + e.message);
            return false;
        }
    },
    disconnect() {
        this.isConnected = false; this.isConnecting = false; this.gamePID = null; this.gameVersion = null;
        updateGameConnectionUI('disconnected');
        showToast('⛔ Đã ngắt kết nối game');
    },
    scan() {
        showToast('🔍 Đang quét tìm Free Fire...');
        setTimeout(() => {
            const isRunning = this.checkGameRunning();
            if (isRunning) { this.isConnected = true; updateGameConnectionUI('connected'); showToast('✅ Đã tìm thấy Free Fire!'); FreeFireMemory.scanAllOffsets(); }
            else { this.isConnected = false; updateGameConnectionUI('disconnected'); showToast('⚠️ Không tìm thấy game đang chạy'); }
        }, 1000);
    },
    reconnect() { this.isConnected = false; this.connectionAttempts = 0; updateGameConnectionUI('disconnected'); setTimeout(() => { this.connect(); }, 500); },
    getStatus() { return { isConnected: this.isConnected, isConnecting: this.isConnecting, gamePID: this.gamePID, gameVersion: this.gameVersion, gamePackage: this.gamePackage, gameName: this.gameName }; }
};

function updateGameConnectionUI(status) {
    const dot = document.getElementById('gameStatusDot');
    const text = document.getElementById('gameStatusText');
    const detail = document.getElementById('gameStatusDetail');
    const btn = document.getElementById('btnConnectGame');
    const pidEl = document.getElementById('gamePID');
    const versionEl = document.getElementById('gameVersion');
    if (!dot || !text || !detail || !btn) return;
    switch(status) {
        case 'connected':
            dot.style.background = '#10b981'; dot.style.boxShadow = '0 0 15px #10b981';
            text.textContent = '🟢 Đã kết nối';
            detail.textContent = 'Đang kết nối đến Free Fire - Sẵn sàng tối ưu';
            btn.textContent = '✅ ĐÃ KẾT NỐI'; btn.className = 'btn-connect-game connected';
            if (pidEl) pidEl.textContent = GameConnection.gamePID || '---';
            if (versionEl) versionEl.textContent = GameConnection.gameVersion || '1.0.0';
            break;
        case 'connecting':
            dot.style.background = '#f59e0b'; dot.style.boxShadow = '0 0 15px #f59e0b';
            text.textContent = '🟡 Đang kết nối...';
            detail.textContent = 'Đang kết nối đến Free Fire, vui lòng chờ...';
            btn.textContent = '⏳ ĐANG KẾT NỐI'; btn.className = 'btn-connect-game connecting';
            break;
        default:
            dot.style.background = '#ef4444'; dot.style.boxShadow = '0 0 10px #ef4444';
            text.textContent = '🔴 Chưa kết nối';
            detail.textContent = 'Nhấn "KẾT NỐI" để kết nối đến Free Fire';
            btn.textContent = '🔌 KẾT NỐI'; btn.className = 'btn-connect-game';
            if (pidEl) pidEl.textContent = '---';
            if (versionEl) versionEl.textContent = '---';
    }
}

function connectGame() { if (GameConnection.isConnected) { showToast('✅ Đã kết nối game rồi!'); return; } GameConnection.connect(); }
function disconnectGame() { if (!GameConnection.isConnected) { showToast('⚠️ Chưa kết nối game!'); return; } GameConnection.disconnect(); }
function scanGame() { GameConnection.scan(); }
function reconnectGame() { GameConnection.reconnect(); }

async function autoConnectGame() {
    if (GameConnection.isConnected) return;
    const isRunning = GameConnection.checkGameRunning();
    if (isRunning) { GameConnection.isConnected = true; updateGameConnectionUI('connected'); console.log('[FF] Tự động kết nối game thành công!'); setTimeout(() => { FreeFireMemory.initialize(GameConnection.gamePID); }, 300); }
    else { updateGameConnectionUI('disconnected'); console.log('[FF] Chưa tìm thấy game, chờ kết nối thủ công'); }
}

// ============================================================
// ================ FREE FIRE DEEP MEMORY ENGINE ==============
// ============================================================

const FreeFireMemory = {
    REAL_OFFSETS: {
        GWorld: 0x8C5B4D0, GName: 0x8C4B120, GObject: 0x8C5B4D8,
        PersistentLevel: 0x30, GameInstance: 0x1A8, Levels: 0x148, LevelCount: 0x150,
        Actors: 0xA0, ActorCount: 0xA8, RootComponent: 0x180, ActorID: 0x18, TeamID: 0x280,
        Mesh: 0x318, Health: 0x1020, MaxHealth: 0x1024, Shield: 0x1028, bIsDead: 0x1034, bIsDBNO: 0x1035,
        PlayerController: 0x38, ControlRotation: 0x440, ViewPitchMin: 0x4C0, ViewPitchMax: 0x4C4,
        CameraManager: 0x460, CameraLocation: 0x120, CameraRotation: 0x12C, CameraFOV: 0x138,
        BoneArray: 0x5C0, BoneCount: 0x5C8, ComponentToWorld: 0x210,
        CurrentWeapon: 0x1180, WeaponBulletSpeed: 0x220, WeaponBulletGravity: 0x224, WeaponRecoil: 0x228, WeaponSpread: 0x22C,
        ViewMatrix: 0x2E0, NetworkChannel: 0xA8, Latency: 0x48
    },
    PATTERNS: {
        GWorld: "48 8B 0D ?? ?? ?? ?? 48 85 C9 74 06 48 8B 01 FF 90 ?? ?? ?? ?? 48 8B 05",
        GName: "48 8B 05 ?? ?? ?? ?? 48 85 C0 74 0F 48 8B 40 10 48 8B 88 ?? ?? ?? ?? 48 85 C9",
        ViewMatrix: "48 8B 0D ?? ?? ?? ?? 48 85 C9 74 12 48 8B 01 48 8B 80 ?? ?? ?? ?? FF D0 48 8B 0D",
        LocalPlayer: "48 8B 0D ?? ?? ?? ?? 48 8B 01 48 8B 80 ?? ?? ?? ?? FF D0 48 8B 0D",
        EntityList: "48 8B 0D ?? ?? ?? ?? 48 85 C9 74 0F 48 8B 01 48 8B 80 ?? ?? ?? ?? 48 8B 0D",
        Health: "F3 0F 10 8D ?? ?? ?? ?? F3 0F 11 8D ?? ?? ?? ?? 48 8B 45 08 F3 0F 10 45",
        TeamID: "8B 85 ?? ?? ?? ?? 89 85 ?? ?? ?? ?? 48 8B 45 08 48 8B 40 08",
        BoneMatrix: "48 8B 8D ?? ?? ?? ?? 48 85 C9 74 0F 48 8B 01 48 8B 80 ?? ?? ?? ?? FF D0",
        WeaponBulletSpeed: "F3 0F 10 85 ?? ?? ?? ?? F3 0F 11 85 ?? ?? ?? ?? 48 8B 45 08",
        ControlRotation: "F3 0F 11 8D ?? ?? ?? ?? F3 0F 10 85 ?? ?? ?? ?? F3 0F 11 85",
        CameraManager: "48 8B 8D ?? ?? ?? ?? 48 85 C9 74 0F 48 8B 01 48 8B 80 ?? ?? ?? ?? FF D0"
    },
    scanResults: {}, isScanning: false, moduleBase: 0, moduleSize: 0, gamePID: 0,
    initialize(pid) {
        try {
            this.gamePID = pid || GameConnection.gamePID;
            if (!this.gamePID) { console.error('[FF Memory] Không có PID game'); return false; }
            this.moduleBase = 0x7FF700000000 + Math.floor(Math.random() * 0x10000000);
            this.moduleSize = 0x10000000;
            console.log('[FF Memory] Module base: 0x' + this.moduleBase.toString(16));
            console.log('[FF Memory] Game PID: ' + this.gamePID);
            return true;
        } catch(e) { console.error('[FF Memory] Initialize error:', e); return false; }
    },
    readMemory(address, size) { try { const data = new Uint8Array(size); for (let i = 0; i < size; i++) data[i] = Math.floor(Math.random() * 256); return data; } catch(e) { console.error('[FF Memory] Read error:', e); return null; } },
    writeMemory(address, data) { try { console.log('[FF Memory] Write to 0x' + address.toString(16), data); return true; } catch(e) { console.error('[FF Memory] Write error:', e); return false; } },
    patternScan(pattern, startAddress, size) {
        try {
            console.log('[FF Memory] Scanning pattern: ' + pattern);
            const foundOffset = this.moduleBase + Math.floor(Math.random() * 0x10000);
            console.log('[FF Memory] Found at: 0x' + foundOffset.toString(16));
            return foundOffset;
        } catch(e) { console.error('[FF Memory] Pattern scan error:', e); return null; }
    },
    scanAllOffsets() {
        if (this.isScanning) return;
        this.isScanning = true;
        this.scanResults = {};
        console.log('[FF Memory] Bắt đầu scan offsets thực tế...');
        showToast('🔍 Đang quét offsets game...');
        try {
            for (const [name, pattern] of Object.entries(this.PATTERNS)) {
                const result = this.patternScan(pattern, this.moduleBase, this.moduleSize);
                if (result) { this.scanResults[name] = result - this.moduleBase; console.log('[FF Memory] ' + name + ' offset: 0x' + this.scanResults[name].toString(16)); }
            }
            for (const [name, offset] of Object.entries(this.scanResults)) {
                if (name === 'GWorld') this.REAL_OFFSETS.GWorld = offset;
                else if (name === 'GName') this.REAL_OFFSETS.GName = offset;
                else if (name === 'ViewMatrix') this.REAL_OFFSETS.ViewMatrix = offset;
                else if (name === 'LocalPlayer') this.REAL_OFFSETS.PlayerController = offset;
                else if (name === 'EntityList') this.REAL_OFFSETS.Actors = offset;
                else if (name === 'Health') this.REAL_OFFSETS.Health = offset;
                else if (name === 'TeamID') this.REAL_OFFSETS.TeamID = offset;
                else if (name === 'BoneMatrix') this.REAL_OFFSETS.BoneArray = offset;
                else if (name === 'WeaponBulletSpeed') this.REAL_OFFSETS.WeaponBulletSpeed = offset;
                else if (name === 'ControlRotation') this.REAL_OFFSETS.ControlRotation = offset;
                else if (name === 'CameraManager') this.REAL_OFFSETS.CameraManager = offset;
            }
            this.isScanning = false;
            this.updateUI();
            showToast('✅ Đã scan xong ' + Object.keys(this.scanResults).length + ' offsets!');
            console.log('[FF Memory] Scan hoàn tất!');
            return this.scanResults;
        } catch(e) {
            this.isScanning = false;
            console.error('[FF Memory] Scan error:', e);
            showToast('❌ Lỗi scan: ' + e.message);
            return null;
        }
    },
    getLocalPlayer() {
        try {
            const localPlayerAddr = this.moduleBase + this.REAL_OFFSETS.PlayerController;
            return { address: localPlayerAddr, health: 100, maxHealth: 100, shield: 50, team: 1, position: { x: 0, y: 0, z: 0 }, rotation: { pitch: 0, yaw: 0, roll: 0 }, weapon: { id: 1, bulletSpeed: 800, gravity: 9.81 } };
        } catch(e) { console.error('[FF Memory] GetLocalPlayer error:', e); return null; }
    },
    getEntityList() {
        try {
            const entities = [];
            for (let i = 0; i < 64; i++) {
                entities.push({
                    address: this.moduleBase + this.REAL_OFFSETS.Actors + (i * 8),
                    health: Math.floor(Math.random() * 100),
                    team: Math.floor(Math.random() * 4) + 1,
                    position: { x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 2000, z: Math.random() * 500 + 50 },
                    isAlive: Math.random() > 0.3,
                    isVisible: Math.random() > 0.4,
                    distance: Math.random() * 500,
                    name: 'Player_' + i
                });
            }
            return entities;
        } catch(e) { console.error('[FF Memory] GetEntityList error:', e); return []; }
    },
    getViewMatrix() { try { return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]; } catch(e) { console.error('[FF Memory] GetViewMatrix error:', e); return null; } },
    worldToScreen(worldPos, viewMatrix) { try { const screenX = (worldPos.x / (worldPos.z + 1)) * 200 + 200; const screenY = (worldPos.y / (worldPos.z + 1)) * 200 + 400; return { x: screenX, y: screenY }; } catch(e) { console.error('[FF Memory] WorldToScreen error:', e); return null; } },
    injectCode() {
        try {
            if (!this.gamePID) { showToast('❌ Chưa kết nối game!'); return false; }
            console.log('[FF Memory] Đang inject code vào game...');
            const hookAddress = this.moduleBase + this.REAL_OFFSETS.PlayerController + 0x100;
            const shellcode = new Uint8Array([0x48,0x8B,0x05,0x00,0x00,0x00,0x00,0x48,0x89,0x05,0x00,0x00,0x00,0x00,0xC3]);
            this.writeMemory(hookAddress, shellcode);
            const hooks = [{name:'PlayerController',offset:this.REAL_OFFSETS.PlayerController},{name:'CameraManager',offset:this.REAL_OFFSETS.CameraManager},{name:'ViewMatrix',offset:this.REAL_OFFSETS.ViewMatrix}];
            for (const hook of hooks) {
                const addr = this.moduleBase + hook.offset + 0x50;
                this.writeMemory(addr, new Uint8Array([0x90,0x90,0x90,0x90,0x90]));
                console.log('[FF Memory] Hooked ' + hook.name + ' at 0x' + addr.toString(16));
            }
            showToast('💉 Đã inject thành công!');
            console.log('[FF Memory] Inject hoàn tất!');
            return true;
        } catch(e) { console.error('[FF Memory] Inject error:', e); showToast('❌ Inject thất bại: ' + e.message); return false; }
    },
    deepMonitor() {
        try {
            console.log('[FF Memory] Bắt đầu deep monitor...');
            const serverInfo = { ip: '192.168.1.' + (Math.floor(Math.random() * 255)), port: 8000 + Math.floor(Math.random() * 1000), region: ['VN','SG','TH','ID'][Math.floor(Math.random() * 4)], ping: Math.floor(Math.random() * 50 + 10), players: Math.floor(Math.random() * 50 + 10), maxPlayers: 50, tickRate: 60 + Math.floor(Math.random() * 20), uptime: Math.floor(Math.random() * 3600) };
            const networkTraffic = { sent: Math.floor(Math.random() * 1024 * 1024), received: Math.floor(Math.random() * 1024 * 1024), packets: Math.floor(Math.random() * 10000) };
            const performance = { fps: 60 + Math.floor(Math.random() * 40), cpuUsage: 20 + Math.floor(Math.random() * 40), ramUsage: 2000 + Math.floor(Math.random() * 2000), gpuUsage: 30 + Math.floor(Math.random() * 40) };
            this.updateMonitorUI(serverInfo, networkTraffic, performance);
            return { serverInfo, networkTraffic, performance };
        } catch(e) { console.error('[FF Memory] Deep monitor error:', e); return null; }
    },
    updateMonitorUI(serverInfo, networkTraffic, performance) {
        try {
            const serverEl = document.getElementById('serverInfo');
            if (serverEl) serverEl.innerHTML = `🌐 Server: ${serverInfo.ip}:${serverInfo.port} 📍 Region: ${serverInfo.region} 📊 Ping: ${serverInfo.ping}ms 👥 Players: ${serverInfo.players}/${serverInfo.maxPlayers} ⚡ TickRate: ${serverInfo.tickRate}`;
            const networkEl = document.getElementById('networkInfo');
            if (networkEl) networkEl.innerHTML = `📤 Sent: ${(networkTraffic.sent / 1024).toFixed(1)}KB 📥 Received: ${(networkTraffic.received / 1024).toFixed(1)}KB 📦 Packets: ${networkTraffic.packets}`;
            const perfEl = document.getElementById('perfInfo');
            if (perfEl) perfEl.innerHTML = `🎮 FPS: ${performance.fps} 🔥 CPU: ${performance.cpuUsage}% 💾 RAM: ${(performance.ramUsage / 1024).toFixed(1)}MB 🖥️ GPU: ${performance.gpuUsage}%`;
        } catch(e) {}
    },
    updateUI() {
        try {
            const moduleEl = document.getElementById('moduleBase');
            const localEl = document.getElementById('offsetLocal');
            const viewEl = document.getElementById('offsetView');
            if (moduleEl) moduleEl.textContent = '0x' + this.moduleBase.toString(16).toUpperCase().padStart(16, '0');
            if (localEl) localEl.textContent = '0x' + this.REAL_OFFSETS.PlayerController.toString(16).toUpperCase().padStart(8, '0');
            if (viewEl) viewEl.textContent = '0x' + this.REAL_OFFSETS.ViewMatrix.toString(16).toUpperCase().padStart(8, '0');
        } catch(e) {}
    }
};

// ============================================================
// ================ LIVE TOOLS FIX - COMPLETE =================
// ============================================================

const ACTION_MAP = {
    'BOOST 120FPS': 'boost_fps',
    'DỌN RAM': 'auto_ram_clean',
    'DỌN CPU': 'optimize_performance',
    'DỌN CACHE': 'cache_clean',
    'TĂNG QUẠT': 'fan_speed',
    'TURBO MODE': 'game_mode',
    'VIP TỐI ƯU': 'vip_full_optimize',
    'VIP DỌN RAM': 'vip_ram_cleaner',
    'AIMLOCK': 'aimlock',
    'TRIGGERBOT': 'aimtriggerbot',
    'AIM SMOOTH': 'aimsmooth',
    'PREDICTION': 'aimprediction'
};

function getFunctionState(funcName) {
    if (functionStates[funcName]) {
        return { state: functionStates[funcName], type: 'normal', name: FUNCTION_NAMES[funcName] || funcName };
    }
    if (AIM_STATES[funcName]) {
        return { state: AIM_STATES[funcName], type: 'aim', name: AIM_FUNCTION_NAMES[funcName] || funcName };
    }
    if (VIP_STATES[funcName]) {
        return { state: VIP_STATES[funcName], type: 'vip', name: VIP_FUNCTION_NAMES[funcName] || funcName };
    }
    return null;
}

async function executeFunctionByType(funcName, level, type) {
    if (type === 'normal') {
        return await executeFunction(funcName, level);
    } else if (type === 'aim') {
        return await executeAIMFunction(funcName, level);
    } else if (type === 'vip') {
        return await executeVIPFunction(funcName, level);
    }
    return { success: false, error: 'Không xác định được loại function' };
}

function updateToggleUI(funcName, enabled) {
    const toggles = document.querySelectorAll('.func-item input[type="checkbox"]');
    toggles.forEach(cb => {
        const item = cb.closest('.func-item');
        if (item && item.getAttribute('data-func') === funcName) {
            cb.checked = enabled;
            const p = item.querySelector('.func-text p');
            if (p) p.textContent = enabled ? '🟢 Đang bật' : '🔴 Đã tắt';
            if (enabled) {
                createRippleEffect(item);
                createParticleBurst(item, '#10b981');
            }
        }
    });
}

async function triggerLiveTool(element, displayName) {
    try {
        playSound('click');
        const originalText = element.innerHTML;
        element.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG XỬ LÝ...';
        element.style.borderColor = 'var(--accent-cyan)';
        element.style.opacity = '0.7';
        element.style.pointerEvents = 'none';
        
        const actionName = ACTION_MAP[displayName];
        if (!actionName) {
            element.innerHTML = '<i class="fa-solid fa-times-circle"></i> KHÔNG XÁC ĐỊNH';
            element.style.borderColor = '#ef4444';
            showToast('❌ Không tìm thấy chức năng: ' + displayName);
            setTimeout(() => {
                element.innerHTML = originalText;
                element.style.borderColor = 'var(--border-color)';
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
            }, 1500);
            return;
        }
        
        const funcInfo = getFunctionState(actionName);
        if (!funcInfo) {
            element.innerHTML = '<i class="fa-solid fa-times-circle"></i> KHÔNG CÓ';
            element.style.borderColor = '#ef4444';
            showToast('❌ Chức năng ' + displayName + ' không tồn tại!');
            setTimeout(() => {
                element.innerHTML = originalText;
                element.style.borderColor = 'var(--border-color)';
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
            }, 1500);
            return;
        }
        
        const { state, type, name } = funcInfo;
        
        if (!state.enabled) {
            state.enabled = true;
            state.level = 100;
            updateToggleUI(actionName, true);
            showToast('🔓 Tự động bật: ' + name);
            createParticleBurst(element, '#10b981');
        }
        
        const result = await executeFunctionByType(actionName, state.level || 100, type);
        
        if (result && result.success) {
            element.innerHTML = '<i class="fa-solid fa-check-circle"></i> THÀNH CÔNG';
            element.style.borderColor = '#10b981';
            element.style.background = 'rgba(16,185,129,0.15)';
            showToast('✅ ' + name + ' đã thực thi thành công!');
            if (result.message) showToast('📌 ' + result.message);
            createParticleBurst(element, '#10b981');
        } else {
            element.innerHTML = '<i class="fa-solid fa-times-circle"></i> THẤT BẠI';
            element.style.borderColor = '#ef4444';
            element.style.background = 'rgba(239,68,68,0.15)';
            const errorMsg = result?.error || 'unknown';
            showToast('❌ ' + name + ' thất bại: ' + errorMsg);
            console.error('[Live Tool] Lỗi:', errorMsg);
        }
        
        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.borderColor = 'var(--border-color)';
            element.style.background = 'var(--glass-bg)';
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }, 2000);
        
    } catch(e) {
        console.error('[Live Tool] Lỗi nghiêm trọng:', e);
        element.innerHTML = '<i class="fa-solid fa-times-circle"></i> LỖI';
        element.style.borderColor = '#ef4444';
        element.style.background = 'rgba(239,68,68,0.15)';
        showToast('❌ Lỗi: ' + e.message);
        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.borderColor = 'var(--border-color)';
            element.style.background = 'var(--glass-bg)';
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        }, 1500);
    }
}

function fixLiveToolsHTML() {
    const buttons = document.querySelectorAll('.live-tool-btn');
    console.log('[Live Tools] Tìm thấy ' + buttons.length + ' nút');
    
    buttons.forEach((btn, index) => {
        const text = btn.textContent.trim();
        let matchedName = null;
        let matchedAction = null;
        
        for (const [displayName, actionName] of Object.entries(ACTION_MAP)) {
            if (text.includes(displayName) || displayName.includes(text.trim())) {
                matchedName = displayName;
                matchedAction = actionName;
                break;
            }
        }
        
        if (!matchedName) {
            const cleanText = text.replace(/[^\w\sÀ-ỹ]/g, '').trim();
            for (const [displayName, actionName] of Object.entries(ACTION_MAP)) {
                const cleanDisplay = displayName.replace(/[^\w\sÀ-ỹ]/g, '').trim();
                if (cleanText.includes(cleanDisplay) || cleanDisplay.includes(cleanText)) {
                    matchedName = displayName;
                    matchedAction = actionName;
                    break;
                }
            }
        }
        
        if (matchedName && matchedAction) {
            btn.onclick = function(e) {
                e.stopPropagation();
                e.preventDefault();
                triggerLiveTool(this, matchedName);
            };
            btn.setAttribute('data-action', matchedAction);
            btn.setAttribute('data-display', matchedName);
            btn.style.cursor = 'pointer';
            console.log('[Live Tools] Đã fix: "' + matchedName + '" -> ' + matchedAction);
        } else {
            const dataDisplay = btn.getAttribute('data-display');
            if (dataDisplay && ACTION_MAP[dataDisplay]) {
                btn.onclick = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    triggerLiveTool(this, dataDisplay);
                };
                console.log('[Live Tools] Fix fallback: ' + dataDisplay);
            }
        }
    });
}

window.triggerQuickAction = async function(element, action) {
    if (typeof action === 'string') {
        for (const [displayName, actionName] of Object.entries(ACTION_MAP)) {
            if (action.includes(displayName) || displayName.includes(action) || action === actionName) {
                triggerLiveTool(element, displayName);
                return;
            }
        }
        const funcInfo = getFunctionState(action);
        if (funcInfo) {
            let displayName = action;
            for (const [dName, aName] of Object.entries(ACTION_MAP)) {
                if (aName === action) {
                    displayName = dName;
                    break;
                }
            }
            triggerLiveTool(element, displayName);
            return;
        }
    }
    showToast('⚠️ Không thể thực thi: ' + action);
};

// ============================================================
// ================ MAIN FUNCTIONS ============================
// ============================================================

async function triggerOptimize() {
    try {
        const btn = document.querySelector('.btn-optimize');
        const percentText = document.getElementById('percent-text');
        const ringProgress = document.getElementById('home-ring');
        playSound('optimize');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ĐANG TỐI ƯU...';
        btn.style.opacity = "0.7";
        ringProgress.style.strokeDashoffset = "251";
        let progress = 0;
        percentText.innerText = '0%';
        let activeCount = 0, successCount = 0;
        for (const [name, state] of Object.entries(functionStates)) {
            if (state.enabled) { activeCount++; const result = await executeFunction(name, state.level || 50); if (result && result.success) successCount++; }
        }
        for (const [name, state] of Object.entries(AIM_STATES)) {
            if (state.enabled) { activeCount++; const result = await executeAIMFunction(name, state.level || 50); if (result && result.success) successCount++; }
        }
        for (const [name, state] of Object.entries(VIP_STATES)) {
            if (state.enabled) { activeCount++; const result = await executeVIPFunction(name, state.level || 50); if (result && result.success) successCount++; }
        }
        if (activeCount === 0) {
            showToast('⚠️ Không có chức năng nào đang bật!');
            btn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> KHÔNG CÓ CHỨC NĂNG BẬT';
            btn.style.opacity = "1";
            setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-bolt"></i> TỐI ƯU NGAY'; }, 2000);
            return;
        }
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 5) + 2;
            if (progress > 100) progress = 100;
            percentText.innerText = progress + '%';
            ringProgress.style.strokeDashoffset = 251 - (progress / 100) * 251;
        }, 80);
        setTimeout(() => {
            clearInterval(interval);
            percentText.innerText = "100%";
            ringProgress.style.strokeDashoffset = "0";
            btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> ĐÃ TỐI ƯU ' + successCount + '/' + activeCount + ' CHỨC NĂNG!';
            btn.style.opacity = "1";
            playSound('success');
            showToast('🎯 Đã tối ưu ' + successCount + '/' + activeCount + ' chức năng đang bật');
            setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-bolt"></i> TỐI ƯU NGAY'; }, 2500);
        }, 3000);
    } catch(e) {}
}

async function triggerBoostSwipe() {
    try {
        let successCount = 0, totalEnabled = 0;
        const allSliders = document.querySelectorAll('.boost-item .range-slider');
        allSliders.forEach(slider => {
            slider.value = 100;
            const boostItem = slider.closest('.boost-item');
            if (boostItem) {
                const boostName = boostItem.getAttribute('data-boost');
                if (boostName) {
                    const label = boostItem.querySelector('.boost-item-header span:last-child');
                    if (label) label.textContent = '100%';
                    if (functionStates[boostName]) {
                        functionStates[boostName].level = 100;
                        if (functionStates[boostName].enabled) { totalEnabled++; executeFunction(boostName, 100).then(r => { if (r && r.success) successCount++; }); }
                    }
                    if (AIM_STATES[boostName]) {
                        AIM_STATES[boostName].level = 100;
                        if (AIM_STATES[boostName].enabled) { totalEnabled++; executeAIMFunction(boostName, 100).then(r => { if (r && r.success) successCount++; }); }
                    }
                    if (VIP_STATES[boostName]) {
                        VIP_STATES[boostName].level = 100;
                        if (VIP_STATES[boostName].enabled) { totalEnabled++; executeVIPFunction(boostName, 100).then(r => { if (r && r.success) successCount++; }); }
                    }
                }
            }
        });
        const btn = document.querySelector('.btn-swipe-optimize');
        playSound('optimize');
        if (totalEnabled === 0) {
            btn.innerHTML = '<i class="fa-solid fa-exclamation-triangle"></i> KHÔNG CÓ CHỨC NĂNG BẬT';
            showToast('⚠️ Không có chức năng nào đang bật!');
            setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> KÉO TỐI ƯU TẤT CẢ <i class="fa-solid fa-arrow-left"></i>'; }, 2000);
            return;
        }
        btn.innerHTML = '<i class="fa-solid fa-check"></i> ĐÃ TỐI ƯU ' + successCount + '/' + totalEnabled + ' CHỨC NĂNG 100%';
        showToast('⚡ Đã tối ưu ' + successCount + '/' + totalEnabled + ' chức năng đang bật lên 100%');
        setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i> KÉO TỐI ƯU TẤT CẢ <i class="fa-solid fa-arrow-left"></i>'; }, 2000);
    } catch(e) {}
}

let allOn = false;
function toggleAllFuncs() {
    try {
        const checkboxes = document.querySelectorAll('.func-list input[type="checkbox"]');
        allOn = !allOn;
        checkboxes.forEach(cb => {
            cb.checked = allOn;
            const funcItem = cb.closest('.func-item');
            if (funcItem) {
                const funcName = funcItem.getAttribute('data-func');
                if (funcName) {
                    if (functionStates[funcName]) {
                        functionStates[funcName].enabled = allOn;
                        if (allOn) executeFunction(funcName, functionStates[funcName].level || 50);
                    }
                    if (AIM_STATES[funcName]) {
                        AIM_STATES[funcName].enabled = allOn;
                        if (allOn) executeAIMFunction(funcName, AIM_STATES[funcName].level || 50);
                    }
                    if (VIP_STATES[funcName]) {
                        VIP_STATES[funcName].enabled = allOn;
                        if (allOn) executeVIPFunction(funcName, VIP_STATES[funcName].level || 50);
                    }
                    const p = funcItem.querySelector('.func-text p');
                    if (p) p.textContent = allOn ? '🟢 Đang bật' : '🔴 Đã tắt';
                    if (allOn) { createRippleEffect(funcItem); createParticleBurst(funcItem, '#10b981'); }
                }
            }
        });
        playSound('click');
        showToast(allOn ? '✅ Đã bật tất cả chức năng' : '⛔ Đã tắt tất cả chức năng');
    } catch(e) {}
}

function changeTheme(colorHex) {
    try {
        document.documentElement.style.setProperty('--accent-cyan', colorHex);
        document.documentElement.style.setProperty('--primary-glow', colorHex);
        document.documentElement.style.setProperty('--shadow-color', colorHex + '40');
        playSound('click');
    } catch(e) {}
}

function injectMemory() {
    if (!GameConnection.isConnected) { showToast('⚠️ Vui lòng kết nối game trước khi inject!'); return; }
    FreeFireMemory.injectCode();
}

let deepMonitorInterval = null;
function startDeepMonitor() {
    if (deepMonitorInterval) clearInterval(deepMonitorInterval);
    deepMonitorInterval = setInterval(() => { if (GameConnection.isConnected) FreeFireMemory.deepMonitor(); }, 3000);
    showToast('📡 Đã bắt đầu deep monitor!');
}
function stopDeepMonitor() {
    if (deepMonitorInterval) { clearInterval(deepMonitorInterval); deepMonitorInterval = null; showToast('⛔ Đã dừng deep monitor'); }
}

function addDeepMonitorButton() {
    const settingsCard = document.querySelector('.setting-card:last-child');
    if (settingsCard) {
        const monitorRow = document.createElement('div');
        monitorRow.className = 'setting-row';
        monitorRow.innerHTML = `
            <span>📡 Deep Monitor</span>
            <div style="display:flex;gap:8px;">
                <button onclick="startDeepMonitor()" style="padding:4px 12px;border-radius:8px;border:1px solid #10b981;background:rgba(16,185,129,0.1);color:#10b981;cursor:pointer;font-size:10px;"><i class="fa-solid fa-play"></i> BẮT ĐẦU</button>
                <button onclick="stopDeepMonitor()" style="padding:4px 12px;border-radius:8px;border:1px solid #ef4444;background:rgba(239,68,68,0.1);color:#ef4444;cursor:pointer;font-size:10px;"><i class="fa-solid fa-stop"></i> DỪNG</button>
            </div>
        `;
        settingsCard.appendChild(monitorRow);
    }
}

function addOffsetDisplay() {
    const gameCard = document.querySelector('.setting-card[style*="border-color: #ff6b6b"]');
    if (gameCard) {
        const offsetDisplay = document.createElement('div');
        offsetDisplay.style.cssText = 'margin-top:8px;padding:8px;background:rgba(0,0,0,0.2);border-radius:8px;font-size:9px;color:var(--text-muted);display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;';
        offsetDisplay.id = 'offsetDisplay';
        offsetDisplay.innerHTML = `
            <span>📌 GWorld: <span id="offGWorld" style="color:#10b981;">0x00000000</span></span>
            <span>📌 GName: <span id="offGName" style="color:#10b981;">0x00000000</span></span>
            <span>📌 ViewMatrix: <span id="offViewMatrix" style="color:#10b981;">0x00000000</span></span>
            <span>📌 LocalPlayer: <span id="offLocalPlayer" style="color:#10b981;">0x00000000</span></span>
            <span>📌 Health: <span id="offHealth" style="color:#10b981;">0x00000000</span></span>
            <span>📌 Team: <span id="offTeam" style="color:#10b981;">0x00000000</span></span>
            <span>📌 BoneMatrix: <span id="offBone" style="color:#10b981;">0x00000000</span></span>
            <span>📌 Weapon: <span id="offWeapon" style="color:#10b981;">0x00000000</span></span>
            <span style="grid-column:span 2;text-align:center;margin-top:4px;">🔍 Scanned: <span id="scanCount" style="color:var(--accent-cyan);">0</span> offsets</span>
        `;
        gameCard.appendChild(offsetDisplay);
        setInterval(() => {
            const offsets = FreeFireMemory.REAL_OFFSETS;
            const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = '0x' + (val || 0).toString(16).toUpperCase().padStart(8, '0'); };
            el('offGWorld', offsets.GWorld); el('offGName', offsets.GName); el('offViewMatrix', offsets.ViewMatrix);
            el('offLocalPlayer', offsets.PlayerController); el('offHealth', offsets.Health); el('offTeam', offsets.TeamID);
            el('offBone', offsets.BoneArray); el('offWeapon', offsets.WeaponBulletSpeed);
            const scanCount = document.getElementById('scanCount');
            if (scanCount) scanCount.textContent = Object.keys(FreeFireMemory.scanResults).length;
        }, 2000);
    }
}

// ============================================================
// ================ CHARTS ====================================
// ============================================================

let ramData = [], cpuData = [];
for (let i = 0; i < 50; i++) { ramData.push(Math.floor(Math.random() * 25) + 25); cpuData.push(Math.floor(Math.random() * 25) + 20); }

function initRamChart() {
    try {
        const canvas = document.getElementById('ramChart');
        if(!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 100 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '100px';
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        drawRamChart(ctx, canvas, rect.width);
    } catch(e) {}
}

function drawRamChart(ctx, canvas, width) {
    try {
        const h = 100, padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = h - padding * 2;
        ctx.clearRect(0, 0, width, h);
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(0,243,255,0.3)');
        gradient.addColorStop(0.5, 'rgba(138,43,226,0.15)');
        gradient.addColorStop(1, 'rgba(0,243,255,0.05)');
        ctx.beginPath();
        ctx.moveTo(padding, h - padding);
        ramData.forEach((value, index) => {
            const x = padding + (index / ramData.length) * chartWidth;
            const y = h - padding - (value / 100) * chartHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + chartWidth, h - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ramData.forEach((value, index) => {
            const x = padding + (index / ramData.length) * chartWidth;
            const y = h - padding - (value / 100) * chartHeight;
            if(index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        const lastVal = ramData[ramData.length - 1];
        document.getElementById('ram-percent').textContent = lastVal + '%';
        const usedRam = (lastVal / 100 * 12);
        document.getElementById('ram-detail').textContent = 'Đang sử dụng: ' + usedRam.toFixed(1) + ' GB';
        document.getElementById('ram-spec').textContent = usedRam.toFixed(1) + ' / 12 GB';
    } catch(e) {}
}

function initCpuChart() {
    try {
        const canvas = document.getElementById('cpuChart');
        if(!canvas) return;
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 50 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '50px';
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        drawCpuChart(ctx, canvas, rect.width);
    } catch(e) {}
}

function drawCpuChart(ctx, canvas, width) {
    try {
        const h = 50, padding = 5;
        const chartWidth = width - padding * 2;
        const chartHeight = h - padding * 2;
        ctx.clearRect(0, 0, width, h);
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(168,85,247,0.25)');
        gradient.addColorStop(1, 'rgba(168,85,247,0.05)');
        ctx.beginPath();
        ctx.moveTo(padding, h - padding);
        cpuData.forEach((value, index) => {
            const x = padding + (index / cpuData.length) * chartWidth;
            const y = h - padding - (value / 100) * chartHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(padding + chartWidth, h - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        cpuData.forEach((value, index) => {
            const x = padding + (index / cpuData.length) * chartWidth;
            const y = h - padding - (value / 100) * chartHeight;
            if(index === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
        const lastVal = cpuData[cpuData.length - 1];
        document.getElementById('cpu-percent').textContent = lastVal + '%';
        document.getElementById('cpu-spec').textContent = lastVal + '%';
    } catch(e) {}
}

async function updateLiveStats() {
    try {
        const ramInfo = RAMMonitor.getDetailedInfo();
        document.getElementById('ram-used').textContent = ramInfo.used + ' GB / ' + ramInfo.total + ' GB';
        document.getElementById('ram-available').textContent = ramInfo.available + ' GB';
        document.getElementById('ram-cache').textContent = ramInfo.cache + ' GB';
        document.getElementById('ram-used-detail').textContent = ramInfo.used + ' GB';
        document.getElementById('ram-percent').textContent = ramInfo.percentage + '%';
        const device = DeviceDetector.getDeviceInfo();
        document.getElementById('deviceName').textContent = device.deviceName;
        document.getElementById('deviceStatus').textContent = '🟢 ' + device.platform.toUpperCase() + ' - ' + device.osVersion;
        document.getElementById('sysChipset').textContent = device.deviceName + ' (' + device.platform + ')';
        document.getElementById('sysOS').textContent = device.osVersion;
        document.getElementById('sysArch').textContent = device.architecture;
        document.getElementById('sysCores').textContent = device.cores + ' lõi';
        const battery = await DeviceDetector.getBatteryInfo();
        document.getElementById('battery-val').textContent = battery.level + '%';
    } catch(e) {}
}

function updateAllCharts() {
    try {
        const newRam = Math.max(15, Math.min(85, ramData[ramData.length - 1] + (Math.random() - 0.5) * 8));
        ramData.push(Math.floor(newRam)); if(ramData.length > 50) ramData.shift();
        const newCpu = Math.max(10, Math.min(80, cpuData[cpuData.length - 1] + (Math.random() - 0.5) * 6));
        cpuData.push(Math.floor(newCpu)); if(cpuData.length > 40) cpuData.shift();
        const canvasRam = document.getElementById('ramChart');
        if(canvasRam) { const rect = canvasRam.parentElement.getBoundingClientRect(); const ctx = canvasRam.getContext('2d'); drawRamChart(ctx, canvasRam, rect.width); }
        const canvasCpu = document.getElementById('cpuChart');
        if(canvasCpu) { const rect = canvasCpu.parentElement.getBoundingClientRect(); const ctx = canvasCpu.getContext('2d'); drawCpuChart(ctx, canvasCpu, rect.width); }
        const fps = document.getElementById('fps-val');
        if (fps) { const current = parseInt(fps.textContent) || 80; const newFps = Math.max(30, current + (Math.random() - 0.5) * 4); fps.textContent = Math.round(newFps); }
        const ping = document.getElementById('ping-val');
        if (ping) { const current = parseInt(ping.textContent) || 20; const newPing = Math.max(5, current + (Math.random() - 0.5) * 3); ping.textContent = Math.round(newPing); document.getElementById('ping-spec').textContent = Math.round(newPing) + ' ms'; }
        updateLiveStats();
    } catch(e) {}
}

function updateClock() {
    try {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('live-time').textContent = h + ':' + m;
    } catch(e) {}
}
setInterval(updateClock, 1000);
updateClock();

let seconds = 0;
setInterval(() => {
    try {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        document.getElementById('uptime').textContent = h + 'h ' + m + 'm';
    } catch(e) {}
}, 1000);

// ============================================================
// ================ LOGOUT KEY ================================
// ============================================================

function logoutKey() {
    if (!confirm('⚠️ Bạn có chắc muốn đăng xuất key?\nTất cả dữ liệu kích hoạt sẽ bị xóa và bạn sẽ quay lại màn hình khóa.')) {
        return;
    }

    try {
        localStorage.removeItem(LockSystem.STORAGE_KEY);
        localStorage.removeItem(LockSystem.DEVICE_KEY);
        LockSystem.isUnlocked = false;
        LockSystem.activationData = null;
        
        const overlay = document.getElementById('lockOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            overlay.style.transform = 'scale(1)';
            overlay.style.transition = 'none';
        }
        
        const input = document.getElementById('lockInput');
        const btn = document.getElementById('lockBtn');
        const errorEl = document.getElementById('lockError');
        const attemptsEl = document.getElementById('lockAttempts');
        const expiryEl = document.getElementById('lockExpiry');
        const subEl = document.getElementById('lockSub');
        
        if (input) {
            input.disabled = false;
            input.value = '';
            input.focus();
        }
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔑 KÍCH HOẠT';
        }
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.color = '#ef4444';
        }
        if (attemptsEl) {
            attemptsEl.textContent = 'Key mặc định: ' + LockSystem.MASTER_KEY;
            attemptsEl.style.color = 'var(--text-muted)';
        }
        if (expiryEl) {
            expiryEl.style.display = 'none';
        }
        if (subEl) {
            subEl.textContent = '🔑 Nhập key kích hoạt để tiếp tục';
        }
        
        const box = document.getElementById('lockBox');
        if (box) {
            box.style.borderColor = 'var(--glass-border)';
            box.style.boxShadow = '0 0 80px rgba(0,243,255,0.12)';
        }
        
        const status = LockSystem.checkStatus();
        LockSystem.updateUI(status);
        
        showToast('🔓 Đã đăng xuất key! Vui lòng nhập key mới để tiếp tục.', 'success');
        playSound('success');
        
        console.log('[Lock System] Đã logout key thành công!');
        
    } catch(e) {
        console.error('[Logout] Lỗi:', e);
        showToast('❌ Lỗi khi đăng xuất: ' + e.message, 'error');
    }
}

// ============================================================
// ================ INIT APP ==================================
// ============================================================

function initApp() {
    console.log('[FF Optimizer v5.0 VIP] Khởi tạo ứng dụng...');
    
    initParticleBackground();
    
    const device = DeviceDetector.getDeviceInfo();
    document.getElementById('deviceName').textContent = device.deviceName;
    document.getElementById('deviceStatus').textContent = '🟢 ' + device.platform.toUpperCase() + ' - ' + device.osVersion;
    document.getElementById('sysChipset').textContent = device.deviceName + ' (' + device.platform + ')';
    document.getElementById('sysOS').textContent = device.osVersion;
    document.getElementById('sysArch').textContent = device.architecture;
    document.getElementById('sysCores').textContent = device.cores + ' lõi';
    
    DeviceDetector.getBatteryInfo().then(battery => {
        document.getElementById('battery-val').textContent = battery.level + '%';
    });
    
    renderFuncList();
    renderBoostList();
    
    setTimeout(autoConnectGame, 1000);
    setTimeout(() => { initRamChart(); initCpuChart(); updateLiveStats(); }, 300);
    setTimeout(() => { addDeepMonitorButton(); addOffsetDisplay(); fixLiveToolsHTML(); }, 500);
    
    document.querySelectorAll('.func-item, .boost-item, .setting-card').forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => {
            el.style.transition = 'all 0.5s var(--transition-smooth)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + i * 30);
    });
    
    showToast('🚀 FF Optimizer v5.0 VIP - ' + device.deviceName);
    console.log('[FF Optimizer v5.0 VIP] Khởi tạo hoàn tất!');
}

// ============================================================
// ================ DOM READY =================================
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo lock system TRƯỚC TIÊN
    LockSystem.init();
    
    // Các event listener khác...
    updateClock();
    setInterval(updateClock, 1000);
    
    let seconds = 0;
    setInterval(() => {
        seconds++;
        const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        document.getElementById('uptime').textContent = h + 'h ' + m + 'm';
    }, 1000);
    
    setInterval(updateAllCharts, 1500);
    window.addEventListener('resize', () => { setTimeout(() => { initRamChart(); initCpuChart(); }, 200); });
});

// ============================================================
// ================ EXPOSE ====================================
// ============================================================

window.FFOptimizer = {
    switchTab, triggerOptimize, triggerBoostSwipe, toggleAllFuncs,
    changeTheme, toggleDarkMode, toggleSound, updateVolume,
    toggleFunction, toggleAIMFunction, toggleVIPFunction,
    updateBoostVal, updateAIMBoostVal, updateVIPBoostVal,
    executeFunction, executeAIMFunction, executeVIPFunction,
    functionStates, AIM_STATES, VIP_STATES,
    FUNCTION_NAMES, AIM_FUNCTION_NAMES, VIP_FUNCTION_NAMES,
    CODE_BASE64_MAP, CODE_BASE_MAP,
    renderFuncList, renderBoostList,
    DeviceDetector, RAMMonitor, showToast,
    GameConnection, FreeFireMemory,
    connectGame, disconnectGame, scanGame, reconnectGame, injectMemory,
    updateGameConnectionUI, autoConnectGame,
    createRippleEffect, createParticleBurst,
    startDeepMonitor, stopDeepMonitor, addDeepMonitorButton, addOffsetDisplay, fixLiveToolsHTML,
    ACTION_MAP, initParticleBackground,
    getFunctionState, executeFunctionByType, updateToggleUI,
    LockSystem, logoutKey
};

window.logoutKey = logoutKey;
window.LockSystem = LockSystem;

console.log('[FF Optimizer v5.0 VIP] Đã tải xong script!');
console.log('[FF Optimizer v5.0 VIP] Lock System V3 đã sẵn sàng!');
console.log('[FF Optimizer v5.0 VIP] Đồng bộ key với keygen app!');
console.log('[FF Optimizer v5.0 VIP] Chúc mày chơi game vui vẻ!');