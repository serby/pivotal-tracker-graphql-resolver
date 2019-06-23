# Pivotal Tracker Graphql Resolver

[![Greenkeeper badge](https://badges.greenkeeper.io/serby/pivotal-tracker-graphql-resolver.svg)](https://greenkeeper.io/)

Graphql Resolver that interfaces with the Pivotal Tracker Rest API

## Setup

Install dependencies

```
yarn install
```

## Run

Currently there are two functions:

### Pivotal Tracker to Markdown

TOKEN=<API_TOKEN> PROJECT_ID=<PROJECT_ID> node markdowner

### Tag Report

Sums the total number of points in each tag.

TOKEN=<API_TOKEN> PROJECT_ID=<PROJECT_ID> node app

## Linting

Linting is done using eslint with [standard rules](https://github.com/feross/standard).

To run the inter do:

```
yarn qa:lint
```

## Testing

Runs all the automated QA tools and `jest` runs all tests.

```
yarn test
```
