class ApiResponse{
    constructor(succesConstant , data = null){
        this.customCode = succesConstant.customCode;
        this.message = succesConstant.message;
        this.data = data;
    }
};
module.exports=ApiResponse;