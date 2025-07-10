console.log("✔️ onMessagesUpsert carregado com caminho correto");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { dynamicCommand } = require("../utils/dynamicCommand");

exports.onMessagesUpsert = async ({socket, messages}) => {
    if(!messages.length){
        return;
    }

    const webMessage = messages[0];
    const commonFunctions = loadCommonFunctions ({socket, messages});

    await dynamicCommand(commonFunctions);
};