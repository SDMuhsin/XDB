import express from 'express';
var router = express.Router()
import {User} from '../../models/user_account.js';
import bcrypt from 'bcrypt';
import passport from 'passport';

import {isLoggedIn} from '../../utility/isLoggedIn.js';


router.use(function timeLog (req, res, next) {
  console.log('[AUTH ROUTER]');
  next()
})
router.post('/login',
    passport.authenticate("local"),
    (req,res)=>{
        res.json(req.user);
});

router.post('/signup', async  (req, res) => {
    console.log(" [SIGNUP]")
    req.body.password =await bcrypt.hash(req.body.password,10);
    let user = await User.findOne({email:req.body.email}).exec().catch(e => console.log(e));
    console.log(user);
    if(user){ res.status(400).json({msg:"User exists"})}
    else{
        let user2 = new User(req.body);
        let re = await user2.save().catch(e=>res.status(500).json(e));
        //user2.save().then(a=>{res.status(200).json(a);}).catch(e=>res.status(500).json(e));
        res.status(200).json(re);
    }
})

router.get('/authcheck', isLoggedIn, (req,res)=>{
    res.status(200).send("yes");
} )
export {router as authRouter};