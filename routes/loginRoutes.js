require('dotenv').config();
const express = require("express");
const passport = require("passport");
const router = express.Router();
const userModel = require('../models/usersModel.js');


router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/secrets', passport.authenticate('facebook', { failureRedirect: '/login', successRedirect: '/' }));

router.get('/register', function (req, res) {
    res.render('../views/register');
});

router.post('/register', async function (req, res) {
    const { username, password } = req.body;
    const newUser = new userModel({ username, password });
    await newUser.save();
    console.log(newUser);
    res.redirect('/login');
});

router.get('/login', function (req, res) {
    res.render('../views/login');
});

router.post('/login/local', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' }));

router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;