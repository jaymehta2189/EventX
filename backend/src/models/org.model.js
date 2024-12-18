const {Schema,model,mongoose}=require("mongoose")

/**
 * Org Schema:
 * - name: The name of the organization.
 * - email: The email address of the organization, validated with a regex pattern.
 * - avatar: The image URL representing the organization's avatar. (later Include Default Avatar)
 * - password: The password for the organization account (must be at least 8 characters).
 */

const org = new Schema({
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
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Org:: {VALUE} is not a valid email!'
        }
    },
    avatar: {
        type: String,
        required: true
        // Include Default Avatar
    },
    password: {
        type: String,
        required: [true, 'Org:: Password is required'],
        minlength: 8
    }
});

 const Org = mongoose.model("Org", org);
 module.exports=Org;