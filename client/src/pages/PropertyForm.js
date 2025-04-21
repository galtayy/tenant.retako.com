import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PropertyForm = () => {
  const { authFetch } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    type: 'apartment',
    rentalPeriod: 12,
    depositAmount: '',
    roomCount: 1,
    bathroomCount: 1,
    amenities: [],
    landlordName: '',
    landlordEmail: '',
    landlordPhone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Amenities string'e çevir (JSON)
      const submissionData = {
        ...formData,
        amenities: JSON.stringify(formData.amenities)
      };
      
      const response = await authFetch('http://localhost:8080/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'An error occurred while adding the property');
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Property</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="card max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Street, Building Number, Apartment Number"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="city" className="form-label">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="postalCode" className="form-label">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="type" className="form-label">Property Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
              <option value="office">Office</option>
              <option value="store">Store</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="rentalPeriod" className="form-label">Rental Period (Months)</label>
              <input
                type="number"
                id="rentalPeriod"
                name="rentalPeriod"
                value={formData.rentalPeriod}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="depositAmount" className="form-label">Deposit Amount</label>
              <input
                type="number"
                id="depositAmount"
                name="depositAmount"
                value={formData.depositAmount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="roomCount" className="form-label">Number of Rooms</label>
              <input
                type="number"
                id="roomCount"
                name="roomCount"
                value={formData.roomCount}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="bathroomCount" className="form-label">Number of Bathrooms</label>
              <input
                type="number"
                id="bathroomCount"
                name="bathroomCount"
                value={formData.bathroomCount}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Elevator', 'Balcony', 'Pool', 'Gym', 'Parking', 'Security', 'Natural Gas', 'AC', 'Internet'].map((amenity) => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`amenity-${amenity}`}
                    name="amenities"
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        amenities: checked 
                          ? [...prev.amenities, amenity]
                          : prev.amenities.filter(a => a !== amenity)
                      }));
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`amenity-${amenity}`} className="text-sm">{amenity}</label>
                </div>
              ))}
            </div>
          </div>
          
          <hr className="my-6" />
          
          <h2 className="text-lg font-medium mb-4">Landlord Information</h2>
          
          <div className="mb-4">
            <label htmlFor="landlordName" className="form-label">Landlord Name</label>
            <input
              type="text"
              id="landlordName"
              name="landlordName"
              value={formData.landlordName}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="landlordEmail" className="form-label">Landlord Email</label>
            <input
              type="email"
              id="landlordEmail"
              name="landlordEmail"
              value={formData.landlordEmail}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Report link will be sent to this email address"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="landlordPhone" className="form-label">Landlord Phone (Optional)</label>
            <input
              type="tel"
              id="landlordPhone"
              name="landlordPhone"
              value={formData.landlordPhone}
              onChange={handleChange}
              className="input-field"
            />
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
              type="submit" 
              disabled={loading} 
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;
