const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate=require("../mail/templates/emailVerificationTemplate")
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    },
});

//function to send email
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse= await mailSender(email,"Verification Email",emailTemplate(otp));
        console.log("Email sent Successfully:",mailResponse);
    }catch(error){
        console.log("Error occurred while sending email:",error);
    }
}

//pre-middleware
OTPSchema.pre("save", async function(next) {
    console.log("New document save to database");

    if(this.isNew){
        await sendVerificationEmail(this.email,this.otp);
    }
    
    next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;