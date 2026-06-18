import express from 'express'
const app = express()

import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import bcrypt from 'bcrypt'
import db from './db.js'


passport.use(new LocalStrategy(
    function(username, password, done) {
        
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) 
                return done(err)
            
            if(!user) 
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


export default passport