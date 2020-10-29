const Discord = require('discord.js');

const client = new Discord.Client({ disableEveryone: true });

const fs = require('fs');

const config = require('./config/config.json');

client.functions = new Discord.Collection();

// login
let token;
const testTokenCfg = './config/test_token.json';
if (fs.existsSync(testTokenCfg)) {
  const testCfg = require(testTokenCfg);
  token = testCfg.test_token_cvl;
} else token = process.env.BOT_TOKEN_CVL;
client.login(token);

fs.readdir('./functions/', (err, files) => {
  if (err) console.error(err);

  let jsfiles = files.filter((f) => f.split('.').pop() === 'js');
  if (jsfiles.length <= 0) {
    console.log('No function(s) to load!');
    return;
  }

  console.log(`Loading ${jsfiles.length} function(s)...`);

  jsfiles.forEach((f, i) => {
    let probs = require(`./functions/${f}`);
    console.log(`    ${i + 1}) Loaded: ${f}!`);
    client.functions.set(probs.help.name, probs);
  });
  console.log(`Loaded ${jsfiles.length} function(s)!`);
});

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  // set bot player status
  config.setup.setupFunctions.forEach((FCN) => {
    client.functions.get(FCN).run(client, config);
  });
  client.user.setActivity('with #role-assignment');
});

client.on('messageReactionAdd', async (reaction, user) => {
  client.functions.get('EVENT_messageReactionAdd').run(client, reaction, user, config);
});
