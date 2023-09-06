export type Id = string;

type Ref = { id: Id };

export function _getId<Obj extends Ref>(obj: Obj): Id {
    return obj.id;
}
