import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider,Login,PrivateRoute } from './auth';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import {MovieProvider} from "./pages/MovieProvider";
import MovieList from "./pages/MovieList";
import React from "react";
import MovieEdit from "./pages/MovieEdit";
import MovieSearch from './pages/MovieSearch';
import MovieFilter from './pages/MovieFilter';
const App: React.FC = () => (
  <IonApp>
  
      <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
        <AuthProvider>
        
          <Route path="/login" component={Login} exact={true}/>
          <MovieProvider>
          <PrivateRoute path="/movies" component={MovieList} exact={true} />
          <PrivateRoute path="/filterMovies" component={ MovieFilter } exact={ true } />
          <PrivateRoute path="/searchForMovies" component={ MovieSearch } exact={ true } />
          <PrivateRoute path="/movie" component={MovieEdit} exact={true} />
          <PrivateRoute path="/movie/:id" component={MovieEdit} exact={true} />
          </MovieProvider>
          <Route exact path="/" render={() => <Redirect to="/movies" />} />

         
          </AuthProvider>
        </IonRouterOutlet>
      
          <IonTabBar slot="bottom">
          <IonTabButton tab="listOfMovies" href="/movies">
                    <IonLabel> List of movies </IonLabel>
                </IonTabButton>

                <IonTabButton tab="filterMovies" href="/filterMovies">
                    <IonLabel> Filter Movies </IonLabel>
                </IonTabButton>
        <IonTabButton tab="searchMovies" href="/searchForMovies">
                    <IonLabel> Search for movies </IonLabel>
                </IonTabButton>
            </IonTabBar>

          </IonTabs>
      </IonReactRouter>
   
  </IonApp>
);

export default App;
