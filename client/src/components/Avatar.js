import React from 'react'
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';
// import { formatLastSeen } from '../../utils/formatLastSeen';

import moment from 'moment';

const formatLastSeen = (timestamp) => {
  if (!timestamp) return '';
  
  const now = moment();
  const lastSeen = moment(timestamp);
  const diffMinutes = now.diff(lastSeen, 'minutes');
  const diffHours = now.diff(lastSeen, 'hours');
  const diffDays = now.diff(lastSeen, 'days');
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return lastSeen.format('MMM D'); // Like "Feb 11"
};
const Avatar = ({userId,name,imageUrl,width,height}) => {
    const onlineUser = useSelector(state => state?.user?.onlineUser)
    const lastSeen = useSelector(state => state?.user?.lastSeen[userId]);

    //Amit Prajapati

    let avatarName = ""

    if(name){
      const splitName = name?.split(" ")

      if(splitName.length > 1){
        avatarName = splitName[0][0]+splitName[1][0]
      }else{
        avatarName = splitName[0][0]
      }
    }

    const bgColor = [
      'bg-slate-200',
      'bg-teal-200',
      'bg-red-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-gray-200',
      "bg-cyan-200",
      "bg-sky-200",
      "bg-blue-200"
    ]

    const randomNumber = Math.floor(Math.random() * 9)

    const isOnline = onlineUser.includes(userId)
  return (
    <div className={`text-slate-800  rounded-full font-bold relative`} style={{width : width+"px", height : height+"px" }}>
        {
            imageUrl ? (
                <img
                    src={imageUrl}
                    width={width}
                    height={height}
                    alt={name}
                    className='overflow-hidden rounded-full'
                />
            ) : (
                name ? (
                    <div  style={{width : width+"px", height : height+"px" }} className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}`}>
                        {avatarName}
                    </div>
                ) :(
                  <PiUserCircle
                    size={width}
                  />
                )
            )
        }

        {
          isOnline && (
            <div className='bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full'></div>
          )
        }
      {!isOnline && lastSeen && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                    last seen {formatLastSeen(lastSeen)}
                </div>
            )}
    </div>
  )
}

export default Avatar
