'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Pill, 
  Home, 
  ClipboardList, 
  Search, 
  ShoppingCart, 
  BellRing, 
  User, 
  LogOut 
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/medicamentos', label: 'Mis Medicamentos', icon: ClipboardList },
    { href: '/buscar', label: 'Buscar', icon: Search },
    { href: '/reportes', label: '¿Qué comprar?', icon: ShoppingCart },
    { href: '/alarmas', label: 'Mi Alarma', icon: BellRing },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo y Nombre Amigable */}
          <Link 
            href="/" 
            className="flex items-center gap-3.5 group rounded-2xl p-1 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <div className="w-13 h-13 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:bg-emerald-700 transition-colors">
              <Pill className="w-7 h-7 -rotate-45" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Dosis<span className="text-emerald-600">Alert</span>
              </span>
              <p className="text-xs text-slate-500 font-semibold">Tu botiquín y pastillero en casa</p>
            </div>
          </Link>

          {/* Menú de Navegación con Letras Claras y Botones Grandes */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-base transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                      : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Perfil del Usuario / Botón Salir */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              title="Cambiar de usuario o iniciar sesión"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold text-slate-900 leading-tight">Juan Pérez</p>
                <p className="text-xs text-slate-500">Mi Cuenta</p>
              </div>
              <LogOut className="w-4 h-4 text-slate-400 ml-1 hidden sm:block" />
            </Link>
          </div>
        </div>

        {/* Barra de Navegación Móvil */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-100 overflow-x-auto gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
