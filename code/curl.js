const lib = require('./lib.js');
const dataPath = '../data/v3.0/';
let out = "";

function getHtml (path) 
{
    const fd = lib.fs.readFileSync(path);
    const dom = new lib.JSDOM(fd);
    return (dom);
}

lib.app.listen(8080, "0.0.0.0");

lib.app.get("/", tutorial);

lib.app.get("/*splat", (req, res) =>
{
    out = "";
    const dom = getHtml("./code/index.html");
    const doc = dom.window.document;
    let isCurl = false;
    if (req.headers['user-agent'].includes("curl") == true)
        isCurl = true;
    console.log(req.headers['user-agent']);
    let url = lib.url.parse(req.url).pathname;
    let dir = lib.utils.urlDir(url);
    let arg = lib.utils.urlArg(url);
    let dataName = arg.replaceAll("/", "");
    let dataType = dir.replaceAll("/", "");
    write(dir + "\n", isCurl, res);
    write(dataName + "\n", isCurl, res);
    try 
    {
        search(dataName, dataType, isCurl);
    }
    catch (err)
    {
        write(dataType + " " + dataName + " not found.");
        return (res.status(404).end("info: " + err + "\n"));
    }
    if (isCurl == true)
        res.end(out);
    else
    {
        doc.getElementById("test").innerHTML = out;
        res.send(dom.serialize());
    }
});


function tutorial(req, res)
{
    out = "";
    const dom = getHtml("./code/index.html");
    const doc = dom.window.document;
    let isCurl = req.headers['user-agent'].includes("curl");
    let msgCurl = "\
locations list:\n\
/: show this message\n\
/Abilities: show Abilities info\n\
/Items: show Items info\n\
/Moves: show Moves info\n\
/Natures: show Natures info\n\
/Pokedex: show pokemon info\n\
\n\
Example: http://localhost:8080/Pokedex/Absol\n\
";
    let msgHtml = "\
locations list:<br>\
/: show this message<br>\
/Abilities: show Abilities info<br>\
/Items: show Items info<br>\
/Moves: show Moves info<br>\
/Natures: show Natures info<br>\
/Pokedex: show pokemon info<br>\
<br>\
Example: http://localhost:8080/Pokedex/Absol<br>\
";
    if (isCurl)
        res.send(msgCurl);
    else
    {
        doc.getElementById("test").innerHTML = msgHtml;
        res.send(dom.serialize());
    }
}

function search(dataName, dataType, isCurl)
{
    pkmn = require('../data/v3.0/' + dataType + '/' + dataName + ".json");
    let special = "";
    for (let key in pkmn)
    {
        if (includesOneOf(key, "Ability", "Name", "Type", "Evolutions", "Move") != "")
            special = key;
        printData(pkmn[key], key, special, isCurl);
        special = "";
        if (isCurl)
            write("\n");
        else
            write("<br>");
    }
}

//doc.getElementById("output").innerHTML = "";

/**
 * checks if one on the strings is present in the source string
 * @param {str} str  the source string 
 * @param {str} ... one or more string to compare
 * @returns {number} the first string found if a match exists, else ""
 */
function includesOneOf(str)
{
    for (let i = 1; i != arguments.length; i++)
    {
        if (str.includes(arguments[i]) == true)
            return (arguments[i]);
    }
    return ("");
}

function printData(data, key, special, isCurl)
{
    if (typeof(data) != "object")
    {
        let output = "";

        if (special != "")
        {
            if (isCurl)
                output = "\033[32m" + data + "\033[0m";
            else
                output = data;
        }
        else
            output = data;
        write(key + ":" + output);
    }
    else
    {
        for (let x in data)
        {
            printData(data[x], x, special, isCurl);
            write("|");
        }
    }
}

function write(msg)
{
    out += msg;
}
//doc.getElementById("list")