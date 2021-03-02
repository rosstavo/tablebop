import React from 'react';

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

    const { player, masterVolumeSlider, media, masterVolume, setMasterVolume } = useRoom();

    const [css] = useStyletron();

    return (
        <>
            <Block className={css({
                maxWidth: "30em",
                width: "100%",
                textAlign: 'center'
            })}>
                <FormControl
                    label="Master Volume"
                    caption="Setting the master volume will reload the YouTube player."
                >
                    <Slider 
                        value={[masterVolume]}
                        // ref={masterVolumeSlider}
                        onChange={(e) => {
                            setMasterVolume(e.value[0]);

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
