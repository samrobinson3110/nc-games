# Northcoders House of Games API

## Hosting

The hosted version of the project can be found [here](https://worried-deer-jacket.cyclic.app)

## Project Summary

The project is a back-end server which has various endpoints allowing clients to query and change data within a number of databases for game reviews. The data is accessed from 4 database tables including data on game reviews, review comments, users and game categories.

The endpoint /api will provide a list of all available endpoints and what information the require and provide.

## Instructions

### Cloning the repository

The repo can be forked and cloned from the following address : https://github.com/samrobinson3110/nc-games/

### Installing dependancies

To install dependances using npm run the following command:

```
npm install
```

### Setting up the local database

To seed the local database run the following two commands:

```
npm run setup-dbs
```

then

```
npm run seed
```

### Running tests

To run tests using jest, run the following command:

```
npm test
```

## Connecting to the databases

To connect to the test database add a .env.test file containing

```
PGDATABASE=nc_games_test
```

and to connect to the regular development database add a .env.development file containing

```
PGDATABASE=nc_games
```

## Project requirements

Node.js version 16.0.0 or newer

Postgres version 14.5 or newer
