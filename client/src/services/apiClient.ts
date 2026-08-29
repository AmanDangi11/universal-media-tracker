export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const savedUrl = localStorage.getItem("UMT_API_URL");
    if (savedUrl) {
      return savedUrl;
    }
    const isCapacitor = (window as any).Capacitor !== undefined;
    if (isCapacitor) {
      const cap = (window as any).Capacitor;
      if (cap.getPlatform() === "android") {
        return "http://10.0.2.2:5001";
      }
      return "http://localhost:5001";
    }
    if (
      window.location.hostname === "14df525de8d485.lhr.life" ||
      window.location.hostname === "3369ccf4201b95.lhr.life"
    ) {
      return "https://ad35b38df0678b.lhr.life";
    }
    if (window.location.hostname.endsWith(".onrender.com")) {
      return "https://bingelog.onrender.com";
    }
    return `http://${window.location.hostname}:5001`;
  }
  return "http://localhost:5001";
};
