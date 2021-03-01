import React, { useContext, useRef, useEffect } from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';

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

/**
 * Export Contexts
 */

/**
 * Start socket
 */
// const socket = io.connect('http://localhost:4000');

const itemProps = {
    height: '100vh',
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    overflow: 'scroll'
};

const wideItemProps = {
    ...itemProps,
    overrides: {
        Block: {
            style: ({ $theme }) => ({
                justifyContent: 'center',
                alignItems: 'center',
                width: `calc((200% - ${$theme.sizing.scale800}) / 3)`,
                backgroundColor: $theme.colors.backgroundPrimary
            }),
        },
    },
};


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
                    <FlexGrid
                        className={css({
                            height: '100vh'
                        })}
                        flexGridColumnCount={isAdmin ? 3 : 1}
                    >

                        {
                            isAdmin
                                ? <>
                                    <FlexGridItem {...itemProps}>
                                        <Media room={room} />
                                    </FlexGridItem>
                                    <FlexGridItem {...itemProps} display="none">Item</FlexGridItem>
                                </>
                                : ''
                        }
                        
                        <FlexGridItem {...wideItemProps} padding="3em">
                            <Player room={room} />
                        </FlexGridItem>
                    </FlexGrid>
                </RoomProvider>
            </SocketProvider>
        </>
    );
}
