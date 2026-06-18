import express from 'express'
const router = express.Router()

import passport from '../Passport.js'

import controllers from '../controllers/controllers.js'

router.post('/login', passport.authenticate('local'), controllers.login)
router.post('/logout', controllers.logout)
router.put('/updateScore', controllers.updateUserScore)
// router.post('/scores', controllers.logout)


// settiing up one for getting the users scores as well

export default router