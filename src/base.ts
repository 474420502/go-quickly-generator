

enum GeneratorType {
    Unknown = 0,
    Setter = 1 << 0,
    Getter = 1 << 1,
}

class StructInfo {
    ShorthandName: string;
    Name: string;
    Range: number[];
    Fields: Map<string, Field>;

    constructor(name: string, fields: Field[], range: number[]) {
        this.Name = name;

        var sname: string = "";
        sname += this.Name[0].toLowerCase();
        for (let i = 1; i < this.Name.length; i++) {
            let c = this.Name.charCodeAt(i);
            if (c <= 90 && c >= 65) {
                sname += this.Name[i].toLowerCase();
            }
        }

        this.ShorthandName = this.Name;
        this.Range = range;

        this.Fields = new Map<string, Field>();
        fields.forEach((value) => {
            this.Fields.set(value.Key, value);
        });
    }

    getFieldsString(): string[] {
        var result: string[] = [];

        this.Fields.forEach((field, index) => {
            result.push(this.Name + field.toString());
        });

        return result;
    }
}

class Field {
    Parent: string;
    Type: string;
    Name: string;
    Range: number[];
    Key: string;

    constructor(parent: string, type: string, name: string, range: number[]) {
        this.Parent = parent;
        this.Type = type;
        this.Name = name;
        this.Range = range;
        this.Key = (this.Parent.substr(1) + this.Name[0].toUpperCase() + this.Name.substr(1)).replace(new RegExp("\\.", "g"), "");
    }

    toString(): string {
        return this.Parent.substr(1) + this.Name + " " + this.Type;
    }
}


export { StructInfo, Field , GeneratorType};