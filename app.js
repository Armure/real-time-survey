const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const port = process.env.PORT || 4001
const index = require('./routes/index')

const app = express()
app.use(index)

const server = http.createServer(app)

const io = socketIo(server)

const state = {
  clients: [],
  length: 0
}

const onChange = socket => {
  if (socket) return socket.emit('change', state)
  io.emit('change', state)
}

const setLength = (socket, length) => {
  state.length = length
  state.clients.forEach(client => client.selection = null)
  onChange()
}

const handleConnect = ({ id }) => {
  console.log(`New client connected with id: ${id}`)
  state.clients.push({ id, selection: null, name: null, avatar: null })
  onChange()
}

const handleDisconnect = ({ id }) => {
  console.log(`Client ${id} disconnected`)
  state.clients = state.clients.filter(client => client.id !== id)
}

const handleSelection = ({ id }, value) => {
  const client = state.clients.find(c => c.id === id)
  client.selection = value
  onChange()
}

io.on('connection', socket => {
  handleConnect(socket)
  socket.on('disconnect', () => handleDisconnect(socket))
  socket.on('setLength', length => setLength(socket, length))
  socket.on('makeSelection', value => handleSelection(socket, value))
})

server.listen(port, () => console.log(`Listening on port ${port}`))
