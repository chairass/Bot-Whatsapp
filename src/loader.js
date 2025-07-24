const { TIMEOUT_IN_MILLISECONDS_BY_EVENT } = require("./config");
const { onMessagesUpsert } = require("./middlewares/onMessagesUpsert");
 
exports.load = (socket) => {
    if (!socket?.ev) {
        console.error("❌ Socket inválido ou não conectado.");
        return;
    }

    socket.ev.on("messages.upsert", ({ messages }) => {
        setTimeout(() => {
            onMessagesUpsert({ socket, messages });
        }, TIMEOUT_IN_MILLISECONDS_BY_EVENT);
    });
};
