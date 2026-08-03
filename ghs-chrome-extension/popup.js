// GHS Extension Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const scrapeBtn = document.getElementById('scrapeBtn');
  const exportBtn = document.getElementById('exportBtn');
  const previewCard = document.getElementById('previewCard');
  const alertBox = document.getElementById('alertBox');

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

  // --- 1. SCRAPE ACTION ---
  scrapeBtn.addEventListener('click', async () => {
    hideAlert();
    scrapeBtn.disabled = true;
    scrapeBtn.innerText = 'Extracting Hotel Data...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error('No active tab found.');

      // Inject content.js if not already injected
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }).catch(() => {}); // Ignore error if already injected

      chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_HOTEL_DATA' }, (res) => {
        scrapeBtn.disabled = false;
        scrapeBtn.innerHTML = '<span>⚡</span> Scrape Current Hotel Page';

        if (chrome.runtime.lastError || !res || !res.success) {
          showAlert(res?.error || chrome.runtime.lastError?.message || 'Could not extract data from page. Ensure you are on a hotel page.', 'error');
          return;
        }

        currentExtractedData = res.data;

        // Auto-generate credentials slug if not entered
        const slug = currentExtractedData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        if (!hotelEmailInp.value) hotelEmailInp.value = `${slug}@ghs.com`;
        if (!hotelPhoneInp.value) hotelPhoneInp.value = `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`;
        if (!hotelPasswordInp.value) hotelPasswordInp.value = `${currentExtractedData.name.replace(/[^a-zA-Z]/g, '') || 'Hotel'}@123`;

        // Update UI preview
        hotelNameEl.innerText = currentExtractedData.name;
        hotelLocEl.innerText = `${currentExtractedData.address} (${currentExtractedData.city})`;
        statPhotosEl.innerText = currentExtractedData.images ? currentExtractedData.images.length : 0;
        statRoomsEl.innerText = currentExtractedData.roomTypes ? currentExtractedData.roomTypes.length : 0;
        statStarsEl.innerText = `${currentExtractedData.starRating || 4}★`;

        previewCard.style.display = 'block';
        showAlert('Hotel page parsed successfully! Check preview below.', 'success');
      });
    } catch (err) {
      scrapeBtn.disabled = false;
      scrapeBtn.innerHTML = '<span>⚡</span> Scrape Current Hotel Page';
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
    exportBtn.innerText = 'Sending to GHS Importer...';

    // Override inputs from form
    currentExtractedData.email = hotelEmailInp.value || currentExtractedData.email;
    currentExtractedData.phone = hotelPhoneInp.value || currentExtractedData.phone;
    currentExtractedData.password = hotelPasswordInp.value || currentExtractedData.password;

    let sentLive = false;
    let sentLocal = false;

    // 1. Post to GHS Live Cloud Server
    try {
      const liveRes = await fetch('https://gethotelstays.com/api/admin/importer/scraped-hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentExtractedData)
      });
      const liveData = await liveRes.json();
      if (liveRes.ok && liveData.success) sentLive = true;
    } catch (e) {
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
      showAlert('🎉 Success! Hotel exported to GHS Super Admin Importer. Open Importer page to 1-Click Import.', 'success');
    } else {
      showAlert('Export Failed: Could not reach GHS server or local agent.', 'error');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = '<span>📤</span> Export to GHS Super Admin';
    }
  });
});
