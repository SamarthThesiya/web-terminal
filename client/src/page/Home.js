import axios from "axios";
import {BASE_URL} from "../consts";
import { useNavigate } from "react-router";
import {useEffect, useState} from "react";

function Home() {

    const navigate = useNavigate();

    const [currentCounts, setCurrentCounts] = useState(0);

    useEffect(() => {

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

    function onTryNow(event) {
        axios({
            url: BASE_URL + "/docker",
            method: "POST",
        }).then((res) => {
            console.log(res);
            navigate("/trynow?id=" + res.data.id);
        }).catch((err) => {
            console.log(err);
        })
    }

    return (
        <>
            <button onClick={onTryNow}>Try Now</button>

            <div>Current active sessions: {currentCounts}</div>
        </>
    )
}

export default Home;