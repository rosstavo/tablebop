import React, { useState, useContext, useEffect, useCallback, useRef } from 'react'

/**
 * 3rd party libs
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom Hooks
 */
import { useSocket } from './SocketProvider';

/**
 * Context
 */
const RoomContext = React.createContext()

export function useRoom() {
    return useContext(RoomContext);
}

export function RoomProvider({ id, children }) {

    const [media, setMedia] = useState('');
    const [masterVolume, setMasterVolume] = useState(100);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const socket = useSocket();

    const player = useRef('');
    const masterVolumeSlider = useRef('');
    const masterVolumeRef = useRef(100);
    const queue = useRef('');

    /**
     * Handle launch
     */
    const launchHandler = useCallback( async (media) => {

        if (!media) {
            return;
        }

        if (!player.current) {
            setMedia(media);
            return;
        }

        const iframe = player.current.getInternalPlayer();

        let initialVolume = await iframe.getVolume();

        // Set the size of our decrement
        let decrement = initialVolume * 0.05;

        let volume = initialVolume;

        // Function to fade out the audio
        let fadeOut = setInterval(() => {

            // Reduce volume amount
            volume = volume - decrement;

            // Set the new volume amount
            iframe.setVolume(volume);

            // If volume less than or equal to zero, we're done
            if (volume <= 0) {

                queue.current = '';

                setMedia(media);
                
                clearInterval(fadeOut);
            }

        }, 100);

        // setMedia(media);
    }, [setMedia, player]);

    /**
     * Listen for media updates
     */
    useEffect(() => {

        if (socket == null) return;

        socket.on('update-media', launchHandler);

        socket.on('user-joined', launchHandler);

        return () => socket.off('receive-message')
    }, [socket, launchHandler, id]);

    /**
     * Update Media 
     */
    function launchMedia(media) {
        socket.emit('change-media', { media });

        launchHandler(media);
    }

    const value = {
        media,
        launchMedia,
        player,
        masterVolumeSlider,
        masterVolume,
        setMasterVolume,
        masterVolumeRef,
        queue,
        isImportModalOpen,
        setIsImportModalOpen
    };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}
