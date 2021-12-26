

const socket = io()//client connection to websocket

const $messageFormInput = document.getElementById('message')
const $messageForm = document.getElementById('message-form')
const $sendLocation = document.getElementById('send-location')
const $messages = document.getElementById('messages')

//Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML
//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })



$messageForm.addEventListener('submit', event => {
    event.preventDefault()
    $messageForm.setAttribute('disabled', 'disabled')
    if ($messageFormInput.value != "")
        socket.emit('message', $messageFormInput.value)
    $messageForm.removeAttribute('disabled')
    $messageFormInput.value = ""
    $messageFormInput.focus()
})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // console.log(newMessageMargin)
    const visibleHeight = $messages.offsetHeight


    const containerHeight = $messages.scrollHeight//whole page

    const scrollOffset = $messages.scrollTop + visibleHeight//tells if we are at the bottom or not

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('locationMessage', (obj) => {
    // console.log(url.url)
    const html = Mustache.render(locationTemplate,
        {
            username: obj.username,
            url: obj.url,
            createdAt: moment(obj.createdAt).format('h:mm a')
        })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('msg', (msg) => {

    const html = Mustache.render(messageTemplate,
        {
            username: msg.username,
            message: msg.text,
            createdAt: moment(msg.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)//afterEnd => after element closes // beforeEnd=>before messages div ends
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(room);
    console.log(users);
    const html = Mustache.render(sidebarTemplate,
        {
            users,
            room
        })
    document.getElementById('sidebar').innerHTML = html
})

$sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    console.log('clicked')
    $sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition(position => {

        const latitude = position["coords"].latitude
        const longitude = position["coords"].longitude
        socket.emit('sendLocation',
            { longitude, latitude },
            () => {
                console.log("Location Shared")
                $sendLocation.removeAttribute('disabled')
            })
    }, error => {
        $sendLocation.removeAttribute('disabled')//enable button
        console.log(error)
    }, { timeout: 10000 })
    // navigator.geolocation.getCurrentPosition((position) => {
    //     console.log(position)
    // })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})