/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import DashIcon from "components/icons/DashIcon";

export function SidebarLinks(props) {
  let location = useLocation();
  const { routes } = props;

  const [isDark, setIsDark] = React.useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (
        route.layout === "/admin" ||
        route.layout === "/auth" ||
        route.layout === "/rtl"
      ) {
        const isActive = activeRoute(route.path);
        return (
          <Link key={index} to={route.layout + "/" + route.path}>
            <div className="relative mb-1 flex hover:cursor-pointer group">
              <li className="my-[2px] flex cursor-pointer items-center px-4 py-2.5 rounded-xl w-full transition-all duration-200"
                style={{
                  background: isActive
                    ? (isDark 
                        ? "linear-gradient(135deg, rgba(204,88,51,0.15), rgba(46,64,54,0.1))"
                        : "linear-gradient(135deg, rgba(204,88,51,0.1), rgba(46,64,54,0.05))")
                    : "transparent",
                  border: isActive 
                    ? (isDark ? "1px solid rgba(204,88,51,0.2)" : "1px solid rgba(204,88,51,0.15)")
                    : "1px solid transparent",
                }}
              >
                <span
                  className="transition-all duration-200"
                  style={{ color: isActive ? "#CC5833" : (isDark ? "rgba(255,255,255,0.35)" : "rgba(46,64,54,0.6)") }}
                >
                  {route.icon ? route.icon : <DashIcon />}
                </span>
                <p
                  className="leading-1 ml-3 flex text-sm transition-all duration-200"
                  style={{
                    color: isActive ? (isDark ? "#fff" : "#1A1A1A") : (isDark ? "rgba(255,255,255,0.4)" : "rgba(46,64,54,0.7)"),
                    fontWeight: isActive ? "600" : "400",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {route.name}
                </p>

                {/* Hover glow line */}
                {!isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0 w-0.5 rounded-lg bg-[#CC5833]/60 group-hover:h-5 transition-all duration-300" />
                )}
              </li>
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-lg bg-[#CC5833]" />
              )}
            </div>
          </Link>
        );
      }
    });
  };

  return createLinks(routes);
}

export default SidebarLinks;
