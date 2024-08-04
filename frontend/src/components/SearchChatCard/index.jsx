import PropTypes from "prop-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import Loading from "../Loading";


const SearchChatCard = ({searchQuery , setSearchOpen}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        // Define the async function inside the useEffect
        const fetchData = async () => {
          const token = localStorage.getItem('token'); // Get the token from localStorage
    
          if (!token) {
            setError(new Error('Token not found'));
            setLoading(false);
            return;
          }
    
          try {
            const response = await axios.get(`${API_URL}/user/alluser?search=${searchQuery}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('Fetched data:', response.data); // Debug: Log fetched data
            setData(response.data);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching data:', error); // Debug: Log error
            setError(error);
            setLoading(false);
          }
        };
    
        // Call the async function
        fetchData();
      }, [searchQuery]);

      const accessChat = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) {
          setError(new Error('Token not found'));
          return;
        }
    
        try {
          await axios.post(`${API_URL}/chat/`, { userId }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSearchOpen(false);
          console.log('Chat accessed successfully');
        } catch (error) {
          console.error('Error accessing chat data:', error);
          setError(error);
        }
      };
    

      if (loading) {
        return <div><Loading/></div>;
      }
    
      if (error) {
        return <div>Error: {error.message}</div>;
      }


      
    return (
        <div className="w-full h-full">
        {data.length === 0 ? (
    <div className="text-white flex justify-center text-xl mt-4">
      No user found
    </div>
  ) : (
        data.map(item => (
        <div 
        key={item._id}
        className="w-full h-[10%] shadow-md flex gap-4 items-center px-4 py-2 m-1 cursor-pointer"
         onClick={() => accessChat(item._id)}>
        <div className="text-white text-4xl">
        <p><CgProfile/></p>
        </div>
        <div className="text-white flex flex-col overflow-hidden px-2 ">
            <p className="font-semibold text-[1.2rem]">{item.name}</p>
            <p className="text-sm text-[#98AAAA]  overflow-hidden whitespace-nowrap text-ellipsis">{item.email}</p>
        </div>
        </div>
     )))}
        </div>
      )
    }

    SearchChatCard.propTypes = {
        searchQuery: PropTypes.string,
        setSearchOpen: PropTypes.function
      }

export default SearchChatCard;
  