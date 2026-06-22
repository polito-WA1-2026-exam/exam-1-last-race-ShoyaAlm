import express from 'express'
const router = express.Router()

import passport from '../Passport.js'

import authentication from '../controllers/authentication.js'
import user from '../controllers/user.js'
import game from '../controllers/game.js'


router.post('/login', passport.authenticate('local'), authentication.login)
router.post('/logout', authentication.logout)

router.get('/scores', user.getUsersScores)
router.get('/user', user.getCurrentUser)
router.put('/updateScore', user.updateUserScore)

router.get('/game-details', game.getGameDetails)
router.get('/map-layout', game.getMap)
router.post('/submit-route', game.submitRoute)


export default router