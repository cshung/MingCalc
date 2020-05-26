# MingCalc - a calculator generator

Excel is a great tool to calculate things, but there are three things I don't like about it.

- Even if my inputs doesn't look like table, it has to be layout in the table like form, I would like to make it look like a document, line by line, but not cell by cell.
- Formulas refer to values through weird names like `A12`, whoever reading the formula must have no idea what `A12` is until he cross check back to the table.
- The file format is opaque, I couldn't see the diff if someone modify a formula. If I go for CSV, the formula are gone.

Inspired by that, I decided to build this calculator generator. The goal is to mix document and spreadsheet and nail the three pain points above.

With my tool, the user can simply enter this in my page:

```
The sum of {a:3} and {b:-2} is {c:`a`+`b`}, the double of that would be {d:`c`*2}
```

and this will turn into a webpage that allows you modify `a` and `b` it will automatically refresh `c` and `d`.

# Instructions

Use `npm install` to install the necessary dependencies.

Use `npm tsc` to compile the type script

Use `npm mocha ./dist/test` to run the unit tests

Use `npm webpack` to build the website.

# APIs

This project can be used standalone as the webpage operates completely on the client, or it can be embedded into a website. The `index.ts` can be seen as an example on how to perform the embedding.

Here is the TypeScript used to perform a compilation.
```ts
let compiler: Compiler = new Compiler();
compiler.Compile(sourceTextArea.value);
if (compiler.errors.length == 0) {
    previewDiv.innerHTML = compiler.element;
    eval(compiler.script);
} else {
    previewDiv.innerHTML = "";
    for (let i = 0; i < compiler.errors.length; i++) {
        previewDiv.innerHTML += compiler.errors[i] + "<br/>";
    }
}
```
Note that the compiler produces two outputs - the `compiler.element` is the HTML content that represents the document text. This does not contain any scripts for refreshing the values.

The `compiler.script` is the JavaScript for refreshing the values. It does not define any global function, all it does is to hook up the event handlers.
