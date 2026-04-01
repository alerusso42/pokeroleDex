const http = require('http');
const express = require('express');
const app = express();
const doc = require("jsdom");
const { JSDOM } = doc;
const url = require('url');
const fs = require('fs');
const path = require('path');
const utils = require('./utils.js');

module.exports = {http, url, fs, path, express, app, JSDOM, utils};