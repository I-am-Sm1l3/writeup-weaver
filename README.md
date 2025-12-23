# Sm1l3's Writeup Weaver

This is a Next.js application designed to help you write and format technical blog posts for Jekyll, inspired by themes like Chirpy. It features a rich Markdown editor with a live preview and an export function that packages your post and images into a zip file, ready for publishing.

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 18 or higher is recommended)
- [npm](https://www.npmjs.com/) (which comes with Node.js)
- [Firebase CLI](https://firebase.google.com/docs/cli) (see Deployment section for installation)

## How to Run the Application

Follow these steps to get the application running on your local machine.

### 1. Install Dependencies

First, open a terminal or command prompt, navigate to the root directory of the project, and run the following command to install all the necessary packages:

```bash
npm install
```

### 2. Set Up Environment Variables (for AI Features)

The application uses AI to help you format text and suggest tags. To enable these features, you need to provide a Google AI API key.

1.  Make a copy of the `.env` file and rename it to `.env.local`.
2.  Open `.env.local` and add your API key like this:

    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

    You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the Development Servers

This application requires two processes to run at the same time in separate terminal windows:

**Terminal 1: Start the Web Application**

In your first terminal, run this command to start the main Next.js application:

```bash
npm run dev
```

This will start the web server. You can now access the application in your browser at **http://localhost:9002**.

**Terminal 2: Start the AI Service**

For the AI-powered features to work, you need to start the Genkit server. In a second terminal window, run:

```bash
npm run genkit:watch
```
This command starts the local server that runs your AI flows and will automatically restart if you make any changes to the AI-related code.

---

## Deployment to Firebase App Hosting

This project is pre-configured for deployment on Firebase App Hosting. Here’s how you can deploy it:

### 1. Install the Firebase CLI

If you don't have it installed already, open your terminal and run this command:

```bash
npm install -g firebase-tools
```

### 2. Log in to Firebase

Run the following command to log in with your Google account. This will open a browser window for you to authenticate.

```bash
firebase login
```

### 3. Initialize Firebase in Your Project

In your project's root directory, run the initialization command:

```bash
firebase init apphosting
```

The CLI will guide you through the process:
- It will ask you to select a Firebase project. If you don't have one, you can create one in the [Firebase Console](https://console.firebase.google.com/).
- It will detect the `apphosting.yaml` file and set up the backend.

### 4. Set the API Key as a Secret

For the AI features to work in the deployed application, you must securely set your Gemini API key as a secret in Firebase. **Do not** commit your `.env.local` file.

Run the following command, replacing `YOUR_API_KEY_HERE` with your actual key:

```bash
firebase apphosting:secrets:set GEMINI_API_KEY
```
You will be prompted to enter the value for the secret. Paste your API key there.

### 5. Deploy Your Application

Finally, run the deploy command:

```bash
npm run build && firebase apphosting:backends:deploy
```

This command will first build your Next.js application for production and then deploy it to Firebase App Hosting. After it finishes, the CLI will give you the URL where your live application can be accessed.

With both local development and deployment covered, your "Sm1l3's Writeup Weaver" application is now fully equipped for you to create and publish your amazing technical posts!