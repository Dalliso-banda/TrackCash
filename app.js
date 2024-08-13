const express = require('express');
const app = express();
const port =7070;
app.listen(port,()=>{
    
app.use(express.static('./'))
console.log(`trackCash app running on port ${port}`)
})
