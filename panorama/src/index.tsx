/* @refresh reload */
import './index.css';

import { Navigate, Route, Router, Routes } from '@solidjs/router';
import { render } from 'solid-js/web';

import Login from './auth/login';
import Home from './home/home';
import Lobby from './lobby/lobby';
import CornerNav from './nav/corner-nav';
import About from './about/about';
import WaitingRoom from './lobby/waiting-room';
import Playground from './redline/playground/playground';

render(() => (
        <>
            <Router>
            <CornerNav/>
                <Routes>
                    <Route path="/" component={Home}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/about" component={About}/>
                    <Route path="/lobby" component={Lobby}/>
                    <Route path="/lobby/:id" component={WaitingRoom}/>
                    <Route path="/neo" element={<Playground debug={true}/>} />
                    <Route path="/*" element={<Navigate href="/"/>}/>
                </Routes>
            </Router>
        </>
        ), 
        document.getElementById('root') as HTMLElement
    );
