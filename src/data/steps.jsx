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
      hasMap: false,
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
    id: "interactiveMap",
    title: "Интерактивная карта",
    description: "Интерактивная карта обсуждаемого эпизода",
    videoId: null,
    transitionType: "map",
    markers: [],
    keywords: [],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  },
  {
    id: "chapter3",
    title: "Глава 3",
    description: "Кульминация событий",
    videoId: "mapBase",
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
    id: "chapter5_1",
    title: "Глава 5 (Часть 1)",
    description: "Начало развязки сюжета",
    videoId: null,
    transitionType: "article",
    markers: [],
    keywords: ["развязка", "итоги", "часть первая"],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  },
  {
    id: "chapter5_2",
    title: "Глава 5 (Часть 2)",
    description: "Продолжение развязки сюжета",
    videoId: "chapter5_2",
    transitionType: "slide",
    markers: [],
    keywords: ["развязка", "итоги", "часть вторая"],
    infoContent: {
      hasMap: false,
      hasInfo: true
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
      hasInfo: true
    }
  },
  {
    id: "chapter7",
    title: "Глава 7",
    description: "Эпилог",
    videoId: "chapter7",
    transitionType: "fade",
    markers: [],
    keywords: ["эпилог", "итог", "завершение"],
    infoContent: {
      hasMap: true,
      hasInfo: true
    }
  },
  {
    id: "artilleryCounter",
    title: "Контрбатарейная борьба",
    description: "Демонстрация контрбатарейной борьбы",
    videoId: "artilleryCounter",
    transitionType: "fade",
    markers: [],
    keywords: ["артиллерия", "контрбатарейная", "военная тактика"],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  },
  {
    id: "heavyArtillery",
    title: "Тяжелая артиллерия",
    description: "Действие тяжелой артиллерии",
    videoId: "heavyArtillery",
    transitionType: "fade",
    markers: [],
    keywords: ["артиллерия", "тяжелая", "военная техника"],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  },
  {
    id: "infantry",
    title: "Пехота",
    description: "Действия пехотных подразделений",
    videoId: "infantry",
    transitionType: "fade",
    markers: [],
    keywords: ["пехота", "солдаты", "боевые действия"],
    infoContent: {
      hasMap: false,
      hasInfo: true
    }
  }
];


export function getStepById(id) {
  return steps.find(step => step.id === id);
}

export function getStepByIndex(index) {
  return steps[index];
}

export function getNextStep(currentId) {
  const currentIndex = steps.findIndex(step => step.id === currentId);
  if (currentIndex === -1 || currentIndex === steps.length - 1) {
    return null;
  }
  return steps[currentIndex + 1];
}

export function getPrevStep(currentId) {
  const currentIndex = steps.findIndex(step => step.id === currentId);
  if (currentIndex <= 0) {
    return null;
  }
  return steps[currentIndex - 1];
}

export function getAllSteps() {
  return steps;
}

export function hasAdditionalContent(id) {
  const step = getStepById(id);
  if (!step) return false;

  return step.infoContent && (step.infoContent.hasMap || step.infoContent.hasInfo);
}

export default steps;
