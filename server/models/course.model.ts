import mongoose, { Schema, Document , Model} from "mongoose";

interface IComment extends Document{
    user : object,
    comment : string,
}

interface IReview extends Document{
    user : object,
    rating : number,
    comment : string,
    commentReplies : IComment[]
}

interface ILink extends Document {
    title : string,
    link : string,
} 
 
interface ICourseData extends Document  { 
    title : string,
    description : string ,
    videoUrl : string,
    videoThumbnail: object,
    videoSection : string,
    videoLength : number,
    VideoPlayer : string,
    links : ILink[],
    suggestions : string[],
    questions : IComment[],
}

interface ICourse extends Document { 
    name : string,
    description : string,
    price : number,
    estimatedPrice? : number,
    thumbnail : object,
    tags : string,
    level : string,
    demoUrl : string,
    benefits :{title : string }[],
    prerequisites : {title : string}[],
    reviews : IReview[],
    courseData : ICourseData[],
    ratings? : number,
    purchased?: number,
}