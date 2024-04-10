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
import moment from 'moment';

// function Trynow() {
//     const location = useLocation();
//     const [showTerminal, setShowTerminal] = useState(false);
//     const [terminalPlaceholder, setTerminalPlaceholder] = useState("Terminal is loading");
//     // const [timer, setTimer] = useState(120);
//
//     //  let timerId = setInterval(function () {
//     //
//     //     console.log(1);
//     //
//     //     // // If the countdown timer has expired, stop the timer
//     //     // if (timer === 0) {
//     //     //     clearInterval(timerId);
//     //     // }
//     //     //
//     //     // setTimer(timer-1);
//     //
//     // }, 1000);
//
//     const [count, setCount] = useState(120);
//
//     useEffect(() => {
//         // If count is 0, do not set another timeout to stop the countdown
//         if (count === 0) return;
//
//         // Set a timeout to decrement the count every second
//         const timerId = setTimeout(() => setCount(count - 1), 1000);
//
//         // Clear the timeout if the component unmounts to prevent memory leaks
//         return () => clearTimeout(timerId);
//     }, [count]);
//
//     const query = new URLSearchParams(location.search);
//     const containerId = query.get("id");
//
//     const term = new Terminal({
//         screenKeys: true,
//         useStyle: true,
//         cursorBlink: true,
//         fullscreenWin: true,
//         maximizeWin: true,
//         cols: 128,
//     });
//     // const socket = new WebSocket("ws://localhost:7000/containers/"+ containerId +"/attach/ws?stream=1&stdout=1&stdin=1&logs=1");
//     const socket = new WebSocket("wss://kubernetes.docker.internal:6443/api/v1/namespaces/default/pods/cedana-5b5956fb59-l6r8n/attach?stdin=true&stdout=true&tty=true&sfs=wefw&i=true", {
//
//     })
//     const attachAddon = new AttachAddon(socket);
//     const fitAddon = new FitAddon();
//     term.loadAddon(fitAddon);
//
//     socket.onopen = function () {
//         term.loadAddon(attachAddon);
//         term._initialized = true;
//         term.focus();
//         setTimeout(function () {
//             fitAddon.fit()
//         });
//         term.onResize(function (event) {
//             const size = JSON.stringify({cols: event.cols, rows: event.rows + 1});
//             const send = new TextEncoder().encode("\x01" + size);
//             // socket.send(send);
//         })
//         term.onTitleChange(function (event) {
//         });
//         window.onresize = function () {
//             fitAddon.fit();
//         }
//
//         setShowTerminal(true);
//     }
//
//     function closeTerminal () {
//         setTerminalPlaceholder("Terminal is terminated");
//         setShowTerminal(false);
//     }
//
//     // socket.onclose = function () {
//     //     closeTerminal();
//     // }
//
//     socket.onerror = function () {
//         closeTerminal();
//     }
//
//     useEffect(() => {
//
//         if (showTerminal === true) {
//             term.open(document.getElementById("xterm"));
//         }
//
//     }, [showTerminal])
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
//     // let timerId = setInterval(function () {
//     //
//     //     console.log(1);
//     //
//     //     // // If the countdown timer has expired, stop the timer
//     //     // if (timer === 0) {
//     //     //     clearInterval(timerId);
//     //     // }
//     //     //
//     //     // setTimer(timer-1);
//     //
//     // }, 1000);
//
//     return (
//         <>
//             {showTerminal ?
//                 <div id="xterm"></div> :
//                 <div>{terminalPlaceholder}</div>
//             }
//             <div>Remaining time: {count}</div>
//         </>
//     )
// }

function Trynownew() {
    const location = useLocation()

    const query = new URLSearchParams(location.search);
    const podId = query.get("id");

    const wsUrl = "ws://localhost:5001";
    const divRef = useRef();
    const xtermRef = useRef();

    const [socket, setSocketInstance] = useState("");
    const [timediff, setTimeDiff] = useState(0);
    const [containerCreationTime, setContainerCreationTime] = useState(0);
    const [currentCounts, setCurrentCounts] = useState(0);
    const allowedSec = 30;

    const xterm = (xtermRef.current = new Terminal({
        screenKeys: true,
        useStyle: true,
        cursorBlink: true,
        fullscreenWin: true,
        maximizeWin: true,
        cols: 128
    }));

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);

    useEffect(() => {
        // If count is 0, do not set another timeout to stop the countdown
        if (containerCreationTime === 0 || allowedSec - timediff <= 0) return;

        let a = moment(containerCreationTime);
        let c = moment(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));

        // Set a timeout to decrement the count every second
        const timerId = setTimeout(() => setTimeDiff((c - a) / 1000), 1000);

        // Clear the timeout if the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [timediff, containerCreationTime]);

    useEffect(() => {

        axios({
            url: BASE_URL + "/docker/" + podId,
            method: "GET",
        }).then((res) => {
            console.log(res);
            setContainerCreationTime(res.data.success.created_at);
        }).catch((err) => {
            console.log(err);
        })

        axios({
            url: BASE_URL + "/docker",
            method: "GET",
        }).then((res) => {
            console.log(res);
            setCurrentCounts(res.data.success);
        }).catch((err) => {
            console.log(err);
        })

    }, [])

    useEffect(() => {
        const socket = io(wsUrl, {
            transports: ["websocket"],
            cors: {
                origin: "http://localhost:3001/",
            },
        });

        setSocketInstance(socket);

        socket.emit("init_console", podId);

        return () => socket.close();

    }, [setSocketInstance])

    useEffect(() => {
        if (socket) {

            // socket.binaryType = "arraybuffer";
            socket.on("message", (data) => {
                if (typeof data === "string") {
                    xterm.write(data);
                } else {
                    xterm.write(new Uint8Array(data));
                }
            });

            let command = "";
            xterm.onData((data) => {
                // xterm.write(data);
                // if (data === '\r') {
                //     xterm.write("\n");
                //     socket.emit("handle_command", command);
                //     command = "";
                // } else {
                //     command += data;
                // }
                socket.emit("handle_command", data);

            });

            socket.on("terminal_ready", (data) => {
                xterm._initialized = true;
                xterm.focus();
                setTimeout(function () {
                    fitAddon.fit()
                });
                xterm.onResize(function (event) {
                    const size = JSON.stringify({cols: event.cols, rows: event.rows + 1});
                    const send = new TextEncoder().encode("\x01" + size);
                    // socket.send(send);
                })
                xterm.onTitleChange(function (event) {
                });
                window.onresize = function () {
                    fitAddon.fit();
                }
                xterm.open(divRef.current);

            })
        }
    }, [socket]);

    function convertSecondsToMinutesAndSeconds(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        // Format the minutes and seconds to always include two digits
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');

        return `${formattedMinutes} Minutes, ${formattedSeconds} Seconds`;
    }

    return (
        <>

            <div ref={divRef}/>
            <div>Remaining time: {convertSecondsToMinutesAndSeconds(allowedSec - timediff)}</div>
            <div>Current active sessions: {currentCounts}</div>
        </>
    );
}

export default Trynownew;