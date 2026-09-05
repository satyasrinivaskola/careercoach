const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        question: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["pending", "answered"],
            default: "pending"
        },

        answeredAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;