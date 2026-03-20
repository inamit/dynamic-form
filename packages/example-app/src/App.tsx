import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import EntityList from 'dynamic_form/EntityList';
import EntityForm from 'dynamic_form/EntityForm';

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
          <Route path="/:entity/list" element={<EntityList />} />
          <Route path="/:entity/form/:id?" element={<EntityForm />} />
          <Route path="/" element={<p>Select an entity above to manage.</p>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
