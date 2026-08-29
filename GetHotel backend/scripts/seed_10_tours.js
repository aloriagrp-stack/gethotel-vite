const prisma = require('../config/db');

const RAW_TOURS = [
  {
    "id": "classic-golden-triangle-tour",
    "title": "Classic Golden Triangle Tour",
    "slug": "classic-golden-triangle-tour-delhi-agra-jaipur",
    "route": "Delhi - Agra - Jaipur",
    "duration": { "days": 6, "nights": 5 },
    "category": "Heritage & Culture",
    "badge": "Bestseller",
    "rating": 4.9,
    "reviews_count": 86,
    "included_stay": "4-Star Deluxe Heritage Hotels",
    "transport": "Private AC Sedan Transfers Included",
    "image": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "The Classic Golden Triangle Tour is India's most iconic travel circuit, connecting the capital city Delhi, the timeless city of love Agra, and the vibrant Pink City Jaipur. Across six unforgettable days, travelers walk through Mughal-era forts, marvel at the eternal beauty of the Taj Mahal, and lose themselves in the bustling bazaars and royal palaces of Rajasthan. This tour is the perfect introduction to India's history, architecture, and culture, ideal for first-time visitors who want to experience the essence of the country in a short, well-paced itinerary.",
    "highlights": [
      "Sunrise visit to the Taj Mahal, Agra",
      "Explore Agra Fort, a UNESCO World Heritage Site",
      "Visit Amber Fort on elephant or jeep ride",
      "Guided tour of Old and New Delhi",
      "Shopping at Jaipur's local bazaars for gems and textiles"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi and check into your hotel. In the evening, take a relaxed orientation walk around Connaught Place or enjoy a welcome dinner featuring authentic North Indian cuisine. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Old & New Delhi Sightseeing", "desc": "Full-day city tour covering Old Delhi's Jama Masjid, Red Fort, and a rickshaw ride through Chandni Chowk, followed by New Delhi's India Gate, Humayun's Tomb, Qutub Minar, and a drive past the Presidential Palace. Overnight stay in Delhi." },
      { "day": "Day 3", "title": "Delhi to Agra", "desc": "Drive to Agra (approx. 3-4 hours). On arrival, visit Agra Fort and enjoy an evening view of the Taj Mahal from Mehtab Bagh gardens across the river. Overnight stay in Agra." },
      { "day": "Day 4", "title": "Taj Mahal Sunrise & Agra to Jaipur", "desc": "Early morning visit to witness sunrise at the Taj Mahal, one of the Seven Wonders of the World. Later, drive to Jaipur via Fatehpur Sikri, the abandoned Mughal city built by Akbar. Overnight stay in Jaipur." },
      { "day": "Day 5", "title": "Jaipur Sightseeing", "desc": "Morning excursion to Amber Fort with an elephant or jeep ride up to the entrance. Afternoon city tour covering City Palace, Jantar Mantar observatory, and a photo stop at Hawa Mahal. Evening free for shopping in Jaipur's bazaars. Overnight stay in Jaipur." },
      { "day": "Day 6", "title": "Jaipur to Delhi Departure", "desc": "Drive back to Delhi (approx. 5-6 hours) or take an optional domestic flight/train. Transfer to the airport for onward departure with cherished memories of the Golden Triangle." }
    ],
    "inclusions": [
      "5 nights hotel accommodation on double sharing basis",
      "Daily buffet breakfast",
      "Private air-conditioned vehicle for all transfers and sightseeing",
      "English-speaking local guide at each city",
      "All monument entrance fees as per itinerary",
      "Elephant/jeep ride at Amber Fort"
    ],
    "exclusions": [
      "International/domestic airfare",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 18999,
    "original_price": 24999,
    "discount_percent": "24% OFF"
  },
  {
    "id": "golden-triangle-with-udaipur",
    "title": "Golden Triangle with Udaipur Tour",
    "slug": "golden-triangle-with-udaipur-tour-package",
    "route": "Delhi - Agra - Jaipur - Udaipur",
    "duration": { "days": 8, "nights": 7 },
    "category": "Heritage & Romance",
    "badge": "Popular",
    "rating": 4.95,
    "reviews_count": 64,
    "included_stay": "4-Star Lake View & Heritage Haveli",
    "transport": "Private AC Sedan Transfers Included",
    "image": "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "This extended Golden Triangle itinerary adds the romantic Lake City of Udaipur to the classic Delhi-Agra-Jaipur circuit. Known as the 'Venice of the East', Udaipur enchants travelers with its shimmering lakes, hilltop palaces, and old-world charm, making this tour a favorite among honeymooners, photographers, and culture enthusiasts. Across eight days, guests experience Mughal grandeur, royal Rajasthani heritage, and the serene beauty of Rajasthan's lake district, blending history with romance in equal measure.",
    "highlights": [
      "Boat ride on Lake Pichola, Udaipur",
      "Visit the City Palace and Jagdish Temple in Udaipur",
      "Sunrise Taj Mahal experience in Agra",
      "Elephant ride at Amber Fort, Jaipur",
      "Scenic drive through the Aravalli hills"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi, transfer to hotel, and relax after your journey. Optional evening market walk at Khan Market or Connaught Place. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Delhi City Tour", "desc": "Explore Old and New Delhi including Red Fort, Jama Masjid, Humayun's Tomb, Qutub Minar and India Gate. Overnight stay in Delhi." },
      { "day": "Day 3", "title": "Delhi to Agra", "desc": "Drive to Agra, check into hotel, visit Agra Fort in the afternoon and view the Taj Mahal at sunset from Mehtab Bagh. Overnight stay in Agra." },
      { "day": "Day 4", "title": "Taj Mahal Sunrise, Agra to Jaipur", "desc": "Sunrise visit to the Taj Mahal followed by a drive to Jaipur via Fatehpur Sikri. Overnight stay in Jaipur." },
      { "day": "Day 5", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort, City Palace, Jantar Mantar and Hawa Mahal. Evening at leisure for local shopping. Overnight stay in Jaipur." },
      { "day": "Day 6", "title": "Jaipur to Udaipur", "desc": "Fly or drive to Udaipur (approx. 6-7 hours by road or short flight). Evening boat ride on Lake Pichola to watch the sunset over the City Palace. Overnight stay in Udaipur." },
      { "day": "Day 7", "title": "Udaipur Sightseeing", "desc": "Visit the City Palace complex, Jagdish Temple, Saheliyon Ki Bari gardens, and enjoy panoramic views from Sajjangarh (Monsoon Palace). Evening cultural show at Bagore Ki Haveli. Overnight stay in Udaipur." },
      { "day": "Day 8", "title": "Udaipur Departure", "desc": "Transfer to Udaipur airport for departure, carrying memories of forts, lakes and palaces." }
    ],
    "inclusions": [
      "7 nights hotel accommodation on double sharing basis",
      "Daily buffet breakfast",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary",
      "Lake Pichola boat ride in Udaipur"
    ],
    "exclusions": [
      "Airfare (Jaipur-Udaipur flight if chosen)",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 27999,
    "original_price": 36999,
    "discount_percent": "24% OFF"
  },
  {
    "id": "golden-triangle-with-ranthambore",
    "title": "Golden Triangle with Ranthambore Tour",
    "slug": "golden-triangle-with-ranthambore-tiger-safari-tour",
    "route": "Delhi - Agra - Ranthambore - Jaipur",
    "duration": { "days": 7, "nights": 6 },
    "category": "Heritage & Wildlife",
    "badge": "Adventure",
    "rating": 4.88,
    "reviews_count": 52,
    "included_stay": "Jungle Resort & 4-Star Hotels",
    "transport": "Private AC Vehicle + Safari Gypsies",
    "image": "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "For travelers who want more than monuments, the Golden Triangle with Ranthambore Tour blends India's greatest architectural marvels with an exhilarating wildlife experience. After exploring Delhi's history and Agra's Taj Mahal, the journey heads into the wilderness of Ranthambore National Park, one of India's best places to spot the majestic Royal Bengal Tiger in its natural habitat, before continuing to the royal city of Jaipur. This tour is ideal for families, photographers, and nature lovers looking for an unforgettable mix of culture and adventure.",
    "highlights": [
      "Two jungle safaris in Ranthambore National Park",
      "Chance sightings of tigers, leopards and diverse birdlife",
      "Sunrise visit to the Taj Mahal",
      "Visit the ancient Ranthambore Fort",
      "Amber Fort elephant/jeep ride in Jaipur"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi and transfer to your hotel. Rest and acclimatize, with an optional evening market walk. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Delhi City Tour", "desc": "Full-day sightseeing covering Red Fort, Jama Masjid, Chandni Chowk, Humayun's Tomb, Qutub Minar and India Gate. Overnight stay in Delhi." },
      { "day": "Day 3", "title": "Delhi to Agra", "desc": "Drive to Agra, visit Agra Fort, and view the Taj Mahal at sunset. Overnight stay in Agra." },
      { "day": "Day 4", "title": "Taj Mahal Sunrise, Agra to Ranthambore", "desc": "Sunrise visit to the Taj Mahal followed by a train or drive to Ranthambore (approx. 5-6 hours). Evening at leisure near the national park. Overnight stay in Ranthambore." },
      { "day": "Day 5", "title": "Ranthambore Safari", "desc": "Two jeep safaris (morning and afternoon) inside Ranthambore National Park in search of tigers, sloth bears, crocodiles and over 300 species of birds. Overnight stay in Ranthambore." },
      { "day": "Day 6", "title": "Ranthambore to Jaipur", "desc": "Morning drive to Jaipur (approx. 4 hours). Afternoon visit to Amber Fort with an elephant or jeep ride, followed by City Palace and Hawa Mahal. Overnight stay in Jaipur." },
      { "day": "Day 7", "title": "Jaipur Departure", "desc": "Morning visit to Jantar Mantar and local bazaars for shopping, then transfer to Jaipur airport or drive back to Delhi for departure." }
    ],
    "inclusions": [
      "6 nights hotel accommodation on double sharing basis",
      "Daily breakfast & resort meals in Ranthambore",
      "Two jungle safaris in Ranthambore National Park with park fees",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary"
    ],
    "exclusions": [
      "Airfare/train fare unless specified",
      "Lunch and dinner unless specified",
      "Camera fees inside the national park",
      "Personal expenses and tips",
      "Travel insurance"
    ],
    "price_starting_inr": 26499,
    "original_price": 34999,
    "discount_percent": "24% OFF"
  },
  {
    "id": "royal-rajasthan-tour",
    "title": "Royal Rajasthan Tour",
    "slug": "royal-rajasthan-tour-jaipur-jodhpur-jaisalmer-udaipur",
    "route": "Delhi - Jaipur - Jodhpur - Jaisalmer - Udaipur",
    "duration": { "days": 10, "nights": 9 },
    "category": "Grand Heritage Circuit",
    "badge": "Top Rated",
    "rating": 4.98,
    "reviews_count": 110,
    "included_stay": "Heritage Forts, Havelis & Desert Camp",
    "transport": "Private AC Sedan & Camel Safari",
    "image": "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "The Royal Rajasthan Tour is a grand exploration of India's most colorful and regal state. From the Pink City of Jaipur to the Blue City of Jodhpur, the Golden City of Jaisalmer, and the Lake City of Udaipur, this ten-day journey unveils Rajasthan's imposing forts, opulent palaces, sweeping desert landscapes, and vibrant local culture. Travelers ride camels across the Thar Desert dunes, wander through centuries-old havelis, and witness folk performances under starlit skies, making this the ultimate immersive Rajasthan experience.",
    "highlights": [
      "Camel safari and desert camping in Jaisalmer",
      "Explore Mehrangarh Fort towering over Jodhpur",
      "Amber Fort elephant/jeep ride in Jaipur",
      "Boat ride on Lake Pichola in Udaipur",
      "Folk music and dance performances in the desert"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi, transfer to Jaipur", "desc": "Arrive in Delhi and drive to Jaipur (approx. 5-6 hours) or take a short flight. Check into hotel and relax. Overnight stay in Jaipur." },
      { "day": "Day 2", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort with elephant/jeep ride, City Palace, Jantar Mantar and Hawa Mahal. Evening shopping at local bazaars. Overnight stay in Jaipur." },
      { "day": "Day 3", "title": "Jaipur to Jodhpur", "desc": "Drive to Jodhpur (approx. 5-6 hours), the Blue City. Evening at leisure exploring the old town markets. Overnight stay in Jodhpur." },
      { "day": "Day 4", "title": "Jodhpur Sightseeing", "desc": "Visit the magnificent Mehrangarh Fort, Jaswant Thada memorial, and stroll through the blue-hued lanes of the old city. Overnight stay in Jodhpur." },
      { "day": "Day 5", "title": "Jodhpur to Jaisalmer", "desc": "Drive to Jaisalmer (approx. 5-6 hours) through the changing desert landscape. Evening free to explore the Golden City. Overnight stay in Jaisalmer." },
      { "day": "Day 6", "title": "Jaisalmer Fort & Desert Camp", "desc": "Morning visit to Jaisalmer Fort, Patwon Ki Haveli and Gadisar Lake. Afternoon drive to Sam Sand Dunes for a camel safari, sunset views, and an overnight stay at a desert camp with folk music and dance." },
      { "day": "Day 7", "title": "Jaisalmer to Udaipur", "desc": "Fly or drive to Udaipur (long drive of approx. 10-11 hours, flight recommended). Check into hotel and relax by the lake. Overnight stay in Udaipur." },
      { "day": "Day 8", "title": "Udaipur Sightseeing", "desc": "Visit City Palace, Jagdish Temple, Saheliyon Ki Bari, and take an evening boat ride on Lake Pichola. Overnight stay in Udaipur." },
      { "day": "Day 9", "title": "Udaipur Leisure & Sajjangarh", "desc": "Visit Sajjangarh Palace (Monsoon Palace) for panoramic views, followed by leisure time for shopping or spa. Evening cultural show at Bagore Ki Haveli. Overnight stay in Udaipur." },
      { "day": "Day 10", "title": "Udaipur Departure", "desc": "Transfer to Udaipur airport for onward departure, concluding this grand tour of royal Rajasthan." }
    ],
    "inclusions": [
      "9 nights hotel accommodation on double sharing basis",
      "Daily breakfast",
      "Camel safari and traditional buffet dinner at desert camp in Jaisalmer",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary"
    ],
    "exclusions": [
      "Domestic flights (Jaisalmer-Udaipur, if chosen)",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 42999,
    "original_price": 54999,
    "discount_percent": "22% OFF"
  },
  {
    "id": "golden-triangle-with-pushkar-ajmer",
    "title": "Golden Triangle with Pushkar & Ajmer Tour",
    "slug": "golden-triangle-with-pushkar-ajmer-spiritual-tour",
    "route": "Delhi - Agra - Jaipur - Pushkar - Ajmer",
    "duration": { "days": 7, "nights": 6 },
    "category": "Heritage & Spirituality",
    "badge": "Spiritual",
    "rating": 4.87,
    "reviews_count": 48,
    "included_stay": "4-Star Hotels & Lakeside Resort",
    "transport": "Private AC Sedan Transfers",
    "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "This tour weaves spirituality into the classic Golden Triangle circuit, taking travelers beyond monuments into the sacred heart of Rajasthan. After discovering Delhi, Agra, and Jaipur, the journey continues to the holy town of Pushkar, home to the world's only Brahma Temple and a serene lake surrounded by ghats, and to Ajmer, revered for the Dargah of Sufi saint Khwaja Moinuddin Chishti. Perfect for travelers seeking a deeper cultural and spiritual connection alongside India's most famous heritage sites.",
    "highlights": [
      "Visit the sacred Brahma Temple in Pushkar",
      "Evening aarti at Pushkar Lake ghats",
      "Pay respects at Ajmer Sharif Dargah",
      "Sunrise Taj Mahal visit in Agra",
      "Amber Fort exploration in Jaipur"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi, transfer to hotel, and settle in for the evening. Optional local market visit. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Delhi City Tour", "desc": "Explore Red Fort, Jama Masjid, Humayun's Tomb, Qutub Minar and India Gate. Overnight stay in Delhi." },
      { "day": "Day 3", "title": "Delhi to Agra", "desc": "Drive to Agra, visit Agra Fort, and view the Taj Mahal at sunset from Mehtab Bagh. Overnight stay in Agra." },
      { "day": "Day 4", "title": "Taj Mahal Sunrise, Agra to Jaipur", "desc": "Sunrise visit to the Taj Mahal, then drive to Jaipur via Fatehpur Sikri. Overnight stay in Jaipur." },
      { "day": "Day 5", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort, City Palace, Jantar Mantar and Hawa Mahal. Overnight stay in Jaipur." },
      { "day": "Day 6", "title": "Jaipur to Pushkar & Ajmer", "desc": "Drive to Ajmer (approx. 2.5-3 hours) and visit the revered Ajmer Sharif Dargah. Continue to Pushkar, visit the Brahma Temple, and join the evening aarti at the lake ghats. Overnight stay in Pushkar." },
      { "day": "Day 7", "title": "Pushkar to Delhi Departure", "desc": "Morning at leisure to explore Pushkar's markets and lakeside cafes, then drive to Delhi (approx. 6-7 hours) or transfer to Jaipur airport for departure." }
    ],
    "inclusions": [
      "6 nights hotel accommodation on double sharing basis",
      "Daily buffet breakfast",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary"
    ],
    "exclusions": [
      "Airfare",
      "Lunch and dinner unless specified",
      "Offerings/donations at religious sites",
      "Personal expenses and tips",
      "Travel insurance"
    ],
    "price_starting_inr": 24999,
    "original_price": 31999,
    "discount_percent": "22% OFF"
  },
  {
    "id": "desert-triangle-tour",
    "title": "Desert Triangle Tour",
    "slug": "desert-triangle-tour-jaipur-jodhpur-jaisalmer",
    "route": "Jaipur - Jodhpur - Jaisalmer",
    "duration": { "days": 6, "nights": 5 },
    "category": "Desert & Culture",
    "badge": "Trending",
    "rating": 4.92,
    "reviews_count": 78,
    "included_stay": "Haveli Hotels & Luxury Desert Camp",
    "transport": "Private AC Vehicle & Camel Safari",
    "image": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "For travelers who want to focus purely on Rajasthan's desert magic, the Desert Triangle Tour connects the Pink City of Jaipur, the Blue City of Jodhpur, and the Golden City of Jaisalmer. This compact yet immersive itinerary showcases majestic hilltop forts, labyrinthine old towns, and the golden dunes of the Thar Desert. It's an ideal choice for travelers who have already seen Delhi and Agra, or who simply want to dive straight into the heart of royal Rajasthan.",
    "highlights": [
      "Camel safari at Sam Sand Dunes, Jaisalmer",
      "Explore the towering Mehrangarh Fort in Jodhpur",
      "Visit Amber Fort and City Palace in Jaipur",
      "Wander the golden sandstone Jaisalmer Fort",
      "Overnight desert camp with folk performances"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Jaipur", "desc": "Arrive in Jaipur and check into your hotel. Evening at leisure or optional walk through the local bazaars. Overnight stay in Jaipur." },
      { "day": "Day 2", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort with an elephant/jeep ride, City Palace, Jantar Mantar and Hawa Mahal. Overnight stay in Jaipur." },
      { "day": "Day 3", "title": "Jaipur to Jodhpur", "desc": "Drive to Jodhpur (approx. 5-6 hours). Evening free to explore the blue-washed old town. Overnight stay in Jodhpur." },
      { "day": "Day 4", "title": "Jodhpur to Jaisalmer", "desc": "Morning visit to Mehrangarh Fort and Jaswant Thada, then drive to Jaisalmer (approx. 5-6 hours). Overnight stay in Jaisalmer." },
      { "day": "Day 5", "title": "Jaisalmer Fort & Desert Camp", "desc": "Explore Jaisalmer Fort, Patwon Ki Haveli and Gadisar Lake in the morning. Afternoon drive to Sam Sand Dunes for a camel safari and sunset, followed by an overnight desert camp with traditional Rajasthani folk music and dance." },
      { "day": "Day 6", "title": "Jaisalmer Departure", "desc": "Transfer from desert camp to Jaisalmer airport or railway station for onward departure." }
    ],
    "inclusions": [
      "5 nights hotel/camp accommodation on double sharing basis",
      "Daily breakfast & campfire dinner in desert",
      "Camel safari and one dinner at desert camp",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary"
    ],
    "exclusions": [
      "Airfare/train fare",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 21999,
    "original_price": 28999,
    "discount_percent": "24% OFF"
  },
  {
    "id": "golden-triangle-with-bikaner",
    "title": "Golden Triangle with Bikaner Tour",
    "slug": "golden-triangle-with-bikaner-tour-package",
    "route": "Delhi - Agra - Jaipur - Bikaner",
    "duration": { "days": 8, "nights": 7 },
    "category": "Heritage & Offbeat",
    "badge": "Heritage",
    "rating": 4.86,
    "reviews_count": 39,
    "included_stay": "Heritage Hotels in Delhi, Agra, Jaipur & Bikaner",
    "transport": "Private AC Sedan Vehicle",
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "This tour takes travelers off the well-trodden path by combining the Golden Triangle with the desert city of Bikaner, famous for its imposing Junagarh Fort, intricate havelis, and the unique National Research Centre on Camel. Away from the typical tourist trail, Bikaner offers an authentic glimpse into Rajasthan's desert heritage, delicious local sweets, and a slower, more atmospheric pace, making this itinerary perfect for travelers seeking something distinct and 'atrangi' beyond the standard circuit.",
    "highlights": [
      "Explore the untouched Junagarh Fort in Bikaner",
      "Visit the National Research Centre on Camel",
      "Sunrise Taj Mahal visit in Agra",
      "Amber Fort elephant/jeep ride in Jaipur",
      "Stroll through Bikaner's spice and sweet markets"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi and check into your hotel. Evening free for rest or a local market visit. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Delhi City Tour", "desc": "Full-day sightseeing of Old and New Delhi including Red Fort, Jama Masjid, Humayun's Tomb, Qutub Minar and India Gate. Overnight stay in Delhi." },
      { "day": "Day 3", "title": "Delhi to Agra", "desc": "Drive to Agra, visit Agra Fort, and view the Taj Mahal at sunset. Overnight stay in Agra." },
      { "day": "Day 4", "title": "Taj Mahal Sunrise, Agra to Jaipur", "desc": "Sunrise visit to the Taj Mahal, then drive to Jaipur via Fatehpur Sikri. Overnight stay in Jaipur." },
      { "day": "Day 5", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort, City Palace, Jantar Mantar and Hawa Mahal. Overnight stay in Jaipur." },
      { "day": "Day 6", "title": "Jaipur to Bikaner", "desc": "Drive to Bikaner (approx. 6-7 hours) through the changing desert terrain. Evening at leisure. Overnight stay in Bikaner." },
      { "day": "Day 7", "title": "Bikaner Sightseeing", "desc": "Visit the majestic Junagarh Fort, explore old-city havelis, and stop at the National Research Centre on Camel. Evening free to sample local Bikaneri sweets and snacks. Overnight stay in Bikaner." },
      { "day": "Day 8", "title": "Bikaner Departure", "desc": "Transfer to Bikaner airport or railway station, or drive back towards Jaipur/Delhi for onward departure." }
    ],
    "inclusions": [
      "7 nights hotel accommodation on double sharing basis",
      "Daily buffet breakfast",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary",
      "Elephant/jeep ride at Amber Fort"
    ],
    "exclusions": [
      "Airfare/train fare",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 28999,
    "original_price": 37999,
    "discount_percent": "24% OFF"
  },
  {
    "id": "golden-triangle-with-mount-abu",
    "title": "Golden Triangle with Mount Abu Tour",
    "slug": "golden-triangle-with-mount-abu-hill-station-tour",
    "route": "Delhi - Agra - Jaipur - Udaipur - Mount Abu",
    "duration": { "days": 9, "nights": 8 },
    "category": "Heritage & Hill Station",
    "badge": "Hill Station",
    "rating": 4.9,
    "reviews_count": 45,
    "included_stay": "Hill Resort & 4-Star Heritage Stays",
    "transport": "Private AC Sedan Transfers",
    "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "Rajasthan's only hill station, Mount Abu, brings a cool and refreshing contrast to the desert heat, and this tour combines it beautifully with the Golden Triangle and the lake city of Udaipur. Travelers explore Mughal monuments and royal forts before ascending to the serene hills of Mount Abu, home to the exquisitely carved marble Dilwara Jain Temples and the tranquil Nakki Lake. This itinerary is ideal for those wanting a mix of heritage, romance, and cool mountain air within one Rajasthan journey.",
    "highlights": [
      "Marble carvings at Dilwara Jain Temples, Mount Abu",
      "Boating on Nakki Lake",
      "Sunset views from Sunset Point, Mount Abu",
      "Boat ride on Lake Pichola, Udaipur",
      "Sunrise Taj Mahal experience in Agra"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi and check into your hotel. Evening free for rest. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Delhi City Tour", "desc": "Explore Red Fort, Jama Masjid, Humayun's Tomb, Qutub Minar and India Gate. Overnight stay in Delhi." },
      { "day": "Day 3", "title": "Delhi to Agra", "desc": "Drive to Agra, visit Agra Fort and view the Taj Mahal at sunset. Overnight stay in Agra." },
      { "day": "Day 4", "title": "Taj Mahal Sunrise, Agra to Jaipur", "desc": "Sunrise visit to the Taj Mahal, then drive to Jaipur via Fatehpur Sikri. Overnight stay in Jaipur." },
      { "day": "Day 5", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort, City Palace, Jantar Mantar and Hawa Mahal. Overnight stay in Jaipur." },
      { "day": "Day 6", "title": "Jaipur to Udaipur", "desc": "Drive or fly to Udaipur. Evening boat ride on Lake Pichola. Overnight stay in Udaipur." },
      { "day": "Day 7", "title": "Udaipur to Mount Abu", "desc": "Morning visit to City Palace and Jagdish Temple in Udaipur, then drive to Mount Abu (approx. 3-4 hours). Evening walk around Nakki Lake. Overnight stay in Mount Abu." },
      { "day": "Day 8", "title": "Mount Abu Sightseeing", "desc": "Visit the intricately carved Dilwara Jain Temples, Achalgarh Fort, and enjoy sunset views from Sunset Point or Guru Shikhar, the highest peak in Rajasthan. Overnight stay in Mount Abu." },
      { "day": "Day 9", "title": "Mount Abu Departure", "desc": "Drive to Udaipur airport (approx. 3-4 hours) for onward departure, concluding the tour." }
    ],
    "inclusions": [
      "8 nights hotel accommodation on double sharing basis",
      "Daily buffet breakfast",
      "Private air-conditioned vehicle throughout",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary"
    ],
    "exclusions": [
      "Airfare (Jaipur-Udaipur flight if chosen)",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 34999,
    "original_price": 45999,
    "discount_percent": "24% OFF"
  },
  {
    "id": "complete-rajasthan-heritage-tour",
    "title": "Complete Rajasthan Heritage Tour",
    "slug": "complete-rajasthan-heritage-tour-13-days",
    "route": "Delhi - Jaipur - Bikaner - Jaisalmer - Jodhpur - Udaipur - Agra",
    "duration": { "days": 13, "nights": 12 },
    "category": "Grand Heritage Circuit",
    "badge": "Grand Tour",
    "rating": 4.97,
    "reviews_count": 94,
    "included_stay": "Royal Palaces, Havelis & Thar Desert Camp",
    "transport": "Private AC SUV/Sedan Throughout",
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
    "gallery": [
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80"
    ],
    "overview": "For travelers who want to see all of Rajasthan in one comprehensive journey, the Complete Rajasthan Heritage Tour is the most immersive and rewarding option. Spanning thirteen days, this grand circuit covers every major highlight of the state: the Pink City of Jaipur, the desert city of Bikaner, the Golden City of Jaisalmer, the Blue City of Jodhpur, the Lake City of Udaipur, and finally the timeless Taj Mahal in Agra. This tour is perfect for travel companies looking to offer a flagship, premium package that leaves no royal stone unturned.",
    "highlights": [
      "Visit all major forts: Amber, Junagarh, Jaisalmer, Mehrangarh",
      "Camel safari and desert camp in Jaisalmer",
      "Boat ride on Lake Pichola in Udaipur",
      "Sunrise visit to the Taj Mahal in Agra",
      "Authentic Rajasthani folk performances and cuisine throughout"
    ],
    "itinerary": [
      { "day": "Day 1", "title": "Arrival in Delhi", "desc": "Arrive in Delhi, transfer to hotel and rest after your journey. Overnight stay in Delhi." },
      { "day": "Day 2", "title": "Delhi to Jaipur", "desc": "Drive to Jaipur (approx. 5-6 hours). Evening free to explore local markets. Overnight stay in Jaipur." },
      { "day": "Day 3", "title": "Jaipur Sightseeing", "desc": "Visit Amber Fort, City Palace, Jantar Mantar and Hawa Mahal. Overnight stay in Jaipur." },
      { "day": "Day 4", "title": "Jaipur to Bikaner", "desc": "Drive to Bikaner (approx. 6-7 hours). Evening at leisure. Overnight stay in Bikaner." },
      { "day": "Day 5", "title": "Bikaner Sightseeing", "desc": "Visit Junagarh Fort, explore local havelis, and stop at the National Research Centre on Camel. Overnight stay in Bikaner." },
      { "day": "Day 6", "title": "Bikaner to Jaisalmer", "desc": "Drive to Jaisalmer (approx. 5-6 hours) through desert landscapes. Overnight stay in Jaisalmer." },
      { "day": "Day 7", "title": "Jaisalmer Fort & Desert Camp", "desc": "Morning visit to Jaisalmer Fort, Patwon Ki Haveli and Gadisar Lake. Afternoon camel safari and sunset at Sam Sand Dunes, followed by an overnight desert camp with folk music and dance." },
      { "day": "Day 8", "title": "Jaisalmer to Jodhpur", "desc": "Drive to Jodhpur (approx. 5-6 hours). Evening free to explore the blue-washed old city. Overnight stay in Jodhpur." },
      { "day": "Day 9", "title": "Jodhpur Sightseeing", "desc": "Visit Mehrangarh Fort and Jaswant Thada. Overnight stay in Jodhpur." },
      { "day": "Day 10", "title": "Jodhpur to Udaipur", "desc": "Drive to Udaipur (approx. 5-6 hours). Evening boat ride on Lake Pichola. Overnight stay in Udaipur." },
      { "day": "Day 11", "title": "Udaipur Sightseeing", "desc": "Visit City Palace, Jagdish Temple, Saheliyon Ki Bari, and Sajjangarh (Monsoon Palace). Evening cultural show at Bagore Ki Haveli. Overnight stay in Udaipur." },
      { "day": "Day 12", "title": "Udaipur to Agra", "desc": "Fly to Agra (recommended due to distance), or drive via Chittorgarh. Evening view of the Taj Mahal at sunset. Overnight stay in Agra." },
      { "day": "Day 13", "title": "Taj Mahal Sunrise & Departure", "desc": "Sunrise visit to the Taj Mahal and Agra Fort, then transfer to Delhi for onward departure, concluding this complete tour of Rajasthan." }
    ],
    "inclusions": [
      "12 nights hotel/camp accommodation on double sharing basis",
      "Daily breakfast",
      "Camel safari and one dinner at desert camp in Jaisalmer",
      "Private air-conditioned vehicle throughout (except Udaipur-Agra if flying)",
      "English-speaking local guides",
      "All monument entrance fees as per itinerary"
    ],
    "exclusions": [
      "Domestic flights (Udaipur-Agra, if chosen)",
      "Lunch and dinner unless specified",
      "Personal expenses and tips",
      "Camera fees at monuments",
      "Travel insurance"
    ],
    "price_starting_inr": 54999,
    "original_price": 69999,
    "discount_percent": "21% OFF"
  }
];

async function seed() {
  console.log("Seeding 10 Tour Packages into database...");

  // Ensure table exists
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tour_packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      destination VARCHAR(255) NOT NULL,
      duration VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      original_price DECIMAL(10,2) DEFAULT NULL,
      discount_percent VARCHAR(50) DEFAULT NULL,
      rating DECIMAL(3,1) DEFAULT 4.8,
      reviews_count INT DEFAULT 45,
      badge VARCHAR(50) DEFAULT 'Bestseller',
      included_stay VARCHAR(255) DEFAULT NULL,
      transport VARCHAR(255) DEFAULT NULL,
      image TEXT DEFAULT NULL,
      gallery LONGTEXT DEFAULT NULL,
      overview LONGTEXT DEFAULT NULL,
      inclusions LONGTEXT DEFAULT NULL,
      exclusions LONGTEXT DEFAULT NULL,
      itinerary LONGTEXT DEFAULT NULL,
      is_active TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  for (const t of RAW_TOURS) {
    const destination = t.route.split(" - ").join(" • ");
    const durationStr = `${t.duration.days} Days / ${t.duration.nights} Nights`;
    const galleryJson = JSON.stringify(t.gallery || [t.image]);
    const inclusionsJson = JSON.stringify(t.inclusions || []);
    const exclusionsJson = JSON.stringify(t.exclusions || []);
    const itineraryJson = JSON.stringify(t.itinerary || []);

    const existing = await prisma.$queryRawUnsafe(`SELECT id FROM tour_packages WHERE slug = ? LIMIT 1`, t.slug);

    if (existing && existing.length > 0) {
      await prisma.$executeRawUnsafe(`
        UPDATE tour_packages SET
          title = ?,
          destination = ?,
          duration = ?,
          price = ?,
          original_price = ?,
          discount_percent = ?,
          rating = ?,
          reviews_count = ?,
          badge = ?,
          included_stay = ?,
          transport = ?,
          image = ?,
          gallery = ?,
          overview = ?,
          inclusions = ?,
          exclusions = ?,
          itinerary = ?,
          is_active = 1
        WHERE slug = ?
      `,
        t.title,
        destination,
        durationStr,
        t.price_starting_inr,
        t.original_price,
        t.discount_percent,
        t.rating,
        t.reviews_count,
        t.badge,
        t.included_stay,
        t.transport,
        t.image,
        galleryJson,
        t.overview,
        inclusionsJson,
        exclusionsJson,
        itineraryJson,
        t.slug
      );
      console.log(`Updated: ${t.title}`);
    } else {
      await prisma.$executeRawUnsafe(`
        INSERT INTO tour_packages
        (title, slug, destination, duration, price, original_price, discount_percent, rating, reviews_count, badge, included_stay, transport, image, gallery, overview, inclusions, exclusions, itinerary, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
        t.title,
        t.slug,
        destination,
        durationStr,
        t.price_starting_inr,
        t.original_price,
        t.discount_percent,
        t.rating,
        t.reviews_count,
        t.badge,
        t.included_stay,
        t.transport,
        t.image,
        galleryJson,
        t.overview,
        inclusionsJson,
        exclusionsJson,
        itineraryJson
      );
      console.log(`Inserted: ${t.title}`);
    }
  }

  console.log("All 10 packages seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
