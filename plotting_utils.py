# -*- coding: utf-8 -*-
"""
Plotting and Visualization Utilities
Harita ve görselleştirme fonksiyonları
"""

import os
from datetime import datetime
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature
from weather_utils import BBOX, OUTPUT_DIR

def plot_weather_map(processed_data, dates, bbox=BBOX, save_path=None):
    """Birleşik hava durumu haritası çiz"""
    print("[STEP] Plotting combined map ...")
    
    # Veri al
    precip_mm_day = processed_data['precipitation_mm_day']
    temp_s = processed_data['temperature_c']
    u_s = processed_data['u_wind']
    v_s = processed_data['v_wind']
    aero_s = processed_data['aerosol']
    drought_index = processed_data['drought_index']
    
    # Harita oluştur
    fig = plt.figure(figsize=(12, 10))
    ax = plt.axes(projection=ccrs.PlateCarree())
    ax.set_extent([bbox[0], bbox[2], bbox[1], bbox[3]], crs=ccrs.PlateCarree())
    
    # Harita özellikleri
    ax.add_feature(cfeature.COASTLINE, linewidth=0.6)
    ax.add_feature(cfeature.BORDERS, linewidth=0.6)
    ax.add_feature(cfeature.LAND, alpha=0.3, color='lightgray')
    ax.add_feature(cfeature.OCEAN, alpha=0.3, color='lightblue')
    
    # Grid
    gl = ax.gridlines(draw_labels=True, linewidth=0.5, color='gray', alpha=0.6, linestyle='--')
    gl.top_labels = False
    gl.right_labels = False
    
    # Yağış (mavi tonlar)
    if precip_mm_day is not None:
        im1 = precip_mm_day.plot(ax=ax, transform=ccrs.PlateCarree(), 
                               cmap="Blues", alpha=0.85, add_colorbar=False)
        plt.colorbar(im1, ax=ax, fraction=0.037, pad=0.02).set_label("Yağış (mm/gün)")
    
    # Kuraklık indeksi (kırmızı tonlar)
    im2 = drought_index.plot(ax=ax, transform=ccrs.PlateCarree(), 
                           cmap="Reds", alpha=0.38, add_colorbar=False)
    plt.colorbar(im2, ax=ax, fraction=0.037, pad=0.1).set_label("Kuraklık İndeksi (0..1)")
    
    # Sıcaklık konturları
    temp_s.plot.contour(ax=ax, transform=ccrs.PlateCarree(), 
                       colors='k', linewidths=0.6, add_colorbar=False, levels=10)
    
    # Rüzgar vektörleri
    if u_s is not None and v_s is not None:
        skip = (slice(None, None, 6), slice(None, None, 6))
        ax.quiver(u_s["lon"].values[skip[1]], u_s["lat"].values[skip[0]],
                 u_s.values[skip], v_s.values[skip], 
                 transform=ccrs.PlateCarree(), color='gray', scale=300, alpha=0.7)
    
    # Aerosol
    if aero_s is not None:
        aero_s.plot(ax=ax, transform=ccrs.PlateCarree(), 
                   cmap="YlGnBu_r", alpha=0.25, add_colorbar=False)
    
    # Başlık
    plt.title(f'Hava Durumu Analizi - {dates[0]} / {dates[1]}', fontsize=14, pad=20)
    
    # Kaydet
    if save_path is None:
        save_path = os.path.join(OUTPUT_DIR, f"weather_map_{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}.png")
    
    plt.savefig(save_path, dpi=220, bbox_inches='tight')
    plt.close(fig)
    
    print(f"[DONE] Harita kaydedildi: {save_path}")
    return save_path

def create_quick_plot(processed_data, dates, bbox=BBOX):
    """Hızlı önizleme haritası"""
    temp_s = processed_data['temperature_c']
    drought_index = processed_data['drought_index']
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6), 
                                  subplot_kw={'projection': ccrs.PlateCarree()})
    
    # Sıcaklık haritası
    ax1.set_extent([bbox[0], bbox[2], bbox[1], bbox[3]], crs=ccrs.PlateCarree())
    ax1.add_feature(cfeature.COASTLINE)
    ax1.add_feature(cfeature.BORDERS)
    temp_s.plot(ax=ax1, transform=ccrs.PlateCarree(), cmap="RdYlBu_r")
    ax1.set_title('Sıcaklık (°C)')
    
    # Kuraklık haritası
    ax2.set_extent([bbox[0], bbox[2], bbox[1], bbox[3]], crs=ccrs.PlateCarree())
    ax2.add_feature(cfeature.COASTLINE)
    ax2.add_feature(cfeature.BORDERS)
    drought_index.plot(ax=ax2, transform=ccrs.PlateCarree(), cmap="Reds")
    ax2.set_title('Kuraklık İndeksi')
    
    plt.tight_layout()
    save_path = os.path.join(OUTPUT_DIR, f"quick_plot_{datetime.utcnow().strftime('%Y%m%dT%H%M%S')}.png")
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close(fig)
    
    return save_path
