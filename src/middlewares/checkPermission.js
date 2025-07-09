exports.checkPermission = async ({ type, socket, userJid, remoteJid }) => {
    if (type == "member"){
        return true;
    }

    const { participants, owner } = await socket.groupMetadata(remoteJid);
    const participant = participants.find((participant) =>
        participane.id == userJid 
    );

    if (!participant) {
        return false;
    }       

    const isOwner = participant.id == owner || participant.admiin == "superadmin";

    const isAdmin = participant.admin == "admin";

    if (type == "admin"){
        return isAdmin || isOwner;
    }

    if (type == "owner") {
        return isOwner;
    }

    return false;
};