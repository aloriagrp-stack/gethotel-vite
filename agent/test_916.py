from playwright.sync_api import sync_playwright
import urllib.parse
import time

kw = "Treebo Cabana Delhi"
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page()
    t0 = time.time()
    maps_url = f"https://www.google.com/maps/search/{urllib.parse.quote(kw)}"
    print("Navigating to:", maps_url)
    page.goto(maps_url, wait_until="domcontentloaded", timeout=9000)
    print("Page loaded in", round(time.time() - t0, 2), "s")
    page.wait_for_timeout(2500)
    
    first_card = page.query_selector('div.Nv2PK, [role="article"], a.hfpxzc')
    print("first_card found:", bool(first_card))
    if first_card:
        first_card.click(timeout=2000)
        page.wait_for_timeout(2000)
        
    phone_btn = page.query_selector('[data-item-id*="phone:tel:"], button[aria-label*="Phone:"], button[data-tooltip*="phone"]')
    print("phone_btn:", phone_btn.get_attribute("aria-label") if phone_btn else None)
    
    web_btn = page.query_selector('[data-item-id="authority"], a[aria-label*="Website:"], a[data-tooltip*="website"]')
    raw_w = web_btn.get_attribute("href") if web_btn else None
    print("web_btn:", raw_w)

    browser.close()
    print("Done in total:", round(time.time() - t0, 2), "s")
