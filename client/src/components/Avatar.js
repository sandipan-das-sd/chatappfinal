// import React from 'react'
// import { PiUserCircle } from "react-icons/pi";
// import { useSelector } from 'react-redux';
// // import { formatLastSeen } from '../../utils/formatLastSeen';

// import moment from 'moment';

// const formatLastSeen = (timestamp) => {
//   if (!timestamp) return '';
  
//   const now = moment();
//   const lastSeen = moment(timestamp);
//   const diffMinutes = now.diff(lastSeen, 'minutes');
//   const diffHours = now.diff(lastSeen, 'hours');
//   const diffDays = now.diff(lastSeen, 'days');
  
//   if (diffMinutes < 1) return 'Just now';
//   if (diffMinutes < 60) return `${diffMinutes}m ago`;
//   if (diffHours < 24) return `${diffHours}h ago`;
//   if (diffDays === 1) return 'Yesterday';
//   if (diffDays < 7) return `${diffDays} days ago`;
//   return lastSeen.format('MMM D'); // Like "Feb 11"
// };
// const Avatar = ({userId,name,imageUrl,width,height}) => {
//     const onlineUser = useSelector(state => state?.user?.onlineUser)
//     const lastSeen = useSelector(state => state?.user?.lastSeen[userId]);

//     //Amit Prajapati

//     let avatarName = ""

//     if(name){
//       const splitName = name?.split(" ")

//       if(splitName.length > 1){
//         avatarName = splitName[0][0]+splitName[1][0]
//       }else{
//         avatarName = splitName[0][0]
//       }
//     }

//     const bgColor = [
//       'bg-slate-200',
//       'bg-teal-200',
//       'bg-red-200',
//       'bg-green-200',
//       'bg-yellow-200',
//       'bg-gray-200',
//       "bg-cyan-200",
//       "bg-sky-200",
//       "bg-blue-200"
//     ]

//     const randomNumber = Math.floor(Math.random() * 9)

//     const isOnline = onlineUser.includes(userId)
//   return (
//     <div className={`text-slate-800  rounded-full font-bold relative`} style={{width : width+"px", height : height+"px" }}>
//         {
//             imageUrl ? (
//                 <img
//                     src={imageUrl}
//                     width={width}
//                     height={height}
//                     alt={name}
//                     className='overflow-hidden rounded-full'
//                 />
//             ) : (
//                 name ? (
//                     <div  style={{width : width+"px", height : height+"px" }} className={`overflow-hidden rounded-full flex justify-center items-center text-lg ${bgColor[randomNumber]}`}>
//                         {avatarName}
//                     </div>
//                 ) :(
//                   <PiUserCircle
//                     size={width}
//                   />
//                 )
//             )
//         }

//         {
//           isOnline && (
//             <div className='bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full'></div>
//           )
//         }
//       {!isOnline && lastSeen && (
//                 <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
//                     last seen {formatLastSeen(lastSeen)}
//                 </div>
//             )}
//     </div>
//   )
// }

// export default Avatar
import React, { useState } from 'react';
import { PiUserCircle } from "react-icons/pi";
import { useSelector } from 'react-redux';
import moment from 'moment';

const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'offline';
  
  const now = moment();
  const lastSeen = moment(timestamp);
  const diffMinutes = now.diff(lastSeen, 'minutes');
  
  if (diffMinutes < 1) return 'just now';
  
  return lastSeen.calendar(null, {
    sameDay: '[last seen today at] hh:mm A',       // Shows: last seen today at 02:30 PM
    lastDay: '[last seen yesterday at] hh:mm A',    // Shows: last seen yesterday at 02:30 PM
    lastWeek: '[last seen last] dddd [at] hh:mm A', // Shows: last seen last Monday at 02:30 PM
    sameElse: '[last seen on] DD/MM/YYYY [at] hh:mm A'   // Shows: last seen on 15/02/2025 at 02:30 PM
  });
};

const Avatar = ({ userId, name, imageUrl, width, height }) => {
  const [showLastSeen, setShowLastSeen] = useState(false);
  const onlineUsers = useSelector(state => state?.user?.onlineUser || []);
  const lastSeenTime = useSelector(state => state?.user?.lastSeen?.[userId]);
  const isOnline = onlineUsers.includes(userId);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const bgColors = [
    'bg-slate-200', 'bg-teal-200', 'bg-red-200',
    'bg-green-200', 'bg-yellow-200', 'bg-gray-200',
    'bg-cyan-200', 'bg-sky-200', 'bg-blue-200'
  ];

  // Use userId to consistently get same color for user
  const colorIndex = userId ? 
    userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length :
    Math.floor(Math.random() * bgColors.length);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowLastSeen(true)}
      onMouseLeave={() => setShowLastSeen(false)}
    >
      <div 
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || 'User avatar'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : name ? (
          <div className={`w-full h-full rounded-full flex items-center justify-center text-lg font-semibold ${bgColors[colorIndex]}`}>
            {getInitials(name)}
          </div>
        ) : (
          <div className="w-full h-full rounded-full flex items-center justify-center text-gray-400">
            <PiUserCircle className="w-full h-full" />
          </div>
        )}

        {/* Online/Offline Status Indicator */}
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
          ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        />
      </div>

      {/* Last Seen Tooltip */}
      {!isOnline && lastSeenTime && showLastSeen && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-50
          bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap shadow-lg">
          last seen {formatLastSeen(lastSeenTime)}
        </div>
      )}
    </div>
  );
};

export default Avatar;