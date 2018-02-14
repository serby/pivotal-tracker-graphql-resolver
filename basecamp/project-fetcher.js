const basecampfetch = require('./fetcher')

const fetcher = account => async id =>
  basecampfetch(`https://basecamp.com/${account}/api/v1/projects${id ? '/' + id : ''}.json`)

module.exports = fetcher
