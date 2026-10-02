'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Pill, 
  LayoutDashboard, 
  ClipboardList, 
  Search, 
  FileBarChart, 
  BellRing, 
  User, 
  HeartPulse 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Inicio', icon: LayoutDashboard },
    { href: '/medicamentos', label: 'Mis Medicamentos', icon: ClipboardList },
    { href: '/buscar', label: 'Buscar', icon: Search },
    { href: '/reportes', label: 'Reportes', icon: FileBarChart },
    { href: '/alarmas', label: 'Tomas y Alarmas', icon: BellRing },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner Informativo / Salud */}
      <div className="bg-emerald-700 text-white px-4 py-1.5 text-xs sm:text-sm font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>DosisAlert - Farmacia Personal Digital • Control de Stock y Recordatorios</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-emerald-100 text-xs">
            <span>Servidor: <strong className="text-white">PostgreSQL (localhost:5432)</strong></span>
            <span>•</span>
            <span>Usuario: <strong className="text-white">Juan Pérez (12.345.678-9)</strong></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo y Marca */}
          <Link 
            href="/" 
            className="flex items-center gap-3.5 group focus:outline-hidden focus:ring-2 focus:ring-emerald-500 rounded-xl p-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:bg-emerald-700 transition-colors">
              <Pill className="w-7 h-7 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Dosis<span className="text-emerald-600">Alert</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Farmacia Personal y Recordatorios</p>
            </div>
          </Link>

          {/* Menú de Navegación Principal con Botones Grandes */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Perfil del Usuario / Botón Salir */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-left"
              title="Ver Perfil o Iniciar Sesión"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">Juan Pérez</p>
                <p className="text-[11px] text-slate-500 font-mono">12.345.678-9</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
