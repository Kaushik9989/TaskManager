const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        completed:{
            type:Boolean,
            default:false,
        },
        created_at:{
            type:Date,
            required:true,
        }

    }
);

const task = mongoose.model("task",taskSchema);
module.exports=task;