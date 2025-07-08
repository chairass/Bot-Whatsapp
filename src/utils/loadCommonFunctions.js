const { extractDataFromMessage, baileysIs, download } = require(".");
const { BOT_EMOJI } = require("../config");
const fs = require ("fs");

exports.loadCommonFunctions = ({socket, webMessage}) => {
    const {remoteJid, prefix, commandName, args, userJid, isReply, replyJid} = 
    extractDataFromMessage(webMessage);

    const isImage = baileysIs(webMessage, "image");
    const isVideo = baileysIs(webMessage, "video");
    const isSticker = baileysIs(webMessage, "sticker");

    const downloadImage = async (webMessage, fileName) => {
        return await download(webMessage, fileName, 'image', 'png')
    };

    const downloadSticker = async (webMessage, fileName) => {
        return await download(webMessage, fileName, 'sticker', 'webp')
    };

    const downloadVideo = async (webMessage, fileName) => {
        return await download(webMessage, fileName, 'video', 'mp4')
    };

    const sendText = async (text) => {
        return await socket.sendMessage(remoteJid, {text: `${BOT_EMOJI}`})
    }

    const sendReply = async (text) => {
        return await socket.sendMessage(
            remoteJid, 
            {text: `${BOT_EMOJI} ${text}`},
            {quoted: webMessage}
        );
    };

    const sendReact = async (emoji) =>{
        return await socket.sendMessage(remoteJid, {
            react: {
                text: emoji,
                key: webMessage.key,
            },
        });
    };

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

    const sendStickerFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            sticker: fs.readFileSync(file),
        });
    };

    const sendImageFromFile = async (file) => {
        return await socket.sendMessage(remoteJid, {
            image: fs.readFileSync(file),
        });
    };

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