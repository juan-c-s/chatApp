
const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()//milissinceEpoch
    }
}

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()//milissinceEpoch
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage,
}