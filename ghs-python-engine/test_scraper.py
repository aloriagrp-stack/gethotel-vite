"""
Test scraping functionality with sample URL
"""
import sys
import asyncio
from scraper import scrape_hotel_url

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def main():
    test_url = "https://www.booking.com/hotel/in/the-taj-mahal-hotel-new-delhi.html"
    print(f"Testing scraper with URL: {test_url}")
    result = await scrape_hotel_url(test_url, 3500.0)
    print("Hotel Name:", result.get("name"))
    print("Address:", result.get("address"))
    print("Rating:", result.get("guestRating"))
    print(f"Total Photos: {len(result.get('images', []))}")
    print(f"Total Rooms: {len(result.get('rooms', []))}")
    for idx, r in enumerate(result.get("rooms", [])[:3]):
        print(f"  Room {idx+1}: {r['name']} - ₹{r['pricePerNight']} ({r['bedConfiguration']})")

if __name__ == "__main__":
    asyncio.run(main())
