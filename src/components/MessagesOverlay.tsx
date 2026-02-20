import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";

export function MessagesOverlay({ onClose }: { onClose: () => void }) {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/inquiries')
            .then(res => res.json())
            .then(data => {
                setInquiries(data);
                setLoading(false);
            });
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[60] bg-slate-50 dark:bg-slate-950 overflow-y-auto pb-32"
        >
            <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">Mensajes</h1>
                    <button onClick={onClose} className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <X className="size-5 md:size-6" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {inquiries.map((inquiry) => (
                            <div key={inquiry.id} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg">{inquiry.client_name}</h3>
                                        <p className="text-xs md:text-sm text-slate-500">{inquiry.client_phone}</p>
                                    </div>
                                    <span className="text-[8px] md:text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-full uppercase tracking-widest">
                                        {new Date(inquiry.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 italic">"{inquiry.message}"</p>
                                </div>

                                {inquiry.property_title && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <img src={inquiry.property_image} className="size-10 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-bold uppercase text-slate-400">Consulta sobre:</p>
                                            <p className="text-xs md:text-sm font-bold truncate">{inquiry.property_title}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {inquiries.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-slate-500 text-lg">No hay consultas recibidas aun.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
