const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
let selectedFile = null;

/* Клик */
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
});

/* Drag & Drop */
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    selectedFile = e.dataTransfer.files[0];
});

/* Upload */
function uploadFile() {
    if (!selectedFile) {
        alert("Выбери файл, гений 😄");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            document.getElementById("progress").innerText =
                "Uploading: " + percent.toFixed(1) + "%";
        }
    };

    xhr.onload = function () {
        document.getElementById("progress").innerText =
            xhr.status === 200 ? "Готово 🚀" : "Ошибка 💀";
    };

    xhr.send(formData);
}

/* Lottie — иконка */
lottie.loadAnimation({
    container: document.getElementById("lottie-upload"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://assets2.lottiefiles.com/packages/lf20_kkflmtur.json"
});
