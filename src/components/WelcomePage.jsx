import React, { useState } from 'react';
import swirlBg from '../assets/backgrounds/swirl-bg.png';
import frameImg from '../assets/frame/final-frame3.png';
import greenLeft from '../assets/backgrounds/green2.png';
import greenRight from '../assets/backgrounds/green3.png';
import logoRight from '../assets/backgrounds/logo-right.png';
import { useTranslation } from 'react-i18next';

export default function WelcomePage({ name, setName, onStart }) {
  const { t, i18n } = useTranslation();
  const [showError, setShowError] = useState(false);

  const handleStart = () => {
    if (name.trim() === '') {
      setShowError(true);
      return;
    }
    setShowError(false);
    onStart();
  };

  return (
    <div
      className="min-h-screen w-full h-dvh overflow-hidden bg-cover bg-center relative"
      style={{ backgroundImage: `url(${swirlBg})` }}
    >
      <img
        src={frameImg}
        alt="Decorative Frame"
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
      />

      <img
        src={greenLeft}
        alt="decorative plant left"
        className="absolute bottom-[-40px] left-[80px] w-[200px] z-10"
      />
      <img
        src={greenRight}
        alt="decorative plant right"
        className="absolute bottom-[-30px] right-[80px] w-[200px] z-10"
      />

      <div className="absolute top-[162px] right-[166px] z-50 bg-white rounded-full flex overflow-hidden border border-primary text-sm font-bold">
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={`font-avenir px-4 py-2 ${i18n.language === 'en' ? 'bg-primary text-white' : 'text-primary'}`}
        >
          EN
        </button>
        <button
          onClick={() => i18n.changeLanguage('ar')}
          className={`font-avenir px-4 py-2 ${i18n.language === 'ar' ? 'bg-primary text-white' : 'text-primary'}`}
        >
          عربى
        </button>
      </div>


      <div
        className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 ${i18n.language === 'ar' ? 'text-right' : 'text-center'}`}
        dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <img
          src={logoRight}
          alt="logo top right"
          className=" w-[250px] z-10"
        />
        <h1 className="text-[42px] md:text-[52px] mt-[40px] font-flapstick leading-tight font-semibold text-primary text-center">
          {t('title')}
        </h1>

        <p className="font-avenir text-center text-[32px] text-secondary max-w-2xl mt-12">
          {t('subtitle')}
        </p>

        <div className="mt-12 w-full max-w-md text-center">
          <label className="font-avenir font-extrabold text-[32px] text-secondary">{t('enterName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-avenir mt-4 w-[350px] text-[26px] text-center px-10 py-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {showError && (
            <p className="text-red-600 font-avenir mt-2 text-[16px]">
              {t("Please enter your name to continue")}
            </p>
          )}

          <button
            onClick={handleStart}
            className="font-avenir mt-4 w-[350px] bg-primary hover:bg-secondary transition text-white font-bold text-[26px] px-20 py-4 rounded-full"
          >
            {t('startQuiz')}
          </button>
        </div>
      </div>
    </div>
  );
}
