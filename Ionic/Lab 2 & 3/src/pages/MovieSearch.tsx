import React, { useContext, useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonFabButton, IonIcon, IonFab, IonChip, IonLabel
} from "@ionic/react";
import { AuthContext } from "../auth/authProvider";
import {getMoviesByDirector, getMoviesByName} from "./MovieApi";
import { MovieProps } from "./MovieProps";
import Movie  from "./Movie";
import { RouteComponentProps } from "react-router";
import NetworkStatus from "../core/NetworkStatus";
import { Network, Plugins } from "@capacitor/core";
import { logOut } from "ionicons/icons";

const MovieSearch: React.FC<RouteComponentProps> = ({history}) => {
  const { logout } = useContext(AuthContext)
  const { token } = useContext(AuthContext);

  const [searchedMovies, setSearchedMovies] = useState<MovieProps[]>([]);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);

  Network.getStatus().then(status => setStatus(status.connected));

  Network.addListener('networkStatusChange', (status) => {
    setStatus(status.connected);
  });

  async function fetchMovies(reset?: boolean) {
    if (!token?.trim()) {
      return;
    }

    try {
      if(search === "") {
        setSearchedMovies([]);
      } else {
        if(reset) {
          const movies = await getMoviesByName(token, search);
          setSearchedMovies(movies);
        } else {
          setSearchedMovies(searchedMovies);
        }
      }
    } catch(error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchMovies(true);
  }, [search]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle> Search for Movies by name </IonTitle>
          <IonChip>
            <IonLabel color={status? "success" : "danger"}>{status? "Online" : "Offline"}</IonLabel>
          </IonChip>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonSearchbar value={search}  showCancelButton="always" placeholder="Type a name..."
                      debounce={1000} onIonChange={e => setSearch(e.detail.value!)} />


        {searchedMovies && (
          <IonList>
            {searchedMovies.map(({ _id, name, director,rating, debut, isFinished, photo, position }) =>
              <Movie key={_id}
                     _id={_id} name={name} director={director} rating={rating} debut={debut} isFinished={isFinished} photo={photo} position={position}
                     onEdit={(id: any) => history.push(`/movie/${id}`)} />
            )}
          </IonList>
        )}

        {searchedMovies.length === 0 && (
          <p> No Movies found containing: {search}  in their name </p>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => handleLogout()} href='/login'>
            <IonIcon icon={logOut}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>

  );
  function handleLogout() {

    logout?.();
  }
}

export default MovieSearch;
