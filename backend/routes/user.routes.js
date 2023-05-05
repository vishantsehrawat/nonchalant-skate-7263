const express = require("express");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/user.model");
const { redisClient } = require("../configs/redis");
const { BlacklistModel } = require("../models/blacklist.model");
require("dotenv").config();

userRouter = express();

userRouter.use(express.json());

//register route
userRouter.post("/register", async (req,res) => {
    const userData = req.body;
    // console.log(userData)
    try {
        const hash = bcrypt.hashSync(userData.password, 4);
        userData.password = hash;
        const user = new UserModel(userData);
        await user.save();
        res.status(200).send({ msg: "new user addded" })
    } catch (error) {
        console.log(error)
        res.status(400).send({ msg: "cannot add new user " })
    }
})

//login route 

userRouter.post("/login", async (req, res) => {
    const user = req.body;
    console.log(user);
    try {
        const myUser = await UserModel.findOne({ email: user.email })
        // console.log("🚀 ~ file: user.routes.js:34 ~ userRouter.post ~ myUser:", myUser)
        try {
            if (myUser) {
                bcrypt.compare(user.password, myUser.password, function (err, result) { // eslint-disable-line no-unused-vars
                    // temporarily using expire time *60 for usability. Ignore it if I forgot to remove the extra 60
                    var token = jwt.sign({ userId: myUser._id }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
                    var refreshToken = jwt.sign({ userId: myUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "24d" });
                    //using redis for storing the tokens //working 
                    redisClient.set("jwttoken", token)
                    redisClient.set("refreshtoken", refreshToken)
                    res.status(200).send({ msg: "User logged in", token, refreshToken })
                });
            }
        } catch (error) {
            console.log(error)
            res.status(400).send(error.message)
        }
    } catch (error) {
        console.log("🚀 ~ file: user.routes.js:54 ~ userRouter.post ~ error:", error)
        console.log(error)
    }
})



// logout 
userRouter.post("/logout", async (req, res) => {
    const token = await redisClient.get("jwttoken")
    // console.log("🚀 ~ file: user.routes.js:66 ~ userRouter.post ~ token:", token)
    // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ2aXNoYW50QGdtYWlsLmNvbSIsImlhdCI6MTY4MzAyMTkxMH0._0qh7J3lvLuhBDckqEyW5sRtLaOSdWa2rm0rELhc12E"

    try {
        const blacklist = new BlacklistModel({ token: token })
        await blacklist.save();
        res.status(200).send({ msg: "logged out " })
    } catch (error) {
        console.log(error)
        res.status(400).send({ msg: "cannot logout " })
    }
})

// route to get new token using refresh token 
// we will hit this route from the frontend 
userRouter.get("/newtoken", (req, res) => {
    // console.log("new route hit ")
    const refreshToken = req.headers.authorization;
    // console.log("🚀 ~ file: user.routes.js:74 ~ userRouter.get ~ refreshToken:", refreshToken)

    try {
        var decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        if (decoded) {
            var token = jwt.sign({ userId: decoded.userId }, process.env.TOKEN_SECRET, { expiresIn: "7d" });
            redisClient.set("jwttoken", token)
            res.send({ msg: "New token generated ", token })
        }

    } catch (error) {
        console.log(error)
        res.send(error.message)
    }
})
module.exports = {
    userRouter
}
