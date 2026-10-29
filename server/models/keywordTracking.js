import mongoose from "mongoose";

const rankEntrySchema = new mongoose.Schema(                
    {                                                         // This schema defines one historical ranking record for a keyword.
        date: { type: Date, required: true },
        position: { type: Number, default: null },
        page: { type: Number, default: null },
        title: { type: String, default: "" },
        snippet: { type: String, default: "" },
    },
    { _id: false }
);

const competitorSchema = new mongoose.Schema(
    {                                                         // stores information about websites competing for the same keyword.
        position: { type: Number, required: true },
        url: { type: String, required: true },
        domain: { type: String, required: true },
        title: { type: String, default: "" },
        snippet: { type: String, default: "" },
    },
    { _id: false }
);

const keywordTrackingSchema = new mongoose.Schema(               // represents one keyword that a user wants to track
    {                    
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        keyword: { type: String, required: true, trim: true, lowercase: true },
        url: { type: String, required: true, trim: true },
        domain: { type: String, required: true },
        currentPosition: { type: Number, default: null },
        currentPage: { type: Number, default: null },
        bestPosition: { type: Number, default: null },
        positionChange: { type: Number, default: 0 },
        rankHistory: [rankEntrySchema],
        competitors: [competitorSchema],
        active: { type: Boolean, default: true },
        lastChecked: { type: Date, default: null },
        status: { type: String, enum: ["pending", "checking", "completed", "failed"], default: "pending" },
    },
    { timestamps: true }                // Mongoose will auto add createdAt and updatedAt
);

keywordTrackingSchema.index({ userId: 1, keyword: 1, domain: 1 }, { unique: true });

const KeywordTracking = mongoose.model("KeywordTracking", keywordTrackingSchema);

export default KeywordTracking;
















{/*
    What does { _id: false } mean?
        Normally, Mongoose automatically generates an _id for every subdocument, we doesn't need their ids 
        Why? To avoid storing unnecessary IDs for every historical record.

    ObjectId: MongoDB's identifier type.
    Why is userId necessary?
        Suppose 100 users are using your SEO Rank Tracker. Each user may track different keywords.
        The userId allows your application to retrieve only the keywords belonging to the logged-in user.
    
    keyword trim and lowerspace helps maintain consistent keyword formatting.
    Best Position: Stores the best ranking position achieved during the tracking period.
    Position Change: stores how much thte keyword's ranking has changed.
    rankHistory allows your application to display ranking trends over time.   stores array

    Ln44: This creates a compound unique index on three fields:
        userId
        keyword
        domain
*/}