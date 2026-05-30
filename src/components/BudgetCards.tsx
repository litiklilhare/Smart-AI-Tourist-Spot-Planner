import React, { useState } from 'react';
import { 
  DollarSign, 
  Hotel, 
  Utensils, 
  Car, 
  Compass, 
  Users, 
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { BudgetBreakdown } from '../types';

interface BudgetCardsProps {
  breakdown: BudgetBreakdown;
  people: number;
  days: number;
  style: 'Budget' | 'Mid-Range' | 'Luxury';
}

export default function BudgetCards({ breakdown, people, days, style }: BudgetCardsProps) {
  const [activeTab, setActiveTab] = useState<'table' | 'visual'>('visual');

  const budgetItems = [
    {
      name: 'Accommodation & Stay',
      value: breakdown.stay,
      percent: Math.round((breakdown.stay / breakdown.total) * 100),
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200 dark:border-emerald-900',
      icon: Hotel,
      desc: 'Based on comfortable dual-sharing rooms'
    },
    {
      name: 'Local Food & Cafes',
      value: breakdown.food,
      percent: Math.round((breakdown.food / breakdown.total) * 100),
      color: 'bg-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200 dark:border-amber-900',
      icon: Utensils,
      desc: 'Local diners and specialty restaurants'
    },
    {
      name: 'Cab Cabs & Transfers',
      value: breakdown.transport,
      percent: Math.round((breakdown.transport / breakdown.total) * 100),
      color: 'bg-sky-500',
      textColor: 'text-sky-600 dark:text-sky-400',
      bgColor: 'bg-sky-50 dark:bg-sky-950/20',
      borderColor: 'border-sky-200 dark:border-sky-900',
      icon: Car,
      desc: 'Commutes, city exploration vehicles'
    },
    {
      name: 'Sightseeing & Entry Passes',
      value: breakdown.sightseeing,
      percent: Math.round((breakdown.sightseeing / breakdown.total) * 100),
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-900',
      icon: Compass,
      desc: 'Famous spot access and forest passes'
    }
  ];

  const getStyleBadgeColor = () => {
    switch (style) {
      case 'Budget': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Mid-Range': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Luxury': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <h3 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-500" />
        Travel Budget Allocation
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Per Person Indicator */}
        <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-xs group">
          <div className="absolute right-0 top-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-orange-100 opacity-50 blur-xl transition-transform group-hover:scale-125" />
          <div className="flex items-center gap-2 text-orange-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            Per Head Estimates
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-none">
              ₹{breakdown.perPerson.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-600 font-medium ml-1">/ person</span>
          </div>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Avg. estimated individual cost covering stay, meals, and central commutes.
          </p>
        </div>

        {/* Card 2: Total Trip Package */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-xs group md:col-span-2">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-blue-600 opacity-20 blur-2xl transition-transform group-hover:scale-110" />
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-4 h-4 text-sky-400" />
              Comprehensive Trip Expense
            </div>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStyleBadgeColor()}`}>
              {style} Style
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <div className="mt-1">
                <span className="text-4xl font-black text-white tracking-tight">
                  ₹{breakdown.total.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 ml-1">for all days</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Aggregated base rate mapped specifically for your selection.
              </p>
            </div>

            {/* Micro stats inside total box */}
            <div className="flex gap-4 border-t border-slate-800 pt-3 sm:border-t-0 sm:pt-0 sm:border-l sm:pl-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Travelers</div>
                  <div className="text-sm font-bold text-white">{people} {people === 1 ? 'Person' : 'People'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Duration</div>
                  <div className="text-sm font-bold text-white">{days} {days === 1 ? 'Day' : 'Days'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Allocation visual progression */}
      <div className="border border-slate-100 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Expense Allocation Chart</h4>
            <p className="text-xs text-slate-500">Calculated itemized distribution</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'visual' 
                  ? 'bg-white text-slate-850 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Visual Meter
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'table' 
                  ? 'bg-white text-slate-850 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Spreadsheet View
            </button>
          </div>
        </div>

        {activeTab === 'visual' ? (
          <div className="space-y-5">
            {/* Horizontal stacked progress bar */}
            <div className="h-4.5 w-full rounded-full bg-slate-100 flex overflow-hidden shadow-inner border border-slate-100">
              {budgetItems.map((item) => (
                <div
                  key={item.name}
                  style={{ width: `${item.percent}%` }}
                  className={`${item.color} h-full transition-all duration-500`}
                  title={`${item.name}: ${item.percent}%`}
                />
              ))}
            </div>

            {/* Individual sliders with percentages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {budgetItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.name} 
                    className={`p-3.5 rounded-xl border ${item.borderColor} ${item.bgColor} flex items-start gap-3 transition-all hover:scale-[1.01]`}
                  >
                    <div className={`p-2 rounded-lg bg-white shadow-xs ${item.textColor} mt-0.5`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-850">{item.name}</span>
                        <span className={`text-xs font-black ${item.textColor}`}>{item.percent}%</span>
                      </div>
                      <div className="w-full bg-slate-200/50 dark:bg-slate-800/40 h-2 rounded-full overflow-hidden mt-1.5 mb-1 bg-white/60">
                        <div 
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>{item.desc}</span>
                        <span className="font-bold text-slate-800">
                          ₹{item.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Source</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ratio</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Per Person Rate</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {budgetItems.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-xs font-semibold text-slate-850">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-600">{item.percent}%</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <span className="text-xs font-medium text-slate-600">
                        ₹{Math.round(item.value / people).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-bold text-slate-900">
                      ₹{item.value.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-900/5 font-bold">
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-xs text-slate-900">Grand Estimated Total Plan Cost</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="text-xs text-slate-900">100%</span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs text-slate-600">
                    ₹{breakdown.perPerson.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap text-right text-xs text-slate-900">
                    ₹{breakdown.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
