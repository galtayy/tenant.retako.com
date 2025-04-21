import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ReportCreate = () => {
  const { propertyId } = useParams();
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Walkthrough aşamasını izlemek için state 
  const [walkthrough, setWalkthrough] = useState({
    started: false,
    currentStep: 0,
    rooms: []
  });
  
  // Mülk bilgilerini getir
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await authFetch(`http://localhost:8080/api/properties`);
        
        if (!response.ok) {
          throw new Error('Property information could not be retrieved');
        }
        
        const properties = await response.json();
        const foundProperty = properties.find(p => p.id == propertyId);
        
        if (!foundProperty) {
          throw new Error('Property not found');
        }
        
        setProperty(foundProperty);
        
        // Mülk bilgilerine göre odaları oluştur
        const roomCount = foundProperty.roomCount || 1;
        const bathroomCount = foundProperty.bathroomCount || 1;
        
        // Standart odalar
        const roomsList = [
          { id: 'living-room', name: 'Living Room', completed: false },
          { id: 'kitchen', name: 'Kitchen', completed: false },
        ];
        
        // Add bedrooms based on room count
        for (let i = 1; i <= roomCount; i++) {
          roomsList.push({ id: `bedroom-${i}`, name: `Bedroom ${i}`, completed: false });
        }
        
        // Add bathrooms based on bathroom count
        for (let i = 1; i <= bathroomCount; i++) {
          roomsList.push({ id: `bathroom-${i}`, name: `Bathroom ${i}`, completed: false });
        }
        
        // Add other areas
        roomsList.push({ id: 'hallway', name: 'Hallway', completed: false });
        if (foundProperty.amenities) {
          try {
            const amenitiesArray = JSON.parse(foundProperty.amenities);
            if (amenitiesArray.includes('Balcony')) {
              roomsList.push({ id: 'balcony', name: 'Balcony', completed: false });
            }
          } catch (e) {
            console.error("Amenities JSON parse error:", e);
          }
        }
        
        setWalkthrough(prev => ({ ...prev, rooms: roomsList }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [authFetch, propertyId]);
  
  // Walkthrough başlat
  const startWalkthrough = () => {
    setWalkthrough(prev => ({ ...prev, started: true, currentStep: 0 }));
  };
  
  // Sonraki adıma geç
  const nextRoom = () => {
    if (walkthrough.currentStep < walkthrough.rooms.length - 1) {
      setWalkthrough(prev => ({ 
        ...prev, 
        currentStep: prev.currentStep + 1,
        rooms: prev.rooms.map((room, i) => 
          i === prev.currentStep ? { ...room, completed: true } : room
        )
      }));
    }
  };
  
  // Önceki adıma git
  const prevRoom = () => {
    if (walkthrough.currentStep > 0) {
      setWalkthrough(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  };
  
  // Belirli bir odaya git
  const goToRoom = (index) => {
    if (index >= 0 && index < walkthrough.rooms.length) {
      setWalkthrough(prev => ({ ...prev, currentStep: index }));
    }
  };
  
  // Formu gönder ve fotoğraf yükleme sayfasına geç
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      // Walkthrough bilgilerini JSON olarak ekle
      const roomsData = JSON.stringify(walkthrough.rooms);
      
      const response = await authFetch(`http://localhost:8080/api/properties/${propertyId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          additionalNotes,
          walkthrough: roomsData
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'An error occurred while creating the report');
      }
      
      const newReport = await response.json();
      navigate(`/reports/${newReport.id}/photos`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Move-in Report</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="card max-w-2xl mx-auto">
        {property && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Property Information</h2>
            <p className="text-gray-800 mb-1">{property.address}</p>
            <p className="text-gray-600 text-sm mb-3">{property.city}</p>
            
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium mb-1">Landlord:</p>
              <p className="text-gray-800 mb-1">{property.landlordName}</p>
              <p className="text-gray-600 text-sm">{property.landlordEmail}</p>
            </div>
          </div>
        )}
        
        {!walkthrough.started ? (
          <div>
            <div className="mb-6">
              <label htmlFor="additionalNotes" className="form-label">Additional Notes (Optional)</label>
              <textarea
                id="additionalNotes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                className="input-field h-32"
                placeholder="You can add general condition or important details about the property here"
              ></textarea>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700 font-medium mb-1">
                    Property Inspection Process
                  </p>
                  <p className="text-sm text-blue-700">
                    You will inspect your property room by room and will be asked to upload photos for each area. Based on your property information, you can add photos and damage notes for {walkthrough.rooms.length} areas.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')}
                className="btn-secondary mr-3"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={startWalkthrough} 
                className="btn-primary"
              >
                Start Inspection
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">Inspection Steps</h2>
              
              <div className="flex overflow-x-auto space-x-2 pb-2 mb-4">
                {walkthrough.rooms.map((room, index) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => goToRoom(index)}
                    className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${walkthrough.currentStep === index 
                      ? 'bg-primary-600 text-white' 
                      : room.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'}`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
              
              <div className="p-4 border rounded-lg mb-6">
                <h3 className="font-medium text-lg mb-2">
                  {walkthrough.rooms[walkthrough.currentStep]?.name || 'Oda'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Document the general condition of this area. Check walls, floor, ceiling, and important details.
                </p>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-sm text-yellow-700">
                    After completing this section, you will proceed to the photo upload step.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button 
                  type="button" 
                  onClick={prevRoom}
                  disabled={walkthrough.currentStep === 0}
                  className={`px-4 py-2 rounded ${walkthrough.currentStep === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                >
                  Previous
                </button>
                
                {walkthrough.currentStep < walkthrough.rooms.length - 1 ? (
                  <button 
                    type="button" 
                    onClick={nextRoom}
                    className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Next
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    {submitting ? 'Completing...' : 'Complete Inspection'}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportCreate;