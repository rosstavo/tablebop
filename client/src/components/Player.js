import React, {useContext} from 'react'

import {
    H4
} from 'baseui/typography';
import {
    AspectRatioBox,
    AspectRatioBoxBody,
} from 'baseui/aspect-ratio-box';
import YouTube from 'react-youtube';


import { useRoom } from '../contexts/RoomProvider.js';
import { AppStateContext } from './App.js';

import { extractYoutubeMeta } from './../Helpers.js';

export default function Player() {

    // const { media } = useRoom();

    const appState = useContext(AppStateContext);
    const { isAdmin } = appState;

    const { player, masterVolumeRef, queue, track, isActive, launchMedia } = useRoom();

    console.log(isActive);
    console.log(track.current);

    const youtubeMeta = isActive && track.current
        ? extractYoutubeMeta(track.current.media)
        : {
            id: 'TcqP_hSMU3I',
            playlist: false
        };


    let opts = isActive
        ? {
            height: '100%',
            width: '100%',
            playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: true,
                loop: track.current.loop,
                modestbranding: true,
                start: 0,
                rel: 0,
                fs: 0,
                listType: track.current.playlist ? 'playlist' : '',
                list: track.current.playlist ? youtubeMeta.id : '',
                playlist: (track.current.playlist || ! track.current.loop) ? '' : youtubeMeta.id
            }
        }
        : {};

    return (
        <>
            {
                isActive
                ? <AspectRatioBox aspectRatio={16 / 9} width="100%" marginBottom="1em">
                    <AspectRatioBoxBody as={() => (
                        <YouTube
                            ref={player}
                            videoId={track.current.playlist ? '' : youtubeMeta.id}
                            containerClassName="youtube-wrapper"
                            opts={opts}
                            onReady={(e) => {
                                e.target.setVolume((track.current.volume ? track.current.volume : 50) * masterVolumeRef.current / 100);
                            }}
                            onEnd={(e) => {
                                console.log(e);
                                if (queue.current) {
                                    let media = queue.current;

                                    queue.current = '';
                                    
                                    launchMedia(media);
                                }
                            }}
                            onError={(e) => {
                                console.log(e);
                            }}
                        />
                        )}>
                    </AspectRatioBoxBody>
                </AspectRatioBox>

                : <H4>{isAdmin ? 'Nothing playing right now.' : 'No media launched since you joined.'}</H4>
            }
        </>
    )
}

