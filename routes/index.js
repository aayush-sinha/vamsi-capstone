const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Ques = require('../models/ques');
const Time = require('../models/time');
const multer = require('multer');
const User = require('../models/User');
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
res.render('teacher_dashboard', {
  user: req.user
})
);

router.get('/', (req, res) =>
res.render('test')
);

router.get("/ques_download", function (req, res) {
  Ques.find({}, function (err, ques) {
    if (err) {
      console.log(err);
    } else {
      console.log(ques)
      res.render("ques_download", { ques: ques });
    }
  });
});

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
  const name = req.body.name
  const date = new Date(req.body.date)
  const slot = req.body.slot
 
  Time.find({timeid: name}, function (err, tt) {
    if (err) {
      console.log(err);
    } 
    else {
      //console.log(tt);
      let json = csvToJson.getJsonFromCsv("uploads/"+tt[0].file);
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

module.exports = router;
