import React, { useState, useEffect, useMemo } from 'react';
import swirlBg from '../assets/backgrounds/swirl-bg.png';
import greenLeft from '../assets/backgrounds/green5.png';
import logoRight from '../assets/backgrounds/logo-right.png';
import FinalReveal from './FinalReveal';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function useQuizData(t) {
  return useMemo(() => [
    {
      type: 'question',
      id: 1,
      text: t('quiz.q0.text'),
      options: [
        { text: t('quiz.q0.a1'), animal: 'elephant' },
        { text: t('quiz.q0.a2'), animal: 'fox' },
        { text: t('quiz.q0.a3'), animal: 'monkey' },
        { text: t('quiz.q0.a4'), animal: 'duck' }
      ]
    },
    {
      type: 'question',
      id: 2,
      text: t('quiz.q1.text'),
      options: [
        { text: t('quiz.q1.a1'), animal: 'lion' },
        { text: t('quiz.q1.a2'), animal: 'hare' },
        { text: t('quiz.q1.a3'), animal: 'ox' },
        { text: t('quiz.q1.a4'), animal: 'turtle' }
      ]
    },
    {
      type: 'question',
      id: 3,
      text: t('quiz.q2.text'),
      options: [
        { text: t('quiz.q2.a1'), animals: ['elephant', 'turtle'] },
        { text: t('quiz.q2.a2'), animals: ['fox', 'hare'] },
        { text: t('quiz.q2.a3'), animals: ['duck', 'monkey'] },
        { text: t('quiz.q2.a4'), animals: ['ox', 'lion'] }
      ]
    },
    {
      type: 'question',
      id: 4,
      text: t('quiz.q3.text'),
      options: [
        { text: t('quiz.q3.a1'), animal: 'dove' },
        { text: t('quiz.q3.a2'), animal: 'monkey' },
        { text: t('quiz.q3.a3'), animal: 'ox' },
        { text: t('quiz.q3.a4'), animal: 'fox' }
      ]
    },
    {
      type: 'question',
      id: 5,
      text: t('quiz.q4.text'),
      options: [
        { text: t('quiz.q4.a1'), animal: 'elephant' },
        { text: t('quiz.q4.a2'), animal: 'fox' },
        { text: t('quiz.q4.a3'), animal: 'turtle' },
        { text: t('quiz.q4.a4'), animal: 'duck' }
      ]
    }
  ], [t]);
}

function getFinalAnimal(answers) {
  const countMap = {};

  answers.forEach(({ answer }) => {
    if (answer.animal) {
      countMap[answer.animal] = (countMap[answer.animal] || 0) + 1;
    } else if (answer.animals) {
      answer.animals.forEach((animal) => {
        countMap[animal] = (countMap[animal] || 0) + 1;
      });
    }
  });

  const maxCount = Math.max(...Object.values(countMap));
  const topAnimals = Object.entries(countMap).filter(([_, count]) => count === maxCount);
  const randomWinner = topAnimals[Math.floor(Math.random() * topAnimals.length)][0];

  const spiritAnimalMap = {
    lion: { image: '/animals/lion.png' },
    elephant: { image: '/animals/elephant.png' },
    duck: { image: '/animals/duck2.png' },
    turtle: { image: '/animals/turtle.png' },
    hare: { image: '/animals/rabbit.png' },
    ox: { image: '/animals/ox.png' },
    monkey: { image: '/animals/monkey.png' },
    dove: { image: '/animals/dove.png' },
    fox: { image: '/animals/fox.png' },
  };

  return {
    name: randomWinner,
    ...spiritAnimalMap[randomWinner]
  };
}

function generateStoryPrompt({ name, animal, language }) {
  if (!animal || !animal.name) {
    console.error('Invalid animal data:', animal);
    return null;
  }

  const animalName = capitalize(animal.name);

  if (language === 'en') {
    return `
    Write a short description reflecting the character's personality traits and moral alignment inspired by Kalila wa Dimna.

    The character is named ${name}, and their spirit animal is the ${animalName}.

    It should be symbolic, moral-focused, child-friendly, and between 80 to 100 words written in English.

    Provide ONLY valid JSON as follows:
    {
      "description": "Your short description here"
    }

    Do not include explanations or formatting beyond this JSON object.
    `.trim();
  }

  if (language === 'ar') {
    return `
    Write a short description reflecting the character's personality traits and moral alignment inspired by Kalila wa Dimna.

    The character is named ${name}, and their spirit animal is the ${animalName}.

    It should be symbolic, moral-focused, child-friendly, and between 80 to 100 words written in العربية الفصحى.

    Provide ONLY valid JSON as follows:
    {
      "description": "Your short description here"
    }

    Do not include explanations or formatting beyond this JSON object.
    `.trim();
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function generateStory({ t, name, character, animal, theme, adaptation, language }) {
  const prompt = generateStoryPrompt({ t, name, character, animal, language });

  if (!prompt) {
    console.error('Failed to generate story prompt');
    return null;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 800,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const json = JSON.parse(content);
    return json;
  } catch (error) {
    console.error('OpenAI API Error:', error.response || error);
    return null;
  }
}

export default function QuizFlow({ userName }) {
  const { t, i18n } = useTranslation();
  const quizData = useQuizData(t);

  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalAnimal, setFinalAnimal] = useState(null);
  const [storyReady, setStoryReady] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentQuestion = quizData[currentIndex];

  const handleAnswerClick = (option) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setAnswers([...answers, { question: currentQuestion.text, answer: option }]);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => {
    if (currentQuestion?.type === 'loader') {
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, currentQuestion.duration || 2000);
      return () => clearTimeout(timeout);
    }

    if (!currentQuestion && !finalAnimal) {
      const result = getFinalAnimal(answers);

      if (!result) {
        console.error('Missing required data:', { result });
        return;
      }

      setIsGenerating(true);

      const language = i18n.language;

      generateStory({ t, name: userName, character: 'child', animal: result, language }).then((storyResponse) => {
        if (storyResponse) {
          setFinalAnimal(result);
          setStoryData(storyResponse);
          setStoryReady(true);
        } else {
          console.error('Failed to generate story');
        }
        setIsGenerating(false);
      });
    }
  }, [currentQuestion]);

  // if (isGenerating || (!storyReady && finalAnimal)) {
  if (isGenerating) {

    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-center px-6 relative"
        style={{ backgroundImage: `url(${swirlBg})` }} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <img src={greenLeft} alt="decorative plant left" className="absolute bottom-[0px] left-[20px] w-[200px] z-10" />
        <img src={logoRight} alt="logo top right" className="absolute top-[0px] right-[20px] w-[300px] z-10 cursor-pointer" onClick={() => window.location.reload()} />
        <div className="text-[50px] font-avenir text-secondary animate-zoom-grow max-w-xl mb-8">
          {t('quiz.loader1')}
        </div>
        <div className="mb-6">
          {/* <div className="border-4 border-primary border-t-transparent rounded-full w-16 h-16 animate-spin-slow mx-auto"></div> */}
          <svg aria-hidden="true" className="inline w-12 h-12 text-[#f3f3f34d] animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
        </div>
      </div>
    );
  }

  if (finalAnimal && storyReady && storyData) {
    const customTitle = `${userName}, ${t(`traits.${finalAnimal.name}`)}`;
    return <FinalReveal
      animal={finalAnimal}
      title={customTitle}
      story={storyData.description}
    />;
  }

  if (!currentQuestion) return null;

  if (currentQuestion.type === 'loader') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-center px-6 relative"
        style={{ backgroundImage: `url(${swirlBg})` }} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
      >
        <img src={greenLeft} alt="decorative plant left" className="absolute bottom-[0px] left-[20px] w-[200px] z-10" />
        <img src={logoRight} alt="logo top right" className="absolute top-[0px] right-[20px] w-[300px] z-10 cursor-pointer" onClick={() => window.location.reload()} />
        <div className="text-[50px] font-avenir text-secondary animate-zoom-grow max-w-xl mb-8">
          {currentQuestion.text}
        </div>
        <div className="mb-6">
          {/* <div className="border-4 border-primary border-t-transparent rounded-full w-16 h-16 animate-spin-slow mx-auto"></div> */}
          <svg aria-hidden="true" className="inline w-12 h-12 text-[#f3f3f34d] animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full h-dvh overflow-hidden bg-cover bg-center relative"
      style={{ backgroundImage: `url(${swirlBg})` }}
    >
      <img src={greenLeft} alt="decorative plant left" className="absolute bottom-[0px] left-[20px] w-[200px] z-10" />
      <img src={logoRight} alt="logo top right" className="absolute top-[0px] right-[20px] w-[300px] z-10 cursor-pointer" onClick={() => window.location.reload()} />

      <div className="absolute top-[162px] right-[210px] z-50 bg-white rounded-full flex overflow-hidden border border-primary text-sm font-bold">
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

      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="bg-white/100 flex flex-col items-center justify-center h-[80vh] min-h-80 px-6 mx-auto w-[90%] max-w-[1200px] rounded-[20px] py-12">
          <h2 className="font-flapstick text-secondary text-[32px] md:text-4xl text-center mb-10">
            {currentQuestion.text}
          </h2>

          {!isTransitioning && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.currentTarget.blur();
                    document.activeElement?.blur();
                    handleAnswerClick(option)
                  }}
                  className="focus:outline-none bg-primary text-white text-center px-6 py-5 rounded-[30px] w-80 text-[22px] font-avenir hover:bg-secondary transition"
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}