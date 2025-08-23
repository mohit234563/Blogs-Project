// const { POOL }=require('pg');
// require('dotenv').config();
// const pool = new POOL({
//     connectionString:process.env.DATABASE_URL
// })
// module.exports=pool;

const {Pool}=require('pg');
require('dotenv').config();
const pool=new Pool({
    connectionString:process.env.DATABASE_URL
});
console.log("connected to databse");
module.exports=pool;