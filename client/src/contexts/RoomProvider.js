import React, { useState, useContext, useEffect, useCallback, useRef } from 'react'

/**
 * 3rd party libs
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Custom Hooks
 */
import { useSocket } from './SocketProvider';
import { extractYoutubeMeta } from '../Helpers.js';

/**
 * Context
 */
const RoomContext = React.createContext()

export function useRoom() {
    return useContext(RoomContext);
}

export function RoomProvider({ id, children }) {

    const [isActive, setIsActive] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const socket = useSocket();

    const player = useRef('');
    const masterVolumeSlider = useRef('');
    const masterVolumeRef = useRef(100);
    const queue = useRef('');
    const track = useRef('');

    /**
     * Handle launch
     */
    const launchHandler = useCallback( async (media) => {

        if (!media) {
            setIsActive(false);
            return;
        }


        if (!isActive) {
            
            track.current = media;
            
            setIsActive(true);

            return;
        }

        const launchData = extractYoutubeMeta(media.media);

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

                if (media.loop) {
                    iframe.loadPlaylist( launchData.playlist ? launchData.id : [launchData.id], 0, 0 );
                } else {
                    iframe.loadVideoById(launchData.id, 0);
                }

                iframe.unMute();

                setTimeout(() => {
                    iframe.setVolume(media.volume * masterVolumeRef.current / 100);
                }, 500);
                
                track.current = media;

                // setMedia(media);

                clearInterval(fadeOut);
            }

        }, 100);

        // setMedia(media);
    }, [player, isActive]);

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
    const launchMedia = useCallback((media) => {
            socket.emit('change-media', {
                media
            });

            launchHandler(media);
        }, [socket, launchHandler]
    )

    const value = {
        launchMedia,
        player,
        track,
        masterVolumeSlider,
        masterVolumeRef,
        queue,
        isImportModalOpen,
        setIsImportModalOpen,
        isActive,
        setIsActive
    };

    return (
        <RoomContext.Provider value={value}>
            {children}
        </RoomContext.Provider>
    )
}
