const mongoose = require('mongoose');
let Schema = mongoose.Schema;
require("dotenv").config();
const bcrypt = require('bcryptjs');
mongoose.connect('mongodb+srv://jchugh:L0DSJWm7XIlsw9CU@cluster0.cq72fof.mongodb.net/?retryWrites=true&w=majority')
//creating a new schema
const userSchema = new Schema({
    userName: String,
    password: String,
    email: String,
    loginHistory: [{ dateTime: { type: Date, default: Date.now }, userAgent: String }]
});

let User; // to be defined on new connection (see initialize)

//initialize function
module.exports.initialize = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      throw error;
    }
  };
  

//check user
function checkUser(userData) {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({ userName: userData.userName });
            try {
                if (users.length == 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                }
                const pswdMatch = await bcrypt.compare(
                    userData.password,
                    users[0].password
                );
                if (!pswdMatch) {
                    reject(`Incorrent Password for user: ${userData.userName}`);
                }
                if (users[0].loginHistory.length == 8) {
                    users[0].loginHistory.pop();
                }
                users[0].loginHistory.unshift({
                    dateTime: (new Date()).toString(), userAgent:
                        userData.userAgent
                });
                await User.updateOne(
                    { userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory }, }
                );
                resolve(users[0]);
            }
            catch (err) { reject(`There was an error verifying the user: ${err}`) }
        }
        catch (err) { reject(`Unable to find the user: ${userData.userName}`) }
    });
}

//register user
function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            return reject("Passwords do not match");
        }
        bcrypt.hash(userData.password, 10)
            .then((hash) => {
                userData.password = hash;
                let newUser = new User(userData);
                return newUser.save();
            })
            .then(() => { resolve(); })
            .catch((err) => {
                if (err.code === 11000) { reject("User Name already taken"); }
                else { reject(`There was an error encrypting the password: ${err}`); }
            });
    });
}

function ensureLogin(req, res, next) {
    if (!req.session.user) { res.redirect('/login'); }
    else { next(); }
}

module.exports = { ensureLogin, registerUser, checkUser }