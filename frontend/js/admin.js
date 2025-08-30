const api="https://your-backend-url.onrender.com";

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
})

const fetchStudents=async()=>{
    const res= await fetch(`${api}`)
const data=await res.json();
const tbody=document.getElementById('content');
tbody.innerHTML="";
data.forEach(student => {
    const row=`
    <tr>
    <td>${student.id}</td>
    <td>${student.name}</td>
    <td>${student.college}</td>
    <td>${student.branch}</td>
    <td>${student.email}</td>
    <td>${student.contact}</td>
    <td>${student.role}</td>
    </tr>`
    tbody.innerHTML+=row;
});
}
const fetchStudentsByName=async()=>{
    const name=document.getElementById('search-bar').value;
    if(name.length===0){
        alert("Enter the name first!");
        return;
    }
    const result=await fetch(`${api}/${name}`);
    const data=await result.json();
    if(!data[0]){
        alert("user not found!");
        return;
    }
    const tbody=document.getElementById('content');
    tbody.innerHTML=`
    <tr>
    <td>${data[0].id}</td>
    <td>${data[0].name}</td>
    <td>${data[0].college}</td>
    <td>${data[0].branch}</td>
    <td>${data[0].email}</td>
    <td>${data[0].contact}</td>
    <td>${data[0].role}</td>    
    </tr>`
}
document.getElementById('find-student').addEventListener('click',fetchStudentsByName);

window.onload=fetchStudents;