const http = require('http');
const express = require('express');
const app = express();
const doc = require("jsdom");
const { JSDOM } = doc;
const url = require('url');
const fs = require('fs');
const path = require('path');
let net = require('./net.js');
let string = require('./string.js');

let utils = Object.assign({}, net, string);
module.exports = {http, url, fs, path, express, app, JSDOM, utils};