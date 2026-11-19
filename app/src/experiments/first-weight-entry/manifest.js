export default {
  title: 'Первый ввод веса',
  variants: [
    {
      id: 'a',
      label: 'A',
      steps: [
        { id: 'start', label: 'Стартовый экран' },
        { id: 'entry', label: 'Ввод веса' },
        { id: 'saved', label: 'Замер сохранён' },
      ],
    },
    {
      id: 'b',
      label: 'B',
      steps: [
        { id: 'entry', label: 'Ввод веса' },
        { id: 'saved', label: 'Замер сохранён' },
      ],
    },
  ],
};
