import React from "react";

const Login: React.FC = () => {
  return (
    <>
      <input type="text" placeholder="email" />
      <input type="password" placeholder="password" />
      <button onClick={() => console.log("test")}>login</button>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
    </>
  );
};

export default Login;
