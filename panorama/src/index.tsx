/* @refresh reload */
import { render } from 'solid-js/web';

import './index.css';
import App from './App';
import { Route, Router, Routes } from '@solidjs/router';
import { ClockRoutes } from './nav/routes';
import Lobby from './lobby/lobby';
import Playground from './redline/playground';

render(() => (
        <Router>
            <Routes>
                <Route path="/" component={App}/>
                <Route path="/lobby" component={Lobby}/>
                <Route path="/game/:id" component={Playground}/>
            </Routes>
        </Router>
        ), 
        document.getElementById('root') as HTMLElement
    );
