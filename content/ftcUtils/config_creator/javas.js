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

function checkDeviceType() {
    var deviceSelect = document.getElementById("device");
    var motorInput = document.getElementById("motorInput");
    if (deviceSelect.value === "Motor") {
        motorInput.style.display = "block";
    } else {
        motorInput.style.display = "none";
    }
    if (deviceSelect.value === "Camera") {
        document.getElementById("port").placeholder = "Serial Number";
        document.getElementById("module").disabled = true;
    } else {
        document.getElementById("port").placeholder = "Port";
        document.getElementById("module").disabled = false;
    }
}
var deviceList = [];
function addDevice() {
    var module = document.getElementById("module").value;
    var device = document.getElementById("device").value;
    var port = document.getElementById("port").value;
    var name = document.getElementById("deviceName").value;
    if (device === "Motor") {
        var motorType = document.getElementById("motorInput").value;
        deviceList.push({name:name, module: module, device: motorType, port: port });
    }else if (device === "Camera") {
        deviceList.push({name:name, module: "", device
        : "Webcam", port: port });
    } else{
    deviceList.push({name:name, module: module, device: device, port: port });
    }
    console.log(deviceList);
    document.getElementById("deviceName").value = "";
    document.getElementById("port").value = "";
}

function generateData() {
    var devices = [];
    var hasEHub = false;
    deviceList.forEach((device) => {
        var MString = "";
        var DString = "";
        var PString = 0;
        var NString = "";
        var prefix = "";
        let module = device.module;
        let deviceType = device.device;
        let port = device.port;
        let name = device.name;
        if (module === "Control Hub"){
            MString = "ConfigMaker.ModuleType.CONTROL_HUB"
        }else if (module === "Expansion Hub"){
            MString = "ConfigMaker.ModuleType.EXPANSION_HUB"
            hasEHub = true;
        }
        
        if (deviceType.includes("Motor")) {
            DString = "ConfigMaker.MotorType." + deviceType;
            prefix = ".addMotor(";
        } else if (deviceType.includes("Webcam")){
            DString = deviceType;
            prefix = ".addCamera(";
        } else {
            DString = "ConfigMaker.DeviceType." + deviceType;
            prefix = ".addDevice(";
        }
        PString = port;
        NString = "\"" +name+ "\"";
        if (!DString.includes("Webcam")){
        devices.push(prefix + NString + ", " + MString + ", " + DString + ", " + port + ")");
        }else{
            devices.push(prefix + NString + ", \"" + PString + "\")");
        }
        console.log(devices);
    });
    var eHub = ".addModule(ConfigMaker.ModuleType.EXPANSION_HUB, \"Expansion Hub\")";

    let generatedData = ""; // Initialize generatedData as an empty string
    generatedData = `
import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.eventloop.opmode.OpModeManager;
import com.qualcomm.robotcore.eventloop.opmode.OpModeRegistrar;

import org.firstinspires.ftc.robotcore.internal.opmode.OpModeMeta;

import org.gentrifiedApps.gentrifiedAppsUtil.config.ConfigMaker;
import org.gentrifiedApps.gentrifiedAppsUtil.config.ConfigCreator;

public final class ConfigRegistrar {

    static ConfigMaker config = new ConfigMaker("${document.getElementById("name").value === "" ? "main" : document.getElementById("name").value}")
            ${hasEHub ? eHub : ""}
            ${devices.join("\n")};

    static boolean isEnabled = true;
    private ConfigRegistrar() {
    }

    private static OpModeMeta metaForClass(Class<? extends OpMode> cls) {
        return new OpModeMeta.Builder()
                .setName(cls.getSimpleName())
                .setGroup("Config")
                .setFlavor(OpModeMeta.Flavor.TELEOP)
                .build();
    }

    @OpModeRegistrar
    public static void register(OpModeManager manager) {
        if (!isEnabled) return;
        manager.register(metaForClass(ConfigCreator.class), new ConfigCreator(config));
    }
}
    `;

    console.log("Generated Data:", generatedData);

    // Display the generated data
    document.getElementById("outputText").innerText = generatedData;

    // Create a Blob from the generated data
    const blob = new Blob([generatedData], { type: "text/plain" });

    // Create a link element
    const link = document.createElement("a");

    // Set the download attribute with a filename
    link.download = "ConfigRegistrar.java";

    // Create a URL for the Blob and set it as the href attribute
    link.href = window.URL.createObjectURL(blob);

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
}
