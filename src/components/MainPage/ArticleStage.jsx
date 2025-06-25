import React, { useState, useRef } from 'react';
import '../../styles/articleStage.scss';

const ArticleStage = ({ chapterId, onNext, onPrev }) => {
  const [isExiting, setIsExiting] = useState(false);
  const articleRef = useRef(null);
  const exitTimeout = useRef(null);

  const articleData = {
    title: 'Наступление, которое не смогли удержать',
    subtitle: 'От молниеносного прорыва к изнуряющей остановке',
    content: [
      {
        type: 'paragraph',
        text: 'Первые трое суток Брусиловского наступления стали моментом, который перевернул всю структуру Восточного фронта. 8-я армия прорвала позиции под Луцком, части генерала Лечицкого взяли Черновицы, а 11-я и 7-я армии теснили австро-венгров в Галиции. До 5 (18) июня оборона противника на участке более 200 км обрушилась, открыв путь вглубь территории Австро-Венгрии.'
      },
      {
        type: 'quote',
        text: 'Фронт не продавливался — он осыпался слоями. Это было не наступление, а обвал.',
        author: 'Современный военный историк'
      },
      {
        type: 'paragraph',
        text: 'К исходу 72 часов русские войска продвинулись на 80 км, захватили десятки тысяч пленных, орудия, склады. Впервые за всю войну кавалерия получила возможность выйти в оперативную глубину — перехватывая обоза, связи и командные пункты. Тактически наступление выглядело безупречно. Но на стратегическом уровне надвигалась новая реальность.'
      },
      {
        type: 'subheader',
        text: '«Ковельская дыра» и немецкий мост'
      },
      {
        type: 'paragraph',
        text: 'Штаб Германии в панике начал срочную переброску резервов с Западного фронта. В течение 76 часов немецкие дивизии, снятые с-под Вердена, прибыли под Брест-Литовск. Ковель — важнейший железнодорожный узел — стал символом сопротивления: русские штурмовали его раз за разом, но противник успел закрепиться.'
      },
      {
        type: 'list',
        items: [
          'На Восточный фронт переброшено 18 германских и 2 австро-венгерские дивизии',
          'Темп наступления упал с 25 км/сутки до 4–5 км',
          'Фронт стабилизировался вдоль реки Стоход к концу июня',
          'Началась вторая, изнуряющая фаза операции'
        ]
      },
      {
        type: 'subheader',
        text: 'Стоход – болото, где умер манёвр'
      },
      {
        type: 'paragraph',
        text: 'Брусиловский прорыв захлебнулся не под ударами врага, а в вязком, болотистом ландшафте. В долине реки Стоход пехота стояла по колено в воде, артиллерия вязла в почве, потери от болезней и обморожений летом (!) превышали боевые. Это была не позиционная война — это был тупик.'
      },
      {
        type: 'paragraph',
        text: 'К июлю стало ясно: стратегическое окно закрыто. Без свежих резервов, с истощённой логистикой и наступающей немецкой артиллерией, русские армии перешли к обороне. Это был конец не только операции, но и последней наступательной инициативы России в Первой мировой.'
      }
    ],
    footnote: 'Материал основан на хронике штаба Юго-Западного фронта, донесениях русской Ставки и послевоенных исследованиях оперативной обстановки лета 1916 года.'
  };

  const navigateToNext = () => {
    if (isExiting) return;
    setIsExiting(true);
    exitTimeout.current = setTimeout(() => onNext(), 300);
  };

  const navigateToPrev = () => {
    if (isExiting) return;
    setIsExiting(true);
    exitTimeout.current = setTimeout(() => onPrev(), 300);
  };

  const handleWheel = (e) => {
    if (isExiting) return;

    const container = articleRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    if (scrollTop === 0 && e.deltaY < 0) {
      e.stopPropagation();
      navigateToPrev();
      return;
    }

    if (Math.abs(scrollTop + clientHeight - scrollHeight) < 5 && e.deltaY > 0) {
      e.stopPropagation();
      navigateToNext();
      return;
    }
  };

  const renderContent = (content) => {
    return content.map((item, index) => {
      switch (item.type) {
        case 'paragraph':
          return <p key={index} className="article-paragraph">{item.text}</p>;
        case 'quote':
          return (
            <blockquote key={index} className="article-quote">
              <p>{item.text}</p>
              {item.author && <cite>— {item.author}</cite>}
            </blockquote>
          );
        case 'subheader':
          return <h3 key={index} className="article-subheader">{item.text}</h3>;
        case 'list':
          return (
            <ul key={index} className="article-list">
              {item.items.map((listItem, listIndex) => (
                <li key={`${index}-${listIndex}`}>{listItem}</li>
              ))}
            </ul>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className={`article-stage noise-background ${isExiting ? 'exit' : ''}`}>
      <div
        className="article-container"
        ref={articleRef}
        onWheel={handleWheel}
      >
        <div className="article-content">
          <h1 className="article-title">{articleData.title}</h1>
          <h2 className="article-subtitle">{articleData.subtitle}</h2>

          <div className="article-body">
            {renderContent(articleData.content)}
          </div>

          {articleData.footnote && (
            <div className="article-footnote">
              {articleData.footnote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleStage;
