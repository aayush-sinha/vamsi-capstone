var mongoose = require("mongoose");


var subjectSchema = new mongoose.Schema({
    code: String,
    sem: Number,
    ccac: Number,
    nccac: Number,
    caw: Number,
    mtec: Number,
    mtew: Number,
    pc: Number,
    pw: Number,
    etew: Number,
    aw: Number
});


module.exports = mongoose.model("Subject", subjectSchema);