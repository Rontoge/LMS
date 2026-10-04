import { Request , Response , NextFunction } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";



// upload Course


export const uploadCourse = catchAsyncErrors(async (req:Request , res: Response   ,  next : NextFunction)=>{
    try {
        const data = req.body;
        const thumbnail  = data.thumbnail;

        if(thumbnail){
            const myCloud = await cloudinary.v2.uploader.upload(thumbnail,{
                folder:"courses"
            });

            data.thumbnail ={
                public_id:myCloud.public_id,
                url:myCloud.secure_url
            }
        }
        await createCourse(data , res,next)
    } catch (error :any) {
        return next(new ErrorHandler(error.message,500))
        
    }
});


//  edit course
// 


export const editCourse = catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courseId = req.params.id;

            // Get the existing course from MongoDB
            const course = await CourseModel.findById(courseId);

            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const data = req.body;
            const thumbnail = data.thumbnail;

            if (thumbnail) {

                // DELETE OLD IMAGE
                await cloudinary.v2.uploader.destroy(
                    (course.thumbnail as { public_id: string }).public_id
                );

                // UPLOAD NEW IMAGE
                const myCloud = await cloudinary.v2.uploader.upload(
                    thumbnail,
                    {
                        folder: "courses"
                    }
                );

                // SAVE NEW IMAGE DATA
                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                };
            }

            // UPDATE COURSE
            const updatedCourse =
                await CourseModel.findByIdAndUpdate(
                    courseId,
                    { $set: data },
                    { returnDocument: "after" }
                );

            res.status(200).json({
                success: true,
                message: "Course updated successfully",
                course: updatedCourse
            });

        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);