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

@app.route('/api/personalized-prediction', methods=['POST'])
def api_personalized_prediction():
    """Personalized weather prediction with user profile"""
    global current_analysis
    
    try:
        data = request.get_json()
        start_date = data.get('startDate')
        end_date = data.get('endDate')
        custom_query = data.get('customQuery', '')
        user_profile = data.get('userProfile', {})
        
        if not start_date or not end_date:
            return jsonify({
                'success': False,
                'message': 'Start and end dates are required'
            }), 400
        
        if not earthaccess_logged_in:
            return jsonify({
                'success': False,
                'message': 'EarthAccess login required'
            }), 401
        
        # Generate unique analysis ID
        analysis_id = f"prediction_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Initialize progress tracking
        current_analysis[analysis_id] = {
            'status': 'starting',
            'progress': 0,
            'message': 'Initializing personalized prediction...',
            'user_profile': user_profile,
            'start_date': start_date,
            'end_date': end_date,
            'custom_query': custom_query
        }
        
        # Start prediction in background thread
        def run_personalized_prediction():
            try:
                current_analysis[analysis_id]['status'] = 'running'
                current_analysis[analysis_id]['progress'] = 10
                current_analysis[analysis_id]['message'] = 'Fetching future weather data...'
                
                # For future predictions, we'll use historical patterns and trends
                # This is a simplified approach - in a real system you'd use proper forecasting models
                
                # Step 1: Fetch recent historical data for pattern analysis
                current_analysis[analysis_id]['progress'] = 30
                current_analysis[analysis_id]['message'] = 'Analyzing weather patterns...'
                
                # Use recent data to establish patterns
                import datetime as dt
                recent_start = (dt.datetime.strptime(start_date, '%Y-%m-%d') - dt.timedelta(days=365)).strftime('%Y-%m-%d')
                recent_end = (dt.datetime.strptime(start_date, '%Y-%m-%d') - dt.timedelta(days=1)).strftime('%Y-%m-%d')
                
                datasets = fetch_weather_data(dates=(recent_start, recent_end))
                variables = extract_variables(datasets)
                processed_data = process_variables(variables)
                
                # Step 2: Create base forecast summary
                current_analysis[analysis_id]['progress'] = 50
                current_analysis[analysis_id]['message'] = 'Creating base forecast...'
                
                base_summary = create_summary(processed_data, (start_date, end_date))
                
                # Step 3: Generate personalized AI analysis
                current_analysis[analysis_id]['progress'] = 70
                current_analysis[analysis_id]['message'] = 'Generating personalized insights...'
                
                # Create personalized prompt based on user profile
                personalized_prompt = create_personalized_prompt(user_profile, base_summary, custom_query, (start_date, end_date))
                
                ai_response = call_gemini_analysis(base_summary, custom_prompt=personalized_prompt)
                
                # Step 4: Format personalized output
                current_analysis[analysis_id]['progress'] = 90
                current_analysis[analysis_id]['message'] = 'Finalizing personalized prediction...'
                
                formatted_output = format_personalized_analysis(ai_response, base_summary, user_profile, (start_date, end_date))
                
                # Save results
                save_path = f"output/prediction_{analysis_id}.json"
                with open(save_path, 'w', encoding='utf-8') as f:
                    json.dump(formatted_output, f, ensure_ascii=False, indent=2)
                
                current_analysis[analysis_id]['status'] = 'completed'
                current_analysis[analysis_id]['progress'] = 100
                current_analysis[analysis_id]['message'] = 'Personalized prediction complete!'
                current_analysis[analysis_id]['result'] = formatted_output
                
            except Exception as e:
                current_analysis[analysis_id]['status'] = 'error'
                current_analysis[analysis_id]['message'] = f'Prediction error: {str(e)}'
                print(f"Personalized prediction error: {traceback.format_exc()}")
        
        # Start background thread
        thread = threading.Thread(target=run_personalized_prediction)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'analysisId': analysis_id,
            'message': 'Personalized prediction started'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Prediction start error: {str(e)}'
        }), 500

@app.route('/api/prediction-progress/<analysis_id>')
def api_prediction_progress(analysis_id):
    """Get personalized prediction progress"""
    try:
        if analysis_id not in current_analysis:
            return jsonify({
                'success': False,
                'message': 'Analysis not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': current_analysis[analysis_id]
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Progress check error: {str(e)}'
        }), 500

def create_personalized_prompt(user_profile, base_summary, custom_query, dates):
    """Create a personalized prompt based on user profile"""
    
    # Extract user information
    name = user_profile.get('name', 'User')
    purpose = user_profile.get('purpose', '')
    activities = user_profile.get('activities', [])
    health_conditions = user_profile.get('healthConditions', [])
    lifestyle = user_profile.get('lifestyle', '')
    location = user_profile.get('location', '')
    data_interests = user_profile.get('dataInterests', [])
    
    # Build personalized context
    context_parts = [
        f"This is a personalized weather prediction for {name} in {location}.",
        f"Prediction period: {dates[0]} to {dates[1]}",
    ]
    
    if purpose:
        purpose_map = {
            'daily_planning': 'daily planning and routine activities',
            'sports': 'sports and fitness activities',
            'travel': 'travel planning',
            'agriculture': 'agricultural activities and farming',
            'events': 'event planning and outdoor gatherings',
            'health': 'health monitoring and medical conditions',
            'business': 'business operations',
            'research': 'scientific research'
        }
        context_parts.append(f"Primary use case: {purpose_map.get(purpose, purpose)}")
    
    if activities:
        context_parts.append(f"Regular activities: {', '.join(activities)}")
    
    if health_conditions and 'none' not in health_conditions:
        context_parts.append(f"Health considerations: {', '.join(health_conditions)}")
    
    if lifestyle:
        lifestyle_map = {
            'early_bird': 'prefers morning activities',
            'night_owl': 'more active in evenings',
            'indoor_focused': 'primarily indoor lifestyle',
            'outdoor_enthusiast': 'loves outdoor activities',
            'flexible': 'adapts plans based on weather',
            'scheduled': 'follows fixed daily routines'
        }
        context_parts.append(f"Lifestyle: {lifestyle_map.get(lifestyle, lifestyle)}")
    
    if data_interests:
        context_parts.append(f"Particularly interested in: {', '.join(data_interests)}")
    
    context = "\n".join(context_parts)
    
    # Create the prompt
    prompt = f"""
{context}

User's specific question: {custom_query}

Please provide a comprehensive weather prediction that includes:

1. NUMERICAL FORECAST:
   - Specific temperature ranges, precipitation probabilities, humidity levels, wind speeds, etc.
   - Day-by-day breakdown for the prediction period

2. PERSONALIZED INSIGHTS:
   - How the weather will affect their specific activities and lifestyle
   - Recommendations tailored to their health conditions (if any)
   - Best/worst days for their typical activities
   - Timing recommendations based on their lifestyle preferences

3. ACTIONABLE RECOMMENDATIONS:
   - What to wear or bring each day
   - Activity planning suggestions
   - Health alerts or precautions
   - Schedule optimization tips

4. WARNINGS & TIPS:
   - Any weather-related risks for their profile
   - Preparation suggestions
   - Alternative indoor activities if needed

Make the response conversational and personal, addressing them by name and referencing their specific needs and preferences. Focus on practical, actionable advice that helps them make informed decisions.
"""
    
    return prompt

def format_personalized_analysis(ai_response, base_summary, user_profile, dates):
    """Format the personalized analysis output"""
    
    return {
        'type': 'personalized_prediction',
        'user_profile': {
            'name': user_profile.get('name'),
            'location': user_profile.get('location'),
            'purpose': user_profile.get('purpose'),
            'preferences': user_profile.get('predictionPreferences', {})
        },
        'prediction_period': {
            'start_date': dates[0],
            'end_date': dates[1]
        },
        'base_data': base_summary,
        'personalized_analysis': ai_response,
        'timestamp': datetime.now().isoformat(),
        'version': '1.0'
    }

if __name__ == '__main__':
    # Template klasörünü oluştur
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static', exist_ok=True)
    
    print("🚀 Flask server başlatılıyor...")
    print("🌐 Web arayüzü: http://localhost:5000")
    print("📡 API endpoint: http://localhost:5000/api")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
