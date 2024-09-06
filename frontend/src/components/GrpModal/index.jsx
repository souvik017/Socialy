import PropTypes from "prop-types";

const GrpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
    <div className='bg-white p-2 rounded-lg shadow-lg text-black w-[30vw] flex flex-col gap-4'>
        <div className="flex justify-between"> 
            <div className="font-semibold text-[1.2rem]"><p>Create New Group</p></div>
            <div>
            <button
        onClick={onClose}
        className='top-2 right-2 text-gray-600 hover:text-gray-800'
      >
       x
      </button>
            </div>
        </div>
      
      <div>
        <input
          type="text"
          placeholder="Enter text"
          className='block w-full mb-4 p-2 border border-gray-300 rounded'
        />
        <input         
          type="text"
          placeholder="Enter more text"
          className='block w-full p-2 border border-gray-300 rounded'
        />
      </div>
    </div>
  </div>
);
};
GrpModal.propTypes = {
    isOpen: PropTypes.any,
    onClose: PropTypes.any
  }
export default GrpModal
