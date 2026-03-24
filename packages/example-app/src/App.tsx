import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import 'postal';
const postal = (window as any).postal;
import EntityList from 'dynamic_form/EntityList';
import EntityForm from 'dynamic_form/EntityForm';

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
            data: { entity, id, gridTemplate }
          });
        }
      }
    });

    (postal as any).publish({
      channel: 'dynamic_form',
      topic: 'entity.loadForm',
      data: { entity, id, gridTemplate }
    });

    return () => {
      subReady.unsubscribe();
    };
  }, [entity, id]);

  if (!entity) return <p>No entity selected</p>;

  return <EntityForm />;
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
