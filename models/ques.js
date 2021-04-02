var mongoose = require("mongoose");

// ########################################################
// ##
// ##                 Ques Schema
// ##
// ########################################################


var quesSchema = new mongoose.Schema({
    name: String,
    sem: String,
    sub: String,
    file: String,
    quesDate: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Ques", quesSchema);