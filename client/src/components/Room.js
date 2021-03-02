import React, { useContext, useRef, useEffect } from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { Block } from 'baseui/block';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import {
    SnackbarProvider
} from 'baseui/snackbar';


/**
 * 3rd party libs
 */
import { useParams, Redirect } from 'react-router-dom';
import { validate as validateUuid } from 'uuid';

/**
 * Components
 */
import Player from './Player.js';
import Media from './Media.js';

/**
 * Contexts
 */
import { RoomProvider, useRoom } from '../contexts/RoomProvider';
import { SocketProvider } from '../contexts/SocketProvider';
import { AppStateContext, AppDispatchContext } from './App.js';
import PlayerController from './PlayerController.js';

/**
 * Export Contexts
 */

/**
 * Start socket
 */
// const socket = io.connect('http://localhost:4000');


export default function Room() {

    const appState = useContext(AppStateContext);
    const appDispatch = useContext(AppDispatchContext);

    // Get room from URL params
    let { room } = useParams();

    const { isAdmin } = appState;

    const [css, theme] = useStyletron();

    useEffect(() => {
        appDispatch({
            type: 'setRoom',
            payload: {
                room: room
            }
        });

        appDispatch({
            type: 'checkAuth',
            payload: {
                cookie: localStorage.getItem('tablebop-owns-room'),
                room: room
            }
        });
    }, []);

    return (
        <>
            { validateUuid(room) ? '' : <Redirect to="/" />}
            <SocketProvider id={room}>
                <RoomProvider id={room}>
                    <SnackbarProvider>
                        <Block
                            flexWrap={[true, true, false]}
                            className={css({
                                height: '100vh',
                                display: 'flex'
                            })}
                        >

                            {
                                isAdmin
                                    ? <>
                                        <Block 
                                        width={['100%','100%', '50%', '33.3%']}
                                        className={css({
                                            height: '100vh',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            flexDirection: 'column',
                                            overflow: 'scroll',
                                        })}>
                                            <Media room={room} />
                                        </Block>
                                    </>
                                    : ''
                            }
                            
                            <Block
                            width={isAdmin ? ['100%','100%', '50%', '66.7%'] : '100%'}
                            className={css({
                                display: 'flex',
                                height: '100vh',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: theme.colors.backgroundPrimary,
                                padding: '3em',
                                overflow: 'scroll'
                            })}>
                                <Player room={room} />
                                <PlayerController />
                            </Block>
                        </Block>
                    </SnackbarProvider>
                </RoomProvider>
            </SocketProvider>
        </>
    );
}
