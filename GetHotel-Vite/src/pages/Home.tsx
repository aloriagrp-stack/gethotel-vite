

import { useState, useEffect } from "react";
import Hero from "@/components/home/Hero";
import TrendingHotels from "@/components/home/TrendingHotels";
import WhyGetHotel from "@/components/home/WhyGetHotel";
import ExploreByDestinations from "@/components/home/ExploreByDestinations";
import FeaturedCollections from "@/components/home/FeaturedCollections";
import { hotelApi } from "@/lib/api";

export default function HomePage() {
  const [trendingHotels, setTrendingHotels] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await hotelApi.getHotels();
        if (res.data && res.data.length > 0) {
            setTrendingHotels(res.data.slice(0, 12));
        } else {
            setTrendingHotels([]);
        }
      } catch (err) {
        console.error("Failed to fetch trending hotels:", err);
        setTrendingHotels([]);
      }
    };
    fetchTrending();
  }, []);

  return (
    <main className="flex flex-col">
      <Hero />
      <TrendingHotels hotels={trendingHotels} />
      <ExploreByDestinations />
      <FeaturedCollections />
      <WhyGetHotel />
    </main>
  );
}



