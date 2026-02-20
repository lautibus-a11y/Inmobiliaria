import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, MessageSquare, LayoutDashboard } from "lucide-react";

export function Navigation() {
    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] px-8 py-3 flex justify-between items-center z-50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <NavLink
                to="/"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <Home className="size-5 md:size-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Explorar</span>
            </NavLink>
            <NavLink
                to="/favoritos"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <Heart className="size-5 md:size-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Favoritos</span>
            </NavLink>
            <NavLink
                to="/mensajes"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <MessageSquare className="size-5 md:size-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Mensajes</span>
            </NavLink>
            <NavLink
                to="/admin"
                className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
                <LayoutDashboard className="size-5 md:size-6" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Panel</span>
            </NavLink>
        </nav>
    );
}
