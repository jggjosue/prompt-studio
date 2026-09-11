import mongoose,{Document,Schema}from'mongoose';
export interface IProjectClientLink extends Document{projectId:string;ownerUserId:string;tokenHash:string;label:string;allowComments:boolean;expiresAt:Date;revokedAt:Date|null;createdAt:Date}
const ProjectClientLinkSchema=new Schema<IProjectClientLink>({projectId:{type:String,required:true,index:true},ownerUserId:{type:String,required:true,index:true},tokenHash:{type:String,required:true,unique:true,index:true},label:{type:String,default:'Cliente',maxlength:120},allowComments:{type:Boolean,default:true},expiresAt:{type:Date,required:true,index:true},revokedAt:{type:Date,default:null},createdAt:{type:Date,default:Date.now}},{versionKey:false});
ProjectClientLinkSchema.index({projectId:1,createdAt:-1});
export default mongoose.models.ProjectClientLink||mongoose.model<IProjectClientLink>('ProjectClientLink',ProjectClientLinkSchema,'project_client_links');
