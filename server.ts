import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const HISTORY_FILE_PATH = path.join(process.cwd(), "trips_history.json");

// Middleware to parse JSON
app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      console.warn("WARNING: GEMINI_API_KEY environmental variable is missing or using placeholder.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------------------
// Core Budget Pricing Templates (Daily Cost in INR ₹ per person)
// Used as baseline rates for calculating custom expenditure reports
// -----------------------------------------------------------------------------
const BUDGET_TEMPLATES = {
  "Budget": {
    stayRate: 1200,      // Hostels, simple homestays (shared rooms logic applied)
    foodRate: 600,       // Street food, local budget cafes
    transportRate: 400,  // Public buses, trains, rickshaws
    sightseeingRate: 300 // Standard entry tickets, free spots
  },
  "Mid-Range": {
    stayRate: 3000,      // Cozy private hotels, guesthouses
    foodRate: 1500,      // Multi-cuisine cafes, standard restaurants
    transportRate: 1000, // App cabs, rented self-drive scooters/cars
    sightseeingRate: 600 // Guided walks, popular adventure tickets
  },
  "Luxury": {
    stayRate: 8000,      // Luxury heritage resorts, 4/5-star suites
    foodRate: 3500,      // Fine dining, gourmet beach clubs
    transportRate: 2500, // Private luxury chauffeurs, premium speedboats
    sightseeingRate: 1500 // VIP custom passes, private experiences
  }
};

/**
 * Calculates a detailed budget breakdown for trip planning.
 * Reflects real travel patterns (e.g., Stay costs assuming 2 people share a room, with adjustments for odd travelers).
 */
function calculateBudget(
  category: 'Budget' | 'Mid-Range' | 'Luxury',
  days: number,
  people: number
) {
  const rates = BUDGET_TEMPLATES[category] || BUDGET_TEMPLATES["Mid-Range"];

  // Calculating stay costs assuming twin-sharing rooms.
  // E.g., for 3 people, they need 2 rooms. Rate assumes per person rate based on double occupancy.
  const roomsNeeded = Math.ceil(people / 2);
  const stayCostPerRoomDay = rates.stayRate * 1.5; // Single room is 1.5x of per person rate
  const totalStay = stayCostPerRoomDay * roomsNeeded * days;

  // Proportional per-person calculations
  const totalFood = rates.foodRate * people * days;
  const totalTransport = rates.transportRate * people * days;
  const totalSightseeing = rates.sightseeingRate * people * days;

  const total = totalStay + totalFood + totalTransport + totalSightseeing;
  const perPerson = Math.round(total / people);

  return {
    stay: Math.round(totalStay),
    food: Math.round(totalFood),
    transport: Math.round(totalTransport),
    sightseeing: Math.round(totalSightseeing),
    total: Math.round(total),
    perPerson: perPerson
  };
}

// -----------------------------------------------------------------------------
// History Persistent helper
// -----------------------------------------------------------------------------
function readHistoryFromFile(): any[] {
  try {
    if (fs.existsSync(HISTORY_FILE_PATH)) {
      const data = fs.readFileSync(HISTORY_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to read history file:", error);
  }
  return [];
}

function writeHistoryToFile(history: any[]) {
  try {
    fs.writeFileSync(HISTORY_FILE_PATH, JSON.stringify(history, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to history file:", error);
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// History List API
app.get("/api/history", (req, res) => {
  const history = readHistoryFromFile();
  res.json(history);
});

// Delete history item API
app.delete("/api/history/:id", (req, res) => {
  const { id } = req.params;
  let history = readHistoryFromFile();
  history = history.filter((trip) => trip.id !== id);
  writeHistoryToFile(history);
  res.json({ success: true, message: "Trip deleted from history" });
});

// POST API to generate plans
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { destination, totalDays, numberOfPeople, budgetCategory } = req.body;

    if (!destination || !totalDays || !numberOfPeople || !budgetCategory) {
      return res.status(400).json({ 
        error: "Missing required fields: destination, totalDays, numberOfPeople, budgetCategory" 
      });
    }

    const days = parseInt(totalDays, 10);
    const people = parseInt(numberOfPeople, 10);
    if (isNaN(days) || days <= 0 || isNaN(people) || people <= 0) {
      return res.status(400).json({ error: "Invalid days or traveler counts." });
    }

    const categorySelected: 'Budget' | 'Mid-Range' | 'Luxury' = 
      ['Budget', 'Mid-Range', 'Luxury'].includes(budgetCategory) ? budgetCategory : "Mid-Range";

    // 1. Calculate local calculated baseline budget estimates
    const budgetBreakdown = calculateBudget(categorySelected, days, people);

    // 2. Fetch Tourist spots & custom itinerary from Google Gemini API with static structure schema constraints
    let generatedSpots = [];
    let generatedItinerary = [];
    let realDestinationName = destination;

    const apiKey = process.env.GEMINI_API_KEY;
    const isMockMode = !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "";

    if (isMockMode) {
      console.log("Gemini API key not found or placeholder - executing high-fidelity fallback generator...");
      // Generate highly rich realistic localized mock itinerary so the app remains fully interactive!
      const mockResult = generateFallbackItinerary(destination, days, categorySelected);
      generatedSpots = mockResult.recommended_spots;
      generatedItinerary = mockResult.itinerary;
      realDestinationName = mockResult.destination;
    } else {
      try {
        const client = getGeminiClient();

        // Robust prompt requesting detailed tourist spot analysis
        const prompt = `You are an expert AI Travel Planner. Generate a highly detailed travel itinerary and spot guide based on these parameters:
- Destination: ${destination}
- Duration: ${days} Days
- Travel Style / Category: ${categorySelected}

Ensure that standard famous places of ${destination} are suggested. Produce exactly ${days} full days of sequential itinerary starting from day 1 to day ${days}, keeping activities paced logically (e.g. morning, afternoon, evening). Include famous local food suggestions for each day fitting the style.`;

        // Definition of matching strict JSON output schema
        const responseSchema = {
          type: Type.OBJECT,
          properties: {
            destination: { 
              type: Type.STRING, 
              description: "The official clean name of the destination (e.g. Kyoto, Japan or Kerala, India)" 
            },
            recommended_spots: {
              type: Type.ARRAY,
              description: "List of top 3 to 5 famous tourist spots in this location.",
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the spot" },
                  description: { type: Type.STRING, description: "Summary of why it holds global fame" },
                  best_time_to_visit: { type: Type.STRING, description: "Best time of day or month to explore (e.g. Early Morning, Sunset, October to March)" }
                },
                required: ["name", "description", "best_time_to_visit"]
              }
            },
            itinerary: {
              type: Type.ARRAY,
              description: `Vertical daily schedule containing exactly ${days} sequential days.`,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "The Day order number" },
                  theme: { type: Type.STRING, description: "Theme of this day (e.g. Heritage Walk, Nature Exploration)" },
                  activities: {
                    type: Type.ARRAY,
                    description: "3 structured activities for this day (representing morning, afternoon, evening).",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "Scheduled time block (e.g. 09:30 AM, 02:00 PM)" },
                        spot: { type: Type.STRING, description: "Spot visited during this activity" },
                        activity_details: { type: Type.STRING, description: "Description of what to do, history, or expert tips" }
                      },
                      required: ["time", "spot", "activity_details"]
                    }
                  },
                  local_food_suggestion: { type: Type.STRING, description: "Famous local culinary specialty/dish to sample on this day" }
                },
                required: ["day", "theme", "activities", "local_food_suggestion"]
              }
            }
          },
          required: ["destination", "recommended_spots", "itinerary"]
        };

        const aiResponse = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.35, // Medium-low temperature to keep results consistent and reliable
          }
        });

        const textOutput = aiResponse.text;
        if (!textOutput) {
          throw new Error("No response returned from Gemini.");
        }

        const cleanJson = JSON.parse(textOutput.trim());
        realDestinationName = cleanJson.destination || destination;
        generatedSpots = cleanJson.recommended_spots || [];
        generatedItinerary = cleanJson.itinerary || [];

      } catch (geminiError) {
        console.error("Gemini live execution error, resolving with smart mock fallback:", geminiError);
        const mockResult = generateFallbackItinerary(destination, days, categorySelected);
        generatedSpots = mockResult.recommended_spots;
        generatedItinerary = mockResult.itinerary;
        realDestinationName = mockResult.destination;
      }
    }

    // Standardize & wrap everything inside the unified trip plan structure
    const newTrip = {
      id: "trip_" + Math.random().toString(36).substr(2, 9),
      destination: realDestinationName,
      totalDays: days,
      numberOfPeople: people,
      budgetCategory: categorySelected,
      budgetBreakdown: budgetBreakdown,
      recommended_spots: generatedSpots,
      itinerary: generatedItinerary,
      createdAt: new Date().toISOString()
    };

    // Auto-save generated trip plan into local JSON history list
    const history = readHistoryFromFile();
    history.unshift(newTrip); // Prepend to history
    // Enforce history max threshold of 30 stored packages to avoid bloat
    if (history.length > 30) {
      history.pop();
    }
    writeHistoryToFile(history);

    // Send complete response
    res.json(newTrip);

  } catch (error: any) {
    console.error("General API Exception:", error);
    res.status(500).json({ error: error?.message || "An unexpected error occurred while constructing the trip plan." });
  }
});

// Helper generators for beautiful fallback content when API keys are unconfigured
function generateFallbackItinerary(destination: string, days: number, budget: 'Budget' | 'Mid-Range' | 'Luxury') {
  const destLower = destination.trim().toLowerCase();
  
  let actualName = destination;
  let spots = [];
  let dailyThemes = [];
  let foods = [];
  let activitiesData = [];

  // Localized templates
  if (destLower.includes("kerala")) {
    actualName = "Kerala, India";
    spots = [
      { name: "Munnar Tea Gardens", description: "Breathtaking rolling hills covered in dense emerald tea plantations.", best_time_to_visit: "06:30 AM to 09:30 AM" },
      { name: "Alappuzha (Alleppey) Backwaters", description: "World-class serene houseboats cruising emerald palm-fringed channels.", best_time_to_visit: "11:00 AM to 04:00 PM" },
      { name: "Varkala Cliff Beach", description: "Striking red sandstone cliffs meeting the dramatic Arabian sea landscape.", best_time_to_visit: "04:30 PM to 06:30 PM (Sunset)" },
      { name: "Thekkady Wildlife Reserve", description: "Dense tropical vegetation home to wild elephants, rivers, and spice walks.", best_time_to_visit: "07:00 AM (Early Safari)" }
    ];
    dailyThemes = ["Misty Tea Garden Peaks", "Backwater Houseboat Escape", "Coastal Sunset Cliffs", "Wildlife & Spice Trails"];
    foods = ["Kerala Sadhya (Traditional Feast on Banana Leaf)", "Karimeen Pollichathu (Spiced pearl spot fish)", "Appam with Creamy Coconut Vegetable Stew", "Malabar Parotta with rich curry"];
    activitiesData = [
      { spot: "Eravikulam National Park", details: "Catch a glimpse of the rare Nilgiri Tahr and breathe fresh mist." },
      { spot: "Punnamada Lake Houseboat Riva", details: "Sail on a custom country-style wooden boat with freshly cooked backwater delicacies." },
      { spot: "Papanasam Beach cliff walks", details: "Stroll along cliffside stalls, sip organic tender coconuts, and watch the waves." },
      { spot: "Kumily Spice Plantation tour", details: "Sample cardamoms, pepper, and nutmeg right from the branches with local agriculturalists." }
    ];
  } else if (destLower.includes("goa")) {
    actualName = "Goa, India";
    spots = [
      { name: "Baga & Calangute Shacks", description: "Lively North Goan beach fronts famous for music, water activities, and seafood.", best_time_to_visit: "05:00 PM onward" },
      { name: "Basilica of Bom Jesus", description: "UNESCO World Heritage site guarding the mortal remains of St. Francis Xavier.", best_time_to_visit: "09:00 AM to 11:30 AM" },
      { name: "Dudhsagar Waterfalls", description: "Four-tiered massive milky-white waterfall accessed via exciting jungle jeeps.", best_time_to_visit: "08:00 AM to 01:00 PM" },
      { name: "Palolem Beach Crescent", description: "Picturesque peaceful white-sand cove in South Goa ideal for dolphins and yoga.", best_time_to_visit: "Any time (Very relaxed)" }
    ];
    dailyThemes = ["North Goa Sandy Beaches & Music", "Old Goa Heritage & Churches", "Jungle Dudhsagar Trekking", "South Goa Tranquility & Dolphins"];
    foods = ["Spicy Goan Fish Curry Rice", "Tangy Pork Vindaloo or Chicken Cafreal", "Bebinca (Multi-layered sweet pudding)", "Sizzling Butter Garlic Prawns"];
    activitiesData = [
      { spot: "Water adventures at Baga shoreline", details: "Paragliding, jet skies, or simple relaxing under a colorful straw canopy." },
      { spot: "Old Goa Church Exploration Walks", details: "Admire magnificent baroque architecture, golden altars, and ancient murals." },
      { spot: "Bhagwan Mahavir sanctuary drive", details: "Embark on an open jeep safari crossing stream bends to reach the milky cascades." },
      { spot: "Palolem boat dolphin tracking", details: "Hire local sea oarsmen to spot wild ocean dolphins surfing beside island rock walls." }
    ];
  } else if (destLower.includes("manali")) {
    actualName = "Manali, Himachal Pradesh";
    spots = [
      { name: "Solang Valley adventure peak", description: "Snowy valleys boasting majestic paragliding, ski loops, and mountain cablecars.", best_time_to_visit: "09:00 AM to 02:00 PM" },
      { name: "Hadimba Temple", description: "Pagoda-style ancient cedar-forest sanctuary built in the 16th century.", best_time_to_visit: "08:30 AM to 11:00 AM" },
      { name: "Atal Tunnel & Sissu", description: "Breathtaking drive underneath the Rohtang Pass into the stunning barren Lahaul Valley.", best_time_to_visit: "08:00 AM to 04:00 PM" },
      { name: "Old Manali Cafes", description: "Charming stone alleys filled with vibrant bakeries, wooden log cabins, and live river music.", best_time_to_visit: "06:00 PM onwards" }
    ];
    dailyThemes = ["Snowy Slopes & Adventure Sports", "Cultural Forests & Old Town Vibes", "High-Altitude Tunnel Drive", "Riverside Relaxation & Cafes"];
    foods = ["Himachali Dham (Festive yogurt lentils)", "Sidu (Warm steamed wheat bun with walnut stuffing)", "Fresh Trout Fish with garlic butter butter", "Thukpa & Steamed Veg Momos"];
    activitiesData = [
      { spot: "Solang Snow Glider Launch", details: "Launch into the skies in tandem paragliding overlooking the snow-capped Beas river range." },
      { spot: "Hadimba cedar forest shrines", details: "Hand-feed angora rabbits and admire intricate animal wood-carvings on ancient shrines." },
      { spot: "Lahaul Valley gateway - Sissu", details: "Witness massive water cascades crashing down cold mountain walls right after exiting the 9km tunnel." },
      { spot: "Old Manali wooden bridges of Beas", details: "Sip spiced apple cider at a cottage deck overlooking rapid river cascades as the sun dips." }
    ];
  } else {
    // Highly versatile default destination builder
    actualName = destination.charAt(0).toUpperCase() + destination.slice(1);
    spots = [
      { name: `${actualName} Historic Core`, description: "A marvelous central hub illustrating the authentic cultural roots of the city.", best_time_to_visit: "09:00 AM to 12:00 PM" },
      { name: `${actualName} Panoramic Viewpoint`, description: "The premier peak optimal for landscape photos and sunset viewing.", best_time_to_visit: "04:30 PM to 06:30 PM" },
      { name: `Grand Local Marketplace`, description: "Stunning lively stalls crowded with handcrafted souvenirs, spices, and clothing.", best_time_to_visit: "05:00 PM onwards" }
    ];
    dailyThemes = ["Heart of Heritage", "Peak Scenic Overlooks", "Local Bargains & Delicacies", "Offbeat Forest/Coastal Escapes"];
    foods = ["Authentic signature curry", "Traditional street platter", "Special local flour pan-bread", "Homemade herbal extract beverage"];
    activitiesData = [
      { spot: "Central Architectural monuments", details: "Explore century-old buildings, museums, and galleries detailing local legends." },
      { spot: "Main Ridge peak station", details: "Ride the local electric rail or cablecar to reach the crest for striking wide-angle panoramas." },
      { spot: "Traditional street bazaar food walk", details: "Explore old alleys with specialized local guides to taste unique spicy spices and sugar pastries." },
      { spot: "Outskirts silent reserve walks", details: "Get away from traffic noise and walk along scenic woodland trails or rivers." }
    ];
  }

  // Build sequential calendar itinerary
  const itinerary = [];
  for (let i = 1; i <= days; i++) {
    const themeIndex = (i - 1) % dailyThemes.length;
    const foodIndex = (i - 1) % foods.length;
    const actIndex = (i - 1) % activitiesData.length;
    const spotIndex = (i - 1) % spots.length;

    const mainSpot = spots[spotIndex].name;
    const supportSpot = activitiesData[actIndex].spot;
    const details = activitiesData[actIndex].details;

    itinerary.push({
      day: i,
      theme: dailyThemes[themeIndex],
      activities: [
        {
          time: "09:30 AM",
          spot: mainSpot,
          activity_details: `Begin your morning exploring ${mainSpot}. ${spots[spotIndex].description} It is excellent to witness the lively colors at this early hour.`
        },
        {
          time: "02:30 PM",
          spot: supportSpot,
          activity_details: `After an authentic local lunch, proceed to ${supportSpot}. Here, you will: ${details}`
        },
        {
          time: "06:00 PM",
          spot: "Grand Local Bazaar Walk",
          activity_details: `Wind down your evening interacting with local tradesmen, tasting spices, and enjoying sunset vistas. Sample some ${foods[foodIndex]} which is nearby!`
        }
      ],
      local_food_suggestion: foods[foodIndex]
    });
  }

  // Ensure we match top spots list
  const recommended_spots = spots.slice(0, 4);

  return {
    destination: actualName,
    recommended_spots,
    itinerary
  };
}

// -----------------------------------------------------------------------------
// Vite Dev Server / Static Deployment Configuration
// -----------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development server with Vite middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
    console.log("Registered Vite live development middleware.");
  } else {
    // Serving compiled static files in production
    const distPath = path.join(process.cwd(), "dist");
    
    // Ensure dist directory exists (will exist after compilation)
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      console.log(`Serving static production build from: ${distPath}`);
    } else {
      console.warn(`WARNING: Production build folder 'dist' not spotted. Run 'npm run build' first.`);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart AI Tourist Spot Planner Server listening on http://localhost:${PORT}`);
  });
}

startServer();
