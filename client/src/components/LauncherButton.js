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
import { faPlay, faStream, faHourglassHalf, faSyncAlt, faPause } from '@fortawesome/free-solid-svg-icons'

/**
 * Contexts
 */
import { useRoom } from '../contexts/RoomProvider';
import { UIStateContext } from './Media.js';
import { UIDispatchContext } from './Media.js';


function launcherReducer(draft, action) {

    const icons = {
        ready: faPlay,
        queue: faStream,
        transitioning: faHourglassHalf,
        playing: faSyncAlt,
        paused: faPause
    }

    switch (action.type) {
        case 'updateStatus': {
            draft.status = action.payload;
            draft.icon = icons[action.payload];
            return;
        }
        case 'transition': {
            draft.isTransitioning = true;
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

    const [state, dispatch] = useImmerReducer(launcherReducer, initialState);

    const { launchMedia, queue, track, isActive } = useRoom();

    const [css] = useStyletron();

    const { enqueue } = useSnackbar();

    const {mediaList, playerState} = useContext(UIStateContext);
    const uiDispatch = useContext(UIDispatchContext);

    /**
     * Determine the track status
     */
    useEffect(() => {

        let newStatus = false;

        if (!isActive) {
            newStatus = 'ready';
        } else if (state.status === 'transitioning') {

            if (playerState === 'buffering') {
                newStatus = 'playing';
            }
            
        } else if (mediaList[props.index].id === queue.current.id) {
            newStatus = 'queue';
        } else if (mediaList[props.index].id === track.current.id) {
            
            switch (playerState) {
                case 'ended' : {
                    newStatus = 'ready';
                    break;
                }
                case 'paused' : {
                    newStatus = 'ready';
                    break;
                }
                default : {
                    newStatus = 'playing';
                    break;
                }
            }

        } else {
            newStatus = 'ready';
        }

        if (newStatus && newStatus !== state.status) {
            dispatch({
                type: 'updateStatus',
                payload: newStatus
            });
        }

    }, [dispatch, mediaList, props, queue, isActive, track, playerState, state]);

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

                        dispatch({ 
                            type: 'updateStatus',
                            payload: 'transitioning'
                        });

                        uiDispatch({
                            type: 'setActiveTrack',
                            payload: mediaList[props.index]
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