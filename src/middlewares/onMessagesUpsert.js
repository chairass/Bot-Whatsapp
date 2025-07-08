const { loadCommonFunctions } = require(".../utils/loadCommonFunctions");

exports.onMessagesUpsert = async ({socket, messages}) => {
    if(!messages.length){
        return;
    }

    const webMessage = messages[0];
    const commonFunctions = loadCommonFunctions ({socket, messages});

    await dynamicCommand(commonFunctions);
};