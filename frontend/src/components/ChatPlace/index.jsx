import { useEffect, useRef, useState } from 'react';
import PropTypes from "prop-types";
import Sender from "../Sender/index.jsx";
import { CgProfile } from "react-icons/cg";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaPaperPlane } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import ScrollableFeed from 'react-scrollable-feed';
import InputEmoji from "react-input-emoji";
import { IoMdAttach } from "react-icons/io";
import axios from 'axios';
import io from "socket.io-client";
import Loading from '../Loading/index.jsx';

// import socketIOClient from "socket.io-client";


const ENDPOINT = "http://localhost:3000";
let socket, selectedChatCompare;

const ChatPlace = ({ reciverData , setShowChatPlace }) => {
  const [content, setContent] = useState("");
  const [socketConnected, setsocketConnected] = useState(false)
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const API_URL = import.meta.env.VITE_API_URL;
  const UserId = localStorage.getItem('Id');
  const chatId = reciverData?._id;
  const typingTimeoutRef = useRef(null);

 

  console.log("mssg",messages);
  console.log(isTyping);
 

  const handleOnEnter = async () => {
     
    const token = localStorage.getItem('token');
    try {
      socket.emit("stop typing", chatId)
      const response = await axios.post(`${API_URL}/message/sendmessage`, { content, chatId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const msg = response.data
      console.log("msg",msg)
      socket.emit("new message", msg);
      setContent("");
      setMessages((prev)=>[...prev, msg]);
    } catch (error) {
      console.error('Error sending message:', error);
    } 
    }
 
  const getSender = (Id, members) => {
    return members[0]._id === Id ? members[1].name : members[0].name;
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", UserId);
    socket.on("connected", () =>{
      console.log("Socket connected")
      setsocketConnected(true)
    });
  
    socket.on("typing", () => {
      setIsTyping(true);
    });

    socket.on("stop typing", () => {
      setIsTyping(false);
  });

    socket.on("message received", (newMessageReceived) => {
      console.log(newMessageReceived)
        setMessages((prev)=>[...prev, newMessageReceived]);
        console.log(messages);
        console.log("message added")
      
    });

    return () => {
      socket.off("connected");
      socket.off("message received"); 
      socket.off('typing');
      socket.off('stopTyping');
    };
  },[]);

  useEffect(() => {
    if (chatId) {
      selectedChatCompare = reciverData;
      const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        try {
          const { data } = await axios.get(`${API_URL}/message/${chatId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setMessages(data);
          setLoading(false)
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [chatId, API_URL, reciverData]);


  const typingHandler = (text) => {
    setContent(text);
  
    if (!socketConnected) return;
  
    
    if(!typing){
      setTyping(true);
      socket.emit("typing", chatId);
    }
    // Clear previous timeout if exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  
    // Set new timeout to emit 'stop typing' event
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", chatId);
      setTyping(false);
      setIsTyping(false);
    }, 1000);
  };

  const handleBack = () => {
    setShowChatPlace(false)
  }

  // if (loading) {
  //   return <div className='flex justify-center'><Loading /></div>;
  // }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="bgImage h-full w-full">
      {reciverData === undefined ? (
        <div className="w-full h-full">
          <div className="w-full h-full text-white text-2xl flex justify-center m-auto items-center">
            <p>Send Your Message in socialyyyyyy and get connected</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
          <div className="w-full h-[8%] bg-[#212121] flex justify-between items-center px-8">
            <div className="flex flex-row items-center gap-2">
              <div onClick={handleBack} className='text-white px-2 text-2xl'>
                <p><FaArrowLeft /></p>
              </div>
              <div className='flex gap-2 items-center'>
              <div className="text-white text-4xl">
                <CgProfile />
              </div>
              <div className='flex gap-2 items-center'>
                <p className="text-white text-xl font-semibold">
                  {getSender(UserId, reciverData.members)}
                </p>
                {isTyping ? (<div className='text-white text-md font-bold flex justify-center'>typing...</div>) : null}
              </div>
              </div>
            </div>
            <div className="text-white font-bold text-2xl cursor-pointer">
              <BsThreeDotsVertical />
            </div>
          </div>
          <div className="h-[84%] flex w-full px-4">
            {messages.length > 0 ? (
              <div className='w-full h-full'>
              <ScrollableFeed className="w-full h-full">
                {messages.map((item) => (
                  <div key={item._id} className="w-full">
                    <Sender item={item}/>
                  </div>
                ))}

              </ScrollableFeed>
              </div>
            ) : (
              <div className="w-full h-full text-white text-2xl flex justify-center m-auto items-center">
                <p>Send Your Message and get connected</p>
              </div>
            )}

          </div>

          <div className="flex h-[8%] px-4 bg-[#212121] items-center">
            <div className="text-2xl text-white font-semibold">
              <IoMdAttach />
            </div>
            <div className="w-full items-center">
               <InputEmoji
                value={content}
                onChange={typingHandler}
                cleanOnEnter
                onEnter={handleOnEnter}
                placeholder="Type a message"
                height={20}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ChatPlace.propTypes = {
  chat: PropTypes.any,
  reciverData: PropTypes.any,
  setShowChatPlace: PropTypes.any,
};

export default ChatPlace;
