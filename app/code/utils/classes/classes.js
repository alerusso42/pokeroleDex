// @ts-check
const Server = require("./Server").Server;
const Client = require("./Client").Client;
const dataList = require("./DataList").dataList
const enumAuth = require("../enums").enumAuth;
const {dataPath, metaDataPath, questDataPath} = require("../macro");

module.exports = {Server, Client, dataList, enumAuth, questDataPath, dataPath, metaDataPath};