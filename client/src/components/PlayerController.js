import React, {useState} from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FormControl } from "baseui/form-control";
import {Slider} from 'baseui/slider';

import { Button, KIND, SIZE } from "baseui/button";
import { ArrowLeft } from 'baseui/icon';

import { useRoom } from '../contexts/RoomProvider.js';


export default function PlayerController() {

    const { player, masterVolumeSlider, media, masterVolumeRef } = useRoom();

    const [masterVolume, setMasterVolume] = useState(100);

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
                <FormControl label="Master Volume">
                    <Slider 
                        ref={masterVolumeSlider}
                        value={[masterVolume]}
                        onChange={(e) => {
                            setMasterVolume(e.value[0]);

                            setNewMasterVolumeRef(e);

                            if ( player.current ) {
                                player.current.getInternalPlayer().setVolume(e.value[0] * media.volume / 100);
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
