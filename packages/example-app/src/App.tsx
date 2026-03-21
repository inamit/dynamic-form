import EntityList from 'dynamic_form/EntityList';
import EntityForm from 'dynamic_form/EntityForm';
import {useEffect, useState} from "react";

function App() {
    const [entity, setEntity] = useState<string>();
    const [id, setId] = useState<string>();

    useEffect(() => {
        setId(undefined);
    }, []);

    const entities: { entityName: string, entityDisplayName: string }[] = [
        {
            entityName: "person",
            entityDisplayName: "Person (REST)"
        },
        {
            entityName: "candy",
            entityDisplayName: "Candy (REST)"
        },
        {
            entityName: "store",
            entityDisplayName: "Store (GraphQL)"
        }
    ];

    return (
        <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
            <nav style={{marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #ccc'}}>
                <h2>Dynamic Form Sandbox</h2>
                <div style={{display: 'flex', gap: '10px'}}>
                    {
                        entities
                            .map(e => (<button key={e.entityName}
                                               onClick={() => setEntity(e.entityName)}>{e.entityDisplayName}</button>))
                    }
                </div>
            </nav>

            <EntityList entity={entity!}/>
            <EntityForm entity={entity!} id={id}/>
        </div>
    )
        ;
}

export default App;
