import axios from "axios";
import {BASE_URL} from "../consts";
import { useNavigate } from "react-router";
import {useEffect, useState} from "react";

function Home() {

    const navigate = useNavigate();

    const [currentCounts, setCurrentCounts] = useState(0);
    const [maxCounts, setMaxCounts] = useState(0);
    const [apiMessage, setApiMessage] = useState("");

    useEffect(() => {

        axios({
            url: BASE_URL + "/docker",
            method: "GET",
        }).then((res) => {
            setCurrentCounts(res.data.current_count);
            setMaxCounts(res.data.max_count);
        }).catch((err) => {
            console.log(err);
        })

    }, [])

    function onTryNow(event) {
        axios({
            url: BASE_URL + "/docker",
            method: "POST",
        }).then((res) => {
            navigate("/trynow?id=" + res.data.id);
        }).catch((err) => {
            console.log(err);
            setApiMessage(err.response.data.message);
        })
    }

    return (
        <>
            <button onClick={onTryNow}>Try Now</button>

            <div>Current active sessions: {currentCounts}</div>
            <div>Max sessions: {maxCounts}</div>

            <div>{apiMessage}</div>
        </>
    )
}

export default Home;