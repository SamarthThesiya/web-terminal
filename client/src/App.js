import './App.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./page/Home";
import Trynow from "./page/Trynow";

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" Component={Home}/>
                <Route path="/trynow" Component={Trynow}/>
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
