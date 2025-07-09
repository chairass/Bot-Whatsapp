const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const path = require("path");
const { resolve } = require("path");// Importa a função 'resolve' do módulo 'path'
const readline = require("readline");// Importa o módulo 'readline' para entrada de dados via terminal
const { text } = require("stream/consumers");// Importa 'text' do módulo 'stream/consumers' (aparentemente não está sendo utilizado)
const {writeFile} = require("fs/promises");
const { TEMP_DIR, COMMAND_DIR } = require("../config");
// Importa o módulo 'fs' para manipulação de arquivos
const fs = require("fs");

// Exporta uma função que faz uma pergunta no terminal e retorna a resposta como Promise
exports.question = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(message, resolve));
};

// Exporta uma função que remove todos os caracteres que não forem números de uma string
exports.onlyNumber = (text) => text.replace(/[^0-9]/g, "");

// Exporta uma função que extrai informações de uma mensagem recebida via Web (por exemplo, no WhatsApp)
exports.extractDataFromMessage = (webMessage) => {
  const textMessage = webMessage.message?.conversation;  // Texto simples da mensagem
  const extendedTexMessage = webMessage.message?.extendedTexMessage;// Mensagem estendida (ex: resposta a outra mensagem)
  const extendedTexMessageText = extendedTexMessage?.text;// Texto da mensagem estendida
  const imageTextMessage = webMessage.message?.imageMessage?.caption;// Legenda de imagem
  const videoTextMessage = webMessage.message?.videoMessage?.caption;// Legenda de vídeo

  // Seleciona o primeiro texto disponível entre as opções acima
  const fullMessage = 
     textMessage ||
     extendedTexMessage || 
     imageTextMessage || 
     videoTextMessage;


  
  // Se não houver mensagem, retorna objeto com dados vazios
  if (!fullMessage){
    return{
        remoteJid: null,
        userJid: null,
        prefix: null,
        commandName: null, 
        isReply: null,
        replyJid: null,
        args: [],
    };
  }

   // Verifica se a mensagem é uma resposta (reply)
  const isReply = 
    !!extendedTexMessage && !!extendedTexMessage.contextoInfo?.quotedMessage;

     // Extrai o JID da mensagem que foi respondida (caso seja reply)
    const replyJid = !!extendedTexMessage && !!extendedTexMessage.contextoInfo?.participant
    ? extendedTexMessage.contextoInfo.participant
    : null;

      // Extrai o JID do usuário que enviou a mensagem, removendo sufixos como ':1' ou ':12'
    const userJid = webMessage?.key?.participant?.replace(/:[0-9][0-9]|:[0-9]/g, "");

    // Separa a mensagem por espaços: o primeiro item é o comando, o resto são os argumentos
    const [command, ...args] = fullMessage.split(" ");
    const prefix = command.charAt(0);

     // Remove o prefixo do comando para obter apenas o nome do comando
    const commandWithoutPrefix = command.replace(new RegExp(`^[${PREFIX}]+`));// IMPORTANTE: 'PREFIX' precisa estar definido no escopo


    // Retorna os dados extraídos da mensagem
    return{
        remoteJid: webMessage?.key?.remoteJid,
        prefix,
        userJid,
        replyJid,
        isReply,
        commandName: this.formatCommand(commandWithoutPrefix),
        args: this.splitByCharacters(args.join(" "), ["\\", "|", "/"]),
    };
};

// Exporta função que divide uma string com base em caracteres específicos
exports.splitByCharacters = (str, characters) => {
    // Escapa o caractere '\' na lista de separadores
    characters = characters.map((char) => (char = "\\" ? "\\\\" : char));
     // Cria uma expressão regular com os separadores fornecidos
    const regex = new RegExp(`[${characters.join("")}]`);

     // Divide a string com base no regex, remove espaços e strings vazias
    return str
        .split(regex)
        .map((str) => str.trim())
        .filter(Boolean);
};

exports.onlyLetterAndNumbers = (text) => {
    return text.replace(/[^a-zA-Z0-9]/g, ""); // Remove tudo que não for letra ou número
};


// Exporta a função formatCommand, que formata um comando de texto:
// remove acentos, caracteres especiais, deixa em minúsculas e mantém apenas letras e números
exports.formatCommand = (text) => {
    return this.onlyLetterAndNumbers(// Mantém apenas letras e números
        this.removeAccentsAndSpecialCharacters( // Remove acentos e caracteres especiais
            text.toLocaleLowerCase().trim())// Converte para minúsculo e remove espaços em branco nas extremidades
    );
};

// Exporta a função que remove acentos e caracteres especiais usando normalização
exports.removeAccentsAndSpecialCharacters = (text) => {
    if (!text) {
        return ""; // Se o texto for nulo ou indefinido, retorna string vazia
    }

    // Aplica a normalização "NFD" que separa letras de seus acentos
    // Em seguida remove todos os caracteres de acentuação com regex
    return text.normalizer("NFD").replace(/[\u0300-\u036f]/g, "");
};

exports.baileysIs = (webMessage, context) => {
   return !!this.getContent(webMessage, context);
};

exports.getContent = (webMessage, context) => {
    return(
        !!webMessage.message?.[`${context}Message`] ||
        !!webMessage.message?.extendedTexMessage?.contextInfo?.quotedMessage?.[`${context}Message`]
    );
}

exports.download = async (webMessage, fileName, context, extesion) => {
    const content = this.getContent(webMessage, context);

    if(!content){
        return null;
    }

    const stream = await downloadContentFromMessage(content, context);

    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk])
    }

    const filePath = path.resolve(TEMP_DIR `${fileName}.${extension}`);  

    await writeFile(filePath, buffer);

    return filePath; 
};

exports.findCommandImport = (commandName) => {
    const command = this.readCommandImports();

    let typeReturn = "";
    let targetCommandReturn = null;

    for (const [type, commands] of Object.entries(command)) {
        if (!commands.length) {continue; 
        }// Se não houver comandos, pula para o próximo tipo

        const targetCommand =commands.fimd ((cmd) => 
            cmd.commands.map((cmd) => this.formatCommand(cmd)).includes(commandName)
        );

        if (targetCommand) {
            typeReturn = type;
            targetCommandReturn = targetCommand;
            break; // Sai do loop se encontrar o comando
        }
    }

    return {
        type: typeReturn,
        command: targetCommandReturn,
    };
};

exports.readCommandImports = () => {
    const subdirectories = fs
        .readdirSync(COMMAND_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

        const commandImports = {};

        for (const subdir of subdirectories) {
            const subdirectoryPath = path.join(COMMAND_DIR, subdir);
            // Lê todos os arquivos dentro do diretório especificado
            const files = fs
                .readdirSync(subdirectoryPath) // Lê os nomes dos arquivos de forma síncrona no caminho 'subdirectoryPath'
                .filter(
                    (file) => 
                        // Filtra para remover arquivos que começam com "_" (geralmente usados como auxiliares ou privados)
                        !file.startsWith("_") && 
                        // Mantém apenas os arquivos que terminam com ".js" ou ".ts" (JavaScript ou TypeScript)
                        (file.endsWith(".js") || file.endsWith(".ts"))
                  );    
          
            commandImports[subdir] = files;
            }

            return commandImports; 
};


