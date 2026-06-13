// imports
import express from "express";

// init express
const app = new express();
const port = 3001;

app.get('/', (req, res) => {
  res.status(200).json({msg:'Homepage'})
})

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});