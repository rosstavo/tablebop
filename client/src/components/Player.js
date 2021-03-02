import React, {useContext, useRef, useEffect} from 'react'

import { useStyletron } from 'baseui';
import {
    H4,
    H5
} from 'baseui/typography';
import {
    AspectRatioBox,
    AspectRatioBoxBody,
} from 'baseui/aspect-ratio-box';
import { FormControl } from "baseui/form-control";
import {StatefulSlider} from 'baseui/slider';
import { Block} from 'baseui/block';

import { StyledLink } from "baseui/link";
import { Button, KIND, SIZE } from "baseui/button";
import YouTube from 'react-youtube';


import { RoomStateContext } from './Room.js';
import { useRoom } from '../contexts/RoomProvider.js';
import { AppStateContext } from './App.js';

import { extractYoutubeMeta } from './../Helpers.js';
import { ArrowLeft } from 'baseui/icon';

export default function Player(props) {

    const { media } = useRoom();

    const appState = useContext(AppStateContext);
    const { isAdmin } = appState;

    const { player, masterVolumeRef } = useRoom();

    const [css, theme] = useStyletron();

    const youtubeMeta = media 
        ? extractYoutubeMeta(media.media)
        : {
            id: 'TcqP_hSMU3I',
            playlist: false
        };


    let opts = media
        ? {
            height: '100%',
            width: '100%',
            playerVars: {
                // https://developers.google.com/youtube/player_parameters
                autoplay: true,
                loop: media.loop,
                modestbranding: true,
                start: 0,
                rel: 0,
                listType: media.playlist ? 'playlist' : '',
                list: media.playlist ? youtubeMeta.id : '',
                playlist: (media.playlist || ! media.loop) ? '' : youtubeMeta.id
            }
        }
        : {};

    return (
        <>
            {
                media
                ? <AspectRatioBox aspectRatio={16 / 9} width="100%" marginBottom="1em">
                    <AspectRatioBoxBody as={() => (
                        <YouTube
                            ref={player}
                            videoId={media.playlist ? '' : youtubeMeta.id}
                            containerClassName="youtube-wrapper"
                            opts={opts}
                            onReady={(e) => {
                                e.target.setVolume((media.volume ? media.volume : 50) * masterVolumeRef.current / 100);
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

