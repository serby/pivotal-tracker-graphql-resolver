const fetch = require('isomorphic-fetch')
const pMemoize = require('p-memoize')
const memFetch = pMemoize(fetch, { maxAge: 1000 })

const fetcher = async url => {
  return (await memFetch(url, {
    headers: {
      'User-Agent': 'Clock (paul.serby@clock.co.uk)',
      'Authorization': 'Basic ' + Buffer.from('paul.serby@clock.co.uk:gKAxe!PR').toString('base64')
    }
  })).json()
}
module.exports = fetcher
