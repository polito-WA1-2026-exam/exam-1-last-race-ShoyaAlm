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

const updateUserScore = (req, res) => {
    
    const user = req.user

    if(!user){
        return res.status(401).json({success: false, message:'Unauthorized access'})
    }

    const userId = user.id
    const currentHighestScore = user.highestScore || 0
    const latestScore = req.body.newScore


    const query = `UPDATE users SET highestScore = ? WHERE id = ?`

    db.run(query, [latestScore, userId], (err) => {
        
        if(err){
            console.error('Database update error: ', err.message);
            return res.status(500).json({success:false, message:err.message})
        }

        user.highestScore = latestScore

        return res.json({
            success: true,
            message:`User's highest score updated to ${latestScore}`,
            highestScore: latestScore
        })

    })

}

export default {login, logout, updateUserScore}