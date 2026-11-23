document.addEventListener("DOMContentLoaded", async () => {
  const statusDot = document.getElementById("status-dot");
  const pageStatus = document.getElementById("page-status");
  const statHotels = document.getElementById("stat-hotels");
  const statPages = document.getElementById("stat-pages");
  const btnToggle = document.getElementById("btn-toggle");
  const btnToggleText = document.getElementById("btn-toggle-text");
  const btnDownload = document.getElementById("btn-download");
  const btnClear = document.getElementById("btn-clear");

  // 1. Check current tab (Supports Booking.com and Brevistay)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isBooking = tab && tab.url && tab.url.includes("booking.com");
  const isBrevistay = tab && tab.url && tab.url.includes("brevistay.com");
  const isSupported = isBooking || isBrevistay;

  if (!isSupported) {
    statusDot.className = "dot red";
    pageStatus.innerText = "Please open Booking.com or Brevistay";
    btnToggle.disabled = true;
    btnToggle.style.opacity = "0.5";
  } else {
    statusDot.className = "dot green";
    pageStatus.innerText = isBrevistay ? "Connected to Brevistay (Hourly)" : "Connected to Booking.com";
  }

  // 2. Refresh UI stats from storage
  async function refreshUI() {
    const data = await chrome.storage.local.get([
      "ghs_harvested_hotels",
      "ghs_pages_scanned",
      "ghs_is_active"
    ]);

    const hotels = data.ghs_harvested_hotels || {};
    const hotelCount = Object.keys(hotels).length;
    const pages = data.ghs_pages_scanned || 1;
    const isActive = !!data.ghs_is_active;

    statHotels.innerText = hotelCount;
    statPages.innerText = pages;

    if (isActive) {
      btnToggleText.innerText = "Pause Harvesting";
      btnToggle.className = "btn btn-primary paused";
      btnToggle.querySelector(".btn-icon").innerText = "⏸️";
      statusDot.className = "dot yellow";
      pageStatus.innerText = isBrevistay ? "Harvesting Brevistay hourly hotels..." : "Harvesting Booking.com non-stop...";
    } else {
      btnToggleText.innerText = "Start Auto Harvest";
      btnToggle.className = "btn btn-primary";
      btnToggle.querySelector(".btn-icon").innerText = "🚀";
      if (isSupported) {
        statusDot.className = "dot green";
        pageStatus.innerText = isBrevistay ? "Connected to Brevistay (Ready)" : "Connected to Booking.com (Ready)";
      }
    }
  }

  await refreshUI();

  // Listen for storage changes directly for instant UI updates
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      refreshUI();
    }
  });

  // 3. Toggle Start / Pause
  btnToggle.addEventListener("click", async () => {
    const data = await chrome.storage.local.get(["ghs_is_active"]);
    const willStart = !data.ghs_is_active;
    await chrome.storage.local.set({ ghs_is_active: willStart });
    await refreshUI();
  });

  // 4. Download JSON
  btnDownload.addEventListener("click", async () => {
    const data = await chrome.storage.local.get(["ghs_harvested_hotels"]);
    const hotels = Object.values(data.ghs_harvested_hotels || {});

    if (hotels.length === 0) {
      alert("No hotels harvested yet! Click Start Auto Harvest first.");
      return;
    }

    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(hotels, null, 2));
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const prefix = isBrevistay ? "brevistay_hourly_hotels" : "booking_hotels";
    const filename = `${prefix}_${hotels.length}_${timestamp}.json`;

    chrome.downloads.download({
      url: jsonString,
      filename: filename,
      saveAs: false
    });
  });

  // 5. Clear Storage
  btnClear.addEventListener("click", async () => {
    if (confirm("Are you sure you want to clear all collected hotels?")) {
      await chrome.storage.local.set({
        ghs_harvested_hotels: {},
        ghs_pages_scanned: 1,
        ghs_is_active: false
      });
      await refreshUI();
    }
  });
});
