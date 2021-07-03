//
// MODULES
//

const request = require('request');
const Config  = require('./config.json');

//
// CODING
//

function sendInvite(channelID, username, discriminator) {
    let data = JSON.stringify({"content":Config.inviteURL});

    request({
        url: `https://discord.com/api/v9/channels/${channelID}/messages`,
        method:'POST',
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length,
            "Authorization": Config.token
        },
        body: data
    }, function(err, res, body) {
        if(res.statusCode == 200) {
            console.log(`\x1b[90m[\x1b[92m!\x1b[90m] \x1b[97mThe discord server invite has been sent to ${username+"#"+discriminator}\x1b[0m`);
        };
    });
};

function getChannelID(userID) {
    let channelID     = "";
    let Username      = "";
    let Discriminator = "";

    request({
        url: "https://discord.com/api/v9/users/@me/channels",
        method:'GET',
        headers: {
            "Authorization": Config.token
        }
    }, function(err, res, body) {
        if(JSON.parse(body)) {
            JSON.parse(body).forEach(v => {
                v['recipients'].forEach(t => {
                    if(t.id == userID && v.type == 1) {
                        Discriminator = t.discriminator;
                        Username      = t.username;
                        channelID     = v.id;
                        return;
                    };
                });
            });
            sendInvite(channelID, Username, Discriminator);
        };
    });
};

function ConnectAPI() {
    request({
        url:"https://discord.com/api/v9/users/@me",
        method:'GET',
        headers: {
            "Authorization": Config.token
        }
    }, function(err, res, body) {
        if(JSON.parse(body)) {
            let e = (JSON.parse(body)['username']+"#"+JSON.parse(body)['discriminator']);
            process.title = "AFS W | by Sato. | "+e;
            return;
        };
    });
};

function WaitingForAccept(id, username, discriminator) {
    let Interval = setInterval(() => {
        request({
            url:"https://discord.com/api/v9/users/@me/relationships",
            method:'GET',
            headers: {
                "Authorization": Config.token
            }
        }, function(err, res, body) {
            if(JSON.parse(body)) {
                JSON.parse(body).forEach(e => {
                    if(e.type && e.type == 1) {
                        if(e.user.id == id) {
                            getChannelID(e.user.id);
                            console.log(`\x1b[90m[\x1b[92m!\x1b[90m] \x1b[97m${username+"#"+discriminator}'s friend request has been accepted\x1b[0m`);
                            clearInterval(Interval);
                        };
                    };
                });
            };
        });
    }, Config.refreshFriendRequest);
};

function searchingFriendRequest() {
    let i = 0;

    request({
        url:"https://discord.com/api/v9/users/@me/relationships",
        method:'GET',
        headers: {
            "Authorization": Config.token
        }
    }, function(err, res, body) {
        if(JSON.parse(body)) {
            JSON.parse(body).forEach(e => {
                if(e.type && e.type == 4) {
                    i++;
                    WaitingForAccept(e.user.id, e.user.username, e.user.discriminator);
                };
            });
            if(i == 0) {
                console.log("\x1b[90m[\x1b[91m!\x1b[90m] \x1b[97mNo pending friend request found\x1b[0m\n");
            } else {
                console.log("\x1b[90m[\x1b[92m!\x1b[90m] \x1b[97m"+i+" friend request(s) found\x1b[0m\n");
            };
        };
    });
};

async function StartScript() {
    console.clear();

    process.title = "AFS W | by Sato.";

    console.log("AFS W Loading...\x1b[0m");
    setTimeout(async () => {
        console.clear();
        console.log("\x1b[90m[\x1b[93m/\x1b[90m] \x1b[97mConnecting to Discord API...\x1b[0m");
        ConnectAPI();
        await console.log("\x1b[90m[\x1b[92m!\x1b[90m] \x1b[97mConnected!\x1b[0m");
        searchingFriendRequest();

        setInterval(() => {
            searchingFriendRequest();
        }, Config.refreshScript);
    }, 750);
};

//
// START SCRIPT
//

StartScript();