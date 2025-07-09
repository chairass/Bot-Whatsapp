const { PREFIX } = require("../config");

module.exports = {
    name: 'comando',
    description: 'Descrição do comando',
    usage: `${PREFIX}comando`,
    handle: async ({}) => {
        // Lógica do comando aqui
    },
};