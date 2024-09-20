import React, {useCallback, useEffect, useRef, useState} from 'react';
import logo from './cps.png';
import './App.css';

const DYMENSION_CONNECT_URL = 'https://portal.dymension.xyz';
const DYMENSION_CONNECT_NETWORK_IDS = ['cryptopunkstar_10089-1'];
//dymension_2018-1
//cryptopunkstar_10089-1

function App() {
    const [dymensionConnectOpen, setDymensionConnectOpen] = useState(false);
    const [dymensionConnectReady, setDymensionConnectReady] = useState(false);
    const [address, setAddress] = useState('');
    const buttonRef = useRef(null);
    const iframeRef = useRef(null);

    const sendMessage = useCallback((message) => iframeRef.current?.contentWindow?.postMessage(message, DYMENSION_CONNECT_URL), []);

    const updateTriggerBoundingRect = useCallback(() => {
        const boundingRect = buttonRef.current?.getBoundingClientRect();
        if (boundingRect) {
            sendMessage({type: 'triggerBoundingRectChange', rect: boundingRect});
        }
    }, [sendMessage]);

    const initModal = useCallback(() => {
        updateTriggerBoundingRect();
        sendMessage({
            type: 'stylesChange',
            styles: {
                '--control-color-normal': 'rgb(2, 1, 5)',
                '--background-color': 'rgb(56, 221, 100)',
                '--background-color-secondary': 'rgb(2, 1, 5)',
                // Add more custom style properties as needed
            }
        });
        sendMessage({type: 'menuAlignChange', align: 'center'});
    }, [sendMessage, updateTriggerBoundingRect]);

    useEffect(() => {
        window.addEventListener('scroll', updateTriggerBoundingRect, true);
        window.addEventListener('resize', updateTriggerBoundingRect, true);
        return () => {
            window.removeEventListener('scroll', updateTriggerBoundingRect, true);
            window.removeEventListener('resize', updateTriggerBoundingRect, true);
        }
    }, [updateTriggerBoundingRect]);

    useEffect(() => {
        const handleMessage = (event) => {
            if (event.origin !== DYMENSION_CONNECT_URL) {
                return;
            }
            if (event.data.type === 'ready') {
                setDymensionConnectReady(true);
            }
            if (event.data.type === 'close') {
                setDymensionConnectOpen(false);
            }
            if (event.data.type === 'connect') {
                setAddress(event.data.hexAddress);
                updateTriggerBoundingRect();
            }
            if (event.data.type === 'disconnect') {
                setAddress('');
                updateTriggerBoundingRect();
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [initModal, sendMessage, updateTriggerBoundingRect]);

    return (
        <div className='App'>
            <h1>I'M a RollApp Cryptopunkstar Playground !</h1>
            <img src={logo} alt="logo" />
            <button className="buttonW" style={{height: '30px', width : '100px'}} color="success" size="lg"
                disabled={!dymensionConnectReady}
                ref={buttonRef}
                onClick={() => {
                    setDymensionConnectOpen(!dymensionConnectOpen)
                    updateTriggerBoundingRect();
                }}
            >
                {address || 'Connect'}
            </button>
            <iframe
                ref={iframeRef}
                onLoad={initModal}
                style={{display: dymensionConnectOpen ? 'block' : 'none'}}
                allow='clipboard-read; clipboard-write'
                title='dymension-connect'
                className='dymension-connect-iframe'
                src={`${DYMENSION_CONNECT_URL}/connect?networkIds=${DYMENSION_CONNECT_NETWORK_IDS.join(',')}`}
            />
        </div>
    );
}

export default App;
