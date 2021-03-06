import React, {createContext, useContext, useEffect} from 'react';

/**
 * Base Web
 */
import { useStyletron } from 'baseui';
import { List, arrayMove } from 'baseui/dnd-list';
import { H3, H4, Label1, Paragraph1, } from 'baseui/typography';
import { Block } from 'baseui/block';
import { ButtonGroup, MODE, SHAPE as RADIOSHAPE } from "baseui/button-group";
import { Button, SHAPE } from "baseui/button";
import { StyledLink } from "baseui/link";
import { StyledSpinnerNext } from 'baseui/spinner';
import { Tag, VARIANT, KIND } from "baseui/tag";
import { Drawer, ANCHOR } from 'baseui/drawer';
import { FormControl } from 'baseui/form-control';
import { Input } from 'baseui/input';
import { Slider } from "baseui/slider";
import { Checkbox, STYLE_TYPE, LABEL_PLACEMENT } from "baseui/checkbox";
import { useSnackbar } from 'baseui/snackbar';
import { StatefulTooltip, PLACEMENT } from "baseui/tooltip";
import { Radio, RadioGroup } from 'baseui/radio';

/**
 * 3rd party libs
 */
import { v4 as uuidv4 } from 'uuid';
import { useImmerReducer } from 'use-immer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFileImport, faFileExport, faStream, faClone, faCheck, faTimes, faUndo, faVolumeDown, faVolumeUp, faRandom } from '@fortawesome/free-solid-svg-icons'
import { faYoutube } from '@fortawesome/free-brands-svg-icons';


/**
 * Contexts
 */
import {useRoom} from '../contexts/RoomProvider';
import ImportModal from './ImportModal.js';
import LauncherButton from './LauncherButton';

export const UIStateContext = createContext(null); 
export const UIDispatchContext = createContext(null); 

/**
 * Reducer for our UI
 */
function uiReducer(draft, action) {

    switch (action.type) {
        case 'setActiveTrack' : {
            draft.activeTrack = action.payload;
            return;
        }
        case 'updatePlayerState' : {

            switch (action.payload) {
                case -1: {
                    draft.playerState = 'unstarted';
                    return
                }
                case 0 : {
                    draft.playerState = 'ended';
                    return;
                }
                case 1 : {
                    draft.playerState = 'playing';
                    return;
                }
                case 2 : {
                    draft.playerState = 'paused';
                    return;
                }
                case 3 : {
                    draft.playerState = 'buffering';
                    return;
                }
                case 5 : {
                    draft.playerState = 'video cued';
                    return;
                }
                default: {
                    draft.playerState = false;
                }
            }

            return;
        }
        case 'updateField': {
            draft.fields[action.fieldName].value = action.payload;
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

            localStorage.setItem('tablebop-media', JSON.stringify(newState));

            return;
        }
        case 'importList': {

            draft.mediaList = action.payload.mediaList;

            localStorage.setItem('tablebop-media', JSON.stringify(action.payload.mediaList));

            return;
        }
        case 'addMedia': {
            draft.isDrawerOpen = true;
            draft.fields.media.value = draft.fields.media.default;
            draft.fields.label.value = draft.fields.label.default;
            draft.fields.loop.value = draft.fields.loop.default;
            draft.fields.shuffle.value = draft.fields.shuffle.default;
            draft.fields.volume.value = draft.fields.volume.default;
            draft.errors = {};

            return;
        }
        case 'editMedia': {
            draft.isDrawerOpen = true;
            draft.fields.media.value = action.payload.media;
            draft.fields.label.value = action.payload.label;
            draft.fields.volume.value = action.payload.volume ? [action.payload.volume] : [50];
            draft.fields.loop.value = action.payload.loop;
            draft.fields.shuffle.value = action.payload.shuffle;
            draft.errors = {};
            draft.isEditing = action.payload.id;

            return;
        }
        case 'closeDrawer': {
            draft.isDrawerOpen = false;
            draft.isEditing = false;

            return;
        }
        case 'saveMedia': {

            let errors = {};

            /**
             * Validate fields
             */
            for (let field in action.payload.fields) {
                
                if (!draft.fields[field].rules) {
                    continue;
                }

                for (const rule in draft.fields[field].rules) {

                    if (rule === 'min' && action.payload.fields[field].length < draft.fields[field].rules[rule]) {
                        errors[field] = Array.isArray(draft.errors[field]) ? draft.errors[field] : [];
                        errors[field].push('Please give a value');
                    }

                    if (rule === 'max' && action.payload.fields[field].length > draft.fields[field].rules[rule]) {
                        errors[field] = Array.isArray(draft.errors[field]) ? draft.errors[field] : [];
                        errors[field].push('Please shorten this value');
                    }

                    if (rule === 'match' && ! action.payload.fields[field].match(draft.fields[field].rules['match'])) {
                        errors[field] = Array.isArray(draft.errors[field]) ? draft.errors[field] : [];
                        errors[field].push('Unexpected value');
                    }
                }

            }

            if (Object.keys(errors).length) {
                draft.errors = errors;
                return;
            }

            /**
             * Else let's save the values
             */
            if (action.payload.id) {

                draft.mediaList = draft.mediaList.map((mediaItem, index) => {

                    if (action.payload.id !== mediaItem.id) {
                        return mediaItem;
                    }

                    return {
                        'id'      : mediaItem.id,
                        'label'   : action.payload.fields.label,
                        'media'   : action.payload.fields.media,
                        'playlist': action.payload.fields.media.includes('list=') ? true: false,
                        'loop'    : action.payload.fields.loop,
                        'shuffle' : action.payload.fields.shuffle,
                        'volume'  : action.payload.fields.volume
                    };

                });


            } else {
                draft.mediaList.push({
                    id: uuidv4(),
                    label: action.payload.fields.label,
                    media: action.payload.fields.media,
                    playlist: action.payload.fields.media.includes('list=') ? true : false,
                    loop: action.payload.fields.loop,
                    shuffle: action.payload.fields.shuffle,
                    volume: action.payload.fields.volume,
                });
            }

            localStorage.setItem('tablebop-media', JSON.stringify(draft.mediaList));

            draft.fields.media.value = draft.fields.media.default;
            draft.fields.label.value = draft.fields.label.default;
            draft.fields.loop.value = draft.fields.loop.default;
            draft.fields.shuffle.value = draft.fields.shuffle.default;
            draft.fields.volume.value = draft.fields.volume.default;
            draft.isDrawerOpen = false;
            draft.isEditing = false;
            draft.errors = {};

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
        label: 'Combat',
        media: 'https://www.youtube.com/watch?v=w0sUw735gRw',
        playlist: false,
        volume: 50,
        loop: true,
    },
    {
        id: uuidv4(),
        label: 'Adventure',
        media: 'https://www.youtube.com/watch?v=A8qMyBWZNw0',
        playlist: false,
        volume: 50,
        loop: true,
    },
    {
        id: uuidv4(),
        label: 'Intrigue',
        media: 'https://www.youtube.com/watch?v=yEYxnJB4jZs',
        playlist: false,
        volume: 50,
        loop: true,
    }
];

/**
 * Initial state of UI component
 */
const initialState = {
    mediaList: localStorage.getItem('tablebop-media') ? JSON.parse(localStorage.getItem('tablebop-media')) : mediaList, // An array of of media objects available for launch
    isDrawerOpen: false,    // Is the drawer open for editing
    isEditing: false,       // Is the media object in the drawer new or existing
    activeTrack: false,
    playerState: false,
    fields: {
        volume: {
            default: [50],
            value: '',
            rules: {}
        },
        media: {
            default: '',
            value: '',
            rules: {
                'match': new RegExp('^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+')
            }
        },
        label: {
            default: '',
            value: '',
            rules: {
                'min': 1,
                'max': 25
            }
        },
        loop: {
            default: true,
            value: '',
            rules: {}
        },
        shuffle: {
            default: false,
            value: '',
            rules: {}
        },
    },
    // fields: {
    //     volume: [50],
    //     media: '',
    //     label: '',
    //     loop: true,
    //     shuffle: false,
    // },
    errors: {}
}

/**
 * Export JSON
 */
const exportJSON = (jsonData) => {
    const fileData = JSON.stringify(jsonData);
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const datetime = new Date();

    link.download = 'tablebop-export-' + datetime.toISOString() + '.json';
    link.href = url;
    link.click();
}

export default function Media(props) {

    const [state, dispatch] = useImmerReducer(uiReducer, initialState); 

    const {queue, setIsImportModalOpen, launchMedia, isActive, player} = useRoom();

    const {
        mediaList,
        isDrawerOpen,
        isEditing,
        fields,
        playerState,
        errors
    } = state; 

    const [css] = useStyletron();

    const {enqueue} = useSnackbar();

    useEffect(() => {

        if (player.current) {
            player.current.getInternalPlayer().addEventListener('onStateChange', (e) => {
                dispatch({
                    type: 'updatePlayerState',
                    payload: e.data
                });
            });
        } else {
            dispatch({
                type: 'updatePlayerState',
                payload: false
            });
        }

    }, [isActive, player, dispatch]);

    console.log(errors);

    return (
        <UIDispatchContext.Provider value={dispatch}>
            <UIStateContext.Provider value={state}>
                <Block className={css({
                    padding: '2em'
                })}
                >
                    <img
                        src="/tablebop-logo.svg"
                        alt="Tablebop"
                        className={css({
                            maxWidth: '16em',
                            margin: '0 auto',
                            display: 'block'
                        })}
                    />

                </Block>
                <Block className={css({
                    padding: '0 2em',
                    flexGrow: '1',
                })}>
                    <List
                        removable
                        removableByMove
                        items={mediaList.map((mediaItem, index) => (
                            <Block className={css({
                                display: 'flex',
                                alignItems: 'center'
                            })}>
                                <Block>
                                    <LauncherButton index={index} />
                                </Block>
                                <Block>
                                    <Label1>
                                        {mediaItem.label}
                                        <StatefulTooltip content="Edit" showArrow placement={PLACEMENT.top}>
                                            <StyledLink
                                                className={css({
                                                    display: 'inline-block',
                                                    marginLeft: '0.5em',
                                                    cursor: 'pointer'
                                                })}
                                                onClick={(el) => dispatch({
                                                    type: 'editMedia',
                                                    payload: mediaList[index]
                                                })}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </StyledLink>
                                        </StatefulTooltip>
                                        <StatefulTooltip content="Play after current track" showArrow placement={PLACEMENT.top}>
                                            <StyledLink
                                                className={css({
                                                    display: 'inline-block',
                                                    marginLeft: '0.5em',
                                                    cursor: 'pointer'
                                                })}
                                                onClick={(el) => {
                                                    queue.current = mediaList[index];

                                                    enqueue({
                                                        message: `Track queued: ${mediaList[index].label}`,
                                                        startEnhancer: () => <FontAwesomeIcon icon={faStream} />,
                                                    });
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faStream} />
                                            </StyledLink>
                                        </StatefulTooltip>
                                    </Label1>
                                    <Paragraph1 margin="0">
                                        {mediaItem.playlist
                                            ? <Tag variant={VARIANT.solid} kind={KIND.red} closeable={false}>Playlist</Tag>
                                            : <Tag variant={VARIANT.solid} kind={KIND.blue} closeable={false}>Single</Tag>
                                        }
                                        {mediaItem.loop 
                                            ? <Tag closeable={false}><FontAwesomeIcon icon={faUndo} size="xs" /> Loop</Tag> 
                                            : ''
                                        }
                                        {mediaItem.shuffle 
                                            ? <Tag closeable={false}><FontAwesomeIcon icon={faRandom} size="xs" /> Shuffle</Tag> 
                                            : ''
                                        }
                                        {(mediaItem.volume && mediaItem.volume !== 50) 
                                            ? <Tag closeable={false}>
                                                <FontAwesomeIcon icon={(mediaItem.volume < 50) ? faVolumeDown : faVolumeUp} size="xs" /> Vol {mediaItem.volume}
                                            </Tag> 
                                            : ''
                                        }
                                    </Paragraph1>
                                </Block>
                            </Block>
                        ))}
                        onChange={({ oldIndex, newIndex}) =>
                            dispatch({
                                type: 'updateList',
                                payload: {
                                    mediaList: mediaList,
                                    oldIndex: oldIndex,
                                    newIndex: newIndex
                                },
                            })
                        }
                        overrides={{
                            DragHandle: () => false
                        }}
                    />
                </Block>

                <Block className={css({
                    padding: '0 2em'
                })}>
                    <Block
                        className={css({
                            marginBottom: '1em',
                        })}
                    >
                        <ButtonGroup>
                            <Button onClick={() => dispatch({ type: 'addMedia' })} startEnhancer={() => <FontAwesomeIcon icon={faYoutube}/>}>Add Media</Button>
                            <Button onClick={() => launchMedia(false)} startEnhancer={() => <FontAwesomeIcon icon={faTimes}/>}>Stop</Button>
                        </ButtonGroup>
                    </Block>

                    <StyledLink 
                        onClick={() => setIsImportModalOpen(true)} 
                        className={css({
                            display: 'inlineBlock',
                            marginRight: '0.5em',
                            cursor: 'pointer'
                        })}
                    >
                        Import
                    </StyledLink>

                    <StyledLink 
                        onClick={() => exportJSON(mediaList)} 
                        className={css({
                            display: 'inlineBlock',
                            marginRight: '0.5em',
                            cursor: 'pointer'
                        })}
                    >
                        Export
                    </StyledLink>

                </Block>

                <ImportModal dispatch={dispatch} />

                <Block className={css({
                    padding: '2em'
                })}>
                    <FormControl label="Your room URL" caption="Give this to your players">
                        <Input
                            id="roomUrl"
                            value = { window.location.href }
                            endEnhancer={() => (
                                <StatefulTooltip content="Copy to clipboard" showArrow placement={PLACEMENT.top}>
                                    <StyledLink
                                        className={css({
                                            cursor: 'pointer'
                                        })}
                                        onClick={() => {
                                            enqueue({
                                                message: 'Copied to clipboard',
                                                startEnhancer: () => <FontAwesomeIcon icon={faCheck} />,
                                            });

                                            navigator.clipboard.writeText(window.location.href);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faClone} />
                                    </StyledLink>
                                </StatefulTooltip>
                            )}
                        />
                    </FormControl>
                </Block>
                
                <Drawer
                    onClose={() => dispatch({ type: 'closeDrawer' })}
                    isOpen={isDrawerOpen}
                    anchor={ANCHOR.left}
                >
                    <H4>Add Track</H4>

                    <form>

                        <FormControl label="Label" caption="Give your track a name" error={errors.label ? 'Please give your track a name between 1 and 25 characters long' : false}>
                            <Input
                                id="label"
                                value={fields.label.value}
                                error={errors.label ? true : false}
                                onChange={(e) => dispatch({ 
                                    type: 'updateField',
                                    fieldName: 'label',
                                    payload: e.currentTarget.value
                                })} 
                            />
                        </FormControl>

                        <FormControl label="YouTube URL" caption="This can be an individual video or a playlist" error={errors.media ? 'Please enter a valuable YouTube URL' : false}>
                            <Input
                                id="media"
                                value={fields.media.value}
                                error={errors.media ? true : false}
                                onChange={(e) => dispatch({ 
                                    type: 'updateField',
                                    fieldName: 'media',
                                    payload: e.currentTarget.value
                                })} 
                            />
                        </FormControl>

                        <FormControl label="Volume" caption="Set the launch volume or leave it at the default (50%)">
                            <Slider
                                id="volume"
                                value={fields.volume.value}
                                min={0}
                                max={100}
                                step={10}
                                marks
                                onChange={({value}) => dispatch({
                                    type: 'updateField',
                                    fieldName: 'volume',
                                    payload: value
                                })} 
                            />
                        </FormControl>

                        <FormControl label="Loop" caption="If track is a playlist, this will loop the playlist. Otherwise, it will loop the single video.">
                            <Checkbox
                                checked={fields.loop.value}
                                checkmarkType={STYLE_TYPE.toggle_round}
                                labelPlacement={LABEL_PLACEMENT.right}
                                onChange={(e) => dispatch({
                                    type: 'updateField',
                                    fieldName: 'loop',
                                    payload: e.currentTarget.checked
                                })}
                            >
                                Enable loop
                            </Checkbox>
                        </FormControl>

                        <FormControl label="Shuffle" caption="If the track is a playlist, the order will be randomized.">
                            <Checkbox
                                checked={fields.shuffle.value}
                                checkmarkType={STYLE_TYPE.toggle_round}
                                labelPlacement={LABEL_PLACEMENT.right}
                                onChange={(e) => dispatch({
                                    type: 'updateField',
                                    fieldName: 'shuffle',
                                    payload: e.currentTarget.checked
                                })}
                            >
                                Enable shuffle
                            </Checkbox>
                        </FormControl>

                        <Button
                            onClick={(e) => {
                                e.preventDefault();

                                dispatch({
                                    type: 'saveMedia',
                                    payload: {
                                        id: isEditing ? isEditing : '',
                                        fields: {
                                            media: fields.media.value,
                                            label: fields.label.value,
                                            volume: fields.volume.value[0],
                                            shuffle: fields.shuffle.value,
                                            loop: fields.loop.value
                                        }
                                    }
                                });
                            }}
                        >
                            Save Track
                        </Button>
                    </form>

                </Drawer>
            </UIStateContext.Provider>
        </UIDispatchContext.Provider>
    );
}
