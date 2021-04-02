var mongoose = require("mongoose");

// ########################################################
// ##
// ##                 Ques Schema
// ##
// ########################################################


var timeSchema = new mongoose.Schema({
    timeid: String,
    file: String
});


module.exports = mongoose.model("Time", timeSchema);