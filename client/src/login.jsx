import { useState } from "react";
import './css/login.css'


function Login ({loginSuccess}) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    

    const loginSubmit = ((e) => {
        e.preventDefault();

        fetch('/api/login', {
            method: 'POST',
            headers:{'Content-type': 'application/json'},
            credentials:'include',
            body: JSON.stringify({username, password})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                loginSuccess(data.user)
            } else {
                console.log(data);
                
                console.log('Login failed!: ', data.message);
            }
        })

    })

        return (
            <div className="login-overlay">
            <form className="login-card-box" onSubmit={loginSubmit}>
                <h2>🚇 Transit System Login</h2>
                <div className="input-group">
                <label>Username</label>
                <input 
                    type="text" 
                    placeholder="Enter username"
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                />
                </div>
                <div className="input-group">
                <label>Password</label>
                <input 
                    type="password" 
                    placeholder="Enter password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                </div>
                <button type="submit" className="btn-login-submit">Authenticate</button>
            </form>
            </div>
        );


}


export default Login