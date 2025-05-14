document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent immediate navigation
    const href = this.getAttribute('href');
    
      // Apply fade-out effect
    document.body.classList.add('fade-out');

      // After the animation completes, navigate to the new page
    setTimeout(() => {
        window.location.href = href;
      }, 500); // 500ms matches the CSS animation time
    });
});
// Declare variables to store the original and processed images
let originalImage = null;
let processedImage = null;

// Function to handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            originalImage = new Image();
            originalImage.onload = function() {
                // Set fixed canvas size
                const originalCanvas = document.getElementById("originalCanvas");
                const ctx = originalCanvas.getContext("2d");
                
                // Set the canvas size to 400x300
                originalCanvas.width = 400;
                originalCanvas.height = 300;
                
                // Draw the image on the canvas
                ctx.drawImage(originalImage, 0, 0, originalCanvas.width, originalCanvas.height);
                processedImage = originalImage; // Initialize processed image
            };
            originalImage.src = imageUrl;
        };
        reader.readAsDataURL(file);
    }
}

function generateHistograms(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const redHistogram = new Array(256).fill(0);
    const greenHistogram = new Array(256).fill(0);
    const blueHistogram = new Array(256).fill(0);

    // Populate histogram arrays based on pixel data
    for (let i = 0; i < data.length; i += 4) {
        redHistogram[data[i]]++;     // Red
        greenHistogram[data[i + 1]]++; // Green
        blueHistogram[data[i + 2]]++;  // Blue
    }

    // Call drawHistogram to update the canvas and values
    drawHistogram("histogramRed", redHistogram, "red");
    drawHistogram("histogramGreen", greenHistogram, "green");
    drawHistogram("histogramBlue", blueHistogram, "blue");

    // Optionally, update the values beneath the histograms
    document.getElementById('redValue').textContent = `Red Value: ${Math.max(...redHistogram)}`;
    document.getElementById('greenValue').textContent = `Green Value: ${Math.max(...greenHistogram)}`;
    document.getElementById('blueValue').textContent = `Blue Value: ${Math.max(...blueHistogram)}`;
}

// Function to draw the histogram bars for each color
function drawHistogram(canvasId, histogramData, color) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    
    // Clear and set canvas size
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 256;
    canvas.height = 100;

    // Find the max count for normalization
    const maxCount = Math.max(...histogramData);

    // Draw histogram bars
    for (let i = 0; i < histogramData.length; i++) {
        const barHeight = (histogramData[i] / maxCount) * canvas.height;
        ctx.fillStyle = color;
        ctx.fillRect(i, canvas.height - barHeight, 1, barHeight);
    }
}

// Function to trigger histogram generation on button click
function handleHistogramButtonClick() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Load the image from the uploaded file
    const fileInput = document.getElementById("imageInput").files[0];
    if (!fileInput) {
        alert("Please upload an image first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(fileInput);

    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Generate histograms after image is drawn
        generateHistograms(canvas);
    };
}

// Attach event listener to the button
document.getElementById("generateHistogramButton").addEventListener("click", handleHistogramButtonClick);

// Function to apply mirror effect based on selected option
function applyMirror() {
    if (!processedImage) return; // If no image has been uploaded

    const verticalMirror = document.getElementById("verticalMirror").checked;
    const horizontalMirror = document.getElementById("horizontalMirror").checked;

    const canvas = document.getElementById("editedCanvas");
    const ctx = canvas.getContext("2d");

    // Set the canvas size to 400x300
    canvas.width = 400;
    canvas.height = 300;

    // Apply mirror effect
    if (verticalMirror) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror horizontally
    } else if (horizontalMirror) {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1); // Mirror vertically
    }
    
    // Draw the processed image onto the canvas
    ctx.drawImage(processedImage, 0, 0, canvas.width, canvas.height);
}

// Function to reset the image to its original state
function resetImage() {
    if (!originalImage) return; // If no image has been uploaded

    const canvas = document.getElementById("editedCanvas");
    const ctx = canvas.getContext("2d");

    // Reset the processed image to the original one
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 400; // Set fixed width
    canvas.height = 300; // Set fixed height
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    // Reset histogram values
    document.getElementById('redValue').textContent = "Red Value: 0";
    document.getElementById('greenValue').textContent = "Green Value: 0";
    document.getElementById('blueValue').textContent = "Blue Value: 0";

    // Reset rotation and movement inputs
    document.getElementById("rotationAngle").value = 0;
    document.getElementById("moveX").value = 0;
    document.getElementById("moveY").value = 0;

    // Clear histogram canvases
    ["histogramRed", "histogramGreen", "histogramBlue"].forEach(id => {
        const histCanvas = document.getElementById(id);
        const histCtx = histCanvas.getContext("2d");
        histCtx.clearRect(0, 0, histCanvas.width, histCanvas.height);
    });

    // Uncheck the mirror options
    document.getElementById("verticalMirror").checked = false;
    document.getElementById("horizontalMirror").checked = false;
    document.getElementById("verticalProjectionCanvas").getContext("2d").clearRect(0, 0, 400, 150);
    document.getElementById("horizontalProjectionCanvas").getContext("2d").clearRect(0, 0, 400, 150);

    // Hide the projection container again
    document.querySelector(".projection-container").style.display = "none";
}


// Function to save the processed image (download as PNG)
function saveImage() {
    const canvas = document.getElementById("editedCanvas");
    const dataUrl = canvas.toDataURL("image/png");

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "processed_image.png";
    a.click();
}

// Attach event listener to image input for uploading images
document.getElementById("imageInput").addEventListener("change", handleImageUpload);

// Attach event listener to save button for saving the image
document.getElementById("save").addEventListener("click", saveImage);

// Function to apply rotation based on user input
function applyRotation() {
    const angle = document.getElementById("rotationAngle").value;
    let originalCanvas = document.getElementById("originalCanvas");
    let editedCanvas = document.getElementById("editedCanvas");

    // Get the context of the canvas
    let originalContext = originalCanvas.getContext("2d");
    let editedContext = editedCanvas.getContext("2d");

    // Ensure the canvas size matches the image
    let img = new Image();
    img.src = originalCanvas.toDataURL();

    img.onload = function () {
        let width = img.width;
        let height = img.height;

        // Clear the canvas
        editedContext.clearRect(0, 0, editedCanvas.width, editedCanvas.height);

        // Set canvas size
        editedCanvas.width = width;
        editedCanvas.height = height;

        // Rotate the canvas
        editedContext.translate(width / 2, height / 2);
        editedContext.rotate((angle * Math.PI) / 180);
        editedContext.drawImage(img, -width / 2, -height / 2);
    }
}

// Function to toggle the visibility of the rotation controls section
function toggleRotationControls() {
    const rotationControls = document.querySelector('.second-controls');
    const toggleButton = document.getElementById('toggleButton');

    // Toggle the 'show' class to show/hide the rotation options
    rotationControls.classList.toggle('show');

    // Change the button text depending on the visibility of the rotation options
    if (rotationControls.classList.contains('show')) {
        toggleButton.textContent = 'Hide Rotation Options';
    } else {
        toggleButton.textContent = 'Show Rotation Options';
    }
}

function toggleMirroringControls() {
    const mirroringControls = document.querySelector('.third-controls');
    const toggleButton = document.getElementById('toggleMirroringButton');

    // Toggle the 'show' class to show/hide the mirroring options
    mirroringControls.classList.toggle('show');

    // Change the button text depending on the visibility of the mirroring options
    if (mirroringControls.classList.contains('show')) {
        toggleButton.textContent = 'Hide Mirroring Options';
    } else {
        toggleButton.textContent = 'Show Mirroring Options';
    }
}


// Function to move the image to a specific (x, y) position
function moveImage() {
    const x = parseInt(document.getElementById("moveX").value); // Get x from input field
    const y = parseInt(document.getElementById("moveY").value); // Get y from input field
    if (originalImage) {
        // Get the canvas and context
        const canvas = document.getElementById("editedCanvas");
        const ctx = canvas.getContext("2d");

        // Clear the canvas and reset the size
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 400;
        canvas.height = 300;

        // Draw the image at the new (x, y) coordinates
        ctx.drawImage(originalImage, x, y, canvas.width, canvas.height);
    }
}

function generateHistograms() {
    if (!originalImage) {
        alert("Please upload an image first!");
        return;
    }

    const originalCanvas = document.getElementById("originalCanvas");
    const ctx = originalCanvas.getContext("2d");

    // Get image data from the canvas
    const imageData = ctx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const pixels = imageData.data;

    let redHistogram = new Array(256).fill(0);
    let greenHistogram = new Array(256).fill(0);
    let blueHistogram = new Array(256).fill(0);

    // Populate the histograms with pixel data
    for (let i = 0; i < pixels.length; i += 4) {
        redHistogram[pixels[i]]++;
        greenHistogram[pixels[i + 1]]++;
        blueHistogram[pixels[i + 2]]++;
    }

    // Draw the histograms and update values
    drawHistogram("histogramRed", redHistogram, "red", "redValue");
    drawHistogram("histogramGreen", greenHistogram, "green", "greenValue");
    drawHistogram("histogramBlue", blueHistogram, "blue", "blueValue");

    // Show the histogram container
    const histogramContainer = document.querySelector(".histogram-container");
    histogramContainer.style.display = "block"; // Make the container visible
}

// Function to draw the histograms on canvas
function drawHistogram(canvasId, histogramData, color, valueId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    // Set canvas dimensions
    canvas.width = 256;
    canvas.height = 100;

    // Clear any previous data
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const maxCount = Math.max(...histogramData);
    const maxPixelValue = histogramData.indexOf(maxCount); // Get the pixel value that occurs the most

    // Draw the histogram bars
    for (let i = 0; i < 256; i++) {
        const barHeight = (histogramData[i] / maxCount) * canvas.height;
        ctx.fillStyle = color;
        ctx.fillRect(i, canvas.height - barHeight, 1, barHeight);
    }

    // Update the value display below the histogram
    document.getElementById(valueId).textContent = `Max Pixel Value: ${maxPixelValue} (Frequency: ${maxCount})`;
}

// Add event listener for the "Generate Histograms" button
document.getElementById("generateHistogramButton").addEventListener("click", generateBinaryProjection);

// Function to generate Binary Image Projections
document.getElementById('verticalProjectionBtn').addEventListener('click', function() {
    displayVerticalProjection();
});

document.getElementById('horizontalProjectionBtn').addEventListener('click', function() {
    displayHorizontalProjection();
});

function displayVerticalProjection() {
    const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous projection
    
    // Sample image data (could be loaded from an image)
    let imageData = ctx.createImageData(canvas.width, canvas.height);
    let data = imageData.data;
    
    // Set some sample pixels to create an object (black square in this case)
    for (let i = 100; i < 400; i++) {
        for (let j = 100; j < 400; j++) {
            let index = (i + j * canvas.width) * 4;
            data[index] = 0; // Red
            data[index + 1] = 0; // Green
            data[index + 2] = 0; // Blue
            data[index + 3] = 255; // Alpha
        }
    }

    // Put image data into the canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Vertical projection calculation
    let projectionData = new Array(canvas.height).fill(0);
    
    // Calculate vertical projection by summing pixel values along columns
    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {
            let index = (x + y * canvas.width) * 4;
            if (data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0) { // If pixel is black
                projectionData[y]++;
            }
        }
    }

    // Draw the vertical projection (sum of black pixels along each row)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - projectionData[0]);
    for (let i = 1; i < projectionData.length; i++) {
        ctx.lineTo(i, canvas.height - projectionData[i]);
    }
    ctx.strokeStyle = 'red';
    ctx.stroke();
}

function displayHorizontalProjection() {
    const canvas = document.getElementById('projectionCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous projection
    
    // Sample image data (same as in vertical projection)
    let imageData = ctx.createImageData(canvas.width, canvas.height);
    let data = imageData.data;
    
    for (let i = 100; i < 400; i++) {
        for (let j = 100; j < 400; j++) {
            let index = (i + j * canvas.width) * 4;
            data[index] = 0; // Red
            data[index + 1] = 0; // Green
            data[index + 2] = 0; // Blue
            data[index + 3] = 255; // Alpha
        }
    }

    ctx.putImageData(imageData, 0, 0);
    
    // Horizontal projection calculation
    let projectionData = new Array(canvas.width).fill(0);
    
    // Calculate horizontal projection by summing pixel values along rows
    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            let index = (x + y * canvas.width) * 4;
            if (data[index] === 0 && data[index + 1] === 0 && data[index + 2] === 0) { // If pixel is black
                projectionData[x]++;
            }
        }
    }

    // Draw the horizontal projection (sum of black pixels along each column)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - projectionData[0]);
    for (let i = 1; i < projectionData.length; i++) {
        ctx.lineTo(i, canvas.height - projectionData[i]);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();
}

function applyVerticalProjection() {
    const canvas = document.getElementById("originalCanvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// Check if the canvas has any content (image data)
const imageData = context.getImageData(0, 0, width, height).data;
const hasImage = imageData.some(channel => channel !== 0);

// If the canvas is empty, don't display the projection
if (width === 0 || height === 0 || !hasImage) {
    console.warn("Original canvas has no content.");
    document.querySelector(".projection-container").style.display = "none";  // Hide projection container
    return;
}

// If the canvas has content, display the projection container
document.querySelector(".projection-container").style.display = "block";

// Continue with your projection logic if there's an image
const projection = new Array(width).fill(0);

// Your vertical projection logic goes here...


    // Sum up pixel brightness per vertical line
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const index = (y * width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const brightness = (r + g + b) / 3;
            projection[x] += brightness;
        }
    }

    // Normalize and draw
    const projectionCanvas = document.getElementById("verticalProjectionCanvas");
    const projectionCtx = projectionCanvas.getContext("2d");
    projectionCanvas.width = width;
    projectionCanvas.height = 150;

    const max = Math.max(...projection);
    projectionCtx.clearRect(0, 0, projectionCanvas.width, projectionCanvas.height);
    projectionCtx.beginPath();
    for (let x = 0; x < projection.length; x++) {
        const scaledHeight = (projection[x] / max) * projectionCanvas.height;
        projectionCtx.moveTo(x, projectionCanvas.height);
        projectionCtx.lineTo(x, projectionCanvas.height - scaledHeight);
    }
    projectionCtx.strokeStyle = "black";
    projectionCtx.lineWidth = 3;
    projectionCtx.stroke();
}

function applyHorizontalProjection() {
    const canvas = document.getElementById("originalCanvas");
const context = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

// Check if the canvas has any content (image data)
const imageData = context.getImageData(0, 0, width, height).data;
const hasImage = imageData.some(channel => channel !== 0);

// If the canvas is empty, don't display the projection
if (width === 0 || height === 0 || !hasImage) {
    console.warn("Original canvas has no content.");
    document.querySelector(".projection-container").style.display = "none";  // Hide projection container
    return;
}

// If the canvas has content, display the projection container
document.querySelector(".projection-container").style.display = "block";

// Continue with your projection logic if there's an image
const projection = new Array(width).fill(0);

// Your vertical projection logic goes here...

    // Sum up pixel brightness per horizontal line
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = imageData[index];
            const g = imageData[index + 1];
            const b = imageData[index + 2];
            const brightness = (r + g + b) / 3;
            projection[y] += brightness;
        }
    }

    // Normalize and draw
    const projectionCanvas = document.getElementById("horizontalProjectionCanvas");
    const projectionCtx = projectionCanvas.getContext("2d");
    projectionCanvas.width = 400;
    projectionCanvas.height = height;

    const max = Math.max(...projection);
    projectionCtx.clearRect(0, 0, projectionCanvas.width, projectionCanvas.height);
    projectionCtx.beginPath();
    for (let y = 0; y < projection.length; y++) {
        const scaledWidth = (projection[y] / max) * projectionCanvas.width;
        projectionCtx.moveTo(0, y);
        projectionCtx.lineTo(scaledWidth, y);
    }
    projectionCtx.strokeStyle = "black";
    projectionCtx.lineWidth = 3;
    projectionCtx.stroke();
}
