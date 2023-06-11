/* @refresh reload */
import './index.css';

import { Navigate, Route, Router, Routes } from '@solidjs/router';
import { render } from 'solid-js/web';

import Login from './auth/login';
import Home from './home/home';
import Lobby from './lobby/lobby';
import Playground from './redline/playground';
import CornerNav from './nav/corner-nav';

render(() => (
        <>
            <Router>
            <CornerNav/>
                <Routes>
                    <Route path="/" component={Home}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/lobby" component={Lobby}/>
                    <Route path="/game/:id" component={Playground}/>
                    <Route path="/*" element={<Navigate href="/"/>}/>
                </Routes>
            </Router>
        </>
        ), 
        document.getElementById('root') as HTMLElement
    );
