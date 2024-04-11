import {useLocation} from "react-router-dom";
import axios from "axios";
import {BASE_URL} from "../consts";
import {Terminal} from 'xterm';
import {useEffect, useRef, useState} from "react";
import {FitAddon} from "xterm-addon-fit";

import 'xterm/css/xterm.css';
import './Trynow.css';
import {io} from "socket.io-client";
import moment from 'moment';

function Trynow() {
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
    const [maxCounts, setMaxCounts] = useState(0);
    const [terminalPlaceholder, setTerminalPlaceholder] = useState("Terminal loading...");
    const allowedSec = 60;

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
        function sleep(seconds) {
            return new Promise(resolve => setTimeout(resolve, seconds * 1000));
        }

        if (containerCreationTime === 0) return;

        let a = moment(containerCreationTime);
        let c = moment(moment.utc().add(1, 'seconds').format('YYYY-MM-DDTHH:mm:ss'));

        // Set a timeout to decrement the count every second
        const timerId = setTimeout(() => {
            setTimeDiff((c - a) / 1000);

            updateCurrentCount();
        }, 1000);

        // Clear the timeout if the component unmounts to prevent memory leaks
        return () => clearTimeout(timerId);
    }, [timediff, containerCreationTime]);

    function updateCurrentCount() {

        axios({
            url: BASE_URL + "/docker",
            method: "GET",
        }).then((res) => {
            setCurrentCounts(res.data.current_count);
            setMaxCounts(res.data.max_count);
        }).catch((err) => {
            console.log(err);
        })
    }

    useEffect(() => {

        divRef.current.style.display = 'none';

        axios({
            url: BASE_URL + "/docker/" + podId,
            method: "GET",
        }).then((res) => {
            setContainerCreationTime(res.data.success.created_at);
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

            xterm.onData((data) => {
                socket.emit("handle_command", data);
            });

            socket.on("terminal_ready", (data) => {
                xterm._initialized = true;
                xterm.focus();
                setTimeout(function () {
                    fitAddon.fit()
                });
                xterm.onTitleChange(function (event) {
                });
                window.onresize = function () {
                    fitAddon.fit();
                }

                divRef.current.style.display = 'block';
                setTerminalPlaceholder("");
                xterm.open(divRef.current);

            })

            socket.on("terminal_kill", (date) => {
                divRef.current.style.display = 'none';
                setTerminalPlaceholder("Terminal terminated!");
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
            <div>{terminalPlaceholder}</div>
            {
                timediff <= allowedSec ?
                    <div>Remaining time: {convertSecondsToMinutesAndSeconds(allowedSec - timediff)}</div> :
                    <div>Container will be terminated within a minute</div>
            }

            <div>Current active sessions: {currentCounts}</div>
            <div>Max sessions: {maxCounts}</div>
        </>
    );
}

export default Trynow;