import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../config';

const ReportDetails = () => {
  const { reportId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [report, setReport] = useState(null);
  const [property, setProperty] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Rapor bilgilerini ve fotoğrafları yükle
  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        // Rapor bilgilerini getir
        const reportResponse = await authFetch(`http://localhost:8080/api/reports/${reportId}`);
        
        if (!reportResponse.ok) {
          throw new Error('Report information could not be retrieved');
        }
        
        const reportData = await reportResponse.json();
        setReport(reportData);
        setProperty(reportData.property);
        
        // Fotoğrafları getir
        const photosResponse = await authFetch(`http://localhost:8080/api/reports/${reportId}/photos`);
        
        if (!photosResponse.ok) {
          throw new Error('Photo information could not be retrieved');
        }
        
        const photosData = await photosResponse.json();
        setPhotos(photosData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportDetails();
  }, [authFetch, reportId]);
  
  // Raporu ev sahibine gönder
  const handleSendReport = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo for the report');
      return;
    }
    
    try {
      const response = await authFetch(`http://localhost:8080/api/reports/${reportId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Kiracı'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while sending the report');
      }
      
      // Rapor durumunu güncelle
      const updatedReportData = await response.json();
      setReport(updatedReportData.report);
    } catch (err) {
      setError(err.message);
    }
  };
  
  // Raporu paylaşma linki oluştur
  const getShareableLink = () => {
    return `${window.location.origin}/view-report/${report.accessToken}`;
  };
  
  // Status descriptions for reports
  const getStatusDescription = (status) => {
    switch (status) {
      case 'draft':
        return 'This report is still in draft stage and has not been sent to the landlord. Add photos and complete the report.';
      case 'sent':
        return 'This report has been sent to the landlord but has not been viewed yet.';
      case 'viewed':
        return 'This report has been viewed by the landlord.';
      default:
        return '';
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Report Details</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="btn-secondary"
        >
          Go Back
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol taraf - Rapor bilgileri */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <h2 className="text-lg font-medium mb-3">Report Information</h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Report Status:</p>
              <div 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  report.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : report.status === 'sent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {report.status === 'draft' ? 'Draft' : report.status === 'sent' ? 'Sent' : 'Viewed'}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {getStatusDescription(report.status)}
            </p>
            
            <div className="my-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-1">Report Date:</p>
              <p className="font-medium">
                {new Date(report.reportDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            {report.status === 'viewed' && report.lastViewed && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Viewing Date:</p>
                <p className="font-medium">
                {new Date(report.lastViewed).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
                })}
                </p>
              </div>
            )}
          </div>
          
          <div className="card mb-6">
            <h2 className="text-lg font-medium mb-3">Property Information</h2>
            {property && (
              <>
                <p className="text-gray-800 mb-1">{property.address}</p>
                <p className="text-gray-600 text-sm mb-3">{property.city}</p>
                
                <div className="my-4 border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-1">Landlord:</p>
                  <p className="font-medium">{property.landlordName}</p>
                  <p className="text-gray-600 text-sm">{property.landlordEmail}</p>
                  {property.landlordPhone && (
                    <p className="text-gray-600 text-sm">{property.landlordPhone}</p>
                  )}
                </div>
              </>
            )}
          </div>
          
          {report.additionalNotes && (
            <div className="card mb-6">
              <h2 className="text-lg font-medium mb-3">Additional Notes</h2>
              <p className="text-gray-800 whitespace-pre-line">{report.additionalNotes}</p>
            </div>
          )}
          
          {report.status === 'draft' ? (
            <div className="space-y-3">
              <Link 
                to={`/reports/${reportId}/photos`}
                className="btn-primary block text-center"
              >
                Add/Edit Photos
              </Link>
              
              {photos.length > 0 && (
                <button 
                  onClick={handleSendReport}
                  className="btn-secondary block w-full"
                >
                  Send Report
                </button>
              )}
            </div>
          ) : (
            <div className="card">
              <h2 className="text-lg font-medium mb-3">Share Link</h2>
              <p className="text-sm text-gray-600 mb-3">
                With this link the landlord can view the report:
              </p>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={getShareableLink()}
                  className="input-field text-sm flex-grow"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getShareableLink());
                    alert('Link copied!');
                  }}
                  className="ml-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Sağ taraf - Fotoğraflar */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-medium mb-4">Photos</h2>
            
            {photos.length === 0 ? (
              <div className="bg-gray-50 p-8 text-center rounded-md">
                <p className="text-gray-600 mb-4">No photos added yet</p>
                {report.status === 'draft' && (
                  <Link 
                    to={`/reports/${reportId}/photos`}
                    className="btn-primary inline-block"
                  >
                    Add Photos
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(photosByRoom).map(([room, roomPhotos]) => (
                  <div key={room}>
                    <h3 className="text-lg font-medium mb-3 pb-2 border-b">{room}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {roomPhotos.map((photo) => (
                        <div key={photo.id} className="card p-3">
                          <div className="aspect-square mb-3 overflow-hidden rounded-md">
                            <img 
                              src={`http://localhost:8080${photo.path}`} 
                              alt={photo.originalName} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {photo.damageDescription && (
                            <div className="mb-2">
                              <p className="text-xs text-gray-600 font-medium">Damage Description:</p>
                              <p className="text-sm">{photo.damageDescription}</p>
                            </div>
                          )}
                          {photo.location && (
                            <div>
                              <p className="text-xs text-gray-600 font-medium">Location:</p>
                              <p className="text-sm">{photo.location}</p>
                            </div>
                          )}
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
    </div>
  );
};

export default ReportDetails;
