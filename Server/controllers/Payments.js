const {instance}=require("../config/razorpay");
const Course=require("../models/Course");
const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const{courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");

//capture the payment and initiate the razorpay
exports.capturePayment = async(req,res) =>{
        //get course and user id
        const{course_id}=req.body;
        const userId=req.user.id;
        //validation
        //valid courseId
        if(!course_id){
            return res.json({
                success:false,
                message:"Please provide valid course id"
            })
        };
        //valid courseDetails
        try{
            let course=await Course.findById(course_id);
            if(!course) {
                return res.json({
                    success:false,
                    message:"Could not find the course",
                });
            }
            //user already pay for the same course
            //converting userId from string to object id
            const uid=new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:'Student is already enrolled',
                });
            }
        }
        catch(error){
            console.error(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    
        //order create
        const amount=course.price;
        const currency="INR";

        const options ={
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now().toString()),
            notes:{
                courseId:course_id,
                userId,
            }
        };

        try{
            //initiate the payment using razorpay
            const paymentResponse=await instance.orders.create(options);
            console.log(paymentResponse);
            //return response
            return res.status(200).json({
                success:true,
                courseName:Course.courseName,
                courseDescription:Course.courseDescription,
                thumbnail:Course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            });
        }
        catch(error){
            return res.json({
                success:false,
                message:"Could not initiate order",
            });
        }
 };

 //Verify signature of razor pay and server

 exports.verifySignature = async(req,res) =>{
    const webhookSecret="123456";

    const signature=req.headers["x-razorpay-signature"];

    //converting webhook key to secret hash
    const shasum=crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest= shasum.digest("hex");

    if(signature===digest){
        console.log("Payment is Authorised");

        const{userId,courseId}=req.body.payload.payment.entity.notes;

        try{
            //find the course and enroll the student in it
            const enrolledCourse=await Course.findOneAndUpdate(
                                              {_id:courseId},
                                              {$push:{studentsEnrolled:userId}},
                                              {new:true},
            );
            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found",
                });
            }
            console.log(enrolledCourse);

            //find the student and add the course to their list of enrolle courses
            const enrolledStudent =await User.findOneAndUpdate(
                                             {_id:userId},
                                             {$push:{courses:courseId}},
                                             {new:true},
            );
            console.log(enrolledStudent);

            //send course purchase mail
            const emailResponse=await mailSender(
                           enrolledStudent.email,
                           "Congratulations from Codehelp",
                           "Congratulations, you are onboarded into new Codehelp Course ",
            );
            console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:"Signature verified and Course added",
            });
        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:'Invalid request',
        })
    }
};