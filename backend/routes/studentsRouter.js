const express=require('express');
const { register,getAll,getByName,login, createBlog, verifyToken,myBlogs,getBlogs,searchByAuthor, blogLike,getLikes,addComment, getComments } = require('../models/student');



const router=express.Router();
router.post('/register',register);
router.get('/',getAll);
router.get('/:name',getByName);
router.post('/login',login);
router.post('/createBlog',verifyToken,createBlog);
router.get('/MyBlog/:id',verifyToken,myBlogs);
router.get('/blogs/allBlogs',getBlogs);
router.get('/blogs/search/:author',searchByAuthor);
router.post('/blogs/likes/:b_id',verifyToken,blogLike);
router.get('/blogs/LikesCount/:b_id',getLikes);
router.post('/comments/:id',verifyToken, addComment);
router.get('/comments/:b_id',getComments);
module.exports=router;