require("dotenv").config();
const jwt=require("jsonwebtoken");

const secretKey=process.env.SECRET_KEY;

exports.createTokenForPerson= (person)=>{
    return  jwt.sign({
        _id:person._id,
        email:person.email,
        avatar:person.avatar,
    }
    ,secretKey);
}
exports.verifyToken= (token)=>{
    return  jwt.verify(token,secretKey);
}