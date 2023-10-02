//send otp
const User=require("../models/User");
const OTP=require("../models/OTP")
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// Send OTP For Email Verification
exports.sendOTP=async(req,res) =>{
    try{
        //fetch email from req body
        const {email}=req.body;

        //check if user is already present
        const checkUserPresent =await User.findOne({email});

        //if user already exist then return a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        //generate otp
        var otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);

        while(result){
            otp=otpGenerator(6,{
                upperCaseAlphabets:false,
            });
        }
        const otpPayload={email,otp};

        //create an entry in DB
        const otpBody=await OTP.create(otpPayload);
        console.log(otpBody);

        //return response
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//sign up
exports.signUp=async(req,res) =>{
//fetch data from request body
   try{
    const{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }=req.body;

    //validate
    if(!firstName || !lastName || !email || !password || !confirmPassword ||!otp){
        return res.status(403).json({
            success:false,
            message:"All fields are required",
        })
    }

    //match both passwords
    if(password != confirmPassword){
        return res.status(400).json({
            success:false,
            message:'Password and Confirm Password does not match,please try again',
        });
    }

    //check user already exist or not
    const existingUser =await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success:false,
            message:'User is already registered',
        });
    }

    //find most recent otp stored for the user
    const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
    //created at -1 means sort in descending order
    console.log(recentOtp);
  
    //validate otp
    if(recentOtp.length===0){
        //otp not found
        return res.status(400).json({
            success:false,
            message:"OTP not found",
        });
    }else if(otp !== recentOtp[0].otp){
        //Invalid otp
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
    }

    //hash password 
    const hashedPassword =await bcrypt.hash(password,10);

    // Create the user
		let approved = "";
		approved === "Instructor" ? (approved = false) : (approved = true);
    
        const profileDetails = await Profile.create({
			gender: null,
			dateOfBirth: null,
			about: null,
			contactNumber: null,
		});
    //create entry in db
    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        approved: approved,
        accountType: accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })
    //return response
    return res.status(200).json({
        success:true,
        message:'User is  registered successfully',
        user,
    });

   }
   catch(error)  {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered.Please try again later",
        });
    }
};

//Login
exports.login= async(req,res) =>{
    try {
        //get data from req body
        const{email,password}=req.body;
        //validation of data
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:'All fields are required, please try again ',
            });
        }
        //user exist or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(401).json({
                success:false,
                message:"User is not registered,please signup first",
            });
        }
        //generate JWT, after password matching
        if(await bcrypt.compare(password,user.password)) {
            const payload ={
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token =jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2hr",
            });
            user.token=token;
            user.password=undefined;
            
            //create cookie and send response
            const options ={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfully',
            })

        }
        else {
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
       
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again',
        });

    }
};


//change password
exports.changePassword =async(req,res) =>{
    try{
        //get data form req body
        const userDetails = await User.findById(req.user.id);
        //get old password,new password,confirmNewPassword
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        //validate old password
        const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
        if(!isPasswordMatch){
            //if password is not matched return a unauthorized error 401
            return res.status(401).json({
                success:false,
                message: "The password is incorrect",
            });
        }
        // Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}
        //update password in DB
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);
        //send mail
        try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}
       //return response
       return res.status(200).json({
        success:true,
        message: "Password updated successfully",
       });
    }
    catch(error){
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
    }
   
}