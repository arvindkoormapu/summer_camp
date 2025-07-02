// FinalReveal.js with styled email success popup
import React, { useRef, useState } from 'react';
import swirlBg from '../assets/backgrounds/swirl-bg.png';
import greenLeft from '../assets/backgrounds/green5.png';
import logoRight from '../assets/backgrounds/logo-right.png';
import logoleft from '../assets/backgrounds/logo.png';

import emailjs from '@emailjs/browser';
import { useTranslation } from 'react-i18next';

const VITE_EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const VITE_EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const VITE_EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export default function FinalReveal({ animal, adaptation, story, title, moral }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const printRef = useRef(null);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [printDone, setPrintDone] = useState(false);

  const handlePrint = () => {
    let printConfirmed = false;

    const onBeforePrint = () => {
      printConfirmed = true;
    };

    const onAfterPrint = () => {
      if (printConfirmed) {
        setPrintDone(true);
      }
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };

    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    window.print();
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmail = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSending(true);
      setEmailError('');

      try {
        await emailjs.send(
          VITE_EMAILJS_SERVICE_ID,
          VITE_EMAILJS_TEMPLATE_ID,
          {
            user_email: email,
            animal_name: t(`animals.${animal.name}`),
            traits: animal.traits.map(trait => t(`traits.${trait}`)).join(', '),
            adaptation: t(`adaptation.${adaptation}`),
            image_url: `${window.location.origin}${animal.image}`,
            logo_right_url: `${window.location.origin}/logo-right.png`,
            logo_left_url: `${window.location.origin}/logo.png`,
            story_title: title,
            story: story,
            moral: moral,
            spirit_label: t('Spirit Animal'),
            adaptation_label: t('Adaptation'),
            moral_label: t('Moral'),
            direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
            alignment: i18n.language === 'ar' ? 'right' : 'left',
          },
          VITE_EMAILJS_PUBLIC_KEY
        );
        setEmail('');
        setEmailSent(true);
      } catch (error) {
        console.error('EmailJS Error:', error);
        alert('Failed to send email. Please try again.');
      } finally {
        setIsSending(false);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!animal) return null;

  const isArabic = i18n.language === 'ar';
  const printFontSize = isArabic ? 'print:text-[15px]' : 'print:text-[13px]';
  const printFontSizeTitle = isArabic ? 'print:text-[22px]' : 'print:text-[22px]';

  return (
    <div
      className="min-h-screen w-full h-dvh overflow-hidden bg-cover bg-center relative print:bg-white print:h-auto print:overflow-visible"
      style={{ backgroundImage: `url(${swirlBg})` }}
    >
      <img
        src={greenLeft}
        alt="decorative plant left"
        className="absolute bottom-[0px] left-[20px] w-[200px] z-10 print:hidden"
      />
      <img
        src={logoRight}
        alt="logo top right"
        className="absolute top-[0px] right-[20px] w-[300px] z-10 block cursor-pointer print:hidden"
        onClick={() => window.location.reload()}
      />

      <div className="hidden mt-[20px] print:flex justify-between w-full px-10 absolute top-0 left-0 z-50">
        <img
          src={logoleft}
          alt="logo left"
          className="w-[140px] object-contain print:block"
        />
        <img
          src={logoRight}
          alt="logo right"
          className="w-[100px] object-contain print:block"
        />
      </div>

      <div ref={printRef} className="flex flex-col items-center justify-center min-h-screen px-6 print:min-h-0 print:px-0">
        <div className="bg-white flex flex-col items-center justify-start px-10 py-12 mx-auto w-[90%] max-w-[1200px] rounded-[20px] max-h-[90vh] overflow-y-auto relative print:w-full print:max-w-none print:rounded-none print:overflow-visible print:h-auto print:p-10">
          <div className="w-full flex justify-center mb-6">
            <img
              src={animal.image}
              alt={animal.name}
              className="w-[300px] print:w-[150px] mx-auto"
            />
          </div>

          <div className={`w-full px-2 md:px-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <p className={`font-avenir text-[18px] font-bold text-secondary ${printFontSize}`}>
              {t("Spirit Animal")}: <span className="italic font-normal">{t(`animals.${animal.name}`)}</span> {' '}
              ({animal.traits.map((trait, index) => (
                <span key={trait}>
                  {t(`traits.${trait}`)}
                  {index < animal.traits.length - 1 ? ', ' : ''}
                </span>
              ))})
            </p>

            <p className={`font-avenir text-[18px] font-bold mt-2 text-secondary ${printFontSize}`}>
              {t("Adaptation")}: <span className="italic font-normal">{t(`adaptation.${adaptation}`)}</span>
            </p>

            <p className={`mt-2 font-avenir text-[18px] text-secondary ${printFontSize}`}>{t("Your story")}:</p>
            <h2 className={`font-flapstick italic text-[30px] text-primary mb-6 text-center ${printFontSizeTitle}`}>
              {title}
            </h2>

            <p className={`font-avenir text-[18px] text-secondary mb-2 whitespace-pre-line ${printFontSize}`}>
              {story}
            </p>

            <p className={`font-avenir font-extrabold italic text-[18px] text-secondary ${printFontSize}`}>
              {t("Moral")}: {moral}
            </p>
          </div>

          <div className="sticky bottom-[-50px] left-0 right-0 bg-white/100 w-full mt-10 pt-6 pb-4 px-4 flex flex-col md:flex-row justify-center gap-6 print:hidden">
            <button onClick={handlePrint} className="font-avenir bg-primary hover:bg-secondary transition text-white font-bold text-[18px] px-10 py-4 rounded-full w-full md:w-[350px]">
              {t("Print my story")}
            </button>
            <button onClick={() => { setShowEmailPopup(true); setEmailSent(false); }} className="font-avenir bg-primary hover:bg-secondary transition text-white font-bold text-[18px] px-10 py-4 rounded-full w-full md:w-[350px]">
              {t("Receive by email")}
            </button>
          </div>

          {showEmailPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white text-secondary rounded-xl p-6 w-[90%] max-w-md text-center relative">
                {emailSent ? (
                  <>
                    <div className="flex flex-col items-center">
                      <button onClick={() => setShowEmailPopup(false)} className="absolute top-2 right-3 text-xl">×</button>
                      <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="mt-4 font-bold text-lg font-avenir">{t("Successfully sent your story!")}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <button onClick={() => setShowEmailPopup(false)} className="absolute top-2 right-3 text-xl">×</button>
                    <h3 className="font-avenir text-xl font-bold mb-10">{t("Send story to your email")}</h3>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("Enter your email")}
                      className="font-avenir w-[350px] px-4 py-3 border rounded-full text-secondary text-center hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition duration-200"
                    />
                    {emailError && <p className="text-primary mt-2 text-sm">{emailError}</p>}
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={handleSendEmail}
                        disabled={isSending}
                        className="bg-primary w-[350px] font-avenir text-white px-6 py-3 rounded-full font-bold"
                      >
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {printDone && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div
                className="bg-white text-secondary rounded-xl p-6 w-[90%] max-w-md text-center relative"
                dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
              >
                <button
                  onClick={() => setPrintDone(false)}
                  className="absolute top-2 right-3 text-xl"
                >
                  ×
                </button>
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2 0v4H8v-4h8z"
                    />
                  </svg>
                </div>
                <p className="mt-4 font-bold text-lg font-avenir">
                  {t("print message")}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center print:hidden">
            <p className="font-avenir text-[20px] text-secondary">
              <span
                onClick={() => window.location.reload()}
                className="underline text-primary cursor-pointer hover:text-secondary"
              >
                Start Over
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}