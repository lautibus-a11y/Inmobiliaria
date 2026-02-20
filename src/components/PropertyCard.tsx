import React from "react";
import { Property } from "../types";
import { Bed, Square, Bath, MapPin, Heart } from "lucide-react";
import { motion } from "motion/react";

interface PropertyCardProps {
  property: Property;
  onClick: (id: number) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, isFavorite, onToggleFavorite }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer transition-all"
      onClick={() => onClick(property.id)}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={property.main_image}
          alt={property.title}
          referrerPolicy="no-referrer"
        />
        <button
          className={`absolute top-4 right-4 size-10 flex items-center justify-center rounded-full backdrop-blur-md transition-colors ${isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 dark:bg-black/40 text-slate-400 hover:text-red-500'
            }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(property.id);
          }}
        >
          <Heart className={`size-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        {property.featured && (
          <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-blue-600 shadow-sm uppercase tracking-wider">
            Destacado
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              ${property.price.toLocaleString()}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 mt-1">
              <MapPin className="size-4" />
              {property.location}
            </p>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-widest">
            {property.type}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 py-3 border-y border-slate-50 dark:border-slate-800 mt-1">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Bed className="size-4" />
              <span className="text-xs font-medium">{property.bedrooms} Hab.</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Bath className="size-4" />
              <span className="text-xs font-medium">{property.bathrooms} Baños</span>
            </div>
          )}
          {property.area > 0 && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Square className="size-4" />
              <span className="text-xs font-medium">{property.area} m²</span>
            </div>
          )}
        </div>

        <button className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98]">
          Ver Detalles
        </button>
      </div>
    </motion.div>
  );
};
