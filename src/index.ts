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
        } else {
            previewDiv.innerHTML = "";
            for (let i = 0; i < compiler.errors.length; i++) {
                previewDiv.innerHTML += compiler.errors[i] + "<br/>";
            }
        }
    }

    BindEvents();
})();