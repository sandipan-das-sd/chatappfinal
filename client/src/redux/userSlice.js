// import { createSlice } from '@reduxjs/toolkit'

// const initialState = {
//   _id : "",
//   name : "",
//   email : "",
//   profile_pic : "",
//   token : "",
//   onlineUser : [],
//   socketConnection : null,
//   lastSeen: {},

// }

// export const userSlice = createSlice({
//   name: 'user',
//   initialState,
//   reducers: {
//     setUser : (state,action)=>{
//         state._id = action.payload._id
//         state.name = action.payload.name 
//         state.email = action.payload.email 
//         state.profile_pic = action.payload.profile_pic 
//     },
//     setToken : (state,action)=>{
//         state.token = action.payload
//     },
//     logout : (state,action)=>{
//         state._id = ""
//         state.name = ""
//         state.email = ""
//         state.profile_pic = ""
//         state.token = ""
//         state.socketConnection = null
//     },
//     setOnlineUser : (state,action)=>{
//       state.onlineUser = action.payload
//     },
//     updateLastSeen: (state, action) => {
//       // action.payload will be { userId: timestamp }
//       state.lastSeen = {
//           ...state.lastSeen,
//           ...action.payload
//       }
//   },
//     setSocketConnection : (state,action)=>{
//       state.socketConnection = action.payload
//     }
//   },
// })

// // Action creators are generated for each case reducer function
// export const { setUser, setToken ,logout, setOnlineUser,setSocketConnection, updateLastSeen  } = userSlice.actions

// export default userSlice.reducer

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  _id: "",
  name: "",
  email: "",
  profile_pic: "",
  token: "",
  onlineUser: [],
  socketConnection: null,
  lastSeen: {},
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload._id
      state.name = action.payload.name
      state.email = action.payload.email
      state.profile_pic = action.payload.profile_pic
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    logout: (state) => {
      return initialState // Reset to initial state completely
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload;
      // Clear lastSeen for online users
      action.payload.forEach(userId => {
        if (state.lastSeen[userId]) {
          delete state.lastSeen[userId];
        }
      });
    },
    updateLastSeen: (state, action) => {
      // action.payload can be either single update or multiple
      if (Array.isArray(action.payload)) {
        // Handle batch updates
        action.payload.forEach(({ userId, timestamp }) => {
          if (!state.onlineUser.includes(userId)) {
            state.lastSeen[userId] = timestamp
          }
        })
      } else {
        // Handle single update
        const { userId, timestamp } = action.payload
        if (!state.onlineUser.includes(userId)) {
          state.lastSeen[userId] = timestamp
        }
      }
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload
    }
  },
})

export const {
  setUser,
  setToken,
  logout,
  setOnlineUser,
  setSocketConnection,
  updateLastSeen
} = userSlice.actions

export default userSlice.reducer