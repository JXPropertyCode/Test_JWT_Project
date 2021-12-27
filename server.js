// to use our .env file variables, we must use this command
require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

// lets our app use JSON from the body that gets passed from a request
app.use(express.json());

const posts = [
  {
    username: "Johnny",
    title: "Post 1",
  },
  {
    username: "Jim",
    title: "Post 2",
  },
];

app.get('/', (req, res) => {
    res.send("server")
})

// as a reminder, authenticateToken is a middleware
app.get("/posts", authenticateToken, (req, res) => {
  // returns the posts that the user has access to
  res.json(posts.filter((post) => post.username === req.user.name));
});

// Authenticate our access token using middleware
// get the token that they send us
// verify that its the correct user
// return the user into app.get('/posts')
function authenticateToken(req, res, next) {
  // we get the token from the header called Bearer
  // the format is Bearer TOKEN
  const authHeader = req.headers["authorization"];

  // get our token portion so we split Bearer and TOKEN and only get the TOKEN
  // we also gotta confirm that there is an authHeader so we can split it and get the token
  const token = authHeader && authHeader.split(" ")[1];

  // this is to reject the request if the user didn't send us a token
  if (token === null) return res.sendStatus(401);

  // this is so we can decode the access token and see if its valid
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // tells user that the token is no longer valid
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

app.listen(8000);
