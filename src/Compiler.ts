import { CellElement } from "./CellElement";
import { IDocumentElement } from "./IDocumentElement";
import { Parser } from "./Parser";
import { ParseResult } from "./ParseResult";
import { TextElement } from "./TextElement";

export class Compiler {

    errors: Array<string>;
    output: string;
    element: string;
    script: string;

    constructor() {
        this.errors = [];
        this.output = "";
        this.element = "";
        this.script = "";
    }

    Compile(s: string) {
        let parser: Parser;
        let result: ParseResult;
        let cells: { [name: string]: CellElement; }
        let cell: CellElement;
        let cell2: CellElement;
        let key: string;
        let i: number;

        parser = new Parser(s);
        result = parser.Parse();
        if (result.errors.length != 0) {
            for (i = 0; i < result.errors.length; i++) {
                this.errors.push(result.errors[i]);
            }
            return;
        }
        cells = {};
        for (i = 0; i < result.elements.length; i++) {
            if (result.elements[i] instanceof CellElement) {
                cell = result.elements[i] as CellElement;
                if (cells.hasOwnProperty(cell.name)) {
                    cell2 = cells[cell.name];
                    this.errors.push(`Cell at (${cell.startLine}, ${cell.startColumn}) - (${cell.endLine}, ${cell.endColumn}) with name '${cell.name}' already defined at (${cell2.startLine}, ${cell2.startColumn}) - (${cell2.endLine}, ${cell2.endColumn})`);
                }
                cells[cell.name] = cell;
            }
        }
        for (key in cells) {
            cell = cells[key];
            if (cell.value != "") {
                for (i = 0; i < cell.references.length; i++) {
                    let reference = cell.references[i];
                    let referenceTo = cell.value.substr(reference.startPosition + 1, reference.endPosition - reference.startPosition - 1);
                    if (cells.hasOwnProperty(referenceTo)) {
                        reference.cell = cells[referenceTo];
                    } else {
                        this.errors.push(`Reference at (${reference.startLine}, ${reference.startColumn}) - (${reference.endLine}, ${reference.endColumn}) to a cell named '${referenceTo}' does not exist.`);
                    }
                }
            }
        }
        if (this.errors.length != 0) {
            return;
        }

        let color: { [name: string]: number; } = {};
        let topologicalOrder: Array<CellElement> = [];
        for (key in cells) {
            color[key] = 0;
        }
        for (key in cells) {
            if (color[key] == 0) {
                this.DepthFirstSearch(cells[key], color, topologicalOrder);
            }
        }
        for (key in cells) {
            let source = cells[key];
            for (let i = 0; i < source.references.length; i++) {
                let target = source.references[i].cell;
                target?.referencedBy.push(source);
            }
        }
        if (this.errors.length != 0) {
            return;
        }
        this.GenerateCode(result.elements, topologicalOrder);
    }

    private DepthFirstSearch(visiting: CellElement, color: { [name: string]: number; }, topologicalOrder: Array<CellElement>): boolean {
        color[visiting.name] = 1;
        for (let i = 0; i < visiting.references.length; i++) {
            let neighbor = visiting.references[i].cell;
            if (neighbor != undefined) {
                let neighborName = neighbor.name;
                if (color[neighborName] == 1) {
                    // TODO: Can we describe the error better?
                    this.errors.push("The references form a cycle and that is not supported!");
                    return false;
                }
                else if (color[neighborName] == 0) {
                    if (!this.DepthFirstSearch(neighbor, color, topologicalOrder)) {
                        return false;
                    }
                }
            }
        }
        color[visiting.name] = 2;
        topologicalOrder.push(visiting);
        return true;
    }

    private GenerateCode(elements: Array<IDocumentElement>, topologicalOrder: Array<CellElement>) {
        this.element = this.GenerateElements(elements);
        this.script = this.GenerateScript(elements, topologicalOrder);
        this.output = `<html>

<head>
    <title>Calc</title>
</head>

<body>
  ${this.element}
    <script>
${this.script}
    </script>
</body>

</html>`
    }

    private GenerateElements(elements: Array<IDocumentElement>): string {
        let result: string;
        result = "";
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] instanceof CellElement) {
                let cell = elements[i] as CellElement;
                result += `<input id="${cell.name}" type="text"`;
                if (cell.references.length == 0) {
                    result += ` value="${cell.value}">`;
                } else {
                    result += ` readonly>`
                }
            } else if (elements[i] instanceof TextElement) {
                result += (elements[i] as TextElement).s;
            }
        }
        return result;
    }

    private GenerateScript(elements: Array<IDocumentElement>, topologicalOrder: Array<CellElement>): string {
        let result: string;
        result = "";
        result += `        (function () {
`;
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] instanceof CellElement) {
                let cell = elements[i] as CellElement;
                result += `            var ${cell.name} = document.getElementById('${cell.name}');
`;
            }
        }
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] instanceof CellElement) {
                let cell = elements[i] as CellElement;
                if (cell.references.length == 0) {
                    result += `            ${cell.name}.onchange = on_${cell.name}_changed;
`;
                }
            }
        }
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] instanceof CellElement) {
                let cell = elements[i] as CellElement;
                if (cell.referencedBy.length > 0) {
                    result += `            function on_${cell.name}_changed() {
`;
                    for (let j = 0; j < cell.referencedBy.length; j++) {
                        result += `                update_${cell.referencedBy[j].name}();
`;
                    }
                    result += `            }
`;
                }
            }
        }
        for (let i = 0; i < elements.length; i++) {
            if (elements[i] instanceof CellElement) {
                let cell = elements[i] as CellElement;
                if (cell.references.length > 0) {
                    result += `            function update_${cell.name}() {
`;

                    result += `                ${cell.name}.value = `;
                    let first = true;
                    for (let j = 0; j < cell.value.length; j++) {
                        if (cell.value[j] == '`') {
                            if (first) {
                                first = false;
                            } else {
                                result += ".value";
                                first = true;
                            }
                        } else {
                            result += cell.value[j];
                        }
                    }
                    result += `;
`;
                    if (cell.referencedBy.length > 0) {
                        result += `                on_${cell.name}_changed();
`;
                    }
                    result += `            }
`;
                }
            }
        }
        for (let i = 0; i < topologicalOrder.length; i++) {
            let cell = topologicalOrder[i] as CellElement;
            if (cell.references.length > 0) {
                result += `            update_${cell.name}();
`;
            }
        }
        result += `        })();`;
        return result;
    }
}