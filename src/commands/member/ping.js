const { PREFIX } = require("../config");

module.exports = {
    name: 'ping',
    description: 'Verificar se Xaxado ta on',
    commands: ["ping"],
    usage: `${PREFIX}comando`,
    handle: async ({}) => {
         await sendReact("Pong! 🏓");
         await sendReply("Pong!");
        
    },
};