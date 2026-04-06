# Network Connectivity Tool

## Project Overview
The Network Connectivity Tool is a web application designed to help fintech professionals understand key network connectivity concepts such as Local Area Networks (LAN), Wide Area Networks (WAN), and the TCP/IP protocol suite. The application also provides troubleshooting techniques to assist users in diagnosing and resolving common network issues.

## Features
- **Educational Content**: Learn about LAN, WAN, and TCP/IP concepts with clear explanations and examples.
- **Troubleshooting Techniques**: Access diagnostic tools and methods to guide users through common network troubleshooting scenarios.
- **User-Friendly Interface**: An intuitive web interface that makes learning and troubleshooting easy and accessible.

## Tech Stack
- **Language**: Python
- **Web Framework**: Flask
- **Frontend**: HTML, CSS, JavaScript
- **Static Files**: CSS for styling and JavaScript for interactivity

## File Structure
```
network-connectivity-tool
├── src
│   ├── app.py               # Entry point of the application
│   ├── network.py           # Network connectivity concepts
│   ├── troubleshoot.py       # Troubleshooting techniques
│   ├── templates
│   │   └── index.html       # Main HTML template
│   └── static
│       ├── css
│       │   └── styles.css    # CSS styles
│       └── js
│           └── main.js       # JavaScript code
├── requirements.txt          # Project dependencies
└── README.md                 # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd network-connectivity-tool
   ```
2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Running the Application
To run the application, execute the following command:
```
python src/app.py
```
Then, open your web browser and navigate to `http://localhost:5000` to access the tool.

## Usage
- Navigate through the application to learn about network concepts and access troubleshooting techniques.
- Utilize the provided tools to diagnose and resolve network issues effectively.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.