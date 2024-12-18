import mongoose, { Schema } from "mongoose";

/**
 * Event Schema:
 * - name: The unique name of the event.
 * - avatar: The image URL representing the event.
 * - description: A brief description of the event.
 * - groupLimit: The maximum number of groups that can participate.
 * - startDate: The event's start date, which must be in the future.
 * - endDate: The event's end date, which must be after the start date.
 * - location: The location where the event will be held.
 * - category: The event's category.
 * - creator: The organization that created the event (references to the Org model).
 * - winnerGroup: The group that wins the event (reference to the Group model).
 * - pricePool: The prize pool for the event, must be a positive number.
 */

const event = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    groupLimit: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'Event:: {VALUE} is not an integer'
        }
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > Date.now();
            },
            message: 'Event:: Start date and time must be in the future'
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'Event:: End date and time must be after the start date and time'
        }
    },
    location: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        enum: ['technology', 'sports', 'education']
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "Org"
    },
    winnerGroup:{
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: false
    },
    pricePool: {
        type: Number,
        required: true,
        min: [0, 'Event:: Prize pool must be a positive number'], // Ensure the prize pool is a positive number
        validate: {
            validator: function(value) {
                return value >= 0; // Additional check to ensure no negative values
            },
            message: 'Event:: {VALUE} is not a valid prize pool amount'
        }
    }
});

export const Event = mongoose.model("Event", event);
