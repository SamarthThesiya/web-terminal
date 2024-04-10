import './App.css';
import axios from "axios";
import {useEffect, useState} from "react";
import {BASE_URL} from "./consts";
import {io} from "socket.io-client";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./page/Home";
import Trynow from "./page/Trynow";
import Trynownew from "./page/Trynow-new";

function App() {

    // const [socketInstance, setSocketInstance] = useState("");
    //
    // useEffect(() => {
    //     const socket = io("ws://localhost:5000", {
    //         transports: ["websocket"],
    //         cors: {
    //             origin: "http://localhost:3000/",
    //         },
    //     });
    //
    //     setSocketInstance(socket);
    //
    //     socket.on("message",(data) => {
    //         console.log(data)
    //     });
    //
    //     return () => socket.close();
    //
    // }, [setSocketInstance])

    // function tryNow(event) {
    //     axios({
    //         url: BASE_URL + "/docker",
    //         method: "POST",
    //     }).then((res) => {
    //         console.log(res);
    //     }).catch((err) => {
    //         console.log(err);
    //     })
    // }

    // function sendToServer(event) {
    //     socketInstance.emit("message", "Hello");
    // }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" Component={Home}/>
                <Route path="/trynow" Component={Trynownew}/>
            </Routes>
        </BrowserRouter>
    );

    // return (
    //     <div className="App">
    //         <button onClick={tryNow}>Try now</button>
    //         <button onClick={sendToServer}>Send to Server</button>
    //     </div>
    // );
}

export default App;
