// GHS Hotel Scraper - Content Script
(function () {
  console.log('[GHS Scraper Extension] Content script loaded on:', window.location.href);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_HOTEL_DATA') {
      try {
        const data = extractHotelData();
        sendResponse({ success: true, data });
      } catch (err) {
        console.error('[GHS Scraper Error]:', err);
        sendResponse({ success: false, error: err.message || 'Extraction failed' });
      }
    }
    return true;
  });

  function extractHotelData() {
    const url = window.location.href;
    const isMMT = url.includes('makemytrip.com');
    const isBooking = url.includes('booking.com');
    const isAgoda = url.includes('agoda.com');

    let hotelName = '';
    let address = '';
    let city = 'Delhi';
    let state = 'Delhi';
    let country = 'India';
    let starRating = 4;
    let description = '';
    let coverImageUrl = '';
    let galleryImages = [];
    let roomTypes = [];

    // --- 1. HOTEL NAME & LOCATION ---
    if (isMMT) {
      hotelName = document.querySelector('h1[data-testid="hotel-name"], h1.hdrName, h1#hname, h1')?.innerText?.trim() || '';
      const locText = document.querySelector('span[data-testid="location"], p.locDetails, .header-view__address, .locMapText')?.innerText?.trim() || '';
      address = locText || 'Delhi, India';
      
      // Parse city from address
      if (locText.toLowerCase().includes('delhi')) city = 'Delhi';
      else if (locText.toLowerCase().includes('mumbai')) city = 'Mumbai';
      else if (locText.toLowerCase().includes('goa')) city = 'Goa';
      else if (locText.toLowerCase().includes('jaipur')) city = 'Jaipur';
      else if (locText.toLowerCase().includes('manali')) city = 'Manali';
      else if (locText.toLowerCase().includes('shimla')) city = 'Shimla';
      else if (locText.toLowerCase().includes('udaipur')) city = 'Udaipur';

    } else if (isBooking) {
      hotelName = document.querySelector('h2.pp-header__title, h2.hp__hotel-name, h1')?.innerText?.trim() || '';
      address = document.querySelector('.hp_address_subtitle, .bui-link')?.innerText?.trim() || '';
    } else {
      hotelName = document.querySelector('h1')?.innerText?.trim() || document.title.split('-')[0].split('|')[0].trim();
      address = document.querySelector('.address, .location, [class*="address"]')?.innerText?.trim() || 'India';
    }

    // Fallback name clean
    if (!hotelName) hotelName = document.title.split('-')[0].split('|')[0].trim() || 'Scraped Hotel';

    // --- 2. STAR RATING ---
    const starEl = document.querySelector('[class*="star"], [data-testid*="star"]');
    if (starEl) {
      const starText = starEl.innerText || starEl.getAttribute('aria-label') || '';
      const match = starText.match(/(\d+)/);
      if (match) starRating = Math.min(5, Math.max(1, parseInt(match[1])));
    }

    // --- 3. DESCRIPTION ---
    const descEl = document.querySelector('[data-testid="property-description"], .descriptionText, .hotelDesc, #hotel_desc, [class*="description"]');
    description = descEl?.innerText?.trim() || `${hotelName} offers premium accommodation with top amenities, air-conditioned rooms, free Wi-Fi, and 24/7 room service.`;

    // --- 4. GALLERY IMAGES & COVER IMAGE (MAX 30) ---
    const rawImageSet = new Set();
    const allImgEls = Array.from(document.querySelectorAll('img'));

    allImgEls.forEach((img) => {
      let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('srcset') || '';
      if (typeof src === 'string' && src.includes('http')) {
        // High-res cleanup for MMT / OTAs
        src = src.split('?')[0].replace(/w_\d+,h_\d+/, 'w_1200,h_800').replace(/w_\d+/, 'w_1200');
        if (
          !src.includes('logo') &&
          !src.includes('icon') &&
          !src.includes('avatar') &&
          !src.includes('map') &&
          !src.includes('svg') &&
          (src.includes('jpg') || src.includes('jpeg') || src.includes('png') || src.includes('webp'))
        ) {
          rawImageSet.add(src);
        }
      }
    });

    const allImagesArray = Array.from(rawImageSet);
    coverImageUrl = allImagesArray[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
    galleryImages = allImagesArray.slice(0, 30); // Max 30 photos

    // --- 5. ROOM CATEGORIES, ROOM IMAGES & RATE PLANS ---
    const roomContainers = document.querySelectorAll(
      '[data-testid*="room"], [class*="roomCategory"], [class*="roomCard"], [class*="room-container"], .roomContainer, .roomDetail'
    );

    if (roomContainers.length > 0) {
      roomContainers.forEach((container, idx) => {
        const rNameEl = container.querySelector('h2, h3, h4, [class*="roomName"], [class*="roomTitle"], .roomTypeTitle');
        const rName = rNameEl?.innerText?.trim();
        if (!rName || rName.length < 3 || rName.toLowerCase().includes('select') || rName.toLowerCase().includes('choose')) return;

        // Room photos
        const roomImgSet = new Set();
        container.querySelectorAll('img').forEach((rImg) => {
          let rSrc = rImg.src || rImg.getAttribute('data-src') || '';
          if (rSrc && rSrc.includes('http') && !rSrc.includes('icon') && !rSrc.includes('svg')) {
            roomImgSet.add(rSrc.split('?')[0]);
          }
        });
        const rImages = Array.from(roomImgSet).slice(0, 5);

        // Price extraction
        const priceEl = container.querySelector('[class*="price"], [class*="amount"], .roomPrice, .font22');
        let basePrice = 2499;
        if (priceEl) {
          const pMatch = priceEl.innerText.replace(/,/g, '').match(/\d+/);
          if (pMatch) basePrice = parseInt(pMatch[0]);
        }

        // Rate plans extraction
        const ratePlanEls = container.querySelectorAll('[class*="ratePlan"], [class*="planOption"], [class*="option"], li');
        const ratePlans = [];

        if (ratePlanEls.length > 0) {
          ratePlanEls.forEach((planEl) => {
            const pTxt = planEl.innerText?.trim();
            if (pTxt && (pTxt.toLowerCase().includes('breakfast') || pTxt.toLowerCase().includes('cancellation') || pTxt.toLowerCase().includes('pay at') || pTxt.toLowerCase().includes('only'))) {
              ratePlans.push({
                title: pTxt.slice(0, 80),
                price: basePrice,
                features: ['Free Wi-Fi', pTxt.slice(0, 60)]
              });
            }
          });
        }

        if (ratePlans.length === 0) {
          ratePlans.push({
            title: 'Room Only (Flexible Rate)',
            price: basePrice,
            features: ['Free High-Speed Wi-Fi', 'Free Cancellation up to 24 hours', 'Pay at Hotel available']
          });
          ratePlans.push({
            title: 'Room with Complimentary Breakfast',
            price: Math.round(basePrice * 1.18),
            features: ['Buffet Breakfast Included', 'Free High-Speed Wi-Fi', 'Free Cancellation']
          });
        }

        roomTypes.push({
          name: rName,
          description: `Spacious ${rName} equipped with modern amenities, luxury king bedding, desk, AC, smart TV, and ensuite bathroom.`,
          maxAdults: 2,
          maxChildren: 1,
          basePrice,
          images: rImages.length > 0 ? rImages : [galleryImages[idx % galleryImages.length] || coverImageUrl],
          amenities: ['Air Conditioning', 'Free Wi-Fi', 'Flat Screen TV', 'Ensuite Bathroom', 'Electric Kettle'],
          ratePlans
        });
      });
    }

    // Default Fallback Room Categories if DOM parser didn't find specific room divs
    if (roomTypes.length === 0) {
      roomTypes = [
        {
          name: 'Deluxe Room',
          description: `Comfortable Deluxe Room at ${hotelName} with air conditioning, king bed, free Wi-Fi, and modern bathroom amenities.`,
          maxAdults: 2,
          maxChildren: 1,
          basePrice: 2499,
          images: galleryImages.slice(0, 3),
          amenities: ['Air Conditioning', 'Free Wi-Fi', 'Flat Screen TV', 'Ensuite Bathroom'],
          ratePlans: [
            { title: 'Room Only (Standard)', price: 2499, features: ['Free Wi-Fi', 'Pay 12% Online, Rest at Hotel'] },
            { title: 'Room with Breakfast', price: 2899, features: ['Complimentary Buffet Breakfast', 'Free Wi-Fi'] }
          ]
        },
        {
          name: 'Executive Suite',
          description: `Premium Executive Suite featuring extra living area, king bed, city view, mini-fridge, and luxury bath amenities.`,
          maxAdults: 3,
          maxChildren: 1,
          basePrice: 3999,
          images: galleryImages.slice(3, 6),
          amenities: ['Air Conditioning', 'Free Wi-Fi', 'Smart TV', 'Living Area', 'Mini Bar', 'Ensuite Bathroom'],
          ratePlans: [
            { title: 'Executive Plan (Breakfast Included)', price: 3999, features: ['Free Breakfast', 'Free Cancellation', 'Welcome Drink'] }
          ]
        }
      ];
    }

    return {
      name: hotelName,
      description,
      starRating,
      address,
      city,
      state,
      country,
      coverImageUrl,
      images: galleryImages,
      roomTypes,
      policies: [
        { title: 'Check-in Policy', content: 'Standard Check-in time is 12:00 PM. Valid Govt ID required.' },
        { title: 'Check-out Policy', content: 'Standard Check-out time is 11:00 AM.' },
        { title: 'Cancellation Policy', content: 'Free cancellation up to 24 hours prior to check-in.' }
      ]
    };
  }
})();
