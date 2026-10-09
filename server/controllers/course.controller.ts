import { Request, Response, NextFunction } from "express";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import CourseModel from "../models/course.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import path from "path";

import ejs from "ejs";
import sendMail from "../utils/sendmail";

// upload Course

export const uploadCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      await createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

//  edit course

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
          (course.thumbnail as { public_id: string }).public_id,
        );

        // UPLOAD NEW IMAGE
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "courses",
        });

        // SAVE NEW IMAGE DATA
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      // UPDATE COURSE
      const updatedCourse = await CourseModel.findByIdAndUpdate(
        courseId,
        { $set: data },
        { returnDocument: "after" },
      );

      res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// getSinngle Cousre - without purchasing

export const getSingleCourse = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCache = await redis.get(`course:${courseId}`);

      if (isCache) {
        const course = JSON.parse(isCache);
        return res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl  -courseData.suggestion -courseData.questions -courseData.links",
        );

        await redis.set(`course:${courseId}`, JSON.stringify(course));
        res.status(200).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// Get all Courses -- without purchasing
export const getAllCourses = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCache = await redis.get("allCourses");

      if (isCache) {
        const courses = JSON.parse(isCache);
        return res.status(200).json({
          success: true,
          courses,
        });
      } else {
        const courses = await CourseModel.find().select(
          "-courseData.videoUrl  -courseData.suggestion -courseData.questions -courseData.links",
        );

        await redis.set("allCourses", JSON.stringify(courses));

        res.status(200).json({
          success: true,
          courses,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get course content forn  valid user

export const getCourseByUser = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;

      console.log("USER COURSES:", userCourseList);
      console.log("PARAM COURSE ID:", courseId);

      const courseExists = userCourseList?.some(
        (course: any) => course._id.toString() === courseId,
      );
      console.log("COURSE EXISTS:", courseExists);

      if (!courseExists) {
        return next(
          new ErrorHandler("You have not purchased this course", 403),
        );
      }

      const course = await CourseModel.findById(courseId);

      const content = course?.courseData;

      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add questions in course
interface IAddQuestion {
  question: string;
  courseId: string;
  contentId: string;
}

export const addQuestion = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, courseId, contentId }: IAddQuestion = req.body;
      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content ID", 400));
      }

      const courseContent = course?.courseData.find((item: any) =>
        item._id.equals(contentId),
      );
      if (!courseContent) {
        return next(new ErrorHandler("Content not found", 400));
      }
      const newQuestion: any = {
        question,
        user: req.user,
        questionReplies: [],
        createdAt: new Date(),
      };

      // add the new question to the course content's questions array
      courseContent.questions.push(newQuestion);

      await course?.save();

      res.status(200).json({
        success: true,
        message: "Question added successfully",
        question: newQuestion,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add answeers to questions in course

interface IAddAnswerData {
  answer: string;
  questionId: string;
  courseId: string;
  contentId: string;
}

export const addAnswer = catchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, questionId, courseId, contentId }: IAddAnswerData =
        req.body;

      if (typeof answer !== "string" || !answer.trim()) {
        return next(new ErrorHandler("Answer is required", 400));
      }

      const course = await CourseModel.findById(courseId);

      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content ID", 400));
      }

      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return next(new ErrorHandler("Invalid question ID", 400));
      }

      const courseContent = course?.courseData.find((item: any) =>
        item._id.equals(contentId),
      );
      if (!courseContent) {
        return next(new ErrorHandler("Content not found", 400));
      }

      const question = courseContent.questions.find((q: any) =>
        q._id.equals(questionId),
      );
      if (!question) {
        return next(new ErrorHandler("Question not found", 400));
      }

      const newAnswer: any = {
        answer,
        user: req.user,
        createdAt: new Date(),
      };

      // add the new answer to the question's answers array
      question.questionReplies.push(newAnswer);

      await course?.save();

      if (req.user._id === question.user._id) {
        //  create a notification for the user who asked the question
      } else {
        const data = {
          name: req.user.name,
          title: courseContent.title,
        };

        const html = await ejs.renderFile(
          path.join(__dirname, "../mails/Question-replies.ejs"),
          data
        );

        try{
            await sendMail({
            email: question.user.email,
            subject: "New answer to your question",
            template: "Question-replies.ejs",
            data
          });
        }catch(error: any){
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        message: "Answer added successfully",
        answer: newAnswer,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
