const pkmn = require('../data/v3.0/Pokedex/Absol.json');
const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');

module.exports = {pkmn, http, url, fs, path};