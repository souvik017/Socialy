import { useEffect, useState } from "react";
import hero2 from "../../assets/hero2.png"
import socialyBackground from "../../assets/socialyBackground.png"
import axios from "axios"
import { useNavigate } from "react-router-dom";
const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {email, password}
       
      const response = await axios.post(`${API_URL}/user/login`,data, {
       });
      if (response.status === 200) {
      console.log(response);
       setEmail('')
       setPassword('')
       navigate("/")
       localStorage.setItem('token', response.data.token);
       localStorage.setItem('Id', response.data.user._id);
      } else {
        console.log("Unexpected response status:", response.status);
      }
    } catch (error) {
      console.log("Error in login" , error)
    }
  }

  useEffect(() => {
    const authToken = localStorage.getItem('token');
    console.log(authToken);

    if (authToken) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="bg-[#212121]  h-screen sm:h-screen  ">
    <div className="lg:h-full py-8 px-[10%] pt-[5%] flex flex-col sm:flex-row ">

         <div className="w-full sm:w-[60%] h-full lg:h-full md:h-[50%] ">
         <div className=" w-56 mx-12 my-4 lg:w-[70%] md:w-[50%] h-[40%] sm:h-[50%]">
          <img src={hero2} alt="backgrond" className='w-[60%] md:w-[60%] object-contain'/>
          </div>
          <div className="py-4 px-2 mx-16 mt-4 sm:mt-8 mx-auto w-[80%] lg:w-[80%] text-[1rem]  lg:text-[1.5rem] md:text-[1rem] font-mono  ">
            <h1 className=" animate-typing whitespace-nowrap overflow-hidden text-white font-bold mb-2 ">
              Connect easily with </h1>
              <h1 className=" animate-typing whitespace-nowrap overflow-hidden text-white font-bold mb-2 ">
               your family and friends</h1>
              <h1 className=" animate-typing whitespace-nowrap overflow-hidden text-white font-bold ">
              over countries</h1>
            </div>
          
         </div>
         <div className="w-[100%] sm:w-[50%] sm:p-[1%]">
         <div className = " h-full w-full bg-gray-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100">

         <div className=" flex min-h-full flex-1 flex-col justify-center px-[0%]  bg-blue-500 rounded-md h-full w-full">
         <img src={socialyBackground} alt="background" className="absolute h-full w-full boder-green-600 border-2 px-0 rounded-md" />
      <div className="flex min-h-full flex-1 flex-col justify-center px-[2%]  py-[8%] lg:py-[4%] lg:px-[6%] relative sm:mx-[5%] ">
      
        
        {/* {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}
        {loading && (
          <div className="py-2 rounded">
            <Loading />
          </div>
        )} */}

        <div className="sm:mx-auto sm:w-full">
          <div className="text-center">
            <a
              className="mt-[4%] text-center text-[2rem] sm:text-[2.5rem] font-bold leading-9 tracking-tight text-gray-100 tracking-widest"
              href="/"
            >
              Socialy
            </a>
          </div>

          <h2 className="mt-[5%] sm:mt-[6%] text-center text-[1rem] font-bold leading-9 tracking-tight text-gray-100">
            Log in to your account
          </h2>
        </div>

        <div className="mt-[4%] mx-[5%] ">
          <form className="space-y-6" >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Email address
              </label>
              <div className="mt-[2%]">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-black shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-200 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-100"
                >
                  Password
                </label>
                <div className="text-sm">
                  <a
                    href="/forgetpassword"
                    className="font-semibold text-gray-100 hover:text-indigo-300"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-[2%]">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-200 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex w-full justify-center rounded-md bg-blue-400 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="flex justify-center gap-2 my-4">
           {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p className="text-gray-100">Didn't have an account?</p>
            <a href="/register" className="text-gray-100 hover:underline ">
              Signup
            </a>
          </div>
        </div>
      </div>
    </div>
          </div>
        </div>
    </div>
  </div>
  )
}

export default Login
