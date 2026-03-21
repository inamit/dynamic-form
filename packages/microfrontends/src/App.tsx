import {BrowserRouter, Routes, Route, useParams} from 'react-router-dom';
import EntityList from './components/EntityList';
import EntityForm from './components/EntityForm';

function App() {
    const {entity, id} = useParams<{ entity: string; id?: string }>();

    return (
        <BrowserRouter>
            <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
                <Routes>
                    <Route path="/:entity/list" element={<EntityList entity={entity!} />}/>
                    <Route path="/:entity/form/:id?" element={<EntityForm entity={entity!} id={id}/>}/>
                    <Route path="/" element={<p>Select an entity to manage.</p>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
