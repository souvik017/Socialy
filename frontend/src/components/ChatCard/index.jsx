import { CgProfile } from "react-icons/cg";
import PropTypes from "prop-types";
import Loading from "../Loading";
import { useEffect, useState } from "react";
import axios from "axios";

import io from "socket.io-client"


const ENDPOINT = "http://localhost:3000";
var socket;


const ChatCard = ({setAllChat , setreciverData, handleShowChat }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  // setLatestMessage(lastMessage);

  const API_URL = import.meta.env.VITE_API_URL;
  const UserId = localStorage.getItem('Id');

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", UserId)
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); // Get the token from localStorage

      if (!token) {
        setError(new Error('Token not found'));
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/chat/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched data:', response.data); // Debug: Log fetched data
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error); // Debug: Log error
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  },[]);

  const showChat = async (chatId , chat) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError(new Error('Token not found'));
      return;
    }

    try {
      const allChat = await axios.get(`${API_URL}/message/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(allChat)
      setreciverData(chat)
      socket.emit("join Chat", chatId)
      setAllChat(allChat.data);
      console.log('Fetched allchat data:', allChat); // Debug: Log fetched data
    } catch (error) {
      console.error('Error fetching chat data:', error); // Debug: Log error
      setError(error);
    }
  };

  if (loading) {
    return <div><Loading /></div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

const getSender = (Id , members)=>{
 return members[0]._id === Id ? members[1].name : members[0].name;
}

 
  
  return (
    <div className="w-full h-full relative">
      {data.length === 0 ? (
        <div className="text-white flex justify-center text-xl mt-4">
          No user found
        </div>
      ) : (
        data.map(item => (
          <div
  key={item._id}
  className="w-full h-[10%] shadow-md flex gap-4 items-center px-4 py-2 m-1 cursor-pointer"
  onClick={() => {
    showChat(item._id, item);
    handleShowChat();
  }}
>
            <div className="text-white text-4xl">
              <p><CgProfile /></p>
            </div>
            <div className="text-white flex flex-col overflow-hidden px-2">
              <p className="font-semibold text-[1.2rem]">
                {!item.groupChat
                ? getSender(UserId, item.members)
              : item.name}
              </p>
              <p className="text-sm text-[#98AAAA] overflow-hidden whitespace-nowrap text-ellipsis">
                {item.latestMessage?.content}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
ChatCard.propTypes = {
  setAllChat: PropTypes.any,
  setreciverData: PropTypes.any,
  handleShowChat:PropTypes.func,
}

export default ChatCard;