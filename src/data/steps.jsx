import { hasInfoContent } from './infoContent/infoData';

const steps = [
  {
    id: "chapter1",
    title: "Глава 1",
    description: "Вступительная глава истории",
    videoId: "chapter1",
    transitionType: "fade",
    markers: [
      {
        time: 10,
        title: "Важный момент",
        description: "Описание важного момента в первой главе"
      }
    ],
    keywords: ["начало", "введение", "история"],
    infoContent: {
      hasMap: true,
      hasInfo: true
    }
  },
  {
    id: "chapter2",
    title: "Глава 2",
    description: "Развитие основных событий",
    videoId: "chapter2",
    transitionType: "fade",
    markers: [
      {
        time: 15,
        title: "Ключевое событие",
        description: "Описание ключевого события во второй главе"
      }
    ],
    keywords: ["развитие", "события", "ключевые моменты"],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  },
  {
    id: "chapter3",
    title: "Глава 3",
    description: "Продолжение истории",
    videoId: "chapter3",
    transitionType: "crossfade",
    markers: [],
    keywords: ["продолжение", "история", "детали"],
    infoContent: {
      hasMap: true,
      hasInfo: false
    }
  },
  {
    id: "chapter4",
    title: "Глава 4",
    description: "Кульминация событий",
    videoId: "chapter4",
    transitionType: "zoom",
    markers: [
      {
        time: 20,
        title: "Кульминация",
        description: "Кульминационный момент всей истории"
      }
    ],
    keywords: ["кульминация", "пик", "важно"],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  },
  {
    id: "chapter5",
    title: "Глава 5",
    description: "Развязка сюжета",
    videoId: "chapter5",
    transitionType: "slide",
    markers: [],
    keywords: ["развязка", "итоги", "результаты"],
    infoContent: {
      hasMap: false,
      hasInfo: false
    }
  },
  {
    id: "chapter6",
    title: "Глава 6",
    description: "Заключение истории",
    videoId: "chapter6",
    transitionType: "fade",
    markers: [
      {
        time: 25,
        title: "Заключительные слова",
        description: "Финальные мысли и выводы"
      }
    ],
    keywords: ["заключение", "финал", "конец"],
    infoContent: {
      hasMap: false,
      hasInfo: false
    }
  }
];

export const getStepById = (id) => steps.find(step => step.id === id);

export const getStepByIndex = (index) => steps[index] || null;

export const getNextStep = (currentId) => {
  const currentIndex = steps.findIndex(step => step.id === currentId);
  if (currentIndex === -1 || currentIndex === steps.length - 1) return null;
  return steps[currentIndex + 1];
};

export const getPrevStep = (currentId) => {
  const currentIndex = steps.findIndex(step => step.id === currentId);
  if (currentIndex <= 0) return null;
  return steps[currentIndex - 1];
};

export const hasAdditionalContent = (id) => {
  const step = getStepById(id);
  return step && (step.infoContent.hasMap || step.infoContent.hasInfo);
};

export default steps;

export const stepsMap = steps.reduce((acc, step) => {
  acc[step.id] = step;
  return acc;
}, {});

export const totalSteps = steps.length;

