import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  ArrowRight, 
  UtensilsCrossed, 
  Clock, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ItineraryDay } from '../types';

interface ItineraryTimelineProps {
  itinerary: ItineraryDay[];
}

export default function ItineraryTimeline({ itinerary }: ItineraryTimelineProps) {
  // Allow toggling specific days, default keeping all open or first open
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

  const toggleDay = (day: number) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  if (!itinerary || itinerary.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-600" />
          Day-by-Day Travel Schedule
        </h3>
        <p className="text-xs text-slate-500">Chronological list of curated explorations and sightseeing activities</p>
      </div>

      <div className="space-y-4">
        {itinerary.map((dayItem) => {
          const isOpen = expandedDays[dayItem.day];
          
          return (
            <div 
              key={dayItem.day} 
              className="border border-slate-150 rounded-2xl bg-white shadow-xs overflow-hidden transition-all"
            >
              {/* Day Header Accordion Trigger */}
              <button
                onClick={() => toggleDay(dayItem.day)}
                type="button"
                className="w-full flex items-center justify-between p-5 bg-slate-50/60 hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-sky-600 text-white rounded-xl px-3 py-1.5 font-black text-center whitespace-nowrap min-w-[70px]">
                    <div className="text-[10px] tracking-widest uppercase opacity-85 leading-none">DAY</div>
                    <div className="text-lg leading-tight mt-0.5">{dayItem.day < 10 ? `0${dayItem.day}` : dayItem.day}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 leading-tight">
                      {dayItem.theme || `Exploring Region ${dayItem.day}`}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {dayItem.activities.length} planned spots & events
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-800 bg-white border border-slate-200 rounded-md px-2 py-0.5 shadow-2xs">
                    {isOpen ? "Collapse Grid" : "Expand Day"}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-600 shrink-0" />
                  )}
                </div>
              </button>

              {/* Day Activities details */}
              {isOpen && (
                <div className="p-6 border-t border-slate-100 bg-white space-y-6">
                  {/* Left aligned chronological checklist */}
                  <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-slate-100">
                    {dayItem.activities.map((activity, uIdx) => {
                      // Color schemes based on typical hours (Morning, Mid-day, Evening)
                      const isMorning = activity.time.toLowerCase().includes("am") || parseInt(activity.time) < 12;
                      const timeSchemeColor = isMorning 
                        ? "bg-amber-500" 
                        : "bg-indigo-500";
                      
                      return (
                        <div key={`${activity.spot}_${uIdx}`} className="relative group">
                          {/* Circle indicator node */}
                          <span className={`absolute -left-[31px] sm:-left-[39px] h-4 w-4 rounded-full border-2 border-white ring-2 ring-slate-100 ${timeSchemeColor} z-10 transition-transform group-hover:scale-120`} />

                          <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6">
                            {/* Time section */}
                            <div className="sm:w-28 shrink-0 flex items-center gap-1 text-xs font-bold text-slate-600 uppercase tracking-wide">
                              <Clock className="w-3.5 h-3.5 text-slate-600" />
                              {activity.time || "09:00 AM"}
                            </div>

                            {/* Content text */}
                            <div className="flex-1 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-xl transition-all duration-150">
                              <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                {activity.spot}
                                <ArrowRight className="w-3 h-3 text-slate-600" />
                              </h5>
                              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                {activity.activity_details}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Culinary / Lunch Local Tip pane */}
                  {dayItem.local_food_suggestion && (
                    <div className="bg-orange-50/60 dark:bg-amber-950/10 border border-orange-100 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
                      <div className="bg-orange-100 text-orange-700 p-2.5 rounded-lg shrink-0">
                        <UtensilsCrossed className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] tracking-widest uppercase font-black text-orange-850">
                          Local Culinary Feature for Day {dayItem.day}
                        </span>
                        <h5 className="text-xs font-black text-slate-900 mt-0.5">
                          Must-Try: {dayItem.local_food_suggestion}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Ask your drivers or local guesthouse hosts for the most authentic kitchen serving this. Pair it with local lime nectar or organic buttermilk!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
