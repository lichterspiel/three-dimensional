/* @refresh reload */
import './index.css';

import { Route, Router, Routes } from '@solidjs/router';
import { render } from 'solid-js/web';

import Login from './auth/login';
import Home from './home/home';
import Lobby from './lobby/lobby';
import Playground from './redline/playground';

render(() => (
        <Router>
            <Routes>
                <Route path="/" component={Home}/>
                <Route path="/login" component={Login}/>
                <Route path="/lobby" component={Lobby}/>
                <Route path="/game/:id" component={Playground}/>
            </Routes>
        </Router>
        ), 
        document.getElementById('root') as HTMLElement
    );
