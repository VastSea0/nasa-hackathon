#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
NASA Weather Analysis - Main Application
Modüler hava durumu analiz uygulaması
"""

import sys
import json
from datetime import datetime

# Kendi modüllerimizi import et
from weather_utils import (
    ensure_output_dir, login_earthaccess, fetch_weather_data, 
    extract_variables, process_variables, create_summary
)
from plotting_utils import plot_weather_map, create_quick_plot
from ai_analysis import call_gemini_analysis, format_analysis_output

def get_user_dates():
    """Kullanıcıdan tarih aralığını al"""
    try:
        start_date = input("Başlangıç tarihi (YYYY-MM-DD): ").strip()
        end_date = input("Bitiş tarihi (YYYY-MM-DD): ").strip()
        
        # Basit format kontrolü
        datetime.strptime(start_date, '%Y-%m-%d')
        datetime.strptime(end_date, '%Y-%m-%d')
        
        return (start_date, end_date)
    except ValueError:
        print("❌ Hatalı tarih formatı! YYYY-MM-DD formatında girin.")
        return get_user_dates()
    except KeyboardInterrupt:
        print("\n👋 Program sonlandırıldı.")
        sys.exit(0)

def main():
    """Ana uygulama"""
    print("🛰️  NASA Hava Durumu Analizi")
    print("=" * 40)
    
    # Output klasörünü hazırla
    ensure_output_dir()
    
    # EarthAccess login (bir kez yapılır)
    print("\n🔐 NASA EarthAccess'e bağlanıyor...")
    if not login_earthaccess():
        print("❌ EarthAccess bağlantısı başarısız!")
        print("💡 NASA EarthData hesabınızla giriş yapmanız gerekiyor.")
        print("   https://urs.earthdata.nasa.gov/ adresinden hesap oluşturun.")
        return
    
    # Kullanıcıdan tarih al
    print("\n📅 Analiz için tarih aralığını girin:")
    user_dates = get_user_dates()
    
    try:
        # 1. Veri çekme
        print(f"\n📡 {user_dates[0]} - {user_dates[1]} için veri çekiliyor...")
        datasets = fetch_weather_data(dates=user_dates)
        
        # 2. Değişkenleri çıkarma
        print("🔄 Veri işleniyor...")
        variables = extract_variables(datasets)
        
        # 3. Veri işleme
        processed_data = process_variables(variables)
        
        # 4. Özet oluşturma
        summary = create_summary(processed_data, user_dates)
        
        # 5. Harita çizme
        print("🗺️  Harita oluşturuluyor...")
        map_path = plot_weather_map(processed_data, user_dates)
        summary['map_path'] = map_path
        
        # Hızlı önizleme de oluştur
        quick_path = create_quick_plot(processed_data, user_dates)
        summary['quick_plot_path'] = quick_path
        
        # 6. Temel sonuçları göster
        print("\n📊 HIZLI ÖZET:")
        print("-" * 30)
        if summary.get('temp_mean_C'):
            print(f"🌡️  Sıcaklık: {summary['temp_mean_C']:.1f}°C")
        if summary.get('precip_mean_mm_per_day'):
            print(f"🌧️  Yağış: {summary['precip_mean_mm_per_day']:.2f} mm/gün")
        if summary.get('wind_mean_m_s'):
            print(f"💨 Rüzgar: {summary['wind_mean_m_s']:.1f} m/s")
        print(f"🗺️  Harita: {map_path}")
        
        # 7. AI analizi (isteğe bağlı)
        print(f"\n🤖 AI analizi yapılsın mı? (y/n): ", end="")
        ai_choice = input().strip().lower()
        
        if ai_choice in ['y', 'yes', 'evet', 'e']:
            print("🧠 AI analizi başlatılıyor...")
            ai_response = call_gemini_analysis(summary)
            formatted_output = format_analysis_output(ai_response, summary)
            print(formatted_output)
        else:
            print("✅ Analiz tamamlandı!")
        
        # 8. JSON çıktısı kaydet
        output_file = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)
        print(f"💾 Detaylar kaydedildi: {output_file}")
        
    except KeyboardInterrupt:
        print("\n\n👋 Program kullanıcı tarafından durduruldu.")
    except Exception as e:
        print(f"\n❌ Hata oluştu: {e}")
        print("🔧 Lütfen internet bağlantınızı ve NASA hesap bilgilerinizi kontrol edin.")

if __name__ == "__main__":
    main()
