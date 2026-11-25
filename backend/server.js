import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({
        success: true,
        messege: 'Store Rating System API is running!'
    })
});

const PORT = process.env.PORT || 5000;

console.log("Port:", process.env.PORT);
console.log("Application:", process.env.APP_NAME);

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
})

