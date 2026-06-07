import { Link } from "react-router-dom";
import { ArrowUpRight, Crown, Wallet, Heart, Users } from "lucide-react";
import Image from "@/components/common/Image";

// Keep static COLLECTIONS for icons, fallback, colors, etc.
const ICONS: Record<string, any> = {
    "Luxury Stays": Crown,
    "Budget Friendly": Wallet,
    "Couple Retreats": Heart,
    "Family Friendly": Users
};

const COLORS = [
    "from-amber-500/20 to-amber-600/20",
    "from-emerald-500/20 to-emerald-600/20",
    "from-rose-500/20 to-rose-600/20",
    "from-blue-500/20 to-blue-600/20"
];

const DEFAULT_COLLECTIONS = [
    {
        title: "Luxury Stays",
        subtitle: "The ultimate premium experience",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
        label: "Premium",
    },
    {
        title: "Budget Friendly",
        subtitle: "Best value without compromise",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        label: "Affordable",
    },
    {
        title: "Couple Retreats",
        subtitle: "Romantic getaways for two",
        image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=800&auto=format&fit=crop",
        label: "Romantic",
    },
    {
        title: "Family Friendly",
        subtitle: "Memorable stays for all ages",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800&auto=format&fit=crop",
        label: "Spacious",
    }
];

export default function FeaturedCollections({ collections }: { collections?: any[] }) {
    const displayCollections = collections && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;

    return (
        <section className="pt-0 pb-0 bg-transparent">
            <div className="w-full max-w-none mx-auto px-3 md:px-8">
                <div className="mb-4">
                    <h2
                        className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight"
                    >
                        Featured <span className="text-brand-600">Collections</span>
                    </h2>
                </div>

                <div className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-3 md:-mx-8 px-3 md:px-8 lg:-mx-0">
                    <div className="w-2 shrink-0 snap-start md:hidden" />
                    {displayCollections.map((item, i) => {
                        const IconComponent = ICONS[item.title] || Crown;
                        const colorClass = COLORS[i % COLORS.length];

                        // If it's a dynamic collection, link to collection_index, else use the old query format
                        const linkTo = collections && collections.length > 0
                            ? `/hotels?collection_index=${i}`
                            : `/hotels?collection=${item.title.toLowerCase().split(' ')[0]}`;

                        return (
                            <div key={item.title} className="min-w-[210px] md:min-w-[320px] snap-start flex">
                                <div
                                    className="flex flex-col flex-1 h-full bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-white/40 group cursor-pointer"
                                >
                                    <Link to={linkTo} className="block h-full w-full flex flex-col">
                                        {/* Image Section */}
                                        <div className="relative aspect-[4/5] md:aspect-[4/3] w-full overflow-hidden bg-slate-100">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                className="transition-transform duration-700 group-hover:scale-110"
                                            />

                                            {/* Dynamic Label Tag */}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white px-3 py-1 rounded-full text-[9px] font-bold text-slate-900 uppercase tracking-widest shadow-lg">
                                                    {item.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Section below image */}
                                        <div className="p-5 flex flex-col flex-1 gap-2">
                                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight tracking-tight">{item.title}</h3>
                                            <p className="text-slate-500 text-xs font-semibold">{item.subtitle}</p>
                                            <div className="mt-auto pt-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-widest">
                                                    View All
                                                    <ArrowUpRight className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:-rotate-12" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
