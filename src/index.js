const express = require('express')
const path = require('path')
const app = express();
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/funcs')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')


const http = require('http')
const server = http.createServer(app)
const io = socketio(server)//create server to pass it to socket


// Organizing paths for templates directory and public directory
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '/templates/views')//this tells express where the hbs documents are
const partialsPath = path.join(__dirname, '/templates/partials')

//with the express.static function, you can serve static files(html,css) 
// in this case we gave the path for the public folder to serve the html files to express. This will help us have the html files available for us in the server
// a prediction is that we will use the app.get to send the information we need to the html files
//setting up static directory to serve
app.use(express.static(publicDirectoryPath))

const port = process.env.PORT || 3000;
// Using express app.set functionallities 
app.set('view engine', 'hbs');
app.set('views', viewsPath) // tell express to look for the path and not for the directory 'views'


//sending event to client
io.on('connection', (socket) => {
    console.log('new web socket connection')


    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error)
            return callback(error)


        socket.join(user.room)//emitting events to just that room

        socket.emit('msg', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('msg', generateMessage(user.username, `${username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
        //socket.emit,io.emit,socket.broadcast.emit
        //io.to.emit(emits event  to everybody in a room )
        //socket.broadcast.to.emit(same but excludes client)
    })

    socket.on('message', (message) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        const filteredMSG = filter.clean(message)
        io.to(user.room).emit('msg', generateMessage(user.username, filteredMSG))//io.emit sends to all users
    })
    ///2
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {//disconnect is a builtin event created by socket.io library
        // console.log(socket.id)
        const user = removeUser(socket.id)
        if (user) {
            // console.log(user)
            io.to(user.room).emit('msg', generateMessage(user.username, `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
    })

})


server.listen(port, () => console.log('server up and running on port ' + port))
