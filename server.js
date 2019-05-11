let express = require('express')
let request = require('request')
let querystring = require('querystring')

let app = express()

// hardcoded localhost RedirectURI
let redirect_uri = process.env.REDIRECT_URI || 'http://localhost:8888/callback'
// 04.05 stored the beginning of the Spotify Accounts url into a variable to reduce repetition of url writing in code
let baseURL = 'https://accounts.spotify.com/'

app.get('/login', function(req, res) {
  res.redirect(baseURL + 'authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-library-modify playlist-modify-private user-read-private user-read-email playlist-modify-public playlist-read-private',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: baseURL + 'api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token
    // hardcoded react localhost URI
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000'
    res.redirect(uri + '?access_token=' + access_token)
  })
})

let port = process.env.PORT || 8888
console.log(`Listening on port ${port}. Go to /login to initiate authentication flow.`)
app.listen(port)