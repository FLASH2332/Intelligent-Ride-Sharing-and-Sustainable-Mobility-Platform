import mongoose from "mongoose";

const orgSchema = mongoose.Schema(
    {
        name : {
            type : String, 
            required : true,
            unique : true
        }, 

        domains : [String],

        isApproved : {
            type : Boolean,
            default : false
        }

    },

    { timestamps : true }
);

export default mongoose.model("Organization", orgSchema);