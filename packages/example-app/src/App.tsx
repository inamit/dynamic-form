import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import 'postal';
const postal = (window as any).postal;
import EntityList from 'dynamic_form/EntityList';
import EntityForm from 'dynamic_form/EntityForm';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

function ListWrapper() {
  const { entity } = useParams<{ entity: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const subCreate = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.create',
      callback: (data: any) => {
        if (data.entity === entity) {
          navigate(`/${entity}/form`);
        }
      }
    });

    const subEdit = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.edit',
      callback: (data: any) => {
        if (data.entity === entity) {
          navigate(`/${entity}/form/${data.id}`);
        }
      }
    });

    return () => {
      subCreate.unsubscribe();
      subEdit.unsubscribe();
    };
  }, [entity, navigate]);

  useEffect(() => {
    if (!entity) return;

    const subReady = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.ready',
      callback: (data: any) => {
        if (data.type === 'list') {
          (postal as any).publish({
            channel: 'dynamic_form',
            topic: 'entity.loadList',
            data: { entity }
          });
        }
      }
    });

    // Also publish immediately in case remote rendered and subscribed before we did
    (postal as any).publish({
      channel: 'dynamic_form',
      topic: 'entity.loadList',
      data: { entity }
    });

    return () => {
      subReady.unsubscribe();
    };
  }, [entity]);

  if (!entity) return <p>No entity selected</p>;

  return <EntityList />;
}

function MapPicker() {
  const [selectModeField, setSelectModeField] = useState<string | null>(null);

  useEffect(() => {
    const sub = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'map.selectLocation',
      callback: (data: { field: string }) => {
        setSelectModeField(data.field);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (selectModeField) {
          (postal as any).publish({
            channel: 'dynamic_form',
            topic: 'map.locationSelected',
            data: {
              field: selectModeField,
              location: [e.latlng.lng, e.latlng.lat]
            }
          });
          setSelectModeField(null);
        }
      }
    });
    return null;
  };

  return (
    <div style={{ height: '400px', width: '100%', marginTop: '20px', position: 'relative' }}>
      {selectModeField && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'yellow', padding: '10px', borderRadius: '4px', fontWeight: 'bold' }}>
          Select location on map for field: {selectModeField}
        </div>
      )}
      <MapContainer
        center={[32.0853, 34.7818]}
        zoom={13}
        style={{ height: '100%', width: '100%', cursor: selectModeField ? 'crosshair' : 'grab' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
      </MapContainer>
    </div>
  );
}

function FormWrapper() {
  const { entity, id } = useParams<{ entity: string, id?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const subSaved = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.saved',
      callback: (data: any) => {
        if (data.entity === entity) {
          alert('Saved successfully!');
          navigate(`/${entity}/list`);
        }
      }
    });

    const subError = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.error',
      callback: (data: any) => {
        if (data.entity === entity) {
          alert('An error occurred while saving.');
          console.error(data.error);
        }
      }
    });

    const subCancel = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.cancel',
      callback: (data: any) => {
        if (data.entity === entity) {
          navigate(`/${entity}/list`);
        }
      }
    });

    return () => {
      subSaved.unsubscribe();
      subError.unsubscribe();
      subCancel.unsubscribe();
    };
  }, [entity, navigate]);

  useEffect(() => {
    if (!entity) return;

    let gridTemplate: string | undefined;
    if (entity === 'candy') {
      gridTemplate = '"name price" "isVegan ."';
    }

    const subReady = (postal as any).subscribe({
      channel: 'dynamic_form',
      topic: 'entity.ready',
      callback: (data: any) => {
        if (data.type === 'form') {
          (postal as any).publish({
            channel: 'dynamic_form',
            topic: 'entity.loadForm',
            data: { entity, id, gridTemplate, defaultCoordinateFormat: 'UTM' }
          });
        }
      }
    });

    (postal as any).publish({
      channel: 'dynamic_form',
      topic: 'entity.loadForm',
      data: { entity, id, gridTemplate, defaultCoordinateFormat: 'UTM' }
    });

    return () => {
      subReady.unsubscribe();
    };
  }, [entity, id]);

  if (!entity) return <p>No entity selected</p>;

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: 1 }}>
        <EntityForm />
      </div>
      <div style={{ flex: 1 }}>
        <MapPicker />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <nav style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc' }}>
          <h2>Dynamic Form Sandbox</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/person/list">Persons (REST)</Link>
            <Link to="/candy/list">Candies (REST)</Link>
            <Link to="/store/list">Stores (GraphQL)</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/:entity/list" element={<ListWrapper />} />
          <Route path="/:entity/form/:id?" element={<FormWrapper />} />
          <Route path="/" element={<p>Select an entity above to manage.</p>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
