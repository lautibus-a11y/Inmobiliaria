import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Property } from "../types";
import { PropertyCard } from "../components/PropertyCard";
import { Search, SlidersHorizontal, Home as HomeIcon, Building2, LandPlot, Store, Palmtree, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Home() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<string>('todos');
    const [operation, setOperation] = useState<'venta' | 'alquiler'>('venta');
    const [favorites, setFavorites] = useState<number[]>([]);
    const catalogRef = useRef<HTMLDivElement>(null);

    const scrollToCatalog = () => {
        catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchProperties();
        fetchFavorites();
    }, [activeType, operation]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const typeParam = activeType !== 'todos' ? `&type=${activeType}` : '';
            const response = await fetch(`/api/properties?operation=${operation}${typeParam}`);
            if (!response.ok) {
                console.error("API error:", response.status, response.statusText);
                setProperties([]);
                return;
            }
            const data = await response.json();
            setProperties(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching properties:", error);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const response = await fetch('/api/favorites');
            const data = await response.json();
            setFavorites(data.map((p: Property) => p.id));
        } catch (error) {
            console.error("Error fetching favorites:", error);
        }
    };

    const toggleFavorite = async (id: number) => {
        const isFav = favorites.includes(id);
        const method = isFav ? 'DELETE' : 'POST';
        try {
            await fetch(`/api/favorites/${id}`, { method });
            if (isFav) {
                setFavorites(favorites.filter(favId => favId !== id));
            } else {
                setFavorites([...favorites, id]);
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const categories = [
        { id: 'todos', label: 'Todos', icon: HomeIcon },
        { id: 'casa', label: 'Casas', icon: HomeIcon },
        { id: 'apartamento', label: 'Apartamentos', icon: Building2 },
        { id: 'terreno', label: 'Terrenos', icon: LandPlot },
        { id: 'comercial', label: 'Locales', icon: Store },
        { id: 'villa', label: 'Villas', icon: Palmtree },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
                <motion.div
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, ease: "easeOut" }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
                        className="w-full h-full object-cover opacity-80"
                        alt="Luxury Modern House"
                        referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-slate-50 dark:to-slate-950" />
                </motion.div>

                <div className="relative z-10 text-center px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter drop-shadow-2xl"
                    >
                        Inmobiliaria <span className="text-blue-500">Telares</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 1.2 }}
                        className="text-white/80 mt-4 text-lg md:text-xl font-medium tracking-wide max-w-2xl mx-auto"
                    >
                        Encuentre el hogar de sus sueños en las ubicaciones más exclusivas del mundo.
                    </motion.p>
                </div>

                <motion.button
                    onClick={scrollToCatalog}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        opacity: { duration: 0.5, delay: 2 },
                        y: { duration: 0.5, delay: 2 },
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 1.5
                    }}
                    className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 group"
                >
                    <span className="text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">Ver Propiedades</span>
                    <div className="size-10 md:size-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all shadow-xl">
                        <ChevronDown className="size-4 md:size-6" />
                    </div>
                </motion.button>
            </section>

            {/* Header / Catalog Start */}
            <header ref={catalogRef} className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 pt-4 pb-2">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 shadow-inner">
                            <Search className="size-5 text-slate-400 mr-2" />
                            <input
                                type="text"
                                className="bg-transparent border-none p-0 focus:ring-0 text-sm w-full placeholder:text-slate-400"
                                placeholder="Busca tu proximo hogar..."
                            />
                        </div>
                        <button className="flex items-center justify-center size-11 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors">
                            <SlidersHorizontal className="size-5" />
                        </button>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 w-full max-w-xs mx-auto">
                        <button
                            onClick={() => setOperation('venta')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${operation === 'venta' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'
                                }`}
                        >
                            Comprar
                        </button>
                        <button
                            onClick={() => setOperation('alquiler')}
                            className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${operation === 'alquiler' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'
                                }`}
                        >
                            Alquilar
                        </button>
                    </div>

                    <div className="flex overflow-x-auto no-scrollbar gap-8 pb-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveType(cat.id)}
                                className={`flex flex-col items-center gap-2 shrink-0 border-b-2 pb-2 transition-all ${activeType === cat.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 dark:text-slate-400'
                                    }`}
                            >
                                <cat.icon className="size-5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8 min-h-[600px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-slate-500 font-medium">Cargando propiedades...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                        >
                            {properties.map((prop) => (
                                <PropertyCard
                                    key={prop.id}
                                    property={prop}
                                    isFavorite={favorites.includes(prop.id)}
                                    onToggleFavorite={toggleFavorite}
                                    onClick={(id) => navigate(`/propiedad/${id}`)}
                                />
                            ))}
                            {properties.length === 0 && (
                                <div className="col-span-full text-center py-20">
                                    <p className="text-slate-500 text-lg">No se encontraron propiedades con estos filtros.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
