import {useEffect} from 'react';
import {BrowserRouter, Routes, Route, useParams, useNavigate} from 'react-router-dom';
import 'postal';

const postal = (window as any).postal;
import EntityForm from './components/EntityForm';
import {CHANNEL_NAME, TOPICS} from "./utils/topic.ts";

function FormWrapper() {
    const {entity, id} = useParams<{ entity: string, id?: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const subSaved = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.ENTITY_SAVED,
            callback: (data: any) => {
                if (data.entity === entity) {
                    navigate(`/${entity}/list`);
                }
            }
        });

        const subError = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.ENTITY_SAVE_ERROR,
            callback: (data: any) => {
                if (data.entity === entity) {
                    console.error(data.error);
                }
            }
        });

        const subCancel = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.ENTITY_SAVE_CANCEL,
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
        const subReady = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.COMPONENT_READY,
            callback: (data: any) => {
                if (data.type === 'form') {
                    postal.publish({
                        channel: CHANNEL_NAME,
                        topic: TOPICS.LOAD_FORM,
                        data: {entity, id}
                    });
                }
            }
        });

        const subLoadError = postal.subscribe({
            channel: CHANNEL_NAME,
            topic: TOPICS.FORM_LOAD_ERROR,
            callback: (data: any) => {
                if (data.entity === entity) {
                    console.error(data.error);
                }
            }
        });

        postal.publish({
            channel: CHANNEL_NAME,
            topic: TOPICS.LOAD_FORM,
            data: {entity, id}
        });

        return () => {
            subReady.unsubscribe();
            subLoadError.unsubscribe();
        };
    }, [entity, id]);

    if (!entity) return <p>No entity selected</p>;

    return <EntityForm/>;
}

function App() {
    return (
        <BrowserRouter>
            <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
                <Routes>
                    <Route path="/:entity/form/:id?" element={<FormWrapper/>}/>
                    <Route path="/" element={<p>Select an entity to manage.</p>}/>
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
