import mongoose from "mongoose";

const userSchema = new mongoose.Schema(

    {

        name : {
            type : String,
            required : true
        },

        email : {
            type : String,
            required : true,
            unique : true
        },

        password : {
            type : String,
            required : true,
        },

        role : {
            type : String,
            enum : ["EMPLOYEE", "ORG_ADMIN", "PLATFORM_ADMIN"],
            default : "EMPLOYEE"
        },

        organization : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Organization"
        },

        documentsUploaded : {
            type : Boolean,
            default : false
        },

        isDriver: {
            type: Boolean,
            default: false,
        },
          

    }, 

    { timestamps : true }
);

export default mongoose.model("User", userSchema);