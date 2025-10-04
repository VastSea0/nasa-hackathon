#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NASA Weather Analysis - Flask Backend
Web API sunucusu
"""

from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import os
import json
import threading
from datetime import datetime
import traceback

# Kendi modüllerimizi import et
from weather_utils import (
    ensure_output_dir, login_earthaccess, login_earthaccess_with_credentials, fetch_weather_data, 
    extract_variables, process_variables, create_summary
)
from plotting_utils import plot_weather_map, create_quick_plot
from ai_analysis import call_gemini_analysis, format_analysis_output

app = Flask(__name__)
CORS(app)  # JavaScript frontend'den API çağrıları için

# Global değişkenler
earthaccess_logged_in = False
current_analysis = {}

@app.route('/')
def index():
    """Ana sayfa"""
    return render_template('index.html')

@app.route('/api/status')
def api_status():
    """API durumu"""
    return jsonify({
        'status': 'online',
        'earthaccess_logged_in': earthaccess_logged_in,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/login', methods=['POST'])
def api_login():
    """EarthAccess login"""
    global earthaccess_logged_in
    
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Kullanıcı adı ve şifre gerekli'
            }), 400
        
        ensure_output_dir()
        
        # EarthAccess login with credentials
        success = login_earthaccess_with_credentials(username, password)
        earthaccess_logged_in = success
        
        if success:
            return jsonify({
                'success': True,
                'message': 'EarthAccess login başarılı'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Kullanıcı adı veya şifre hatalı'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Login hatası: {str(e)}'
        }), 500

@app.route('/api/analyze', methods=['POST'])
def api_analyze():
    """Hava durumu analizi başlat"""
    global current_analysis
    
    try:
        data = request.get_json()
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        include_ai = data.get('include_ai', False)
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'message': 'Başlangıç ve bitiş tarihi gerekli'
            }), 400
        
        if not earthaccess_logged_in:
            return jsonify({
                'success': False,
                'message': 'Önce EarthAccess login yapmalısınız'
            }), 401
        
        # Analizi arka planda başlat
        analysis_id = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        current_analysis[analysis_id] = {
            'status': 'started',
            'progress': 0,
            'message': 'Analiz başlatılıyor...',
            'result': None
        }
        
        # Thread'de analizi çalıştır
        thread = threading.Thread(
            target=run_analysis_thread,
            args=(analysis_id, start_date, end_date, include_ai)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'analysis_id': analysis_id,
            'message': 'Analiz başlatıldı'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Analiz hatası: {str(e)}'
        }), 500

def run_analysis_thread(analysis_id, start_date, end_date, include_ai):
    """Analizi arka planda çalıştır"""
    global current_analysis
    
    try:
        user_dates = (start_date, end_date)
        
        # Progress güncelle
        current_analysis[analysis_id].update({
            'status': 'fetching_data',
            'progress': 20,
            'message': 'NASA verisi çekiliyor...'
        })
        
        # 1. Veri çekme
        datasets = fetch_weather_data(dates=user_dates)
        
        current_analysis[analysis_id].update({
            'progress': 40,
            'message': 'Veri işleniyor...'
        })
        
        # 2. Değişkenleri çıkarma ve işleme
        variables = extract_variables(datasets)
        processed_data = process_variables(variables)
        
        current_analysis[analysis_id].update({
            'progress': 60,
            'message': 'Özet oluşturuluyor...'
        })
        
        # 3. Özet oluşturma
        summary = create_summary(processed_data, user_dates)
        
        current_analysis[analysis_id].update({
            'progress': 70,
            'message': 'Harita çiziliyor...'
        })
        
        # 4. Harita çizme
        map_path = plot_weather_map(processed_data, user_dates)
        quick_path = create_quick_plot(processed_data, user_dates)
        
        # Dosya yollarını web için düzenle
        summary['map_path'] = map_path.replace('output/', '/api/files/')
        summary['quick_plot_path'] = quick_path.replace('output/', '/api/files/')
        
        current_analysis[analysis_id].update({
            'progress': 80,
            'message': 'AI analizi yapılıyor...' if include_ai else 'Analiz tamamlanıyor...'
        })
        
        # 5. AI analizi (isteğe bağlı)
        ai_result = None
        if include_ai:
            ai_response = call_gemini_analysis(summary)
            ai_result = format_analysis_output(ai_response, summary)
        
        # 6. Sonucu kaydet
        output_file = f"output/analysis_{analysis_id}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        
        # Analiz tamamlandı
        current_analysis[analysis_id].update({
            'status': 'completed',
            'progress': 100,
            'message': 'Analiz tamamlandı!',
            'result': {
                'summary': summary,
                'ai_analysis': ai_result,
                'output_file': output_file.replace('output/', '/api/files/')
            }
        })
        
    except Exception as e:
        error_msg = f"Analiz hatası: {str(e)}"
        print(f"[ERROR] {error_msg}")
        print(traceback.format_exc())
        
        current_analysis[analysis_id].update({
            'status': 'error',
            'progress': 0,
            'message': error_msg,
            'result': None
        })

@app.route('/api/progress/<analysis_id>')
def api_progress(analysis_id):
    """Analiz ilerlemesini kontrol et"""
    if analysis_id not in current_analysis:
        return jsonify({
            'success': False,
            'message': 'Analiz bulunamadı'
        }), 404
    
    return jsonify({
        'success': True,
        'data': current_analysis[analysis_id]
    })

@app.route('/api/files/<path:filename>')
def api_files(filename):
    """Output dosyalarını serve et"""
    return send_from_directory('output', filename)

@app.route('/api/history')
def api_history():
    """Geçmiş analizleri listele"""
    try:
        files = []
        output_dir = 'output'
        if os.path.exists(output_dir):
            for filename in os.listdir(output_dir):
                if filename.startswith('analysis_') and filename.endswith('.json'):
                    filepath = os.path.join(output_dir, filename)
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            files.append({
                                'filename': filename,
                                'dates': data.get('dates'),
                                'created': os.path.getctime(filepath),
                                'url': f'/api/files/{filename}'
                            })
                    except:
                        continue
        
        # Tarihe göre sırala (en yeni önce)
        files.sort(key=lambda x: x['created'], reverse=True)
        
        return jsonify({
            'success': True,
            'files': files
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Geçmiş listesi hatası: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Template klasörünü oluştur
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Flask server başlatılıyor...")
    print("🌐 Web arayüzü: http://localhost:5000")
    print("📡 API endpoint: http://localhost:5000/api")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
