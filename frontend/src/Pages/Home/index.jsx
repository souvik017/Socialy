import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatCard from '../../components/ChatCard';
import { FaSearch } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import ChatPlace from '../../components/ChatPlace';
import { ImCross } from "react-icons/im";
import SearchChatCard from '../../components/SearchChatCard';
const Home = () => {
const [SearchOpen, setSearchOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('');
const [ProfileOpen, setProfileOpen] = useState(false)
const [rotate, setRotate] = useState(false);
const [allChat, setAllChat] = useState({});
const [reciverData, setreciverData] = useState()

// console.log("reciverdata :" , reciverData)
// console.log("this is allChat", allChat);
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('token');

    if (!authToken) {
      console.error('Token not found in localStorage');
      navigate('/login');
    }
  }, [navigate]); // Added navigate as a dependency to ensure it's correctly referenced
 
  const toggleSearch = ()=> {
    if(!SearchOpen){
      setSearchOpen(true)
      setProfileOpen(false)
    }else{
      setSearchOpen(false)
      setSearchQuery("")
    }
  }
  const toggleProfile = () => {
    setRotate(true); // Trigger rotation animation
    setTimeout(() => setRotate(false), 300); // Reset rotation after 1 second
    setProfileOpen(!ProfileOpen);
    if (SearchOpen) {
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className='w-[100%] h-screen flex flex-row bg-[#212121]'>

<div className='w-[100%] h-full md:w-[30%] shadow-md flex flex-col gap-1 '>

<div className='h-[8%] text-xl flex flex-row items-center px-8 justify-between '>
  <div className='text-blue-500 font-bold text-3xl'>
    <p>S</p>
  </div>
  <div>
    <div className='flex flex-row gap-4 items-center'>
      {SearchOpen ?
      (<input type="text" className='outline-none  bg-[#2C2C2C] text-white  text-sm px-4 py-2 w-56 rounded-lg transition ease-in'
        onChange={handleSearchChange}
        placeholder='Search user'/>)
      : null }
      <p className='text-white' onClick={toggleSearch}><FaSearch /></p>
      <p
                className={`text-white ${rotate ? 'animate-rotate360' : ''}`}
                onClick={toggleProfile}
              >
                {ProfileOpen ? <ImCross /> : <FaUser />}
              </p>
   
  
    </div>
  </div>
</div>

{!SearchOpen && !ProfileOpen ? (
          <div className='flex flex-col h-full px-2 items-center'>
            <ChatCard 
            setAllChat={setAllChat}
            setreciverData={setreciverData}/>
          </div>
        ) : SearchOpen ? (
          <div className='flex flex-col h-full px-2 items-center'>
            <SearchChatCard
            searchQuery={searchQuery}
            setSearchOpen = { setSearchOpen }
            />
          </div>
        ) : (
          <div className='flex flex-col h-full px-2 items-center'>
            {/* <ProfileCard /> */}
            <p>heloo from profile</p>
          </div>
        )}
</div>
<div className='md:w-[70%] shadow-md hidden md:block'>
<ChatPlace 
reciverData={reciverData}
 />
</div>
    </div>
  )
}

export default Home
