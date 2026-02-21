import React, { useState, useEffect } from "react";
import { Property } from "../types";
import { X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Bed, Bath, Square, MapPin } from "./Icons";

export function PropertyDetailOverlay({ id, onClose }: { id: number; onClose: () => void }) {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>('');

    useEffect(() => {
        fetch(`/api/properties/${id}`)
            .then(res => res.json())
            .then(data => {
                setProperty(data);
                setActiveImage(data.main_image);
                setLoading(false);
            });
    }, [id]);

    if (loading || !property) return null;

    const whatsappMessage = `¡Hola! 👋 Me interesa esta propiedad:

*${property.title.toUpperCase()}*
📍 Ubicación: ${property.location}
💰 Precio: $${property.price.toLocaleString()}
🏠 Tipo: ${property.type.toUpperCase()}
🆔 Ref: #${property.id}

¿Me podrían brindar más información?`;

    const whatsappUrl = `https://wa.me/5491172023171?text=${encodeURIComponent(whatsappMessage)}`;

    const handleInquiry = () => {
        // Enviar consulta al panel de control de forma asíncrona (sin bloquear)
        fetch('/api/inquiries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                property_id: property.id,
                client_name: 'Interesado Web',
                client_phone: 'Consultado vía WhatsApp',
                message: `Interés en: ${property.title}`
            })
        }).catch(() => { });
    };

    const allImages = [property.main_image, ...(property.images?.map(img => img.url) || [])];

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 overflow-y-auto pb-32"
        >
            {/* Header Image Gallery */}
            <div className="relative h-[45vh] md:h-[60vh] w-full bg-slate-100 dark:bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={activeImage}
                        className="w-full h-full object-cover"
                        alt={property.title}
                        referrerPolicy="no-referrer"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Thumbnails on top of image */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/20 backdrop-blur-md rounded-2xl overflow-x-auto max-w-[90%] no-scrollbar">
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`size-12 md:size-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === img ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                            </button>
                        ))}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 md:top-6 md:left-6 size-10 md:size-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 hover:bg-black/40 transition-all"
                >
                    <X className="size-5 md:size-6" />
                </button>
            </div>

            <div className="max-w-3xl mx-auto px-4 md:px-6 pt-6 md:pt-8 space-y-6 md:space-y-8">
                {/* Title & Price Section */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight">{property.title}</h1>
                            <p className="text-slate-500 flex items-center gap-2 text-sm md:text-base">
                                <MapPin className="size-4 md:size-5" />
                                {property.location}
                            </p>
                        </div>
                        <div className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-0">
                            <p className="text-2xl md:text-3xl font-bold text-blue-600">${property.price.toLocaleString()}</p>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">{property.operation}</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col items-center gap-1">
                            <Bed className="size-5 md:size-6 text-blue-600" />
                            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Dormitorios</span>
                            <span className="text-sm md:text-base font-bold">{property.bedrooms}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Bath className="size-5 md:size-6 text-blue-600" />
                            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Baños</span>
                            <span className="text-sm md:text-base font-bold">{property.bathrooms}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Square className="size-5 md:size-6 text-blue-600" />
                            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Superficie</span>
                            <span className="text-sm md:text-base font-bold">{property.area} m²</span>
                        </div>
                    </div>
                </div>

                {/* Description Section */}
                <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-bold">Descripción</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                        {property.description}
                    </p>
                </div>

                {/* Location Section */}
                <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-bold">Ubicación</h3>
                    <div className="h-48 md:h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            className="grayscale contrast-125 opacity-80 dark:invert dark:hue-rotate-180"
                        />
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 z-[70]">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Precio Total</p>
                        <p className="text-xl md:text-2xl font-bold">${property.price.toLocaleString()}</p>
                    </div>
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleInquiry}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20 text-sm md:text-base"
                    >
                        <MessageSquare className="size-5" />
                        Consultar por WhatsApp
                    </a>
                </div>
            </div>
        </motion.div>
    );
}
