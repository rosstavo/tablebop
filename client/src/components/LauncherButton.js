import React, { useContext, useState, useEffect } from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { Button, SHAPE } from "baseui/button";
import { StyledSpinnerNext } from 'baseui/spinner';
import { useSnackbar } from 'baseui/snackbar';
import { StatefulTooltip, PLACEMENT } from "baseui/tooltip";

/**
 * 3rd party libs
 */
import { useImmerReducer } from 'use-immer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStream, faHourglassHalf, faSyncAlt } from '@fortawesome/free-solid-svg-icons'

/**
 * Contexts
 */
import { useRoom } from '../contexts/RoomProvider';
import { UIContext } from './Media.js';


function launcherReducer(draft, action) {

    const icons = {
        ready: faPlay,
        queue: faStream,
        transitioning: faHourglassHalf,
        playing: faSyncAlt
    }

    switch (action.type) {
        case 'updateStatus': {
            draft.status = action.payload;
            draft.icon = icons[action.payload];
            return;
        }
        default : {
            return;
        }
    }
}


const initialState = {
    status: 'ready',
    icon: faPlay
};

/**
 * Launcher Button
 */
export default function LauncherButton(props) {

    // const [playStatus, setPlayStatus] = useState('ready');
    // const [icon, setIcon] = useState(faPlay);


    const [state, dispatch] = useImmerReducer(launcherReducer, initialState);

    const { media, launchMedia, queue, incomingTrack } = useRoom();

    const [css] = useStyletron();

    const { enqueue } = useSnackbar();

    const mediaList = useContext(UIContext);

    useEffect(() => {
        if (mediaList[props.index].id === media.id) {
            dispatch({
                type: 'updateStatus',
                payload: 'playing'
            });
        } else if (mediaList[props.index].id === queue.current.id) {
            dispatch({
                type: 'updateStatus',
                payload: 'queue'
            });
        } else if (state.status !== 'transitioning') {
            dispatch({
                type: 'updateStatus',
                payload: 'ready'
            });
        }

        console.log(queue.current);

    }, [media, state, dispatch, mediaList, props, queue]);

    return (
        <div
            className={css({
                marginRight: '1em',
                display: 'flex',
                alignItems: 'center'
            })}
        >
            <Button
                onClick={
                    () => {
                        enqueue({
                            message: 'Launching new track…',
                            startEnhancer: () => <FontAwesomeIcon icon={faStream} />,
                        });

                        launchMedia(mediaList[props.index]);

                        console.log(props.index);

                        dispatch({
                            type: 'updateStatus',
                            payload: 'transitioning'
                        });
                    }
                }
                shape={SHAPE.square}
            >
                <FontAwesomeIcon icon={state.icon} />
            </Button>
        </div>
    );
}