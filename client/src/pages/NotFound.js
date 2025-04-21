import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-medium text-gray-700 mb-6">Sayfa Bulunamadı</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        Aradığınız sayfa bulunamadı. Sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak ulaşılamıyor olabilir.
      </p>
      <Link to="/" className="btn-primary">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
};

export default NotFound;
