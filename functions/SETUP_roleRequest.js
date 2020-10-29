/* eslint-disable no-restricted-syntax */
const { MessageEmbed } = require('discord.js');

async function buildEmbed(config, roleData) {
  const embed = new MessageEmbed();
  await roleData.forEach(async (reaction) => {
    await embed.addField(reaction.name, reaction.emoji, true);
  });
  const result = embed
    .setTitle('Rolerequest')
    .setDescription('Click on the reactions to get the roles!');
  return result;
}

async function postReactions(message, roleData) {
  await roleData.forEach(async (reaction) => {
    await message.react(await reaction.emoji);
  });
}

module.exports.run = async (client, config) => {
  const roleRequest = config.setup.roleRequest.channelID;
  console.log(`[${module.exports.help.name}] Setting up rolerequest in the channel ${roleRequest}...`);
  const roleRequestChannel = await client.channels.cache.get(roleRequest);
  if (!roleRequestChannel) return console.error(`[${module.exports.help.name}] The channel with the ID ${roleRequest} doesn't exist and is going to be skipped!`);
  roleRequestChannel.bulkDelete(10)
    .catch((err) => console.log('ERROR:', err));
  const roleData = config.setup.roleRequest.roles;
  let embed = await buildEmbed(config, roleData);
  roleRequestChannel.send({ embed })
    .then(async (message) => postReactions(message, roleData));
  await console.log(`[${module.exports.help.name}] Done setting up rolerequest!`);
};

module.exports.help = {
  name: 'SETUP_roleRequest',
};
