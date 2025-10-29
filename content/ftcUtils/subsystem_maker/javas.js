function toRun() {
    document.addEventListener("DOMContentLoaded", function () {
        // Select all sections with the class 'active'
        const sections = document.querySelectorAll(".active");

        // Function to toggle the 'active' class
        function toggleActiveSections() {
            sections.forEach((section) => {
                section.classList.toggle("active");
            });
        }
    });
}
function generateData() {
    let inputString = document.getElementById('inputString').value;
    const selector = document.getElementById('selector').value;
    const servoElement = document.getElementById('servoList').value;
    const servoList = servoElement.split(',').map((item) => item.trim());
    const name = inputString+="Subsystem"
    
    let generatedData = ''; // Initialize generatedData as an empty string

    if (selector === 'Java') {
        generatedData += "import com.qualcomm.robotcore.hardware.Servo;\nimport org.firstinspires.ftc.robotcore.external.Telemetry;";
        generatedData += "public class " + name + " {\n";
        for (let i = 0; i < servoList.length; i++) {
            generatedData += "    private Servo " + servoList[i] + "Servo;\n";
        }
        generatedData += "\n//this is where you put all enums and variables\n";
        generatedData += "    public " + name + "(HardwareMap hwMap) {\n";
        for (let i = 0; i < servoList.length; i++) {
            generatedData += "        " + servoList[i] + "Servo = hwMap.get(Servo.class, \"" + servoList[i] + "Servo\");\n";
        }
        generatedData += "    }\n";
        generatedData += "\n";
        generatedData += "    public void update() {\n";
        generatedData += "        // this is where you put your state machines and all power functions (call this in our main code)\n";
        generatedData += "    }\n";
        generatedData += "\n    // this is where you put your update functions to switch between states\n";
        generatedData += "    public void telemetry(Telemetry telemetry) {\n";
        generatedData += "        // add telemetry data here\n";
        generatedData += "    }\n";
        generatedData += "}\n";
    } else if (selector === 'Kotlin') {
        generatedData+="class "+name+"(ahwMap:HardwareMap) {\n//this is where you put all enums and variables\n"
        for (let i = 0; i < servoList.length; i++) {
            generatedData += "    private var " + servoList[i] + "Servo\n";
        }
        generatedData += "\n"
        generatedData += "    init {\n"
        for (let i = 0; i < servoList.length; i++) {
            generatedData += "        " + servoList[i] + "Servo = ahwMap.get(Servo::class.java, \"" + servoList[i] + "Servo\")\n";
        }
        generatedData += "}\n//this is where you put functions to switch states\n"
        generatedData += "fun update() {\n// this is where you put your state machines and all power functions (call this in our main code)\n}\nfun telemetry(telemetry:Telemetry){\n\n}\n}"
    }
    
    console.log('Generated Data:', generatedData);
    
    // Display the generated data
    document.getElementById('outputText').innerText = generatedData;
}