document.addEventListener('DOMContentLoaded', function () {
    loadTitles();
    loadVideos();
    loadImages();

    document.getElementById('add-title-btn').addEventListener('click', addTitle);
    document.getElementById('add-video-btn').addEventListener('click', addVideo);
    document.getElementById('add-image-btn').addEventListener('click', addImage);
});

function loadTitles() {
    fetch('/api/titles')
        .then(response => response.json())
        .then(data => {
            const titleList = document.getElementById('title-list');
            titleList.innerHTML = '';
            Object.keys(data).forEach(id => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${data[id]} 
                    <button onclick="deleteTitle(${id})">Eliminar</button>
                `;
                titleList.appendChild(li);
            });
        });
}

function addTitle() {
    const newTitleInput = document.getElementById('new-title');
    const newTitle = newTitleInput.value;
    fetch('/api/titles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle })
    })
        .then(response => response.json())
        .then(data => {
            newTitleInput.value = '';
            loadTitles();
        });
}

function deleteTitle(id) {
    fetch(`/api/titles/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            loadTitles();
        });
}

function loadVideos() {
    fetch('/api/videos')
        .then(response => response.json())
        .then(data => {
            const videoList = document.getElementById('video-list');
            videoList.innerHTML = '';
            data.forEach(filename => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <video width="320" height="240" controls>
                        <source src="/videos/${filename}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <button onclick="deleteVideo('${filename}')">Eliminar</button>
                `;
                videoList.appendChild(li);
            });
        });
}

function addVideo() {
    const newVideoInput = document.getElementById('new-video');
    const file = newVideoInput.files[0];
    const formData = new FormData();
    formData.append('video', file);

    fetch('/api/videos', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            newVideoInput.value = '';
            loadVideos();
        });
}

function deleteVideo(filename) {
    fetch(`/api/videos/${filename}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            loadVideos();
        });
}

function loadImages() {
    fetch('/api/images')
        .then(response => response.json())
        .then(data => {
            const imageList = document.getElementById('image-list');
            imageList.innerHTML = '';
            data.forEach(filename => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <img src="/images/${filename}" width="320" height="240">
                    <button onclick="deleteImage('${filename}')">Eliminar</button>
                `;
                imageList.appendChild(li);
            });
        });
}

function addImage() {
    const newImageInput = document.getElementById('new-image');
    const file = newImageInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    fetch('/api/images', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            newImageInput.value = '';
            loadImages();
        });
}

function deleteImage(filename) {
    fetch(`/api/images/${filename}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            loadImages();
        });
}
