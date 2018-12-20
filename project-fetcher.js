const fetch = require('isomorphic-fetch')
const fetcher = token => async id => {
  const membership = await (await fetch(`https://www.pivotaltracker.com/services/v5/projects/${id}/memberships`, {
    headers: {
      'X-TrackerToken': token
    }
  })).json()

  return {
    membership: membership.map(membership => ({ username: membership.person.username, id: membership.person.id })),
    ...await (await fetch(`https://www.pivotaltracker.com/services/v5/projects/${id}`, {
      headers: {
        'X-TrackerToken': token
      }
    })).json()
  }
}
module.exports = fetcher
