

const Loading = () => {
  return (
    <div className="text-white flex flex-row items-center my-4">
    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
     <circle
       className="opacity-25"
       cx="12"
       cy="12"
       r="10"
       stroke="currentColor"
       strokeWidth="4"
     ></circle>
     <path
       className="opacity-75"
       fill="currentColor"
       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l-2.833 2.032A10.004 10.004 0 002 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
     ></path>
   </svg>
<p> Loading...</p>

</div>
  )
}

export default Loading
