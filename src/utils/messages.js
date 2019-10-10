const generateMessage=(username,text)=>{
  return {
    username,
    text,
    createdAt:new Date().getTime()
  }
}

const generatLocationeMessage=(username,url)=>{
  return {
    username,
    url,
    createdAt:new Date().getTime()
  }
}



module.exports={
  generateMessage,
  generatLocationeMessage
}