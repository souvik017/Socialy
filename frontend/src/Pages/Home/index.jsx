import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatCard from '../../components/ChatCard';
import { FaSearch } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import ChatPlace from '../../components/ChatPlace';
import { ImCross } from "react-icons/im";
import SearchChatCard from '../../components/SearchChatCard';
import Profile from '../../components/Profile';
import { PiUsersThreeDuotone } from "react-icons/pi";
import GrpModal from '../../components/GrpModal';

const Home = () => {
const [SearchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [ProfileOpen, setProfileOpen] = useState(false);
const [rotate, setRotate] = useState(false);
const [allChat, setAllChat] = useState({});
const [reciverData, setreciverData] = useState();
const [showChatPlace, setShowChatPlace] = useState(false);
const [isMobileScreen, setIsMobileScreen] = useState(false);
const [createGrpModal, setCreateGrpModal] = useState(false);



// console.log("reciverdata :" , reciverData)
// console.log("this is allChat", allChat);
console.log(isMobileScreen)
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

  const checkScreenSize = () => {
    const mobileMaxWidth = 768; // Define the max width for mobile devices
    const screenWidth = window.innerWidth;
    setIsMobileScreen(screenWidth <= mobileMaxWidth);
  };

  // Use useEffect to call checkScreenSize on mount and on window resize
  useEffect(() => {
    checkScreenSize(); // Check screen size on component mount

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
   if(!isMobileScreen){
    setShowChatPlace(false)
   }
  }, [isMobileScreen]);
  

  const handleShowChat = () =>{
    if(isMobileScreen){
      setShowChatPlace(true)}
    }

    const toggleCreateGrpModal = () => {
      setCreateGrpModal(!createGrpModal);
    };

  return (
    <div className='w-[100%] h-screen flex flex-row  bg-[#212121]'>
{!showChatPlace && (
  <div className='w-[100%] h-full md:w-[30%] shadow-md flex flex-col gap-1 '>

<div className='h-[8%] text-xl flex flex-row items-center px-8 justify-between'>
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

{!SearchOpen && !ProfileOpen ?  (

         <div className='flex flex-col h-full px-2 items-center relative'
         >

            <ChatCard 
            setAllChat={setAllChat}
            setreciverData={setreciverData}
            handleShowChat={() => handleShowChat()}
          />

          <div className='absolute flex justify-end items-end w-[20%] h-[15%] place-self-end  bottom-[10vh] right-[2vw]'> 
            <button className='text-white text-[2.5rem] p-2 bg-blue-600 rounded-3xl'
            onClick={toggleCreateGrpModal}>
            <PiUsersThreeDuotone />
            </button>
          </div>

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
            <Profile/>
            {/* <p>heloo from profile</p> */}
          </div>
        )}
</div>)
}
<div className='md:w-[70%] shadow-md hidden md:block'>
<ChatPlace 
reciverData={reciverData}
setShowChatPlace={setShowChatPlace}
 />
</div>

{ showChatPlace ? (
    <div className='w-screen shadow-md block md:hidden '>
<ChatPlace 
reciverData={reciverData}
setShowChatPlace={setShowChatPlace}
 />
</div>
  ): null
}

<GrpModal isOpen={createGrpModal} onClose={toggleCreateGrpModal} />
    </div>
    
  )
}

export default Home
