const { verifyPrefix, hasTypeOrCommand } = require("../middlewares");
const { checkPermission } = require("../middlewares/checkPermission");
const { 
    DangerError,
    WarningError,   
    InvalidParameterError, 
} = require("../errors")

// Importa função utilitária para localizar e carregar o comando com base no nome
const { findCommandImport } = require("../utils");

// Exporta a função principal responsável por executar comandos dinamicamente
exports.dynamicCommand = async (paramsHandler) => {
    // Desestrutura os parâmetros necessários
    const { commandName, prefix, sendWarningReply, sendErrorReply } = 
        paramsHandler;

    // Busca o tipo e a referência do comando com base no nome    
    const {type, command} = findCommandImport(commandName);

    // Verifica se o prefixo é válido e se o tipo e comando foram encontrados
    if (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command })) {
        return;
    }

    // Verifica se o usuário tem permissão para executar o comando
    if (! await checkPermission({ type, ...paramsHandler })) {
        return sendWarningReply("Você não tem permissão para executar este comando.");
    }

    try {
        // Executa o comando, passando todos os parâmetros e o tipo
        await command.handle({...paramsHandler, type });
    }catch (error) {
        console.log(error);// Exibe o erro no console (útil para debug)

        // Trata erros específicos com mensagens customizadas
        if (error instanceof InvalidParameterError)  {
            await sendWarningReply(`Paramentos inválidos! ${error.message}`);
        }else if (error instanceof WarningError) {
         await sendWarningReply(error.message);
        }else if (error instanceof DangerError) {
            await sendErrorReply(error.message);
        }else { // Trata qualquer outro erro não previsto
            await sendErrorReply(
                `Ocorreu um erro inesperado ${command
                .name}:! O desenvolvedor foi notificado. Por favor, tente novamente mais tarde.
                ⚠️ *Detalhes: ${error.message}*`
            );                                 
        }
    } 
};