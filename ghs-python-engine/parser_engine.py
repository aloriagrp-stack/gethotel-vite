"""
Parser Engine - In-House Deterministic NLP & Chat Parser
Zero external AI API dependency.
Parses unstructured chat prompts, extracts room names, custom pricing, bed types,
occupancy, amenities, modifications, and generates natural Hinglish replies.
"""
import re
from typing import List, Dict, Any, Optional

# Standard Room Taxonomy with defaults
STANDARD_ROOM_TYPES = [
    {
        "pattern": r"(super\s*deluxe|executive\s*deluxe)",
        "name": "Super Deluxe Room",
        "description": "Upgraded luxury room featuring panoramic city views, plush king-size bedding, and a dedicated work desk.",
        "bed": "1 King Bed",
        "occupancy": 2,
        "sizeM2": 32,
        "price_factor": 1.4,
        "default_price": 3499,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Mini Bar", "City View", "Bathrobe", "Tea/Coffee Maker", "Daily Housekeeping"]
    },
    {
        "pattern": r"(deluxe|dx)",
        "name": "Deluxe Room",
        "description": "Spacious and elegant room equipped with contemporary decor, premium bedding, and modern bathroom amenities.",
        "bed": "1 King Bed",
        "occupancy": 2,
        "sizeM2": 28,
        "price_factor": 1.0,
        "default_price": 2499,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Electric Kettle", "Wardrobe", "Toiletries", "Daily Housekeeping"]
    },
    {
        "pattern": r"(presidential\s*suite|royal\s*suite|luxury\s*suite|penthouse)",
        "name": "Presidential Suite",
        "description": "Opulent signature suite featuring expansive living quarters, master suite, deep soaking bathtub, and bespoke butler service.",
        "bed": "1 King Bed",
        "occupancy": 4,
        "sizeM2": 65,
        "price_factor": 2.5,
        "default_price": 6999,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Bathtub", "Jacuzzi", "Living Area", "Mini Bar", "Complimentary Breakfast", "Soundproofing", "City View"]
    },
    {
        "pattern": r"(suite|executive\s*suite)",
        "name": "Executive Suite",
        "description": "Spacious suite with a dedicated living area, master bedroom, soaking bathtub, and executive work desk.",
        "bed": "1 King Bed",
        "occupancy": 3,
        "sizeM2": 45,
        "price_factor": 1.8,
        "default_price": 4499,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Smart TV", "Bathtub", "Living Area", "Mini Bar", "Complimentary Breakfast", "Soundproofing"]
    },
    {
        "pattern": r"(family\s*suite|family\s*room|quad|family)",
        "name": "Family Room",
        "description": "Spacious family accommodation featuring multiple beds, generous storage, and comfortable seating.",
        "bed": "2 Double Beds",
        "occupancy": 4,
        "sizeM2": 40,
        "price_factor": 1.5,
        "default_price": 3799,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Electric Kettle", "Seating Area", "Extra Towels", "Daily Housekeeping"]
    },
    {
        "pattern": r"(twin\s*room|twin\s*bed|twin|two\s*single)",
        "name": "Standard Twin Room",
        "description": "Modern room fitted with two comfortable single beds, ideal for friends or colleagues traveling together.",
        "bed": "2 Twin Beds",
        "occupancy": 2,
        "sizeM2": 24,
        "price_factor": 0.9,
        "default_price": 2199,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Work Desk", "Free Toiletries", "Daily Housekeeping"]
    },
    {
        "pattern": r"(single\s*room|single\s*bed|single)",
        "name": "Standard Single Room",
        "description": "Compact and cozy room tailored for solo business or leisure travelers with high-speed internet and workstation.",
        "bed": "1 Single Bed",
        "occupancy": 1,
        "sizeM2": 18,
        "price_factor": 0.75,
        "default_price": 1499,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Work Desk", "Electric Kettle", "Daily Housekeeping"]
    },
    {
        "pattern": r"(standard|classic|budget|economy)",
        "name": "Standard Room",
        "description": "Cozy and well-appointed room offering essential comforts, cozy bedding, and high-speed Wi-Fi.",
        "bed": "1 Queen Bed",
        "occupancy": 2,
        "sizeM2": 22,
        "price_factor": 0.85,
        "default_price": 1899,
        "amenities": ["Free Wi-Fi", "Air Conditioning", "TV", "Private Bathroom", "Hot & Cold Water", "Daily Housekeeping"]
    },
    {
        "pattern": r"(villa|cottage|bungalow|resort\s*room)",
        "name": "Luxury Villa",
        "description": "Private standalone villa featuring a secluded private balcony, patio, and premium hospitality amenities.",
        "bed": "1 King Bed",
        "occupancy": 4,
        "sizeM2": 65,
        "price_factor": 2.2,
        "default_price": 5999,
        "amenities": ["Free Wi-Fi", "Balcony", "Air Conditioning", "Smart TV", "Bathtub", "Mini Bar", "Complimentary Breakfast"]
    }
]

# Standard Curated Stock High-Res Room Images
ROOM_STOCK_IMAGES = [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1000&q=80",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&q=80",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1000&q=80",
    "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=80"
]

ALL_STANDARD_AMENITIES = [
    "Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom",
    "Geyser/Water Heater", "Daily Housekeeping", "Complimentary Toiletries",
    "Electric Kettle", "Wardrobe", "Work Desk", "Intercom", "Linen & Towels",
    "Mini Bar", "Room Service", "Bathtub", "Balcony", "Soundproofing", "City View"
]

def clean_text(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"\s+", " ", str(text)).strip()

def normalize_price(val: Any, default_base: float = 2499.0) -> int:
    if val is None:
        return int(default_base)
    if isinstance(val, (int, float)):
        price = float(val)
    else:
        # Check for 'k' format (e.g. 2.5k -> 2500)
        k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", str(val), re.IGNORECASE)
        if k_match:
            try:
                price = float(k_match.group(1)) * 1000.0
            except ValueError:
                price = default_base
        else:
            cleaned = re.sub(r"[^\d.]", "", str(val))
            try:
                price = float(cleaned) if cleaned else default_base
            except ValueError:
                price = default_base

    # Check for USD / foreign scale
    if 1 <= price < 150:
        price = price * 86.0  # approximate USD to INR
    
    if price < 500:
        price = default_base

    return int(round(price))

def extract_price_from_text(text: str) -> Optional[int]:
    """Finds price in rupees or k format from arbitrary text snippet"""
    # 1. Check 'k' pattern (e.g. 3k, 2.5k)
    k_match = re.search(r"(\d+(?:\.\d+)?)\s*k\b", text, re.IGNORECASE)
    if k_match:
        try:
            return int(round(float(k_match.group(1)) * 1000))
        except ValueError:
            pass

    # 2. Check ₹2500, Rs 2500, price: 2500, rate: 2500, or raw 3-6 digit number
    num_matches = re.findall(r"(?:₹|rs\.?|inr|price|rate)?\s*(\d{3,6})\s*(?:rs\.?|inr|/-)?", text, re.IGNORECASE)
    if num_matches:
        for m in num_matches:
            val = int(m)
            # Avoid matching years like 2026
            if val != 2024 and val != 2025 and val != 2026:
                return val
    return None

def extract_occupancy_and_bed(room_name: str, description: str = "") -> tuple:
    combined = f"{room_name} {description}".lower()
    
    bed = "1 King Bed"
    if re.search(r"\b(2\s*single|twin|two\s*twin|two\s*single)\b", combined):
        bed = "2 Twin Beds"
    elif re.search(r"\b(queen)\b", combined):
        bed = "1 Queen Bed"
    elif re.search(r"\b(2\s*double|two\s*double|quad)\b", combined):
        bed = "2 Double Beds"
    elif re.search(r"\b(single\s*bed|1\s*single)\b", combined):
        bed = "1 Single Bed"
    elif re.search(r"\b(king)\b", combined):
        bed = "1 King Bed"

    occupancy = 2
    occ_match = re.search(r"(\d+)\s*(adult|guest|person|people|pax|bed)", combined)
    if occ_match:
        occupancy = max(1, min(8, int(occ_match.group(1))))
    elif "single" in combined and "double" not in combined:
        occupancy = 1
    elif "family" in combined or "quad" in combined:
        occupancy = 4
    elif "suite" in combined or "villa" in combined:
        occupancy = 3

    return occupancy, bed

def extract_amenities_from_text(text: str) -> List[str]:
    found = []
    text_lower = text.lower()
    keywords = {
        "Free Wi-Fi": ["wifi", "wi-fi", "internet"],
        "Air Conditioning": ["ac", "air condition", "air-condition", "climate control"],
        "Flat-screen TV": ["tv", "television", "flat-screen", "smart tv", "led tv"],
        "Private Bathroom": ["private bath", "attached bath", "ensuite", "private washroom", "bathroom"],
        "Hot & Cold Water": ["geyser", "hot water", "water heater", "24/7 hot"],
        "Bathtub": ["bathtub", "soaking tub", "spa tub"],
        "Jacuzzi": ["jacuzzi", "whirlpool"],
        "Mini Bar": ["minibar", "mini bar", "mini fridge"],
        "Balcony": ["balcony", "terrace", "patio"],
        "City View": ["city view", "scenic view", "street view"],
        "Pool Access": ["pool", "swimming pool", "private pool"],
        "Mountain View": ["mountain view", "hill view"],
        "Complimentary Breakfast": ["breakfast", "nashta", "food included"],
        "Electric Kettle": ["kettle", "tea maker", "coffee maker", "tea/coffee"],
        "Wardrobe": ["wardrobe", "closet", "cupboard"],
        "Daily Housekeeping": ["housekeeping", "cleaning service"],
        "Room Service": ["room service", "in-room dining"]
    }
    for standard_name, patterns in keywords.items():
        if any(p in text_lower for p in patterns):
            found.append(standard_name)
    
    if not found:
        found = ["Free Wi-Fi", "Air Conditioning", "Flat-screen TV", "Private Bathroom", "Daily Housekeeping"]
    return found

def normalize_room(raw_room: Dict[str, Any], base_price: float = 2499.0, index: int = 0) -> Dict[str, Any]:
    name = clean_text(raw_room.get("name") or raw_room.get("title") or f"Room Type {index + 1}")
    desc = clean_text(raw_room.get("description") or "")
    
    matched_tax = None
    for tax in STANDARD_ROOM_TYPES:
        if re.search(tax["pattern"], name, re.IGNORECASE):
            matched_tax = tax
            break

    if matched_tax and not desc:
        desc = matched_tax["description"]

    occ, bed = extract_occupancy_and_bed(name, desc)
    if matched_tax:
        if "maxOccupancy" not in raw_room:
            occ = matched_tax["occupancy"]
        if "bedConfiguration" not in raw_room:
            bed = matched_tax["bed"]

    if raw_room.get("maxOccupancy"):
        try:
            occ = int(raw_room["maxOccupancy"])
        except (ValueError, TypeError):
            pass

    if raw_room.get("bedConfiguration"):
        bed = str(raw_room["bedConfiguration"])

    # Pricing
    price_val = raw_room.get("pricePerNight") or raw_room.get("price") or raw_room.get("rate")
    if price_val:
        final_price = normalize_price(price_val, base_price)
    elif matched_tax:
        final_price = matched_tax["default_price"]
    else:
        final_price = int(round(base_price * (1.0 + (index * 0.25))))

    size = raw_room.get("sizeM2") or (matched_tax["sizeM2"] if matched_tax else 25)
    try:
        size = int(size)
    except (ValueError, TypeError):
        size = 25

    # Amenities
    user_amenities = raw_room.get("amenities") or []
    if isinstance(user_amenities, str):
        user_amenities = [a.strip() for a in user_amenities.split(",") if a.strip()]
    tax_amenities = matched_tax["amenities"] if matched_tax else []
    extracted_from_desc = extract_amenities_from_text(f"{name} {desc}")
    
    # Merge and deduplicate
    all_amen = list(dict.fromkeys(user_amenities + tax_amenities + extracted_from_desc))

    # Images
    images = raw_room.get("images") or []
    if isinstance(images, str):
        images = [images]
    if not images or len(images) == 0:
        img_url = ROOM_STOCK_IMAGES[index % len(ROOM_STOCK_IMAGES)]
        images = [img_url]

    return {
        "name": name,
        "pricePerNight": final_price,
        "maxOccupancy": occ,
        "bedConfiguration": bed,
        "sizeM2": size,
        "totalInventory": int(raw_room.get("totalInventory") or 5),
        "amenities": all_amen,
        "images": images,
        "description": desc or f"Comfortable and elegant {name} tailored for an exceptional stay experience."
    }

# -------------------------------------------------------------
# ADVANCED NATURAL LANGUAGE CHAT PARSER (ZERO EXTERNAL AI API)
# -------------------------------------------------------------

def parse_chat_prompt_intent(
    prompt: str,
    existing_rooms: Optional[List[Dict[str, Any]]] = None,
    hotel_name: str = "Hotel",
    base_price: float = 2499.0
) -> Dict[str, Any]:
    """
    Parses natural English / Hinglish chat prompts directly.
    Extracts room names, custom rates, bed configs, amenities, edits, and deletions.
    Zero external AI API needed!
    """
    p = clean_text(prompt)
    p_lower = p.lower()
    existing_rooms = existing_rooms or []

    # 1. GREETING INTENT
    if re.search(r"^(hi|hello|hey|namaste|pranam|hola|greetings)\b", p_lower) and not any(k in p_lower for k in ["room", "suite", "deluxe", "price", "rate", "banao", "setup", "create"]):
        return {
            "intent": "GREETING",
            "reply": "Hello! I am your In-House Room Setup Copilot.\n\nSimply describe the room configurations you need, and I will instantly structure your categories and pricing! For example:\n- *'Create 3 rooms: Deluxe at ₹2500, Super Deluxe with balcony at ₹3500, Executive Suite with bathtub at ₹5000'*\n- *'Standard budget hotel setup'*\n- *'Update Deluxe room price to ₹2800'*\n\nHow can I help configure your hotel today?",
            "rooms": [],
            "clearAllRooms": False
        }

    # 2. SHOW / VIEW EXISTING ROOMS
    if re.search(r"\b(show|display|list|view|current\s*rooms|existing\s*rooms)\b", p_lower) and not any(k in p_lower for k in ["deluxe", "suite", "create", "price", "rate"]):
        if existing_rooms:
            names_summary = ", ".join([f"**{r.get('name')}** (₹{r.get('pricePerNight')})" for r in existing_rooms])
            return {
                "intent": "SHOW_ROOMS",
                "reply": f"This property currently has **{len(existing_rooms)} room categories** configured:\n{names_summary}.\n\nYou can request price updates, add amenities, or create new categories at any time!",
                "rooms": existing_rooms,
                "clearAllRooms": False
            }
        else:
            return {
                "intent": "SHOW_ROOMS",
                "reply": "No room categories are currently configured for this hotel. You can start by typing your room specifications (e.g. *'Deluxe ₹2500, Suite ₹4500'*).",
                "rooms": [],
                "clearAllRooms": False
            }

    # 3. CLEAR / DELETE ALL ROOMS
    if re.search(r"\b(clear\s*all|delete\s*all|remove\s*all|reset\s*rooms)\b", p_lower):
        return {
            "intent": "CLEAR_ALL",
            "reply": "I have marked all existing room configurations for deletion. Please review and click 'Save to Hotel' to confirm.",
            "rooms": [],
            "clearAllRooms": True
        }

    # 4. DELETE SPECIFIC ROOM
    del_match = re.search(r"\b(delete|remove|drop)\s+(?:the\s*)?([a-zA-Z\s]+)", p_lower)
    if del_match and existing_rooms:
        target_name = del_match.group(2).strip()
        matched_room = next((r for r in existing_rooms if target_name in r.get("name", "").lower()), None)
        if matched_room:
            updated_list = []
            for r in existing_rooms:
                if r.get("id") == matched_room.get("id"):
                    updated_list.append({**r, "action": "delete"})
                else:
                    updated_list.append(r)
            return {
                "intent": "DELETE_ROOM",
                "reply": f"I have marked **{matched_room.get('name')}** for removal. Please review and click 'Save to Hotel' to confirm.",
                "rooms": updated_list,
                "clearAllRooms": False
            }

    # 5. UPDATE EXISTING ROOM (Price or Amenity change)
    update_price = extract_price_from_text(p)
    if update_price and existing_rooms:
        matched_room = None
        for r in existing_rooms:
            r_lower = r.get("name", "").lower()
            words = r_lower.split()
            if any(w in p_lower for w in words if len(w) > 3):
                matched_room = r
                break

        if matched_room and any(kw in p_lower for kw in ["price", "rate", "cost", "change", "update", "set", "kar do", "kardo", "karo"]):
            updated_list = []
            for r in existing_rooms:
                if r.get("id") == matched_room.get("id"):
                    updated_r = {**r, "pricePerNight": update_price, "action": "update", "isExisting": True}
                    updated_list.append(updated_r)
                else:
                    updated_list.append(r)
            return {
                "intent": "UPDATE_ROOM",
                "reply": f"I have updated the nightly rate for **{matched_room.get('name')}** to **₹{update_price}**! Review the updated card below and click 'Save to Hotel'.",
                "rooms": updated_list,
                "clearAllRooms": False
            }

    # 6. CREATE / SYNTHESIZE ROOMS FROM CHAT PROMPT
    extracted_rooms = parse_chat_rooms_list(p, base_price)
    
    if not extracted_rooms:
        # Fallback to standard presets if user gave a short hint
        if any(w in p_lower for w in ["budget", "economy", "cheap", "standard setup"]):
            extracted_rooms = [
                normalize_room({"name": "Standard Single Room", "pricePerNight": 1499, "bedConfiguration": "1 Single Bed", "maxOccupancy": 1}, base_price, 0),
                normalize_room({"name": "Deluxe Room", "pricePerNight": 2299, "bedConfiguration": "1 Queen Bed", "maxOccupancy": 2}, base_price, 1),
                normalize_room({"name": "Family Room", "pricePerNight": 3499, "bedConfiguration": "2 Double Beds", "maxOccupancy": 4}, base_price, 2)
            ]
        elif any(w in p_lower for w in ["resort", "luxury", "premium", "5 star", "villa"]):
            extracted_rooms = [
                normalize_room({"name": "Luxury Garden Villa", "pricePerNight": 4999, "bedConfiguration": "1 King Bed", "maxOccupancy": 2}, base_price, 0),
                normalize_room({"name": "Royal Pool Villa", "pricePerNight": 7499, "bedConfiguration": "1 King Bed", "maxOccupancy": 3}, base_price, 1),
                normalize_room({"name": "Presidential Ocean Suite", "pricePerNight": 11999, "bedConfiguration": "1 King Bed", "maxOccupancy": 4}, base_price, 2)
            ]
        elif any(w in p_lower for w in ["business", "corporate", "executive"]):
            extracted_rooms = [
                normalize_room({"name": "Executive Business Single", "pricePerNight": 2199, "bedConfiguration": "1 Queen Bed", "maxOccupancy": 1}, base_price, 0),
                normalize_room({"name": "Premium Corporate Double", "pricePerNight": 2999, "bedConfiguration": "1 King Bed", "maxOccupancy": 2}, base_price, 1),
                normalize_room({"name": "Club Executive Suite", "pricePerNight": 4499, "bedConfiguration": "1 King Bed", "maxOccupancy": 3}, base_price, 2)
            ]
        else:
            # Default clean 3 categories
            extracted_rooms = [
                normalize_room({"name": "Standard Room", "pricePerNight": 1899, "bedConfiguration": "1 Queen Bed", "maxOccupancy": 2}, base_price, 0),
                normalize_room({"name": "Deluxe Room", "pricePerNight": 2499, "bedConfiguration": "1 King Bed", "maxOccupancy": 2}, base_price, 1),
                normalize_room({"name": "Executive Suite", "pricePerNight": 4299, "bedConfiguration": "1 King Bed", "maxOccupancy": 3}, base_price, 2)
            ]

    # Build clean English response
    room_summary = ", ".join([f"**{r['name']}** (₹{r['pricePerNight']})" for r in extracted_rooms])
    reply_msg = (
        f"Based on your instructions, I have drafted **{len(extracted_rooms)} room categories**:\n\n"
        f"{room_summary}\n\n"
        f"Bed configurations, occupancy, and standard amenities have been automatically configured. Please review the cards below and click 'Save to Hotel' to apply!"
    )

    return {
        "intent": "CREATE_ROOMS",
        "reply": reply_msg,
        "rooms": extracted_rooms,
        "clearAllRooms": False
    }


def parse_chat_rooms_list(prompt: str, base_price: float = 2499.0) -> List[Dict[str, Any]]:
    """
    Splits prompt into room segments and extracts exact room names, prices, beds, and amenities.
    Handles formats like:
    - 'deluxe 2500, super deluxe 3500 with balcony, suite 5000 with bathtub'
    - '1 room standard 1200, 1 deluxe 2000, 1 suite 3500'
    - 'Standard Room: 1500\nDeluxe Room: 2500\nSuite: 4000'
    """
    clean_p = prompt.strip()
    
    # Clean leading chatter
    clean_p = re.sub(r"^(?:mere\s*hotel\s*me|create|banao|setup\s*karo|add|hame\s*chahiye|humko\s*chahiye|total\s*\d+\s*rooms?[:\s]*)+", "", clean_p, flags=re.IGNORECASE).strip()

    # Split by common delimiters: newlines, commas, semicolons, or "aur" / "and" followed by room indicators
    raw_segments = re.split(r"\n+|,|;|\band\b|\baur\b", clean_p, flags=re.IGNORECASE)

    extracted_rooms = []
    
    for idx, seg in enumerate(raw_segments):
        s = seg.strip()
        if len(s) < 3:
            continue

        # Check for price in segment
        price = extract_price_from_text(s)

        # Check for room taxonomy keyword match
        matched_tax = None
        for tax in STANDARD_ROOM_TYPES:
            if re.search(tax["pattern"], s, re.IGNORECASE):
                matched_tax = tax
                break

        # If keyword matched, construct room
        if matched_tax:
            room_name = matched_tax["name"]
            
            # Check if user added prefix or suffix (e.g. "Royal Deluxe" or "Deluxe King")
            name_override = None
            custom_match = re.search(r"([A-Z][a-zA-Z\s]+(?:Room|Suite|Villa|Cottage))", s)
            if custom_match:
                name_override = custom_match.group(1).strip()

            final_name = name_override if name_override and len(name_override) < 35 else room_name
            final_price = price if price else matched_tax["default_price"]

            # Bed and occupancy
            occ, bed = extract_occupancy_and_bed(final_name, s)
            
            # Amenities from user text
            amenities = extract_amenities_from_text(s)

            extracted_rooms.append(normalize_room({
                "name": final_name,
                "pricePerNight": final_price,
                "bedConfiguration": bed,
                "maxOccupancy": occ,
                "amenities": amenities,
                "description": s
            }, base_price, len(extracted_rooms)))

        elif price and len(s) >= 4:
            # User might have given custom name with price like: "Honeymoon Penthouse 8000"
            cleaned_title = re.sub(r"(?:₹|rs\.?|inr)?\s*\d{3,6}\s*(?:rs\.?|inr|/-)?", "", s, flags=re.IGNORECASE)
            cleaned_title = clean_text(re.sub(r"\b(price|rate|with|ka|hai|ek|one|two|three)\b", "", cleaned_title, flags=re.IGNORECASE))
            if len(cleaned_title) >= 3:
                extracted_rooms.append(normalize_room({
                    "name": cleaned_title.title(),
                    "pricePerNight": price,
                    "description": s
                }, base_price, len(extracted_rooms)))

    return extracted_rooms

def synthesize_rooms_from_prompt(prompt: str, base_price: float = 2499.0) -> List[Dict[str, Any]]:
    """Synthesizes room categories directly from user prompt with zero external AI"""
    result = parse_chat_prompt_intent(prompt, base_price=base_price)
    return result.get("rooms", [])
