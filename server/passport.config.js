import bcrypt from 'bcrypt';
import {User} from './models/user_account.js';

import passportLocal from 'passport-local';
const LocalStrategy = passportLocal.Strategy
async function passportInitilizer(passport){
    
    ;
    passport.use(
        new LocalStrategy({
            usernameField: "email",
            passwordField: "password"
        },
    
        async (email,password,done) => {
            let user = await User.findOne({
                        email:email
                    }
                ).catch(e=>console.log(e));
    
            console.log(`Email : ${email}, Password : ${password}`);
            console.log(user);
            if(!user){
                return done(null,false,{message:"User does not exist"});
            }
            
            if(await bcrypt.compare(password,user.password)){
                console.log("Password comparison successful");
                return done(null,user);
            }else{
                return done(null,false,{message:"Invalid password"});
            }
        }
        )
    );
    passport.serializeUser(function(user, done) {
        console.log("Serializer, user : ", user);
        done(null, user);
     });
    passport.deserializeUser( function(user, done) {
        User.findById(user._id, function (err, user) {
            done(err, user);
        }
        );
    });
}

export default passportInitilizer;