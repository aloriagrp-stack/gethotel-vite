"""
GetHotel In-House Python AI & Onboarding Engine
FastAPI Microservice - Zero External AI API Dependency.
Provides live scraping, room synthesis, review extraction, WebP optimization, and bulk onboarding.
"""
import os
import json
import re
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from parser_engine import (
    normalize_room,
    synthesize_rooms_from_prompt,
    parse_chat_prompt_intent,
    clean_text,
    STANDARD_ROOM_TYPES,
    ALL_STANDARD_AMENITIES
)
from scraper import scrape_hotel_url
from review_extractor import scrape_reviews_from_url, parse_raw_text_reviews
from image_optimizer import download_and_convert_webp

app = FastAPI(
    title="GetHotel In-House Onboarding Engine",
    description="High-performance, 100% self-hosted Python onboarding and scraping engine.",
    version="1.0.0"
)

# Enable CORS for local Node.js backend & frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Pydantic Request Models
# -------------------------------------------------------------
class SuggestRoomsRequest(BaseModel):
    hotelId: Optional[int] = None
    hotelName: Optional[str] = "Hotel Partner"
    prompt: Optional[str] = None
    url: Optional[str] = None
    urls: Optional[List[str]] = None
    existingRooms: Optional[List[Dict[str, Any]]] = None
    history: Optional[List[Dict[str, Any]]] = None
    newAttachedImages: Optional[List[str]] = None

class ImportReviewsRequest(BaseModel):
    hotelId: Optional[int] = None
    url: Optional[str] = None
    rawText: Optional[str] = None

class FilePayload(BaseModel):
    fileName: str
    content: str

class BulkOnboardRequest(BaseModel):
    files: List[FilePayload]

class ConvertWebPRequest(BaseModel):
    imageUrl: str
    savePath: Optional[str] = None


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@app.get("/", response_class=HTMLResponse)
async def root_dashboard():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GetHotel In-House Python Engine</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .card { background: #141414; border: 1px solid #262626; border-radius: 16px; padding: 32px; max-width: 520px; width: 90%; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
            .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 999px; margin-bottom: 16px; }
            .pulse { width: 8px; height: 8px; border-radius: 50%; background: #34d399; animation: pulse 1.5s infinite; }
            @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }
            h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px 0; color: #fff; }
            p { font-size: 13px; color: #a3a3a3; line-height: 1.6; margin: 0 0 20px 0; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
            .stat-box { background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 10px; padding: 12px; }
            .stat-title { font-size: 10px; text-transform: uppercase; color: #737373; font-weight: 700; letter-spacing: 0.5px; }
            .stat-val { font-size: 14px; font-weight: 700; color: #fff; margin-top: 4px; }
            .btn { display: inline-block; background: #fff; color: #000; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding: 10px 20px; border-radius: 8px; text-decoration: none; transition: 0.2s; }
            .btn:hover { background: #e5e5e5; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge"><div class="pulse"></div> System Online</div>
            <h1>GetHotel Python Engine</h1>
            <p>100% In-House AI & Room Onboarding Microservice. Running locally with zero external API dependencies (Gemini/Groq bypassed).</p>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-title">Port</div>
                    <div class="stat-val">8000 (Localhost)</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">External API Cost</div>
                    <div class="stat-val">&#8377;0 / Free</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Mode</div>
                    <div class="stat-val">Pure Chat NLP</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">Latency</div>
                    <div class="stat-val">&lt; 50ms (Instant)</div>
                </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="http://localhost:3000/controlhub" class="btn" style="background:#10b981; color:#fff;">👉 Open ControlHub (Port 3000)</a>
                <a href="/docs" class="btn">View Swagger API Docs &rarr;</a>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/controlhub")
@app.get("/.controlhub")
async def redirect_to_controlhub():
    """Redirect directly to Super Admin ControlHub frontend"""
    return RedirectResponse(url="http://localhost:3000/controlhub")

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "engine": "GetHotel In-House Python AI Engine",
        "version": "1.0.0",
        "zeroExternalApi": True
    }


@app.post("/api/suggest-rooms")
async def suggest_rooms(payload: SuggestRoomsRequest):
    """
    Synthesizes and drafts room categories from live OTA URLs or custom prompt instructions.
    Replaces Gemini/Groq suggest-rooms endpoint.
    """
    try:
        active_urls = []
        if payload.urls:
            active_urls = [u.strip() for u in payload.urls if u and u.strip().startswith("http")]
        elif payload.url and payload.url.strip().startswith("http"):
            active_urls = [payload.url.strip()]

        prompt = payload.prompt or ""
        base_price = 2499.0
        scraped_hotel = None
        suggested_rooms = []
        search_sources = []

        # 1. Scrape from URLs ONLY if explicitly provided
        if active_urls:
            print(f"[Suggest Rooms] Scraping {len(active_urls)} active URLs...")
            for u in active_urls:
                s_data = await scrape_hotel_url(u, base_price)
                if s_data:
                    scraped_hotel = s_data
                    if s_data.get("rooms"):
                        suggested_rooms.extend(s_data["rooms"])
                    search_sources.append({
                        "title": s_data.get("name") or "OTA Property Details",
                        "url": u
                    })

            hotel_display_name = (scraped_hotel.get("name") if scraped_hotel else None) or payload.hotelName or "Hotel"
            room_names_str = ", ".join([f"**{r['name']}** (₹{r['pricePerNight']})" for r in suggested_rooms])
            reply_msg = (
                f"Maine **{hotel_display_name}** ke liye links se live room configurations extract kar li hain!\n\n"
                f"Total **{len(suggested_rooms)} room categories** taiyaar hain: {room_names_str}.\n"
                f"Aap niche di gayi preview cards me pricing, bed configuration aur amenities ko review ya customize karke save kar sakte hain."
            )
            clear_all_rooms = False

        else:
            # 2. PURE CHAT MODE - Natural Language Understanding (NO LINK NEEDED)
            print(f"[Suggest Rooms - Pure Chat] Processing chat prompt: '{prompt}'...")
            chat_result = parse_chat_prompt_intent(
                prompt=prompt,
                existing_rooms=payload.existingRooms,
                hotel_name=payload.hotelName or "Hotel",
                base_price=base_price
            )
            suggested_rooms = chat_result.get("rooms", [])
            reply_msg = chat_result.get("reply", "")
            clear_all_rooms = chat_result.get("clearAllRooms", False)

        # 3. Attach new images if provided in request
        if payload.newAttachedImages and len(payload.newAttachedImages) > 0:
            for idx, r in enumerate(suggested_rooms):
                img = payload.newAttachedImages[idx % len(payload.newAttachedImages)]
                r["images"] = [img] + (r.get("images") or [])

        # 4. Compare with existing rooms to determine create / update action
        existing = payload.existingRooms or []
        for r in suggested_rooms:
            if "action" not in r:
                norm_name = r["name"].lower().strip()
                match = next((ex for ex in existing if ex.get("name", "").lower().strip() == norm_name or norm_name in ex.get("name", "").lower()), None)
                if match:
                    r["isExisting"] = True
                    r["matchedRoomId"] = match.get("id")
                    r["action"] = "update"
                else:
                    r["isExisting"] = False
                    r["matchedRoomId"] = None
                    r["action"] = "create"

        return {
            "success": True,
            "reply": reply_msg,
            "data": suggested_rooms,
            "searchQueries": [],
            "searchSources": search_sources,
            "clearAllRooms": clear_all_rooms
        }

    except Exception as e:
        print(f"[Suggest Rooms Error] {e}")
        return {
            "success": False,
            "message": f"Failed to suggest rooms: {str(e)}",
            "reply": f"Maaf kijiye, room configurations process karne me dikkat aayi: {str(e)}",
            "data": []
        }


@app.post("/api/import-reviews")
async def import_reviews(payload: ImportReviewsRequest):
    """
    Extracts customer reviews from live OTA URLs or parses raw pasted review text.
    Replaces Gemini import-reviews endpoint.
    """
    try:
        extracted = []
        if payload.url and payload.url.strip().startswith("http"):
            extracted = await scrape_reviews_from_url(payload.url.strip())
        elif payload.rawText and payload.rawText.strip():
            extracted = parse_raw_text_reviews(payload.rawText.strip())
        else:
            return {
                "success": False,
                "message": "Please provide either a valid review page URL or raw review text."
            }

        if not extracted:
            return {
                "success": False,
                "message": "No valid reviews could be extracted. Please check the URL or pasted format."
            }

        return {
            "success": True,
            "message": f"Successfully extracted {len(extracted)} reviews.",
            "data": extracted,
            "count": len(extracted)
        }
    except Exception as e:
        print(f"[Import Reviews Error] {e}")
        return {
            "success": False,
            "message": f"Failed to import reviews: {str(e)}"
        }


@app.post("/api/bulk-onboard-preview")
async def bulk_onboard_preview(payload: BulkOnboardRequest):
    """
    Parses arbitrary uploaded files (JSON, CSV, or Text) into standardized hotel onboarding records.
    Replaces Gemini bulk-onboard-preview endpoint.
    """
    try:
        normalized_hotels = []

        for file_obj in payload.files:
            file_name = file_obj.fileName
            content = file_obj.content.strip()

            try:
                # 1. Attempt JSON parsing
                parsed_json = None
                if content.startswith("{") or content.startswith("["):
                    try:
                        parsed_json = json.loads(content)
                    except Exception:
                        pass

                if parsed_json and isinstance(parsed_json, dict):
                    raw_hotel = parsed_json.get("hotel") or parsed_json.get("property") or parsed_json
                    raw_partner = parsed_json.get("partner") or parsed_json.get("owner") or {}
                    raw_rooms = parsed_json.get("rooms") or parsed_json.get("roomCategories") or []

                    hotel_name = clean_text(raw_hotel.get("name") or raw_hotel.get("title") or "Partner Hotel")
                    city = clean_text(raw_hotel.get("city") or "New Delhi")
                    address = clean_text(raw_hotel.get("address") or f"{city}, India")
                    desc = clean_text(raw_hotel.get("description") or f"Luxury hotel located in {city}.")
                    base_price = float(raw_hotel.get("pricePerNight") or 2500)

                    # Partner details
                    p_name = clean_text(raw_partner.get("name") or f"{hotel_name} Manager")
                    clean_slug = re.sub(r"[^a-zA-Z0-9]", "", hotel_name.lower()) or "partner"
                    p_email = clean_text(raw_partner.get("email") or f"{clean_slug}@partner.gethotelstays.com")
                    p_pass = raw_partner.get("password") or "Partner@2026"
                    p_phone = clean_text(raw_partner.get("phone") or "+91 9876543210")

                    # Rooms
                    norm_rooms = []
                    if isinstance(raw_rooms, list) and len(raw_rooms) > 0:
                        for idx, r in enumerate(raw_rooms):
                            if isinstance(r, dict):
                                norm_rooms.append(normalize_room(r, base_price, idx))
                    else:
                        norm_rooms = synthesize_rooms_from_prompt("Deluxe Room, Super Deluxe Room, Executive Suite", base_price)

                    normalized_hotels.append({
                        "fileName": file_name,
                        "success": True,
                        "skipped": False,
                        "hotelName": hotel_name,
                        "hotel": {
                            "name": hotel_name,
                            "tagline": "Verified Hospitality Partner",
                            "description": desc,
                            "city": city,
                            "address": address,
                            "pricePerNight": int(base_price),
                            "starRating": int(raw_hotel.get("starRating") or 4),
                            "amenities": raw_hotel.get("amenities") or ["Free Wi-Fi", "Air Conditioning", "Room Service", "Daily Housekeeping"]
                        },
                        "partner": {
                            "name": p_name,
                            "email": p_email,
                            "password": p_pass,
                            "phone": p_phone
                        },
                        "rooms": norm_rooms,
                        "message": f"Successfully parsed {len(norm_rooms)} room categories for {hotel_name}."
                    })

                else:
                    # 2. Text / Heuristic Parser for plain text files
                    lines = [l.strip() for l in content.split("\n") if l.strip()]
                    hotel_name = lines[0] if len(lines) > 0 else "Partner Hotel"
                    hotel_name = re.sub(r"^(hotel|name|property)[:\s-]*", "", hotel_name, flags=re.I).strip()
                    city = "New Delhi"
                    address = f"{hotel_name}, {city}, India"

                    for line in lines:
                        if re.search(r"\b(city|location)[:\s-]*", line, re.I):
                            city = re.sub(r"\b(city|location)[:\s-]*", "", line, flags=re.I).strip()
                        elif re.search(r"\b(address)[:\s-]*", line, re.I):
                            address = re.sub(r"\b(address)[:\s-]*", "", line, flags=re.I).strip()

                    norm_rooms = synthesize_rooms_from_prompt(content, 2500.0)
                    clean_slug = re.sub(r"[^a-zA-Z0-9]", "", hotel_name.lower()) or "partner"

                    normalized_hotels.append({
                        "fileName": file_name,
                        "success": True,
                        "skipped": False,
                        "hotelName": hotel_name,
                        "hotel": {
                            "name": hotel_name,
                            "tagline": "Verified Hospitality Partner",
                            "description": f"Premier hotel property situated in {city}.",
                            "city": city,
                            "address": address,
                            "pricePerNight": 2500,
                            "starRating": 4,
                            "amenities": ["Free Wi-Fi", "Air Conditioning", "Room Service", "Daily Housekeeping"]
                        },
                        "partner": {
                            "name": f"{hotel_name} Admin",
                            "email": f"{clean_slug}@partner.gethotelstays.com",
                            "password": "Partner@2026",
                            "phone": "+91 9876543210"
                        },
                        "rooms": norm_rooms,
                        "message": f"Extracted from text: {len(norm_rooms)} rooms configured."
                    })

            except Exception as fe:
                normalized_hotels.append({
                    "fileName": file_name,
                    "success": False,
                    "skipped": True,
                    "message": f"Failed to parse file: {str(fe)}"
                })

        return {
            "success": True,
            "hotels": normalized_hotels,
            "totalParsed": len(normalized_hotels)
        }

    except Exception as e:
        print(f"[Bulk Onboard Error] {e}")
        return {
            "success": False,
            "message": f"Failed to generate preview: {str(e)}",
            "hotels": []
        }


@app.post("/api/convert-webp")
async def convert_webp(payload: ConvertWebPRequest):
    """
    Downloads and converts an image to high-efficiency WebP format using Pillow.
    Replaces Sharp/Cloudinary external calls.
    """
    res = await download_and_convert_webp(payload.imageUrl, payload.savePath)
    if res["success"]:
        return {
            "success": True,
            "webpBase64": res["webp_base64"],
            "sizeBytes": res.get("size_bytes"),
            "compressionRatio": res.get("compression_ratio")
        }
    else:
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to convert image"))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
