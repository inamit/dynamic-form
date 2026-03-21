import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import EntityList from './components/EntityList';
import EntityForm from './components/EntityForm';

function ListWrapper() {
  const { entity } = useParams<{ entity: string }>();
  const navigate = useNavigate();

  if (!entity) return <p>No entity selected</p>;

  return (
    <EntityList
      entity={entity}
      onEdit={(id: string) => navigate(`/${entity}/form/${id}`)}
      onCreate={() => navigate(`/${entity}/form`)}
    />
  );
}

function FormWrapper() {
  const { entity, id } = useParams<{ entity: string, id?: string }>();
  const navigate = useNavigate();

  if (!entity) return <p>No entity selected</p>;

  return (
    <EntityForm
      entity={entity}
      id={id}
      onSaved={() => navigate(`/${entity}/list`)}
      onError={(err) => console.error(err)}
      onCancel={() => navigate(`/${entity}/list`)}
    />
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
