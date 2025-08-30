const express=require('express');
const cors=require('cors');
const app=express();
require('dotenv').config();
const router=require('./routes/studentsRouter');
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Backend is live 🚀");
});

app.use('/api/students',router);
const PORT=process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server is running on the port ${PORT}`);
})