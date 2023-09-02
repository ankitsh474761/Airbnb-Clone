import axios from 'axios';
import React, { useContext, useState } from 'react'
import { Link, Navigate } from 'react-router-dom';
import { UserContext } from '../UsercContext';

const Loginpage = () => {

  const[email,setEmail] = useState('');
  const[password,setPassword] = useState('');
  const[redirect,setRedirect] = useState(false);
  const {setUser} =useContext(UserContext);
  async function handleLoginSubmit(e){
    e.preventDefault();
    try{
  const {data} =  await axios.post("/login", { email, password }); // will return a lot of data but we want only email and pass and it is stored in data i.e why we destructured it 
  setUser(data);
  alert('login successfull');
  // setUser(userInfo);//  see index.js /login where we send the user info thr userDoc and here we stored that info in userinfo and then
  // set it to setUser()
   setRedirect(true);
    }catch(e){
    alert("Login failed...");
    }
  }

  if(redirect){
    return <Navigate to={"/"} />
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>

        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>

          <input type="email"
          required
           placeholder="enter your email here ..."
            value={email} 
            onChange={(e)=>setEmail(e.target.value)} />

          <input type="password"
          required
           placeholder="enter your password here..." 
           value={password}
           onChange={(e)=>setPassword(e.target.value)}/>

          <button className="primary">Login</button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account?
            <Link className="underline text" to={"/register"}>
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Loginpage