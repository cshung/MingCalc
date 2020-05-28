import { Compiler } from './Compiler'

(function () {
    let sourceTextArea: HTMLTextAreaElement;
    let scriptTextArea: HTMLTextAreaElement;
    let previewDiv: HTMLDivElement;

    function BindEvents() {
        window.onload = OnWindowLoaded;
    }

    function OnWindowLoaded() {
        sourceTextArea = document.getElementById('SourceTextArea') as HTMLTextAreaElement;
        scriptTextArea = document.getElementById('ScriptTextArea') as HTMLTextAreaElement;
        previewDiv = document.getElementById('PreviewDiv') as HTMLDivElement;
        sourceTextArea.onkeyup = RefreshPreview;
        scriptTextArea.onkeyup = RefreshPreview;
        RefreshPreview();
    }

    function RefreshPreview() {
        let compiler: Compiler = new Compiler();
        compiler.Compile(sourceTextArea.value, scriptTextArea.value);
        if (compiler.errors.length == 0) {
            previewDiv.innerHTML = compiler.element;
            eval(compiler.script);
            let inputs = document.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                adjustWidth(inputs[i]);
            }
        } else {
            previewDiv.innerHTML = "";
            for (let i = 0; i < compiler.errors.length; i++) {
                previewDiv.innerHTML += compiler.errors[i] + "<br/>";
            }
        }
    }

    function adjustWidth(input: HTMLInputElement) {
        let span = document.createElement("span");
        span.textContent = input.value;
        document.body.appendChild(span);
        input.style.width = (span.getBoundingClientRect().width + 40) + "px";
        document.body.removeChild(span);
        input.onkeyup = function(){adjustWidth(input);};
    }

    
    BindEvents();
})();