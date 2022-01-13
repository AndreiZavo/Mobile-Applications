import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { createAnimation,IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext} from './authProvider';
import { getLogger } from '../core';
import AnimationDemo from './AnimationDemo';
const log = getLogger('Login');

interface LoginState {
  username?: string;
  password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const { username, password } = state;
  const handleLogin = () => {
    log('handleLogin...');
    if(!username || !password) {setShowValidationError(true);}
    else{
        setShowValidationError(false);
    login?.(username, password);}
    console.log(login);
  };
  log('render');
  if (isAuthenticated) {
    return <Redirect to={{ pathname: '/' }} />
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput
          placeholder="Username"
          value={username}
          onIonChange={e => setState({
            ...state,
            username: e.detail.value || ''
          })}/>
        <IonInput
          placeholder="Password" type="password"
          value={password}
          onIonChange={e => setState({
            ...state,
            password: e.detail.value || ''
          })}/>
        <IonLoading isOpen={isAuthenticating}/>
        <IonButton onClick={handleLogin}>Login</IonButton>

        {showValidationError && 
        <AnimationDemo 
        allMandatory="All fields are mandatory" 
        usernameMandatory = {username? "username : checked" : "enter username"}
        passwordMandatory = {showValidationError && password? "password : checked":"enter password"} 
        authFailed = {undefined}
        wrong = {undefined}
        />}

        {authenticationError && 
        <AnimationDemo
        allMandatory = "" 
        usernameMandatory = {undefined}
        passwordMandatory = {undefined} 
        authFailed = "Authentication failed"
        wrong = "Wrong credentials"
        />
        }
      </IonContent>
    </IonPage>
  );
};
