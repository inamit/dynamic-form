/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import {useEffect} from 'react';
import {BrowserRouter, Routes, Route, useParams, useNavigate} from 'react-router-dom';
import 'postal';

const postal = (window as any).postal;
import EntityList from './components/EntityList';
import {CHANNEL_NAME, TOPICS} from "./utils/topic.ts";

function ListWrapper() {
    const {entity} = useParams<{ entity: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const subCreate = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.LIST_CREATE_CLICKED,
            callback: (data: any) => {
                if (data.entity === entity) {
                    navigate(`/${entity}/form`);
                }
            }
        });

        const subEdit = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.LIST_EDIT_CLICKED,
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
        const subReady = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.COMPONENT_READY,
            callback: (data: any) => {
                if (data.type === 'list') {
                    postal.publish({
                        channel: CHANNEL_NAME,
                        topic: TOPICS.LOAD_LIST,
                        data: {entity}
                    });
                }
            }
        });

        postal.publish({
            channel: CHANNEL_NAME,
            topic: TOPICS.LOAD_LIST,
            data: {entity}
        });

        return () => {
            subReady.unsubscribe();
        };
    }, [entity]);

    if (!entity) return <p>No entity selected</p>;

    return <EntityList/>;
}

function App() {
    return (
        <BrowserRouter>
            <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
                <Routes>
                    <Route path="/:entity/list" element={<ListWrapper/>}/>
                    <Route path="/" element={<p>Select an entity to manage.</p>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
