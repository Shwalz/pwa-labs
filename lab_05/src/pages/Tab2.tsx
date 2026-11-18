import { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';
import './Tab2.css';

// czy n jest liczbą pierwszą
const czyPierwsza = (n: number): boolean => {
  if (n < 2) {
    return false;
  }
  if (n % 2 === 0) {
    return n === 2;
  }
  for (let i = 3; i * i <= n; i += 2) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
};

// ile kolejnych liczb pierwszych, poczynając od liczby od
// kolejnePierwsze(10, 3) → [11, 13, 17]
const kolejnePierwsze = (od: number, ile: number): number[] => {
  const wynik: number[] = [];
  let n = od;
  while (wynik.length < ile) {
    if (czyPierwsza(n)) {
      wynik.push(n);
    }
    n++;
  }
  return wynik;
};

const Tab2: React.FC = () => {
  const [liczby, setLiczby] = useState<number[]>(kolejnePierwsze(2, 30));
  const [present] = useIonToast();

  const dodaj = () => {
    const ostatnia = liczby[liczby.length - 1];
    const nowe = kolejnePierwsze(ostatnia + 1, 20);
    setLiczby([...liczby, ...nowe]);
    present({
      message: `Załadowano liczby do ${nowe[nowe.length - 1]}`,
      duration: 1500,
      position: 'top',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Liczby pierwsze</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Liczby pierwsze</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonList>
          {liczby.map((liczba, i) => (
            <IonItem key={liczba}>
              <IonLabel>
                {i + 1}. {liczba}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonInfiniteScroll
          onIonInfinite={(ev) => {
            dodaj();
            ev.target.complete();
          }}
        >
          <IonInfiniteScrollContent loadingText="Liczę kolejne liczby..." />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
