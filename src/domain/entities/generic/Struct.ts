export function Struct<Attributes>() {
    abstract class BaseClass {
        constructor(_attributes: Attributes) {
            Object.assign(this, _attributes);
        }

        protected _update(partialAttrs: Partial<Attributes>): this {
            const ParentClass = this.constructor as new (values: Attributes) => typeof this;

            const attributes = Object.fromEntries(
                Object.getOwnPropertyNames(this).map(key => [key, this[key as keyof this]]),
            ) as Attributes;

            return new ParentClass({ ...attributes, ...partialAttrs });
        }

        static create<U extends BaseClass>(
            this: new (values: Attributes) => U,
            attributes: Attributes,
        ): U {
            return new this(attributes);
        }
    }

    return BaseClass as {
        new (values: Attributes): Attributes & BaseClass;
        create: (typeof BaseClass)["create"];
    };
}
