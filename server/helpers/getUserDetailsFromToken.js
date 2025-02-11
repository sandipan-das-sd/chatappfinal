// const jwt = require('jsonwebtoken')
// const UserModel = require('../models/UserModel')

// const getUserDetailsFromToken = async(token)=>{
    
//     if(!token){
//         return {
//             message : "session out",
//             logout : true,
//         }
//     }

//     const decode = await jwt.verify(token,process.env.JWT_SECREAT_KEY)

//     const user = await UserModel.findById(decode.id).select('-password')

//     return user
// }

// module.exports = getUserDetailsFromToken

const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')

const getUserDetailsFromToken = async(token) => {
    try {
        if(!token) {
            return {
                message: "session out",
                logout: true,
            }
        }

        // Fixed the typo here from JWT_SECREAT_KEY to JWT_SECRET_KEY
        const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await UserModel.findById(decode.id).select('-password')
        return user
    } catch (error) {
        console.error("Token verification error:", error)
        return {
            message: "session out",
            logout: true,
        }
    }
}

module.exports = getUserDetailsFromToken