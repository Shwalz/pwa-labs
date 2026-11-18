import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import Kalkulator from '../components/Kalkulator';
import Czworokat from '../components/Czworokat';
import './Tab4.css';

const Tab4: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Kalkulator</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Kalkulator</IonTitle>
          </IonToolbar>
        </IonHeader>

        <Kalkulator />
        <Czworokat />
      </IonContent>
    </IonPage>
  );
};

export default Tab4;
