import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../config';

const Dashboard = () => {
  const { currentUser, authFetch } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Mülkleri ve raporları yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mülkleri getir
        const propertiesResponse = await authFetch('/api/properties');
        
        if (!propertiesResponse.ok) {
          throw new Error('Error loading properties');
        }
        
        const propertiesData = await propertiesResponse.json();
        setProperties(propertiesData);
        
        // Raporları getir
        const reportsResponse = await authFetch('/api/reports');
        
        if (!reportsResponse.ok) {
          throw new Error('Error loading reports');
        }
        
        const reportsData = await reportsResponse.json();
        setReports(reportsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [authFetch]);
  
  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-lg font-medium text-navy-600">Loading data...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* Üst Başlık Alanı */}
      <div className="bg-gradient-to-r from-navy-700 to-navy-800 rounded-xl p-5 md:p-6 text-white mb-6 md:mb-8 shadow-elevated mx-4 md:mx-0">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-3xl font-bold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Welcome, {currentUser?.name || 'User'}
            </h1>
            <p className="mt-2 text-navy-100 text-sm md:text-base">Manage your properties and reports from here.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/properties/new" className="btn-primary flex items-center text-sm py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Property
            </Link>
            {properties.length > 0 && (
              <Link to={`/properties/${properties[0].id}/reports/new`} className="btn-outline bg-transparent border-white text-white hover:bg-navy-600 flex items-center text-sm py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                New Report
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 md:p-4 rounded-md mb-5 md:mb-6 shadow-sm mx-4 md:mx-0">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-xs md:text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Özetler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 px-4 md:px-0">
        <div className="card-elevated flex items-center p-3 md:p-6">
          <div className="rounded-full bg-amber-100 p-2 md:p-3 mr-3 md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-bold text-navy-700">{properties.length}</div>
            <div className="text-xs md:text-sm text-navy-500">Property</div>
          </div>
        </div>
        
        <div className="card-elevated flex items-center p-3 md:p-6">
          <div className="rounded-full bg-green-100 p-2 md:p-3 mr-3 md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-bold text-navy-700">{reports.length}</div>
            <div className="text-xs md:text-sm text-navy-500">Report</div>
          </div>
        </div>
        
        <div className="card-elevated flex items-center p-3 md:p-6">
          <div className="rounded-full bg-blue-100 p-2 md:p-3 mr-3 md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-bold text-navy-700">{reports.filter(report => report.status === 'draft').length}</div>
            <div className="text-xs md:text-sm text-navy-500">Draft</div>
          </div>
        </div>
        
        <div className="card-elevated flex items-center p-3 md:p-6">
          <div className="rounded-full bg-purple-100 p-2 md:p-3 mr-3 md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <div className="text-xl md:text-3xl font-bold text-navy-700">{reports.filter(report => report.status !== 'draft').length}</div>
            <div className="text-xs md:text-sm text-navy-500">Sent</div>
          </div>
        </div>
      </div>
      
      {/* Mülkler */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-navy-700">Your Properties</h2>
          <Link to="/properties/new" className="text-primary hover:text-amber-600 flex items-center text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Property
          </Link>
        </div>
        
        {properties.length === 0 ? (
          <div className="card-alt text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-navy-700 mb-2">You haven't added any properties yet</h3>
            <p className="text-navy-600 mb-6 max-w-md mx-auto">To use the deposit protection system, you need to add your rented property first.</p>
            <Link to="/properties/new" className="btn-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="card-elevated hover:shadow-card transition-shadow duration-300">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-navy-700 mb-2">{property.address}</h3>
                  <span className="badge-primary">Property</span>
                </div>
                <p className="text-navy-600 text-sm mb-4">{property.city}</p>
                
                <div className="border-t border-navy-100 pt-4 mt-4">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-navy-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-navy-600 text-sm">{property.landlordName}</span>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-navy-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-navy-600 text-sm">{property.landlordEmail || 'E-posta bilgisi yok'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Link to={`/properties/${property.id}/reports/new`} className="btn-primary text-sm px-3 py-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      New Report
                    </Link>
                    <span className="text-sm text-navy-500">
                      {reports.filter(report => report.propertyId === property.id).length} Rapor
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Raporlar */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-navy-700">Your Reports</h2>
          {properties.length > 0 && (
            <Link to={`/properties/${properties[0].id}/reports/new`} className="text-primary hover:text-amber-600 flex items-center text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Report
            </Link>
          )}
        </div>
        
        {reports.length === 0 ? (
          <div className="card-alt text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-navy-700 mb-2">You haven't created any reports yet</h3>
            <p className="text-navy-600 mb-6 max-w-md mx-auto">Create a report to document the condition of your property and share it with your landlord.</p>
            {properties.length > 0 ? (
              <Link to={`/properties/${properties[0].id}/reports/new`} className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create First Report
              </Link>
            ) : (
              <Link to="/properties/new" className="btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Property First
              </Link>
            )}
          </div>
        ) : (
          <div className="card-elevated p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-navy-200">
                <thead className="bg-navy-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                      Report Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-navy-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-navy-200">
                  {reports.map((report) => {
                    const property = report.property;
                    return (
                      <tr key={report.id} className="hover:bg-navy-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-navy-700">
                            {property?.address || 'Bilinmeyen Mülk'}
                          </div>
                          <div className="text-xs text-navy-500">
                            {property?.city || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-navy-700">
                            {new Date(report.reportDate).toLocaleDateString('en-US')}
                          </div>
                          {report.reportSent && (
                            <div className="text-xs text-navy-500">
                              Sent: {new Date(report.reportSent).toLocaleString('en-US')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={report.status === 'draft'
                              ? 'badge-warning'
                              : report.status === 'sent'
                              ? 'badge-secondary'
                              : 'badge-primary'
                            }
                          >
                            {report.status === 'draft'
                              ? 'Draft'
                              : report.status === 'sent'
                              ? 'Sent'
                              : 'Viewed'}
                          </span>
                          
                          {report.status !== 'draft' && report.pdfUrl && (
                            <div className="mt-2">
                              <a
                                href={`${API_URL}${report.pdfUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-primary hover:underline flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                View PDF
                              </a>
                            </div>
                          )}
                          
                          {report.reportViewed && (
                            <div className="mt-1 text-xs text-navy-500">
                              {new Date(report.reportViewed).toLocaleString('en-US')}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/reports/${report.id}`}
                              className="text-primary hover:text-amber-600 flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Link>
                            {report.status === 'draft' && (
                              <Link
                                to={`/reports/${report.id}/photos`}
                                className="text-green-600 hover:text-green-800 flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Add Photos
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
