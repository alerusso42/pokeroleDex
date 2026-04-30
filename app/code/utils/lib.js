//SECTION - external libraries
const http = require('http');
const express = require('express');
const app = express();
const doc = require("jsdom");
const { JSDOM } = doc;
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypt = require('bcrypt');

//SECTION - libft
let net = require('./net.js');
const string = require('./string.js');
const json = require('./json.js');
const utils = {
  ...require('./net.js'),
  ...require('./string.js'),
  ...require('./json.js'),
  net, string, json
};

//SECTION - custom data structures
const types = require('./types.js');

module.exports = {http, url, fs, path, crypt, express, app, JSDOM, utils, types};