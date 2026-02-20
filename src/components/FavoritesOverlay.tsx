import React, { useState, useEffect } from "react";
import { Property } from "../types";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { PropertyCard } from "./PropertyCard";

export function FavoritesOverlay({ favorites, onToggleFavorite, onClose, onSelectProperty }: {
    favorites: number[];
    onToggleFavorite: (id: number) => void;
    onClose: () => void;
    onSelectProperty: (id: number) => void;
}) {
    const [favProperties, setFavProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/favorites')
            .then(res => res.json())
            .then(data => {
                setFavProperties(data);
                setLoading(false);
            });
    }, [favorites]);

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 overflow-y-auto pb-32"
        >
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">Mis Favoritos</h1>
                    <button onClick={onClose} className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <X className="size-5 md:size-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {favProperties.map((prop) => (
                            <PropertyCard
                                key={prop.id}
                                property={prop}
                                isFavorite={true}
                                onToggleFavorite={onToggleFavorite}
                                onClick={onSelectProperty}
                            />
                        ))}
                        {favProperties.length === 0 && (
                            <div className="col-span-full text-center py-20">
                                <p className="text-slate-500 text-lg">Aun no tienes propiedades favoritas.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
