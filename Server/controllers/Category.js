const category = require("../models/category");


//create handler function 

exports.createCategory=async(req,res) =>{
    try {
        //fetch data
        const{name,description}=req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:'All the fields are required',
            })
        }
        //create entry in DB
        const CategorysDetails=await category.create({
            name:name,
            description:description,
        });
        console.log(CategorysDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"Categorys created successfully",
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

//getAllCategorys handler function
exports.showAllCategories = async(req,res) =>{
    try {
        const allCategorys=await category.find({}, {name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All Categorys returned successfully",
            data:allCategorys,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
            allTags,
        })
    }
};

//Category page details
exports.categoryPageDetails =async(req,res) =>{
    try{
        //get category id
        const{categoryId} =req.body;
        //get courses for specialized category id
        const selectedCategory= await category.findById(categoryId)
                                             .populate("courses")
                                             .exec();

        //validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:'Data not found',
            });
        }
        //get courses for different categories
        const differentCategories = await category.find({
                                              _id:{$ne:categoryId},
                                                })
                                                .populate("courses")
                                                .exec();
        //get top selling courses
        //return response
        return res.status(200).json({
            success:true,
            data: {
                selectedCategory,
                differentCategories,
            },
        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}