"""
Test script for verifying Python Engine endpoints directly.
"""
import sys
import json
from starlette.testclient import TestClient
from main import app

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

client = TestClient(app)

def test_all():
    print("Testing /health endpoint...")
    r = client.get("/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print("Health response:", r.json())

    print("\nTesting /api/suggest-rooms with prompt...")
    payload = {
        "hotelName": "Grand Palace Hotel",
        "prompt": "Recommend standard setup: 1 Deluxe King, 1 Executive Suite"
    }
    r = client.post("/api/suggest-rooms", json=payload)
    assert r.status_code == 200, f"Suggest rooms failed: {r.status_code}"
    data = r.json()
    assert data["success"] is True
    print(f"Generated {len(data['data'])} rooms successfully!")
    print("Reply:", data["reply"][:120], "...")
    for idx, rm in enumerate(data["data"]):
        print(f"  Room {idx+1}: {rm['name']} | Price: ₹{rm['pricePerNight']} | Bed: {rm['bedConfiguration']} | Occ: {rm['maxOccupancy']}")

    print("\nTesting /api/import-reviews with raw text...")
    review_text = """
    Rohan Verma - 5/5 - 2026-06-12
    The stay was wonderful! Clean rooms, fantastic staff, and great breakfast.

    Neha Gupta - 4/5 - 2026-06-15
    Good location near metro station. Comfortable bed and hot water available.
    """
    r = client.post("/api/import-reviews", json={"rawText": review_text})
    assert r.status_code == 200, f"Import reviews failed: {r.status_code}"
    rev_data = r.json()
    assert rev_data["success"] is True
    print(f"Parsed {rev_data['count']} reviews successfully!")
    for rev in rev_data["data"]:
        print(f"  Reviewer: {rev['userName']} | Rating: {rev['rating']}⭐ | Comment: {rev['comment']}")

    print("\nTesting /api/bulk-onboard-preview with sample file...")
    sample_file = {
        "fileName": "sample_hotel.json",
        "content": json.dumps({
            "hotel": {
                "name": "The Royal Orchid",
                "city": "Jaipur",
                "pricePerNight": 3200
            },
            "rooms": [
                { "name": "Heritage Deluxe", "pricePerNight": 3200 },
                { "name": "Maharaja Suite", "pricePerNight": 5500 }
            ]
        })
    }
    r = client.post("/api/bulk-onboard-preview", json={"files": [sample_file]})
    assert r.status_code == 200, f"Bulk onboard failed: {r.status_code}"
    bulk_data = r.json()
    assert bulk_data["success"] is True
    print(f"Parsed {bulk_data['totalParsed']} hotel files successfully!")
    for h in bulk_data["hotels"]:
        print(f"  Hotel: {h['hotelName']} | Rooms: {len(h['rooms'])} | Partner Email: {h['partner']['email']}")

    print("\nALL PYTHON ENGINE TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_all()
