// src/services/dispositivoService.ts

// ========== OBTENER HUELLA DEL DISPOSITIVO ==========
export const obtenerHuellaDispositivo = (): string => {
    // Generar un identificador único basado en información del navegador
    const screenInfo = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    const userAgent = navigator.userAgent;
    
    // Crear un hash simple del dispositivo
    const data = `${screenInfo}|${timezone}|${language}|${userAgent}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `device_${Math.abs(hash).toString(16)}`;
};

// ========== OBTENER NOMBRE DEL DISPOSITIVO ==========
export const obtenerNombreDispositivo = (): string => {
    const userAgent = navigator.userAgent;
    let nombre = 'Dispositivo desconocido';
    
    if (userAgent.includes('Windows')) {
        nombre = 'Windows PC';
    } else if (userAgent.includes('Mac')) {
        nombre = 'Mac';
    } else if (userAgent.includes('iPhone')) {
        nombre = 'iPhone';
    } else if (userAgent.includes('iPad')) {
        nombre = 'iPad';
    } else if (userAgent.includes('Android')) {
        nombre = 'Android';
    } else if (userAgent.includes('Linux')) {
        nombre = 'Linux';
    }
    
    // Agregar información del navegador
    if (userAgent.includes('Chrome')) {
        nombre += ' (Chrome)';
    } else if (userAgent.includes('Firefox')) {
        nombre += ' (Firefox)';
    } else if (userAgent.includes('Safari')) {
        nombre += ' (Safari)';
    } else if (userAgent.includes('Edge')) {
        nombre += ' (Edge)';
    }
    
    return nombre;
};

// ========== OBTENER SISTEMA OPERATIVO ==========
export const obtenerSO = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('iPhone')) return 'iOS';
    if (userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Desconocido';
};

// ========== OBTENER NAVEGADOR ==========
export const obtenerNavegador = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    return 'Desconocido';
};

// ========== OBTENER IP ==========
export const obtenerIP = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch {
        return 'Desconocida';
    }
};