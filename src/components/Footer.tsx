import { Pill, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Pill className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">DosisAlert MVP</p>
              <p className="text-xs text-slate-400">Farmacia Personal Digital y Control de Adherencia</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-4 py-2 rounded-lg border border-slate-700/60 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Proyecto de Ingeniería de Software (2do Año) • PostgreSQL Localhost</span>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <p>© {new Date().getFullYear()} DosisAlert. Todos los derechos reservados.</p>
            <p>Diseño centrado en la accesibilidad y seguridad del paciente.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
