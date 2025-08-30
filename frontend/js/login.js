const api="http://localhost:3001/api/students";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('home-btn')?.addEventListener('click',()=>{
    window.location.href='index.html'
})
document.getElementById('logout-btn')?.addEventListener('click',(e)=>{
    e.preventDefault();
    if (!localStorage.getItem('token')) {
    alert("You must be logged in to access this page.");
    window.location.href = 'login.html';
    }else{
    localStorage.removeItem('token');
    alert("log out!");
    window.location.href='index.html';
    }
})
document.getElementById('login')?.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const email=document.getElementById('email').value;
    const password=document.getElementById('password').value;
    if(!email ||!password){
        alert("all fields are required");
        return;
    }
    const res=await fetch(`${api}/login`,{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({email,password})
    })
    const data= await res.json();
    const token=data.token;
    console.log("token",token);
    if(token) {
        localStorage.setItem("token",token);
    }
    let response=data.message||data.error;
    alert(response);
    document.getElementById('login').reset;
    window.location.href='index.html';
})
})