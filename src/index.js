const { connect } = require('./connection');
const { load } = require('./loader');
require('dotenv').config();

const readline = require('readline');

const question = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

const formatNumberToJid = (phone) => {
    return phone.replace(/\D/g, '') + "@s.whatsapp.net";
};

async function start() {
    const socket = await connect();
    load(socket);

    const numero = await question("📱 Digite o número de telefone (com DDD): ");
    const jid = formatNumberToJid(numero);

    setTimeout(async () => {
        try {
            await socket.sendMessage(jid, {
                text: "👋 Olá! O que você gostaria de fazer?"
            });
            console.log(`✅ Mensagem enviada para ${numero}`);
        } catch (err) {
            console.error("❌ Erro ao enviar mensagem:", err);
        }
    }, 3000); // pequeno delay para estabilizar a conexão
}

start();

