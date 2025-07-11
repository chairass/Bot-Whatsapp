// Importa funções utilitárias locais e constantes
const { extractDataFromMessage, baileysIs, download } = require(".");
const { BOT_EMOJI } = require("../config");
const fs = require ("fs"); // Módulo de sistema de arquivos do Node.js

// Exporta a função que carrega funções comuns, recebe socket e a mensagem como parâmetro
exports.loadCommonFunctions = ({socket, webMessage}) => {
    // Extrai dados úteis da mensagem recebida
    const {remoteJid, prefix, commandName, args, userJid, isReply, replyJid} = 
    extractDataFromMessage(webMessage);

    // Verifica o tipo de mídia da mensagem (imagem, vídeo ou figurinha)
    const isImage = baileysIs(webMessage, "image");
    const isVideo = baileysIs(webMessage, "video");
    const isSticker = baileysIs(webMessage, "sticker");

    // Função para baixar imagem recebida
    const downloadImage = async (webMessage, fileName) => {
        return await download(webMessage, fileName, 'image', 'png')
    };

    // Função para baixar figurinha recebida
    const downloadSticker = async (webMessage, fileName) => {
        return await download(webMessage, fileName, 'sticker', 'webp')
    };

    // Função para baixar vídeo recebido
    const downloadVideo = async (webMessage, fileName) => {
        return await download(webMessage, fileName, 'video', 'mp4')
    };

    // Envia uma mensagem de texto simples com o emoji padrão do bot
    const sendText = async (text) => {
        return await socket.sendMessage(remoteJid, {text: `${BOT_EMOJI}`})
    }

    // Envia uma resposta (reply) com emoji do bot + texto
    const sendReply = async (text) => {
        return await socket.sendMessage(
            remoteJid, 
            {text: `${BOT_EMOJI} ${text}`},
            {quoted: webMessage}
        );
    };

    // Reage a uma mensagem com um emoji
    const sendReact = async (emoji) =>{
        return await socket.sendMessage(remoteJid, {
            react: {
                text: emoji,
                key: webMessage.key,
            },
        });
    };

    // Reações pré-definidas
    const sendSucessReact = async () => {
        return await sendReact("✅");
    };

    const sendWaitReact = async () => {
        return await sendReact("✋🏽");
    };

    const sendWarningtReact = async () => {
        return await sendReact("⚠️");
    };

    const sendErrorReact = async () => {
        return await sendReact("🔴");
    };

    // Combina reações com mensagens de resposta
    const sendSucessReply = async (text) =>{
        await sendSucessReact();
        return await sendReply(`✅ Ta aqui corno(a) ${text}`);
    };

    const sendWaitReply = async (text) =>{
        await sendWaitReact();
        return await sendReply(`✋🏽 Tenha fé, estou fazendo ${text}`);
    };

    const sendWarningReply = async (text) =>{
        await sendWarningtReact();
        return await sendReply(`⚠️ Tem alguma coisa errada, hein ${text}`);
    };

    const sendErrorReply = async (text) =>{
        await sendErrorReact();
        return await sendReply(`🔴 Falho tenta dnv aí ${text}`);
    };

    // Envia figurinha a partir de um arquivo no sistema
    const sendStickerFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            sticker: fs.readFileSync(file),
        });
    };

    // Envia imagem a partir de um arquivo no sistema
    const sendImageFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            image: fs.readFileSync(file),
        });
    };

    // Retorna todas as funções e variáveis úteis
    return{
        socket,
        remoteJid,
        userJid,
        prefix,
        commandName,
        args,
        isReply,
        isImage,
        isVideo,
        isSticker,
        replyJid,
        webMessage,
        sendText,
        sendReply,
        sendStickerFromFile,
        sendImageFromFile,
        sendReact,
        sendSucessReact,
        sendWaitReact,
        sendWarningtReact,
        sendErrorReact,
        sendErrorReply,
        sendWaitReply,
        sendWarningReply,
        sendSucessReply,
        downloadImage,
        downloadSticker,
        downloadVideo,
    };
};
