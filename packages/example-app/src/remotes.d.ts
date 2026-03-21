declare module 'dynamic_form/EntityList' {
  interface EntityListProps {
    entity: string;
    onEdit: (id: string) => void;
    onCreate: () => void;
  }
  const EntityList: React.ComponentType<EntityListProps>;
  export default EntityList;
}

declare module 'dynamic_form/EntityForm' {
  interface EntityFormProps {
    entity: string;
    id?: string;
    onSaved: (data: any) => void;
    onError: (err: any) => void;
    onCancel: () => void;
  }
  const EntityForm: React.ComponentType<EntityFormProps>;
  export default EntityForm;
}
