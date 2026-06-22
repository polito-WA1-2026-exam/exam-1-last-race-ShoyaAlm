import passport from '../Passport.js'

import db from '../db.js'


const login = (req, res) => {
    res.json({success:true, user:{
        id:req.user.id, 
        username: req.user.username, 
        highestScore: req.user.highestScore}})
}

const logout = (req, res, next) => {
    req.logout((err) => {
        if(err)
            return next(err)

        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            res.json({success:true, message:'successfully logged out'})
        })
    })
}





export default {login, logout}