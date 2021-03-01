import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client'

// const PORT = process.env.PORT || 4000;
const socketURL = process.env.NODE_ENV === 'production' ? window.location.hostname : 'http://localhost:4000';

const SocketContext = React.createContext()

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState()

  useEffect(() => {
    const newSocket = io(
      socketURL,
      { query: { id } }
    )
    setSocket(newSocket)

    return () => newSocket.close()
  }, [id])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
