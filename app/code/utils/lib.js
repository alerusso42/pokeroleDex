//SECTION - external libraries
import http from "node:http";
import express from "express";
import jsdom from "jsdom";
import url from "node:url";
import fs from "node:fs";
import path from "node:path";
import crypt from "bcrypt";
import * as net from "./net.js";
import * as string from "./string.js";
import * as json from "./json.js";
import * as enums from "./enums.js";
import * as macro from "./macro.js";
import * as data from "./data.js";
import * as types from "./classes/classes.js";

const app = express();
const { JSDOM } = jsdom;

//SECTION - libft
const utils = {
  ...net,
  ...string,
  ...json,
  net, string, json
};

export {http, url, fs, path, crypt, express, app, JSDOM, utils, types, data, macro, enums};
