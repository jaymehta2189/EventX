class ApiError extends Error{
    constructor(
        statuscode ,
        massage = 'something went wrong',
        errors = [],
        stack = ''
    ){
        super(massage);
        this.statusCode = statuscode;
        this.data = null;
        this.message = massage;
        this.success = false;
        this.errors = errors;

        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
};
module.exports=ApiError;