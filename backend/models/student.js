const pool=require('../db');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
SECRET_KEY='your-secret';

const register=async(req,res)=>{
    try{
        const {name,email,college,branch,contact,password}=req.body;
        const hashPass= await bcrypt.hash(password,10);
        const result=await pool.query('insert into users(name,email,college,branch,contact,password)values($1,$2,$3,$4,$5,$6)',[name,email,college,branch,contact,hashPass]);
        res.status(201).json({message:"success"});
        
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:"server error"});
    }
}
const getAll=async(req,res)=>{
    try{
        const result=await pool.query('select id,name,college,branch,email,contact,role from users');
        res.status(200).json(result.rows);
        return result.rows;
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:"server error"});
    }
}
const getByName=async(req,res)=>{
    
    try{
        const name=req.params.name;
        const result=await pool.query('select id,name,college,branch,contact,email,role from users where name=$1',[name]);
        res.status(200).json(result.rows);
    }catch(err){
        console.log("error:",err);
        res.status(500).json({error:"server error"});
    }
}
const login=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const result=await pool.query('select *from users where email=$1',[email]);
         if (result.rows.length === 0) {
      return res.status(403).json({ error: "Incorrect email or password" });
    }
        const validPass=await bcrypt.compare(password,result.rows[0].password);
        if(!validPass) return res.status(403).json({error:"incorrect email or password"});
        const token=jwt.sign({id:result.rows[0].id,email:result.rows[0].email,name:result.rows[0].name,role:result.rows[0].role},SECRET_KEY,{expiresIn:'1h'});
        res.status(201).json({message:"login successfull",token});
    }catch(err){
        console.log("error",err);
        res.status(500).json("server error");
    }
}
const createBlog=async(req,res)=>{
    const {title,content,description}=req.body;
    const userId = req.user.id;
    try{
        const result= await pool.query('insert into blogs(id,title,content,created_at,author,description)values($1,$2,$3,now(),(select name from users where id=$1),$4)',[userId,title,content,description]);
        res.status(201).json({message:"success"});
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:"server error"});
    }
}
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) return res.status(401).json({ error: 'Token missing' });

  const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
const myBlogs=async(req,res)=>{
    const id=req.params.id;
    try{
        const result=await pool.query(`select title,description,content,created_at,author,likes from blogs where id=${id}`);
        res.status(200).json(result.rows);
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:"server error"});
    }
}
const getBlogs=async(req,res)=>{
    // console.log("GET /allBlogs hit");
    try{
        const result=await pool.query(`select b_id,title,description,content,created_at,author,likes from blogs order by created_at desc`);
        res.status(200).json(result.rows);
        // console.log("Query result:", result.rows);
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:"server error"});
    }
}
const searchByAuthor=async(req,res)=>{
    const author=req.params.author;
    try{
        const result=await pool.query(`select b_id,title,description,content,created_at,author,likes from blogs  where author=$1 order by created_at desc`,[author]);
        res.status(200).json(result.rows);
    }catch(err){
        console.log("error",err);
        res.status(500).json({error:"server error"});
    }
}
const blogLike=async(req,res)=>{
    const blogId = req.params.b_id;
   const userId = req.user.id;

  try {
     await pool.query(
      'INSERT INTO blog_likes (b_id, id) VALUES ($1, $2)',
      [blogId, userId]
    );
     await pool.query(
      'UPDATE blogs SET likes = likes + 1 WHERE b_id = $1',
      [blogId]
    );
    res.status(200).json({ message: 'Liked successfully' });
    
  } catch (err) {
    if (err.code === '23505') {
      // Unique violation: user already liked
      return res.status(409).json({ message: 'Already liked' });
    }
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}
const getLikes=async(req,res)=>{
    const b_id=req.params.b_id;
    try{
        const result=await pool.query('select likes from blogs where b_id=$1',[b_id]);
        res.status(200).json(result.rows[0]);
    }catch(err){
        console.log("error",err);
        res.status(500).json("server error");
    }
}
// const addComment=async (req, res) => {
//   const blogId = req.params.id;
//   const userId = req.user.id;
//   const { comment } = req.body;

//   if (!comment || comment.trim() === '') {
//     return res.status(400).json({ error: 'Comment cannot be empty' });
//   }

//   try {
//     await pool.query(
//       'INSERT INTO blog_comments (blog_id, user_id, comment_text, created_at) VALUES ($1, $2, $3, NOW())',
//       [blogId, userId, comment]
//     );
//     res.status(200).json({ message: 'Comment added successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// }
const addComment = async (req, res) => {
  const blogId = parseInt(req.params.id);
  const userId = parseInt(req.user?.id);
  const { comment } = req.body;

  if (!blogId || !userId || !comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Missing blog ID, user ID, or comment' });
  }

  try {
    await pool.query(
      'INSERT INTO blog_comments (blog_id, user_id, comment_text, created_at) VALUES ($1, $2, $3, NOW())',
      [blogId, userId, comment]
    );
    res.status(200).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
const getComments=async(req,res)=>{
    const bid=req.params.b_id;
    try{
        const result= await pool.query('select user_id,comment_text from blog_comments where blog_id=$1',[bid]);
        // console.log(result.rows);
        res.status(200).json(result.rows);
    }catch(err){
        console.log("error",err);
        res.status(500).json({erro:"error"});
    }
}
module.exports={register,getAll,getByName,login,createBlog,verifyToken,myBlogs,getBlogs,searchByAuthor,blogLike,getLikes,addComment,getComments};