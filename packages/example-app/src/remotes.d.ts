declare module 'dynamic_form/EntityList' {
  interface EntityListProps {
    entity: string;
  }
  const EntityList: React.ComponentType<EntityListProps>;
  export default EntityList;
}

declare module 'dynamic_form/EntityForm' {
  interface EntityFormProps {
    entity: string;
    id?: string;
  }
  const EntityForm: React.ComponentType<EntityFormProps>;
  export default EntityForm;
}
