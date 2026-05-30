import React from 'react';
import { MapPin, Clock, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { RecommendedSpot } from '../types';

interface SpotGuideProps {
  spots: RecommendedSpot[];
}

export default function SpotGuide({ spots }: SpotGuideProps) {
  if (!spots || spots.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Top Recommended Spot Guides
          </h3>
          <p className="text-xs text-slate-500">Curated landmark selections for peak experiences</p>
        </div>
        <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {spots.map((spot, idx) => (
          <div 
            key={`${spot.name}_${idx}`}
            className="group relative border border-slate-100 rounded-2xl bg-white p-5 shadow-xs hover:shadow-md transition-all duration-350 hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden"
          >
            {/* Subtle background circle accent */}
            <div className="absolute right-0 top-0 -mt-6 -mr-6 w-20 h-20 bg-sky-50 rounded-full group-hover:scale-110 group-hover:bg-sky-100/60 transition-transform duration-300" />

            <div>
              {/* Header spot pin */}
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 dark:bg-slate-800 text-sky-600 font-bold text-xs ring-1 ring-sky-100">
                    {idx + 1}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    Spot Sight
                  </div>
                </div>
                
                {/* Time frame badge */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                  <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                  {spot.best_time_to_visit || "Morning"}
                </div>
              </div>

              {/* Spot Name */}
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-2 leading-tight">
                {spot.name}
              </h4>

              {/* Spot Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {spot.description}
              </p>
            </div>

            {/* Smart AI Explorer Tip block */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex gap-2 items-start mt-auto">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Explorer Tip</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Arrive at least 25 minutes prior to secure nice photographic viewpoints and beat crowds. Carry loose cash for small vendors !
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
