import { Link } from "react-router-dom";
import { useState } from "react";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async(e) =>{
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
      
            const data = await response.json();

            console.log(data);

            } catch (error) {
                console.error('Erreur lors de la connexion :', error);
            }
    }
    
    return(
        <main className="login">
            <div>
                <form className="column" onSubmit={login} >
                    <h1>Connexion</h1>
                    <input type="email" placeholder="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="password" value={password} required onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit">Connexion</button>
                </form>
                <p>Vous n'avez pas de compte? <Link to="/register" className="link" >Inscrivez Vous!</Link> </p>
            </div>
        </main>
    )
}

export default Login