import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';

export function CinematicLoader() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{
                opacity: 0,
                transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 overflow-hidden"
        >
            {/* Background Bloom Effect */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: [0, 0.2, 0.1],
                    scale: [0.8, 1.2, 1.1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"
            />

            <div className="relative flex flex-col items-center">
                {/* Logo Icon with Scale & Glow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 1.5,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative mb-6"
                >
                    <div className="size-20 md:size-24 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-2xl rotate-12 shadow-[0_0_40px_rgba(37,99,235,0.4)] flex items-center justify-center overflow-hidden">
                        <motion.div
                            animate={{ rotate: -12 }}
                            className="text-white"
                        >
                            <Home className="size-10 md:size-12" strokeWidth={2.5} />
                        </motion.div>
                        {/* Subtle shine effect */}
                        <motion.div
                            animate={{ x: [-100, 200] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                        />
                    </div>
                </motion.div>

                {/* Text Reveal */}
                <div className="overflow-hidden">
                    <motion.h2
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="text-white text-3xl md:text-5xl font-bold tracking-[0.2em] uppercase"
                    >
                        Inmo<span className="text-blue-500">Telares</span>
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-4 text-white/60 text-xs font-bold uppercase tracking-[0.5em] ml-2"
                >
                    Inmobiliaria Telares
                </motion.div>

                {/* Progress Bar Bloom */}
                <div className="mt-12 w-48 h-[1px] bg-white/10 relative overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    />
                </div>
            </div>
        </motion.div>
    );
}
