// to use our .env file variables, we must use this command
require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

// lets our app use JSON from the body that gets passed from a request
app.use(express.json());

app.get("/", (req, res) => {
  res.send("authentication Server");
});

// this is bad since everytime your server restarts it would be emptied out but its just to show you an example instead of creating an entire DB to store them
// gathers all the refreshTokens that you created
let refreshTokens = [];

app.post("/token", (req, res) => {
  // usually you would want to store this in a database or Redis cache but for this example, we would store it in a variable called refreshTokens
  // refreshToken is the refresh token that was sent to us.
  const refreshToken = req.body.token;

  // Difference between 401 and 403 error messages.
  // 401: Unauthorized. Lacks authentic credentials
  // 403: Forbidden. The server understood the request but refused to authorize it. The server considers them insufficient to grant access.

  if (refreshToken === null) return res.sendStatus(401);

  // this checks if that refresh token that we received is still valid? Have we removed it or is it still good?
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    // we can't simply pass user since it would contain of other user information. so we only get the name
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken: accessToken });
  });
});

// usually you gotta delete them in a database but since we stored it in a local variable array, called refreshTokens, it is much easier
app.delete('/logout', (req, res) => {
  // filters the token that we gave it
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

// autheticate the users so only they have access to our posts information
app.post("/login", (req, res) => {
  // Authenticate User FIRST before letting them through
  // this tutorial doesn't go over Authetication so you must add it manually before the cosnt username
  // insert authentication protcol HERE
  // refer to this tutorial: https://www.youtube.com/watch?v=Ud5xKCYQTjM

  // after authentication...
  const username = req.body.username;

  const user = { name: username };

  // generates access token using the user
  const accessToken = generateAccessToken(user);

  // we want to manually handle these tokens so we don't put an expire on it
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

  refreshTokens.push(refreshToken);

  // the access token would be created and it would have the users information saved inside of it
  res.json({ accessToken: accessToken, refreshToken: refreshToken });
});

// creating a JWT token
// takes a payload like a user object
// takes a signature/secret key to serialize our user
// adds an expiresIn to make it expire
function generateAccessToken(user) {
  // expiresIn should be whatever fits your use case
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

app.listen(9000);
