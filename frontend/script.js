const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileNameEl = document.getElementById("fileName");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const uploadBtn = document.getElementById("uploadBtn");

let selectedFile = null;
let isUploading = false;

// Кнопка неактивна по умолчанию
uploadBtn.disabled = true;
uploadBtn.style.opacity = "0.5";
uploadBtn.style.cursor = "not-allowed";

// Клик по зоне – выбор файла
dropZone.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") {
        fileInput.click();
    }
});

// Выбор через проводник
fileInput.addEventListener("change", function (e) {
    e.stopPropagation();
    if (this.files && this.files.length > 0) {
        selectedFile = this.files[0];
        updateFileUI();
    }
});

// Drag & Drop
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        selectedFile = e.dataTransfer.files[0];
        updateFileUI();
        const dt = new DataTransfer();
        dt.items.add(selectedFile);
        fileInput.files = dt.files;
    }
});

// Обновление UI после выбора файла
function updateFileUI() {
    if (!selectedFile) {
        fileNameEl.textContent = "Файл не выбран";
        fileNameEl.style.color = "#a0a0b8";
        uploadBtn.disabled = true;
        uploadBtn.style.opacity = "0.5";
        uploadBtn.style.cursor = "not-allowed";
        return;
    }

    const sizeInBytes = selectedFile.size;
    let sizeDisplay = "";
    if (sizeInBytes > 1024 * 1024 * 1024) {
        sizeDisplay = (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    } else if (sizeInBytes > 1024 * 1024) {
        sizeDisplay = (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
    } else if (sizeInBytes > 1024) {
        sizeDisplay = (sizeInBytes / 1024).toFixed(2) + " KB";
    } else {
        sizeDisplay = sizeInBytes + " B";
    }

    fileNameEl.textContent = `📄 ${selectedFile.name} (${sizeDisplay})`;
    fileNameEl.style.color = "#e0e0f0";
    uploadBtn.disabled = false;
    uploadBtn.style.opacity = "1";
    uploadBtn.style.cursor = "pointer";

    progressFill.style.width = "0%";
    progressFill.style.background = "linear-gradient(90deg, #6c5ce7, #a29bfe)";
    progressText.textContent = "Готов к загрузке";
    progressText.style.color = "#a0a0b8";
}

// Загрузка файла
function uploadFile(event) {
    if (event) {
        event.stopPropagation();
    }

    if (!selectedFile) {
        alert("Выберите файл!");
        return;
    }
    if (isUploading) {
        alert("Загрузка уже идёт...");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.style.opacity = "0.5";
    uploadBtn.style.cursor = "not-allowed";
    isUploading = true;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            progressFill.style.width = percent + "%";
            progressText.textContent = `Загрузка: ${percent.toFixed(1)}%`;
            progressText.style.color = "#c8c8e0";

            if (percent < 50) {
                progressFill.style.background = "linear-gradient(90deg, #6c5ce7, #a29bfe)";
            } else if (percent < 80) {
                progressFill.style.background = "linear-gradient(90deg, #fd79a8, #e17055)";
            } else {
                progressFill.style.background = "linear-gradient(90deg, #00b894, #00cec9)";
            }
        }
    };

    xhr.onload = function () {
        isUploading = false;
        if (xhr.status === 200) {
            progressFill.style.width = "100%";
            progressFill.style.background = "linear-gradient(90deg, #00b894, #00cec9)";
            progressText.textContent = "✅ Загружено успешно!";
            progressText.style.color = "#55efc4";
            fileNameEl.textContent = `✅ ${selectedFile.name} (загружен)`;
            fileNameEl.style.color = "#55efc4";

            setTimeout(() => {
                selectedFile = null;
                fileInput.value = "";
                uploadBtn.disabled = true;
                uploadBtn.style.opacity = "0.5";
                uploadBtn.style.cursor = "not-allowed";
                fileNameEl.textContent = "Файл не выбран";
                fileNameEl.style.color = "#a0a0b8";
                progressFill.style.width = "0%";
                progressFill.style.background = "linear-gradient(90deg, #6c5ce7, #a29bfe)";
                progressText.textContent = "";
                progressText.style.color = "#a0a0b8";
            }, 3000);
        } else {
            progressText.textContent = "❌ Ошибка загрузки (код: " + xhr.status + ")";
            progressText.style.color = "#ff7675";
            progressFill.style.background = "linear-gradient(90deg, #ff7675, #d63031)";
            uploadBtn.disabled = false;
            uploadBtn.style.opacity = "1";
            uploadBtn.style.cursor = "pointer";
        }
    };

    xhr.onerror = function () {
        isUploading = false;
        progressText.textContent = "❌ Ошибка сети";
        progressText.style.color = "#ff7675";
        progressFill.style.background = "linear-gradient(90deg, #ff7675, #d63031)";
        uploadBtn.disabled = false;
        uploadBtn.style.opacity = "1";
        uploadBtn.style.cursor = "pointer";
    };

    xhr.ontimeout = function () {
        isUploading = false;
        progressText.textContent = "❌ Таймаут загрузки";
        progressText.style.color = "#ff7675";
        progressFill.style.background = "linear-gradient(90deg, #ff7675, #d63031)";
        uploadBtn.disabled = false;
        uploadBtn.style.opacity = "1";
        uploadBtn.style.cursor = "pointer";
    };

    xhr.timeout = 300000; // 5 минут

    progressText.textContent = "Начинаем загрузку...";
    progressText.style.color = "#c8c8e0";
    progressFill.style.background = "linear-gradient(90deg, #6c5ce7, #a29bfe)";
    xhr.send(formData);
}

// Навешиваем обработчик на кнопку
uploadBtn.addEventListener("click", uploadFile);