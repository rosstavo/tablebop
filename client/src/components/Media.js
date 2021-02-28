import React from 'react';

/**
 * Base Web
 */
import { List, arrayMove } from 'baseui/dnd-list';
import { H3, H4, Label1, Paragraph1, } from 'baseui/typography';
import { Block } from 'baseui/block';
import { Button, SHAPE } from "baseui/button";
import { StyledLink } from "baseui/link";
import { TriangleRight, Overflow, Plus } from 'baseui/icon';
import { StyledSpinnerNext } from 'baseui/spinner';
import { Tag, VARIANT, KIND } from "baseui/tag";
import { useStyletron } from 'baseui';
import { Drawer, ANCHOR } from 'baseui/drawer';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Slider } from "baseui/slider";
import { Checkbox, STYLE_TYPE, LABEL_PLACEMENT } from "baseui/checkbox";

/**
 * 3rd party libs
 */
import { v4 as uuidv4 } from 'uuid';
import { useImmerReducer } from 'use-immer';

/**
 * Contexts
 */
import {useRoom} from '../contexts/RoomProvider';

/**
 * Reducer for our UI
 */
function uiReducer(draft, action) {

    switch (action.type) {
        case 'updateField': {
            draft.fields[action.fieldName] = action.payload;
            return;
        }
        case 'updateList': {

            // Make a new state with the new order
            let newState = arrayMove(action.payload.mediaList, action.payload.oldIndex, action.payload.newIndex);

            // If the newIndex is -1, remove it from the newState
            if (action.payload.newIndex === -1) {
                newState.splice(action.payload.newIndex, 1);
            }

            // Set the newState to state
            draft.mediaList = newState;

            return;
        }
        case 'addMedia': {
            draft.isDrawerOpen = true;
            draft.fields.media = '';
            draft.fields.label = '';
            draft.fields.loop = true;
            draft.fields.volume = [50];

            return;
        }
        case 'editMedia': {
            draft.isDrawerOpen = true;
            draft.fields.media = action.payload.media;
            draft.fields.label = action.payload.label;
            draft.fields.volume = action.payload.volume ? [action.payload.volume] : [50];
            draft.fields.loop = action.payload.loop;
            draft.isEditing = action.payload.id;

            return;
        }
        case 'closeDrawer': {
            draft.isDrawerOpen = false;
            draft.isEditing = false;

            return;
        }
        case 'saveMedia': {

            /**
             * Validate fields
             */

            if (action.payload.id) {

                draft.mediaList.map((mediaItem, index) => {

                    if (action.payload.id === mediaItem.id) {

                        draft.mediaList[index].label = action.payload.label;
                        draft.mediaList[index].media = action.payload.media;
                        draft.mediaList[index].playlist = action.payload.media.includes('list=') ? true : false;
                        draft.mediaList[index].loop = action.payload.loop;
                        draft.mediaList[index].volume = action.payload.volume;

                    }

                });

            } else {
                draft.mediaList.push({
                    id: uuidv4(),
                    label: action.payload.label,
                    media: action.payload.media,
                    playlist: action.payload.media.includes('list=') ? true : false,
                    loop: action.payload.loop,
                    volume: action.payload.volume,
                });
            }

            draft.fields.media = '';
            draft.fields.label = '';
            draft.fields.loop = true;
            draft.fields.volume = [50];
            draft.isDrawerOpen = false;

            return;
        }
        case 'startFade': {
            draft.isTransitioning = action.payload.id;
            return;
        }
        case 'endFade': {
            draft.isTransitioning = false;
            return;
        }
        default: {
            return;
        }
    }

}

/**
 * Test data
 */
const mediaList = [
    {
        id: uuidv4(),
        label: 'Music | Combat',
        media: 'https://www.youtube.com/playlist?list=PLfdtiltiRHWGKUvioJly40RJZchSG2-34',
        playlist: true,
        loop: true,
        volume: 80
    },
    {
        id: uuidv4(),
        label: 'Hallvard\'s Story',
        media: 'https://www.youtube.com/watch?v=ppIfUX9St1I&ab_channel=RossHardy',
        playlist: false,
        loop: false
    },
    {
        id: uuidv4(),
        label: 'Music | Lobby',
        media: 'https://youtu.be/a7C3ij1Me5c',
        playlist: false,
        loop: false
    }
];

/**
 * Initial state of UI component
 */
const initialState = {
    mediaList: mediaList,   // An array of of media objects available for launch
    isDrawerOpen: false,    // Is the drawer open for editing
    isEditing: false,       // Is the media object in the drawer new or existing
    isTransitioning: false, // Is the old media fading out, ready to launch new media
    fields: {
        volume: [50],
        media: '',
        label: '',
        loop: true
    }
}

export default function Media(props) {

    const [uiState, uiDispatch] = useImmerReducer(uiReducer, initialState); 

    const {media, launchMedia} = useRoom();

    const {
        mediaList,
        isDrawerOpen,
        isEditing,
        fields,
        isTransitioning
    } = uiState; 


    const [css, theme] = useStyletron();

    return (
        <>
            <Block className={css({
                padding: '2em'
            })}
            >
                <H3 className={css({
                    margin: '0'
                })}>
                    Tablebop
                </H3>
            </Block>
            <Block className={css({
                padding: '0 2em',
                overflow: 'scrollY',
                flexGrow: '1',
            })}>
                <List
                    removable
                    removableByMove
                    items={mediaList.map((mediaItem, index) => (
                        <>
                            <Label1>
                                {mediaItem.label + ' '}
                                <StyledLink
                                    onClick={(el) => uiDispatch({
                                        type: 'editMedia',
                                        payload: mediaList[index]
                                    })}
                                >
                                    Edit
                                </StyledLink>
                            </Label1>
                            <Paragraph1 margin="0">
                                {mediaItem.playlist
                                    ? <Tag variant={VARIANT.solid} kind={KIND.red} closeable={false}>Playlist</Tag>
                                    : <Tag variant={VARIANT.solid} kind={KIND.blue} closeable={false}>Single</Tag>
                                }
                                {mediaItem.loop ? <Tag closeable={false}>Loop</Tag> : ''}
                                {mediaItem.volume ? <Tag closeable={false}>Vol {mediaItem.volume}</Tag> : ''}
                            </Paragraph1>
                        </>
                    ))}
                    onChange={({ oldIndex, newIndex}) =>
                        uiDispatch({
                            type: 'updateList',
                            payload: {
                                mediaList: mediaList,
                                oldIndex: oldIndex,
                                newIndex: newIndex
                            },
                        })
                    }
                    overrides={{
                        DragHandle: el => {
                            const [css] = useStyletron();
                            return (
                                <div
                                    className={css({
                                        marginRight: '1em',
                                        display: 'flex',
                                        alignItems: 'center',
                                    })}
                                >
                                    <Button
                                        onClick = {
                                            () => launchMedia(mediaList[el.$index])
                                        }
                                        shape={SHAPE.square}
                                    >
                                        {/* Set the icon inside the button */}
                                        {
                                            (isTransitioning === mediaList[el.$index].id)
                                                ? <StyledSpinnerNext />
                                                : (media.id === mediaList[el.$index].id)
                                                    ? <Overflow size={32} />
                                                    : <TriangleRight size={32} />
                                        }
                                    </Button>
                                </div>
                            );
                        },
                    }}
                />
            </Block>

            <Block className={css({
                padding: '0 2em'
            })} >
                <Button onClick={() => uiDispatch({ type: 'addMedia' })} startEnhancer={Plus}>Add Media</Button>
            </Block>

            <Block className={css({
                padding: '2em'
            })}>
                <FormControl label="Your room URL" caption="Give this to your players">
                    <Input
                        id="roomUrl"
                        value = { window.location.href }
                    />
                </FormControl>
            </Block>
            
            <Drawer
                onClose={() => uiDispatch({ type: 'closeDrawer' })}
                isOpen={isDrawerOpen}
                anchor={ANCHOR.left}
            >
                <H4>Add Media</H4>

                <form>

                    <FormControl label="Label" caption="Give your media a name">
                        <Input
                            id="label"
                            value={fields.label}
                            onChange={(e) => uiDispatch({ 
                                type: 'updateField',
                                fieldName: 'label',
                                payload: e.currentTarget.value
                            })} 
                        />
                    </FormControl>

                    <FormControl label="YouTube URL" caption="This can be an individual video or a playlist">
                        <Input
                            id="media"
                            value={fields.media}
                            onChange={(e) => uiDispatch({ 
                                type: 'updateField',
                                fieldName: 'media',
                                payload: e.currentTarget.value
                            })} 
                        />
                    </FormControl>

                    <FormControl label="Volume" caption="Set the launch volume or leave it at the default (50%)">
                        <Slider
                            id="volume"
                            value={fields.volume}
                            min={0}
                            max={100}
                            step={10}
                            marks
                            onChange={({value}) => uiDispatch({
                                type: 'updateField',
                                fieldName: 'volume',
                                payload: value
                            })} 
                        />
                    </FormControl>

                    <FormControl label="Loop" caption="If media is a playlist, this will loop the playlist. Otherwise, it will loop the single video.">
                        <Checkbox
                            checked={fields.loop}
                            checkmarkType={STYLE_TYPE.toggle_round}
                            labelPlacement={LABEL_PLACEMENT.right}
                            onChange={(e) => uiDispatch({
                                type: 'updateField',
                                fieldName: 'loop',
                                payload: e.currentTarget.checked
                            })}
                        >
                            Enable loop
                        </Checkbox>
                    </FormControl>

                    <Button
                        onClick={(e) => {
                            e.preventDefault();

                            uiDispatch({
                                type: 'saveMedia',
                                payload: {
                                    id: isEditing ? isEditing : '',
                                    media: fields.media,
                                    label: fields.label,
                                    volume: fields.volume[0],
                                    loop: fields.loop
                                }
                            });
                        }}
                    >
                        Save Media
                    </Button>
                </form>

            </Drawer>
        </>
    );
}