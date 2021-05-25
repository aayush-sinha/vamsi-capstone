var mongoose = require("mongoose");

// ########################################################
// ##
// ##                 appointment Schema
// ##
// ########################################################


var appointmentSchema = new mongoose.Schema({
    sid: String,
    tid: String,
    sname: String,
    Desc: String,
    appdate: String,
    slot: String,
    slotString: String,
    status: String,
    Date: { type: Date, default: Date.now }
});


module.exports = mongoose.model("Appointment", appointmentSchema);