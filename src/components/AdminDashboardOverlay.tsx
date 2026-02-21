import React, { useState, useEffect } from "react";
import { Property, DashboardStats } from "../types";
import { X, SlidersHorizontal, Search, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function AdminDashboardOverlay({ onClose }: { onClose: () => void }) {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Partial<Property> | null>(null);

    const refreshData = () => {
        fetch('/api/stats').then(res => res.json()).then(setStats);
        fetch('/api/properties').then(res => res.json()).then(setProperties);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;
        try {
            const response = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Error al eliminar');
            refreshData();
        } catch (error) {
            console.error("Error deleting property:", error);
            alert("No se pudo eliminar la propiedad. Asegurate de que no tenga dependencias activas.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingProperty?.id ? 'PUT' : 'POST';
        const url = editingProperty?.id ? `/api/properties/${editingProperty.id}` : '/api/properties';

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingProperty)
        });

        setIsFormOpen(false);
        setEditingProperty(null);
        refreshData();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 overflow-y-auto"
        >
            <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">Panel de Control</h1>
                    <button onClick={onClose} className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
                        <X className="size-5 md:size-6" />
                    </button>
                </div>

                {stats && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1">{stats.total}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activas</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1 text-blue-600">{stats.active}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendidas</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1 text-emerald-600">{stats.sold}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leads</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1 text-orange-600">{stats.inquiries}</p>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg md:text-xl font-bold">Propiedades</h3>
                        <button
                            onClick={() => {
                                setEditingProperty({
                                    title: '',
                                    description: '',
                                    price: 0,
                                    location: '',
                                    type: 'casa',
                                    operation: 'venta',
                                    bedrooms: 0,
                                    bathrooms: 0,
                                    area: 0,
                                    status: 'disponible',
                                    main_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
                                });
                                setIsFormOpen(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                        >
                            Añadir Nueva
                        </button>
                    </div>

                    {/* Mobile List View */}
                    <div className="block md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                        {properties.map(p => (
                            <div key={p.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={p.main_image} className="size-12 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{p.title}</p>
                                        <p className="text-xs text-slate-400">${p.price.toLocaleString()}</p>
                                        <span className={`inline-block mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest ${p.status === 'disponible' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingProperty(p);
                                            setIsFormOpen(true);
                                        }}
                                        className="p-2 text-slate-400 hover:text-blue-600"
                                    >
                                        <SlidersHorizontal className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        className="p-2 text-slate-400 hover:text-red-600"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                    <th className="px-6 py-4">Propiedad</th>
                                    <th className="px-6 py-4">Precio</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {properties.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={p.main_image} className="size-10 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                                                <div>
                                                    <p className="font-bold text-sm">{p.title}</p>
                                                    <p className="text-xs text-slate-400">{p.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm">${p.price.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${p.status === 'disponible' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingProperty(p);
                                                        setIsFormOpen(true);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-blue-600"
                                                >
                                                    <SlidersHorizontal className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Property Form Modal */}
            <AnimatePresence>
                {isFormOpen && editingProperty && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
                                <h3 className="text-xl font-bold">{editingProperty.id ? 'Editar Propiedad' : 'Nueva Propiedad'}</h3>
                                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                                    <X className="size-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Título</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingProperty.title || ''}
                                            onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Precio</label>
                                        <input
                                            required
                                            type="number"
                                            value={editingProperty.price || 0}
                                            onChange={e => setEditingProperty({ ...editingProperty, price: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Ubicación (Dirección para el Mapa)</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingProperty.location || ''}
                                        onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Tipo</label>
                                        <select
                                            value={editingProperty.type || 'casa'}
                                            onChange={e => setEditingProperty({ ...editingProperty, type: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        >
                                            <option value="casa">Casa</option>
                                            <option value="apartamento">Apartamento</option>
                                            <option value="terreno">Terreno</option>
                                            <option value="comercial">Comercial</option>
                                            <option value="villa">Villa</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Operación</label>
                                        <select
                                            value={editingProperty.operation || 'venta'}
                                            onChange={e => setEditingProperty({ ...editingProperty, operation: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        >
                                            <option value="venta">Venta</option>
                                            <option value="alquiler">Alquiler</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Estado</label>
                                        <select
                                            value={editingProperty.status || 'disponible'}
                                            onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value as any })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        >
                                            <option value="disponible">Disponible</option>
                                            <option value="reservada">Reservada</option>
                                            <option value="vendida">Vendida</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Dormitorios</label>
                                        <input
                                            type="number"
                                            value={editingProperty.bedrooms || 0}
                                            onChange={e => setEditingProperty({ ...editingProperty, bedrooms: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Baños</label>
                                        <input
                                            type="number"
                                            value={editingProperty.bathrooms || 0}
                                            onChange={e => setEditingProperty({ ...editingProperty, bathrooms: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Área (m²)</label>
                                        <input
                                            type="number"
                                            value={editingProperty.area || 0}
                                            onChange={e => setEditingProperty({ ...editingProperty, area: Number(e.target.value) })}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Galería de Imágenes</label>
                                    <div className="space-y-4">
                                        {/* Main Image */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Imagen Principal (Portada)</p>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        placeholder="URL de la imagen principal..."
                                                        value={editingProperty.main_image || ''}
                                                        onChange={e => setEditingProperty({ ...editingProperty, main_image: e.target.value })}
                                                        className="w-full bg-white dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 shadow-sm"
                                                    />
                                                    <div className="relative">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            id="main-file-upload"
                                                            className="hidden"
                                                            onChange={e => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    const reader = new FileReader();
                                                                    reader.onloadend = () => {
                                                                        setEditingProperty({ ...editingProperty, main_image: reader.result as string });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor="main-file-upload"
                                                            className="flex items-center justify-center gap-2 w-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl cursor-pointer transition-all border-2 border-dashed border-slate-200 dark:border-slate-600"
                                                        >
                                                            <Search className="size-4" />
                                                            Subir Portada
                                                        </label>
                                                    </div>
                                                </div>
                                                {editingProperty.main_image && (
                                                    <div className="size-24 md:size-28 rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shrink-0 shadow-md">
                                                        <img src={editingProperty.main_image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Images */}
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Imágenes Adicionales</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                                                {editingProperty.images?.map((img, idx) => (
                                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-white dark:border-slate-700 shadow-sm">
                                                        <img src={img.url} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = [...(editingProperty.images || [])];
                                                                newImages.splice(idx, 1);
                                                                setEditingProperty({ ...editingProperty, images: newImages });
                                                            }}
                                                            className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X className="size-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="relative aspect-square">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        id="gallery-upload"
                                                        className="hidden"
                                                        onChange={e => {
                                                            const files = Array.from(e.target.files || []);
                                                            files.forEach((file: File) => {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    setEditingProperty(prev => {
                                                                        if (!prev) return null;
                                                                        const currentImages = prev.images || [];
                                                                        return {
                                                                            ...prev,
                                                                            images: [...currentImages, { url: reader.result as string } as any]
                                                                        };
                                                                    });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            });
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor="gallery-upload"
                                                        className="flex flex-col items-center justify-center gap-1 w-full h-full bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 rounded-xl cursor-pointer transition-all border-2 border-dashed border-slate-200 dark:border-slate-600"
                                                    >
                                                        <UserPlus className="size-6" />
                                                        <span className="text-[8px] font-bold uppercase">Añadir</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Descripción</label>
                                    <textarea
                                        rows={4}
                                        value={editingProperty.description || ''}
                                        onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={!!editingProperty.featured}
                                        onChange={e => setEditingProperty({ ...editingProperty, featured: e.target.checked as any })}
                                        className="size-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                    />
                                    <label htmlFor="featured" className="text-sm font-bold text-slate-600 dark:text-slate-400">Propiedad Destacada</label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-2xl active:scale-95 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all"
                                    >
                                        Guardar Propiedad
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
