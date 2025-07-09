const { verifyPrefix } = require("../middlewares");

exports.dynamicCommand = async (paramsHandler) => {
    const { commandName, prefix, sendWarningReply, sendErrorReply } = 
        paramsHandler;

    const {type, command} = findCommandImport(commandName);

    if (!verifyPrefix(prefix)){
        return;
    }
};