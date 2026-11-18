import { useState } from 'react';
import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import '@ionic/react/css/ionic-swiper.css';
import './Tab3.css';

const slajdy = [
  { src: '/img/las.png', text: 'Las' },
  { src: '/img/rzeka.png', text: 'Rzeka' },
  { src: '/img/gory.png', text: 'Góry' },
  { src: '/img/morze.png', text: 'Morze' },
];

const Tab3: React.FC = () => {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [disablePrev, setDisablePrev] = useState(true);
  const [disableNext, setDisableNext] = useState(false);

  // wywoływane po każdej zmianie slajdu (także gestem)
  const slideChange = (s: SwiperType) => {
    setDisablePrev(s.isBeginning);
    setDisableNext(s.isEnd);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pokaz slajdów</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Pokaz slajdów</IonTitle>
          </IonToolbar>
        </IonHeader>

        <Swiper
          className="slajdy"
          initialSlide={0}
          speed={300}
          onSwiper={setSwiper}
          onSlideChange={slideChange}
        >
          {slajdy.map((slajd) => (
            <SwiperSlide key={slajd.src}>
              <img src={slajd.src} alt={slajd.text} />
            </SwiperSlide>
          ))}
        </Swiper>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton
                expand="block"
                disabled={disablePrev}
                onClick={() => swiper?.slidePrev()}
              >
                PREV
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                expand="block"
                disabled={disableNext}
                onClick={() => swiper?.slideNext()}
              >
                NEXT
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
