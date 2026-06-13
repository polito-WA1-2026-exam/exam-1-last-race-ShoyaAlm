const passport = require('../Passport')


app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({success:true, user:{id:req.user.id, username: req.user.username}})
})


app.post('/api/logout', (req, res, next) => {
    req.logout((err) => {
        if(err)
            return next(err)

        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            res.json({success:true, message:'successfully logged out'})
        })
    })
})