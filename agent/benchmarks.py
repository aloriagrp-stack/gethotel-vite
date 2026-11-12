"""
Market Benchmarks for All Hotels across India
Collected from MakeMyTrip (MMT), Booking.com, and Agoda.
Can be queried statically or updated dynamically via DDGS search.
Features persistent cache for newly discovered onboarded hotels.
"""

from ddgs import DDGS
import re
import os
import json

CACHE_DIR = os.path.dirname(os.path.abspath(__file__))
DISCOVERED_CACHE_FILE = os.path.join(CACHE_DIR, ".discovered_benchmarks.json")

# Verified market rates for Hotels across all cities on MakeMyTrip / Booking.com (Standard Room base)
ALL_HOTEL_BENCHMARKS = {
    # Delhi & NCR
    "Natraj Yes Please": {"min": 1800, "max": 2800, "avg": 2200},
    "Hotel Cottage Yes Please New Delhi": {"min": 2000, "max": 2800, "avg": 2400},
    "Hotel Amar International": {"min": 1900, "max": 2300, "avg": 2100},
    "Hotel City Star New Delhi": {"min": 2800, "max": 3800, "avg": 3200},
    "Hotel Gold Regency": {"min": 2400, "max": 3800, "avg": 2900},
    "Hotel Ajanta": {"min": 2300, "max": 3800, "avg": 2800},
    "Hotel Hari Piorko": {"min": 1900, "max": 2200, "avg": 2050},
    "Hotel Grand Godwin": {"min": 2700, "max": 3400, "avg": 2950},
    "Le ROI Delhi Hotel, Paharganj": {"min": 2200, "max": 3200, "avg": 2600},
    "Hotel Singh Empire Dx": {"min": 2000, "max": 2300, "avg": 2150},
    "Hotel White Klove": {"min": 2000, "max": 2500, "avg": 2250},
    "Karam Durga Guest House": {"min": 1000, "max": 1800, "avg": 1300},
    "Hotel Tushar Continental": {"min": 1100, "max": 1500, "avg": 1300},
    "Hotel Klick International": {"min": 1100, "max": 1800, "avg": 1400},
    "Best Western Darbar Hotel Delhi": {"min": 3000, "max": 4500, "avg": 3600},
    "Hotel Sun International": {"min": 1800, "max": 2400, "avg": 2100},
    "Hotel Worth - Near Connaught Place & NDLS Station": {"min": 3000, "max": 4000, "avg": 3400},
    "Hotel Vedas Heritage - Karol Bagh": {"min": 2700, "max": 3500, "avg": 3100},
    "Hotel Gold Souk - Karol Bagh": {"min": 2100, "max": 2600, "avg": 2300},
    "Hotel Red Castle - Near Ganga Ram & BLK Hospital - Karol Bagh": {"min": 2800, "max": 3400, "avg": 3100},
    "Hotel Cosmo Near BLK Hospital Karol Bagh": {"min": 2500, "max": 3200, "avg": 2800},
    "Hotel Panickers Residency - Near Ganga Ram & BLK Hospital - Karol Bagh": {"min": 2500, "max": 3200, "avg": 2800},
    "Hotel Tripple Tree - Near Ganga Ram & BLK Hospital - Karol Bagh": {"min": 2500, "max": 3500, "avg": 2900},
    "Hotel Florence": {"min": 2800, "max": 3600, "avg": 3200},
    "Hotel The Daanish Residency": {"min": 1500, "max": 2000, "avg": 1750},
    "Hotel Surya International": {"min": 3400, "max": 4200, "avg": 3800},
    "Hotel Ambrosia": {"min": 2200, "max": 2800, "avg": 2500},
    "Hotel Arch The Lohias": {"min": 4000, "max": 4800, "avg": 4400},
    "Hotel Vintage Villas": {"min": 2600, "max": 3300, "avg": 2900},
    "Hotels Viva Palace": {"min": 1800, "max": 2400, "avg": 2100},
    "Hotel Pearl Delhi Airport": {"min": 1800, "max": 2500, "avg": 2150},
    "Hotel Ramhan Palace Mahipalpu": {"min": 2400, "max": 3000, "avg": 2700},
    "Park Inn by Radisson New Delhi Lajpat Nagar": {"min": 4500, "max": 6500, "avg": 5400},
    "Hotel Beacon": {"min": 3500, "max": 4800, "avg": 4100},
    "Qotel Signature Coleman Janakpuri": {"min": 2600, "max": 3300, "avg": 2950},
    "Apple Tree Residency Near Yashobhoomi": {"min": 3800, "max": 4600, "avg": 4200},
    "KOY A Luxury Boutique Hotel Near Ashok Vihar & Model Town": {"min": 2400, "max": 3200, "avg": 2800},
    "Hotel Ambience": {"min": 2600, "max": 3400, "avg": 3000},
    "OPO Premier GK2": {"min": 2200, "max": 2800, "avg": 2500},
    "Crestmont Nirvana": {"min": 4100, "max": 4800, "avg": 4450},
    "The Luxe JPM": {"min": 2800, "max": 3800, "avg": 3300},
    "The Meriton": {"min": 7000, "max": 8500, "avg": 7800},
    "The Mansion Hotel & Banquet": {"min": 3000, "max": 4000, "avg": 3500},
    "The Golden Palms Hotel & Spa, Delhi": {"min": 4200, "max": 5800, "avg": 4900},
    "Hotel Shyama International": {"min": 3300, "max": 4200, "avg": 3700},
    "Qutub Residency Hotel": {"min": 2100, "max": 2600, "avg": 2350},
    "YMCA Tourist Hotel (Connaught Place)": {"min": 4800, "max": 6000, "avg": 5400},
    "Hotel City Park (Pitampura)": {"min": 5200, "max": 6200, "avg": 5600},
    "Namaste Dwaar": {"min": 6000, "max": 8500, "avg": 7000},
    "Rosewood Apartment Hotel - Gurgaon": {"min": 4500, "max": 6000, "avg": 5200},

    # Agra Hotels
    "Hotel Harsh Vilas": {"min": 1800, "max": 2500, "avg": 2100},
    "Hotel Sidhartha": {"min": 2200, "max": 3200, "avg": 2600},
    "Hotel Taj Plaza": {"min": 2200, "max": 3200, "avg": 2650},
    "Hotel Marwari": {"min": 1100, "max": 1600, "avg": 1350},
    "Hotel Ravi Palace": {"min": 1800, "max": 2400, "avg": 2050},
    "Hotel Jigyasa Palace": {"min": 1800, "max": 2400, "avg": 2100},
    "Hotel SMR Palace": {"min": 1800, "max": 2500, "avg": 2100},
    "Hotel Maple Grand": {"min": 2200, "max": 3000, "avg": 2550},
    "Hotel The Taj Vilas": {"min": 2800, "max": 3800, "avg": 3200},
    "The Grand Imperial": {"min": 3500, "max": 5500, "avg": 4400},
    "The Taj Vista Resort": {"min": 4000, "max": 6500, "avg": 5200},
    "Hotel Taj Resorts": {"min": 3000, "max": 4500, "avg": 3800},
    "Crystal Sarovar Premiere Agra": {"min": 4200, "max": 6000, "avg": 5100},
    "Hotel Atulyaa Taj": {"min": 2500, "max": 3800, "avg": 3100},

    # Jaipur Hotels
    "Hotel Good Luck Palace": {"min": 1800, "max": 2500, "avg": 2100},
    "Hotel Jaisingh Palace": {"min": 2400, "max": 3200, "avg": 2800},
    "Hotel Kalyan (Jaipur)": {"min": 1900, "max": 2600, "avg": 2250},
    "Umaid Bhawan Hotel (Jaipur)": {"min": 4800, "max": 7000, "avg": 5800},
    "Shahpura Haveli": {"min": 4500, "max": 7000, "avg": 5800},
    "Alsisar Haveli - A Heritage Hotel": {"min": 4800, "max": 7500, "avg": 6200},
    "Hotel Arya Niwas": {"min": 2200, "max": 3500, "avg": 2800},

    # Udaipur Hotels
    "Amar Kothi (Udaipur)": {"min": 3000, "max": 4200, "avg": 3500},
    "Hotel Mewar Castle (Udaipur)": {"min": 1800, "max": 2500, "avg": 2100},
    "Hotel Swaroop Vilas (Udaipur)": {"min": 5500, "max": 8000, "avg": 6600},
    "Jaiwana Haveli Hotel": {"min": 3200, "max": 4500, "avg": 3800},
    "Barefoot Boutique Hotel Udaipur": {"min": 2400, "max": 3800, "avg": 3100},
    "Radisson Blu Udaipur Palace Resort": {"min": 8500, "max": 14000, "avg": 11000},
    "Fateh Garh Udaipur": {"min": 6000, "max": 9000, "avg": 7500},
    "Madri Haveli Udaipur": {"min": 3500, "max": 5000, "avg": 4200},

    # Manali & Shimla Hotels
    "Honeymoon Inn": {"min": 3800, "max": 5200, "avg": 4400},
    "Hotel Vintage Manali": {"min": 3200, "max": 4500, "avg": 3800},
    "Hotel Broadways Inn": {"min": 3000, "max": 4200, "avg": 3500},
    "Snow Valley Resorts Manali": {"min": 3200, "max": 5000, "avg": 4100},
    "The Himalayan Manali": {"min": 8000, "max": 13000, "avg": 10500},
    "Toshali Royal View Resort Shim": {"min": 3600, "max": 4800, "avg": 4100},
    "Sukhsagar Regency": {"min": 3800, "max": 5000, "avg": 4300},
    "Hotel Combermere Shimla": {"min": 5000, "max": 7500, "avg": 6200},
    "Radisson Hotel Shimla": {"min": 6500, "max": 10000, "avg": 8200},

    # Jodhpur Hotels
    "Chandra Inn (Jodhpur)": {"min": 3800, "max": 5200, "avg": 4400},
    "Hotel Karni Bhawan (Jodhpur)": {"min": 6000, "max": 8500, "avg": 7200},
    "Ajit Bhawan Jodhpur": {"min": 7500, "max": 12000, "avg": 9500},

    # Varanasi Hotels
    "Hotel Ganesha": {"min": 1800, "max": 2500, "avg": 2100},
    "Hotel Pradeep": {"min": 3200, "max": 4500, "avg": 3800},
    "BrijRama Palace Varanasi": {"min": 18000, "max": 26000, "avg": 22000},
    "Hotel Surya Kaiser Palace Varanasi": {"min": 3500, "max": 5500, "avg": 4500},

    # Goa Hotels
    "Santana Beach Resort": {"min": 5200, "max": 7500, "avg": 6200},
    "Casa de Alnena": {"min": 3800, "max": 5200, "avg": 4400},
    "Ginger Goa Candolim": {"min": 3200, "max": 4800, "avg": 3900},
    "Panaji Grand Heritage": {"min": 2800, "max": 4200, "avg": 3500},
    "Hard Rock Hotel Goa": {"min": 6500, "max": 9500, "avg": 8000},
    "Acron Waterfront Resort": {"min": 5500, "max": 8000, "avg": 6800},

    # Other Cities
    "The Tigress Resort & Spa, Rant": {"min": 11000, "max": 16000, "avg": 13000},
    "Rosewood Retreat Bhimtal": {"min": 7500, "max": 11000, "avg": 9000},
    "Rosewood Apartment Hotel - Pan": {"min": 4200, "max": 5800, "avg": 4900},
    "Rosewood Apartment Hotel - SID": {"min": 3800, "max": 5000, "avg": 4300},
    "BHRS Residency": {"min": 2800, "max": 3800, "avg": 3200},
    "Taj Malabar Resort": {"min": 14000, "max": 20000, "avg": 16500}
}

# Alias for backward compatibility
DELHI_MARKET_BENCHMARKS = ALL_HOTEL_BENCHMARKS


def _load_discovered_cache() -> dict:
    if os.path.exists(DISCOVERED_CACHE_FILE):
        try:
            with open(DISCOVERED_CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_discovered_cache(cache: dict):
    try:
        with open(DISCOVERED_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
    except Exception:
        pass


def get_benchmark_rate(hotel_name: str):
    """Returns stored static or dynamically discovered benchmark rate."""
    # Check static dictionary
    for key, val in ALL_HOTEL_BENCHMARKS.items():
        if key.lower() in hotel_name.lower() or hotel_name.lower() in key.lower():
            return val
            
    # Check dynamic discovered cache
    disc = _load_discovered_cache()
    for key, val in disc.items():
        if key.lower() in hotel_name.lower() or hotel_name.lower() in key.lower():
            return val

    return None


def save_custom_benchmark(hotel_name: str, min_price: int, max_price: int = None, avg_price: int = None):
    """Saves a newly discovered hotel's benchmark rate for future instant lookups."""
    disc = _load_discovered_cache()
    disc[hotel_name] = {
        "min": min_price,
        "max": max_price or int(min_price * 1.3),
        "avg": avg_price or int(min_price * 1.15),
        "source": "discovered_auto"
    }
    _save_discovered_cache(disc)


def live_search_rate(hotel_name: str, city_or_area: str = "") -> dict:
    """Searches MakeMyTrip and Booking.com for live rate in ANY city and auto-caches."""
    # Check if already discovered
    bench = get_benchmark_rate(hotel_name)
    if bench:
        bench["source"] = bench.get("source", "benchmark")
        return bench

    query = f'"{hotel_name}" {city_or_area} price MakeMyTrip OR Booking.com'
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))
        
        snippets = " ".join([r.get('body', '') + " " + r.get('title', '') for r in results])
        prices = re.findall(r'(?:₹|Rs\.?|INR)\s*([\d,]{3,6})', snippets, re.IGNORECASE)
        clean_prices = []
        for p in prices:
            val = int(p.replace(',', ''))
            if 800 <= val <= 35000:
                clean_prices.append(val)
        
        if clean_prices:
            min_p = min(clean_prices)
            avg_p = int(sum(clean_prices) / len(clean_prices))
            max_p = max(clean_prices)
            save_custom_benchmark(hotel_name, min_p, max_p, avg_p)
            return {
                "min": min_p,
                "max": max_p,
                "avg": avg_p,
                "source": "live_ddgs"
            }
    except Exception:
        pass
    
    # Sensible fallback based on city/tier
    fallback_min = 2400
    c_lower = city_or_area.lower()
    if any(k in c_lower for k in ["goa", "udaipur", "manali", "shimla"]):
        fallback_min = 3500
    elif any(k in c_lower for k in ["jaipur", "agra", "jodhpur", "varanasi"]):
        fallback_min = 2200

    return {"min": fallback_min, "max": int(fallback_min * 1.35), "avg": int(fallback_min * 1.15), "source": "city_tier_estimate"}
