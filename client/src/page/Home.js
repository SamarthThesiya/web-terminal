import axios from "axios";
import {BASE_URL} from "../consts";
import { useNavigate } from "react-router";

function Home() {

    const navigate = useNavigate();

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
        </>
    )
}

export default Home;