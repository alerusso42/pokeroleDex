//SECTION - external libraries
const http = require('http');
const express = require('express');
const app = express();
const doc = require("jsdom");
const { JSDOM } = doc;
const url = require('url');
const fs = require('fs');
const path = require('path');

//SECTION - libft
let net = require('./net.js');
const string = require('./string.js');
let utils = Object.assign({}, net, string);

//SECTION - custom data structures
const types = require('./types.js');

module.exports = {http, url, fs, path, express, app, JSDOM, utils, types};