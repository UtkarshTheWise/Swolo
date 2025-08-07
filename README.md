# Swolo

##Swolo: The AI-Powered Music Generation and Audio Harmonization Tool 🎶

Swolo is an innovative project that blends the power of generative AI with creative audio production tools. Inspired by Saraswati and Apollo, the goddesses of music from Hindu and Greek mythology, Swolo provides users with an intuitive platform to generate unique music and then creatively harmonize it with their own vocals.

##✨ Features

AI Music Generation: Utilizing a pre-trained generative AI model via Loudly's API, users can create custom music tracks by simply providing a text prompt (e.g., "Chill Lofi with Flute") and a desired duration.

Dynamic Audio Visualization: The platform leverages the WebAudio API and Tone.js to display real-time spectrograms and waveforms of the generated audio, offering a visually engaging experience.

Integrated Audio Mixer: A powerful, in-browser audio mixer allows users to upload their own vocals and mix them with the AI-generated base track. Features include pitch, reverb, and delay controls, enabling sophisticated harmonization.

Stunning Synthesizer-Inspired UI: The frontend, built with HTML, CSS, and JavaScript, boasts a retro synthesizer aesthetic. It features a Three.js-powered 3D gramophone model and a synthwave grid, complemented by smooth CSS breathing animations and scroll effects for a visually captivating and user-friendly experience.

##💻 Tech Stack

Frontend:
HTML5, CSS3, JavaScript
Three.js: For 3D graphics and models
WebAudio API: For audio processing and visualization
Tone.js: For advanced audio synthesis and effects
Backend/API:
Loudly's API: For AI music generation

## 🚀 How to Run Locally

To get Swolo up and running on your local machine, follow these steps:
1. Clone the repository: ```git clone [[your-repository-url](https://github.com/UtkarshTheWise/Swolo/)]
cd Swolo```
2. Start the server:
```Open the index.html file in your browser to launch the application.```

##🗺️ Project Structure

The project is organized into logical directories:
assets/: Contains images, 3D models, and other media.
backend/: A placeholder for future backend development.
models/: Stores models for the Three.js scene.
node_modules/: Contains installed npm packages.
index.html: The main entry point of the website.
package.json: Lists project dependencies and scripts.
package-lock.json: Records the exact versions of dependencies.
README.md: This file.
script.js: Handles all core JavaScript logic, API calls, and UI interactions.
style.css: Manages all styling and layout, including the retro synthwave aesthetic.
vaporwave-bg.js: A dedicated script for the background effects.

##🌟 Future Scope

Swolo is just the beginning. The potential for expansion is vast:
Custom Generative AI Model: Developing our own in-house AI/ML model for music generation, offering a fully custom solution.
Public-Facing API: Creating our own API that others can call to generate music, fostering a developer community.
Advanced Vocal Refinement: Enhancing the vocal harmonization features to include vocal tuning, style emulation (e.g., changing a voice to sound like a famous singer), and AI-generated covers.
Scientific and Analytical Applications: Expanding into fields like audio forensics to help decode and clarify hard-to-understand audio recordings.

##🙏 Acknowledgements

We'd like to extend our gratitude to the creators of Loudly for their accessible and powerful API, as well as the developers of Three.js, WebAudio API, and Tone.js for providing the foundational tools that made our creative vision a reality. Thank you to the event organizers of CodeZilla for giving us this deeply influential learning experience and the opportunity to present our skills.
