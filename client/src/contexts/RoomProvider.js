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

        let trackId = '';

        if (media.media.includes('list=')) {
            trackId = media.media.match('[?&]list=([^#\&\?]+)')[1];
        } else {
            trackId = media.media.match('youtu(?:.*\/v\/|.*v\=|\.be\/)([A-Za-z0-9_\-]{11})')[1];
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

                track.current = media;

                iframe.loadVideoById('', 0, 0);

                if (media.playlist) {

                    iframe.loadPlaylist({
                        list: trackId,
                        listType: 'playlist',
                        index: 0,
                        startSeconds: 0
                    });

                } else {

                    if (media.loop) {
                        iframe.loadPlaylist([trackId, trackId], 0, 0);
                    } else {
                        iframe.loadVideoById(trackId, 0, 0);
                    }
                }
                
                setTimeout(() => {
                    iframe.seekTo(0);
                    iframe.unMute();
                    iframe.setVolume(media.volume * masterVolumeRef.current / 100);
                    iframe.setShuffle(media.shuffle);
                    iframe.setLoop(media.loop);
                }, 500);

                clearInterval(fadeOut);
            }

        }, 100);

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
    );

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
