const express = require('express')
const app = express()

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const db = require('./db')


passport.use(new LocalStrategy(
    function(username, password, done) {
        
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) 
                return done(err)
            
            if(!err) 
                return done(null, false, {message:'incorrect username'})
            
            try {
                const match = await bcrypt.compare(password, user.password_hash)
                if(!match)
                    return done(null, false, {message:'wrong password'})
    
                return done(null, user)
            
            } catch (error) {
                return done(error)
            }
        
        })
    }
))


passport.serializeUser((user, done) => {
    done(null, user.id)
})


passport.deserializeUser((id, done) => {
    db.get('SELECT id FROM users WHERE id = ?', [id], (err, row) => {
        done(err, row);
    })
})


module.exports = passport