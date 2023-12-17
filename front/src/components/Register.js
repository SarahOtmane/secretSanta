import { Link } from "react-router-dom";
import { useState } from "react";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = async(e) =>{
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/users/register', {
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
                <form className="column" onSubmit={register} >
                    <h1>Sinscrire</h1>
                    <input type="email" placeholder="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="password" value={password} required onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit">S'inscrire</button>
                </form>
                <p>Vous avez déja un compte? <Link to="/login" className="link" >Connectez Vous!</Link> </p>
            </div>
        </main>
    )
}

export default Login