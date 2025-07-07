const { extractDataFromMessage, baileysIs, download } = require(".")

exports.loadCommonFunctions = ({socket, webMessage}) => {
    const {remoteJid, prefix, commandName, args, userJid, isReply, replyJid} = extractDataFromMessage(webMessage);

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

    
};