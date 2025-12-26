# FFCS Planner - VITB
A high-performance, interactive web application designed to help VIT Bhopal students plan their course schedules efficiently during the Fully Flexible Credit System (FFCS) registration.

Website link - [www.ffcsplannervitb.com](https://ffcsplannervitb.vercel.app/)

### Project Preview:
![Weekly Timetable Grid](timetable.png)

### About:
The **FFCS Planner - VITB** is a specialized tool built to simplify the complex process of timetable creation. It allows students to visualize their weekly schedule, manage credit limits, and detect slot clashes in real-time.

### Key Features:
* **Three-Draft System**: Save and switch between three different schedule versions (Draft 1, 2, and 3) to compare different faculty or slot combinations.
* **Smart Slot Management**: Real-time detection of slot clashes (e.g., C11 vs A21) to prevent registration errors.
* **Building Change Detection**: Automatically marks "Sprint" warnings (🏃‍♂️) when consecutive classes are in different buildings (e.g., moving from AB-1 to LC).
* **Dynamic Dashboard**: Live counters for total credits (max 29) and total registered courses.
* **Instant Course Management**: Easily add, edit, or remove courses from your draft with a streamlined sidebar interface that updates the grid in real-time.
* **Print-Optimized Styles**: Custom CSS media queries ensure that when you use the browser's print function, the timetable is formatted perfectly for physical copies, hiding unnecessary UI elements like buttons and sidebars.
* **Interactive "How to Use" Guide**: An integrated overlay provides step-by-step instructions for new users to navigate the planning, selecting, and exporting process.
* **Direct Feedback Integration**: A built-in feedback form allows users to report bugs or suggest improvements directly to the developer.
* **Visual Color Coding**: Each course is automatically assigned a unique color, providing a clear visual distinction between different subjects on the weekly grid.
* **Draft Sharing Logic**: Generate a unique URL to share your entire planned draft with friends instantly.
* **Export Options**: One-click export of your final timetable grid as a high-quality PNG or PDF.
* **Dark/Light Modes**: Customizable UI themes for comfortable planning during late-night registration hours.

## 🛠️ Technical Deep Dive

### Core Logic
* **Clash Detection**: Uses a `clashMap` to identify conflicting morning and evening slots that cannot be picked simultaneously.
* **Persistence**: Data is maintained across sessions using `localStorage`, indexed by the specific draft version (e.g., `vit_ffcs_v1`).
* **URL-Based Sharing**: Draft data is serialized, URI-encoded, and converted to Base64 to create shareable links without requiring a backend.

## Tech Stack:

**Frontend:** HTML5, CSS3, JavaScript

**Libraries:**
* **html2canvas**: For generating schedule images.
* **jspdf**: For PDF document generation.
* **Web3Forms**: For handling user feedback submissions.
**Deployment**: Vercel.

### Project Structure:
```
/ffcs-planner-vitb
|-- README.md      
|-- index.html      
|-- style.css       
|-- script.js     
|-- logo.png        
|-- timetable.png   

```
### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/Rudragupta23/FFCS-PLANNER-VITB.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd FFCS-PLANNER-VITB
    ```
3.  Open the `index.html` file in your web browser.
