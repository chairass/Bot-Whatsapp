const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const path = require("path");
const { resolve } = require("path"); // Importa a função 'resolve' do módulo 'path'
const readline = require("readline"); // Importa o módulo 'readline' para entrada de dados via terminal
const { text } = require("stream/consumers"); // Importa 'text' do módulo 'stream/consumers' (aparentemente não está sendo utilizado)
const { writeFile } = require("fs/promises");
const { TEMP_DIR, COMMAND_DIR } = require("../config");
const fs = require("fs"); // Importa o módulo 'fs' para manipulação de arquivos

// Faz uma pergunta no terminal e retorna a resposta como uma Promise
exports.question = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(message, resolve));
};

// Remove todos os caracteres que não forem números de uma string
exports.onlyNumber = (text) => text.replace(/[^0-9]/g, "");

// Extrai informações relevantes da mensagem recebida
exports.extractDataFromMessage = (webMessage) => {
    const textMessage = webMessage.message?.conversation;
    const extendedTextMessage = webMessage.message?.extendedTextMessage;
    const extendedTextMessageText = extendedTextMessage?.text;
    const imageTextMessage = webMessage.message?.imageMessage?.caption;
    const videoTextMessage = webMessage.message?.videoMessage?.caption;

    // Seleciona o primeiro texto disponível entre os tipos
    const fullMessage =
        textMessage ||
        extendedTextMessageText ||
        imageTextMessage ||
        videoTextMessage;

    // Retorna estrutura padrão se não houver texto
    if (!fullMessage) {
        return {
            remoteJid: null,
            userJid: null,
            prefix: null,
            commandName: null,
            isReply: null,
            replyJid: null,
            args: [],
        };
    }

    // Verifica se é uma resposta (reply)
    const isReply =
        !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

    // JID da mensagem que foi respondida
    const replyJid = isReply && extendedTextMessage.contextInfo?.participant
        ? extendedTextMessage.contextInfo.participant
        : null;

    // JID do remetente (remove sufixos tipo ":1", ":12")
    const userJid = webMessage?.key?.participant?.replace(/:[0-9]+/g, "");

    // Divide mensagem em comando e argumentos
    const [command, ...args] = fullMessage.split(" ");
    const prefix = command.charAt(0);

    // Remove o prefixo (ex: !comando → comando)
    const commandWithoutPrefix = command.replace(new RegExp(`^[${prefix}]+`), "");

    // Retorna todos os dados extraídos
    return {
        remoteJid: webMessage?.key?.remoteJid,
        prefix,
        userJid,
        replyJid,
        isReply,
        commandName: this.formatCommand(commandWithoutPrefix),
        args: this.splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    };
};

// Divide string por múltiplos caracteres separadores
exports.splitByCharacters = (str, characters) => {
    characters = characters.map((char) => (char === "\\" ? "\\\\" : char));
    const regex = new RegExp(`[${characters.join("")}]`);

    return str
        .split(regex)
        .map((str) => str.trim())
        .filter(Boolean);
};

// Remove todos os caracteres que não sejam letras ou números
exports.onlyLetterAndNumbers = (text) => {
    return text.replace(/[^a-zA-Z0-9]/g, "");
};

// Formata comando: tira acento, caracteres especiais, espaços e letras maiúsculas
exports.formatCommand = (text) => {
    return this.onlyLetterAndNumbers(
        this.removeAccentsAndSpecialCharacters(
            text.toLocaleLowerCase().trim()
        )
    );
};

// Remove acentos e caracteres especiais
exports.removeAccentsAndSpecialCharacters = (text) => {
    if (!text) return "";

    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Verifica se a mensagem é de um determinado tipo (imagem, vídeo, etc)
exports.baileysIs = (webMessage, context) => {
    return !!this.getContent(webMessage, context);
};

// Extrai o conteúdo da mensagem do tipo especificado
exports.getContent = (webMessage, context) => {
    return (
        !!webMessage.message?.[`${context}Message`] ||
        !!webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[`${context}Message`]
    );
};

// Faz o download de um conteúdo (imagem, vídeo, sticker) e salva em arquivo temporário
exports.download = async (webMessage, fileName, context, extension) => {
    const content = this.getContent(webMessage, context);

    if (!content) {
        return null;
    }

    const stream = await downloadContentFromMessage(content, context);

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const filePath = path.resolve(TEMP_DIR, `${fileName}.${extension}`);
    await writeFile(filePath, buffer);

    return filePath;
};

// Procura um comando dentro dos diretórios de comandos importados
exports.findCommandImport = (commandName) => {
    const command = this.readCommandImports();

    let typeReturn = "";
    let targetCommandReturn = null;

    for (const [type, commands] of Object.entries(command)) {
        if (!commands.length) continue;

        const targetCommand = commands.find((cmd) =>
            cmd.commands.map((c) => this.formatCommand(c)).includes(commandName)
        );

        if (targetCommand) {
            typeReturn = type;
            targetCommandReturn = targetCommand;
            break;
        }
    }

    return {
        type: typeReturn,
        command: targetCommandReturn,
    };
};

// Lê os comandos organizados por subdiretórios no diretório de comandos
exports.readCommandImports = () => {
    const subdirectories = fs
        .readdirSync(COMMAND_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    const commandImports = {};

    for (const subdir of subdirectories) {
        const subdirectoryPath = path.join(COMMAND_DIR, subdir);

        const files = fs
            .readdirSync(subdirectoryPath)
            .filter(
                (file) =>
                    !file.startsWith("_") &&
                    (file.endsWith(".js") || file.endsWith(".ts"))
            );

        commandImports[subdir] = files;
    }

    return commandImports;
};
