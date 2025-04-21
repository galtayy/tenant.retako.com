import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PhotoUpload = () => {
  const { reportId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  const imageRef = useRef(null);
  
  const [report, setReport] = useState(null);
  const [property, setProperty] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form durumları
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [room, setRoom] = useState('');
  const [damageDescription, setDamageDescription] = useState('');
  const [location, setLocation] = useState('');
  const [damageTypes, setDamageTypes] = useState([]);
  const [markedPositions, setMarkedPositions] = useState([]);
  const [activeMarking, setActiveMarking] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Fixed damage types
  const DAMAGE_TYPE_OPTIONS = [
    'Crack', 'Hole', 'Stain', 'Scratch', 'Water Damage', 'Mold', 'Paint Damage', 'Broken'
  ];
  
  // Rapor bilgilerini ve mevcut fotoğrafları yükle
  useEffect(() => {
    const fetchReportAndPhotos = async () => {
      try {
        // Rapor bilgilerini getir
        const reportResponse = await authFetch(`http://localhost:8080/api/reports/${reportId}`);
        
        if (!reportResponse.ok) {
          throw new Error('Report information could not be retrieved');
        }
        
        const reportData = await reportResponse.json();
        setReport(reportData);
        setProperty(reportData.property);
        
        // Mevcut fotoğrafları getir
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
    
    fetchReportAndPhotos();
  }, [authFetch, reportId]);
  
  // Fotoğrafta işaretleme modunu aktif et
  const toggleMarkingMode = () => {
    setActiveMarking(!activeMarking);
  };
  
  // Fotoğraf üzerinde bir noktayı işaretle
  const handleImageClick = (e) => {
    if (!activeMarking || !previewUrls.length) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Yeni işaret ekle
    const newMark = {
      x,
      y,
      type: damageTypes.length > 0 ? damageTypes[0] : 'Genel'
    };
    
    setMarkedPositions([...markedPositions, newMark]);
  };
  
  // İşareti kaldır
  const removeMark = (index) => {
    const newMarkedPositions = [...markedPositions];
    newMarkedPositions.splice(index, 1);
    setMarkedPositions(newMarkedPositions);
  };
  
  // Hasar tipi seç
  const handleDamageTypeSelect = (type) => {
    if (damageTypes.includes(type)) {
      setDamageTypes(damageTypes.filter(t => t !== type));
    } else {
      setDamageTypes([...damageTypes, type]);
    }
  };
  
  // Dosya seçildiğinde önizleme oluştur
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Önizleme URL'leri oluştur
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviewUrls);
    
    // Seçilen görseli ilk olarak ayarla
    if (newPreviewUrls.length > 0) {
      setSelectedImageIndex(0);
    }
    
    // İşaretleri sıfırla
    setMarkedPositions([]);
  };
  
  // Fotoğraf yükleme
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one photo');
      return;
    }
    
    if (!room) {
      setError('Please enter room/section information');
      return;
    }
    
    setError('');
    setSuccess('');
    setUploading(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });
      
      formData.append('room', room);
      if (damageDescription) formData.append('damageDescription', damageDescription);
      if (location) formData.append('location', location);
      
      // İşaretlenen hasar konumlarını JSON olarak ekle
      if (markedPositions.length > 0) {
        formData.append('damageMarks', JSON.stringify(markedPositions));
      }
      
      // Seçilen hasar tiplerini ekle
      if (damageTypes.length > 0) {
        formData.append('damageTypes', JSON.stringify(damageTypes));
      }
      
      const response = await authFetch(`http://localhost:8080/api/reports/${reportId}/photos`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred while uploading the photo');
      }
      
      const newPhotos = await response.json();
      
      // Yüklenen fotoğrafları ekle ve formu sıfırla
      setPhotos(prevPhotos => [...prevPhotos, ...newPhotos]);
      setSelectedFiles([]);
      setPreviewUrls([]);
      setRoom('');
      setDamageDescription('');
      setLocation('');
      setMarkedPositions([]);
      setDamageTypes([]);
      setActiveMarking(false);
      
      setSuccess('Photos uploaded successfully');
      
      // Önizleme URL'lerini temizle
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  // Raporu tamamla ve ev sahibine gönder
  const handleCompleteReport = async () => {
    if (photos.length === 0) {
      setError('Please upload at least one photo for the report');
      return;
    }
    
    setError('');
    setSuccess('');
    
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
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Upload Photos</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sol taraf - Rapor ve Mülk Bilgileri */}
        <div className="md:col-span-1">
          <div className="card mb-6">
            <h2 className="text-lg font-medium mb-3">Report Information</h2>
            {property && (
              <>
                <p className="text-gray-800 mb-1">{property.address}</p>
                <p className="text-gray-600 text-sm mb-3">{property.city}</p>
              </>
            )}
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Report Status: <span className="font-medium">{report?.status === 'draft' ? 'Draft' : (report?.status === 'sent' ? 'Sent' : 'Viewed')}</span>
              </p>
              <p className="text-sm text-gray-600">
                Uploaded Photos: <span className="font-medium">{photos.length}</span>
              </p>
            </div>
          </div>
          
          <div className="card">
            <h2 className="text-lg font-medium mb-3">How to Take Good Photos?</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Take wide-angle photos showing the general view of the room</li>
              <li>Capture existing damages clearly and up close</li>
              <li>Take photos in well-lit environments</li>
              <li>Document all important points in each room</li>
              <li>Check doors, windows, walls, floors, and ceilings</li>
            </ul>
          </div>
        </div>
        
        {/* Sağ taraf - Fotoğraf Yükleme Formu */}
        <div className="md:col-span-2">
          <div className="card mb-6">
            <form onSubmit={handleUpload}>
              <div className="mb-4">
                <label htmlFor="photos" className="form-label">Select Photos</label>
                <input
                  type="file"
                  id="photos"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {previewUrls.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="form-label">Preview:</p>
                    <button
                      type="button"
                      onClick={toggleMarkingMode}
                      className={`px-3 py-1 rounded text-sm ${activeMarking 
                        ? 'bg-red-500 text-white' 
                        : 'bg-blue-100 text-blue-800'}`}
                    >
                      {activeMarking ? 'Close Marking Mode' : 'Mark Damage'}
                    </button>
                  </div>
                  
                  {/* Ana önizleme resmi - işaretleme için */}
                  <div className="relative mb-3 border rounded-lg overflow-hidden">
                    <img 
                      ref={imageRef}
                      src={previewUrls[selectedImageIndex]} 
                      alt={`Preview ${selectedImageIndex + 1}`} 
                      className="w-full object-contain max-h-96"
                      onClick={handleImageClick}
                      style={{ cursor: activeMarking ? 'crosshair' : 'default' }}
                    />
                    
                    {/* İşaretleri göster */}
                    {markedPositions.map((mark, index) => (
                      <div 
                        key={index}
                        className="absolute w-6 h-6 flex items-center justify-center"
                        style={{ 
                          left: `${mark.x}%`, 
                          top: `${mark.y}%`, 
                          transform: 'translate(-50%, -50%)',
                          backgroundColor: 'rgba(255, 0, 0, 0.5)',
                          borderRadius: '50%',
                          border: '2px solid white'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeMarking) removeMark(index);
                        }}
                      >
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Küçük önizlemeler - çoklu fotoğraf için */}
                  {previewUrls.length > 1 && (
                    <div className="flex overflow-x-auto space-x-2 pb-2">
                      {previewUrls.map((url, index) => (
                        <div 
                          key={index} 
                          className={`w-20 h-20 flex-shrink-0 overflow-hidden rounded-md cursor-pointer ${selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img 
                            src={url} 
                            alt={`Small preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Hasar tipleri */}
                  {activeMarking && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium mb-2">Select Damage Type:</p>
                      <div className="flex flex-wrap gap-2">
                        {DAMAGE_TYPE_OPTIONS.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleDamageTypeSelect(type)}
                            className={`px-2 py-1 text-xs rounded-full ${damageTypes.includes(type) 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-800'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                      
                      {markedPositions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-1">Marked Damages:</p>
                          <div className="max-h-32 overflow-y-auto">
                            {markedPositions.map((mark, index) => (
                              <div key={index} className="flex items-center justify-between py-1 border-b">
                                <div className="flex items-center">
                                  <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs mr-2">{index + 1}</span>
                                  <span>{mark.type}</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => removeMark(index)}
                                  className="text-red-500 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="room" className="form-label">Room/Section*</label>
                <select
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  required
                  className="input-field"
                >
                  <option value="">Select</option>
                  <option value="Living Room">Living Room</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Toilet">Toilet</option>
                  <option value="Hallway">Hallway</option>
                  <option value="Balcony">Balcony</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="damageDescription" className="form-label">Damage Description (If Any)</label>
                <textarea
                  id="damageDescription"
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  className="input-field h-24"
                  placeholder="Describe the damage in the photo in detail"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="form-label">Location Detail (Optional)</label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-field"
                  placeholder="E.g.: Right wall, kitchen counter, bathroom door"
                />
              </div>
              
              <button
                type="submit"
                disabled={uploading || selectedFiles.length === 0}
                className="btn-primary w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </button>
            </form>
          </div>
          
          {/* Yüklenen Fotoğraflar */}
          <div className="card">
            <h2 className="text-lg font-medium mb-3">Uploaded Photos</h2>
            
            {photos.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No photos uploaded yet</p>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square overflow-hidden rounded-md">
                        <img 
                          src={`http://localhost:8080${photo.path}`} 
                          alt={photo.originalName} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-end p-2">
                        <div className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="font-medium">{photo.room}</p>
                          {photo.location && <p>{photo.location}</p>}
                          {photo.damageDescription && (
                            <p className="text-red-300">{photo.damageDescription}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Hasar işaretleri göster */}
                      {photo.damageMarks && typeof photo.damageMarks === 'string' && (
                        JSON.parse(photo.damageMarks).map((mark, index) => (
                          <div 
                            key={index}
                            className="absolute w-4 h-4 flex items-center justify-center"
                            style={{ 
                              left: `${mark.x}%`, 
                              top: `${mark.y}%`, 
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: 'rgba(255, 0, 0, 0.5)',
                              borderRadius: '50%',
                              border: '1px solid white'
                            }}
                          >
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                        ))
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Total {photos.length} photos</p>
                  
                  {report?.status === 'draft' && (
                    <button
                      type="button"
                      onClick={handleCompleteReport}
                      className="btn-primary"
                    >
                      Complete Report and Send
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;