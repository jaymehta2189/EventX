class ApiError extends Error {
    constructor(
        errorConstant,
        data = null,
        stack = ''
    ) {
        super(errorConstant.message);
        this.statusCode = errorConstant.statusCode;
        this.code = errorConstant.customCode;
        this.message = errorConstant.message;
        this.data = data;

        if (stack) {
            this.stack = stack;
        } else if(errorConstant.statusCode >= 500){
            Error.captureStackTrace(this, this.constructor);
        }
    }
};


module.exports = ApiError;