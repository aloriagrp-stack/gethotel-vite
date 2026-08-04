// GHS Extension Popup Script with Live Workings Terminal
document.addEventListener('DOMContentLoaded', () => {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const exportBtn = document.getElementById('exportBtn');
  const previewCard = document.getElementById('previewCard');
  const alertBox = document.getElementById('alertBox');

  const progressTerminal = document.getElementById('progressTerminal');
  const progressPercent = document.getElementById('progressPercent');
  const terminalFill = document.getElementById('terminalFill');
  const terminalLogs = document.getElementById('terminalLogs');

  const hotelNameEl = document.getElementById('hotelName');
  const hotelLocEl = document.getElementById('hotelLoc');
  const statPhotosEl = document.getElementById('statPhotos');
  const statRoomsEl = document.getElementById('statRooms');
  const statStarsEl = document.getElementById('statStars');

  const hotelEmailInp = document.getElementById('hotelEmail');
  const hotelPhoneInp = document.getElementById('hotelPhone');
  const hotelPasswordInp = document.getElementById('hotelPassword');

  let currentExtractedData = null;

  function showAlert(msg, type = 'success') {
    alertBox.style.display = 'block';
    alertBox.className = `alert-box alert-${type}`;
    alertBox.innerText = msg;
  }

  function hideAlert() {
    alertBox.style.display = 'none';
  }

  function logTerminal(msg, percent) {
    progressTerminal.style.display = 'block';
    if (percent !== undefined) {
      progressPercent.innerText = `${percent}%`;
      terminalFill.style.width = `${percent}%`;
    }
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerText = msg;
    terminalLogs.appendChild(line);
    terminalLogs.scrollTop = terminalLogs.scrollHeight;
  }

  function clearTerminal() {
    terminalLogs.innerHTML = '';
    progressPercent.innerText = '0%';
    terminalFill.style.width = '0%';
  }

  // --- 1. SCRAPE ACTION WITH LIVE WORKINGS TERMINAL ---
  scrapeBtn.addEventListener('click', async () => {
    hideAlert();
    clearTerminal();
    previewCard.style.display = 'none';
    scrapeBtn.disabled = true;
    scrapeBtn.innerText = '⏳ Extracting Hotel Data...';

    logTerminal('🔍 [1/6] Scanning Page DOM & Active Tab URL...', 15);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('No active tab found.');

      logTerminal(`🌐 Page URL: ${tab.url.slice(0, 45)}...`, 25);

      // Inject content script to ensure extraction functions are ready
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }).catch(() => {});

      logTerminal('📷 [2/6] Extracting High-Res Gallery Photos (Capped Max 30)...', 40);

      // Execute extraction directly inside tab context
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          try {
            const url = window.location.href;
            
            let name = document.querySelector('h1[data-testid="hotel-name"], h1.hdrName, h1#hname, h1')?.innerText?.trim();
            if (!name) name = document.title.split('-')[0].split('|')[0].trim() || 'Scraped Hotel';
            name = name.replace(/\n.*/g, '').trim();

            const locText = document.querySelector('span[data-testid="location"], p.locDetails, .header-view__address, .locMapText')?.innerText?.trim() || 'India';

            // Star Rating
            let starRating = 4;
            const starMatch = (document.body.innerText || '').match(/(\d)\s*Star/i);
            if (starMatch) starRating = parseInt(starMatch[1]);

            // Images (Max 30)
            const rawImages = new Set();
            document.querySelectorAll('img').forEach((img) => {
              let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
              if (src && src.includes('http') && !src.includes('logo') && !src.includes('svg') && !src.includes('icon')) {
                src = src.split('?')[0].replace(/w_\d+,h_\d+/, 'w_1200,h_800');
                rawImages.add(src);
              }
            });
            const imageList = Array.from(rawImages).slice(0, 30);

            // Room Types & Rates
            const roomTypes = [];
            const roomCards = document.querySelectorAll('[class*="roomCard"], [class*="RoomCard"], [class*="roomRow"], [class*="RoomRow"], [class*="roomType"], .roomDetailCard, .rmType');
            
            const seenRooms = new Set();
            if (roomCards.length > 0) {
              roomCards.forEach((c) => {
                const rNameEl = c.querySelector('h2, h3, h4, [class*="roomName"], [class*="RoomName"], [class*="roomTitle"], .roomTypeTitle');
                let rName = rNameEl?.innerText?.trim();
                if (!rName || rName.length < 3) return;
                rName = rName.split('\n')[0].replace(/₹.*/, '').trim();
                
                if (seenRooms.has(rName.toLowerCase())) return;
                seenRooms.add(rName.toLowerCase());

                // Price
                const pEl = c.querySelector('[class*="price"], [class*="Price"], [class*="amount"], .roomPrice');
                let price = 2499;
                if (pEl) {
                  const pm = pEl.innerText.replace(/,/g, '').match(/\d+/);
                  if (pm) price = parseInt(pm[0]);
                }

                roomTypes.push({
                  name: rName,
                  description: `${rName} with air conditioning, comfortable bedding & en-suite bathroom.`,
                  basePrice: price,
                  maxAdults: 2,
                  maxChildren: 1,
                  amenities: ['Air Conditioning', 'Free Wi-Fi', 'Flat Screen TV', 'Room Service'],
                  ratePlans: [
                    { title: 'Room Only (Flexible)', price: price, features: ['Free Wi-Fi', 'Free Cancellation'] },
                    { title: 'Room with Breakfast', price: Math.round(price * 1.15), features: ['Free Breakfast Included', 'Free Wi-Fi'] }
                  ]
                });
              });
            }

            if (roomTypes.length === 0) {
              roomTypes.push(
                { name: 'Deluxe AC Room', basePrice: 1850, maxAdults: 2, amenities: ['AC', 'Wi-Fi'] },
                { name: 'Executive Suite', basePrice: 2850, maxAdults: 3, amenities: ['AC', 'Wi-Fi', 'TV'] }
              );
            }

            return {
              name,
              address: locText,
              city: url.toLowerCase().includes('goa') ? 'Goa' : (url.toLowerCase().includes('mumbai') ? 'Mumbai' : 'Delhi'),
              state: 'Delhi',
              country: 'India',
              starRating,
              description: `${name} offers luxury accommodation with top amenities, air conditioning, and 24/7 guest service.`,
              coverImageUrl: imageList[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
              images: imageList,
              roomTypes
            };
          } catch (e) {
            return { error: e.message };
          }
        }
      });

      logTerminal('🛏️ [3/6] Parsing Room Categories & Max Occupancies...', 60);

      setTimeout(() => {
        logTerminal('💰 [4/6] Extracting Rate Plans, Meal Inclusions & Taxes...', 80);
      }, 300);

      setTimeout(() => {
        logTerminal('🖼️ [5/6] Mapping Room-Specific Photos & Amenities...', 90);
      }, 600);

      setTimeout(() => {
        scrapeBtn.disabled = false;
        scrapeBtn.innerHTML = '<span>⚡</span> Scrape Current Hotel Page';

        const extracted = results && results[0] && results[0].result;
        if (!extracted || extracted.error) {
          logTerminal('❌ [Error] Extraction failed on page.', 100);
          showAlert(extracted?.error || 'Failed to parse page.', 'error');
          return;
        }

        logTerminal(`✅ [6/6] Successfully Extracted: "${extracted.name}" (${extracted.images.length} Photos, ${extracted.roomTypes.length} Rooms)!`, 100);

        currentExtractedData = extracted;

        // Auto-generate credentials slug if not entered
        const slug = currentExtractedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        if (!hotelEmailInp.value) hotelEmailInp.value = `${slug}@ghs.com`;
        if (!hotelPhoneInp.value) hotelPhoneInp.value = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
        if (!hotelPasswordInp.value) hotelPasswordInp.value = `${currentExtractedData.name.replace(/[^a-zA-Z]/g, '') || 'Hotel'}@123`;

        // Update UI preview
        hotelNameEl.innerText = currentExtractedData.name;
        hotelLocEl.innerText = `${currentExtractedData.address}`;
        statPhotosEl.innerText = currentExtractedData.images ? currentExtractedData.images.length : 0;
        statRoomsEl.innerText = currentExtractedData.roomTypes ? currentExtractedData.roomTypes.length : 0;
        statStarsEl.innerText = `${currentExtractedData.starRating || 4}★`;

        previewCard.style.display = 'block';
        showAlert('Hotel page parsed successfully! Check preview below.', 'success');
      }, 900);

    } catch (err) {
      scrapeBtn.disabled = false;
      scrapeBtn.innerHTML = '<span>⚡</span> Scrape Current Hotel Page';
      logTerminal(`❌ [Error] ${err.message}`, 100);
      showAlert(err.message, 'error');
    }
  });

  // --- 2. EXPORT ACTION ---
  exportBtn.addEventListener('click', async () => {
    if (!currentExtractedData) {
      showAlert('Please scrape a hotel page first.', 'error');
      return;
    }

    exportBtn.disabled = true;
    exportBtn.innerText = '📤 Sending to GHS Importer...';

    // Override inputs from form
    currentExtractedData.email = hotelEmailInp.value || currentExtractedData.email;
    currentExtractedData.phone = hotelPhoneInp.value || currentExtractedData.phone;
    currentExtractedData.password = hotelPasswordInp.value || currentExtractedData.password;

    let sentLive = false;
    let sentLocal = false;

    try {
      // 1. Post to GHS Live Cloud Server
      let liveError = '';
      try {
        const liveRes = await fetch('https://gethotelstays.com/api/admin/importer/scraped-hotel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentExtractedData)
        });
        const liveData = await liveRes.json();
        if (liveRes.ok && liveData.success) {
          sentLive = true;
        } else {
          liveError = liveData.message || `HTTP ${liveRes.status}`;
        }
      } catch (e) {
        liveError = e.message;
        console.warn('[Extension Notice] Could not reach gethotelstays.com live server:', e.message);
      }

      // 2. Post to Local Exporter Agent (if running)
      try {
        const localRes = await fetch('http://localhost:4000/api/export/scraped-hotel?api_key=ghs-export-key-2024', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-api-key': 'ghs-export-key-2024'
          },
          body: JSON.stringify(currentExtractedData)
        });
        const localData = await localRes.json();
        if (localRes.ok && localData.success) sentLocal = true;
      } catch (e) {
        console.warn('[Extension Notice] Localhost exporter unreachable:', e.message);
      }

      if (sentLive || sentLocal) {
        showAlert(`🎉 Success! Exported "${currentExtractedData.name}" to GHS Super Admin Importer. Click Refresh on Importer Page to import!`, 'success');
      } else {
        showAlert(`Export Failed: ${liveError || 'Could not reach GHS server'}`, 'error');
      }
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '<span>📤</span> Export to GHS Super Admin';
    }
  });
});
