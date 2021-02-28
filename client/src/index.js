import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.js';
import './style.css';

import {
    Provider as StyletronProvider
} from 'styletron-react';
import {
    Client as Styletron
} from 'styletron-engine-atomic';
import {
    DarkTheme,
    BaseProvider
} from 'baseui';

const engine = new Styletron();

ReactDOM.render(
    <React.StrictMode>
        <StyletronProvider value={engine}>
            <BaseProvider theme={DarkTheme} >
                <App />
            </BaseProvider>
        </StyletronProvider>
    </React.StrictMode>,
    document.getElementById('root'),
);