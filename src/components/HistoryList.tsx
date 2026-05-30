import React from 'react';
import { TripPlan } from '../types';
import { 
  History, 
  MapPin, 
  Users, 
  Calendar, 
  Trash2, 
  ArrowUpRight, 
  DollarSign,
  Layers
} from 'lucide-react';

interface HistoryListProps {
  history: TripPlan[];
  onSelect: (trip: TripPlan) => void;
  onDelete: (id: string) => void;
  activeId?: string;
}

export default function HistoryList({ history, onSelect, onDelete, activeId }: HistoryListProps) {
  if (!history || history.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
        <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
          <History className="w-5 h-5" />
        </div>
        <h5 className="text-xs font-bold text-slate-850">No planned voyages yet</h5>
        <p className="text-[11px] text-slate-600 mt-1 max-w-[240px] mx-auto leading-normal">
          Provide configurations above and click Generate to see your interactive itineraries here.
        </p>
      </div>
    );
  }

  const getStyleBadgeColor = (style: string) => {
    switch (style) {
      case 'Budget': return 'bg-teal-50 text-teal-700 border-teal-100';
      case 'Mid-Range': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Luxury': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const timeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return "Just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" />
          Saved Itineraries ({history.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
        {history.map((trip) => {
          const isActive = activeId === trip.id;
          
          return (
            <div
              key={trip.id}
              className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                isActive 
                  ? 'border-sky-500 bg-sky-50/40 shadow-xs' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              {/* Trip summary metadata */}
              <button
                onClick={() => onSelect(trip)}
                type="button"
                className="flex-1 text-left cursor-pointer pr-3"
              >
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getStyleBadgeColor(trip.budgetCategory)}`}>
                    {trip.budgetCategory}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {timeAgo(trip.createdAt)}
                  </span>
                </div>

                <h5 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors flex items-center gap-1 leading-tight">
                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  {trip.destination}
                </h5>

                {/* Tags specs */}
                <div className="flex items-center gap-3 text-[10px] text-slate-600 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {trip.totalDays} Days
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    {trip.numberOfPeople} Pax
                  </span>
                  <span className="font-bold text-slate-800">
                    ₹{trip.budgetBreakdown.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelect(trip)}
                  title="View planned trips"
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-sky-100 text-slate-500 hover:text-sky-700 transition-colors shrink-0"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(trip.id);
                  }}
                  title="Delete record"
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
