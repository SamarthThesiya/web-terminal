import {useLocation} from "react-router-dom";
import axios from "axios";
import {BASE_URL} from "../consts";
import {Terminal} from 'xterm';
import {AttachAddon} from 'xterm-addon-attach';
import {useEffect, useRef, useState} from "react";
import {FitAddon} from "xterm-addon-fit";
import useWebSocket from "react-use-websocket";
import {Panel} from "rsuite";

import 'xterm/css/xterm.css';
import './Trynow.css';
import {io} from "socket.io-client";

function Trynow() {
    const location = useLocation();
    const [showTerminal, setShowTerminal] = useState(false);
    const [terminalPlaceholder, setTerminalPlaceholder] = useState("Terminal is loading");
    // const [timer, setTimer] = useState(120);

    //  let timerId = setInterval(function () {
    //
    //     console.log(1);
    //
    //     // // If the countdown timer has expired, stop the timer
    //     // if (timer === 0) {
    //     //     clearInterval(timerId);
    //     // }
    //     //
    //     // setTimer(timer-1);
    //
    // }, 1000);

    const [count, setCount] = useState(120);

    useEffect(() => {
        // If count is 0, do not set another timeout to stop the countdown
        if (count === 0) return;

        // Set a timeout to decrement the count every second
        const timerId = setTimeout(() => setCount(count - 1), 1000);

        // Clear the timeout if the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [count]);

    const query = new URLSearchParams(location.search);
    const containerId = query.get("id");

    const term = new Terminal({
        screenKeys: true,
        useStyle: true,
        cursorBlink: true,
        fullscreenWin: true,
        maximizeWin: true,
        cols: 128,
    });
    const socket = new WebSocket("ws://localhost:7000/containers/"+ containerId +"/attach/ws?stream=1&stdout=1&stdin=1&logs=1");
    const attachAddon = new AttachAddon(socket);
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    socket.onopen = function () {
        term.loadAddon(attachAddon);
        term._initialized = true;
        term.focus();
        setTimeout(function () {
            fitAddon.fit()
        });
        term.onResize(function (event) {
            const size = JSON.stringify({cols: event.cols, rows: event.rows + 1});
            const send = new TextEncoder().encode("\x01" + size);
            // socket.send(send);
        })
        term.onTitleChange(function (event) {
        });
        window.onresize = function () {
            fitAddon.fit();
        }

        setShowTerminal(true);
    }

    function closeTerminal () {
        setTerminalPlaceholder("Terminal is terminated");
        setShowTerminal(false);
    }

    // socket.onclose = function () {
    //     closeTerminal();
    // }

    socket.onerror = function () {
        closeTerminal();
    }

    useEffect(() => {

        if (showTerminal === true) {
            term.open(document.getElementById("xterm"));
        }

    }, [showTerminal])

    function stopContainer(event) {

        axios({
            url: BASE_URL + "/docker/" + containerId,
            method: "DELETE"
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });

    }

    // let timerId = setInterval(function () {
    //
    //     console.log(1);
    //
    //     // // If the countdown timer has expired, stop the timer
    //     // if (timer === 0) {
    //     //     clearInterval(timerId);
    //     // }
    //     //
    //     // setTimer(timer-1);
    //
    // }, 1000);

    return (
        <>
            {showTerminal ?
                <div id="xterm"></div> :
                <div>{terminalPlaceholder}</div>
            }
            <div>Remaining time: {count}</div>
        </>
    )
}

// function Trynow() {
//     const location = useLocation()
//
//     const query = new URLSearchParams(location.search);
//     const containerId = query.get("id");
//
//     const wsUrl = "ws://localhost:5000";
//     const divRef = useRef();
//     const xtermRef = useRef();
//
//     // const {readyState, getWebSocket} = useWebSocket(
//     //     wsUrl,
//     //     {
//     //
//     //     }
//     // );
//
//     // const socket = getWebSocket();
//
//     const [socket, setSocketInstance] = useState("");
//
//     useEffect(() => {
//         const socket = io("ws://localhost:5000", {
//             transports: ["websocket"],
//             cors: {
//                 origin: "http://localhost:3000/",
//             },
//         });
//
//         setSocketInstance(socket);
//
//         socket.on("message",(data) => {
//             console.log(data)
//         });
//
//         return () => socket.close();
//
//     }, [setSocketInstance])
//
//     useEffect(() => {
//         if (socket) {
//             const xterm = (xtermRef.current = new Terminal());
//             // socket.binaryType = "arraybuffer";
//             socket.on("message", (data) => {
//                 if (typeof data === "string") {
//                     xterm.writeln(data);
//                 } else {
//                     xterm.write(new Uint8Array(data));
//                 }
//             });
//
//             xterm.onData((data) => {
//                 const buffer = new Uint8Array(data.length);
//                 for (let i = 0; i < data.length; ++i) {
//                     buffer[i] = data.charCodeAt(i) & 255;
//                 }
//                 socket.emit("message", buffer);
//             });
//             const fitAddon = new FitAddon();
//             xterm.loadAddon(fitAddon);
//
//             xterm.open(divRef.current);
//
//             fitAddon.fit();
//         }
//     }, [socket]);
//
//     const readyStateText = {
//         [WebSocket.CONNECTING]: "Connecting",
//         [WebSocket.OPEN]: "Open",
//         [WebSocket.CLOSING]: "Closing",
//         [WebSocket.CLOSED]: "Closed"
//     }[WebSocket.CONNECTING];
//
//     function stopContainer(event) {
//
//         axios({
//             url: BASE_URL + "/docker/" + containerId,
//             method: "DELETE"
//         }).then((res) => {
//             console.log(res);
//         }).catch((err) => {
//             console.log(err);
//         });
//
//     }
//
//     return (
//         <>
//             <Panel
//                 header={
//                     <>
//                         {`WebSocket state: ${readyStateText}`}
//                         <small style={{float: "right"}}>{wsUrl}</small>
//                     </>
//                 }
//                 bordered
//                 shaded
//                 bodyFill
//             >
//                 <div ref={divRef}/>
//             </Panel>
//             <button onClick={stopContainer}>Stop Container</button>
//         </>
//     );
// }

export default Trynow;