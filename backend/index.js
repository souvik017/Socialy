import express from "express";

const app = express();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running at port : ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
  });