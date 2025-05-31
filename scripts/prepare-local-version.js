const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Create a README file with instructions
const readmeContent = `# Student Homework Management Application - Local Version

## Prerequisites
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- No server or Node.js installation required!

## How to Use
1. Simply open the 'index.html' file in the 'out' folder with your web browser
2. The application will load and you can start using it immediately
3. Your data will be stored in your browser's local storage

## Google Sheets Integration
- You'll need internet access to use the Google Sheets integration
- Follow the in-app tutorial for setting up Google Sheets

## Updating the Application
- When updates are available, download the new version
- Replace all files in this folder with the new version
- Your data will be preserved as long as you use the same browser

## Troubleshooting
- If you encounter any issues, try clearing your browser cache
- For further assistance, refer to the in-app help section
`

// Build the application
console.log("Building the application for local use...")
try {
  execSync("npm run build", { stdio: "inherit" })

  // Create README file
  fs.writeFileSync(path.join(process.cwd(), "out", "README.md"), readmeContent)

  // Create a simple HTML launcher (optional)
  const launcherContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Launch Student Homework Manager</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f0f4f8;
      margin: 0;
    }
    .container {
      text-align: center;
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }
    h1 {
      color: #1976d2;
    }
    .button {
      background-color: #1976d2;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 20px;
      text-decoration: none;
      display: inline-block;
    }
    .button:hover {
      background-color: #1565c0;
    }
    .note {
      margin-top: 20px;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>학생 숙제 관리 시스템</h1>
    <p>Click the button below to launch the Student Homework Management Application</p>
    <a href="./out/index.html" class="button">Launch Application</a>
    <p class="note">If the application doesn't open, please navigate to the 'out' folder and open 'index.html' directly.</p>
  </div>
</body>
</html>
  `

  fs.writeFileSync(path.join(process.cwd(), "launch.html"), launcherContent)

  console.log("✅ Build completed successfully!")
  console.log("The application is ready for local use.")
  console.log('Users can open the "out/index.html" file directly in their browser.')
  console.log("A launcher.html file has also been created for easier access.")
} catch (error) {
  console.error("❌ Build failed:", error)
  process.exit(1)
}
