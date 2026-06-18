import express from "express";
import session from "express-session";
import passport from "./Passport.js";

const app = new express();
const port = 3001;

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

import router from './routes/route.js'
import db from './db.js'

app.use(session({
  secret: 'game-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 24*60*60*1000}
}))

app.use(passport.initialize())
app.use(passport.session())


app.use('/api', router)


app.use((err, req, res, next) => {
  console.log('error: ', err);
  res.status(500).json({error: 'interval server error'})
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});