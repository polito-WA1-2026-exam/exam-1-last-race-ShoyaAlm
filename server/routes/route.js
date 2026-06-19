import express from 'express'
const router = express.Router()

import passport from '../Passport.js'

import controllers from '../controllers/controllers.js'

router.post('/login', passport.authenticate('local'), controllers.login)
router.post('/logout', controllers.logout)

router.get('/scores', controllers.getUsersScores)
router.get('/user', controllers.getCurrentUser)

router.put('/updateScore', controllers.updateUserScore)


export default router