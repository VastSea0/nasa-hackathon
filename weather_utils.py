# -*- coding: utf-8 -*-
"""
NASA Weather Data Analysis Utilities
Meteorolojik veri analizi için yardımcı fonksiyonlar
"""

import os
import sys
import traceback
from datetime import datetime
import json

import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
import cartopy.crs as ccrs
import cartopy.feature as cfeature

try:
    import earthaccess
except Exception:
    print("ERROR: earthaccess import failed. earthaccess konfigürasyonu gerekli.")
    raise

# Config
BBOX = (26, 36, 45, 42)  # Türkiye ve çevresi
DATES = ("2025-09-01", "2025-10-02")
TIME_INDEX = 0
OUTPUT_DIR = "output"

def ensure_output_dir():
    """Output klasörünü oluştur"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def login_earthaccess():
    """EarthAccess'e giriş yap (bir kez yapılır)"""
    try:
        earthaccess.login()
        print("[INFO] EarthAccess login başarılı")
        return True
    except Exception as e:
        print(f"[ERROR] EarthAccess login hatası: {e}")
        return False

def login_earthaccess_with_credentials(username, password):
    """EarthAccess'e kullanıcı adı ve şifre ile giriş yap"""
    try:
        # Set environment variables for earthaccess
        import os
        os.environ['EARTHDATA_USERNAME'] = username
        os.environ['EARTHDATA_PASSWORD'] = password
        
        # Try to login with provided credentials
        earthaccess.login()
        print("[INFO] EarthAccess login başarılı (credentials)")
        return True
    except Exception as e:
        print(f"[ERROR] EarthAccess credentials login hatası: {e}")
        return False

def search_and_open(short_name, dates=DATES, bbox=BBOX, fail_on_empty=True):
    """NASA veri setini ara ve aç"""
    print(f"[INFO] Searching {short_name} for {dates} @ bbox={bbox} ...")
    results = earthaccess.search_data(short_name=short_name, temporal=dates, bounding_box=bbox, cloud_hosted=True)
    if not results:
        if fail_on_empty:
            raise RuntimeError(f"No results for {short_name} {dates} {bbox}")
        return None
    files = earthaccess.open(results[0:1])
    if not files:
        raise RuntimeError(f"earthaccess.open returned no file objects for {short_name}")
    ds = xr.open_dataset(files[0])
    print(f"[INFO] Opened dataset {short_name}. Variables: {list(ds.variables.keys())[:10]} ...")
    return ds

def safe_var(ds, names):
    """Veri setinden güvenli değişken alma"""
    for n in names:
        if n in ds.variables:
            return ds[n]
    raise KeyError(f"None of {names} found. Available: {list(ds.variables.keys())[:20]}")

def subset_time_space(da, time_index=TIME_INDEX, bbox=BBOX):
    """Veriyi zaman ve mekan olarak alt kümeye ayır"""
    lon_min, lat_min, lon_max, lat_max = bbox
    if 'lon' in da.coords:
        lon = da.coords['lon']
        try:
            if float(lon.max()) > 180:
                da = da.assign_coords(lon=(((da.lon + 180) % 360) - 180)).sortby('lon')
        except Exception:
            pass
    if 'time' in da.dims:
        da = da.isel(time=time_index)
    return da.sel(lon=slice(lon_min, lon_max), lat=slice(lat_min, lat_max))

def fetch_weather_data(dates=DATES):
    """Tüm hava durumu verilerini çek"""
    print("[STEP] Fetching datasets...")
    
    # Ana meteoroloji verileri
    ds_atm = search_and_open("M2T1NXSLV", dates=dates)
    ds_flx = search_and_open("M2T1NXFLX", dates=dates, fail_on_empty=False)
    ds_lnd = search_and_open("M2T1NXLND", dates=dates, fail_on_empty=False)
    ds_aer = search_and_open("M2T1NXAER", dates=dates, fail_on_empty=False)
    
    return {
        'atmospheric': ds_atm,
        'flux': ds_flx,
        'land': ds_lnd,
        'aerosol': ds_aer
    }

def extract_variables(datasets):
    """Veri setlerinden değişkenleri çıkar"""
    ds_atm = datasets['atmospheric']
    ds_flx = datasets['flux']
    ds_lnd = datasets['land']
    ds_aer = datasets['aerosol']
    
    # Yağış
    precip = None
    if ds_flx is not None:
        for cand in ["PRECTOT", "PRECTOTCORR", "PRATE", "PRECIP", "PRECC"]:
            if cand in ds_flx.variables:
                precip = ds_flx[cand]
                break
    
    # Sıcaklık
    temp = safe_var(ds_atm, ["T2M", "TMP2m", "TEMP_2M", "T2MDEW", "T10M"])
    
    # Rüzgar
    u_wind = None
    v_wind = None
    for u_c in ["U10M", "U2M", "U_10M", "U10", "U10M_AV"]:
        if u_c in ds_atm.variables:
            u_wind = ds_atm[u_c]
            break
    for v_c in ["V10M", "V2M", "V_10M", "V10", "V10M_AV"]:
        if v_c in ds_atm.variables:
            v_wind = ds_atm[v_c]
            break
    
    # Toprak nemi
    soil = None
    if ds_lnd is not None:
        for cand in ["GWETROOT", "GWETPROF", "GWETTOP", "SOILM", "SMROOT"]:
            if cand in ds_lnd.variables:
                soil = ds_lnd[cand]
                break
    
    # Aerosol
    aerosol = None
    if ds_aer is not None:
        for cand in ["TOTEXTTAU", "AOD", "AOD550", "DUEXTTAU", "DUCMASS"]:
            if cand in ds_aer.variables:
                aerosol = ds_aer[cand]
                break
    
    return {
        'precipitation': precip,
        'temperature': temp,
        'u_wind': u_wind,
        'v_wind': v_wind,
        'soil_moisture': soil,
        'aerosol': aerosol
    }

def process_variables(variables, bbox=BBOX, time_index=TIME_INDEX):
    """Değişkenleri işle ve türetilmiş veriler oluştur"""
    # Alt kümelere ayır
    precip_s = subset_time_space(variables['precipitation'], time_index, bbox) if variables['precipitation'] is not None else None
    temp_s = subset_time_space(variables['temperature'], time_index, bbox) - 273.15  # Kelvin'den Celsius'a
    u_s = subset_time_space(variables['u_wind'], time_index, bbox) if variables['u_wind'] is not None else None
    v_s = subset_time_space(variables['v_wind'], time_index, bbox) if variables['v_wind'] is not None else None
    soil_s = subset_time_space(variables['soil_moisture'], time_index, bbox) if variables['soil_moisture'] is not None else None
    aero_s = subset_time_space(variables['aerosol'], time_index, bbox) if variables['aerosol'] is not None else None
    
    # Türetilmiş veriler
    wind_speed = np.sqrt(u_s**2 + v_s**2) if (u_s is not None and v_s is not None) else None
    
    # Kuraklık indeksi hesapla
    if soil_s is not None:
        soil_clim = float(np.nanmean(soil_s))
        drought_index = 1.0 - (soil_s / (soil_clim + 1e-9))
        drought_index = drought_index.clip(min=0.0, max=2.0)
        drought_index = (drought_index - float(drought_index.min())) / (float(drought_index.max()) - float(drought_index.min()) + 1e-9)
    elif precip_s is not None:
        precip_mean = float(np.nanmean(precip_s))
        drought_index = 1.0 - (precip_s / (precip_mean + 1e-9))
        drought_index = drought_index.clip(min=0.0, max=2.0)
        drought_index = (drought_index - float(drought_index.min())) / (float(drought_index.max()) - float(drought_index.min()) + 1e-9)
    else:
        drought_index = xr.zeros_like(temp_s) * 0.0
    
    precip_mm_day = precip_s * 86400.0 if precip_s is not None else None
    
    return {
        'precipitation_mm_day': precip_mm_day,
        'temperature_c': temp_s,
        'u_wind': u_s,
        'v_wind': v_s,
        'wind_speed': wind_speed,
        'soil_moisture': soil_s,
        'aerosol': aero_s,
        'drought_index': drought_index
    }

def create_summary(processed_data, dates, bbox=BBOX):
    """Analiz özetini oluştur"""
    summary = {
        'bbox': bbox,
        'dates': dates,
        'precip_mean_mm_per_day': float(np.nanmean(processed_data['precipitation_mm_day'])) if processed_data['precipitation_mm_day'] is not None else None,
        'temp_mean_C': float(np.nanmean(processed_data['temperature_c'])),
        'wind_mean_m_s': float(np.nanmean(processed_data['wind_speed'])) if processed_data['wind_speed'] is not None else None,
        'drought_index_mean': float(np.nanmean(processed_data['drought_index'])),
        'aod_mean': float(np.nanmean(processed_data['aerosol'])) if processed_data['aerosol'] is not None else None
    }
    return summary
