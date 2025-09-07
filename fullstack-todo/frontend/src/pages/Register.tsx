import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // for redirecting after success

function Register() {
    const navigate = useNavigate();

    //Form state
    const [username, setUsername] = useState("")
    
}