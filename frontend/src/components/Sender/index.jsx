import PropTypes from "prop-types";

const Sender = ({ item  }) => {
  // console.log(item);
  const UserId = localStorage.getItem('Id');
  const isUserMessage = item.creator._id === UserId;
  const messageBgClass = isUserMessage ?  ' border-2 border-blue-600 bg-[#272727]' : ' border-2 border-red-600 bg-[#272727]';
  const messageAlign = isUserMessage ? 'justify-end' : 'justify-start ';
  return (
    <div className={`${messageAlign} flex w-full`}>
      <div className={`${messageBgClass} text-white w-fit px-4 py-2 rounded-md m-2 flex `}>
        <p>{item.content}</p>
      </div>
    </div>    
  );
};

Sender.propTypes = {
    item: PropTypes.object,}
     
export default Sender
