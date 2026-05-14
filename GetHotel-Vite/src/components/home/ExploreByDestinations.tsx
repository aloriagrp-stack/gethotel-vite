

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Map } from "lucide-react";

const DESTINATIONS = [
    {
        name: "Goa",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop",
        properties: "1,240+ Hotels",
    },
    {
        name: "Kerala",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
        properties: "850+ Hotels",
    },
    {
        name: "Shimla",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop",
        properties: "420+ Hotels",
    },
    {
        name: "Udaipur",
        image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?q=80&w=800&auto=format&fit=crop",
        properties: "310+ Hotels",
    },
    {
        name: "Jaipur",
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop",
        properties: "540+ Hotels",
    }
];

export default function ExploreByDestinations() {
    return (
        <section className="pt-0 pb-6 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-950 tracking-tight">
                            Explore <span className="text-brand-600">Destinations</span>
                        </h2>
                    </div>
                </div>

                <div className="flex gap-6 pb-12 overflow-x-auto snap-x snap-mandatory no-scrollbar">
                    {DESTINATIONS.map((dest, i) => (
                        <div key={dest.name} className="w-[240px] md:w-[300px] aspect-[4/5] shrink-0 snap-start">
                            <Link to={`/hotels?city=${dest.name}`} className="group block relative w-full h-full rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <h3 className="text-2xl font-black italic">{dest.name}</h3>
                                    <p className="text-xs font-bold opacity-70 mt-1">{dest.properties}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}



