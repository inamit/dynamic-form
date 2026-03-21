type EntityListProps = {
  entity: string;
};

declare module 'dynamic_form/EntityList' {
  const EntityList: React.ComponentType<EntityListProps>;
  export default EntityList;
}

type EntityFormProps = {
  entity: string;
  id?: string;
};

declare module 'dynamic_form/EntityForm' {
  const EntityForm: React.ComponentType<EntityFormProps>;
  export default EntityForm;
}
