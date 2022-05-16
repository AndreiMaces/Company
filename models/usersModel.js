const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose")
const findOrCreate = require('mongoose-findorcreate');
const dbURL = process.env.DATABASE_URL || 'mongodb://localhost:27017/Test';


mongoose.connect(dbURL);
const db = mongoose.connection;
db.on("open", () => { console.log("Database connected!") });

const userSchema = new Schema({
  email: String,
  password: String,
  facebookId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model('User', userSchema);

module.exports = User