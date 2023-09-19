module.exports = (io, socket) => {
  const joinRoom = (user) => {
    socket.join(user._id)
    switch (user.accountType) {
      case 'Authorization Account':
        socket.join(`Authorization Account ${user.department}`)
        break
      case 'Approval Account':
        socket.join(`Approval Account`)
        break
      case 'Managing Account':
        socket.join(`Managing Account ${user.section}`)
        break
    }
  }

  const leaveRoom = user => {
    socket.leave(user._id)
    switch (user.accountType) {
      case 'Authorization Account':
        socket.leave(`Authorization Account ${user.department}`)
        break
      case 'Approval Account':
        socket.leave(`Approval Account`)
        break
      case 'Managing Account':
        socket.leave(`Managing Account ${user.section}`)
        break
    }
  }
  socket.on('join-room', joinRoom)
  socket.on('leave-room', leaveRoom)
}