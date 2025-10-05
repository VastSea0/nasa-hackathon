# -*- coding: utf-8 -*-
"""
AI Analysis with Gemini
Google Gemini API ile analiz fonksiyonları
"""

import json
import os

try:
    from google import genai
    from google.genai import types
except Exception:
    genai = None
    types = None
    print("[WARN] google-genai not available. AI analysis will be skipped.")

def get_api_key():
    """API anahtarını al (environment variable'dan)"""
    return os.getenv('GEMINI_API_KEY', None)

def call_gemini_analysis(analysis_dict, model_name="gemini-2.0-flash-exp", thinking_budget=0, custom_prompt=None):
    """Gemini ile hava durumu analizi yap"""
    if genai is None or types is None:
        print("[WARN] google-genai not installed/importable. Skipping Gemini call.")
        return None
    
    api_key = get_api_key()
    if not api_key or api_key == "skillissue":
        print("[WARN] GEMINI_API_KEY not set. Skipping Gemini call.")
        print("[INFO] Export GEMINI_API_KEY=your_key için: export GEMINI_API_KEY=your_api_key")
        return None

    try:
        client = genai.Client(api_key=api_key)
        
        # Use custom prompt if provided, otherwise use default Turkish prompt
        if custom_prompt:
            user_text = f"""
{custom_prompt}

Weather Data for Analysis:
{json.dumps(analysis_dict, indent=2, ensure_ascii=False)}

Please provide your analysis based on the above context and data.
"""
        else:
            # Türkçe prompt (default)
            user_text = f"""
Türkiye bölgesi için hava durumu analizi:
Tarih Aralığı: {analysis_dict.get('dates')}
Bölge: {analysis_dict.get('bbox')} (lat/lon)

Analiz Verileri:
{json.dumps(analysis_dict, indent=2, ensure_ascii=False)}

Lütfen aşağıdaki formatta Türkçe analiz yapın:

1. ÖZET (3 cümle): Genel hava durumu durumu
2. RİSKLER:
   - Tarım: Çiftçiler için riskler
   - Sağlık: Halk sağlığı riskleri  
   - Ulaşım: Trafik ve taşımacılık riskleri
3. ÖNERİLER (3 madde): Pratik öneriler

JSON formatında yanıt verin: {{"ozet": "...", "riskler": {{"tarim": "...", "saglik": "...", "ulasim": "..."}}, "oneriler": ["...", "...", "..."]}}
"""
        
        contents = [types.Content(role="user", parts=[types.Part.from_text(text=user_text)])]
        generate_content_config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=thinking_budget),
            tools=[]
        )

        print("[LLM] Gemini'ye gönderiliyor...")
        collected = ""
        for chunk in client.models.generate_content_stream(
            model=model_name, contents=contents, config=generate_content_config
        ):
            text = getattr(chunk, "text", None)
            if text:
                print(text, end="", flush=True)
                collected += text
        
        print("\n[LLM] Analiz tamamlandı.")
        return collected
        
    except Exception as e:
        print(f"[ERROR] Gemini API hatası: {e}")
        return None

def format_analysis_output(gemini_response, summary):
    """Gemini yanıtını güzel formatla"""
    if not gemini_response:
        return format_basic_summary(summary)
    
    try:
        # JSON parse etmeye çalış
        if gemini_response.strip().startswith('{'):
            analysis = json.loads(gemini_response)
            return format_json_analysis(analysis)
        else:
            return format_text_analysis(gemini_response)
    except:
        return format_text_analysis(gemini_response)

def format_json_analysis(analysis):
    """JSON formatındaki analizi formatla"""
    output = "\n" + "="*50 + "\n"
    output += "🌤️  HAVA DURUMU ANALİZİ\n"
    output += "="*50 + "\n\n"
    
    if 'ozet' in analysis:
        output += "📋 ÖZET:\n"
        output += f"{analysis['ozet']}\n\n"
    
    if 'riskler' in analysis:
        output += "⚠️  RİSKLER:\n"
        risks = analysis['riskler']
        if isinstance(risks, dict):
            for key, value in risks.items():
                output += f"• {key.title()}: {value}\n"
        else:
            output += f"{risks}\n"
        output += "\n"
    
    if 'oneriler' in analysis:
        output += "💡 ÖNERİLER:\n"
        recommendations = analysis['oneriler']
        if isinstance(recommendations, list):
            for i, rec in enumerate(recommendations, 1):
                output += f"{i}. {rec}\n"
        else:
            output += f"{recommendations}\n"
    
    return output

def format_text_analysis(text):
    """Düz metin analizini formatla"""
    output = "\n" + "="*50 + "\n"
    output += "🌤️  HAVA DURUMU ANALİZİ\n"
    output += "="*50 + "\n\n"
    output += text
    return output

def format_basic_summary(summary):
    """Temel özet formatla (AI olmadan)"""
    output = "\n" + "="*50 + "\n"
    output += "📊 HAVA DURUMU ÖZETİ\n"
    output += "="*50 + "\n\n"
    
    output += f"📅 Tarih: {summary.get('dates', 'N/A')}\n"
    output += f"📍 Bölge: {summary.get('bbox', 'N/A')}\n\n"
    
    if summary.get('temp_mean_C') is not None:
        output += f"🌡️  Ortalama Sıcaklık: {summary['temp_mean_C']:.1f}°C\n"
    
    if summary.get('precip_mean_mm_per_day') is not None:
        output += f"🌧️  Ortalama Yağış: {summary['precip_mean_mm_per_day']:.2f} mm/gün\n"
    
    if summary.get('wind_mean_m_s') is not None:
        output += f"💨 Ortalama Rüzgar: {summary['wind_mean_m_s']:.1f} m/s\n"
    
    if summary.get('drought_index_mean') is not None:
        drought_level = "Yüksek" if summary['drought_index_mean'] > 0.7 else "Orta" if summary['drought_index_mean'] > 0.3 else "Düşük"
        output += f"🌵 Kuraklık Riski: {drought_level} ({summary['drought_index_mean']:.2f})\n"
    
    return output
