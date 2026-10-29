import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        plan: { type: String, enum: ["free", "pro"], default: "free" },
        analysisCount: { type: Number, default: 0 },
        lastAnalysisDate: { type: Date, default: null },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;


















{/*
    Security note: Never store a user's plain-text password. Hash it using a suitable password-hashing library, such as bcrypt, before saving it.

    Mongoose manages these timestamps automatically for supported document and query operations.
    Ii adds 2 fields: CreatedAt and UpdatedAt
*/}