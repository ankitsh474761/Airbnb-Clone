import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const RegisterPage = () => {
  const[name ,setName] = useState('');
  const[email,setEmail] = useState('');
  const[password,setPassword] = useState('');

 async function registerUser(e){
 e.preventDefault();
 try{
   await axios.post("/register", {
     name,
     email,
     password,
   });
   alert("Registration Successfull... Now you can log in");

 }catch(err){
  alert('Registration failed. Please try again later');
}
}


  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Register</h1>

        <form className="max-w-md mx-auto "  onSubmit={registerUser}>

          <input type="text" 
          placeholder="Onkar Rao..." 
          required
          value={name}
          onChange={(ev)=>setName(ev.target.value)}/>

          <input type="email"
          required
           placeholder="enter your email here ..."
          value={email}
          onChange={(ev)=> setEmail(ev.target.value)} />

          <input type="password"
          required
           placeholder="enter your password here..."
          value={password}
          onChange={(e)=>setPassword(e.target.value)} />

          <button className="primary">Register</button>

          <div className="text-center py-2 text-gray-500">

            Already a member?

            <Link className="underline text" to={ "/login"}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
