export interface BudgetBreakdown {
  stay: number;
  food: number;
  transport: number;
  sightseeing: number;
  total: number;
  perPerson: number;
}

export interface RecommendedSpot {
  name: string;
  description: string;
  best_time_to_visit: string;
}

export interface Activity {
  time: string;
  spot: string;
  activity_details: string;
}

export interface ItineraryDay {
  day: number;
  theme: string;
  activities: Activity[];
  local_food_suggestion: string;
}

export interface TripPlan {
  id: string;
  destination: string;
  totalDays: number;
  numberOfPeople: number;
  budgetCategory: 'Budget' | 'Mid-Range' | 'Luxury';
  budgetBreakdown: BudgetBreakdown;
  recommended_spots: RecommendedSpot[];
  itinerary: ItineraryDay[];
  createdAt: string;
}
