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
function findMotor(s) {
    let motor = "";
    let modifier = "";
    switch (s) {
        case "yj30":
            motor = "YellowJacket";
            modifier = "RPM30";
            break;
        case "yj43":
            motor = "YellowJacket";
            modifier = "RPM43";
            break;
        case "yj60":
            motor = "YellowJacket";
            modifier = "RPM60";
            break;
        case "yj84":
            motor = "YellowJacket";
            modifier = "RPM84";
            break;
        case "yj117":
            motor = "YellowJacket";
            modifier = "RPM117";
            break;
        case "yj223":
            motor = "YellowJacket";
            modifier = "RPM223";
            break;
        case "yj312":
            motor = "YellowJacket";
            modifier = "RPM312";
            break;
        case "yj435":
            motor = "YellowJacket";
            modifier = "RPM435";
            break;
        case "yj1150":
            motor = "YellowJacket";
            modifier = "RPM1150";
            break;
        case "yj1620":
            motor = "YellowJacket";
            modifier = "RPM1620";
            break;
        case "yj6000":
            motor = "YellowJacket";
            modifier = "RPM6000";
            break;
        case "tnMax":
            motor = "TorqueNado";
            modifier = "MAX";
            break;
        case "nvc60":
            motor = "NeveRest";
            modifier = "Classic_60";
            break;
        case "nvc40":
            motor = "NeveRest";
            modifier = "Classic_40";
            break;
        case "nvo20":
            motor = "NeveRest";
            modifier = "Orbital_20";
            break;
        case "nvo3_7":
            motor = "NeveRest";
            modifier = "Orbital_3_7";
            break;
        case "rch":
            motor = "REVCoreHex";
            modifier = "CodeHexMotor";
            break;
        case "rs40":
            motor = "REVSpurMotor";
            modifier = "GR_40";
            break;
        case "rs20":
            motor = "REVSpurMotor";
            modifier = "GR_20";
            break;
        case "hdhex":
            motor = "HDHex";
            modifier = "(//TODO"+
            "\n).getMotorSpecs()";
            break;
    }
    return motor + (modifier ? "." + modifier : "");
}
String.prototype.defaultValue = function(defaultValue) {
    if (this.trim() === "") {
        return defaultValue;
    }
    return this;
};
function generateData() {
    const spoolDiameter = document.getElementById("spoolDiameter").value.defaultValue("1.0");
    const testingAngles = [
        document.getElementById("ta1").value.defaultValue("0"),
        document.getElementById("ta2").value.defaultValue("90"),
    ].map((item) => item.trim());
    const armName = document.getElementById("armName").value.trim().defaultValue("pivot");
    const armType = document.getElementById("armType").value.trim();
    const slideRanges = [
        document.getElementById("slideRange1").value.defaultValue("0"),
        document.getElementById("slideRange2").value.defaultValue("700"),
    ].map((item) => item.trim());
    const slideName = document.getElementById("slideName").value.trim().defaultValue("slide");
    const slideType = document.getElementById("slideType").value.trim();

    let slideAdditive = "";
    let armAdditive = "";
    if (slideType === "hdhex") {
        slideAdditive = "new"
    }
    if (armType === "hdhex") {
        armAdditive = "new"
    }
    let generatedData = ""; // Initialize generatedData as an empty string
    generatedData = `
import com.dacodingbeast.pidtuners.Constants.GravityModelConstants;
import com.dacodingbeast.pidtuners.Constants.PivotSystemConstants;
import com.dacodingbeast.pidtuners.Constants.SlideSystemConstants;
import com.dacodingbeast.pidtuners.HardwareSetup.ArmMotor;
import com.dacodingbeast.pidtuners.HardwareSetup.Hardware;
import com.dacodingbeast.pidtuners.HardwareSetup.SlideMotor;
import com.dacodingbeast.pidtuners.Opmodes.FindPID;
import com.dacodingbeast.pidtuners.Opmodes.FrictionTest;
import com.dacodingbeast.pidtuners.Opmodes.GravityTest;
import com.dacodingbeast.pidtuners.utilities.DataLogger;
import com.dacodingbeast.pidtuners.Opmodes.PSODirectionDebugger;
import com.dacodingbeast.pidtuners.Opmodes.SampleOpMode;
import com.dacodingbeast.pidtuners.Simulators.AngleRange;
import com.dacodingbeast.pidtuners.Simulators.SlideRange;
import com.qualcomm.robotcore.eventloop.opmode.OpMode;
import com.qualcomm.robotcore.eventloop.opmode.OpModeManager;
import com.qualcomm.robotcore.eventloop.opmode.OpModeRegistrar;
import com.qualcomm.robotcore.hardware.DcMotorSimple;

import org.firstinspires.ftc.robotcore.internal.opmode.OpModeMeta;

import CommonUtilities.PIDParams;

public final class TuningOpModes {
    static AngleRange angleRange = AngleRange.fromDegrees(${testingAngles[0]
        }, ${testingAngles[1]});
    static double frictionRPMA = 0.0;
    static PIDParams pidParams = new PIDParams(0.0, 0.0, 0.0, 0.0);
    static PivotSystemConstants pivotSystemConstants = new PivotSystemConstants(0.0, frictionRPMA, new GravityModelConstants(0.0, 0.0, 0.0));
    public static ArmMotor armMotor = new ArmMotor.Builder("${armName}", DcMotorSimple.Direction.FORWARD,${armAdditive} Hardware.${findMotor(
            armType
        )}, pivotSystemConstants, angleRange.asArrayList()).pidParams(pidParams).build(); 


    
    public static Double spoolDiameter = ${spoolDiameter}; // inches
    static SlideRange slideRange = SlideRange.fromTicks(${slideRanges[0]}, ${slideRanges[1]});
    static double frictionRPMS = 0.0;
    static SlideSystemConstants slideSystemConstants = new SlideSystemConstants(0.0, frictionRPMS);
    static PIDParams pidParamsS = new PIDParams(0.0, 0.0, 0.0, 0.0);
    public static SlideMotor slideMotor = new SlideMotor.Builder("${slideName}", DcMotorSimple.Direction.FORWARD,${slideAdditive} Hardware.${findMotor(
            slideType
        )}, slideSystemConstants,spoolDiameter,slideRange.asArrayList()).pidParams(pidParamsS).build();

    private TuningOpModes() {
    }

    private static OpModeMeta metaForClass(Class<? extends OpMode> cls, String tag) {
        return new OpModeMeta.Builder()
                .setName(cls.getSimpleName() + tag)
                .setGroup("PIDTuners")
                .setFlavor(OpModeMeta.Flavor.TELEOP)
                .build();
    }

    @OpModeRegistrar
    public static void register(OpModeManager manager) {
         boolean armEN = false;
        boolean slidesEN = false;
        if (armEN||slidesEN) {
            manager.register(metaForClass(PSODirectionDebugger.class, ""), new PSODirectionDebugger(slideMotor, armMotor));
            DataLogger.getInstance().initLogger(armEN,slidesEN);
        }
        if (armEN) {
            manager.register(
                    metaForClass(FrictionTest.class, "Arm"), new FrictionTest(armMotor,angleRange,slideRange)
            );
            manager.register(
                    metaForClass(SampleOpMode.class, "Arm"), new SampleOpMode(armMotor)
            );
            manager.register(
                    metaForClass(FindPID.class, "Arm"), new FindPID(armMotor)
            );
            manager.register(
                    metaForClass(GravityTest.class, "Arm"), new GravityTest(armMotor,angleRange)
            );
        }
        if (slidesEN){
            manager.register(
                    metaForClass(FrictionTest.class,"Slide"), new FrictionTest(slideMotor,angleRange,slideRange)
            );
            manager.register(
                    metaForClass(SampleOpMode.class,"Slide"), new SampleOpMode(slideMotor)
            );
            manager.register(
                    metaForClass(FindPID.class,"Slide"),new FindPID(slideMotor)
            );
        }
    }

}`;

    console.log("Generated Data:", generatedData);

    // Display the generated data
    document.getElementById("outputText").innerText = generatedData;

    // Create a Blob from the generated data
    const blob = new Blob([generatedData], { type: "text/plain" });

    // Create a link element
    const link = document.createElement("a");

    // Set the download attribute with a filename
    link.download = "PIDTuningOpModes.java";

    // Create a URL for the Blob and set it as the href attribute
    link.href = window.URL.createObjectURL(blob);

    // Append the link to the body
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
}
