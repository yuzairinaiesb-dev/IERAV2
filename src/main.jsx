import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { jsPDF } from "jspdf";
import {
  Camera,
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Activity,
  CheckCircle2,
  ChevronRight,
  Download,
  RotateCcw,
  UserRound,
  ClipboardCheck,
  Image as ImageIcon,
} from "lucide-react";
import "./styles.css";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Button({ children, className = "", variant = "default", size = "default", disabled, ...props }) {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
    ghost: "text-slate-700 hover:bg-slate-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs",
  };
  return <button className={cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className)} disabled={disabled} {...props}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={cn("rounded-xl border bg-white text-slate-900 shadow-sm", className)}>{children}</div>;
}

function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

function Input({ className = "", ...props }) {
  return <input className={cn("flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400", className)} {...props} />;
}

function Label({ children, className = "", ...props }) {
  return <label className={cn("text-sm font-medium", className)} {...props}>{children}</label>;
}

function Textarea({ className = "", ...props }) {
  return <textarea className={cn("flex min-h-[90px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400", className)} {...props} />;
}

function Badge({ children, className = "", variant = "default" }) {
  const variants = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900",
    outline: "border border-slate-300 bg-white text-slate-900",
    destructive: "bg-red-600 text-white",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant] || variants.default, className)}>{children}</span>;
}

function Progress({ value = 0 }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-slate-900 transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>;
}

const awkwardItems = [
  { id: "shoulder_1", body: "Shoulders", factor: "Hand above head OR elbow above shoulder", threshold: "More than 2 hours per day", autoKey: "elbowAboveShoulder" },
  { id: "shoulder_2", body: "Shoulders", factor: "Shoulder raised", threshold: "More than 2 hours per day", autoKey: "shoulderRaised" },
  { id: "shoulder_3", body: "Shoulders", factor: "Repetitively raising hand above head OR elbow above shoulder more than once per minute", threshold: "More than 2 hours per day", autoKey: "repetitiveOverhead" },
  { id: "head_1", body: "Head", factor: "Head bent downwards more than 45 degrees", threshold: "More than 2 hours per day", autoKey: "headBentDown" },
  { id: "head_2", body: "Head", factor: "Head bent backwards", threshold: "More than 2 hours per day", autoKey: "headBack" },
  { id: "head_3", body: "Head", factor: "Head bent sideways", threshold: "More than 2 hours per day", autoKey: "headSide" },
  { id: "back_1", body: "Back", factor: "Back bent forward more than 30 degrees OR bent sideways", threshold: "More than 2 hours per day", autoKey: "backBent" },
  { id: "back_2", body: "Back", factor: "Body twisted", threshold: "More than 2 hours per day", autoKey: "bodyTwist" },
  { id: "wrist_1", body: "Hand / Elbow / Wrist", factor: "Wrist flexion, extension, or radial deviation more than 15 degrees", threshold: "More than 2 hours per day", autoKey: "wristDeviation" },
  { id: "arm_1", body: "Hand / Elbow / Wrist", factor: "Arm abduction sideways", threshold: "More than 4 hours per day", autoKey: "armAbduction" },
  { id: "arm_2", body: "Hand / Elbow / Wrist", factor: "Arm forward more than 45 degrees OR backward more than 20 degrees", threshold: "More than 2 hours per day", autoKey: "armForward" },
  { id: "leg_1", body: "Leg / Knees", factor: "Squat position", threshold: "More than 2 hours total per day", autoKey: "squat" },
  { id: "leg_2", body: "Leg / Knees", factor: "Kneeling position", threshold: "More than 2 hours per day", autoKey: "kneeling" },
];

const staticItems = [
  { id: "static_1", factor: "Static awkward position as listed in the awkward posture table", threshold: "Duration as per awkward posture table" },
  { id: "static_2", factor: "Standing position with minimal leg movement", threshold: "More than 2 hours continuously" },
  { id: "static_3", factor: "Static seated position with minimal movement", threshold: "More than 30 minutes continuously" },
];

const repetitionItems = [
  "Repetitive sequence of movement more than twice per minute",
  "Intensive use of fingers, hands, wrist, or intensive data entry",
  "Repetitive shoulder/arm movement with pauses OR continuous shoulder/arm movement",
  "Using heel/base of palm as a hammer more than once per minute",
  "Using knee as a hammer more than once per minute",
];

const vibrationItems = [
  "Power tools without PPE more than 50 minutes in an hour",
  "Power tools with PPE more than 5 hours in 8-hour shift",
  "Whole body vibration more than 5 hours in 8-hour shift",
  "Whole body vibration with complaint of excessive body shaking more than 3 hours in 8-hour shift",
];

const environmentItems = ["Inadequate lighting", "Extreme temperature", "Inadequate air ventilation / poor IAQ", "Noise exposure above PEL", "Annoying noise exposure more than 8 hours"];
const bodyPainParts = ["Neck", "Shoulder", "Upper back", "Lower back", "Upper arm", "Elbow", "Lower arm", "Hand/Wrist", "Thigh", "Knee", "Lower leg", "Ankle/Foot"];

let poseLandmarkerInstance = null;

async function getPoseLandmarker() {
  if (poseLandmarkerInstance) return poseLandmarkerInstance;

  const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
  );

  poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numPoses: 1,
  });

  return poseLandmarkerInstance;
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    confidence: Math.min(a.confidence || 0, b.confidence || 0),
  };
}

function toPoint(landmark) {
  return {
    x: landmark.x * 100,
    y: landmark.y * 100,
    z: landmark.z || 0,
    confidence: landmark.visibility ?? landmark.presence ?? 0.8,
  };
}

function angleBetweenPoints(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.abs(Math.atan2(dx, dy) * 180 / Math.PI);
}

function angleAtPoint(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magA = Math.hypot(ab.x, ab.y);
  const magC = Math.hypot(cb.x, cb.y);
  if (!magA || !magC) return 0;
  return Math.round(Math.acos(Math.max(-1, Math.min(1, dot / (magA * magC)))) * 180 / Math.PI);
}

function averageConfidence(points) {
  const values = Object.values(points).map(p => p.confidence || 0).filter(v => v > 0);
  if (!values.length) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100);
}

function createFallbackPose() {
  return {
    confidence: 0,
    viewQuality: "Unable to Detect",
    landmarks: null,
    angles: {
      headBentDownAngle: 0,
      backForwardBendAngle: 0,
      wristDeviationAngle: 0,
      armForwardAngle: 0,
      bodyTwistAngle: 0,
    },
    flags: {},
    limitations: ["No reliable human pose landmarks were detected. Please use a clearer full-body side or front view photo."],
  };
}

async function analyzePoseFromImage(photo) {
  const image = await loadImageElement(photo);
  const landmarker = await getPoseLandmarker();
  const result = landmarker.detect(image);
  const raw = result.landmarks?.[0];

  if (!raw) return createFallbackPose();

  const points = {
    head: toPoint(raw[0]),
    leftShoulder: toPoint(raw[11]),
    rightShoulder: toPoint(raw[12]),
    leftElbow: toPoint(raw[13]),
    rightElbow: toPoint(raw[14]),
    leftWrist: toPoint(raw[15]),
    rightWrist: toPoint(raw[16]),
    leftHip: toPoint(raw[23]),
    rightHip: toPoint(raw[24]),
    leftKnee: toPoint(raw[25]),
    rightKnee: toPoint(raw[26]),
    leftAnkle: toPoint(raw[27]),
    rightAnkle: toPoint(raw[28]),
  };

  points.neck = midpoint(points.leftShoulder, points.rightShoulder);
  points.midHip = midpoint(points.leftHip, points.rightHip);

  const shoulderMid = points.neck;
  const hipMid = points.midHip;
  const headBentDownAngle = Math.round(angleBetweenPoints(points.head, shoulderMid));
  const backForwardBendAngle = Math.round(angleBetweenPoints(shoulderMid, hipMid));

  const leftArmElevation = Math.round(angleBetweenPoints(points.leftShoulder, points.leftElbow));
  const rightArmElevation = Math.round(angleBetweenPoints(points.rightShoulder, points.rightElbow));
  const armForwardAngle = Math.max(leftArmElevation, rightArmElevation);

  const leftElbowAngle = angleAtPoint(points.leftShoulder, points.leftElbow, points.leftWrist);
  const rightElbowAngle = angleAtPoint(points.rightShoulder, points.rightElbow, points.rightWrist);
  const leftKneeAngle = angleAtPoint(points.leftHip, points.leftKnee, points.leftAnkle);
  const rightKneeAngle = angleAtPoint(points.rightHip, points.rightKnee, points.rightAnkle);
  const minKneeAngle = Math.min(leftKneeAngle, rightKneeAngle);

  const shoulderSlope = Math.abs(points.leftShoulder.y - points.rightShoulder.y);
  const hipSlope = Math.abs(points.leftHip.y - points.rightHip.y);
  const bodyTwistAngle = Math.round(Math.min(45, Math.abs(shoulderSlope - hipSlope) * 2.5));

  const wristDeviationAngle = Math.round(Math.max(
    Math.abs(leftElbowAngle - 170),
    Math.abs(rightElbowAngle - 170)
  ));

  const confidence = averageConfidence(points);
  const lowConfidenceParts = Object.entries(points)
    .filter(([_, p]) => (p.confidence || 0) < 0.45)
    .map(([name]) => name.replace(/([A-Z])/g, " $1").toLowerCase());

  const handAboveHead = points.leftWrist.y < points.head.y || points.rightWrist.y < points.head.y;
  const elbowAboveShoulder = points.leftElbow.y < points.leftShoulder.y || points.rightElbow.y < points.rightShoulder.y;
  const shoulderRaised = shoulderSlope > 5;

  return {
    confidence,
    viewQuality: confidence >= 70 && lowConfidenceParts.length < 4 ? "Acceptable" : "Needs Review",
    landmarks: points,
    angles: {
      headBentDownAngle,
      backForwardBendAngle,
      wristDeviationAngle,
      armForwardAngle,
      bodyTwistAngle,
    },
    flags: {
      elbowAboveShoulder: handAboveHead || elbowAboveShoulder,
      shoulderRaised,
      repetitiveOverhead: false,
      headBentDown: headBentDownAngle > 45,
      headBack: false,
      headSide: Math.abs(points.head.x - shoulderMid.x) > 8,
      backBent: backForwardBendAngle > 30,
      bodyTwist: bodyTwistAngle > 25,
      wristDeviation: wristDeviationAngle > 15,
      armAbduction: armForwardAngle > 45,
      armForward: armForwardAngle > 45,
      squat: minKneeAngle < 105,
      kneeling: minKneeAngle < 85 && (points.leftKnee.y > 72 || points.rightKnee.y > 72),
    },
    limitations: lowConfidenceParts.length ? [`Low confidence landmarks: ${lowConfidenceParts.slice(0, 5).join(", ")}`] : [],
  };
}

function scoreLevel(triggeredCategories, critical) {
  if (critical) return { level: "Critical", color: "bg-red-600", text: "Immediate intervention recommended" };
  if (triggeredCategories >= 3) return { level: "High", color: "bg-orange-500", text: "Advanced ERA required" };
  if (triggeredCategories >= 1) return { level: "Moderate", color: "bg-yellow-500", text: "Corrective action recommended" };
  return { level: "Low", color: "bg-green-600", text: "No advanced threshold triggered" };
}

function IERAPostureRiskAnalyzer() {
  const [step, setStep] = useState(0);
  const [photo, setPhoto] = useState(null);
  const [pose, setPose] = useState(null);
  const [form, setForm] = useState({ assessor: "", department: "", task: "", description: "", exposureHours: "3", repetition: "2", loadWeight: "", gender: "Not specified" });
  const [manual, setManual] = useState({});
  const [staticChecks, setStaticChecks] = useState({ static_1: true });
  const [forceful, setForceful] = useState(false);
  const [repeatChecks, setRepeatChecks] = useState({});
  const [vibrationChecks, setVibrationChecks] = useState({});
  const [envChecks, setEnvChecks] = useState({});
  const [pain, setPain] = useState({ hasPain: false, parts: [] });
  const [pdfStatus, setPdfStatus] = useState("");
  const [aiStatus, setAiStatus] = useState("");

  const aiFlags = pose?.flags || {};
  const resolvedAwkward = useMemo(() => {
    const result = {};
    awkwardItems.forEach((item) => {
      result[item.id] = manual[item.id] ?? Boolean(aiFlags[item.autoKey]);
    });
    return result;
  }, [manual, aiFlags]);

  const result = useMemo(() => {
    const awkwardScore = Object.values(resolvedAwkward).filter(Boolean).length;
    const staticScore = Object.values(staticChecks).filter(Boolean).length;
    const repetitionScore = Object.values(repeatChecks).filter(Boolean).length;
    const vibrationScore = Object.values(vibrationChecks).filter(Boolean).length;
    const envScore = Object.values(envChecks).filter(Boolean).length;
    const advanced = {
      awkward: awkwardScore >= 6,
      static: staticScore >= 1,
      forceful,
      repetition: repetitionScore >= 1,
      vibration: vibrationScore >= 1,
      environment: envScore >= 1,
    };
    const triggeredCategories = Object.values(advanced).filter(Boolean).length;
    const critical = forceful && awkwardScore >= 6 && pain.hasPain;
    return { awkwardScore, staticScore, repetitionScore, vibrationScore, envScore, advanced, triggeredCategories, ...scoreLevel(triggeredCategories, critical) };
  }, [resolvedAwkward, staticChecks, repeatChecks, vibrationChecks, envChecks, forceful, pain]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setPose(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const runAI = async () => {
    if (!photo) return;
    setAiStatus("Loading AI pose model and detecting actual body landmarks...");
    setPose(null);
    setStep(3);

    try {
      const generated = await analyzePoseFromImage(photo);
      setPose(generated);
      const autoStatic = { ...staticChecks };
      autoStatic.static_1 = Object.values(generated.flags || {}).some(Boolean);
      setStaticChecks(autoStatic);
      setAiStatus(generated.confidence > 0 ? "AI posture detection completed using real body landmarks." : "AI could not detect a reliable human pose.");
    } catch (error) {
      console.error("AI pose detection error", error);
      setPose(createFallbackPose());
      setAiStatus("AI pose detection failed. Please try a clearer photo or check internet access for the pose model.");
    }
  };

  const toggle = (setter, key) => setter(prev => ({ ...prev, [key]: !prev[key] }));

  const downloadReport = () => {
    setPdfStatus("Generating PDF...");
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const maxWidth = pageWidth - margin * 2;
      let y = 16;

      const checkPage = (extra = 10) => {
        if (y + extra > pageHeight - 16) {
          doc.addPage();
          y = 16;
        }
      };
      const addSection = (text) => {
        checkPage(12);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(String(text), margin, y);
        y += 7;
      };
      const addText = (label, value = "") => {
        checkPage(10);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`${label}:`, margin, y);
        doc.setFont("helvetica", "normal");
        const cleanValue = String(value || "-").replace(/[•–—]/g, "-");
        const lines = doc.splitTextToSize(cleanValue, maxWidth - 45);
        doc.text(lines, margin + 45, y);
        y += Math.max(6, lines.length * 5);
      };
      const addBullet = (text) => {
        checkPage(9);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const cleanText = String(text).replace(/[•–—]/g, "-");
        const lines = doc.splitTextToSize(`- ${cleanText}`, maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 5 + 1;
      };

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 34, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("IERA Posture AI Report", margin, 15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Photo-Based Initial Ergonomic Risk Screening", margin, 24);
      doc.setTextColor(0, 0, 0);
      y = 45;

      addSection("1. Assessment Information");
      addText("Assessor", form.assessor);
      addText("Department", form.department);
      addText("Task", form.task);
      addText("Task Description", form.description);
      addText("Exposure Hours / Day", form.exposureHours);
      addText("Repetition / Minute", form.repetition);
      addText("Load Weight", form.loadWeight ? `${form.loadWeight} kg` : "Not specified");
      if (photo) {
        checkPage(72);
        addSection("2. Photo Evidence");
        try {
          const imageFormat = String(photo).startsWith("data:image/png") ? "PNG" : "JPEG";
          doc.addImage(photo, imageFormat, margin, y, maxWidth, 65, undefined, "FAST");
          y += 72;
        } catch (error) {
          addText("Photo", "Uploaded photo could not be embedded in the PDF, but it was used in the assessment screen.");
        }
      }
      addSection("3. AI Posture Analysis");
      addText("AI Confidence", pose ? `${pose.confidence}%` : "Not analyzed");
      addText("Photo Quality", pose?.viewQuality || "Not analyzed");
      if (pose) {
        addText("Head Bend", `${pose.angles.headBentDownAngle} deg / IERA threshold: >45 deg`);
        addText("Back Forward Bend", `${pose.angles.backForwardBendAngle} deg / IERA threshold: >30 deg`);
        addText("Wrist Deviation", `${pose.angles.wristDeviationAngle} deg / IERA threshold: >15 deg`);
        addText("Arm Forward", `${pose.angles.armForwardAngle} deg / IERA threshold: >45 deg`);
        addText("Body Twist", `${pose.angles.bodyTwistAngle} deg / assessor review required`);
      }
      addSection("4. Initial ERA Summary");
      addText("Overall Severity", result.level);
      addText("Need Advanced ERA", result.triggeredCategories > 0 ? "Yes" : "No");
      addText("Awkward Posture", `${result.awkwardScore}/13 - ${result.advanced.awkward ? "Advanced ERA threshold reached" : "Below threshold"}`);
      addText("Static & Sustained Posture", `${result.staticScore}/3 - ${result.advanced.static ? "Advanced ERA threshold reached" : "Below threshold"}`);
      addText("Forceful Exertion", result.advanced.forceful ? "Exceeded limit / Advanced ERA required" : "Below threshold");
      addText("Repetitive Motion", `${result.repetitionScore}/5 - ${result.advanced.repetition ? "Advanced ERA threshold reached" : "Below threshold"}`);
      addText("Vibration", `${result.vibrationScore}/4 - ${result.advanced.vibration ? "Advanced ERA threshold reached" : "Below threshold"}`);
      addText("Environmental Factors", `${result.envScore}/5 - ${result.advanced.environment ? "Advanced ERA threshold reached" : "Below threshold"}`);
      addSection("5. Awkward Posture Checklist Findings");
      awkwardItems.forEach((item) => {
        const checked = resolvedAwkward[item.id] ? "YES" : "NO";
        addBullet(`${checked} - ${item.body}: ${item.factor}. Threshold: ${item.threshold}.`);
      });
      addSection("6. Pain / Discomfort");
      addText("Pain Reported", pain.hasPain ? "Yes" : "No");
      addText("Affected Body Parts", pain.parts.length ? pain.parts.join(", ") : "None selected");
      addSection("7. AI Recommendations");
      if (result.awkwardScore > 0) addBullet("Redesign work height and position work closer to the body to reduce awkward posture.");
      if (resolvedAwkward.back_1) addBullet("Reduce forward bending by using adjustable bench height, lifting aid, or improved access.");
      if (resolvedAwkward.head_1) addBullet("Raise the workpiece or visual target to reduce neck flexion.");
      if (resolvedAwkward.wrist_1) addBullet("Redesign tool handle or work orientation to maintain neutral wrist posture.");
      if (result.advanced.static) addBullet("Introduce micro-breaks, task rotation, or sit-stand variation.");
      if (result.triggeredCategories > 0) addBullet("Conduct Advanced ERA and verify findings with a competent assessor.");
      if (result.triggeredCategories === 0) addBullet("Continue monitoring posture and exposure duration during normal operations.");
      addSection("8. Disclaimer");
      addBullet("AI analysis is based on visible posture from uploaded images and user-provided task information. Camera angle, image quality, hidden body parts, and incomplete exposure data may affect results. This tool supports initial ergonomic screening only and should be verified by a competent assessor before workplace decisions are made.");

      checkPage(35);
      y += 6;
      doc.line(margin, y, margin + 70, y);
      doc.line(margin + 100, y, margin + 170, y);
      y += 5;
      doc.setFontSize(8);
      doc.text("Assessor Signature", margin, y);
      doc.text("Supervisor Signature", margin + 100, y);

      const safeTask = (form.task || "assessment").replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const filename = `IERA_Posture_AI_Report_${safeTask}.pdf`;
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1500);
      setPdfStatus(`PDF generated: ${filename}`);
    } catch (error) {
      console.error("PDF generation error", error);
      setPdfStatus("PDF generation failed. Please try without photo or use browser Print to PDF.");
    }
  };

  const steps = ["Start", "Info", "Photo", "AI", "Checklist", "Result"];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto min-h-screen max-w-md bg-white shadow-xl">
        <header className="sticky top-0 z-10 border-b bg-white/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight">IERA Posture AI</h1>
              <p className="text-xs text-slate-500">Photo-based ergonomic screening</p>
            </div>
            <Badge variant="secondary" className="rounded-full">MVP</Badge>
          </div>
          <div className="mt-3">
            <Progress value={(step / (steps.length - 1)) * 100} />
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              {steps.map((s, i) => <span key={s} className={i === step ? "font-bold text-slate-900" : ""}>{s}</span>)}
            </div>
          </div>
        </header>

        <main className="space-y-4 p-4 pb-28">
          {step === 0 && (
            <section className="space-y-4 pt-4">
              <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
                <ShieldCheck className="mb-4 h-10 w-10" />
                <h2 className="text-2xl font-bold">AI Ergonomic Assessor Assistant</h2>
                <p className="mt-3 text-sm text-slate-200">Upload a posture photo, let AI estimate key body angles, map findings to the IERA checklist, and produce a downloadable report.</p>
              </div>
              <Card className="rounded-3xl">
                <CardContent className="space-y-3 p-4">
                  <div className="flex gap-3"><Camera className="h-5 w-5" /><p className="text-sm">Photo capture and posture evidence</p></div>
                  <div className="flex gap-3"><Activity className="h-5 w-5" /><p className="text-sm">AI angle detection and checklist mapping</p></div>
                  <div className="flex gap-3"><FileText className="h-5 w-5" /><p className="text-sm">PDF-style report generation</p></div>
                </CardContent>
              </Card>
              <p className="text-xs text-slate-500">Disclaimer: This tool supports initial ergonomic screening only. Results should be verified by a competent assessor before workplace decisions are made.</p>
              <Button className="h-12 w-full rounded-2xl" onClick={() => setStep(1)}>Start New Assessment <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-bold"><UserRound className="h-5 w-5" /> Assessment Information</h2>
              {[
                ["assessor", "Assessor Name"], ["department", "Department"], ["task", "Task Name"], ["exposureHours", "Estimated Exposure Hours / Day"], ["repetition", "Repetition Frequency / Minute"], ["loadWeight", "Load Weight if Manual Handling (kg)"]
              ].map(([key, label]) => (
                <div key={key} className="space-y-1"><Label>{label}</Label><Input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={label} /></div>
              ))}
              <div className="space-y-1"><Label>Task Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the activity, workstation, tools, and work cycle" /></div>
              <Button className="h-12 w-full rounded-2xl" onClick={() => setStep(2)}>Continue to Photo</Button>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-bold"><ImageIcon className="h-5 w-5" /> Upload Posture Photo</h2>
              <Card className="rounded-3xl border-dashed">
                <CardContent className="space-y-4 p-4 text-center">
                  {photo ? <PoseImage photo={photo} pose={null} /> : <div className="py-12 text-slate-500"><Upload className="mx-auto mb-3 h-12 w-12" /><p>Capture full body from side or front view</p></div>}
                  <input id="posture-photo-gallery" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                  <input id="posture-photo-camera" type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Label htmlFor="posture-photo-gallery" className="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm">
                      <Upload className="mr-2 h-4 w-4" />
                      {photo ? "Choose Another Photo" : "Choose from Gallery"}
                    </Label>
                    <Label htmlFor="posture-photo-camera" className="flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm">
                      <Camera className="mr-2 h-4 w-4" />
                      Take New Photo
                    </Label>
                  </div>
                  <p className="text-xs text-slate-500">Use Gallery to select an existing picture, or Camera to capture a new workplace posture photo.</p>
                </CardContent>
              </Card>
              <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">For best AI evaluation, ensure head, shoulders, elbows, wrists, back, knees and ankles are visible.</div>
              <Button disabled={!photo} className="h-12 w-full rounded-2xl" onClick={runAI}>Analyze with Real AI Pose Detection</Button>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-bold"><Activity className="h-5 w-5" /> AI Posture Evaluation</h2>
              {!pose && (
                <Card className="rounded-3xl">
                  <CardContent className="space-y-3 p-6 text-center">
                    <Activity className="mx-auto h-10 w-10 animate-pulse" />
                    <h3 className="font-bold">Detecting actual human posture...</h3>
                    <p className="text-sm text-slate-500">{aiStatus || "Please wait while the AI model analyzes the uploaded image."}</p>
                  </CardContent>
                </Card>
              )}
              {pose && <PoseImage photo={photo} pose={pose} />}
              {pose && <Card className="rounded-3xl">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-500">AI Confidence</span><Badge>{pose.confidence}%</Badge></div>
                  <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Photo Quality</span><Badge variant={pose.viewQuality === "Acceptable" ? "default" : "destructive"}>{pose.viewQuality}</Badge></div>
                </CardContent>
              </Card>}
              {aiStatus && <div className="rounded-2xl bg-blue-50 p-3 text-xs text-blue-900">{aiStatus}</div>}
              {pose?.limitations?.length > 0 && <div className="rounded-2xl bg-yellow-50 p-3 text-xs text-yellow-900">{pose.limitations.join(" ")}</div>}
              {pose && <div className="grid grid-cols-2 gap-3">
                {[
                  ["Head bend", pose.angles.headBentDownAngle, "45°"],
                  ["Back bend", pose.angles.backForwardBendAngle, "30°"],
                  ["Wrist deviation", pose.angles.wristDeviationAngle, "15°"],
                  ["Arm forward", pose.angles.armForwardAngle, "45°"],
                  ["Body twist", pose.angles.bodyTwistAngle, "Review"]
                ].map(([name, value, threshold]) => (
                  <Card key={name} className="rounded-3xl"><CardContent className="p-4"><p className="text-xs text-slate-500">{name}</p><p className="text-2xl font-bold">{value}°</p><p className="text-xs">Threshold: {threshold}</p></CardContent></Card>
                ))}
              </div>}
              {pose && <Card className="rounded-3xl bg-slate-50">
                <CardContent className="space-y-2 p-4">
                  <h3 className="font-bold">AI Findings</h3>
                  {awkwardItems.filter(i => aiFlags[i.autoKey]).slice(0, 6).map(i => <p key={i.id} className="flex gap-2 text-sm"><AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" /> {i.factor}</p>)}
                  {!awkwardItems.some(i => aiFlags[i.autoKey]) && <p className="text-sm">No major awkward posture was detected from the visible body landmarks.</p>}
                </CardContent>
              </Card>}
              {pose && <Button className="h-12 w-full rounded-2xl" onClick={() => setStep(4)}>Review IERA Checklist</Button>}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-bold"><ClipboardCheck className="h-5 w-5" /> IERA AI Checklist</h2>
              <ChecklistCard title="A. Awkward Posture" score={`${result.awkwardScore}/13`} threshold="Advanced ERA if ≥ 6">
                {awkwardItems.map(item => (
                  <CheckRow key={item.id} label={item.factor} sub={`${item.body} • ${item.threshold}`} checked={resolvedAwkward[item.id]} source={aiFlags[item.autoKey] ? "AI" : "Assessor"} onClick={() => setManual(prev => ({ ...prev, [item.id]: !resolvedAwkward[item.id] }))} />
                ))}
              </ChecklistCard>
              <ChecklistCard title="B. Static & Sustained Posture" score={`${result.staticScore}/3`} threshold="Advanced ERA if ≥ 1">
                {staticItems.map(item => <CheckRow key={item.id} label={item.factor} sub={item.threshold} checked={!!staticChecks[item.id]} onClick={() => toggle(setStaticChecks, item.id)} />)}
              </ChecklistCard>
              <ChecklistCard title="C. Forceful Exertion" score={forceful ? "Exceeded" : "Not exceeded"} threshold="Advanced ERA if exceeded">
                <CheckRow label="Manual handling exceeds recommended limit" sub="Based on user load, height, repetition and twist input" checked={forceful} onClick={() => setForceful(!forceful)} />
              </ChecklistCard>
              <ChecklistCard title="D. Repetitive Motion" score={`${result.repetitionScore}/5`} threshold="Advanced ERA if ≥ 1">
                {repetitionItems.map((label, idx) => <CheckRow key={label} label={label} checked={!!repeatChecks[idx]} onClick={() => toggle(setRepeatChecks, idx)} />)}
              </ChecklistCard>
              <ChecklistCard title="E. Vibration" score={`${result.vibrationScore}/4`} threshold="Advanced ERA if ≥ 1">
                {vibrationItems.map((label, idx) => <CheckRow key={label} label={label} checked={!!vibrationChecks[idx]} onClick={() => toggle(setVibrationChecks, idx)} />)}
              </ChecklistCard>
              <ChecklistCard title="F. Environmental Factors" score={`${result.envScore}/5`} threshold="Advanced ERA if any factor is triggered">
                {environmentItems.map((label, idx) => <CheckRow key={label} label={label} checked={!!envChecks[idx]} onClick={() => toggle(setEnvChecks, idx)} />)}
              </ChecklistCard>
              <ChecklistCard title="Pain / Discomfort" score={pain.hasPain ? "Yes" : "No"} threshold="MSD assessment reference">
                <CheckRow label="Worker reports pain or discomfort" checked={pain.hasPain} onClick={() => setPain({ ...pain, hasPain: !pain.hasPain })} />
                {pain.hasPain && <div className="grid grid-cols-2 gap-2 pt-2">{bodyPainParts.map(part => <Button key={part} variant={pain.parts.includes(part) ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setPain(p => ({ ...p, parts: p.parts.includes(part) ? p.parts.filter(x => x !== part) : [...p.parts, part] }))}>{part}</Button>)}</div>}
              </ChecklistCard>
              <Button className="h-12 w-full rounded-2xl" onClick={() => setStep(5)}>View Result</Button>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-4">
              <div id="report-content" className="space-y-4">
                <div className={`rounded-3xl ${result.color} p-6 text-white shadow-lg`}>
                  <p className="text-sm opacity-90">Overall Ergonomic Severity</p>
                  <h2 className="text-4xl font-bold">{result.level}</h2>
                  <p className="mt-2">{result.text}</p>
                  <p className="mt-3 text-sm">Need Advanced ERA: <b>{result.triggeredCategories > 0 ? "Yes" : "No"}</b></p>
                </div>
                {photo && <PoseImage photo={photo} pose={pose} showLegend={true} />}
                <Card className="rounded-3xl"><CardContent className="space-y-3 p-4">
                  <h3 className="font-bold">Assessment Summary</h3>
                  <SummaryLine label="Assessor" value={form.assessor || "-"} />
                  <SummaryLine label="Department" value={form.department || "-"} />
                  <SummaryLine label="Task" value={form.task || "-"} />
                  <SummaryLine label="AI Confidence" value={pose ? `${pose.confidence}%` : "-"} />
                </CardContent></Card>
                <Card className="rounded-3xl"><CardContent className="space-y-3 p-4">
                  <h3 className="font-bold">IERA Scores</h3>
                  <SummaryLine label="Awkward posture" value={`${result.awkwardScore}/13 • ${result.advanced.awkward ? "Advanced ERA" : "Below threshold"}`} />
                  <SummaryLine label="Static posture" value={`${result.staticScore}/3 • ${result.advanced.static ? "Advanced ERA" : "Below threshold"}`} />
                  <SummaryLine label="Forceful exertion" value={result.advanced.forceful ? "Advanced ERA" : "Below threshold"} />
                  <SummaryLine label="Repetition" value={`${result.repetitionScore}/5 • ${result.advanced.repetition ? "Advanced ERA" : "Below threshold"}`} />
                  <SummaryLine label="Vibration" value={`${result.vibrationScore}/4 • ${result.advanced.vibration ? "Advanced ERA" : "Below threshold"}`} />
                  <SummaryLine label="Environment" value={`${result.envScore}/5 • ${result.advanced.environment ? "Advanced ERA" : "Below threshold"}`} />
                </CardContent></Card>
                <Card className="rounded-3xl"><CardContent className="space-y-2 p-4">
                  <h3 className="font-bold">AI Recommendations</h3>
                  {result.awkwardScore > 0 && <p className="text-sm">• Redesign work height and position work closer to the body to reduce awkward posture.</p>}
                  {resolvedAwkward.back_1 && <p className="text-sm">• Reduce forward bending by using adjustable bench height, lifting aid, or improved access.</p>}
                  {resolvedAwkward.head_1 && <p className="text-sm">• Raise the workpiece or visual target to reduce neck flexion.</p>}
                  {resolvedAwkward.wrist_1 && <p className="text-sm">• Redesign tool handle or work orientation to maintain neutral wrist posture.</p>}
                  {result.advanced.static && <p className="text-sm">• Introduce micro-breaks, task rotation, or sit-stand variation.</p>}
                  {result.triggeredCategories > 0 && <p className="text-sm font-semibold">• Conduct Advanced ERA and verify findings with a competent assessor.</p>}
                </CardContent></Card>
                <p className="text-xs text-slate-500">Disclaimer: AI analysis is based on visible posture from uploaded images and user-provided task information. Camera angle, image quality, hidden body parts, and incomplete exposure data may affect results.</p>
              </div>
              <Button className="h-12 w-full rounded-2xl" onClick={downloadReport}><Download className="mr-2 h-4 w-4" /> Download PDF Report</Button>
              {pdfStatus && <div className="rounded-2xl bg-slate-100 p-3 text-center text-xs text-slate-700">{pdfStatus}</div>}
              <Button variant="outline" className="h-12 w-full rounded-2xl" onClick={() => { setStep(0); setPhoto(null); setPose(null); }}><RotateCcw className="mr-2 h-4 w-4" /> New Assessment</Button>
            </section>
          )}
        </main>

        <nav className="fixed bottom-0 left-1/2 grid w-full max-w-md -translate-x-1/2 grid-cols-4 gap-2 border-t bg-white p-3">
          <Button variant="ghost" className="h-14 flex-col text-xs" onClick={() => setStep(0)}><ShieldCheck className="h-4 w-4" />Home</Button>
          <Button variant="ghost" className="h-14 flex-col text-xs" onClick={() => setStep(1)}><ClipboardCheck className="h-4 w-4" />Assess</Button>
          <Button variant="ghost" className="h-14 flex-col text-xs" onClick={() => setStep(2)}><Camera className="h-4 w-4" />Photo</Button>
          <Button variant="ghost" className="h-14 flex-col text-xs" onClick={() => setStep(5)}><FileText className="h-4 w-4" />Report</Button>
        </nav>
      </div>
    </div>
  );
}

function PoseImage({ photo, pose, showLegend = false }) {
  const points = pose?.landmarks;
  const lineGroups = points ? [
    { name: "Head / Neck", color: "#facc15", lines: [["head", "neck"]] },
    { name: "Backbone", color: "#ef4444", lines: [["neck", "leftHip"], ["neck", "rightHip"], ["leftHip", "rightHip"]] },
    { name: "Hands / Arms", color: "#3b82f6", lines: [["leftShoulder", "leftElbow"], ["leftElbow", "leftWrist"], ["rightShoulder", "rightElbow"], ["rightElbow", "rightWrist"], ["leftShoulder", "rightShoulder"]] },
    { name: "Legs", color: "#22c55e", lines: [["leftHip", "leftKnee"], ["leftKnee", "leftAnkle"], ["rightHip", "rightKnee"], ["rightKnee", "rightAnkle"]] },
  ] : [];

  const allLines = lineGroups.flatMap(group => group.lines.map(([a, b]) => ({ a, b, color: group.color })));

  return (
    <Card className="overflow-hidden rounded-3xl">
      <CardContent className="space-y-3 p-3">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900">
          <img src={photo} alt="Posture with AI skeleton overlay" className="w-full object-contain" />
          {points && (
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {allLines.map((line, idx) => {
                const p1 = points[line.a];
                const p2 = points[line.b];
                if (!p1 || !p2) return null;
                return <line key={idx} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={line.color} strokeWidth="1.4" strokeLinecap="round" opacity="0.95" />;
              })}
              {Object.entries(points).map(([name, point]) => (
                <circle key={name} cx={point.x} cy={point.y} r="1.4" fill="#ffffff" stroke="#0f172a" strokeWidth="0.45" />
              ))}
            </svg>
          )}
          {points && (
            <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">AI skeleton overlay</div>
          )}
        </div>
        {points && showLegend && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <LegendDot color="bg-yellow-400" label="Head / Neck" />
            <LegendDot color="bg-red-500" label="Backbone" />
            <LegendDot color="bg-blue-500" label="Hands / Arms" />
            <LegendDot color="bg-green-500" label="Legs" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LegendDot({ color, label }) {
  return <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2"><span className={`h-3 w-3 rounded-full ${color}`} /><span>{label}</span></div>;
}

function ChecklistCard({ title, score, threshold, children }) {
  return <Card className="rounded-3xl"><CardContent className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{title}</h3><p className="text-xs text-slate-500">{threshold}</p></div><Badge variant="secondary" className="rounded-full">{score}</Badge></div>{children}</CardContent></Card>;
}

function CheckRow({ label, sub, checked, onClick, source }) {
  return <button onClick={onClick} className="flex w-full items-start gap-3 rounded-2xl border p-3 text-left hover:bg-slate-50"><div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${checked ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"}`}>{checked ? <CheckCircle2 className="h-4 w-4" /> : null}</div><div className="flex-1"><p className="text-sm font-medium">{label}</p>{sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}{source && <p className="mt-1 text-[10px] text-blue-600">Suggested by: {source}</p>}</div><Badge variant={checked ? "default" : "outline"}>{checked ? "Yes" : "No"}</Badge></button>;
}

function SummaryLine({ label, value }) {
  return <div className="flex justify-between gap-4 border-b pb-2 text-sm last:border-0 last:pb-0"><span className="text-slate-500">{label}</span><span className="text-right font-semibold">{value}</span></div>;
}

createRoot(document.getElementById("root")).render(<IERAPostureRiskAnalyzer />);
