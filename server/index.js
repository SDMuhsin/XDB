//const express = require('express');
import express from 'express';
const app = express();
//const passport = require('passport');
import passport from 'passport';
import session from 'express-session';


//const session = require('express-session');
//const bcrypt = require('bcrypt');

const PORT = 3000;

// ------------------------- B MONGODB --------------------------- //
//const mongoose = require('mongoose');
import mongoose from 'mongoose';
const mongoDB = "mongodb+srv://digitalbits:impZcFV4KEuHhISC@cluster0.spwju.mongodb.net/DIGITALBITS?retryWrites=true&w=majority" ;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true},(err)=>{
    if(err){console.log(err)}
    else{
        console.log("Succesfully connected to mongo");
    }
});

// ------------------------- E MONGODB --------------------------- //
import {authRouter} from './routers/authentication/authentication.js';
//const authRouter = require('./routers/authentication/authentication');
app.use(express.json());
app.use(session({secret: "shhh",
    resave: true,
    saveUninitialized: true
}));

// ------------------------- B PASSPORT ------------------------- //
app.use(passport.initialize());
app.use(passport.session());
import passportInitilizer from './passport.config.js';
passportInitilizer(passport);
// ------------------------- E PASSPORT ------------------------- //


app.get('/', (req,res)=>{
    res.send("Hello"); 
})

import {xdbAccountsRouter} from './routers/digital-bits/accounts/accounts.js';
import { isLoggedIn } from './utility/isLoggedIn.js';
import {xdbAssetRouter} from './routers/digital-bits/assets/assets.js';
import { xdbOptionsRouter } from './routers/options/options.js';

app.use('/auth',authRouter);
app.use('/xdb/accounts', [isLoggedIn], xdbAccountsRouter);
app.use('/xdb/assets', [isLoggedIn], xdbAssetRouter);
app.use('/xdb/options', [isLoggedIn], xdbOptionsRouter);
app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`)
});