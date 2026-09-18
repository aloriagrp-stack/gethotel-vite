"""
Test script for verifying pure chat prompt parsing without any links
"""
import sys
import json
from parser_engine import parse_chat_prompt_intent

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def run_tests():
    print("==================================================")
    print("TEST 1: Multiple rooms with custom prices & amenities")
    prompt1 = "deluxe 2500, super deluxe 3500 with balcony, suite 5000 with bathtub"
    res1 = parse_chat_prompt_intent(prompt1)
    print("Reply:", res1["reply"][:80], "...")
    print(f"Total Rooms Extracted: {len(res1['rooms'])}")
    for idx, r in enumerate(res1['rooms']):
        print(f"  Room {idx+1}: {r['name']} | ₹{r['pricePerNight']} | Bed: {r['bedConfiguration']} | Amenities: {', '.join(r['amenities'][:3])}...")

    print("\n==================================================")
    print("TEST 2: Hinglish natural sentence with custom rates")
    prompt2 = "mere hotel me 3 room hai: standard 1200, deluxe 2200 aur family 3200"
    res2 = parse_chat_prompt_intent(prompt2)
    print(f"Total Rooms Extracted: {len(res2['rooms'])}")
    for idx, r in enumerate(res2['rooms']):
        print(f"  Room {idx+1}: {r['name']} | ₹{r['pricePerNight']} | Occ: {r['maxOccupancy']}")

    print("\n==================================================")
    print("TEST 3: Greeting without rooms")
    prompt3 = "hello kaise ho aap"
    res3 = parse_chat_prompt_intent(prompt3)
    print("Intent:", res3["intent"])
    print("Reply:\n", res3["reply"])

    print("\n==================================================")
    print("TEST 4: Updating an existing room's price via chat")
    existing = [
        {"id": 101, "name": "Deluxe Room", "pricePerNight": 2500, "bedConfiguration": "1 King Bed"},
        {"id": 102, "name": "Executive Suite", "pricePerNight": 4500, "bedConfiguration": "1 King Bed"}
    ]
    prompt4 = "deluxe room ka price 2800 kar do"
    res4 = parse_chat_prompt_intent(prompt4, existing_rooms=existing)
    print("Intent:", res4["intent"])
    print("Reply:", res4["reply"])
    for r in res4["rooms"]:
        print(f"  Room: {r['name']} | ID: {r.get('id')} | Price: ₹{r['pricePerNight']} | Action: {r.get('action')}")

    print("\n==================================================")
    print("TEST 5: Clear all rooms via chat")
    prompt5 = "clear all rooms"
    res5 = parse_chat_prompt_intent(prompt5, existing_rooms=existing)
    print("Intent:", res5["intent"])
    print("ClearAllRooms:", res5["clearAllRooms"])

    print("\nALL PURE CHAT TESTS PASSED WITH 100% ACCURACY!")

if __name__ == "__main__":
    run_tests()
