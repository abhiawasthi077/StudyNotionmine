const {instance}=require("../config/razorpay");
const Course=require("../models/Course");
const User=require("../models/User");
const mailSender=require("../utils/mailSender");
const{courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const {paymentSuccessEmail} =require("../mail/templates/paymentSuccessEmail")
const crypto = require("crypto");
const CourseProgress = require("../models/CourseProgress");

//initiate the razorpay order
exports.capturePayment = async(req, res) => {

    const {courses} = req.body;
    const userId = req.user.id;

    if(courses.length === 0) {
        return res.json({success:false, message:"Please provide Course Id"});
    }

    let totalAmount = 0;

    for(const course_id of courses) {
        let course;
        try{
           
            course = await Course.findById(course_id);
            if(!course) {
                return res.status(200).json({success:false, message:"Could not find the course"});
            }

            const uid  = new mongoose.Types.ObjectId(userId);
            if(course.studentsEnrolled.includes(uid)) {
                return res.status(200).json({success:false, message:"Student is already Enrolled"});
            }

            totalAmount += course.price;
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
    const currency = "INR";
    const options = {
        amount: totalAmount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
    }

    try{
        const paymentResponse = await instance.orders.create(options);
        res.json({
            success:true,
            message:paymentResponse,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({success:false, mesage:"Could not Initiate Order"});
    }

}


//verify the payment
exports.verifyPayment = async(req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    if(!razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature || !courses || !userId) {
            return res.status(200).json({success:false, message:"Payment Failed"});
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

        if(expectedSignature === razorpay_signature) {
            //enroll karwao student ko
            await enrollStudents(courses, userId, res);
            //return res
            return res.status(200).json({success:true, message:"Payment Verified"});
        }
        return res.status(200).json({success:"false", message:"Payment Failed"});

}


const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try{
            //find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true},
        )

        if(!enrolledCourse) {
            return res.status(500).json({success:false,message:"Course not Found"});
        }

        const courseProgress = await CourseProgress.create({
            courseID: courseId,
            userId: userId,
            completedVideos: [],
          })
        //find the student and add the course to their list of enrolledCOurses
        const enrolledStudent = await User.findByIdAndUpdate(userId,
            {$push:{
                courses: courseId,
                courseProgress: courseProgress._id,
            }},{new:true})
            
        ///bachhe ko mail send kardo
        const emailResponse = await mailSender(
            enrollStudents.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
        )    
        //console.log("Email Sent Successfully", emailResponse.response);
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }

}

exports.sendPaymentSuccessEmail = async(req, res) => {
    const {orderId, paymentId, amount} = req.body;

    const userId = req.user.id;

    if(!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({success:false, message:"Please provide all the fields"});
    }

    try{
        //student ko dhundo
        const enrolledStudent = await User.findById(userId);
        await mailSender(
            enrolledStudent.email,
            `Payment Recieved`,
             paymentSuccessEmail(`${enrolledStudent.firstName}`,
             amount/100,orderId, paymentId)
        )
    }
    catch(error) {
        console.log("error in sending mail", error)
        return res.status(500).json({success:false, message:"Could not send email"})
    }
}




// exports.capturePayment = async(req,res) =>{
//         //get course and user id
//         const{course_id}=req.body;
//         const userId=req.user.id;
//         //validation
//         //valid courseId
//         if(!course_id){
//             return res.json({
//                 success:false,
//                 message:"Please provide valid course id"
//             })
//         };
//         //valid courseDetails
//         try{
//             let course=await Course.findById(course_id);
//             if(!course) {
//                 return res.json({
//                     success:false,
//                     message:"Could not find the course",
//                 });
//             }
//             //user already pay for the same course
//             //converting userId from string to object id
//             const uid=new mongoose.Types.ObjectId(userId);
//             if(course.studentsEnrolled.includes(uid)){
//                 return res.status(200).json({
//                     success:false,
//                     message:'Student is already enrolled',
//                 });
//             }
//         }
//         catch(error){
//             console.error(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
    
//         //order create
//         const amount=course.price;
//         const currency="INR";

//         const options ={
//             amount:amount*100,
//             currency,
//             receipt:Math.random(Date.now().toString()),
//             notes:{
//                 courseId:course_id,
//                 userId,
//             }
//         };

//         try{
//             //initiate the payment using razorpay
//             const paymentResponse=await instance.orders.create(options);
//             console.log(paymentResponse);
//             //return response
//             return res.status(200).json({
//                 success:true,
//                 courseName:Course.courseName,
//                 courseDescription:Course.courseDescription,
//                 thumbnail:Course.thumbnail,
//                 orderId:paymentResponse.id,
//                 currency:paymentResponse.currency,
//                 amount:paymentResponse.amount,
//             });
//         }
//         catch(error){
//             return res.json({
//                 success:false,
//                 message:"Could not initiate order",
//             });
//         }
//  };

//  //Verify signature of razor pay and server

//  exports.verifySignature = async(req,res) =>{
//     const webhookSecret="123456";

//     const signature=req.headers["x-razorpay-signature"];

//     //converting webhook key to secret hash
//     const shasum=crypto.createHmac("sha256",webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest= shasum.digest("hex");

//     if(signature===digest){
//         console.log("Payment is Authorised");

//         const{userId,courseId}=req.body.payload.payment.entity.notes;

//         try{
//             //find the course and enroll the student in it
//             const enrolledCourse=await Course.findOneAndUpdate(
//                                               {_id:courseId},
//                                               {$push:{studentsEnrolled:userId}},
//                                               {new:true},
//             );
//             if(!enrolledCourse){
//                 return res.status(500).json({
//                     success:false,
//                     message:"Course not found",
//                 });
//             }
//             console.log(enrolledCourse);

//             //find the student and add the course to their list of enrolle courses
//             const enrolledStudent =await User.findOneAndUpdate(
//                                              {_id:userId},
//                                              {$push:{courses:courseId}},
//                                              {new:true},
//             );
//             console.log(enrolledStudent);

//             //send course purchase mail
//             const emailResponse=await mailSender(
//                            enrolledStudent.email,
//                            "Congratulations from Codehelp",
//                            "Congratulations, you are onboarded into new Codehelp Course ",
//             );
//             console.log(emailResponse);
//             return res.status(200).json({
//                 success:true,
//                 message:"Signature verified and Course added",
//             });
//         }
//         catch(error){
//             console.log(error);
//             return res.status(500).json({
//                 success:false,
//                 message:error.message,
//             });
//         }
//     }
//     else{
//         return res.status(400).json({
//             success:false,
//             message:'Invalid request',
//         })
//     }
// };