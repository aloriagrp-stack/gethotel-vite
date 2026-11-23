"""
GHS API Client
Connects to https://gethotelstays.com/api with Super Admin privileges.
Provides functions to fetch, update, and manage hotels, rooms, and coupons in real time.
Features session reuse, token caching, and smart data caching for maximum speed and resilience.
"""

import requests
import json
import os
import time

BASE_URL = "https://gethotelstays.com/api"
ADMIN_EMAIL = "admin@gethotelstays.com"
ADMIN_PASS = "shriyanshking"

CACHE_DIR = os.path.dirname(os.path.abspath(__file__))
TOKEN_CACHE_FILE = os.path.join(CACHE_DIR, ".token_cache.json")
HOTELS_CACHE_FILE = os.path.join(CACHE_DIR, ".hotels_cache.json")


class GHSApiClient:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "GHS-Terminal-Agent/2.0",
            "Accept": "application/json"
        })
        self.token = self._load_cached_token()
        if not self.token:
            self._login()

    def _load_cached_token(self):
        """Loads cached token if valid."""
        try:
            if os.path.exists(TOKEN_CACHE_FILE):
                with open(TOKEN_CACHE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Check token age (valid for 24 hours)
                    if time.time() - data.get("saved_at", 0) < 86400:
                        return data.get("token")
        except Exception:
            pass
        return None

    def _save_cached_token(self, token: str):
        try:
            with open(TOKEN_CACHE_FILE, "w", encoding="utf-8") as f:
                json.dump({"token": token, "saved_at": time.time()}, f)
        except Exception:
            pass

    def _login(self):
        """Authenticates as Super Admin and stores the JWT token."""
        try:
            url = f"{self.base_url}/auth/login"
            resp = self.session.post(url, json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=35)
            data = resp.json()
            if data.get("success") and data.get("token"):
                self.token = data["token"]
                self._save_cached_token(self.token)
            else:
                raise Exception(f"Login failed: {data.get('message', 'Unknown error')}")
        except Exception as e:
            print(f"[API Warning] Login: {e}")

    def _headers(self):
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def get_hotels(self, force_refresh=False, listing_type=None):
        """
        Fetches hotels from live API or cache.
        Ensures 100% of bookable partner hotels are retrieved without being truncated by directory listings.
        """
        if not force_refresh and os.path.exists(HOTELS_CACHE_FILE):
            try:
                with open(HOTELS_CACHE_FILE, "r", encoding="utf-8") as f:
                    cache_data = json.load(f)
                    cached_hotels = cache_data.get("hotels", [])
                    # Health check: cache must contain at least 10 bookable partner hotels
                    bookable_in_cache = sum(1 for h in cached_hotels if h.get("listingType") != "directory")
                    if bookable_in_cache >= 10 and (time.time() - cache_data.get("saved_at", 0) < 7200):
                        if listing_type:
                            return [h for h in cached_hotels if h.get("listingType") == listing_type]
                        return cached_hotels
            except Exception:
                pass

        try:
            # 1. Guaranteed fetch of all bookable partner hotels
            url_bookable = f"{self.base_url}/hotels?listingType=bookable"
            resp_bookable = self.session.get(url_bookable, headers=self._headers(), timeout=45)
            data_bookable = resp_bookable.json()
            bookable_hotels = data_bookable.get("data", []) if data_bookable.get("success") else []

            # 2. Fetch directory listings
            url_directory = f"{self.base_url}/hotels?listingType=directory"
            resp_directory = self.session.get(url_directory, headers=self._headers(), timeout=45)
            data_directory = resp_directory.json()
            directory_hotels = data_directory.get("data", []) if data_directory.get("success") else []

            # Deduplicate by ID, prioritizing bookable partner hotels
            hotel_map = {}
            for h in bookable_hotels:
                hotel_map[h["id"]] = h
            for h in directory_hotels:
                if h["id"] not in hotel_map:
                    hotel_map[h["id"]] = h

            all_hotels = list(hotel_map.values())

            if all_hotels:
                try:
                    with open(HOTELS_CACHE_FILE, "w", encoding="utf-8") as f:
                        json.dump({"hotels": all_hotels, "saved_at": time.time()}, f)
                except Exception:
                    pass

            if listing_type:
                return [h for h in all_hotels if h.get("listingType") == listing_type]
            return all_hotels
        except Exception as e:
            print(f"[API Error] get_hotels: {e}")
            # Fallback to cache if network fails
            if os.path.exists(HOTELS_CACHE_FILE):
                try:
                    with open(HOTELS_CACHE_FILE, "r", encoding="utf-8") as f:
                        cached_hotels = json.load(f).get("hotels", [])
                        if listing_type:
                            return [h for h in cached_hotels if h.get("listingType") == listing_type]
                        return cached_hotels
                except Exception:
                    pass
            return []

    def get_hotel(self, hotel_id: int):
        """Fetches full hotel details by ID."""
        try:
            url = f"{self.base_url}/hotels/{hotel_id}"
            resp = self.session.get(url, headers=self._headers(), timeout=25)
            data = resp.json()
            return data.get("data")
        except Exception as e:
            print(f"[API Error] get_hotel({hotel_id}): {e}")
            return None

    def update_hotel_promotion(self, hotel_id: int, code: str, discount_value: int):
        """
        Updates or creates a promotion coupon for a hotel using the admin bulk-promotion upsert endpoint.
        Does NOT touch room base prices; tunes only the discount percentage.
        """
        try:
            payload = {
                "hotelIds": [hotel_id],
                "code": (code or "BASIC").upper().strip(),
                "discountType": "percentage",
                "discountValue": float(discount_value),
                "isActive": True
            }
            url = f"{self.base_url}/admin/hotels/bulk-promotion"
            resp = self.session.post(url, json=payload, headers=self._headers(), timeout=25)
            res = resp.json()
            
            # Invalidate cached hotels so next load has fresh promos
            if os.path.exists(HOTELS_CACHE_FILE):
                try:
                    os.remove(HOTELS_CACHE_FILE)
                except Exception:
                    pass
                    
            return res
        except Exception as e:
            print(f"[API Error] update_hotel_promotion({hotel_id}): {e}")
            return {"success": False, "message": str(e)}

    def bulk_update_promotions(self, hotel_ids: list, code: str, discount_value: int):
        """Updates promotion coupon for multiple hotels in one single API call."""
        try:
            payload = {
                "hotelIds": hotel_ids,
                "code": (code or "BASIC").upper().strip(),
                "discountType": "percentage",
                "discountValue": float(discount_value),
                "isActive": True
            }
            url = f"{self.base_url}/admin/hotels/bulk-promotion"
            resp = self.session.post(url, json=payload, headers=self._headers(), timeout=40)
            res = resp.json()
            if os.path.exists(HOTELS_CACHE_FILE):
                try:
                    os.remove(HOTELS_CACHE_FILE)
                except Exception:
                    pass
            return res
        except Exception as e:
            print(f"[API Error] bulk_update_promotions: {e}")
            return {"success": False, "message": str(e)}

    def update_hotel(self, hotel_id: int, payload: dict):
        try:
            url = f"{self.base_url}/hotels/{hotel_id}"
            resp = self.session.put(url, json=payload, headers=self._headers(), timeout=25)
            return resp.json()
        except Exception as e:
            return {"success": False, "message": str(e)}

    def add_room(self, hotel_id: int, room_payload: dict):
        try:
            url = f"{self.base_url}/hotels/{hotel_id}/rooms"
            resp = self.session.post(url, json=room_payload, headers=self._headers(), timeout=25)
            return resp.json()
        except Exception as e:
            return {"success": False, "message": str(e)}

    def toggle_status(self, hotel_id: int):
        try:
            url = f"{self.base_url}/admin/hotels/{hotel_id}/suspend"
            resp = self.session.put(url, headers=self._headers(), timeout=25)
            return resp.json()
        except Exception as e:
            return {"success": False, "message": str(e)}

    def toggle_trending(self, hotel_id: int):
        try:
            url = f"{self.base_url}/admin/hotels/{hotel_id}/trending"
            resp = self.session.put(url, headers=self._headers(), timeout=25)
            return resp.json()
        except Exception as e:
            return {"success": False, "message": str(e)}

    def toggle_featured(self, hotel_id: int):
        try:
            url = f"{self.base_url}/admin/hotels/{hotel_id}/featured"
            resp = self.session.put(url, headers=self._headers(), timeout=25)
            return resp.json()
        except Exception as e:
            return {"success": False, "message": str(e)}

    def get_directory_leads(self):
        """Fetches directory hotels ranked by call clicks and views."""
        try:
            url = f"{self.base_url}/admin/directory/top-leads"
            resp = self.session.get(url, headers=self._headers(), timeout=25)
            data = resp.json()
            return data.get("data", []) if data.get("success") else []
        except Exception as e:
            print(f"[API Error] get_directory_leads: {e}")
            return []

    def convert_listing_type(self, hotel_id: int, listing_type: str = "bookable", contact_phone: str = None, contact_email: str = None, price_per_night: float = None, booking_url: str = None, booking_price: int = None, mmt_url: str = None, mmt_price: int = None):
        """Converts hotel between 'directory' and 'bookable' and sets OTA prices & links."""
        try:
            payload = {"listingType": listing_type}
            if contact_phone: payload["contactPhone"] = contact_phone
            if contact_email: payload["contactEmail"] = contact_email
            if price_per_night is not None: payload["pricePerNight"] = float(price_per_night)
            if booking_url: payload["bookingUrl"] = booking_url
            if booking_price is not None: payload["bookingPrice"] = int(booking_price)
            if mmt_url: payload["mmtUrl"] = mmt_url
            if mmt_price is not None: payload["mmtPrice"] = int(mmt_price)

            url = f"{self.base_url}/admin/hotels/{hotel_id}/convert-type"
            resp = self.session.put(url, json=payload, headers=self._headers(), timeout=25)
            res = resp.json()
            if os.path.exists(HOTELS_CACHE_FILE):
                try:
                    os.remove(HOTELS_CACHE_FILE)
                except Exception:
                    pass
            return res
        except Exception as e:
            print(f"[API Error] convert_listing_type({hotel_id}): {e}")
            return {"success": False, "message": str(e)}

    def track_lead(self, hotel_id: int, action: str = "call"):
        """Public endpoint to track call, email, or view clicks."""
        try:
            url = f"{self.base_url}/hotels/{hotel_id}/track-lead"
            resp = self.session.post(url, json={"action": action}, timeout=15)
            return resp.json()
        except Exception as e:
            return {"success": False, "message": str(e)}
