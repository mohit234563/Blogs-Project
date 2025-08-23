const api='http://localhost:3001/api/students';
    document.getElementById('home-btn')?.addEventListener('click',()=>{
    window.location.href='index.html'
})
document.getElementById('register')?.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const name=document.getElementById('name').value;
    const email=document.getElementById('email').value;
    const branch=document.getElementById('branch').value;
    const contact=document.getElementById('contact').value;
    const college=document.getElementById('college').value;
    const password=document.getElementById('password').value;
    const pssError=document.getElementById('password-error');
    pssError.innerText="";
    const emailRegex=/^[A-Za-z0-9._]+@gmail\.com$/;
    let passWordRegex=/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%&*^])[A-Za-z\d!@#$%&*^]{8,}$/;
    let contactRegex=/^(\+91[\-\s]?|0)?[6-9]\d{9}$/;

    if(!emailRegex.test(email)){
        pssError.innerText="email  is not in correct formate!";
        pssError.style.color='red';
        return;
    }
    if(!contactRegex.test(contact)){
        pssError.innerText="contact number is invailid";
        pssError.style.color='red';
        return;
    }
    if(!passWordRegex.test(password)){
        pssError.innerText="password must contain 8 character with one upper,one lower and special character";
        pssError.style.color='red';
        return;
    }
    if(!college||!name||!branch){
        alert("all field are required!");
        return;
    }
    const res=await fetch(`${api}/register`,{
        method:"POST",
        headers:{'content-type':'application/json'},
        body:JSON.stringify({name,email,college,branch,contact,password})
    })
    const data= await res.json();
    const response=data.message||data.error;
    if(response===data.message){
        alert(response);
        window.location.href='index.html';
    }else{
        alert(response);
        return;
    }
})