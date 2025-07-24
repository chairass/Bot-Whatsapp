const { verifyPrefix, hasTypeOrCommand } = require("../middlewares");
const { checkPermission } = require("../middlewares/checkPermission");
const { 
    DangerError,
    WarningError,   
    InvalidParameterError, 
} = require("../errors")

const { findCommandImport } = require(".");

exports.dynamicCommand = async (paramsHandler) => {
    const { commandName, prefix, sendWarningReply, sendErrorReply } = 
        paramsHandler;

    const {type, command} = findCommandImport(commandName);

    if (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command })) {
        return;
    }

    if (! await checkPermission({ type, ...paramsHandler })) {
        return sendWarningReply("Você não tem permissão para executar este comando.");
    }

    try {
        await command.handle({...paramsHandler, type });
    }catch (error) {
        console.log(error);

        if (error instanceof InvalidParameterError)  {
            await sendWarningReply(`Paramentos inválidos! ${error.message}`);
        }else if (error instanceof WarningError) {
         await sendWarningReply(error.message);
        }else if (error instanceof DangerError) {
            await sendErrorReply(error.message);
        }else { 
            await sendErrorReply(
                `Ocorreu um erro inesperado ${command
                .name}:! O desenvolvedor foi notificado. Por favor, tente novamente mais tarde.
                ⚠️ *Detalhes: ${error.message}*`
            );                                 
        }
    } 
};