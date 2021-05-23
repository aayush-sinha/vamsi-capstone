const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Ques = require('../models/ques');
const Time = require('../models/time');
const Subject = require('../models/subject');
const multer = require('multer');
const User = require('../models/User');
const Appointment = require('../models/appointments');
let csvToJson = require('convert-csv-to-json');
// Welcome Page
//router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
      const { originalname } = file;
      // or 
      // uuid, or fieldname
      cb(null, originalname);
  }
})
const upload = multer({ storage });
// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
req.user.role == "s" ? 
res.render('student_dashboard', {
  user: req.user
}):
req.user.role == "t" ? 
res.render('teacher_dashboard', {
  user: req.user
}):
res.render('admin_dashboard', {
  user: req.user
})
);

router.get('/', (req, res) =>
res.render('test')
);
//endpoint for student to download questions
router.get("/ques_download", function (req, res) {
  Ques.find({}, function (err, ques) {
    if (err) {
      console.log(err);
    } else {
      console.log(ques)
      //to show download page 
      // .render will take two args 1st what page to render, 2nd what data is required to render that page
      res.render("ques_download", { ques: ques });
    }
  });
});
//this endpoint is to upload teachers csv file
router.get('/uploadTimeTable', ensureAuthenticated, (req, res) =>{
  const id = req.user._id
  res.render("timetable")
})
router.post('/uploadTimeTable', upload.array('timeTable'), (req, res) =>{
  const id = req.user._id
  Time.create({
    file: req.files[0].filename,
    timeid: id
});
  
return res.json({ status: 'OK', uploaded: req.files.length });
})

router.get('/makeAppointment', (req, res) =>{
  User.find({role: 't'}, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      res.render("makeAppointment", {  user: user });
    }
  });
})
router.post('/makeAppointment', (req, res) =>{
  const student = req.user._id
  const studentName = req.user.name
  const name = req.body.name
  const date = new Date(req.body.date)
  const appdate = date.toString().substring(0,15)
  console.log(appdate)
  const slot = req.body.slot
  let slotString
  if (slot == 2)
  slotString = "09:00 AM - 10-00 AM"
  else if (slot == 3)
  slotString = "10:00 AM - 11-00 AM"
  else if (slot == 4)
  slotString = "11:00 AM - 12-00 PM"
  else if (slot == 5)
  slotString = "01:00 PM - 02-00 PM"
  else if (slot == 6)
  slotString = "02:00 PM - 03-00 PM"
  else if (slot == 7)
  slotString = "03:00 PM - 04-00 PM"
  else if (slot == 8)
  slotString = "04:00 PM - 05-00 PM"

  console.log(slot)
  //to get teachers csv file name from dataname
  Time.find({timeid: name}, function (err, tt) {
    if (err) {
      console.log(err);
    } 
    else {
      //console.log(tt);
      let json = csvToJson.getJsonFromCsv("uploads/"+tt[0].file);//to convert csv to json
      const key = JSON.stringify(json[slot])
      console.log(key)
      function locations(substring,string){
      var a=[],i=-1;
      while((i=string.indexOf(substring,i+1)) >= 0) a.push(i);
      return a;
      }
      const arr = locations(",",key)
      //console.log(arr)
      var arr1=[]
      for(let i=1; i<arr.length-1;i++){
       arr1.push(arr[i+1]-arr[i])
     }
     if (arr1[date.getDay()-1] == 1){
      console.log("Teacher Free")
      Appointment.create({
        sid: student,
        tid: name,
        Desc: req.body.desc,
        sname: studentName,
        appdate: appdate,
        slot: slot,
        slotString: slotString,
        status: false
      });
      req.flash(
        'teacherFree',
        'Appointment Request Sent.'
      );
      res.redirect('/makeAppointment');
     }
      else{
      console.log("Teacher Not Free")
      req.flash(
        'teacherNotFree',
        'Teacher Not Available on Selected Date and Time'
      );
      res.redirect('/makeAppointment');
    }
    }
    
  });
})
router.get('/teacherAppointment', (req, res) =>
Appointment.find({tid: req.user._id, status: false}, function (err, x) {
  if (err) {
    console.log(err);
  } else {
    res.render("teacherAppointment", {  appointments: x });
  }
}))

router.get('/upcomingAppointment', (req, res) =>
Appointment.find({tid: req.user._id, status: true}, function (err, x) {
  if (err) {
    console.log(err);
  } else {
    res.render("upcomingAppointment", {  appointments: x });
  }
}))

router.get('/teacherAppointmentAccept/:id', (req, res) =>
Appointment.updateOne({ _id: req.params.id}, { status: true }, function (err, x) {
  if (err) {
    console.log(err);
  } else {

    res.redirect("/teacherAppointment");
  }
}))

router.get('/teacherAppointmentReject/:id', (req, res) =>
Appointment.deleteOne({_id: req.params.id}, function (err, x) {
  if (err) {
    console.log(err);
  } else {
    res.redirect("/teacherAppointment");
  }
}))

router.get('/addSubject', ensureAuthenticated, (req, res) =>{
  res.render("addSubject")
})
//this endpoint is to submit subject details by the admin
router.post('/addSubject',(req, res) =>{

  Subject.create({
    code: req.body.code,
    sem: req.body.sem,
    ccac: req.body.ccac,
    nccac: req.body.nccac,
    caw: req.body.caw,
    mtec: req.body.mtec,
    mtew: req.body.mtew,
    pc: req.body.pc,
    pw: req.body.pw,
    etew: req.body.etew,
    aw: req.body.aw,
});
 req.flash('teacherFree', 'Uploaded');
 res.redirect('/addSubject');
})
router.get('/marksPredict', (req, res) =>{
  Subject.find({},function (err, x) {
    if (err) {
      console.log(err);
    } else {
      res.render("marksPredict", {  sub: x });
    }
})
})
router.post('/marksPredict', (req, res) =>{
  let ep = req.body.ep //expected %
  let ans = {}
  console.log(req.body.code)
  Subject.find({code: req.body.code},function (err, x) {
    if (err) {
      console.log(err);
    } else {
      console.log(x)
      if (x[0].ccac>0){
        ans.ca = Math.ceil((60/100)*ep)
        ans.caEach = Math.ceil(ans.ca/x[0].ccac)
      }
      if (x[0].mtew>0){
        ans.mte = Math.ceil((40/100)*ep)
      }
      if (x[0].mtew==0){
        ans.mte = 0
      }
      if (x[0].etew>0){
        ans.ete = Math.ceil((70/100)*ep)
      }
      if (x[0].aw>0){
        ans.a = Math.ceil((5/100)*ep)
      }
      if (x[0].pc==0){
        ans.pc = 0
      }
      if (x[0].pc>0){
        ans.pc = Math.ceil((40/100)*ep)
      }
      console.log(ans)
      console.log(((25/60)*ans.ca)+((20/40)*ans.mte)+((50/70)*ans.ete)+ans.a)
      res.render("marksPredictResult", {  ans: ans });
    }
})
})
module.exports = router;
