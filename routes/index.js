const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
//router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

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

module.exports = router;
