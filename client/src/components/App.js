import React, { useState, useRef, useEffect } from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { FlexGrid, FlexGridItem } from 'baseui/flex-grid';
import {
    H1,
    H2,
    H3,
    H4,
    Paragraph1,
    Paragraph3
} from 'baseui/typography';
import { Block } from 'baseui/block';
import { Button } from 'baseui/button';
import ArrowRight from 'baseui/icon/arrow-right';

/**
 * 3rd party libs
 */
import { v4 as uuidv4 } from 'uuid';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
// import io from 'socket.io-client'

/**
 * Components
 */
import Room from './Room.js';

/**
 * Export Contexts
 */
export const AppStateContext = React.createContext(null);
export const AppDispatchContext = React.createContext(null);


function appReducer(draft, action) {

    switch (action.type) {
        case 'createRoom': {
            draft.room = uuidv4();

            draft.isAdmin = true;

            localStorage.setItem('tablebop-owns-room', draft.room);

            return;
        }
        case 'setRoom': {
            draft.room = action.payload.room;

            return;
        }
        case 'checkAuth': {
            if (action.payload.cookie === action.payload.room) {
                draft.isAdmin = true;
            }
            return;
        }
        default: {
            return;
        }
    }

}

const initialState = {
    room: false,
    isAdmin: false
};

export default function App() {


    const [state, dispatch] = useImmerReducer(appReducer, initialState); 

    const { room } = state;

    const [css] = useStyletron();

    return (
        <Router>
            <AppDispatchContext.Provider value={dispatch}>
                <AppStateContext.Provider value={state}>

                    <Switch>
                        <Route path="/" exact>
                            <Block className={css({
                                padding: '2em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100vh'
                            })}>
                                <Block className={css({
                                    maxWidth: '30em',
                                    textAlign: 'center'
                                })}>
                                    <img
                                        src="/tablebop-logo.svg"
                                        alt="Tablebop"
                                        className={css({
                                            maxWidth: '20em',
                                            margin: '0 auto'
                                        })}
                                    />

                                    <Paragraph1>A simple way of live-sharing YouTube videos and playlists with your friends, for tabletop roleplaying games</Paragraph1>
                                    <Block className={css({
                                        marginBottom: '1em'
                                    })}>
                                        <Button
                                            className={css({
                                                display: 'block',
                                                width: '100%',
                                            })}
                                            onClick={(e) => dispatch({type: 'createRoom'})}
                                            startEnhancer={() => <ArrowRight size="32px" />}
                                        >
                                            Create a room
                                        </Button>
                                    </Block>
                                    <Paragraph3>or ask your DM for their unique room link</Paragraph3>
                                </Block>
                            </Block>
                            { room ? <Redirect to={`/${room}`} /> : '' }
                        </Route>
                        <Route path="/:room">
                            <Room />
                        </Route>
                    </Switch>

                </AppStateContext.Provider>
            </AppDispatchContext.Provider>
        </Router>
    );
}
