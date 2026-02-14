from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse
import aiofiles
import os

app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/", response_class=HTMLResponse)
async def index():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Big File Upload</title>
        <style>
            body {
                font-family: Arial;
                background: #111;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
            .card {
                background: #1e1e1e;
                padding: 30px;
                border-radius: 12px;
                width: 400px;
                text-align: center;
            }
            input {
                margin: 15px 0;
            }
            button {
                padding: 10px 20px;
                background: #4CAF50;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
            }
            #progress {
                margin-top: 15px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Upload</h2>
            <input type="file" id="fileInput" />
            <br/>
            <button onclick="uploadFile()">Upload</button>
            <div id="progress"></div>
        </div>

        <script>
            function uploadFile() {
                const file = document.getElementById("fileInput").files[0];
                if (!file) {
                    alert("Select file");
                    return;
                }

                const formData = new FormData();
                formData.append("file", file);

                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/upload", true);

                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        document.getElementById("progress").innerText =
                            "Progress: " + percent.toFixed(2) + "%";
                    }
                };

                xhr.onload = function () {
                    if (xhr.status === 200) {
                        document.getElementById("progress").innerText =
                            "Upload complete!";
                    } else {
                        document.getElementById("progress").innerText =
                            "Upload failed.";
                    }
                };

                xhr.send(formData);
            }
        </script>
    </body>
    </html>
    """


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    async with aiofiles.open(file_path, "wb") as out_file:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            await out_file.write(chunk)

    await file.close()

    return {"status": "ok"}
