# Build a Smart Image Generator

A Node.js app that creates high-quality images using Replicate’s Google Imagen 4 Fast model. Enter a theme, and it generates images in different sizes and styles, saves metadata, and builds an HTML gallery to view them.

---

## Features

-  Accepts **user input** for image themes (via CLI or interactive prompt).  
-  Generates images in **different sizes**: square (1:1), landscape (16:9), and portrait (9:16).  
-  Supports multiple **styles**: vivid and natural.  
- Saves images locally in an `images/` folder.  
-  Generates **metadata** for each image in `metadata/` folder, including theme, size, style, model, prompt, and timestamp.  
- Creates a **gallery.html** to view all generated images with metadata.  
- Handles errors and logs progress for easy debugging.  

---

### output 
![gallery](./assets/Screenshot%202025-12-20%20191956.png)