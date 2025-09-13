const axios = require('axios');

(async ()=>{
  try{
    const id = '19f85d54b376d4c9782a94f3afc2463fdcf53cb355d1ac31d4f1a6bfb38de47';
    const res = await axios.get(`http://localhost:3000/api/verify?certificateID=${id}`);
    console.log('status:', res.status);
    console.log(JSON.stringify(res.data, null, 2));
  }catch(err){
    if(err.response){
      console.error('status', err.response.status);
      console.error(err.response.data);
    } else {
      console.error('error', err.message);
    }
    process.exit(1);
  }
})();
