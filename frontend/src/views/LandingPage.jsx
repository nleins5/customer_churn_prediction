import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  MdArrowForward
} from "react-icons/md";
import Hls from "hls.js";

gsap.registerPlugin(ScrollTrigger);

function HlsVideo({ src, className, ...props }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls;

    const handleEnded = () => {
      if (props.loop) {
        video.currentTime = 0;
        video.play().catch((err) => {
          console.warn("HLS loop autoplay failed:", err);
        });
      }
    };

    video.addEventListener("ended", handleEnded);

    if (src && (src.endsWith(".m3u8") || src.includes("/hls/"))) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((err) => {
            console.warn("HLS autoplay failed:", err);
          });
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.load();
        video.play().catch((err) => {
          console.warn("Native HLS autoplay failed:", err);
        });
      }
    } else {
      video.src = src;
      video.load();
      video.play().catch((err) => {
        console.warn("Direct video autoplay failed:", err);
      });
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, props.loop]);

  return (
    <video
      ref={videoRef}
      className={className}
      {...props}
    />
  );
}


function CyberGrid() {
  const containerRef = useRef(null);
  const crosshairRef = useRef(null);
  const coordsRef = useRef(null);
  const radarRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Animate crosshair group using GSAP
      gsap.to(crosshairRef.current, {
        x: x,
        y: y,
        duration: 0.3,
        ease: "power2.out"
      });

      if (coordsRef.current) {
        coordsRef.current.textContent = `LAT: ${Math.round(y)} / LNG: ${Math.round(x)}`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Rotate radar indicator
    const radarTween = gsap.to(radarRef.current, {
      rotation: 360,
      transformOrigin: "center center",
      duration: 10,
      repeat: -1,
      ease: "none"
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      radarTween.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-40">
      {/* Tech Corner brackets */}
      <svg className="absolute top-8 left-8 w-8 h-8 pointer-events-none opacity-20" viewBox="0 0 24 24">
        <path d="M 24 0 H 0 V 24" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-8 left-8 w-8 h-8 pointer-events-none opacity-20" viewBox="0 0 24 24">
        <path d="M 24 24 H 0 V 0" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      <svg className="absolute top-8 right-8 w-8 h-8 pointer-events-none opacity-20" viewBox="0 0 24 24">
        <path d="M 0 0 H 24 V 24" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-8 right-8 w-8 h-8 pointer-events-none opacity-20" viewBox="0 0 24 24">
        <path d="M 0 24 H 24 V 0" fill="none" stroke="white" strokeWidth="1.5" />
      </svg>

      {/* Dynamic Grid Lines */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <pattern id="cyber-grid-pattern" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="rgba(255, 107, 74, 0.3)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cyber-grid-pattern)" />
        
        {/* Horizontal scanning laser */}
        <line 
          x1="0" 
          y1="0" 
          x2="100%" 
          y2="0" 
          stroke="rgba(255, 107, 74, 0.25)" 
          strokeWidth="2" 
          className="animate-laser-scan-y"
        />
        
        {/* Vertical scanning laser */}
        <line 
          x1="0" 
          y1="0" 
          x2="0" 
          y2="100%" 
          stroke="rgba(204, 88, 51, 0.15)" 
          strokeWidth="1.5" 
          className="animate-laser-scan-x"
        />

        {/* Mouse tracking crosshair with coordinates */}
        <g ref={crosshairRef} transform="translate(100, 100)">
          <circle r="20" fill="none" stroke="rgba(255, 107, 74, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
          <circle r="4" fill="#FF6B4A" />
          <line x1="-40" y1="0" x2="-8" y2="0" stroke="rgba(255, 107, 74, 0.3)" strokeWidth="1" />
          <line x1="8" y1="0" x2="40" y2="0" stroke="rgba(255, 107, 74, 0.3)" strokeWidth="1" />
          <line x1="0" y1="-40" x2="0" y2="-8" stroke="rgba(255, 107, 74, 0.3)" strokeWidth="1" />
          <line x1="0" y1="8" x2="0" y2="40" stroke="rgba(255, 107, 74, 0.3)" strokeWidth="1" />
          
          {/* Coordinates text */}
          <text ref={coordsRef} x="15" y="-15" fill="rgba(255, 255, 255, 0.4)" fontSize="10" fontFamily="IBM Plex Mono">
            LAT: 0 / LNG: 0
          </text>
        </g>
      </svg>

      {/* Target scanning reticle in top-right */}
      <div className="absolute top-24 right-12 w-32 h-32 opacity-40 hidden md:block">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle cx="60" cy="60" r="35" fill="none" stroke="rgba(255, 107, 74, 0.12)" strokeWidth="1" strokeDasharray="5 3" />
          <g ref={radarRef} transform="translate(60, 60)">
            <line x1="0" y1="0" x2="0" y2="-50" stroke="#FF6B4A" strokeWidth="1.5" />
            <polygon points="-4,-40 0,-50 4,-40" fill="#FF6B4A" />
          </g>
        </svg>
        <div className="font-data text-[9px] text-white/30 text-center mt-1">QUÉT KHU VỰC: ĐANG HOẠT ĐỘNG</div>
      </div>

      {/* Floating status ticker */}
      <div className="absolute top-28 right-8 font-data text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        ĐỘ TIN CẬY MÔ HÌNH: 93.39% ACCURATE
      </div>

      <div className="absolute bottom-12 right-8 font-data text-[10px] text-white/40 space-y-1 text-right">
        <div>TRẠNG THÁI STREAM: ĐANG PHÁT HLS CỤC BỘ</div>
        <div>TRẠM PHÁT: PORT_3000_CORE</div>
      </div>
    </div>
  );
}

const schemaDetails = {
  id: {
    type: "int64",
    range: "0, 1, 2, 3...",
    values: "Discrete integers",
    nulls: "0.00%",
    desc: "Mã định danh duy nhất cho từng khách hàng. Được biểu diễn dưới dạng các số nguyên rời rạc.",
    chart: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
  },
  tenure: {
    type: "int64",
    range: "0 đến 72 tháng",
    values: "Discrete integers",
    nulls: "0.00%",
    desc: "Số tháng khách hàng đã gắn bó với công ty. Đây là thuộc tính quan trọng để dự đoán sớm rời mạng.",
    chart: [85, 42, 28, 22, 18, 15, 12, 19, 35, 78]
  },
  MonthlyCharges: {
    type: "float64",
    range: "$18.25 đến $118.75",
    values: "Continuous decimals",
    nulls: "0.00%",
    desc: "Số tiền tính phí cho khách hàng hàng tháng. Phí hàng tháng cao hơn thường tương ứng với tỷ lệ rời mạng cao hơn.",
    chart: [35, 95, 78, 62, 58, 65, 82, 91, 105, 115]
  },
  TotalCharges: {
    type: "float64 (nullable)",
    range: "$18.25 đến $8684.80",
    values: "Continuous decimals",
    nulls: "0.15% (được xử lý)",
    desc: "Tổng số tiền đã tính phí cho khách hàng. Được tự động ép kiểu sang float64, thay thế các chuỗi trống bằng giá trị median.",
    chart: [100, 82, 64, 48, 38, 29, 21, 15, 8, 4]
  },
  Contract: {
    type: "categorical (string)",
    range: "N/A",
    values: "Month-to-month, One year, Two year",
    nulls: "0.00%",
    desc: "Thời hạn hợp đồng của khách hàng. Hợp đồng Month-to-month có tỷ lệ rời mạng cao gấp 4 lần so với hợp đồng dài hạn.",
    chart: [60, 55, 45, 30, 25, 20, 22, 18, 15, 12]
  },
  Churn: {
    type: "categorical (binary)",
    range: "N/A",
    values: "0 (Không rời mạng), 1 (Rời mạng)",
    nulls: "0.00%",
    desc: "Nhãn dự đoán mục tiêu (target). 0 = Khách hàng đang hoạt động (73.46%), 1 = Khách hàng đã rời mạng (26.54%).",
    chart: [73.5, 73.5, 73.5, 73.5, 73.5, 26.5, 26.5, 26.5, 26.5, 26.5]
  }
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const stage1Ref = useRef(null);
  const stage2Ref = useRef(null);
  const stage3Ref = useRef(null);
  const philosophyRef = useRef(null);
  const ctaRef = useRef(null);
  const heroContentRef = useRef(null);

  const [activeSection, setActiveSection] = useState(0);
  const isAnimating = useRef(false);
  const activeSectionRef = useRef(0);

  useEffect(() => {
    // Force dark mode on homepage mount
    document.documentElement.classList.add("dark");

    // Restore user's saved theme from dashboard when leaving the homepage
    return () => {
      const savedTheme = localStorage.getItem("theme");
      const isDarkTheme = savedTheme !== null ? savedTheme === "dark" : true;
      if (isDarkTheme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
  }, []);

  // Sync activeSectionRef
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  const scrollToSection = (index) => {
    if (index < 0 || index > 5 || isAnimating.current) return;
    isAnimating.current = true;
    setActiveSection(index);

    gsap.to(containerRef.current, {
      scrollTop: index * window.innerHeight,
      duration: 1.2,
      ease: "power4.out",
      onComplete: () => {
        isAnimating.current = false;
      }
    });
  };

  // Stage 1 Interactive State (Ingestion & Validation)
  const [ingestState, setIngestState] = useState("idle");
  const [ingestProgress, setIngestProgress] = useState(0);
  const [validatedColumns, setValidatedColumns] = useState([]);
  const [validationLogs, setValidationLogs] = useState([]);
  const [selectedSchemaCol, setSelectedSchemaCol] = useState("tenure");
  
  // Professional parallax: use ref + rAF for silky 60fps without re-renders
  const stage1BoardRef = useRef(null);
  const stage1RafRef = useRef(null);
  const stage1Target = useRef({ rx: 0, ry: 0 });
  const stage1Current = useRef({ rx: 0, ry: 0 });

  const stage2BoardRef = useRef(null);
  const stage2RafRef = useRef(null);
  const stage2Target = useRef({ rx: 0, ry: 0 });
  const stage2Current = useRef({ rx: 0, ry: 0 });

  const stage3BoardRef = useRef(null);
  const stage3RafRef = useRef(null);
  const stage3Target = useRef({ rx: 0, ry: 0 });
  const stage3Current = useRef({ rx: 0, ry: 0 });

  const animateStage1 = () => {
    const LERP = 0.09; // slow spring — feels heavy and premium
    const cur = stage1Current.current;
    const tgt = stage1Target.current;
    cur.rx += (tgt.rx - cur.rx) * LERP;
    cur.ry += (tgt.ry - cur.ry) * LERP;

    if (stage1BoardRef.current) {
      stage1BoardRef.current.style.transform =
        `perspective(1800px) rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg)`;
    }

    const dist = Math.abs(tgt.rx - cur.rx) + Math.abs(tgt.ry - cur.ry);
    if (dist > 0.005) {
      stage1RafRef.current = requestAnimationFrame(animateStage1);
    } else {
      stage1RafRef.current = null;
    }
  };

  const handleStage1MouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xc = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yc = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    // Max 4° — refined, not aggressive
    stage1Target.current = { rx: -yc * 4, ry: xc * 4 };

    if (!stage1RafRef.current) {
      stage1RafRef.current = requestAnimationFrame(animateStage1);
    }
  };

  const handleStage1MouseLeave = () => {
    stage1Target.current = { rx: 0, ry: 0 };
    if (!stage1RafRef.current) {
      stage1RafRef.current = requestAnimationFrame(animateStage1);
    }
  };

  const animateStage2 = () => {
    const LERP = 0.09;
    const cur = stage2Current.current;
    const tgt = stage2Target.current;
    cur.rx += (tgt.rx - cur.rx) * LERP;
    cur.ry += (tgt.ry - cur.ry) * LERP;
    if (stage2BoardRef.current) {
      stage2BoardRef.current.style.transform =
        `perspective(1200px) rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg)`;
    }
    const dist = Math.abs(tgt.rx - cur.rx) + Math.abs(tgt.ry - cur.ry);
    if (dist > 0.005) { stage2RafRef.current = requestAnimationFrame(animateStage2); }
    else { stage2RafRef.current = null; }
  };
  const handleStage2MouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xc = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yc = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    stage2Target.current = { rx: -yc * 4, ry: xc * 4 };
    if (!stage2RafRef.current) { stage2RafRef.current = requestAnimationFrame(animateStage2); }
  };
  const handleStage2MouseLeave = () => {
    stage2Target.current = { rx: 0, ry: 0 };
    if (!stage2RafRef.current) { stage2RafRef.current = requestAnimationFrame(animateStage2); }
  };

  const animateStage3 = () => {
    const LERP = 0.09;
    const cur = stage3Current.current;
    const tgt = stage3Target.current;
    cur.rx += (tgt.rx - cur.rx) * LERP;
    cur.ry += (tgt.ry - cur.ry) * LERP;
    if (stage3BoardRef.current) {
      stage3BoardRef.current.style.transform =
        `perspective(1200px) rotateX(${cur.rx.toFixed(3)}deg) rotateY(${cur.ry.toFixed(3)}deg)`;
    }
    const dist = Math.abs(tgt.rx - cur.rx) + Math.abs(tgt.ry - cur.ry);
    if (dist > 0.005) { stage3RafRef.current = requestAnimationFrame(animateStage3); }
    else { stage3RafRef.current = null; }
  };
  const handleStage3MouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xc = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const yc = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    stage3Target.current = { rx: -yc * 4, ry: xc * 4 };
    if (!stage3RafRef.current) { stage3RafRef.current = requestAnimationFrame(animateStage3); }
  };
  const handleStage3MouseLeave = () => {
    stage3Target.current = { rx: 0, ry: 0 };
    if (!stage3RafRef.current) { stage3RafRef.current = requestAnimationFrame(animateStage3); }
  };

  const columnsToValidate = [
    "id", "gender", "SeniorCitizen", "Partner", "Dependents", 
    "tenure", "PhoneService", "MultipleLines", "InternetService", 
    "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", 
    "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling", 
    "PaymentMethod", "MonthlyCharges", "TotalCharges", "Churn"
  ];

  const handleIngestAndValidate = () => {
    if (ingestState !== "idle" && ingestState !== "completed") return;
    setIngestState("unzipping");
    setIngestProgress(0);
    setValidatedColumns([]);
    setValidationLogs(["[SYS] Đang khởi tạo pipeline thu thập dữ liệu..."]);

    // Phase 1: Unzip simulation
    let progress = 0;
    const unzipInterval = setInterval(() => {
      progress += 10;
      setIngestProgress(progress);
      setValidationLogs(prev => [
        ...prev.filter(l => !l.startsWith("[ZIP]")),
        `[ZIP] Đang giải nén data/raw/playground-series-s6e3.zip... ${progress}%`
      ]);

      if (progress >= 100) {
        clearInterval(unzipInterval);
        setIngestState("validating");
        setValidationLogs(prev => [
          ...prev,
          "[SYS] Giải nén hoàn tất. Tìm thấy dữ liệu customer_churn.csv (7,043 dòng, 21 cột)",
          "[SYS] Đang chạy bộ xác thực Schema đối chiếu với config/schema.yaml..."
        ]);

        // Phase 2: Column Validation simulation
        let colIndex = 0;
        const colInterval = setInterval(() => {
          if (colIndex < columnsToValidate.length) {
            const col = columnsToValidate[colIndex];
            setValidatedColumns(prev => [...prev, col]);
            setValidationLogs(prev => [
              ...prev,
              `[VALID] Xác thực kiểu cột: "${col}" -> KHỚP (OK)`
            ]);
            colIndex++;
          } else {
            clearInterval(colInterval);
            setIngestState("completed");
            setValidationLogs(prev => [
              ...prev,
              "[SUCCESS] Toàn bộ 21 cột khớp với định nghĩa schema.",
              "[SUCCESS] Đã tạo file status.txt với mã trạng thái VALIDATED."
            ]);
          }
        }, 80);
      }
    }, 100);
  };

  // Stage 2 Interactive State (Data Transformation & Feature Engineering)
  const [transTenure, setTransTenure] = useState(12);
  const [transCharges, setTransCharges] = useState(65.5);
  const [transServices, setTransServices] = useState(4);
  const [smoteRatio, setSmoteRatio] = useState(100);

  // Math for SMOTE
  const activeCount = 5174;
  const originalChurnedCount = 1869;
  const targetChurnedCount = activeCount; // 50/50 balance
  const currentChurnedCount = originalChurnedCount + Math.round((targetChurnedCount - originalChurnedCount) * (smoteRatio / 100));
  const totalRows = activeCount + currentChurnedCount;

  const activePercent = (activeCount / totalRows) * 100;
  const churnedPercent = (currentChurnedCount / totalRows) * 100;

  // Stage 3 Interactive State (Model Training, Evaluation & Prediction)
  const [modelType, setModelType] = useState("LightGBM");
  const [lr, setLr] = useState(0.05);
  const [maxDepth, setMaxDepth] = useState(6);
  const [estimators, setEstimators] = useState(150);
  const [isTuning, setIsTuning] = useState(false);
  const [tuneStatus, setTuneStatus] = useState("Ready");
  const [activeTab, setActiveTab] = useState("metrics");
  const [exportState, setExportState] = useState("idle");
  const [exportProgress, setExportProgress] = useState(0);

  const [metrics, setMetrics] = useState({
    auc: 0.9339,
    accuracy: 89.24,
    precision: 85.12,
    f1: 86.41
  });

  const handleTuneModel = () => {
    setIsTuning(true);
    setTuneStatus("Đang chạy GridSearch...");
    
    setTimeout(() => {
      setTuneStatus("Đang đánh giá 3-Fold CV...");
      setTimeout(() => {
        setTuneStatus("Đang log kết quả lên MLflow...");
        setTimeout(() => {
          const offset = (lr * 0.1) + (maxDepth * 0.002) + (estimators * 0.0001);
          const baseAuc = modelType === "LightGBM" ? 0.925 : 0.918;
          const newAuc = Math.min(0.948, baseAuc + offset);
          const newAcc = Math.min(92.4, 86.0 + offset * 10);
          const newPrec = Math.min(90.1, 82.5 + offset * 8);
          const newF1 = Math.min(91.2, 83.9 + offset * 9);

          setMetrics({
            auc: parseFloat(newAuc.toFixed(4)),
            accuracy: parseFloat(newAcc.toFixed(2)),
            precision: parseFloat(newPrec.toFixed(2)),
            f1: parseFloat(newF1.toFixed(2))
          });
          setIsTuning(false);
          setTuneStatus("Đã tối ưu & Lưu log");
        }, 800);
      }, 800);
    }, 800);
  };

  const handleExportCsv = () => {
    if (exportState !== "idle" && exportState !== "completed") return;
    setExportState("building");
    setExportProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setExportProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setExportState("completed");
        
        // Trigger simulated browser file download
        const element = document.createElement("a");
        const file = new Blob([
          "id,Churn\n1,0.85\n2,0.12\n"
        ], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "submission.csv";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }, 150);
  };

  // Controlled scroll-jacking listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      if (isAnimating.current) return;

      if (e.deltaY > 10) {
        scrollToSection(activeSectionRef.current + 1);
      } else if (e.deltaY < -10) {
        scrollToSection(activeSectionRef.current - 1);
      }
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (isAnimating.current) {
        e.preventDefault();
        return;
      }

      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY - touchEndY;

      if (diffY > 50) {
        e.preventDefault();
        scrollToSection(activeSectionRef.current + 1);
      } else if (diffY < -50) {
        e.preventDefault();
        scrollToSection(activeSectionRef.current - 1);
      }
    };

    const handleKeyDown = (e) => {
      if (isAnimating.current) return;

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToSection(activeSectionRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToSection(activeSectionRef.current - 1);
      }
    };

    const handleResize = () => {
      container.scrollTop = activeSectionRef.current * window.innerHeight;
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Entrance animations for content inside active section
  useEffect(() => {
    const ctx = gsap.context(() => {
      const activeEl = containerRef.current?.children[activeSection];
      if (activeEl) {
        gsap.fromTo(
          activeEl.querySelectorAll(".animate-fade-up"),
          { opacity: 0, y: 45 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 1.0, 
            stagger: 0.08, 
            ease: "power3.out",
            overwrite: "auto"
          }
        );

        const bgMedia = activeEl.querySelector("video, img");
        if (bgMedia) {
          gsap.fromTo(
            bgMedia,
            { scale: 1.2, filter: "blur(8px)" },
            { scale: 1, filter: "blur(0px)", duration: 1.6, ease: "power3.out", overwrite: "auto" }
          );
        }
      }
    }, containerRef);

    return () => ctx.revert();
  }, [activeSection]);

  // Mousemove parallax effect for Section 0 (Hero)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (activeSection !== 0) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;

      gsap.to(heroContentRef.current, {
        x: x * 35,
        y: y * 35,
        duration: 0.8,
        ease: "power2.out"
      });

      gsap.to(".hero-bg-parallax", {
        x: -x * 20,
        y: -y * 20,
        duration: 0.8,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [activeSection]);

  return (
    <div className="relative h-screen w-screen bg-[#F2F0E9] dark:bg-[#0D0D12] text-[#1A1A1A] dark:text-[#FAF8F5] overflow-hidden">
      <div className="noise-overlay"></div>

      {/* Floating Island Navbar */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full border border-[#2E4036]/10 dark:border-[#FAF8F5]/10 px-6 py-3 flex items-center justify-between transition-all duration-500 ${
        activeSection > 0 
          ? "bg-[#F2F0E9]/80 dark:bg-[#0D0D12]/80 backdrop-blur-xl shadow-lg shadow-black/5" 
          : "bg-transparent"
      }`}>
        <div className={`flex items-center gap-2 ${activeSection === 0 ? "text-white" : "text-[#1A1A1A] dark:text-white"}`}>
          <div className="h-3 w-3 rounded-full bg-[#CC5833]" />
          <span className="font-heading font-extrabold tracking-tight text-xl">Churn<span className="text-[#CC5833]">Pulse</span></span>
        </div>
        <div className={`hidden md:flex items-center gap-8 font-heading text-sm font-semibold ${
          activeSection === 0 ? "text-white/80" : "text-[#1A1A1A]/80 dark:text-[#FAF8F5]/80"
        }`}>
          <button onClick={() => scrollToSection(0)} className={`hover:text-[#CC5833] transition-colors ${activeSection === 0 ? "text-[#CC5833]" : ""}`}>Trang chủ</button>
          <button onClick={() => scrollToSection(1)} className={`hover:text-[#CC5833] transition-colors ${activeSection === 1 ? "text-[#CC5833]" : ""}`}>Stage 01: Thu thập & Xác thực</button>
          <button onClick={() => scrollToSection(2)} className={`hover:text-[#CC5833] transition-colors ${activeSection === 2 ? "text-[#CC5833]" : ""}`}>Stage 02: Xử lý & Cân bằng</button>
          <button onClick={() => scrollToSection(3)} className={`hover:text-[#CC5833] transition-colors ${activeSection === 3 ? "text-[#CC5833]" : ""}`}>Stage 03: Huấn luyện & Dự đoán</button>
          <button onClick={() => scrollToSection(4)} className={`hover:text-[#CC5833] transition-colors ${activeSection === 4 ? "text-[#CC5833]" : ""}`}>Dữ liệu</button>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="px-5 py-2 rounded-full bg-[#2E4036] hover:bg-[#CC5833] text-[#FAF8F5] font-heading text-sm font-bold shadow-md hover:scale-[1.03] transition-all duration-300">
            Vào Dashboard
          </Link>
        </div>
      </nav>

      {/* Right Side Dots Pagination */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 items-end">
        {[
          { id: 0, label: "Trang chủ" },
          { id: 1, label: "Stage 01: Thu thập & Xác thực dữ liệu" },
          { id: 2, label: "Stage 02: Xử lý & Cân bằng dữ liệu" },
          { id: 3, label: "Stage 03: Huấn luyện & Dự đoán" },
          { id: 4, label: "Dữ liệu" },
          { id: 5, label: "CTA: Truy cập Dashboard" }
        ].map((sec) => (
          <div key={sec.id} className="group relative flex items-center gap-2">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 text-[#FAF8F5] text-xs font-data py-1 px-2.5 rounded-full pointer-events-none whitespace-nowrap">
              {sec.label}
            </span>
            <button
              onClick={() => scrollToSection(sec.id)}
              className={`section-dot ${activeSection === sec.id ? "active" : ""} ${activeSection === 0 ? "hero-section-dot" : ""}`}
              title={sec.label}
            />
          </div>
        ))}
      </div>

      <div 
        ref={containerRef}
        className="scroll-snap-container h-full w-full"
      >
        
        {/* Section 0: Home Hero */}
        <section 
          ref={heroRef} 
          className="scroll-snap-section flex flex-col justify-end p-8 md:p-24 bg-black bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=80')" }}
        >
          <div className="absolute inset-0 z-0 hero-bg-parallax scale-110 origin-center">
            <HlsVideo 
              src="/videos/hero_pinterest.mp4" 
              className="h-full w-full object-cover opacity-65" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 bg-[#2E4036]/25 mix-blend-overlay"></div>
          </div>

          <CyberGrid />

          <div ref={heroContentRef} className="relative z-20 max-w-4xl text-white">
            <h3 className="animate-fade-up font-heading font-semibold text-sm tracking-[0.2em] text-[#CC5833] uppercase">
              Phân tích khách hàng & Dự đoán rời mạng
            </h3>
            <h1 className="animate-fade-up font-heading font-extrabold text-5xl md:text-8xl tracking-tighter mt-4 leading-none">
              Dự đoán Churn là
            </h1>
            <h2 className="animate-fade-up font-drama text-6xl md:text-9xl text-[#CC5833] mt-2 block italic font-light">
              Khoa học giữ chân khách hàng.
            </h2>
            <p className="animate-fade-up font-data text-white/85 text-sm md:text-base mt-6 max-w-xl leading-relaxed">
              Phân tích nhật ký hoạt động khách hàng đa chiều và ngăn chặn rời mạng trước khi xảy ra. Xây dựng với mô hình LightGBM tự động, đạt độ chính xác 93.39%.
            </p>
            <div className="animate-fade-up mt-8 flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={() => scrollToSection(1)}
                className="group w-full sm:w-auto px-8 py-4 rounded-full bg-[#CC5833] hover:bg-[#CC5833]/90 text-white font-heading font-bold flex items-center justify-center gap-3 shadow-lg shadow-[#CC5833]/25 hover:scale-[1.03] transition-all duration-300"
              >
                Khám phá Pipeline 
                <MdArrowForward className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link 
                to="/admin" 
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-heading font-semibold text-center backdrop-blur-md transition-colors"
              >
                Vào trang dự đoán
              </Link>
            </div>
          </div>
        </section>

        {/* Section 1: Stage 01 - Ingestion & Validation */}
        <section ref={stage1Ref} className="scroll-snap-section flex flex-col justify-end pb-12 lg:pb-16 p-6 md:p-12 lg:p-24 bg-[#F2F0E9] dark:bg-[#050508] text-[#1A1A1A] dark:text-white transition-colors duration-500">
          <div className="absolute inset-0 z-0 hero-bg-parallax scale-110 origin-center">
            <HlsVideo 
              src="/videos/ingestion_hero.mp4" 
              className="h-full w-full object-cover opacity-10 dark:opacity-100 transition-opacity duration-500" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className="absolute inset-0 bg-radial-vignette opacity-0 dark:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-[#2E4036]/5 mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 w-full max-w-6xl mx-auto mb-8 text-left animate-fade-up">
            <span className="font-data text-xs uppercase tracking-widest text-[#CC5833] bg-[#CC5833]/15 px-3 py-1 rounded-full w-fit">
              STAGE 01 — Khởi tạo Pipeline
            </span>
            <h2 className="font-heading font-extrabold text-2xl md:text-4xl tracking-tight mt-1 text-[#1A1A1A] dark:text-white transition-colors">
              Thu thập Dữ liệu & Xác thực Schema
            </h2>
            <p className="text-[#1A1A1A]/70 dark:text-gray-400 font-heading text-xs mt-1 max-w-3xl transition-colors">
              Giải nén tập tin, phân tích cấu trúc CSV và xác thực schema động.
            </p>
          </div>

          {/* Perspective Wrapper */}
          <div className="perspective-container relative z-10 w-full max-w-6xl mx-auto h-auto lg:h-[500px] animate-fade-up">
            {/* Massive Centerpiece Dashboard */}
            <div 
              ref={stage1BoardRef}
              onMouseMove={handleStage1MouseMove}
              onMouseLeave={handleStage1MouseLeave}
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              className="dashboard-3d-board w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 relative"
            >
              {/* Card 1: Control HUD */}
              <div 
                style={{ transform: "translateZ(35px)", transformStyle: "preserve-3d" }}
                className="lg:col-span-4 bg-white/60 dark:bg-[#0d0d12]/45 backdrop-blur-xl border border-[#2E4036]/10 dark:border-white/10 rounded-[2rem] p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:border-[#CC5833]/40 min-h-[350px] lg:min-h-0 text-[#1A1A1A] dark:text-white transition-colors duration-500"
              >
                <div style={{ transform: "translateZ(15px)" }}>
                  <h3 className="font-heading font-bold text-base text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-2 transition-colors">
                    <span className="h-2 w-2 rounded-full bg-[#CC5833] animate-pulse"></span>
                    Kiểm soát Thu thập (Ingestion Control)
                  </h3>
                  <p className="font-heading text-[11px] text-[#1A1A1A]/85 dark:text-white/85 mb-5 transition-colors">
                    Khởi chạy giải nén tệp zip thô và kích hoạt kiểm tra xác thực kiểu dữ liệu của schema.
                  </p>

                  <div style={{ transform: "translateZ(25px)" }}>
                    <button 
                      onClick={handleIngestAndValidate}
                      disabled={ingestState !== "idle" && ingestState !== "completed"}
                      className="w-full py-3.5 rounded-xl bg-[#CC5833] hover:bg-[#CC5833]/90 disabled:bg-gray-800/80 disabled:text-white/60 disabled:cursor-not-allowed text-white font-heading text-xs font-bold shadow-lg shadow-[#CC5833]/25 flex items-center justify-center gap-2 transform hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
                    >
                      {ingestState === "unzipping" && (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>ĐANG GIẢI NÉN ARCHIVE ({ingestProgress}%)</span>
                        </>
                      )}
                      {ingestState === "validating" && (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>ĐANG XÁC THỰC CỘT...</span>
                        </>
                      )}
                      {(ingestState === "idle" || ingestState === "completed") && (
                        <span>CHẠY PIPELINE THU THẬP & KIỂM TRA SCHEMA</span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ transform: "translateZ(20px)" }} className="space-y-3 mt-4 lg:mt-0">
                  <div>
                    <div className="flex justify-between text-[10px] font-data text-[#1A1A1A]/90 dark:text-white/90 mb-1 transition-colors">
                      <span className="truncate max-w-[150px]">playground-series-s6e3.zip</span>
                      <span>{ingestProgress}%</span>
                    </div>
                    <div className="w-full bg-[#2E4036]/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden transition-colors">
                      <div className="bg-[#CC5833] h-full transition-all duration-300" style={{ width: `${ingestProgress}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-[#2E4036]/5 dark:bg-white/5 rounded-xl border border-[#2E4036]/5 dark:border-white/5 transition-colors duration-500">
                    <span className="text-[9px] text-[#1A1A1A]/80 dark:text-white/80 block mb-2 font-data transition-colors">DANH SÁCH KIỂM TRA SCHEMA</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["id", "tenure", "MonthlyCharges", "TotalCharges", "Contract", "Churn"].map((col) => {
                        const isValid = validatedColumns.includes(col);
                        return (
                          <div key={col} className={`flex items-center gap-1 p-1 rounded-lg border text-[9px] font-data transition-all duration-300 ${
                            isValid ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold" : "bg-[#2E4036]/5 dark:bg-white/5 border-[#2E4036]/5 dark:border-white/5 text-[#1A1A1A]/80 dark:text-white/80"
                          }`}>
                            <span className={`h-1 w-1 rounded-full ${isValid ? "bg-emerald-500 dark:bg-emerald-400 animate-pulse" : "bg-[#2E4036]/20 dark:bg-white/20"}`}></span>
                            <span className="truncate">{col}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Holographic Schema Decoder HUD */}
              <div 
                style={{ transform: "translateZ(115px)", transformStyle: "preserve-3d" }}
                className="lg:col-span-5 bg-[#0d0d12]/50 backdrop-blur-2xl border border-white/15 rounded-[2.5rem] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-[#CC5833]/50 min-h-[400px] lg:min-h-0"
              >
                {/* Scanner laser animation */}
                <div className="laser-scan-line"></div>

                <div style={{ transform: "translateZ(15px)" }} className="flex justify-between items-center mb-3">
                  <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#CC5833] animate-pulse"></span>
                    Giải mã Schema (Schema Decoder)
                  </h3>
                  <span className="font-data text-[9px] text-[#CC5833] uppercase bg-[#CC5833]/15 px-2 py-0.5 rounded border border-[#CC5833]/25 animate-pulse">
                    Live Telemetry
                  </span>
                </div>

                <div style={{ transform: "translateZ(20px)" }} className="space-y-3">
                  <div className="grid grid-cols-3 gap-1.5">
                    {Object.keys(schemaDetails).map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedSchemaCol(col)}
                        className={`px-2 py-1 rounded-xl text-[9px] font-data border transition-all duration-300 truncate ${
                          selectedSchemaCol === col 
                            ? "bg-[#CC5833]/25 border-[#CC5833] text-white shadow-[0_0_12px_rgba(204,88,51,0.25)]" 
                            : "bg-white/5 border-white/5 text-white/85 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>

                  {/* Metadata display */}
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 text-xs font-data">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/80">Kiểu dữ liệu:</span>
                      <span className="text-[#CC5833] font-bold">{schemaDetails[selectedSchemaCol].type}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/80">Phạm vi giá trị:</span>
                      <span className="text-white/95 truncate max-w-[180px]">{schemaDetails[selectedSchemaCol].range}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-white/80">Tỷ lệ khuyết thiếu (Null):</span>
                      <span className="text-emerald-400 font-bold">{schemaDetails[selectedSchemaCol].nulls}</span>
                    </div>
                    <p className="text-[10px] text-white/90 leading-relaxed font-heading pt-0.5">
                      {schemaDetails[selectedSchemaCol].desc}
                    </p>
                  </div>
                </div>

                {/* Live SVG Graph */}
                <div style={{ transform: "translateZ(30px)" }} className="mt-3">
                  <div className="flex justify-between items-center text-[9px] font-data text-white/40 mb-1">
                    <span>PHỔ PHÂN PHỐI DỮ LIỆU (DISTRIBUTION)</span>
                    <span className="animate-pulse text-emerald-400">● TRỰC TIẾP</span>
                  </div>
                  <div className="h-[80px] w-full bg-black/40 border border-white/10 rounded-xl p-2 relative overflow-hidden flex items-end">
                    {/* SVG Chart */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#CC5833" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#CC5833" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" />
                      
                      {/* Path Area */}
                      <path 
                        d={(() => {
                          const points = schemaDetails[selectedSchemaCol].chart;
                          const width = 300;
                          const height = 80;
                          const pathStr = points.map((val, index) => {
                            const x = (index / (points.length - 1)) * width;
                            const y = height - (val / 120) * height; // normalized to max value 120 for safety padding
                            return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                          }).join(" ");
                          return `${pathStr} L ${width} ${height} L 0 ${height} Z`;
                        })()}
                        fill="url(#chart-gradient)"
                      />
                      
                      {/* Path Line */}
                      <path 
                        d={schemaDetails[selectedSchemaCol].chart.map((val, index) => {
                          const x = (index / (schemaDetails[selectedSchemaCol].chart.length - 1)) * 300;
                          const y = 80 - (val / 120) * 80;
                          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#CC5833"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="path-glow"
                      />

                      {/* Dots on points */}
                      {schemaDetails[selectedSchemaCol].chart.map((val, index) => {
                        const x = (index / (schemaDetails[selectedSchemaCol].chart.length - 1)) * 300;
                        const y = 80 - (val / 120) * 80;
                        return (
                          <circle 
                            key={index} 
                            cx={x} 
                            cy={y} 
                            r="3" 
                            fill="#FFFFFF" 
                            stroke="#CC5833" 
                            strokeWidth="1.5" 
                            className="hover:scale-150 transition-transform duration-200"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card 3: Telemetry Logs HUD */}
              <div 
                style={{ transform: "translateZ(65px)", transformStyle: "preserve-3d" }}
                className="lg:col-span-3 bg-[#0d0d12]/55 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col justify-between shadow-2xl font-data transition-all duration-300 hover:border-[#CC5833]/30 min-h-[300px] lg:min-h-0"
              >
                <div style={{ transform: "translateZ(15px)" }}>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
                    <span className="text-xs font-bold text-white/80">validation.log</span>
                    <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded ${
                      ingestState === "completed" ? "bg-[#CC5833]/15 text-[#CC5833] border border-[#CC5833]/30" : "bg-yellow-500/15 text-yellow-400"
                    }`}>{ingestState === "completed" ? "Đã xác thực" : "Chờ lệnh"}</span>
                  </div>
                  
                  <div style={{ transform: "translateZ(25px)" }} className="text-[10px] space-y-2 text-emerald-400/90 leading-relaxed overflow-y-auto scrollbar-hide h-[180px] lg:h-[220px]">
                    {validationLogs.length === 0 ? (
                      <div className="text-white/30 italic">[Pipeline đang chờ. Nhấn nút kiểm tra để bắt đầu...]</div>
                    ) : (
                      validationLogs.map((log, idx) => (
                        <div key={idx} className={log.startsWith("[SUCCESS]") ? "text-white font-bold" : log.startsWith("[ZIP]") ? "text-yellow-400" : "text-emerald-400/90"}>
                          {log}
                        </div>
                      ))
                    )}
                    {(ingestState === "unzipping" || ingestState === "validating") && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-emerald-400 animate-pulse"></span>
                    )}
                  </div>
                </div>

                <div style={{ transform: "translateZ(15px)" }} className="text-[9px] text-white/40 border-t border-white/10 pt-2.5 mt-2.5 flex justify-between">
                  <span>Tập tin: status.txt</span>
                  <span>Đã check: 21 cột</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Stage 02 - Feature Engineering & SMOTE */}
        <section ref={stage2Ref} className="scroll-snap-section flex flex-col justify-center p-8 md:p-24 bg-[#08080c] text-white">
          <div className="absolute inset-0 z-0">
            <HlsVideo 
              src="/videos/datastreams.mp4" 
              className="h-full w-full object-cover opacity-60" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050508] via-[#08080c]/60 to-black"></div>
            <div className="absolute inset-0 bg-[#CC5833]/5 mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto mb-6 text-left animate-fade-up">
            <span className="font-data text-xs uppercase tracking-widest text-[#CC5833] bg-[#CC5833]/15 px-3 py-1 rounded-full w-fit">
              STAGE 02 — Biến đổi Dữ liệu
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl tracking-tight mt-2 text-white">
              Biến đổi Dữ liệu & Cân bằng SMOTE
            </h2>
            <p className="text-gray-400 font-heading text-sm mt-1 max-w-3xl">
              Tạo các đặc trưng dự báo tùy chỉnh và chạy thuật toán SMOTE để cân bằng phân phối lớp.
            </p>
          </div>

          {/* Massive Centerpiece Dashboard */}
          <div className="perspective-container relative z-10 w-full max-w-5xl mx-auto h-[480px] md:h-[500px] animate-fade-up">
            <div
              ref={stage2BoardRef}
              onMouseMove={handleStage2MouseMove}
              onMouseLeave={handleStage2MouseLeave}
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              className="dashboard-3d-board w-full h-full bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 shadow-2xl"
            >
            {/* Left Column: custom features */}
            <div className="flex-1 flex flex-col justify-between" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#CC5833] animate-pulse"></span>
                  Hộp cát Đặc trưng (Feature Sandbox)
                </h3>
                <p className="font-heading text-xs text-white/50 mb-6">
                  Điều chỉnh tham số khách hàng để mô phỏng tính toán lại các đặc trưng mô hình trực tiếp.
                </p>

                <div className="space-y-4 font-data text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Thời gian gắn bó: <strong className="text-[#CC5833]">{transTenure} Tháng</strong></span>
                      <span className="text-white/40">0 - 72 tháng</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="72" 
                      value={transTenure} 
                      onChange={(e) => setTransTenure(parseInt(e.target.value))} 
                      className="w-full accent-[#CC5833] bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Cước phí hàng tháng: <strong className="text-[#CC5833]">${transCharges}</strong></span>
                      <span className="text-white/40">$18 - $120</span>
                    </div>
                    <input 
                      type="range" 
                      min="18" 
                      max="120" 
                      step="0.5"
                      value={transCharges} 
                      onChange={(e) => setTransCharges(parseFloat(e.target.value))} 
                      className="w-full accent-[#CC5833] bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Số dịch vụ sử dụng: <strong className="text-[#CC5833]">{transServices}</strong></span>
                      <span className="text-white/40">1 - 9 dịch vụ</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="9" 
                      value={transServices} 
                      onChange={(e) => setTransServices(parseInt(e.target.value))} 
                      className="w-full accent-[#CC5833] bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Results */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-data">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 block">loyalty_tier (Phân cấp)</span>
                    <span className="font-heading font-extrabold text-white mt-1 block">
                      {transTenure <= 6 ? "Mới sử dụng (Onboarding)" : 
                       transTenure <= 12 ? "Năm đầu (First Year)" : 
                       transTenure <= 24 ? "Năm hai (Second Year)" : 
                       transTenure <= 48 ? "Quen thuộc (Familiar)" : "Thân thiết (Loyal)"}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 block">cost_pressure_log (Áp lực cước phí)</span>
                    <span className="font-mono font-bold text-[#CC5833] mt-1 block">
                      {Math.log1p(transCharges / (transTenure || 1)).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: SMOTE balancer */}
            <div className="flex-1 flex flex-col justify-between bg-black/80 rounded-2xl border border-white/10 p-6 font-data" style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}>
              <div>
                <h3 className="font-heading font-bold text-sm text-white mb-2 flex items-center justify-between">
                  <span>Trực quan hóa Cân bằng SMOTE</span>
                  <span className="text-[10px] bg-[#CC5833]/15 text-[#CC5833] px-2 py-0.5 rounded uppercase font-bold">Oversampling</span>
                </h3>
                <p className="font-heading text-xs text-white/50 mb-6">
                  Kỹ thuật SMOTE giúp tạo thêm mẫu giả lập thuộc nhóm thiểu số để cân bằng phân phối lớp dữ liệu.
                </p>

                {/* Bars */}
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/80">Khách hàng Đang hoạt động (Churn = 0)</span>
                      <span className="font-bold text-emerald-400">{activePercent.toFixed(1)}% ({activeCount} dòng)</span>
                    </div>
                    <div className="w-full bg-white/5 h-6 rounded-lg overflow-hidden border border-white/5 relative">
                      <div className="bg-emerald-500/80 h-full transition-all duration-500" style={{ width: `${activePercent}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/80">Khách hàng Rời mạng (Churn = 1)</span>
                      <span className="font-bold text-[#CC5833]">{churnedPercent.toFixed(1)}% ({currentChurnedCount} dòng)</span>
                    </div>
                    <div className="w-full bg-white/5 h-6 rounded-lg overflow-hidden border border-white/5 relative">
                      <div className="bg-[#CC5833]/80 h-full transition-all duration-500" style={{ width: `${churnedPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between text-xs">
                    <span>Hệ số Oversampling:</span>
                    <strong className="text-[#CC5833]">{smoteRatio}%</strong>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={smoteRatio} 
                    onChange={(e) => setSmoteRatio(parseInt(e.target.value))} 
                    className="w-full accent-[#CC5833] bg-white/10 rounded-lg appearance-none h-1.5 cursor-pointer"
                  />
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-center text-white/60">
                  Tập huấn luyện sau cân bằng: <strong className="text-white font-mono">{totalRows.toLocaleString()} dòng</strong> ({smoteRatio === 100 ? "Cân bằng 1.0 (Balanced)" : "Mất cân bằng"})
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Section 3: Stage 03 - Model Training, Evaluation & Prediction */}
        <section ref={stage3Ref} className="scroll-snap-section flex flex-col justify-center p-8 md:p-24 bg-[#0a0a0f] text-white">
          <div className="absolute inset-0 z-0">
            <HlsVideo 
              src="/videos/model_training.mp4" 
              className="h-full w-full object-cover opacity-60" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#08080c] via-black/45 to-[#0a0a0f]"></div>
            <div className="absolute inset-0 bg-purple-500/5 mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 w-full max-w-5xl mx-auto mb-6 text-left animate-fade-up">
            <span className="font-data text-xs uppercase tracking-widest text-[#CC5833] bg-[#CC5833]/15 px-3 py-1 rounded-full w-fit">
              STAGE 03 — Cốt lõi Mô hình
            </span>
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl tracking-tight mt-2 text-white">
              Huấn luyện Mô hình & Dự đoán
            </h2>
            <p className="text-gray-400 font-heading text-sm mt-1 max-w-3xl">
              Khởi chạy GridSearchCV tối ưu siêu tham số, đánh giá đường cong ROC và xuất file submission dự đoán.
            </p>
          </div>

          {/* Massive Centerpiece Dashboard */}
          <div className="perspective-container relative z-10 w-full max-w-5xl mx-auto h-[480px] md:h-[500px] animate-fade-up">
            <div
              ref={stage3BoardRef}
              onMouseMove={handleStage3MouseMove}
              onMouseLeave={handleStage3MouseLeave}
              style={{ transformStyle: "preserve-3d", willChange: "transform" }}
              className="dashboard-3d-board w-full h-full bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8 shadow-2xl"
            >
            {/* Left Column: hyperparameter controls */}
            <div className="flex-1 flex flex-col justify-between" style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}>
              <div>
                <h3 className="font-heading font-bold text-lg text-white mb-2 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                  Cấu hình Mô hình (Model Configurator)
                </h3>
                <p className="font-heading text-xs text-white/50 mb-4">
                  Lựa chọn kiến trúc mô hình và điều chỉnh các ràng buộc trước khi chạy thử nghiệm MLflow.
                </p>

                <div className="flex gap-4 font-data text-xs mb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input 
                      type="radio" 
                      name="modelType" 
                      value="LightGBM" 
                      checked={modelType === "LightGBM"} 
                      onChange={(e) => setModelType(e.target.value)}
                      className="accent-[#CC5833]"
                    />
                    <span>LightGBM</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input 
                      type="radio" 
                      name="modelType" 
                      value="XGBoost" 
                      checked={modelType === "XGBoost"} 
                      onChange={(e) => setModelType(e.target.value)}
                      className="accent-[#CC5833]"
                    />
                    <span>XGBoost</span>
                  </label>
                </div>

                <div className="space-y-4 font-data text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>learning_rate:</span>
                      <strong className="text-[#CC5833]">{lr}</strong>
                    </div>
                    <input 
                      type="range" 
                      min="0.01" 
                      max="0.2" 
                      step="0.01"
                      value={lr} 
                      onChange={(e) => setLr(parseFloat(e.target.value))}
                      className="w-full accent-[#CC5833] bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>max_depth:</span>
                      <strong className="text-[#CC5833]">{maxDepth}</strong>
                    </div>
                    <input 
                      type="range" 
                      min="3" 
                      max="10" 
                      value={maxDepth} 
                      onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                      className="w-full accent-[#CC5833] bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>n_estimators:</span>
                      <strong className="text-[#CC5833]">{estimators}</strong>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="300" 
                      step="10"
                      value={estimators} 
                      onChange={(e) => setEstimators(parseInt(e.target.value))}
                      className="w-full accent-[#CC5833] bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Control Deck Action Buttons */}
              <div className="space-y-2 mt-4">
                <button 
                  onClick={handleTuneModel}
                  disabled={isTuning}
                  className="w-full py-3.5 rounded-xl bg-[#CC5833] hover:bg-[#CC5833]/90 disabled:bg-gray-800 disabled:text-white/40 disabled:cursor-not-allowed text-white font-heading text-xs font-bold transition-all shadow-lg shadow-[#CC5833]/25 flex items-center justify-center gap-2"
                >
                  {isTuning ? (
                    <>
                      <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>{tuneStatus}</span>
                    </>
                  ) : (
                    <span>HUẤN LUYỆN & ĐÁNH GIÁ MÔ HÌNH</span>
                  )}
                </button>

                <button 
                  onClick={handleExportCsv}
                  disabled={exportState !== "idle" && exportState !== "completed"}
                  className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:bg-gray-800/20 text-white font-heading text-xs font-semibold flex items-center justify-center gap-2"
                >
                  {exportState === "building" ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>ĐANG BIÊN SOẠN SUBMISSION.CSV ({exportProgress}%)</span>
                    </>
                  ) : exportState === "completed" ? (
                    <span className="text-emerald-400">✓ ĐÃ TẢI XUỐNG SUBMISSION.CSV</span>
                  ) : (
                    <span>XUẤT FILE SUBMISSION</span>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: tabs and logs / charts */}
            <div className="flex-1 flex flex-col justify-between bg-black/80 rounded-2xl border border-white/10 p-5 md:p-6 font-data" style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
                <div className="flex gap-3 text-[10px] uppercase font-bold">
                  {["metrics", "matrix", "roc"].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 px-1 transition-all ${
                        activeTab === tab 
                          ? "text-[#CC5833] border-b-2 border-[#CC5833]" 
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {tab === "metrics" ? "MLflow Metrics" : tab === "matrix" ? "Confusion Matrix" : "ROC Curve"}
                    </button>
                  ))}
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">Lượt chạy hoạt động</span>
              </div>

              {/* Tab Outputs */}
              <div className="flex-1 my-2">
                {activeTab === "metrics" && (
                  <div className="h-full flex flex-col justify-between gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">TEST ROC AUC</span>
                        <span className="text-lg font-extrabold text-[#CC5833] font-mono block mt-1">{metrics.auc}</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">ĐỘ CHÍNH XÁC (ACCURACY)</span>
                        <span className="text-lg font-extrabold text-white font-mono block mt-1">{metrics.accuracy}%</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">ĐỘ DỰ BÁO CHUẨN (PRECISION)</span>
                        <span className="text-lg font-extrabold text-white font-mono block mt-1">{metrics.precision}%</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                        <span className="text-[9px] text-white/40 block">CHỈ SỐ F1 (F1-SCORE)</span>
                        <span className="text-lg font-extrabold text-white font-mono block mt-1">{metrics.f1}%</span>
                      </div>
                    </div>

                    <div className="bg-black/50 border border-white/5 rounded-xl p-3 text-[9px] space-y-1 text-emerald-400 overflow-y-auto h-[90px] scrollbar-hide">
                      <div>[MLflow] Run ID: a6b29f0e1a4f...</div>
                      <div>[MLflow] Parameters logged: learning_rate={lr}, max_depth={maxDepth}</div>
                      <div>[MLflow] Metric registered: roc_auc={metrics.auc}</div>
                      <div>[MLflow] Model artifact saved: /artifacts/model/model.joblib</div>
                    </div>
                  </div>
                )}

                {activeTab === "matrix" && (
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="grid grid-cols-2 gap-3 w-full max-w-[320px]">
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[9px] text-white/40 block">Đúng Âm tính (True Negative - TN)</span>
                        <span className="text-lg font-extrabold text-emerald-400 font-mono block mt-1">
                          {Math.round(4127 * (metrics.accuracy / 100))}
                        </span>
                        <span className="text-[8px] text-white/30">Dự đoán Không Rời mạng</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[9px] text-white/40 block">Sai Dương tính (False Positive - FP)</span>
                        <span className="text-lg font-extrabold text-red-400 font-mono block mt-1">
                          {Math.round(1047 * (1 - metrics.precision / 100))}
                        </span>
                        <span className="text-[8px] text-white/30">Sai lầm Loại I (Type I Error)</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[9px] text-white/40 block">Sai Âm tính (False Negative - FN)</span>
                        <span className="text-lg font-extrabold text-red-400 font-mono block mt-1">
                          {Math.round(1869 * (1 - metrics.f1 / 100))}
                        </span>
                        <span className="text-[8px] text-white/30">Sai lầm Loại II (Type II Error)</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-3 rounded-xl text-center">
                        <span className="text-[9px] text-white/40 block">Đúng Dương tính (True Positive - TP)</span>
                        <span className="text-lg font-extrabold text-emerald-400 font-mono block mt-1">
                          {Math.round(1869 * (metrics.f1 / 100))}
                        </span>
                        <span className="text-[8px] text-white/30">Dự đoán Rời mạng</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "roc" && (
                  <div className="h-full flex flex-col justify-center items-center">
                    <div className="w-full max-w-[200px] aspect-square relative bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
                      {/* SVG ROC Plot */}
                      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        {/* Diagonal Grid Line */}
                        <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3" />
                        {/* ROC Curve Bezier */}
                        <path 
                          d={`M 0 100 C 0 ${100 - (metrics.auc - 0.5) * 200}, ${(metrics.auc - 0.5) * 200} 0, 100 0`} 
                          fill="none" 
                          stroke="#CC5833" 
                          strokeWidth="2.5" 
                          className="transition-all duration-500 ease-out"
                        />
                        {/* Point on Curve */}
                        <circle cx="20" cy="20" r="3" fill="#CC5833" />
                      </svg>
                      <div className="flex justify-between text-[8px] text-white/30 mt-2 font-mono">
                        <span>FPR (Tỷ lệ Dương tính giả)</span>
                        <span className="text-[#CC5833] font-bold">AUC={metrics.auc}</span>
                        <span>TPR (Tỷ lệ Dương tính thật)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[9px] text-white/40 border-t border-white/10 pt-3 mt-2 flex justify-between">
                <span>MLflow Tracking: http://localhost:5000</span>
                <span>Dataset: balanced_train.npz</span>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* Section 4: Philosophy Manifesto */}
        <section ref={philosophyRef} className="scroll-snap-section flex flex-col justify-center p-8 md:p-24 bg-[#1A1A1A] text-white">
          <div className="absolute inset-0 z-0">
            <HlsVideo 
              src="/videos/philosophy.mp4" 
              className="h-full w-full object-cover opacity-50" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className="absolute inset-0 bg-[#0D0D12] opacity-85"></div>
            <div className="absolute inset-0 bg-[#2E4036]/15 mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto flex flex-col h-full justify-between py-16">
            <div className="animate-fade-up">
              <span className="font-data text-xs uppercase tracking-widest text-[#CC5833]">Về bộ dữ liệu</span>
            </div>

            <div className="my-auto flex flex-col gap-10">
              <div className="animate-fade-up max-w-2xl">
                <p className="font-heading text-sm text-gray-500 tracking-wider uppercase font-semibold">Nguồn: Kaggle — Playground Series S6E3</p>
                <p className="font-heading text-xl md:text-3xl text-gray-400 mt-2 leading-relaxed font-light">
                  Bộ dữ liệu gồm 7,043 bản ghi khách hàng viễn thông với 21 thuộc tính — bao gồm nhân khẩu học, dịch vụ đăng ký, hợp đồng và chi phí hàng tháng.
                </p>
              </div>

              <div className="animate-fade-up max-w-4xl border-l-2 border-[#CC5833] pl-6 md:pl-10">
                <p className="font-drama text-4xl md:text-7xl text-[#FAF8F5] mt-4 leading-tight">
                  Target: <span className="text-[#CC5833]">Churn</span> — tỷ lệ rời mạng 26.54%, phân lớp nhị phân.
                </p>
              </div>

              <div className="animate-fade-up grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <span className="font-mono text-2xl font-extrabold text-[#CC5833] block">7,043</span>
                  <span className="font-data text-[10px] text-white/50 uppercase">Mẫu</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <span className="font-mono text-2xl font-extrabold text-white block">21</span>
                  <span className="font-data text-[10px] text-white/50 uppercase">Đặc trưng</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <span className="font-mono text-2xl font-extrabold text-emerald-400 block">73.5%</span>
                  <span className="font-data text-[10px] text-white/50 uppercase">Còn dùng</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <span className="font-mono text-2xl font-extrabold text-red-400 block">26.5%</span>
                  <span className="font-data text-[10px] text-white/50 uppercase">Rời mạng</span>
                </div>
              </div>
            </div>

            <div className="animate-fade-up flex justify-between items-center font-data text-xs text-gray-500">
              <span>NGUỒN: KAGGLE PLAYGROUND SERIES</span>
              <span>PHÂN LỚP NHỊ PHÂN</span>
            </div>
          </div>
        </section>

        {/* Section 5: CTA Access Predictor */}
        <section ref={ctaRef} className="scroll-snap-section flex flex-col justify-between p-8 md:p-24 bg-[#0D0D12] text-white">
          <div className="absolute inset-0 z-0">
            <HlsVideo 
              src="/videos/revenuerisk.mp4" 
              className="h-full w-full object-cover opacity-60" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0D0D12]/70 to-[#0D0D12]"></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center my-auto flex flex-col items-center gap-8 animate-fade-up">
            <span className="font-data text-xs uppercase tracking-widest text-[#CC5833] bg-[#CC5833]/15 px-4 py-1.5 rounded-full">Phân Công Nhóm</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-5xl mt-2 tracking-tighter max-w-3xl leading-none">
              Triển khai dự án <span className="text-[#CC5833]">Customer Churn Prediction</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl text-left mt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="font-data text-[10px] uppercase text-[#CC5833] tracking-widest">Stage 01 — EDA</span>
                <p className="font-heading font-bold text-white text-sm mt-2">Phân tích khám phá dữ liệu</p>
                <p className="font-data text-[11px] text-white/50 mt-1">Nguyễn Tiến Phát, Trần Quang Huy, Phạm Tiến Phát, Nguyễn Lan Anh</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="font-data text-[10px] uppercase text-[#CC5833] tracking-widest">Stage 02 — Features</span>
                <p className="font-heading font-bold text-white text-sm mt-2">Feature Engineering & SMOTE</p>
                <p className="font-data text-[11px] text-white/50 mt-1">Hoàng Gia Bảo</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="font-data text-[10px] uppercase text-[#CC5833] tracking-widest">Stage 03 — Model</span>
                <p className="font-heading font-bold text-white text-sm mt-2">Train Model & Đánh giá chỉ số</p>
                <p className="font-data text-[11px] text-white/50 mt-1">Đặng Hoàng Khang</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <span className="font-data text-[10px] uppercase text-[#CC5833] tracking-widest">Frontend & Decor</span>
                <p className="font-heading font-bold text-white text-sm mt-2">Đánh giá tổng hợp & Giao diện</p>
                <p className="font-data text-[11px] text-white/50 mt-1">Lê Văn Đức</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <Link 
                to="/admin" 
                className="w-full px-8 py-4 rounded-full bg-[#CC5833] hover:bg-[#CC5833]/90 text-white font-heading font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-[#CC5833]/30 transition-transform hover:scale-[1.03]"
              >
                Truy cập Dashboard
                <MdArrowForward className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="relative z-10 w-full border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#CC5833]" />
              <span className="font-heading font-extrabold tracking-tight text-lg">Churn<span className="text-[#CC5833]">Pulse</span></span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-data text-[11px] text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>HỆ THỐNG HOẠT ĐỘNG: PIPELINE OK (LightGBM: 93.39%)</span>
            </div>

            <div className="font-data text-[10px] text-white/40">
              © {new Date().getFullYear()} ChurnPulse. Bảo lưu mọi dữ liệu đo lường.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
