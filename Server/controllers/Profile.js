const Profile=require("../models/Profile");
const User=require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//update profile handler function
exports.updateProfile =async(req,res) =>{
    try{
        //get data
        const{DateOfBirth="",about="",contactNumber}=req.body;
        //get userId
        const id=req.user.id;
        //validation
        if(!contactNumber  || !id){
            return res.status(400).json({
                success:false,
                message:"All Fields are required",
            });
        }
        //find profile
        const userDetails=await User.findById(id);
        const profileId=userDetails.additionalDetails;
        const profileDetails=await Profile.findById(profileId)

        //update profile
        profileDetails.dateOfBirth=DateOfBirth;
        profileDetails.about=about;
        profileDetails.contactNumber=contactNumber;
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:"Profile Details updated successfully",
            profileDetails,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

//delete account handler function
exports.deleteAccount = async(req,res) =>{
    try{
        //get id
        const id=req.user.id;
        //validation
        const userDetails=await User.findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        //delete user from enrolled courses list
        //delete user
        await User.findByIdAndDelete({_id:id});
         //return response
         return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
         })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted, Please try again later',
        });
    }
};

//get all user details
exports.getAllUserDetails =async(req,res) =>{
    try{
        //get id
        const id=req.user.id;
        //get user details
        const userDetails=await User.findById(id).populate("additionalDetails").exec();
        console.log(userDetails);
        //return response
        return res.status(200).json({
            success:true,
            message:"User Data Fetched Successfully",
            data:userDetails,
        });
    }catch(error){
        return res.status(500).json({
            success:false,
            error:error.message,
        });
    }
};

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};
  
exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};