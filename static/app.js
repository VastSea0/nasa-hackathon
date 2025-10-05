// NASA Weather Analysis - Frontend JavaScript
// Web arayüzü için JavaScript fonksiyonları

class WeatherApp {
    constructor() {
        this.currentAnalysisId = null;
        this.progressTimer = null;
        this.init();
    }

    init() {
        this.checkStatus();
        this.loadHistory();
        this.setDefaultDates();
    }

    // Varsayılan tarihleri ayarla (son 30 gün)
    setDefaultDates() {
        const today = new Date();
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        document.getElementById('startDate').value = lastMonth.toISOString().split('T')[0];
    }

    // API durumunu kontrol et
    async checkStatus() {
        try {
            const response = await fetch('/api/status');
            const data = await response.json();
            
            this.updateStatusIndicator(true, data.earthaccess_logged_in);
        } catch (error) {
            this.updateStatusIndicator(false, false);
            this.showMessage('Sunucuya bağlanılamıyor!', 'error');
        }
    }

    // Durum göstergesini güncelle
    updateStatusIndicator(serverOnline, earthaccessLoggedIn) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const loginBtn = document.getElementById('loginBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');

        if (!serverOnline) {
            statusDot.className = 'status-dot';
            statusText.textContent = 'Sunucu çevrimdışı';
            loginBtn.disabled = true;
            analyzeBtn.disabled = true;
        } else if (earthaccessLoggedIn) {
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'NASA EarthAccess bağlı ✅';
            loginBtn.textContent = '✅ Bağlı';
            loginBtn.disabled = true;
            analyzeBtn.disabled = false;
        } else {
            statusDot.className = 'status-dot';
            statusText.textContent = 'NASA login gerekli';
            loginBtn.disabled = false;
            analyzeBtn.disabled = true;
        }
    }

    // NASA login
    async handleLogin() {
        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.textContent;
        
        loginBtn.textContent = '🔄 Bağlanıyor...';
        loginBtn.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showMessage('NASA EarthAccess bağlantısı başarılı! 🎉', 'success');
                this.updateStatusIndicator(true, true);
            } else {
                this.showMessage(`Login başarısız: ${data.message}`, 'error');
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        } catch (error) {
            this.showMessage('Login sırasında hata oluştu!', 'error');
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    }

    // Analiz başlat
    async handleAnalysis(event) {
        event.preventDefault();
        
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const includeAI = document.getElementById('includeAI').checked;

        if (!startDate || !endDate) {
            this.showMessage('Lütfen başlangıç ve bitiş tarihlerini girin!', 'error');
            return;
        }

        // Form elemanlarını devre dışı bırak
        this.toggleFormElements(false);
        this.showProgressSection(true);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    start_date: startDate,
                    end_date: endDate,
                    include_ai: includeAI
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentAnalysisId = data.analysis_id;
                this.showMessage('Analiz başlatıldı! İlerleme takip ediliyor...', 'info');
                this.startProgressTracking();
            } else {
                this.showMessage(`Analiz başlatılamadı: ${data.message}`, 'error');
                this.resetForm();
            }
        } catch (error) {
            this.showMessage('Analiz başlatılırken hata oluştu!', 'error');
            this.resetForm();
        }
    }

    // Form elemanlarını enable/disable et
    toggleFormElements(enabled) {
        const form = document.getElementById('analysisForm');
        const elements = form.querySelectorAll('input, button');
        elements.forEach(el => el.disabled = !enabled);
    }

    // Progress bölümünü göster/gizle
    showProgressSection(show) {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = show ? 'block' : 'none';
        
        if (!show) {
            this.updateProgress(0, '');
        }
    }

    // Progress takibini başlat
    startProgressTracking() {
        this.progressTimer = setInterval(() => {
            this.checkProgress();
        }, 2000);
    }

    // Progress durumunu kontrol et
    async checkProgress() {
        if (!this.currentAnalysisId) return;

        try {
            const response = await fetch(`/api/progress/${this.currentAnalysisId}`);
            const data = await response.json();

            if (data.success) {
                const progress = data.data;
                this.updateProgress(progress.progress, progress.message);

                if (progress.status === 'completed') {
                    this.handleAnalysisComplete(progress.result);
                } else if (progress.status === 'error') {
                    this.handleAnalysisError(progress.message);
                }
            }
        } catch (error) {
            console.error('Progress kontrol hatası:', error);
        }
    }

    // Progress bar güncelle
    updateProgress(percent, message) {
        const progressFill = document.getElementById('progressFill');
        const progressMessage = document.getElementById('progressMessage');

        progressFill.style.width = `${percent}%`;
        progressFill.textContent = `${percent}%`;
        progressMessage.textContent = message;
    }

    // Analiz tamamlandığında
    handleAnalysisComplete(result) {
        clearInterval(this.progressTimer);
        this.showMessage('Analiz başarıyla tamamlandı! 🎉', 'success');
        
        this.displayResults(result);
        this.resetForm();
        this.loadHistory();
    }

    // Analiz hata durumunda
    handleAnalysisError(message) {
        clearInterval(this.progressTimer);
        this.showMessage(`Analiz hatası: ${message}`, 'error');
        this.resetForm();
    }

    // Formu sıfırla
    resetForm() {
        this.toggleFormElements(true);
        this.showProgressSection(false);
        this.currentAnalysisId = null;
    }

    // Sonuçları göster
    displayResults(result) {
        const resultsSection = document.getElementById('resultsSection');
        const summaryGrid = document.getElementById('summaryGrid');
        const imageGallery = document.getElementById('imageGallery');
        const aiAnalysis = document.getElementById('aiAnalysis');

        resultsSection.classList.add('show');

        // Özet verilerini göster
        this.displaySummary(result.summary, summaryGrid);
        
        // Haritaları göster
        this.displayImages(result.summary, imageGallery);

        // AI analizini göster
        if (result.ai_analysis) {
            this.displayAIAnalysis(result.ai_analysis, aiAnalysis);
        }

        // Sayfayı sonuçlara kaydır
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Özet verilerini göster
    displaySummary(summary, container) {
        const items = [
            {
                icon: '🌡️',
                value: summary.temp_mean_C ? `${summary.temp_mean_C.toFixed(1)}°C` : 'N/A',
                label: 'Ortalama Sıcaklık'
            },
            {
                icon: '🌧️',
                value: summary.precip_mean_mm_per_day ? `${summary.precip_mean_mm_per_day.toFixed(2)} mm/gün` : 'N/A',
                label: 'Ortalama Yağış'
            },
            {
                icon: '💨',
                value: summary.wind_mean_m_s ? `${summary.wind_mean_m_s.toFixed(1)} m/s` : 'N/A',
                label: 'Ortalama Rüzgar'
            },
            {
                icon: '🌵',
                value: summary.drought_index_mean ? `${(summary.drought_index_mean * 100).toFixed(0)}%` : 'N/A',
                label: 'Kuraklık İndeksi'
            }
        ];

        container.innerHTML = items.map(item => `
            <div class="summary-item">
                <div class="icon">${item.icon}</div>
                <div class="value">${item.value}</div>
                <div class="label">${item.label}</div>
            </div>
        `).join('');
    }

    // Harita görsellerini göster
    displayImages(summary, container) {
        const images = [];
        
        if (summary.map_path) {
            images.push({
                src: summary.map_path,
                title: 'Detaylı Hava Durumu Haritası'
            });
        }
        
        if (summary.quick_plot_path) {
            images.push({
                src: summary.quick_plot_path,
                title: 'Hızlı Önizleme'
            });
        }

        container.innerHTML = images.map(img => `
            <div class="image-item">
                <h4>${img.title}</h4>
                <img src="${img.src}" alt="${img.title}" onclick="window.open('${img.src}', '_blank')">
            </div>
        `).join('');
    }

    // AI analizini göster
    displayAIAnalysis(analysis, container) {
        document.getElementById('aiContent').innerHTML = `<pre>${analysis}</pre>`;
        container.style.display = 'block';
    }

    // Geçmiş analizleri yükle
    async loadHistory() {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();

            if (data.success) {
                this.displayHistory(data.files);
            }
        } catch (error) {
            console.error('Geçmiş yüklenirken hata:', error);
        }
    }

    // Geçmiş analizleri göster
    displayHistory(files) {
        const historyList = document.getElementById('historyList');

        if (files.length === 0) {
            historyList.innerHTML = '<p>Henüz analiz geçmişi yok.</p>';
            return;
        }

        historyList.innerHTML = files.map(file => {
            const date = new Date(file.created * 1000).toLocaleString('tr-TR');
            return `
                <div class="history-item">
                    <div>
                        <strong>${file.dates ? file.dates.join(' - ') : 'Bilinmeyen tarih'}</strong><br>
                        <small>${date}</small>
                    </div>
                    <button class="btn" onclick="window.open('${file.url}', '_blank')">
                        📊 İndir
                    </button>
                </div>
            `;
        }).join('');
    }

    // Mesaj göster
    showMessage(text, type = 'info') {
        const messagesContainer = document.getElementById('messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        messagesContainer.appendChild(messageDiv);

        // 5 saniye sonra mesajı kaldır
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }
}

// Global fonksiyonlar (HTML'den çağrılabilir)
let app;

function handleLogin() {
    app.handleLogin();
}

function handleAnalysis(event) {
    app.handleAnalysis(event);
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    app = new WeatherApp();
});
