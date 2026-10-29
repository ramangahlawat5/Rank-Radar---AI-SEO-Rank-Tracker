import KeywordTracking from "../models/keywordTracking.js";
import { keywordTracking } from "../services/keywordTrackingSevice.js";

// Add a keyword to track
export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;

        if (!keyword || !url) return res.status(400).json({ success: false, message: "Keyword and URL are required" });

        // Extract domain from URL
        let domain;
        try {
            const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);      // http should be present
            domain = urlObj.hostname.replace("www.", "");                    // remove www. , result = "example.com"
        } catch {
            return res.status(400).json({ success: false, message: "Invalid URL format" });
        }

        // Check if already tracking this keyword+domain
        const existing = await KeywordTracking.findOne({ userId: req.userId, keyword: keyword.toLowerCase().trim(), domain });

        if (existing) {
            return res.status(400).json({ success: false, message: "Already tracking this keyword for this domain" });
        }

        // Create tracking entry
        const tracking = await KeywordTracking.create({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            url: url.startsWith("http") ? url : `https://${url}`,
            domain,
            status: "checking",
        });

        res.status(201).json({ success: true, message: "Keyword tracking started", tracking });
        keywordTracking(tracking);      // calls the service that performs the actual ranking check.
    } catch (error) {
        console.error("Add keyword error:", error.message);
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Already tracking this keyword" });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all tracked keywords for user
export const getKeywords = async (req, res) => {
    try {                 // Returns all matching documents matching the current user's ID.
        const keywords = await KeywordTracking.find({ userId: req.userId }).sort({ createdAt: -1 }).select("-rankHistory");
        res.json({ success: true, keywords });
    } catch (error) {
        console.error("Get keywords error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get single keyword with full history (view details button)
export const getKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
        res.json({ success: true, tracking });
    } catch (error) {
        console.error("Get keyword error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Manually refresh a keyword ranking
export const refreshKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });
        tracking.status = "checking";
        await tracking.save();
        res.json({ success: true, message: "Rank check started" });
        keywordTracking(tracking);
    } catch (error) {
        console.error("Refresh keyword error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete keyword tracking
export const deleteKeyword = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOneAndDelete({ _id: req.params.id, userId: req.userId });  // changing byId to One
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });

        res.json({ success: true, message: "Keyword tracking deleted" });
    } catch (error) {
        console.error("Delete keyword error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Toggle tracking active/inactive
export const toggleTracking = async (req, res) => {
    try {
        const tracking = await KeywordTracking.findOne({ _id: req.params.id, userId: req.userId });
        if (!tracking) return res.status(404).json({ success: false, message: "Keyword tracking not found" });

        tracking.active = !tracking.active;
        await tracking.save();

        res.json({ success: true, tracking });
    } catch (error) {
        console.error("Toggle tracking error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};













{/*
    Controller: Handles HTTP requests and responses. [ This file ]
    Model: Defines and accesses the database structure.
    Service: Performs the ranking-checking logic.
    What is req.userId?
        It is typically attached to the request by your authentication middleware after validating the user's token.
        It identifies the currently authenticated user.

    auth middleware       → Verifies the JWT and attaches userId that can be used by any controller
    .findOne({ a, b, c }) → Requires all three conditions to match.

    Ln48: Sorts the records by creation date in descending order.
        1 → Ascending order, oldest first.
        -1 → Descending order, newest first.
        Therefore, recently added keywords appear first.
        Rank history is excluded bcz it becomes large over time, can be fetched separately when needed.
    Ln59: This checks two conditions:
        The document has the requested ID.
        The document belongs to the logged-in user.
    Ln74: Without saving, the change to tracking.status would only exist in the in-memory Mongoose document.

IMP: Also, your code currently doesn't check whether a ranking check is already running. Multiple refresh requests could potentially start overlapping jobs.

    Ln103: The next line saves the updated value to MongoDB.
    One important distinction

    Changing active to false does not automatically stop a running ranking check.
    Your ranking service or background scheduler must check this field and respect it.
    Otherwise, the database may show tracking as disabled while the service continues performing checks.
    Example use: A user switches off tracking for a keyword but wants to keep its existing ranking history.
*/}