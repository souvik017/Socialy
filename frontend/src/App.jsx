import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Login from "./Pages/Login"
import SignIn from "./Pages/SignIn"
import Home from './Pages/Home'

// import axios from 'axios';

function App() {


  

  return (
    <>
     <BrowserRouter>
   <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home/>} />
        <Route path="/register" element={<SignIn />} />
      </Routes>
  </BrowserRouter>
     </>
  )
}

export default App


