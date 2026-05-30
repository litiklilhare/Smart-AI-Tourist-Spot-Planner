/**
 * @file tripSchema.ts
 * @description Mongoose schema for saving generated travel itineraries in MongoDB.
 * Links generated trips to a specific user for historic query access.
 */

import mongoose, { Schema, Document } from 'mongoose';

// Budget Breakdown Interface
export interface IBudgetBreakdown {
  stay: number;
  food: number;
  transport: number;
  sightseeing: number;
  total: number;
  perPerson: number;
}

// Recommended Spot Interface
export interface IRecommendedSpot {
  name: string;
  description: string;
  best_time_to_visit: string;
}

// Activity Interface
export interface IActivity {
  time: string;
  spot: string;
  activity_details: string;
}

// Day-by-Day Itinerary Interface
export interface IItineraryDay {
  day: number;
  theme: string;
  activities: IActivity[];
  local_food_suggestion?: string;
}

// Full Trip Plan Document Interface
export interface ITripDocument extends Document {
  userId: string; // Linked to a user ID for private records
  destination: string;
  totalDays: number;
  numberOfPeople: number;
  budgetCategory: 'Budget' | 'Mid-Range' | 'Luxury';
  budgetBreakdown: IBudgetBreakdown;
  recommended_spots: IRecommendedSpot[];
  itinerary: IItineraryDay[];
  createdAt: Date;
}

// 1. Budget Breakdown Schema
const BudgetBreakdownSchema: Schema = new Schema({
  stay: { type: Number, required: true },
  food: { type: Number, required: true },
  transport: { type: Number, required: true },
  sightseeing: { type: Number, required: true },
  total: { type: Number, required: true },
  perPerson: { type: Number, required: true },
}, { _id: false });

// 2. Recommended Spot Schema
const RecommendedSpotSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  best_time_to_visit: { type: String, required: true },
}, { _id: false });

// 3. Activity Schema
const ActivitySchema: Schema = new Schema({
  time: { type: String, required: true },
  spot: { type: String, required: true },
  activity_details: { type: String, required: true },
}, { _id: false });

// 4. Itinerary Day Schema
const ItineraryDaySchema: Schema = new Schema({
  day: { type: Number, required: true },
  theme: { type: String, required: true },
  activities: [ActivitySchema],
  local_food_suggestion: { type: String },
}, { _id: false });

// 5. Consolidated Trip Schema
const TripSchema: Schema = new Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true // Indexed for rapid user history retrieval
  },
  destination: { 
    type: String, 
    required: true, 
    trim: true 
  },
  totalDays: { 
    type: Number, 
    required: true,
    min: 1 
  },
  numberOfPeople: { 
    type: Number, 
    required: true,
    min: 1 
  },
  budgetCategory: { 
    type: String, 
    required: true, 
    enum: ['Budget', 'Mid-Range', 'Luxury'] 
  },
  budgetBreakdown: { 
    type: BudgetBreakdownSchema, 
    required: true 
  },
  recommended_spots: [RecommendedSpotSchema],
  itinerary: [ItineraryDaySchema],
}, { 
  timestamps: { createdAt: 'createdAt', updatedAt: false } 
});

// Create Indexes
TripSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Trip || mongoose.model<ITripDocument>('Trip', TripSchema);
