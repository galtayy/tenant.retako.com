import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const ViewReport = () => {
  const { token } = useParams();
  
  const [report, setReport] = useState(null);
  const [property, setProperty] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportViewed, setReportViewed] = useState(false);
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Rapor bilgilerini getir
        const response = await fetch(`http://localhost:8080/api/view-report/${token}`);
        
        if (!response.ok) {
          throw new Error('Rapor bulunamadı veya erişim süresi dolmuş');
        }
        
        const data = await response.json();
        setReport(data.report);
        setProperty(data.report.property);
        setPhotos(data.photos);
        
        // Eğer rapor henüz görüntülendi olarak işaretlenmediyse, sunucuya bildir
        if (data.report.status !== 'viewed') {
          markAsViewed();
        } else {
          setReportViewed(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [token]);
  
  // Raporu görüntülendi olarak işaretle
  const markAsViewed = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/viewed-report/${token}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setReportViewed(true);
      }
    } catch (err) {
      console.error('Rapor görüntüleme durumu güncellenemedi:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md">
          <h2 className="text-xl font-bold mb-2">Hata</h2>
          <p>{error}</p>
          <p className="mt-4">
            Eğer bu bir hata olduğunu düşünüyorsanız, lütfen kiracınızla iletişime geçin.
          </p>
        </div>
      </div>
    );
  }
  
  // Fotoğrafları oda/bölümlere göre grupla
  const photosByRoom = photos.reduce((acc, photo) => {
    if (!acc[photo.room]) {
      acc[photo.room] = [];
    }
    acc[photo.room].push(photo);
    return acc;
  }, {});
  
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kiracı Taşınma Raporu</h1>
        {reportViewed && (
          <>
            <div className="mt-2 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Görüntülendi
            </div>
            
            {report.pdfUrl && (
              <div className="mt-2">
                <a 
                  href={`http://localhost:8080${report.pdfUrl}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md hover:bg-blue-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-1" viewBox="0 0 16 16">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                  </svg>
                  PDF İndir
                </a>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol taraf - Mülk ve rapor bilgileri */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h2 className="text-xl font-medium mb-4">Mülk Bilgileri</h2>
            {property && (
              <>
                <p className="text-gray-800 mb-1">{property.address}</p>
                <p className="text-gray-600 text-sm mb-4">{property.city}</p>
                
                <h3 className="text-lg font-medium mb-2">Taraflar</h3>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600">Ev Sahibi:</p>
                  <p className="font-medium">{property.landlordName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Kiracı:</p>
                  <p className="font-medium">{property.user.name}</p>
                </div>
              </>
            )}
          </div>
          
          <div className="card">
            <h2 className="text-xl font-medium mb-4">Rapor Detayları</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Rapor Tarihi:</p>
              <p className="font-medium">
                {new Date(report.reportDate).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Rapor Türü:</p>
              <p className="font-medium">Taşınma Girişi</p>
            </div>
            
            {report.additionalNotes && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Ek Notlar:</p>
                <div className="bg-gray-50 p-3 rounded-md text-gray-800 whitespace-pre-line">
                  {report.additionalNotes}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Sağ taraf - Fotoğraflar */}
        <div className="lg:col-span-3">
          <div className="card">
            <h2 className="text-xl font-medium mb-6">Mülk Durumu Fotoğrafları</h2>
            
            {photos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Bu raporda henüz fotoğraf bulunmamaktadır.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(photosByRoom).map(([room, roomPhotos]) => (
                  <div key={room} className="border-b border-gray-200 pb-8 mb-8 last:border-0">
                    <h3 className="text-xl font-medium mb-4">{room}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roomPhotos.map((photo) => (
                        <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="aspect-square overflow-hidden">
                            <img 
                              src={`http://localhost:8080${photo.path}`} 
                              alt={photo.originalName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            {photo.damageDescription && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700">Hasar Açıklaması:</p>
                                <p className="text-gray-600">{photo.damageDescription}</p>
                              </div>
                            )}
                            {photo.location && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Konum:</p>
                                <p className="text-gray-600">{photo.location}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">Bu rapor, kiracı tarafından oluşturulmuş ve size özel bir link ile paylaşılmıştır.</p>
        <p className="text-gray-500 text-sm mt-1">© {new Date().getFullYear()} Kiracı Depozito Koruma</p>
      </div>
    </div>
  );
};

export default ViewReport;