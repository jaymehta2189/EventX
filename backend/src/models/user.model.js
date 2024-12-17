import mongoose, { Schema } from "mongoose";


/**
 * User Schema:
 * - name: The name of the user.
 * - email: The email address of the user, validated with a regex pattern.
 * - avatar: The image URL representing the user's avatar.   (later Include Default Avatar)
 * - password: The password for the user account (must be at least 8 characters).
 * - groupList: An array of groups the user is a part of (references to the Group model).
 */

const user = new Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
        unique: true,
        validate: {
            validator: function (value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // Basic email regex
            },
            message: 'User:: {VALUE} is not a valid email!'
        }
    },
    avatar: {
        type: String,
        required: true
        // Include Default Avatar
    },
    password: {
        type: String,
        required: [true, 'User:: Password is required'],
        minlength: 8 // Enforce password length
    },
    groupList: [
        {
            type: Schema.Types.ObjectId,
            ref: "Group"
        }
    ]
});


export const User = mongoose.model("User", user);
