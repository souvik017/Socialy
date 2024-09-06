import axios from "axios";
import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FaPen } from "react-icons/fa";
const Profile = () => {

    const [user, setUser] = useState();
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const UserId = localStorage.getItem('Id');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token'); // Get the token from localStorage
      
            if (!token) {
              setError(new Error('Token not found'));
              return;
            }
      
            try {
              const response = await axios.get(`${API_URL}/user/${UserId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              setUser(response.data);
            } catch (error) {
              console.error('Error fetching data:', error); // Debug: Log error
              setError(error);
            }}

            fetchData();

    },[])
    
    // console.log({user})

  return (
    <div className="w-full h-full">
      <div className="w-full h-[20%] text-white text-[7rem] flex justify-center items-center relative">
        <CgProfile/>
        <div className="absolute text-[1.5rem] w-[30%] h-[80%] flex justify-end items-end text-gray-600">
       <button className="bg-gray-200 p-2 rounded-3xl  hover:bg-blend-darken z-10">
       <FaPen />
       </button>
        </div>
      </div>
      <div className="w-full h-[20%] text-white text-[1.5rem] flex-col flex justify-center items-center gap-4  ">
        <div className="relative w-full h-[50%] flex justify-center items-center"> <p> {user?.name} </p> 
        <div className="absolute text-[1rem] w-[50%] h-[80%] flex justify-end items-center text-gray-400">
       <button className="z-10">
       <FaPen />
       </button>
        </div>
        </div>
       <div> <p>{user?.email}</p> </div>
      </div>
    </div>
  )
}

export default Profile
