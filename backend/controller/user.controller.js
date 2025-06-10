exports.getUserProfile = async(req,res)=>{
  const userId = req.userId;
  const user = await User.findOne({_id: userId})
  if(!user){
    res.status(400).json({
      message: "user not found"
    })
  }else{
    res.stauts(200).json({
      message: "user profile fetched",
      user
    })
  }
}

