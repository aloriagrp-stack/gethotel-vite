# Automated Hotel Data Importer Workflow

This workspace is equipped with an automated importer tool to scrape hotel details, images, and room prices from Booking.com and import them directly into the live database.

## How to use it with Antigravity (AI Coding Assistant)

Simply send a request in the chat like:
> "Import details for hotel **<hotel_id>** from this link: **<booking_com_url>**"

Antigravity will handle the rest automatically.

---

## Technical Details (Under the Hood)

### 1. Extraction (Scraping) Phase
To bypass Booking.com's strict bot-prevention blocks, Antigravity launches a browser subagent which opens the Booking.com URL (with the requested check-in/check-out dates for room prices). 

It extracts the details using the live page DOM:
- **Hotel Name:** Captured from `<title>` and page headers.
- **Description:** Extracted from the property description elements.
- **Address & Rating:** Parsed from the schema JSON-LD block and elements.
- **Images:** Scrapes all high-resolution (`max1280x900`) photos.
- **Rooms & Prices:** Queries the availability table (`#availability_table` or `.hprt-table`) to map room names to their current rates.

This data is saved to a temporary JSON file, e.g., `extracted_hotel.json`:
```json
{
  "name": "Hotel Name",
  "description": "Hotel description text...",
  "address": "Full street address...",
  "rating": 7.7,
  "reviewCount": 404,
  "images": [
    "https://cf.bstatic.com/.../image1.jpg",
    "https://cf.bstatic.com/.../image2.jpg"
  ],
  "rooms": [
    { "name": "Standard Double Room", "price": 5100 },
    { "name": "Deluxe Double Room", "price": 4800 }
  ]
}
```

### 2. Database Import Phase
Antigravity runs the importer script:
```bash
node "GetHotel backend/scripts/import_hotel.js" <path_to_json_file> <hotel_id>
```

This script connects via Prisma to:
1. Update the parent `hotel` record (Name, description, address, guest rating, review count, thumbnail, images list, and starting price).
2. Look up the existing room records for this hotel and update their `pricePerNight` column with the exact price matching their name.
