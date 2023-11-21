module.exports = (io, socket) => {
  const authorizationNotification = (request, user) => {
    const notification = {
      subject: 'Request Authorization',
      body: `A new file (${request.companyName}) request from ${user.name} is awaiting your authorization`,
      tag: request._id
    }
    io.to(`Authorization Account ${user.department}`).emit('notification', notification)
  }

  const approvalNotification = (user, requestId, request) => {
    const approval = {
      subject: 'Request Approval',
      body: `A new file request is awaiting your approval from ${user.name}`,
      tag: user._id
    }
    const notification = {
      subject: `Request ${request.status == 'accepted' ? 'Authorized' : 'Declined' }`,
      body: `Your request is ${request.status == 'accepted' ? 'Approved' : 'Disapproved' } by the authorizing officer`,
      tag: requestId
    }
    io.to(user._id).emit('notification', notification)
    io.to('Approval Account').emit('notification', approval)
  }

  const releaseNotification = (user, requestId, request) => {
    const releaseNotification = {
      subject: 'New File Request',
      body: `You have a new file request from ${user.name} of ${user.department}`,
      tag: requestId
    }
    const notification = {
      subject: `Request ${request.status == 'accepted' ? 'Approved' : 'Disapproved' } by the RMD`,
      body: `Your request is ${request.status == 'accepted' ? 'Approved' : 'Disapproved'} and will soon released`,
      tag: requestId
    }
    io.to(user._id).emit('notification', notification)
    io.to(`Managing Account ${request.section}`)
      .emit('notification', releaseNotification)
  }
  
  const fileNotification = (user, requestId, filename) => {
    const notification = {
      subject: 'Your Requested File Is On It\'s Way',
      body: `The file (${filename}) you requested is on it\'s way to you from the RMD`,
      tag: requestId
    }
    io.to(user._id).emit('notification', notification)
  }

  const receiptNotification = (to, from, companyName) => {
    const notification = {
      subject: `Receipt Acknowledged`,
      body: `The receipt of '${companyName}' has been acknowledge by ${from}`,
      tag: companyName
    }
    io.to(to).emit('notification', notification)
  }

  const returnNotification = (to, from, request) => {
    const notification = {
      subject: `File Return`,
      body: `${from} is returning a file (${request.companyName})`,
      tag: to
    }
    io.to(to).emit('notification', notification)
  }

  const acknowledgedNotification = (to, from, request) => {
    const notification = {
      subject: `File Return Acknowledged`,
      body: `The file (${request.companyName}) has been received by ${request.name} RMD`,
      tag: to
    }
    io.to(to).emit('notification', notification)
  }
  
  const moreTimeRequestNotification = (to, from, request) => {
    const notification = {
      subject: 'Additional Time Request',
      body: `${from} is requesting for additional time for a file (${request.companyName})`,
      tag: from
    }
    io.to(to).emit('notification', notification)
  }

  socket.on('authorization notification', authorizationNotification)
  socket.on('more notification', moreTimeRequestNotification)
  socket.on('approval notification', approvalNotification)
  socket.on('release notification', releaseNotification)
  socket.on('return notification', returnNotification)
  socket.on('acknowledged', acknowledgedNotification)
  socket.on('file notification', fileNotification)
  socket.on('receipt', receiptNotification)
}