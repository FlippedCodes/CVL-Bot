const errHander = (err) => { console.error('ERROR:', err); };

// creates a embed messagetemplate for succeded actions
function messageSuccess(message, body, title) {
  const client = message.client;
  client.functions.get('FUNC_MessageEmbedMessage')
    .run(client.user, message.channel, body, title, 4296754, false)
    .then((msg) => msg.delete({ timeout: 10000 }));
}

// prepare output message and send it
function outputSuccessMessage(userName, message, nowAssigned, wasAssigned) {
  let body;
  // check case
  if (nowAssigned) body = `Assigned \`${nowAssigned}\` to you. Have fun!`;
  if (wasAssigned) body = `I removed \`${wasAssigned}\` from you.`;
  if (wasAssigned && nowAssigned) body = `I removed \`${wasAssigned}\` and assigned \`${nowAssigned}\` to you. Have fun!`;
  messageSuccess(message, body, userName);
}

async function getRoles(user, reaction) {
  const guild = reaction.message.guild;
  const roles = await guild.members.cache.find(({ id }) => id === user.id).roles;
  return roles;
}

// check if role is unique and return what role needs to be removed
function checkUniqueRole(wantsRole, uniqueRoles, userRoles) {
  let roleFound;
  const unique = uniqueRoles.find((roleID) => roleID === wantsRole);
  if (!unique) return roleFound;
  uniqueRoles.forEach((uniqueRole) => {
    const result = userRoles.cache.find(({ id }) => id === uniqueRole);
    if (result) roleFound = result;
  });
  return roleFound;
}

async function roleHandler(requestedRole, checkRoleNames, user, reaction) {
  const wantsRoleID = requestedRole.roleID;
  const wantsRoleName = requestedRole.name;
  // get user roels object to interact with API
  const userRoles = await getRoles(user, reaction);
  const sameRole = userRoles.cache.find(({ id }) => id === wantsRoleID);
  let alreadyAssignedUnique;
  // check if user already has role
  if (sameRole) {
    userRoles.remove(wantsRoleID);
    return outputSuccessMessage(user.tag, reaction.message, null, wantsRoleName);
  }
  // get unique role already assigned
  alreadyAssignedUnique = checkUniqueRole(wantsRoleID, checkRoleNames, userRoles);
  // check if unique role is assigned and remove it, bevore giving
  if (alreadyAssignedUnique) {
    userRoles.remove(alreadyAssignedUnique);
  }
  // add desiered role
  userRoles.add(wantsRoleID);
  let wasAssigned;
  if (alreadyAssignedUnique) wasAssigned = alreadyAssignedUnique.name;
  return outputSuccessMessage(user.tag, reaction.message, wantsRoleName, wasAssigned);
}

module.exports.run = async (client, reaction, user, config) => {
  const roleRequestConf = config.setup.roleRequest;
  if (reaction.message.channel.id !== roleRequestConf.channelID) return;
  // check name with the reaction name
  const requestedRole = roleRequestConf.roles.find((emojiEntry) => emojiEntry.emoji === reaction.emoji.name);
  if (requestedRole) await roleHandler(requestedRole, roleRequestConf.unique, user, reaction);
  reaction.users.remove(user);
};

module.exports.help = {
  name: 'FUNC_userRoleRequest',
};
