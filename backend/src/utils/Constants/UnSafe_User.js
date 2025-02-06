exports.UnSafeUserError = Object.freeze({
    UNSAFE_USER_NOT_FOUND: { customCode: 1301, message: "Unsafe User not found.", statusCode: 404 },
    PASSWORD_MISMATCH: { customCode: 1330, message:"Password mismatch." , statusCode: 404 }
});


exports.UnSafeUserSuccess = Object.freeze({
    WAIT_FOR_CONFIRMATION : { customCode: 2330, message:"wait for confirmation." , statusCode: 200 }
});
