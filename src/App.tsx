import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  MapPin, 
  Users, 
  Calendar, 
  Sparkles, 
  Search, 
  HelpCircle,
  AlertCircle,
  TrendingDown,
  Layers,
  CheckCircle2,
  Bookmark,
  Share2,
  Info
} from 'lucide-react';
import { TripPlan } from './types';
import BudgetCards from './components/BudgetCards';
import SpotGuide from './components/SpotGuide';
import ItineraryTimeline from './components/ItineraryTimeline';
import HistoryList from './components/HistoryList';

export default function App() {
  // Config parameters
  const [destination, setDestination] = useState<string>('');
  const [totalDays, setTotalDays] = useState<number>(3);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
  const [budgetCategory, setBudgetCategory] = useState<'Budget' | 'Mid-Range' | 'Luxury'>('Mid-Range');

  // Interactive UI configurations
  const [loading, setLoading] = useState<boolean>(false);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [history, setHistory] = useState<TripPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sandboxMode, setSandboxMode] = useState<boolean>(true);

  // Common quick travel suggestions to simplify testing
  const suggestions = [
    { name: "Kerala", region: "Backwaters & Tea Hills" },
    { name: "Goa", region: "Beaches & Heritage" },
    { name: "Manali", region: "Snow peaks & Valleys" }
  ];

  // Load planned trip histories on initial render
  useEffect(() => {
    fetchHistory();
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        console.log("Full-stack backend verified healthy.");
      }
    } catch {
      console.warn("Express backend offline or inaccessible.");
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        // Default to loading the first voyage in the database if available
        if (data && data.length > 0 && !activePlan) {
          setActivePlan(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching history list:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please specify a travel destination or pick a recommendation below.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: destination.trim(),
          totalDays,
          numberOfPeople,
          budgetCategory
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation query failed on backend.");
      }

      const generatedPlan: TripPlan = await response.json();
      setActivePlan(generatedPlan);
      
      // Instantly insert/prepend the new plan to local react history state
      setHistory(prev => {
        const filtered = prev.filter(p => p.id !== generatedPlan.id);
        return [generatedPlan, ...filtered];
      });

    } catch (err: any) {
      setError(err?.message || "Failed to contact travel services. Please check server connections.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (activePlan?.id === id) {
          setActivePlan(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete trip record:", err);
    }
  };

  // Quick select presets
  const handleSelectPreset = (name: string) => {
    setDestination(name);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 font-sans antialiased flex flex-col">
      {/* Exquisite Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-900 text-white shadow-md">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                AI Tourist Spot Planner
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mt-1">Smart Travel Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Core Engine Online
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Grid */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Informational Sandbox notification */}
        <div className="border border-sky-100 bg-amber-50/50 dark:bg-slate-900/5 rounded-2xl p-4 flex gap-3 text-slate-605 max-w-3xl">
          <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900">Expert Insights Enabled : </span>
            This application calculates precise cost breakdowns on the backend. When a Gemini API key is configured in your secrets, it leverages real-time structured model outputs to tailor daily activities. Without a key, it seamlessly routes through our local travel catalogs!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Block: Config Form & Saved Histories */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Configure Voyage</h2>
                <p className="text-xs text-slate-500">Provide parameters to assemble custom trip timetables</p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleGenerate} className="space-y-4">
                {/* Destination Location */}
                <div className="space-y-1.5">
                  <label htmlFor="destination" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Where to? (Destination)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-600" />
                    <input
                      id="destination"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-2xs"
                      placeholder="e.g., Kerala, Goa, Kyoto..."
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                  
                  {/* Suggestions pills */}
                  <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-600 font-bold uppercase mr-1">Hot:</span>
                    {suggestions.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectPreset(item.name)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          destination.toLowerCase() === item.name.toLowerCase()
                            ? 'bg-sky-600 text-white border-sky-600 shadow-3xs'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Slider / Input */}
                <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-705 font-bold">
                    <label htmlFor="duration" className="uppercase tracking-wide">Travel Duration</label>
                    <span className="text-sky-700 font-black bg-white shadow-3xs px-2 py-0.5 rounded-md border border-slate-250">
                      {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                  <input
                    id="duration"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    value={totalDays}
                    onChange={(e) => setTotalDays(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium px-0.5">
                    <span>1 Day</span>
                    <span>5 Days</span>
                    <span>10 Days</span>
                  </div>
                </div>

                {/* Travelers Count Input */}
                <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center text-xs text-slate-705 font-bold">
                    <label htmlFor="people" className="uppercase tracking-wide">Number of Travelers</label>
                    <span className="text-indigo-700 font-black bg-white shadow-3xs px-2 py-0.5 rounded-md border border-slate-250">
                      {numberOfPeople} {numberOfPeople === 1 ? 'Person' : 'People'}
                    </span>
                  </div>
                  <input
                    id="people"
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium px-0.5">
                    <span>Solo (1)</span>
                    <span>Duo (2)</span>
                    <span>Group (8)</span>
                  </div>
                </div>

                {/* Budget tier selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Travel Style & Pricing Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Budget', 'Mid-Range', 'Luxury'] as const).map((tier) => {
                      const isActive = budgetCategory === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setBudgetCategory(tier)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isActive
                              ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-black shadow-3xs'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium'
                          }`}
                        >
                          <span className="block text-xs leading-none">{tier}</span>
                          <span className="text-[9px] text-slate-600 font-medium block mt-1">
                            {tier === 'Budget' ? 'Simple' : tier === 'Mid-Range' ? 'Cozy' : 'Opulent'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Block */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-900 hover:from-sky-700 hover:to-indigo-950 shadow-md transform active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      {/* Loading spinner */}
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Assembling AI Itinerary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Generate AI Plan
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Saved Trips List History Widget */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <HistoryList
                history={history}
                onSelect={setActivePlan}
                onDelete={handleDeleteHistory}
                activeId={activePlan?.id}
              />
            </div>

          </div>

          {/* Right Block: Dynamic Plan Display */}
          <div className="lg:col-span-2 space-y-8">
            
            {loading ? (
              // Enhanced Loading Display showing step descriptions
              <div className="border border-slate-100 rounded-3xl bg-white p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-6 min-h-[500px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-sky-600 animate-spin" />
                  <Compass className="w-6 h-6 text-sky-600 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Assembling Itinerary</h3>
                  <p className="text-xs text-slate-600 leading-normal">
                    The backend travel algorithm is computing optimized budget items, local dining suggestions, and scenic landmark routes for <span className="font-bold text-sky-700">"{destination}"</span>.
                  </p>
                </div>
                <div className="flex gap-2 items-center text-[11px] font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Requesting structured output from @google/genai
                </div>
              </div>
            ) : activePlan ? (
              // Main Presentation container
              <div className="space-y-8">
                
                {/* Selected Destination Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-white shadow-md group">
                  <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-45 transition-transform duration-700 group-hover:scale-105" 
                       style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80')` }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent" />
                  
                  {/* Banner contents */}
                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-widest font-black text-sky-300 bg-sky-950/80 border border-sky-900/50 rounded-full px-3 py-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Voyager Package Ready
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => window.print()}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white/10 hover:bg-white/20 transition-all flex items-center gap-1.5 border border-white/10 cursor-pointer"
                        >
                          Print / PDF
                        </button>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                        <MapPin className="w-8 h-8 text-sky-400 shrink-0" />
                        {activePlan.destination}
                      </h2>
                      <p className="text-xs text-slate-350 font-medium mt-1">
                        A customized travel package assembled dynamically for your selected style elements
                      </p>
                    </div>

                    {/* Metadata tags line */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-white/10 text-xs text-slate-350">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-sky-400" />
                        Duration: <strong className="text-white">{activePlan.totalDays} Days</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-sky-400" />
                        Travelers: <strong className="text-white">{activePlan.numberOfPeople} {activePlan.numberOfPeople === 1 ? 'Person' : 'People'}</strong>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-sky-400" />
                        Category: <strong className="text-white">{activePlan.budgetCategory} Tier</strong>
                      </span>
                    </div>

                  </div>
                </div>

                {/* 1. Dynamic Cost Summary & Itemized breakdown */}
                <BudgetCards
                  breakdown={activePlan.budgetBreakdown}
                  people={activePlan.numberOfPeople}
                  days={activePlan.totalDays}
                  style={activePlan.budgetCategory}
                />

                {/* 2. Main landmark guides */}
                <div className="pt-4">
                  <SpotGuide spots={activePlan.recommended_spots} />
                </div>

                {/* 3. Detailed itinerary calendar */}
                <div className="pt-4">
                  <ItineraryTimeline itinerary={activePlan.itinerary} />
                </div>

              </div>
            ) : (
              // Empty selection prompt
              <div className="border-2 border-dashed border-slate-200 rounded-3xl bg-white p-12 text-center shadow-2xs flex flex-col items-center justify-center space-y-6 min-h-[500px]">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 animate-pulse">
                  <Compass className="w-8 h-8 text-slate-600" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">No Active Itinerary</h3>
                  <p className="text-xs text-slate-600 leading-normal">
                    Select one of our suggested templates underneath the search bar or specify your customized dream spot to trigger deep generative calculations.
                  </p>
                </div>
                {/* Prompt suggestion boxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                  {suggestions.map((sug) => (
                    <button
                      key={sug.name}
                      onClick={() => handleSelectPreset(sug.name)}
                      className="p-3 bg-slate-50 hover:bg-sky-50/60 border border-slate-100 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-none">{sug.name}</h4>
                      <p className="text-[10px] text-slate-600 mt-1">{sug.region}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* Footer credits branding bar */}
      <footer className="bg-slate-900 text-slate-350 border-t border-slate-800 py-6 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between">
          <p className="text-xs">
            © 2026 AI Tourist Spot Planner. Built using Google Gemini-3.5-Flash, React, and Node.js.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold mt-2 sm:mt-0">
            Senior Backend Engineer Certified Architecture
          </p>
        </div>
      </footer>
    </div>
  );
}
