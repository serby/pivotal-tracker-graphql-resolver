const fetch = require('isomorphic-fetch')
const fetcher = token => async id => {
  return (await fetch(`https://www.pivotaltracker.com/services/v5/projects/${id}`, {
    headers: {
      'X-TrackerToken': token
    }
  })).json()
}
module.exports = fetcher
