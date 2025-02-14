import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import Avatar from './Avatar'
import { HiDotsVertical } from "react-icons/hi";
import { FaAngleLeft } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";
import { FaImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa6";
import uploadFile from '../helpers/uploadFile';
import { IoClose } from "react-icons/io5";
import Loading from './Loading';
import backgroundImage from '../assets/wallapaper.jpeg'
import EmojiPicker from 'emoji-picker-react';
import { BsEmojiSmile } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import TypingIndicator from './Typingindicator';
import { useDispatch } from 'react-redux';
import { setOnlineUser, updateLastSeen } from '../redux/userSlice';
import moment from 'moment'
const MessageStatus = ({ status }) => {
  // Add margin to align with message
  const statusColors = {
    sent: "text-gray-400",
    delivered: "text-gray-500",
    seen: "text-blue-500"
  };
  
  return (
    <div className={`flex items-center gap-1 ${statusColors[status]}`}>
      {status === 'sent' && <span>✓</span>}
      {status === 'delivered' && <span>✓✓</span>}
      {status === 'seen' && <span>✓✓</span>}
    </div>
  );
};

const TimestampDivider = ({ date }) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-gray-200 rounded-full px-3 py-1">
      <span className="text-xs text-gray-600">
        {moment(date).calendar(null, {
          sameDay: '[Today]',
          lastDay: '[Yesterday]',
          lastWeek: 'dddd',
          sameElse: 'MMMM D, YYYY'
        })}
      </span>
    </div>
  </div>
);
const MessagePage = () => {
  const dispatch = useDispatch();
  const params = useParams()
  const socketConnection = useSelector(state => state?.user?.socketConnection)
  const user = useSelector(state => state?.user)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  })
  const [isTyping, setIsTyping] = useState(false);
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false)
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false)
  const [allMessage, setAllMessage] = useState([]);
  const currentMessage = useRef(null)

  const onEmojiClick = (emojiObject) => {
    setMessage(prev => ({
      ...prev,
      text: prev.text + emojiObject.emoji
    }));
  };

  // Close emoji picker when clicking outside
  const emojiPickerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [allMessage])

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(preve => !preve)
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        imageUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadImage = () => {
    setMessage(preve => {
      return {
        ...preve,
        imageUrl: ""
      }
    })
  }

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0]

    setLoading(true)
    const uploadPhoto = await uploadFile(file)
    setLoading(false)
    setOpenImageVideoUpload(false)

    setMessage(preve => {
      return {
        ...preve,
        videoUrl: uploadPhoto.url
      }
    })
  }
  const handleClearUploadVideo = () => {
    setMessage(preve => {
      return {
        ...preve,
        videoUrl: ""
      }
    })
  }
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


useEffect(() => {
  if (socketConnection) {
    // Clear messages when mounting or switching conversations
    setAllMessage([]); 

    // Initial setup
    socketConnection.emit('message-page', params.userId);
    socketConnection.emit('seen', params.userId);

    // Handle user data
    socketConnection.on('message-user', (data) => {
      setDataUser(data);
    });

    // Handle messages
    socketConnection.on('message', (newMessage) => {
      if (Array.isArray(newMessage)) {
        // Handle initial message load
        setAllMessage(newMessage);
        socketConnection.emit('seen', params.userId);
      } else if (newMessage) {
        // Handle single new message
        setAllMessage(prev => {
          const messageExists = prev.some(msg => msg._id === newMessage._id);
          if (messageExists) return prev;
          const updatedMessages = [...prev, newMessage];
          
          // Mark message as seen if it's from current chat
          if (newMessage.msgByUserId === params.userId) {
            socketConnection.emit('seen', params.userId);
          }
          
          return updatedMessages;
        });
        scrollToBottom();
      }
    });

    // Handle message status updates
    socketConnection.on('message-status-update', ({ messageId, status }) => {
      setAllMessage(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });

    // Handle typing status
    socketConnection.on('typing', ({ userId }) => {
      if (userId === params.userId) {
        setIsTyping(true);
        // Clear typing indicator after 3 seconds
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    // Add typing event emission
    const messageInput = document.getElementById('messageInput');
    let typingTimeout;
    
    const handleTyping = () => {
      socketConnection.emit('typing', { receiverId: params.userId });
    };

    const debouncedTyping = () => {
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(handleTyping, 300);
    };

    if (messageInput) {
      messageInput.addEventListener('input', debouncedTyping);
    }

    // Cleanup
    return () => {
      socketConnection.off('message');
      socketConnection.off('message-user');
      socketConnection.off('message-status-update');
      socketConnection.off('typing');
      
      if (messageInput) {
        messageInput.removeEventListener('input', debouncedTyping);
      }
    };
  }
}, [socketConnection, params.userId, user?._id]);
  useEffect(() => {
    if (socketConnection) {
      socketConnection.on('onlineUsers', (onlineUserIds) => {
        dispatch(setOnlineUser(onlineUserIds));
      });
  
      socketConnection.on('lastSeen', (lastSeenData) => {
        // Convert the lastSeen object to our expected format
        const lastSeenUpdates = Object.entries(lastSeenData).map(([userId, timestamp]) => ({
          userId,
          timestamp
        }));
        dispatch(updateLastSeen(lastSeenUpdates));
      });
  
      return () => {
        socketConnection.off('onlineUsers');
        socketConnection.off('lastSeen');
      };
    }
  }, [socketConnection, dispatch]);


  const handleOnChange = (e) => {
    const { name, value } = e.target

    setMessage(preve => {
      return {
        ...preve,
        text: value
      }
    })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()

    if (message.text || message.imageUrl || message.videoUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          msgByUserId: user?._id
        })
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: ""
        })
      }
    }
  }
  useEffect(() => {
    console.log('Current messages:', allMessage);
  }, [allMessage]); // Log whenever messages change

  
  return (
    <div style={{ backgroundImage: `url(${backgroundImage})` }} className='bg-no-repeat bg-cover'>
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
  
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              imageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>


            {/* <p className='-my-2 text-sm'>
              {dataUser.online ? (
                <span className='text-primary'>online</span>
              ) : (
                <span className='text-slate-400'>
                  {dataUser.lastSeen ? (
                    moment(dataUser.lastSeen).calendar(null, {
                      sameDay: '[today at] LT',    // 'today at 2:30 PM'
                      lastDay: '[yesterday at] LT', // 'yesterday at 2:30 PM'
                      lastWeek: '[last] dddd',      // 'last Monday'
                      sameElse: 'MMM D'            // 'Feb 11'
                    })
                  ) : 'offline'}
                </span>
              )}
            </p> */}
           <p className='-my-2  text-sm'>
  {dataUser.online ? (
    <span className='text-primary'>online</span>
  ) : (
    <span className='text-slate-400'>
      {dataUser.lastSeen ? (
        moment(dataUser.lastSeen).calendar(null, {
          sameDay: '[last seen today at] hh:mm A',    // Will show "last seen today at 02:30 PM"
          lastDay: '[last seen yesterday at] hh:mm A', // Will show "last seen yesterday at 02:30 PM"
          lastWeek: '[last seen last] dddd [at] hh:mm A', // Will show "last seen last Monday at 02:30 PM"
          sameElse: '[last seen on] DD/MM/YYYY [at] hh:mm A'   // Will show "last seen on 15/02/2025 at 02:30 PM"
        })
      ) : 'offline'}
    </span>
  )}
</p>
          </div>
        </div>

        <div >
          <button className='cursor-pointer hover:text-primary'>
            <HiDotsVertical />
          </button>
        </div>
      </header>

      {/***show all message */}
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scrollbar relative bg-slate-200 bg-opacity-50'>


        {/**all message show here */}
        <div className='flex flex-col gap-2 py-2 mx-2' ref={currentMessage}>
         

{/* {allMessage.map((msg, index) => (
  <div key={msg._id} className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${
    user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"
  }`}>
    <div className='w-full relative'>
      {msg?.imageUrl && (
        <img
          src={msg?.imageUrl}
          className='w-full h-full object-scale-down'
          alt="message"
        />
      )}
      {msg?.videoUrl && (
        <video
          src={msg.videoUrl}
          className='w-full h-full object-scale-down'
          controls
        />
      )}
    </div>
    <p className='px-2'>{msg.text}</p>
    <div className='flex items-center justify-end gap-1 px-2'>
      <span className='text-xs'>
        {moment(msg.createdAt).format('hh:mm')}
      </span>
      {user._id === msg?.msgByUserId && (
        <span className="inline-block ml-1">
          <MessageStatus status={msg.status || 'sent'} />
        </span>
      )}
    </div>
  </div>
))} */}

{Array.isArray(allMessage) && allMessage.length > 0 ? (
  allMessage.map((msg, index) => {
    console.log('Rendering message:', msg); // Debug each message
    const showTimestamp = index === 0 || 
      !moment(msg?.createdAt).isSame(allMessage[index - 1]?.createdAt, 'day');

    return (
      <React.Fragment key={msg?._id || index}>
        {showTimestamp && msg?.createdAt && <TimestampDivider date={msg.createdAt} />}
        <div className={`p-3 rounded-lg w-fit max-w-[280px] md:max-w-sm lg:max-w-md  break-words ${
          user?._id === msg?.msgByUserId 
            ? "ml-auto bg-primary/10" 
            : "bg-white"
        }`}>
          <div className='w-full relative'>
            {msg?.imageUrl && (
              <img
                src={msg?.imageUrl}
                className='w-full h-full rounded-lg object-cover mb-1'
                alt="message"
              />
            )}
            {msg?.videoUrl && (
              <video
                src={msg.videoUrl}
                className='w-full h-full rounded-lg object-cover mb-1'
                controls
              />
            )}
          </div>
          {msg?.text && <p className='px-1 whitespace-pre-wrap break-words overflow-hidden'>{msg.text}</p>}
          <div className='flex items-center justify-end gap-1 px-1 mt-1'>
            <span className='text-xs text-gray-500'>
              {msg?.createdAt && moment(msg.createdAt).format('HH:mm')}
            </span>
            {user?._id === msg?.msgByUserId && (
              <span className="inline-block ml-1">
                <MessageStatus status={msg?.status || 'sent'} />
              </span>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  })
) : (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-500">No messages yet</p>
  </div>
)}
        </div>


        {/**upload Image display */}
        {
          message.imageUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <img
                  src={message.imageUrl}
                  alt='uploadImage'
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                />
              </div>
            </div>
          )
        }

        {/**upload video display */}
        {
          message.videoUrl && (
            <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-0 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
                <IoClose size={30} />
              </div>
              <div className='bg-white p-3'>
                <video
                  src={message.videoUrl}
                  className='aspect-square w-full h-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                />
              </div>
            </div>
          )
        }

        {
          loading && (
            <div className='w-full h-full flex sticky bottom-0 justify-center items-center'>
              <Loading />
            </div>
          )
        }
      </section>

     {/**send message */}
<section className='h-16 bg-white flex items-center px-4 shadow-lg  relative'>
{isTyping && (
    <div className="absolute -top-16 left-4 z-50">
      <div className="flex items-center space-x-2 px-4 py-2 bg-white/95 rounded-xl shadow-lg">
        <span className="text-sm text-gray-600">{dataUser.name} is typing</span>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )}
  <div className='relative'>
    <button 
      onClick={handleUploadImageVideoOpen} 
      className='flex justify-center items-center w-11 h-11 rounded-full hover:bg-gray-100 transition-colors'
    >
      <FaPlus size={20} className="text-gray-600" />
    </button>

    {openImageVideoUpload && (
      <div className='bg-white shadow-lg rounded-lg absolute bottom-14 w-40 p-2 transform transition-all'>
        <form>
          <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors'>
            <div className='text-primary'>
              <FaImage size={18} />
            </div>
            <p className="text-sm font-medium">Image</p>
          </label>
          <label htmlFor='uploadVideo' className='flex items-center p-2 px-3 gap-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors'>
            <div className='text-purple-500'>
              <FaVideo size={18} />
            </div>
            <p className="text-sm font-medium">Video</p>
          </label>
          <input type='file' id='uploadImage' onChange={handleUploadImage} className='hidden' />
          <input type='file' id='uploadVideo' onChange={handleUploadVideo} className='hidden' />
        </form>
      </div>
    )}
  </div>

  <form className='relative flex-1 mx-2' onSubmit={handleSendMessage}>
    <input
      id="messageInput"
      type='text'
      placeholder='Type a message...'
      className='w-full py-2 px-4 rounded-full bg-gray-100 outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all'
      value={message.text}
      onChange={handleOnChange}
    />
    
    <button
      type="button"
      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
      className='absolute right-14 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors'
    >
      <BsEmojiSmile size={20} />
    </button>

    <button 
      type="submit" 
      className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition-colors'
      disabled={!message.text && !message.imageUrl && !message.videoUrl}
    >
      <IoMdSend size={18} />
    </button>

    {showEmojiPicker && (
      <div ref={emojiPickerRef} className='absolute bottom-12 right-0 z-50'>
        <div className="shadow-lg rounded-lg overflow-hidden">
          <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
        </div>
      </div>
    )}
  </form>
</section>



    </div>
  )
}

export default MessagePage
