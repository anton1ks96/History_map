import React from 'react';
import { Routes, Route } from 'react-router-dom';
import IntroPage from '../components/IntroPage/IntroPage';
import MainPage from '../components/MainPage/MainPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<IntroPage />} />
      <Route path="/main" element={<MainPage />} />
    </Routes>
  );
};

export default AppRoutes;
