const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const colors = require('colors');
var pjson = require('./package.json');

console.log(`Literally Media Profanity List - ${pjson.version}`);

let thirdPartySources = fs.readFileSync('./sources.txt', {encoding:'utf8', flag:'r'});
thirdPartySources = thirdPartySources.split("\n");

thirdPartySources.forEach((thirdPartySource, index) => {
    if (thirdPartySource.charAt(0) == '#') delete(thirdPartySources[index]);
});

console.log(thirdPartySources);

let literallySource = fs.readFileSync('./literally-words.txt', {encoding:'utf8', flag:'r'});
if (literallySource.trim() != '') {
    literallySource = literallySource.trim().split("\n");
} else {
    literallySource = [];
}

console.log(`Fetched Source: ./literally-words.txt - Found ${literallySource.length} words`);

let list = literallySource;

async function main() {
    await Promise.all(thirdPartySources.map(source => {
        let ext = path.extname(source);

        return fetch(source)
            .then(res => {
                if (ext == '.json') {
                    return res.json();
                }
                return res.text();
            })
            .then(body => {
                if (ext != '.json') {
                    body = body.trim().split("\n");
                }

                console.log(`Fetched Source: ${source} - Found ${body.length} words`);
    
                list = list.concat(body);
            });
    }))
        .then(() => {
            const finalList = [ ...new Set(list) ];

            fs.writeFileSync('final-list.json', JSON.stringify(finalList));
            fs.writeFileSync('final-list.txt', finalList.join('\n').trim());

            console.log(`Total entries after deduping: ${finalList.length} @ final-list.json`.green);
        });
}

main();





