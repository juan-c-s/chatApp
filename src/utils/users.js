const users = []


const addUser = ({ id, username, room }) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validating
    if (!username || !room)
        return {
            error: 'username and room are required!'
        }

    const existingUser = users.find((user) => {
        return user.room == room && user.username == username
    })

    //validate username
    if (existingUser)
        return {
            error: 'Username is in use!'
        }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id == id)
    if (index !== -1) {
        const user = users.splice(index, 1)[0]
        return user
    }
}

const getUser = (id) => {
    return users.find(user => user.id == id)
}
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    const usersInRoom = users.filter(user => {
        return user.room == room
    })
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

setTimeout(() => {
    console.log(users)
}, 5000)