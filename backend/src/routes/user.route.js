const Router=require("express")

const router = Router();

router.route("/").get(
    (re,res)=>{
        res.send("hello");
    }
);

module.exports=router;