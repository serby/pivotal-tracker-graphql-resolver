const fetch = require('isomorphic-fetch')
const { stringify } = require('querystring')

const fetcher = token => async (id, label = '') => {
  const query = {
    limit: 10000
  }
  if (label) {
    query['with_label'] = label
  }
  return (await fetch(`https://www.pivotaltracker.com/services/v5/projects/${id}/stories?${stringify(query)}`, {
    headers: {
      'X-TrackerToken': token
    }
  })).json()
}
module.exports = fetcher
