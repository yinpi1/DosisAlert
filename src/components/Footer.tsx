import { Pill, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Pill className="w-6 h-6 -rotate-45" />
            </div>
            <div>
              <p className="text-white font-bold text-base">DosisAlert</p>
              <p className="text-xs text-slate-400">Tu tranquilidad y tus horarios de salud en un solo lugar.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            <span>Pensado para que tomes tus medicamentos a tiempo y sin complicaciones.</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
