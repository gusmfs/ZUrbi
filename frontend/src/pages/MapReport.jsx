import { useState } from 'react';
import { useProblemStore } from '../store';
import Map from '../components/Map';
import ProblemForm from '../components/ProblemForm';
import './MapReport.css';

export default function MapReport() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { addProblem, problems } = useProblemStore();

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      addProblem({
        ...formData,
        status: 'reported',
        views: 0,
        createdAt: new Date().toISOString(),
      });

      setSelectedLocation(null);
    } catch (error) {
      console.error('Error submitting problem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="map-report">
      <div className="container">
        <div className="page-header">
          <h1>Reportar Problema</h1>
          <p className="page-description">
            Ajude a melhorar zUrbi! Marque a localização do problema no mapa e forneça detalhes.
          </p>
        </div>

        <div className={`map-report-layout step-${currentStep}`}>
          <div className="map-section">
            <Map
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation}
              problems={problems}
            />
          </div>

          <div className="form-section">
            <ProblemForm
              selectedLocation={selectedLocation}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              onStepChange={setCurrentStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
