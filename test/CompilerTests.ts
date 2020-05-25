import { Compiler } from '../src/Compiler'
import assert from 'assert'

describe('Compiler', function () {

    function TestCompiler(s: string, output: string, errors: Array<string>) {
        let compiler: Compiler;
        let i: number;
        compiler = new Compiler();
        compiler.Compile(s);
        assert(compiler.output == output);
        assert(compiler.errors.length == errors.length);
        for (i = 0; i < errors.length; i++) {
            assert(compiler.errors[i] == errors[i]);
        }
    }

    it('ParseError', function () {
        TestCompiler("}", "", ["} unexpected at line 1 column 1."]);
    });

    it('DuplicateId', function () {
        TestCompiler("{a}{a}", "", ["Cell at (1, 4) - (1, 6) with name 'a' already defined at (1, 1) - (1, 3)"]);
    });

    it('Undefined reference', function () {
        TestCompiler("{cell:`a`}", "", ["Reference at (1, 7) - (1, 9) to a cell named 'a' does not exist."]);
    });
    it('Cyclic reference', function () {
        TestCompiler("{cell1:`cell2`}{cell2:`cell1`}", "", ["The references form a cycle and that is not supported!"]);
    });
    it('Working Example', function () {
        TestCompiler("The sum of {a:3} and {b:-2} is {c:`a`*1+`b`*1}, the double of that would be {d:`c`*2}", `<html>

<head>
    <title>Calc</title>
</head>

<body>
  The sum of <input id="a" type="text" value="3"> and <input id="b" type="text" value="-2"> is <input id="c" type="text" readonly>, the double of that would be <input id="d" type="text" readonly>
    <script>
        (function () {
            var a = document.getElementById('a');
            var b = document.getElementById('b');
            var c = document.getElementById('c');
            var d = document.getElementById('d');
            a.onchange = on_a_changed;
            b.onchange = on_b_changed;
            function on_a_changed() {
                update_c();
            }
            function on_b_changed() {
                update_c();
            }
            function on_c_changed() {
                update_d();
            }
            function update_c() {
                c.value = a.value*1+b.value*1;
                on_c_changed();
            }
            function update_d() {
                d.value = c.value*2;
            }
            update_c();
            update_d();
        })();
    </script>
</body>

</html>`, []);
    });
});
