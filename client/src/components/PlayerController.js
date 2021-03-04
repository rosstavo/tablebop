import React, {useState, useContext} from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FormControl } from "baseui/form-control";
import {Slider} from 'baseui/slider';

import { Button, KIND, SIZE } from "baseui/button";
import { ArrowLeft } from 'baseui/icon';


import { faVolumeUp } from '@fortawesome/free-solid-svg-icons'

import { useRoom } from '../contexts/RoomProvider.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// import { UIStateContext } from './Media.js';



export default function PlayerController() {

    const { player, masterVolumeRef, track } = useRoom();

    const [masterVolume, setMasterVolume] = useState(100);

    // FIND ANOTHER WAY TO GET THE ACTIVE TRACK FROM THE UI CONTEXT
    // const {activeTrack} = useContext(UIStateContext);


    const [css] = useStyletron();

    const setNewMasterVolumeRef = (e) => {
        masterVolumeRef.current = e.value[0];
    }

    return (
        <>
            <Block className={css({
                maxWidth: "30em",
                width: "100%",
                textAlign: 'center'
            })}>
                <FormControl
                    label={() => (
                        <FontAwesomeIcon icon={faVolumeUp} />
                    )}
                    caption="Master volume"
                >
                    <Slider 
                        value={[masterVolume]}
                        onChange={(e) => {
                            setMasterVolume(e.value[0]);

                            setNewMasterVolumeRef(e);

                            if ( player.current ) {
                                player.current.getInternalPlayer().setVolume(e.value[0] * track.current.volume / 100);
                            }
                        }}
                    />
                </FormControl>
            </Block>
            <Button
                $as="a"
                href="/"
                kind={KIND.tertiary}
                size={SIZE.compact}
                startEnhancer={() => <ArrowLeft size="24px" />}
            >
                Leave Room
            </Button>
        </>
    );

}
