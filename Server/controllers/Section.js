const Section =require("../models/Section");
const Course=require("../models/Course");


//createSection handler function
exports.createSection =async(req,res) =>{
    try{
        //data fetch
        const{sectionName,courseId} =req.body;
        //data validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'All the fields are required',
            });
        }
        //create Section
        const newSection=await Section.create({sectionName});
        //update course with section object id
        const updatedCourseDetails=await Course.findByIdAndUpdate(
                                        courseId,
                                        {
                                            $push:{
                                                courseContent:newSection._id,
                                            }
                                        },
                                        {new:true},
                                    )
        //return res
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section,please try again",
            error:error.message,
        });
    }
}

//updateSection handler function
exports.updateSection=async(req,res) =>{
    try{
        //data input
        const{sectionName,sectionId}=req.body;
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:'All the fields are required',
            });
        }
        //update data
        const section=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true});
        //return response
        return res.status(200).json({
            success:true,
            message:'Section Updated successfully',
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section,please try again",
            error:error.message,
        });
    }
};

//delete section handler
exports.deleteSection = async(req,res) =>{
    try{
        //getid -assuming that we are sending section id and params
        const {sectionId}=req.body;
        //use findbyidand delete
        await Section.findByIdAndDelete(sectionId);
        //return response
        return res.status(200).json({
            success:true,
            message:'Section deleted successfully',
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section,please try again",
            error:error.message,
        });
    }
};