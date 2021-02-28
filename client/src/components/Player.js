import React, {useContext} from 'react'
import {
    H4,
    H5
} from 'baseui/typography';
import {
    AspectRatioBox,
    AspectRatioBoxBody,
} from 'baseui/aspect-ratio-box';
import YouTube from 'react-youtube';

import { RoomStateContext } from './Room.js';
import { useRoom } from '../contexts/RoomProvider.js';

import { extractYoutubeMeta } from './../Helpers.js';


export default function Player(props) {

    const { media } = useRoom();

    const {
        player
    } = useRoom();

    console.log(media);

    const youtubeMeta = media.media ? extractYoutubeMeta(media.media) : {
        id: 'TcqP_hSMU3I',
        playlist: false
    };

    // console.log(youtubeMeta);

    
    let opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            // https://developers.google.com/youtube/player_parameters
            autoplay: true,
            loop: media.loop,
            modestbranding: true,
            rel: 0,
            listType: media.playlist ? 'playlist' : '',
            list: media.playlist ? youtubeMeta.id : '',
            playlist: (media.playlist || ! media.loop) ? '' : youtubeMeta.id
        }
    };

    return (
        <>
            {
                media
                ? <AspectRatioBox aspectRatio={16 / 9} width="100%">
                    <AspectRatioBoxBody as={() => (
                        <YouTube
                            ref={player}
                            videoId={media.playlist ? '' : youtubeMeta.id}
                            containerClassName="youtube-wrapper"
                            opts={opts}
                        />
                        )}>
                    </AspectRatioBoxBody>
                </AspectRatioBox>

                : <H4>Nothing playing right now.</H4>
            }
        </>
    )
}

