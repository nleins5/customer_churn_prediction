import Card from "components/card";

const Widget = ({ icon, title, subtitle }) => {
  return (
    <Card extra="flex flex-col items-center justify-center rounded-2xl group hover:border-[#CC5833]/20 transition-all duration-300 cursor-default p-4 h-full w-full min-w-0">
      <div className="flex h-11 w-11 items-center justify-center mb-2.5">
        <div
          className="rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110"
          style={{
            background: "rgba(204,88,51,0.08)",
            border: "1px solid rgba(204,88,51,0.15)",
            boxShadow: "0 0 20px rgba(204,88,51,0.08)",
          }}
        >
          <span
            className="flex items-center justify-center"
            style={{ color: "#CC5833" }}
          >
            {icon}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center text-center min-w-0 w-full">
        <p
          className="text-[10px] uppercase tracking-widest mb-1 text-ellipsis overflow-hidden whitespace-nowrap w-full"
          style={{ color: "rgba(255,255,255,0.85)", fontFamily: "'IBM Plex Mono', monospace" }}
          title={title}
        >
          {title}
        </p>
        <h4
          className="text-xl font-bold text-white text-ellipsis overflow-hidden whitespace-nowrap w-full"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {subtitle}
        </h4>
      </div>
    </Card>
  );
};

export default Widget;
